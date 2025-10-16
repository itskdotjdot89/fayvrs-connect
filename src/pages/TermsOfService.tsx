import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-foreground/80 leading-relaxed">
              By accessing and using Fayvrs ("the Platform"), you accept and agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-foreground/80 leading-relaxed mb-3">
              Fayvrs is a marketplace platform that connects service requesters with service providers. The Platform facilitates:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Posting and browsing service requests</li>
              <li>Submitting and reviewing proposals</li>
              <li>Communication between parties</li>
              <li>Identity verification for providers</li>
              <li>Location-based service matching</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">3.1 Registration</h3>
            <p className="text-foreground/80 leading-relaxed">
              You must create an account to use certain features. You agree to provide accurate information and maintain 
              the security of your account credentials.
            </p>
            <h3 className="text-xl font-semibold mb-3 mt-4">3.2 Account Types</h3>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li><strong>Requester:</strong> Users who post service requests</li>
              <li><strong>Provider:</strong> Users who offer services and submit proposals</li>
              <li>Users may have both roles simultaneously</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Identity Verification</h2>
            <p className="text-foreground/80 leading-relaxed mb-3">
              Service providers must complete identity verification (KYC) by submitting:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Valid government-issued ID document</li>
              <li>Selfie verification photo</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-3">
              Submitted documents are reviewed by our team and stored securely. We reserve the right to reject 
              verification at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Provider Subscriptions</h2>
            <p className="text-foreground/80 leading-relaxed">
              Service providers must maintain an active subscription to receive request notifications and submit proposals. 
              Subscription fees are non-refundable except as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. User Conduct</h2>
            <p className="text-foreground/80 leading-relaxed mb-3">You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Post false, misleading, or fraudulent content</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Circumvent our payment or verification systems</li>
              <li>Use automated systems to access the Platform</li>
              <li>Infringe on intellectual property rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Payment Terms</h2>
            <p className="text-foreground/80 leading-relaxed">
              Payment arrangements are made directly between requesters and providers. Fayvrs is not responsible for 
              payment disputes, quality of services, or contract fulfillment between users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Content Ownership</h2>
            <p className="text-foreground/80 leading-relaxed">
              You retain ownership of content you post. By posting, you grant Fayvrs a worldwide, non-exclusive license 
              to use, display, and distribute your content in connection with the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p className="text-foreground/80 leading-relaxed">
              Fayvrs acts solely as a platform connecting users. We are not responsible for the quality, safety, legality, 
              or any other aspect of services exchanged between users. Use the Platform at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <p className="text-foreground/80 leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these terms or engage in harmful conduct. 
              You may close your account at any time through account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Dispute Resolution</h2>
            <p className="text-foreground/80 leading-relaxed">
              Any disputes arising from these terms will be resolved through binding arbitration in accordance with 
              applicable laws. You waive the right to participate in class-action lawsuits.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
            <p className="text-foreground/80 leading-relaxed">
              We may modify these terms at any time. Continued use of the Platform after changes constitutes acceptance 
              of the new terms. We will notify users of material changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p className="text-foreground/80 leading-relaxed">
              For questions about these Terms of Service, please contact us at:
              <br />
              <strong>Email:</strong> support@fayvrs.com
            </p>
          </section>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> These terms are provided as a template and should be reviewed by legal counsel 
              before deployment to ensure compliance with applicable laws and regulations in your jurisdiction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
