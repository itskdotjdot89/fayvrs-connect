import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";


const SUBSCRIPTION_PLANS = {
  monthly: {
    name: "Monthly",
    price: "$30",
    interval: "month",
    priceId: "price_1SEgGzLisf4T9XH8qRL8S2lw",
    savings: null
  },
  yearly: {
    name: "Yearly",
    price: "$240",
    interval: "year",
    priceId: "price_1SEgHrLisf4T9XH8xpq5cfGO",
    savings: "Save $120"
  }
};

export default function ProviderCheckout() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const { session, subscriptionStatus } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect ALL users to RevenueCat paywall (unified payment flow)
  useEffect(() => {
    navigate('/provider-paywall', { replace: true });
  }, [navigate]);

  // Show loading while redirect happens
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const handleCheckout = async () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to continue",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Starting checkout with plan:', selectedPlan);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: SUBSCRIPTION_PLANS[selectedPlan].priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      console.log('Checkout response:', { data, error });

      if (error) {
        console.error('Checkout error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('Opening checkout URL:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start checkout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8 bg-gradient-to-b from-accent/30 to-background">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Choose Your Provider Plan</h1>
          <p className="text-muted-foreground">
            Get unlimited access to leads and in-app messaging
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
            <Card 
              key={key}
              className={`cursor-pointer transition-all ${
                selectedPlan === key 
                  ? 'border-primary border-2 shadow-lg' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedPlan(key as 'monthly' | 'yearly')}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.savings && (
                    <Badge variant="default">{plan.savings}</Badge>
                  )}
                </div>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">Unlimited leads</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">In-app messaging</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">Identity verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">Priority support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {subscriptionStatus?.subscribed && (
          <Card className="mb-6 bg-primary/10 border-primary">
            <CardContent className="pt-6">
              <p className="text-center text-sm">
                You already have an active {subscriptionStatus.plan} subscription.
                <br />
                Expires: {new Date(subscriptionStatus.subscription_end!).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        )}

        <Button 
          onClick={handleCheckout} 
          size="lg" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Continue to Checkout"}
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Secure payment processing by Stripe. Cancel anytime.
        </p>
      </div>
    </div>
  );
}