import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // RevenueCat Web Billing may create Stripe customers without setting `email`.
    // Try multiple lookup strategies to find the Stripe customer for this app user.
    let customerId: string | null = null;

    // 1) Find by email (works when Stripe customer.email is set)
    const customersByEmail = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customersByEmail.data.length > 0) {
      customerId = customersByEmail.data[0].id;
      logStep("Found Stripe customer by email", { customerId });
    }

    // 2) Find by metadata (works when the integration stores app user id in metadata)
    if (!customerId) {
      const metadataKeys = ["app_user_id", "revenuecat_user_id", "rc_app_user_id", "rc_user_id"];
      for (const key of metadataKeys) {
        try {
          const result = await stripe.customers.search({
            query: `metadata['${key}']:'${user.id}'`,
            limit: 1,
          });

          if (result.data.length > 0) {
            customerId = result.data[0].id;
            logStep("Found Stripe customer by metadata", { key, customerId });
            break;
          }
        } catch (err) {
          // Search can be disabled on some Stripe accounts; ignore and continue.
          logStep("Customer metadata search failed", { key });
        }
      }
    }

    // 3) If still not found, try finding a subscription via metadata and derive customer id
    if (!customerId) {
      const metadataKeys = ["app_user_id", "revenuecat_user_id", "rc_app_user_id", "rc_user_id"];
      for (const key of metadataKeys) {
        try {
          const result = await stripe.subscriptions.search({
            query: `metadata['${key}']:'${user.id}'`,
            limit: 1,
          });

          if (result.data.length > 0) {
            const sub = result.data[0];
            customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
            logStep("Found Stripe subscription by metadata", { key, subscriptionId: sub.id, customerId });
            break;
          }
        } catch (err) {
          logStep("Subscription metadata search failed", { key });
        }
      }
    }

    if (!customerId) {
      logStep("No Stripe customer found for this user");
      throw new Error("No Stripe customer found for this user. If you subscribed recently, please wait a few minutes and try again.");
    }

    logStep("Using Stripe customer", { customerId });

    const origin = req.headers.get("origin") || "https://fayvrs.com";
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/settings`,
    });

    logStep("Portal session created", { url: portalSession.url });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("ERROR in customer-portal:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
