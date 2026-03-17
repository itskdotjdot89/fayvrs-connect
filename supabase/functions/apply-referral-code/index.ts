import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw userError;

    const user = userData.user;
    const body = await req.json();
    const { referral_code, attempt_deferred_match } = body;

    // Check if user already has a referral relationship
    const { data: existingRelationship } = await supabaseClient
      .from("referral_relationships")
      .select("id")
      .eq("referred_user_id", user.id)
      .single();

    if (existingRelationship) {
      return new Response(
        JSON.stringify({ success: false, message: "User already has a referral relationship" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    let resolvedCodeData: { id: string; user_id: string; is_active: boolean } | null = null;
    let resolvedReferralCode: string | null = referral_code || null;

    if (referral_code) {
      // Explicit referral code path
      const { data: codeData, error: codeError } = await supabaseClient
        .from("referral_codes")
        .select("id, user_id, is_active")
        .eq("code", referral_code)
        .single();

      if (codeError || !codeData) {
        throw new Error("Invalid referral code");
      }
      resolvedCodeData = codeData;
    } else if (attempt_deferred_match) {
      // Deferred deep link matching via IP + user agent fingerprint
      const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
      const clientUa = req.headers.get("user-agent") || null;

      console.log("[apply-referral-code] Attempting deferred match:", { clientIp, clientUa: clientUa?.substring(0, 50) });

      if (!clientIp) {
        return new Response(
          JSON.stringify({ success: false, message: "No matching referral found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      // Find unconverted clicks matching IP + user agent within last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      let query = supabaseClient
        .from("referral_link_clicks")
        .select("id, referral_code_id")
        .eq("converted_to_signup", false)
        .eq("ip_address", clientIp)
        .gte("clicked_at", sevenDaysAgo)
        .is("converted_user_id", null)
        .order("clicked_at", { ascending: false })
        .limit(1);

      // Also match user agent if available for stronger fingerprint
      if (clientUa) {
        query = query.eq("user_agent", clientUa);
      }

      const { data: matchedClicks, error: clickError } = await query;

      if (clickError || !matchedClicks || matchedClicks.length === 0) {
        // Try again without user agent match (weaker but still useful)
        if (clientUa) {
          const { data: fallbackClicks } = await supabaseClient
            .from("referral_link_clicks")
            .select("id, referral_code_id")
            .eq("converted_to_signup", false)
            .eq("ip_address", clientIp)
            .gte("clicked_at", sevenDaysAgo)
            .is("converted_user_id", null)
            .order("clicked_at", { ascending: false })
            .limit(1);

          if (!fallbackClicks || fallbackClicks.length === 0) {
            console.log("[apply-referral-code] No deferred match found");
            return new Response(
              JSON.stringify({ success: false, message: "No matching referral found" }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
            );
          }

          // Resolve the referral code from the click
          const { data: codeData } = await supabaseClient
            .from("referral_codes")
            .select("id, user_id, is_active, code")
            .eq("id", fallbackClicks[0].referral_code_id)
            .single();

          if (!codeData) {
            return new Response(
              JSON.stringify({ success: false, message: "No matching referral found" }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
            );
          }

          resolvedCodeData = codeData;
          resolvedReferralCode = codeData.code;
          console.log("[apply-referral-code] Deferred match found (IP only):", fallbackClicks[0].id);
        } else {
          return new Response(
            JSON.stringify({ success: false, message: "No matching referral found" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }
      } else {
        // Resolve the referral code from the matched click
        const { data: codeData } = await supabaseClient
          .from("referral_codes")
          .select("id, user_id, is_active, code")
          .eq("id", matchedClicks[0].referral_code_id)
          .single();

        if (!codeData) {
          return new Response(
            JSON.stringify({ success: false, message: "No matching referral found" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }

        resolvedCodeData = codeData;
        resolvedReferralCode = codeData.code;
        console.log("[apply-referral-code] Deferred match found (IP+UA):", matchedClicks[0].id);
      }
    } else {
      throw new Error("Referral code is required");
    }

    if (!resolvedCodeData) {
      throw new Error("Could not resolve referral code");
    }

    if (!resolvedCodeData.is_active) {
      throw new Error("Referral code is not active");
    }

    if (resolvedCodeData.user_id === user.id) {
      throw new Error("Cannot use your own referral code");
    }

    // Create referral relationship
    const { error: relationshipError } = await supabaseClient
      .from("referral_relationships")
      .insert({
        referrer_id: resolvedCodeData.user_id,
        referred_user_id: user.id,
        referral_code_id: resolvedCodeData.id,
        status: "pending",
      });

    if (relationshipError) {
      throw relationshipError;
    }

    // Update click record to mark as converted
    await supabaseClient
      .from("referral_link_clicks")
      .update({
        converted_to_signup: true,
        converted_user_id: user.id,
      })
      .eq("referral_code_id", resolvedCodeData.id)
      .is("converted_user_id", null)
      .order("clicked_at", { ascending: false })
      .limit(1);

    // Increment total referrals count
    const { data: currentEarnings } = await supabaseClient
      .from("referrer_earnings")
      .select("total_referrals_count")
      .eq("user_id", resolvedCodeData.user_id)
      .single();

    await supabaseClient
      .from("referrer_earnings")
      .update({
        total_referrals_count: (currentEarnings?.total_referrals_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", resolvedCodeData.user_id);

    // Send notification to referrer
    await supabaseClient.from("notifications").insert({
      user_id: resolvedCodeData.user_id,
      type: "referral_signup",
      title: "New Referral Signup! 🎉",
      message: "Someone just signed up using your referral link!",
    });

    // Notify founder
    try {
      const { data: referrerProfile } = await supabaseClient
        .from("profiles")
        .select("email, full_name")
        .eq("id", resolvedCodeData.user_id)
        .single();

      const { data: referredProfile } = await supabaseClient
        .from("profiles")
        .select("email, full_name")
        .eq("id", user.id)
        .single();

      const matchType = referral_code ? "explicit" : "deferred";

      await supabaseClient.functions.invoke("send-founder-notification", {
        body: {
          event_type: "Referral Signup",
          urgency: "info",
          title: `New Referral Signup (${matchType})`,
          message: `A new user has signed up using a referral code (${matchType} match).`,
          user_id: user.id,
          user_email: referredProfile?.email,
          related_id: resolvedCodeData.id,
          metadata: {
            "Referrer": referrerProfile?.full_name || "Unknown",
            "Referrer Email": referrerProfile?.email || "Unknown",
            "New User": referredProfile?.full_name || "Unknown",
            "Referral Code": resolvedReferralCode,
            "Match Type": matchType
          }
        }
      });
    } catch (notifError) {
      console.error("Failed to send founder notification:", notifError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: referral_code
          ? "Referral code applied successfully"
          : "Deferred referral match applied successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error applying referral code:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
