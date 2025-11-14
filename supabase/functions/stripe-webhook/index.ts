import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Processing Stripe webhook:", event.type);

    switch (event.type) {
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        
        // Check if this is a referral subscription
        if (subscription.metadata?.is_referral === "true") {
          const { data: relationship } = await supabaseClient
            .from("referral_relationships")
            .select("*")
            .eq("stripe_subscription_id", subscription.id)
            .single();

          // If trial ending and first payment succeeded
          if (relationship && relationship.status === "pending" && subscription.status === "active") {
            const commissionEndDate = new Date();
            commissionEndDate.setMonth(commissionEndDate.getMonth() + 12);

            await supabaseClient
              .from("referral_relationships")
              .update({
                status: "active",
                first_payment_date: new Date().toISOString(),
                subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
                commission_end_date: commissionEndDate.toISOString(),
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

            // Notify founder
            try {
              const { data: referrerProfile } = await supabaseClient
                .from("profiles")
                .select("email, full_name")
                .eq("id", relationship.referrer_id)
                .single();

              const { data: referredProfile } = await supabaseClient
                .from("profiles")
                .select("email")
                .eq("id", relationship.referred_user_id)
                .single();

              await supabaseClient.functions.invoke("send-founder-notification", {
                body: {
                  event_type: "Referral Activated",
                  urgency: "info",
                  title: "Referral Subscription Activated",
                  message: `A referral subscription has been activated. Referrer will earn 20% commission for 12 months.`,
                  user_id: relationship.referrer_id,
                  user_email: referrerProfile?.email,
                  related_id: relationship.id,
                  metadata: {
                    "Referrer": referrerProfile?.full_name || "Unknown",
                    "Referred User": referredProfile?.email || "Unknown",
                    "Subscription ID": subscription.id,
                    "Commission Period": "12 months"
                  }
                }
              });
            } catch (notifError) {
              console.error("Failed to send founder notification:", notifError);
            }
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        
        if (!invoice.subscription) break;

        const { data: relationship } = await supabaseClient
          .from("referral_relationships")
          .select("*")
          .eq("stripe_subscription_id", invoice.subscription)
          .eq("status", "active")
          .single();

        if (!relationship) break;

        // Check if within 12-month commission period
        const now = new Date();
        const commissionEndDate = new Date(relationship.commission_end_date);
        
        if (now > commissionEndDate) {
          // Commission period ended, mark as completed
          await supabaseClient
            .from("referral_relationships")
            .update({ status: "completed" })
            .eq("id", relationship.id);
          break;
        }

        // Calculate commission (20% of invoice amount)
        const invoiceAmount = invoice.amount_paid / 100; // Convert from cents
        const commissionAmount = invoiceAmount * 0.20;
        const paymentNumber = relationship.total_payments_count + 1;

        // Create commission record
        const becomesAvailableAt = new Date();
        becomesAvailableAt.setDate(becomesAvailableAt.getDate() + 30);

        const { error: commissionError } = await supabaseClient
          .from("referral_commissions")
          .insert({
            referral_relationship_id: relationship.id,
            referrer_id: relationship.referrer_id,
            referred_user_id: relationship.referred_user_id,
            stripe_payment_intent_id: invoice.payment_intent,
            stripe_invoice_id: invoice.id,
            subscription_amount: invoiceAmount,
            commission_amount: commissionAmount,
            payment_number: paymentNumber,
            subscription_period_start: new Date(invoice.period_start * 1000).toISOString(),
            subscription_period_end: new Date(invoice.period_end * 1000).toISOString(),
            status: "pending",
            becomes_available_at: becomesAvailableAt.toISOString(),
          });

        if (commissionError) {
          console.error("Error creating commission:", commissionError);
          break;
        }

        // Update relationship totals
        await supabaseClient
          .from("referral_relationships")
          .update({
            total_payments_count: paymentNumber,
            total_commission_earned: relationship.total_commission_earned + commissionAmount,
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

        // Notify founder
        try {
          const { data: referrerProfile } = await supabaseClient
            .from("profiles")
            .select("email, full_name")
            .eq("id", relationship.referrer_id)
            .single();

          await supabaseClient.functions.invoke("send-founder-notification", {
            body: {
              event_type: "Commission Earned",
              urgency: "urgent",
              title: "Commission Earned",
              message: `A referrer has earned $${commissionAmount.toFixed(2)} commission (Payment ${paymentNumber} of 12).`,
              user_id: relationship.referrer_id,
              user_email: referrerProfile?.email,
              related_id: relationship.id,
              metadata: {
                "Referrer": referrerProfile?.full_name || "Unknown",
                "Commission Amount": `$${commissionAmount.toFixed(2)}`,
                "Subscription Amount": `$${invoiceAmount.toFixed(2)}`,
                "Payment Number": `${paymentNumber} of 12`,
                "Available In": "30 days"
              }
            }
          });
        } catch (notifError) {
          console.error("Failed to send founder notification:", notifError);
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        
        const { data: relationship } = await supabaseClient
          .from("referral_relationships")
          .select("*")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (!relationship) break;

        await supabaseClient
          .from("referral_relationships")
          .update({
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", relationship.id);

        // Decrement active referrals if it was active
        if (relationship.status === "active") {
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
        }

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
          title: "Referral Subscription Cancelled",
          message: "One of your referrals cancelled their subscription. Future commissions from this referral have been cancelled.",
        });

        // Notify founder
        try {
          const { data: referrerProfile } = await supabaseClient
            .from("profiles")
            .select("email, full_name")
            .eq("id", relationship.referrer_id)
            .single();

          await supabaseClient.functions.invoke("send-founder-notification", {
            body: {
              event_type: "Referral Subscription Cancelled",
              urgency: "info",
              title: "Referral Subscription Cancelled",
              message: `A referral subscription has been cancelled.`,
              user_id: relationship.referrer_id,
              user_email: referrerProfile?.email,
              related_id: relationship.id,
              metadata: {
                "Referrer": referrerProfile?.full_name || "Unknown",
                "Subscription ID": subscription.id,
                "Previous Status": relationship.status
              }
            }
          });
        } catch (notifError) {
          console.error("Failed to send founder notification:", notifError);
        }

        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        
        if (!charge.payment_intent) break;

        const { data: commission } = await supabaseClient
          .from("referral_commissions")
          .select("*")
          .eq("stripe_payment_intent_id", charge.payment_intent)
          .single();

        if (!commission) break;

        if (commission.status === "pending") {
          // Delete commission and adjust pending balance
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
        } else if (commission.status === "available") {
          // Deduct from available balance
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
        }

        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 400,
    });
  }
});