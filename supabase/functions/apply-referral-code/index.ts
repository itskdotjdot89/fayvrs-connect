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
    const { referral_code } = await req.json();

    if (!referral_code) {
      throw new Error("Referral code is required");
    }

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

    // Get referral code details
    const { data: codeData, error: codeError } = await supabaseClient
      .from("referral_codes")
      .select("id, user_id, is_active")
      .eq("code", referral_code)
      .single();

    if (codeError || !codeData) {
      throw new Error("Invalid referral code");
    }

    if (!codeData.is_active) {
      throw new Error("Referral code is not active");
    }

    if (codeData.user_id === user.id) {
      throw new Error("Cannot use your own referral code");
    }

    // Create referral relationship
    const { error: relationshipError } = await supabaseClient
      .from("referral_relationships")
      .insert({
        referrer_id: codeData.user_id,
        referred_user_id: user.id,
        referral_code_id: codeData.id,
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
      .eq("referral_code_id", codeData.id)
      .is("converted_user_id", null)
      .order("clicked_at", { ascending: false })
      .limit(1);

    // Increment total referrals count
    const { data: currentEarnings } = await supabaseClient
      .from("referrer_earnings")
      .select("total_referrals_count")
      .eq("user_id", codeData.user_id)
      .single();

    await supabaseClient
      .from("referrer_earnings")
      .update({
        total_referrals_count: (currentEarnings?.total_referrals_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", codeData.user_id);

    // Send notification to referrer
    await supabaseClient.from("notifications").insert({
      user_id: codeData.user_id,
      type: "referral_signup",
      title: "New Referral Signup! 🎉",
      message: "Someone just signed up using your referral link!",
    });

    // Notify founder
    try {
      const { data: referrerProfile } = await supabaseClient
        .from("profiles")
        .select("email, full_name")
        .eq("id", codeData.user_id)
        .single();

      const { data: referredProfile } = await supabaseClient
        .from("profiles")
        .select("email, full_name")
        .eq("id", user.id)
        .single();

      await supabaseClient.functions.invoke("send-founder-notification", {
        body: {
          event_type: "Referral Signup",
          urgency: "info",
          title: "New Referral Signup",
          message: `A new user has signed up using a referral code.`,
          user_id: user.id,
          user_email: referredProfile?.email,
          related_id: codeData.id,
          metadata: {
            "Referrer": referrerProfile?.full_name || "Unknown",
            "Referrer Email": referrerProfile?.email || "Unknown",
            "New User": referredProfile?.full_name || "Unknown",
            "Referral Code": referral_code
          }
        }
      });
    } catch (notifError) {
      console.error("Failed to send founder notification:", notifError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Referral code applied successfully",
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