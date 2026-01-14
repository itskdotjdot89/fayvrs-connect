import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REVENUECAT-WEBHOOK] ${step}${detailsStr}`);
};

// Verify RevenueCat webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  
  try {
    const hmac = createHmac("sha256", secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest("hex");
    return signature === expectedSignature;
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const webhookSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
  
  try {
    const body = await req.text();
    const signature = req.headers.get("X-RevenueCat-Signature") || req.headers.get("x-revenuecat-signature");
    
    // Verify signature if secret is configured
    if (webhookSecret && signature) {
      if (!verifySignature(body, signature, webhookSecret)) {
        logStep("Invalid webhook signature");
        return new Response("Invalid signature", { status: 401 });
      }
      logStep("Webhook signature verified");
    } else if (webhookSecret) {
      logStep("Warning: No signature provided but secret is configured");
    }

    const event = JSON.parse(body);
    logStep("Received webhook event", { type: event.event?.type });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const eventData = event.event;
    if (!eventData) {
      return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    const eventType = eventData.type;
    const appUserId = eventData.app_user_id;
    const originalAppUserId = eventData.original_app_user_id || appUserId;
    const productId = eventData.product_id;
    const price = eventData.price || 0;
    const currency = eventData.currency || "USD";
    const transactionId = eventData.transaction_id || eventData.original_transaction_id;
    const originalTransactionId = eventData.original_transaction_id;
    const expirationDate = eventData.expiration_at_ms ? new Date(eventData.expiration_at_ms).toISOString() : null;
    const periodStart = eventData.period_type === "normal" ? eventData.purchase_date : null;
    const store = eventData.store; // APP_STORE, PLAY_STORE, STRIPE

    logStep("Processing event", { 
      eventType, 
      appUserId: originalAppUserId, 
      productId,
      store,
      price
    });

    switch (eventType) {
      case "INITIAL_PURCHASE":
      case "RENEWAL": {
        // Update provider_subscriptions table
        const plan = productId?.includes("yearly") || productId?.includes("1y") ? "yearly" : "monthly";
        
        await supabaseClient
          .from("provider_subscriptions")
          .upsert({
            provider_id: originalAppUserId,
            plan,
            status: "active",
            expires_at: expirationDate,
            started_at: new Date().toISOString(),
          }, {
            onConflict: "provider_id"
          });

        logStep("Updated provider subscription", { userId: originalAppUserId, plan });

        // Check for referral relationship
        const { data: relationship } = await supabaseClient
          .from("referral_relationships")
          .select("*")
          .eq("referred_user_id", originalAppUserId)
          .in("status", ["pending", "active"])
          .single();

        if (relationship) {
          if (eventType === "INITIAL_PURCHASE" && relationship.status === "pending") {
            // Activate referral relationship
            const commissionEndDate = new Date();
            commissionEndDate.setMonth(commissionEndDate.getMonth() + 12);

            await supabaseClient
              .from("referral_relationships")
              .update({
                status: "active",
                first_payment_date: new Date().toISOString(),
                subscription_start_date: new Date().toISOString(),
                commission_end_date: commissionEndDate.toISOString(),
                subscription_id: originalTransactionId,
                customer_id: appUserId,
                updated_at: new Date().toISOString(),
              })
              .eq("id", relationship.id);

            // Increment active referrals count
            const { data: earnings } = await supabaseClient
              .from("referrer_earnings")
              .select("active_referrals_count")
              .eq("user_id", relationship.referrer_id)
              .single();

            await supabaseClient
              .from("referrer_earnings")
              .update({
                active_referrals_count: (earnings?.active_referrals_count || 0) + 1,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", relationship.referrer_id);

            // Send notification
            await supabaseClient.from("notifications").insert({
              user_id: relationship.referrer_id,
              type: "referral_activated",
              title: "Referral Activated! 💰",
              message: "Your referral just activated their subscription. You'll earn 20% commission for 12 months!",
            });

            logStep("Activated referral relationship", { referrerId: relationship.referrer_id });

            // Notify founder
            try {
              const { data: referrerProfile } = await supabaseClient
                .from("profiles")
                .select("email, full_name")
                .eq("id", relationship.referrer_id)
                .single();

              await supabaseClient.functions.invoke("send-founder-notification", {
                body: {
                  event_type: "Referral Activated",
                  urgency: "info",
                  title: "Referral Subscription Activated",
                  message: `A referral subscription has been activated via ${store}. Referrer will earn 20% commission for 12 months.`,
                  user_id: relationship.referrer_id,
                  user_email: referrerProfile?.email,
                  related_id: relationship.id,
                  metadata: {
                    "Referrer": referrerProfile?.full_name || "Unknown",
                    "Store": store,
                    "Product": productId,
                    "Commission Period": "12 months"
                  }
                }
              });
            } catch (notifError) {
              console.error("Failed to send founder notification:", notifError);
            }
          }

          // Calculate commission for both INITIAL_PURCHASE (after trial) and RENEWAL
          if (relationship.status === "active" && price > 0) {
            const now = new Date();
            const commissionEndDate = new Date(relationship.commission_end_date);
            
            if (now <= commissionEndDate) {
              const commissionAmount = price * 0.20;
              const paymentNumber = (relationship.total_payments_count || 0) + 1;

              const becomesAvailableAt = new Date();
              becomesAvailableAt.setDate(becomesAvailableAt.getDate() + 30);

              const { error: commissionError } = await supabaseClient
                .from("referral_commissions")
                .insert({
                  referral_relationship_id: relationship.id,
                  referrer_id: relationship.referrer_id,
                  referred_user_id: relationship.referred_user_id,
                  revenuecat_transaction_id: transactionId,
                  subscription_amount: price,
                  commission_amount: commissionAmount,
                  payment_number: paymentNumber,
                  status: "pending",
                  becomes_available_at: becomesAvailableAt.toISOString(),
                });

              if (!commissionError) {
                // Update relationship totals
                await supabaseClient
                  .from("referral_relationships")
                  .update({
                    total_payments_count: paymentNumber,
                    total_commission_earned: (relationship.total_commission_earned || 0) + commissionAmount,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", relationship.id);

                // Update referrer earnings
                const { data: earnings } = await supabaseClient
                  .from("referrer_earnings")
                  .select("pending_balance, lifetime_earnings")
                  .eq("user_id", relationship.referrer_id)
                  .single();

                await supabaseClient
                  .from("referrer_earnings")
                  .update({
                    pending_balance: (earnings?.pending_balance || 0) + commissionAmount,
                    lifetime_earnings: (earnings?.lifetime_earnings || 0) + commissionAmount,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("user_id", relationship.referrer_id);

                // Send notification
                await supabaseClient.from("notifications").insert({
                  user_id: relationship.referrer_id,
                  type: "commission_earned",
                  title: "Commission Earned! 💵",
                  message: `You earned $${commissionAmount.toFixed(2)} from your referral (Payment ${paymentNumber}/12). Available for withdrawal in 30 days.`,
                });

                logStep("Created commission", { 
                  referrerId: relationship.referrer_id, 
                  amount: commissionAmount,
                  paymentNumber 
                });
              }
            }
          }
        }
        break;
      }

      case "CANCELLATION":
      case "EXPIRATION": {
        // Update provider subscription status
        await supabaseClient
          .from("provider_subscriptions")
          .update({
            status: eventType === "CANCELLATION" ? "cancelled" : "expired",
          })
          .eq("provider_id", originalAppUserId);

        logStep("Updated subscription status", { userId: originalAppUserId, status: eventType.toLowerCase() });

        // Check for referral relationship
        const { data: relationship } = await supabaseClient
          .from("referral_relationships")
          .select("*")
          .eq("referred_user_id", originalAppUserId)
          .eq("status", "active")
          .single();

        if (relationship) {
          await supabaseClient
            .from("referral_relationships")
            .update({
              status: "cancelled",
              updated_at: new Date().toISOString(),
            })
            .eq("id", relationship.id);

          // Decrement active referrals
          const { data: earnings } = await supabaseClient
            .from("referrer_earnings")
            .select("active_referrals_count")
            .eq("user_id", relationship.referrer_id)
            .single();

          await supabaseClient
            .from("referrer_earnings")
            .update({
              active_referrals_count: Math.max((earnings?.active_referrals_count || 0) - 1, 0),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", relationship.referrer_id);

          // Cancel pending commissions
          await supabaseClient
            .from("referral_commissions")
            .update({ status: "cancelled" })
            .eq("referral_relationship_id", relationship.id)
            .eq("status", "pending");

          // Send notification
          await supabaseClient.from("notifications").insert({
            user_id: relationship.referrer_id,
            type: "referral_cancelled",
            title: "Referral Subscription Ended",
            message: "One of your referrals cancelled their subscription. Future commissions from this referral have been cancelled.",
          });

          logStep("Cancelled referral relationship", { referrerId: relationship.referrer_id });
        }
        break;
      }

      case "BILLING_ISSUE":
      case "PRODUCT_CHANGE": {
        // Log for monitoring but don't take immediate action
        logStep("Received billing event", { eventType, userId: originalAppUserId });
        break;
      }

      case "REFUND": {
        // Handle refund - reverse commission if applicable
        const { data: commission } = await supabaseClient
          .from("referral_commissions")
          .select("*")
          .eq("revenuecat_transaction_id", transactionId)
          .single();

        if (commission) {
          if (commission.status === "pending") {
            const { data: earnings } = await supabaseClient
              .from("referrer_earnings")
              .select("pending_balance, lifetime_earnings")
              .eq("user_id", commission.referrer_id)
              .single();

            await supabaseClient
              .from("referral_commissions")
              .delete()
              .eq("id", commission.id);

            await supabaseClient
              .from("referrer_earnings")
              .update({
                pending_balance: Math.max((earnings?.pending_balance || 0) - commission.commission_amount, 0),
                lifetime_earnings: Math.max((earnings?.lifetime_earnings || 0) - commission.commission_amount, 0),
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", commission.referrer_id);

            logStep("Reversed pending commission due to refund", { commissionId: commission.id });
          } else if (commission.status === "available") {
            const { data: earnings } = await supabaseClient
              .from("referrer_earnings")
              .select("available_balance, lifetime_earnings")
              .eq("user_id", commission.referrer_id)
              .single();

            await supabaseClient
              .from("referral_commissions")
              .update({ status: "cancelled" })
              .eq("id", commission.id);

            await supabaseClient
              .from("referrer_earnings")
              .update({
                available_balance: Math.max((earnings?.available_balance || 0) - commission.commission_amount, 0),
                lifetime_earnings: Math.max((earnings?.lifetime_earnings || 0) - commission.commission_amount, 0),
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", commission.referrer_id);

            logStep("Reversed available commission due to refund", { commissionId: commission.id });
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { eventType });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
