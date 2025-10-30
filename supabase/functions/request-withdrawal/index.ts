import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

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
    const { amount, payout_method } = await req.json();

    // Validate inputs
    if (!amount || amount < 100) {
      throw new Error("Minimum withdrawal amount is $100");
    }

    if (!["stripe_connect", "paypal", "subscription_credit"].includes(payout_method)) {
      throw new Error("Invalid payout method");
    }

    // Get referrer earnings
    const { data: earnings, error: earningsError } = await supabaseClient
      .from("referrer_earnings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (earningsError || !earnings) {
      throw new Error("Earnings record not found");
    }

    if (parseFloat(earnings.available_balance) < amount) {
      throw new Error("Insufficient available balance");
    }

    // Verify payout method is configured
    if (payout_method === "stripe_connect" && !earnings.stripe_connect_account_id) {
      throw new Error("Stripe Connect account not configured");
    }

    if (payout_method === "paypal" && !earnings.paypal_email) {
      throw new Error("PayPal email not configured");
    }

    // Create withdrawal record
    const { data: withdrawal, error: withdrawalError } = await supabaseClient
      .from("referral_withdrawals")
      .insert({
        referrer_id: user.id,
        amount,
        payout_method,
        status: "pending",
      })
      .select()
      .single();

    if (withdrawalError) {
      throw withdrawalError;
    }

    // Process based on payout method
    let transferId = null;
    let newStatus = "processing";

    try {
      if (payout_method === "stripe_connect") {
        // Create Stripe transfer
        const transfer = await stripe.transfers.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: "usd",
          destination: earnings.stripe_connect_account_id,
          metadata: {
            withdrawal_id: withdrawal.id,
            referrer_id: user.id,
          },
        });
        transferId = transfer.id;
        newStatus = "processing";
      } else if (payout_method === "subscription_credit") {
        // Apply credit immediately to user's subscription
        // This would require additional implementation with your subscription system
        newStatus = "completed";
      } else if (payout_method === "paypal") {
        // PayPal requires manual processing or PayPal API integration
        newStatus = "pending";
      }

      // Update withdrawal record
      await supabaseClient
        .from("referral_withdrawals")
        .update({
          status: newStatus,
          stripe_transfer_id: transferId,
        })
        .eq("id", withdrawal.id);

      // Update earnings balance
      await supabaseClient
        .from("referrer_earnings")
        .update({
          available_balance: earnings.available_balance - amount,
          total_withdrawn: earnings.total_withdrawn + amount,
          last_withdrawal_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      // Send notification
      await supabaseClient.from("notifications").insert({
        user_id: user.id,
        type: "withdrawal_processing",
        title: "Withdrawal Processing",
        message: `Your withdrawal of $${amount.toFixed(2)} is being processed. Funds should arrive in 2-3 business days.`,
      });

      return new Response(
        JSON.stringify({
          success: true,
          withdrawal_id: withdrawal.id,
          status: newStatus,
          estimated_arrival: payout_method === "stripe_connect" ? "2-3 business days" : "Varies by method",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } catch (paymentError) {
      // Rollback withdrawal on payment error
      const errorMsg = paymentError instanceof Error ? paymentError.message : "Unknown error";
      await supabaseClient
        .from("referral_withdrawals")
        .update({
          status: "failed",
          failure_reason: errorMsg,
        })
        .eq("id", withdrawal.id);

      throw new Error(`Payment processing failed: ${errorMsg}`);
    }
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});