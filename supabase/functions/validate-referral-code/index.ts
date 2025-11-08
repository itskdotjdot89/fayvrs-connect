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
    const { code } = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ valid: false, message: "Referral code is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Validate code format (alphanumeric, max 50 chars)
    if (!/^[a-zA-Z0-9_-]+$/.test(code) || code.length > 50) {
      return new Response(
        JSON.stringify({ valid: false, message: "Invalid referral code format" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Validate referral code and get referrer info
    const { data: referralCode, error: codeError } = await supabaseClient
      .from("referral_codes")
      .select("id, code, is_active, total_clicks, user_id")
      .eq("code", code)
      .single();

    if (codeError || !referralCode) {
      return new Response(
        JSON.stringify({ valid: false, message: "Invalid referral code" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Get referrer profile info
    const { data: referrerProfile } = await supabaseClient
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", referralCode.user_id)
      .single();

    if (!referralCode.is_active) {
      return new Response(
        JSON.stringify({ valid: false, message: "This referral code is no longer active" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Track the click (don't fail the request if tracking fails)
    try {
      await supabaseClient
        .from("referral_link_clicks")
        .insert({
          referral_code_id: referralCode.id,
          ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
          user_agent: req.headers.get("user-agent"),
        });
    } catch (clickError) {
      console.error("Error tracking click:", clickError);
      // Continue processing even if click tracking fails
    }

    // Increment click counter
    await supabaseClient
      .from("referral_codes")
      .update({ total_clicks: (referralCode.total_clicks || 0) + 1 })
      .eq("id", referralCode.id);

    return new Response(
      JSON.stringify({
        valid: true,
        referrer_name: referrerProfile?.full_name || "A provider",
        referrer_avatar: referrerProfile?.avatar_url,
        discount_offer: "Get your first month FREE when you sign up as a provider",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error validating referral code:", error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        message: "An error occurred while validating the referral code. Please try again." 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});