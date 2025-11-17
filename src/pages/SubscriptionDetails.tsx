import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, CreditCard, Shield, ExternalLink } from "lucide-react";

export default function SubscriptionDetails() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-foreground">Subscription Details</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-primary/10 rounded-card p-5">
          <h2 className="font-semibold text-foreground mb-2">Provider Subscription</h2>
          <p className="text-sm text-muted-foreground">
            Access professional tools to grow your service business and connect with local customers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Plan</CardTitle>
              <CardDescription>Flexible month-to-month billing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-4">
                $30<span className="text-lg text-muted-foreground font-normal">/month</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Cancel anytime</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Billed monthly</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Full access to all features</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <div className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full w-fit mb-2">
                BEST VALUE
              </div>
              <CardTitle>Annual Plan</CardTitle>
              <CardDescription>Save $120 per year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">
                $240<span className="text-lg text-muted-foreground font-normal">/year</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Only $20/month when billed annually</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Save $120 annually</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Full access to all features</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What's Included</CardTitle>
            <CardDescription>All the tools you need to succeed as a provider</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Unlimited proposal submissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Real-time request notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Direct messaging with requesters</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Portfolio showcase</span>
                </li>
              </ul>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Location-based matching</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Rating and review system</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Service area customization</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Business analytics</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-2">Secure Payment Processing</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>All payments are processed securely by Stripe</li>
                <li>Fayvrs does not store your credit card information</li>
                <li>Your payment details are encrypted and secure</li>
                <li>PCI DSS compliant payment processing</li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-foreground mb-2">Billing Cycle</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Monthly plans: Billed on the same day each month</li>
                <li>Annual plans: Billed once per year on subscription date</li>
                <li>Automatic renewal unless cancelled</li>
                <li>Receive email receipt for each payment</li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-foreground mb-2">Managing Your Subscription</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Cancel anytime through your Stripe customer portal</li>
                <li>Update payment method without losing service</li>
                <li>Switch between monthly and annual plans</li>
                <li>View payment history and download invoices</li>
              </ul>
            </div>

            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => window.open('https://billing.stripe.com/p/login/', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Manage Subscription in Stripe
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="font-medium text-foreground mb-2">This is NOT an in-app purchase</p>
              <p>
                This subscription is for real-world business services and tools, not digital content. 
                Payments are processed by Stripe, not Apple or Google, in compliance with their terms.
              </p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-2">What This Subscription Is:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Access to business tools and lead generation platform</li>
                <li>Professional services marketplace membership</li>
                <li>Real-world service provider tools and features</li>
                <li>Business-to-business service subscription</li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-foreground mb-2">Cancellation Policy:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Cancel anytime - no cancellation fees</li>
                <li>Access continues until end of paid period</li>
                <li>No partial refunds for monthly subscriptions</li>
                <li>Annual plans: 30-day refund window (see Refund Policy)</li>
              </ul>
            </div>

            <div className="flex gap-2 flex-wrap mt-4">
              <Link to="/refund-policy">
                <Button variant="link" className="p-0 h-auto">
                  View Refund Policy
                </Button>
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/terms-of-service">
                <Button variant="link" className="p-0 h-auto">
                  Terms of Service
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Questions about billing, subscriptions, or features?
            </p>
            <p>
              Email us at <a href="mailto:contact@fayvrs.com" className="text-primary underline">contact@fayvrs.com</a>
            </p>
            <p className="text-xs mt-4">
              Note: This subscription is separate from any service payments you make or receive through Fayvrs. 
              Service transactions are between requesters and providers.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
