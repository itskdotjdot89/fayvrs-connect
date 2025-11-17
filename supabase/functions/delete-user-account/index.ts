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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Delete user data in order (respecting foreign keys)
    
    // 1. Delete messages where user is sender or recipient
    await supabaseAdmin.from("messages").delete().eq("sender_id", user.id);
    await supabaseAdmin.from("messages").delete().eq("recipient_id", user.id);

    // 2. Delete notifications
    await supabaseAdmin.from("notifications").delete().eq("user_id", user.id);

    // 3. Delete proposals (as provider)
    await supabaseAdmin.from("proposals").delete().eq("provider_id", user.id);

    // 4. Delete requests (and their proposals will cascade)
    await supabaseAdmin.from("requests").delete().eq("user_id", user.id);

    // 5. Delete portfolio items
    await supabaseAdmin.from("portfolio_items").delete().eq("provider_id", user.id);

    // 6. Delete provider specialties
    await supabaseAdmin.from("provider_specialties").delete().eq("provider_id", user.id);

    // 7. Delete provider subscription
    await supabaseAdmin.from("provider_subscriptions").delete().eq("provider_id", user.id);

    // 8. Delete identity verification
    await supabaseAdmin.from("identity_verifications").delete().eq("user_id", user.id);

    // 9. Delete notification preferences
    await supabaseAdmin.from("notification_preferences").delete().eq("user_id", user.id);

    // 10. Delete referral-related data
    await supabaseAdmin.from("referral_commissions").delete().eq("referrer_id", user.id);
    await supabaseAdmin.from("referral_commissions").delete().eq("referred_user_id", user.id);
    await supabaseAdmin.from("referral_relationships").delete().eq("referrer_id", user.id);
    await supabaseAdmin.from("referral_relationships").delete().eq("referred_user_id", user.id);
    await supabaseAdmin.from("referral_withdrawals").delete().eq("referrer_id", user.id);
    await supabaseAdmin.from("referrer_earnings").delete().eq("user_id", user.id);

    const { data: referralCode } = await supabaseAdmin
      .from("referral_codes")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (referralCode) {
      await supabaseAdmin.from("referral_link_clicks").delete().eq("referral_code_id", referralCode.id);
      await supabaseAdmin.from("referral_codes").delete().eq("user_id", user.id);
    }

    // 11. Delete call sessions and signals
    await supabaseAdmin.from("call_sessions").delete().eq("caller_id", user.id);
    await supabaseAdmin.from("call_sessions").delete().eq("callee_id", user.id);

    // 12. Delete user roles
    await supabaseAdmin.from("user_roles").delete().eq("user_id", user.id);

    // 13. Delete profile
    await supabaseAdmin.from("profiles").delete().eq("id", user.id);

    // 14. Finally delete auth user
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (deleteAuthError) {
      throw deleteAuthError;
    }

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error deleting account:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to delete account" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
