import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-4">1.1 Account Information</h3>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Email address</li>
              <li>Full name</li>
              <li>Phone number (optional)</li>
              <li>Profile photo</li>
              <li>Bio and service descriptions</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">1.2 Identity Verification Data</h3>
            <p className="text-foreground/80 leading-relaxed mb-3">For service providers, we collect:</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Government-issued ID documents</li>
              <li>Selfie verification photos</li>
              <li>Verification status and review notes</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">1.3 Location Data</h3>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Service location for providers</li>
              <li>Request location coordinates</li>
              <li>Service radius preferences</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">1.4 Platform Activity</h3>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Service requests posted</li>
              <li>Proposals submitted</li>
              <li>Messages exchanged</li>
              <li>Portfolio items and images</li>
              <li>Transaction history</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">1.5 Technical Information</h3>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>IP address</li>
              <li>Device type and browser</li>
              <li>Usage analytics</li>
              <li>Cookies and session data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="text-foreground/80 leading-relaxed mb-3">We use collected information to:</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Provide and maintain Platform services</li>
              <li>Match requesters with nearby providers</li>
              <li>Verify provider identities for safety</li>
              <li>Process subscriptions and payments</li>
              <li>Send notifications about relevant requests</li>
              <li>Facilitate communication between users</li>
              <li>Improve and optimize Platform features</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-4">3.1 With Other Users</h3>
            <p className="text-foreground/80 leading-relaxed">
              Your public profile (name, photo, bio, portfolio) is visible to other users. Request details and 
              proposals are shared between relevant parties.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.2 Service Providers</h3>
            <p className="text-foreground/80 leading-relaxed mb-3">We share data with:</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Cloud infrastructure providers (Supabase)</li>
              <li>Payment processors (RevenueCat, Apple, Google)</li>
              <li>Analytics services</li>
              <li>Customer support tools</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.3 Legal Requirements</h3>
            <p className="text-foreground/80 leading-relaxed">
              We may disclose information when required by law, to protect rights and safety, or in connection with 
              legal proceedings.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.4 Business Transfers</h3>
            <p className="text-foreground/80 leading-relaxed">
              In case of merger, acquisition, or sale, your information may be transferred to the new entity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <p className="text-foreground/80 leading-relaxed mb-3">We implement security measures including:</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication systems</li>
              <li>Row-Level Security (RLS) policies on databases</li>
              <li>Regular security audits and updates</li>
              <li>Access controls for sensitive data</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-3">
              However, no system is completely secure. You are responsible for maintaining the confidentiality of 
              your account credentials.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
            <p className="text-foreground/80 leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide services. 
              After account deletion, some data may be retained for legal compliance, dispute resolution, or 
              legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-foreground/80 leading-relaxed mb-3">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li><strong>Access:</strong> Request copies of your personal data</li>
              <li><strong>Correction:</strong> Update inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your data</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Objection:</strong> Object to certain processing activities</li>
              <li><strong>Withdrawal:</strong> Withdraw consent for data processing</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-3">
              To exercise these rights, contact us at privacy@fayvrs.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>
            <p className="text-foreground/80 leading-relaxed">
              We use cookies and similar technologies to maintain sessions, remember preferences, and analyze usage. 
              You can control cookie settings through your browser, but some features may not function properly if disabled.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
            <p className="text-foreground/80 leading-relaxed">
              The Platform is not intended for users under 18 years of age. We do not knowingly collect information 
              from children. If we become aware of such collection, we will delete the information promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
            <p className="text-foreground/80 leading-relaxed">
              Your information may be transferred to and processed in countries outside your residence. We ensure 
              appropriate safeguards are in place for such transfers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. California Privacy Rights</h2>
            <p className="text-foreground/80 leading-relaxed">
              California residents have additional rights under the CCPA, including the right to know what personal 
              information is collected, sold, or disclosed, and the right to opt-out of sale (though we do not sell 
              personal information).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. GDPR Compliance</h2>
            <p className="text-foreground/80 leading-relaxed">
              For EU residents, we process data based on legitimate interests, contractual necessity, consent, or 
              legal obligations. You have the right to lodge a complaint with your local data protection authority.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Changes to Privacy Policy</h2>
            <p className="text-foreground/80 leading-relaxed">
              We may update this policy periodically. We will notify you of material changes via email or Platform 
              notification. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
            <p className="text-foreground/80 leading-relaxed">
              For privacy-related questions or to exercise your rights:
              <br />
              <strong>Email:</strong> privacy@fayvrs.com
              <br />
              <strong>Support:</strong> support@fayvrs.com
            </p>
          </section>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> This privacy policy is provided as a template and should be reviewed by legal 
              counsel before deployment to ensure compliance with applicable privacy laws (GDPR, CCPA, etc.) in your 
              jurisdiction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
