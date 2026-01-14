import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, ArrowLeft, Sparkles } from "lucide-react";

export default function Billing() {
  const plans = [
    {
      name: "Monthly",
      price: "$30",
      period: "/month",
      description: "Perfect for getting started",
      features: ["Unlimited requests", "Verified badge", "Portfolio showcase", "Direct messaging"],
    },
    {
      name: "Annual",
      price: "$240",
      period: "/year",
      description: "Save 33% with yearly billing",
      badge: "Best Value",
      features: ["Everything in Monthly", "Priority support", "Featured profile", "Early access to features"],
      highlight: true,
    },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Billing & Subscription</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Current Plan Status */}
        <div className="bg-white rounded-card p-5 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Current Plan</h3>
            <Badge variant="verified">Active</Badge>
          </div>
          <div className="flex items-center justify-between pt-2 pb-1">
            <div>
              <p className="text-2xl font-bold text-foreground">Monthly</p>
              <p className="text-sm text-muted-foreground">Renews on Dec 31, 2025</p>
            </div>
            <p className="text-xl font-bold text-primary">$30</p>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground px-1">Available Plans</h3>
          
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-card p-6 shadow-soft space-y-4 ${
                plan.highlight ? "border-2 border-primary relative overflow-hidden" : ""
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-0 bg-gradient-to-br from-primary to-primary-hover text-white px-4 py-1 text-xs font-semibold rounded-bl-xl flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {plan.badge}
                </div>
              )}

              <div className="pt-2">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <h3 className="font-semibold text-foreground text-lg">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="space-y-2 pt-2">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-verified/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-verified" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                className={`w-full rounded-xl h-11 ${
                  plan.highlight ? "" : "bg-secondary hover:bg-secondary/90"
                }`}
              >
                {plan.highlight ? "Upgrade to Annual" : "Continue with Monthly"}
              </Button>
            </div>
          ))}
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-card p-5 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Payment Method</h3>
            <Button size="sm" variant="ghost" className="rounded-xl text-primary">
              Update
            </Button>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-surface rounded-xl">
            <div className="w-12 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">•••• 4242</p>
              <p className="text-xs text-muted-foreground">Expires 12/25</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-surface rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Cancel anytime. No hidden fees. Secure payments.
          </p>
        </div>
      </div>
    </div>
  );
}