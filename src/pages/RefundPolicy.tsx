import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-foreground">Refund Policy</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div>
          <p className="text-muted-foreground mb-4">Last Updated: November 14, 2025</p>
          <p className="text-foreground leading-relaxed">
            This Refund Policy explains how refunds work for Fayvrs services and subscriptions. 
            Please read this policy carefully before making payments.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">1. Provider Subscription Refunds</h2>
          <div className="space-y-3 text-muted-foreground">
            <p><strong>Monthly Subscriptions ($30/month):</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Subscriptions are billed monthly in advance</li>
              <li>You can cancel at any time through your Stripe customer portal</li>
              <li>No refunds for partial months - you'll retain access until the end of your billing period</li>
              <li>Cancellations take effect at the end of the current billing cycle</li>
            </ul>

            <p className="mt-4"><strong>Annual Subscriptions ($240/year):</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Billed annually in advance</li>
              <li>Refunds available within 30 days of purchase if you haven't actively used the service</li>
              <li>After 30 days, no refunds are provided</li>
              <li>You can cancel to prevent auto-renewal at the end of your annual term</li>
            </ul>

            <p className="mt-4"><strong>Refund Eligibility:</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Account was not used to submit proposals or receive requests</li>
              <li>No services were performed through the platform</li>
              <li>Requested within 30 days of initial purchase (annual plans only)</li>
              <li>No previous refunds have been issued to your account</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">2. Service Transaction Refunds</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              Fayvrs does not directly process payments for individual service transactions. Payment arrangements 
              are made between requesters and providers.
            </p>

            <p className="mt-3"><strong>Dispute Resolution:</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>First, communicate with the other party to resolve issues</li>
              <li>Document all communications and agreements</li>
              <li>If unresolved, contact Fayvrs support for mediation</li>
              <li>Provide evidence including messages, photos, and payment records</li>
            </ul>

            <p className="mt-3"><strong>When Providers Should Issue Refunds:</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Service was not performed as agreed</li>
              <li>Quality was significantly below expectations and agreement</li>
              <li>Provider cancelled without valid reason after payment</li>
              <li>Service caused damage not disclosed beforehand</li>
            </ul>

            <p className="mt-3"><strong>When Refunds May Not Be Issued:</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Requester changed requirements after service completion</li>
              <li>Subjective quality disputes where service met agreed standards</li>
              <li>Requester was unavailable or unresponsive</li>
              <li>Service was completed as agreed but requester is unsatisfied with results</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">3. How to Request a Subscription Refund</h2>
          <div className="space-y-2 text-muted-foreground">
            <p>To request a refund for your provider subscription:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Email <a href="mailto:contact@fayvrs.com" className="text-primary underline">contact@fayvrs.com</a> with "Refund Request" in the subject line</li>
              <li>Include your account email and subscription details</li>
              <li>Explain your reason for requesting a refund</li>
              <li>We'll review and respond within 2-3 business days</li>
              <li>Approved refunds are processed within 5-10 business days</li>
            </ol>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">4. Payment Processing</h2>
          <div className="space-y-2 text-muted-foreground">
            <p>All subscription payments are processed by Stripe, our secure payment processor:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Fayvrs does not store your credit card information</li>
              <li>Refunds are issued to the original payment method</li>
              <li>Processing time depends on your bank (typically 5-10 business days)</li>
              <li>You can manage your subscription through your Stripe customer portal</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">5. Cancellation Policy</h2>
          <div className="space-y-2 text-muted-foreground">
            <p><strong>How to Cancel:</strong></p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Log into your Fayvrs account</li>
              <li>Go to Settings → Subscription Details</li>
              <li>Click "Manage Subscription" to access your Stripe portal</li>
              <li>Select "Cancel Subscription"</li>
              <li>Confirm cancellation</li>
            </ol>

            <p className="mt-3"><strong>What Happens After Cancellation:</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You retain access until the end of your paid period</li>
              <li>No further charges will be made</li>
              <li>Your profile remains visible but you can't submit new proposals</li>
              <li>You can reactivate anytime by subscribing again</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">6. Exceptions & Special Cases</h2>
          <div className="space-y-2 text-muted-foreground">
            <p>Refunds may be issued outside normal policy in cases of:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Technical errors or system failures that prevented service use</li>
              <li>Duplicate charges or billing errors</li>
              <li>Account security breaches resulting in unauthorized charges</li>
              <li>Platform policy violations by Fayvrs</li>
            </ul>
            <p className="mt-3">Each case is reviewed individually. Contact support with documentation of the issue.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">7. Non-Refundable Scenarios</h2>
          <div className="space-y-2 text-muted-foreground">
            <p>Refunds will not be issued in the following situations:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Account suspension or termination due to policy violations</li>
              <li>Change of mind after the 30-day refund window (annual plans)</li>
              <li>Monthly subscriptions after any portion was used</li>
              <li>Services that were successfully completed as agreed</li>
              <li>Failure to use subscription features (no "unused time" refunds)</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">8. Dispute Resolution</h2>
          <div className="space-y-2 text-muted-foreground">
            <p>For service-related payment disputes between users:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Communicate directly with the other party first</li>
              <li>If unresolved, contact Fayvrs support with all relevant information</li>
              <li>Our team will review evidence from both parties</li>
              <li>We'll provide mediation and recommendations</li>
              <li>Final decisions on private transactions rest with the parties involved</li>
            </ol>
            <p className="mt-3 text-sm">
              Note: Fayvrs is a marketplace platform. We facilitate connections but are not party to individual 
              service agreements between users.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">9. Contact Information</h2>
          <div className="space-y-2 text-muted-foreground">
            <p>For refund requests or questions about this policy:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Email: <a href="mailto:contact@fayvrs.com" className="text-primary underline">contact@fayvrs.com</a></li>
              <li>Subject line: "Refund Request" or "Refund Policy Question"</li>
              <li>Include your account email and order/subscription details</li>
              <li>We respond within 2-3 business days</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">10. Changes to This Policy</h2>
          <div className="space-y-2 text-muted-foreground">
            <p>
              We may update this Refund Policy from time to time. Changes will be posted on this page with an 
              updated "Last Updated" date. Continued use of Fayvrs after changes constitutes acceptance of the 
              updated policy.
            </p>
          </div>
        </section>

        <div className="bg-primary/10 rounded-lg p-6 mt-8">
          <p className="text-sm text-foreground">
            <strong>Important Note:</strong> This policy does not affect your statutory rights under applicable 
            consumer protection laws. In the event of any conflict, applicable law takes precedence.
          </p>
        </div>
      </div>
    </div>
  );
}
