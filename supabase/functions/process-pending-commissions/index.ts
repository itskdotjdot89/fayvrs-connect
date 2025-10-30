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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Processing pending commissions...");

    // Find commissions that are ready to become available (30 days have passed)
    const { data: pendingCommissions, error: fetchError } = await supabaseClient
      .from("referral_commissions")
      .select("*")
      .eq("status", "pending")
      .lte("becomes_available_at", new Date().toISOString());

    if (fetchError) {
      throw fetchError;
    }

    if (!pendingCommissions || pendingCommissions.length === 0) {
      console.log("No commissions ready to process");
      return new Response(
        JSON.stringify({ processed: 0, message: "No commissions ready to process" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    console.log(`Processing ${pendingCommissions.length} commissions`);

    // Group commissions by referrer for batch updates
    const referrerTotals = new Map<string, number>();
    
    for (const commission of pendingCommissions) {
      const current = referrerTotals.get(commission.referrer_id) || 0;
      referrerTotals.set(commission.referrer_id, current + parseFloat(commission.commission_amount));
    }

    // Update commission statuses
    const commissionIds = pendingCommissions.map(c => c.id);
    const { error: updateError } = await supabaseClient
      .from("referral_commissions")
      .update({ status: "available" })
      .in("id", commissionIds);

    if (updateError) {
      throw updateError;
    }

    // Update referrer earnings (move from pending to available)
    for (const [referrerId, amount] of referrerTotals.entries()) {
      const { data: currentEarnings } = await supabaseClient
        .from("referrer_earnings")
        .select("pending_balance, available_balance")
        .eq("user_id", referrerId)
        .single();

      const { error: earningsError } = await supabaseClient
        .from("referrer_earnings")
        .update({
          pending_balance: Math.max((currentEarnings?.pending_balance || 0) - amount, 0),
          available_balance: (currentEarnings?.available_balance || 0) + amount,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", referrerId);

      if (earningsError) {
        console.error(`Error updating earnings for referrer ${referrerId}:`, earningsError);
        continue;
      }

      // Send notification to referrer
      await supabaseClient.from("notifications").insert({
        user_id: referrerId,
        type: "commission_available",
        title: "Commission Ready! ✅",
        message: `$${amount.toFixed(2)} is now available for withdrawal. Minimum withdrawal is $100.`,
      });
    }

    console.log(`Successfully processed ${pendingCommissions.length} commissions`);

    return new Response(
      JSON.stringify({
        processed: pendingCommissions.length,
        referrers_updated: referrerTotals.size,
        message: "Commissions processed successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error processing pending commissions:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});