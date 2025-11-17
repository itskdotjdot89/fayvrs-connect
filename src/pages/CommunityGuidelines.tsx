import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function CommunityGuidelines() {
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
            <h1 className="text-lg font-semibold text-foreground">Community Guidelines</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div>
          <p className="text-muted-foreground mb-4">Last Updated: November 14, 2025</p>
          <p className="text-foreground leading-relaxed">
            Fayvrs is a community marketplace connecting people who need services with trusted local providers. 
            These guidelines help ensure a safe, respectful, and productive environment for everyone.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">1. Be Respectful & Professional</h2>
          <div className="space-y-3 text-muted-foreground">
            <p><strong>Do:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Treat all users with respect and courtesy</li>
              <li>Communicate clearly and professionally</li>
              <li>Honor your commitments and agreements</li>
              <li>Provide accurate information in profiles and requests</li>
              <li>Respond to messages in a timely manner</li>
            </ul>
            <p className="mt-3"><strong>Don't:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Use offensive, discriminatory, or hateful language</li>
              <li>Harass, threaten, or intimidate other users</li>
              <li>Share inappropriate or explicit content</li>
              <li>Spam or send unsolicited promotional messages</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">2. Honest & Accurate Representation</h2>
          <div className="space-y-2 text-muted-foreground">
            <p><strong>For Requesters:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Provide clear, accurate descriptions of what you need</li>
              <li>Set realistic budgets and timelines</li>
              <li>Include all relevant details and requirements</li>
              <li>Be honest about your location and availability</li>
            </ul>
            <p className="mt-3"><strong>For Providers:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Only offer services you're qualified to perform</li>
              <li>Accurately represent your skills and experience</li>
              <li>Use real photos of your work in portfolios</li>
              <li>Provide honest quotes and time estimates</li>
              <li>Disclose any limitations or requirements upfront</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">3. Prohibited Content & Activities</h2>
          <div className="space-y-2 text-muted-foreground">
            <p>The following are strictly prohibited on Fayvrs:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Illegal Activities:</strong> Any service or request involving illegal activities, drugs, weapons, or prohibited items</li>
              <li><strong>Adult Content:</strong> Sexual services, escort services, or explicit content</li>
              <li><strong>Harmful Services:</strong> Anything that could cause harm to people, animals, or property</li>
              <li><strong>Fraud & Scams:</strong> Deceptive practices, fake profiles, or attempts to defraud users</li>
              <li><strong>Hate Speech:</strong> Content promoting discrimination, violence, or hatred based on race, ethnicity, religion, gender, sexual orientation, disability, or other protected characteristics</li>
              <li><strong>Intellectual Property Violations:</strong> Unauthorized use of copyrighted material, trademarks, or counterfeit goods</li>
              <li><strong>Personal Information:</strong> Sharing others' private information without consent</li>
              <li><strong>Platform Manipulation:</strong> Fake reviews, artificially inflating ratings, or circumventing safety measures</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">4. Safety First</h2>
          <div className="space-y-2 text-muted-foreground">
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Keep all communication and payments within Fayvrs</li>
              <li>Meet in public places when appropriate</li>
              <li>Verify provider credentials and reviews before hiring</li>
              <li>Report suspicious behavior immediately</li>
              <li>Follow local laws and regulations for all services</li>
              <li>Maintain appropriate insurance and licensing for professional services</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">5. Fair Transactions</h2>
          <div className="space-y-2 text-muted-foreground">
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Agree on clear terms, scope, and pricing before starting work</li>
              <li>Complete transactions through Fayvrs payment systems when available</li>
              <li>Honor quotes and agreements unless both parties agree to changes</li>
              <li>Communicate promptly about any issues or delays</li>
              <li>Leave honest, constructive reviews after transactions</li>
              <li>Don't manipulate reviews or ratings</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">6. Privacy & Data Protection</h2>
          <div className="space-y-2 text-muted-foreground">
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Respect others' privacy and personal information</li>
              <li>Don't share contact information publicly</li>
              <li>Use secure methods for any sensitive communications</li>
              <li>Don't screenshot or share private messages without consent</li>
              <li>Follow our Privacy Policy regarding data usage</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">7. Account Responsibility</h2>
          <div className="space-y-2 text-muted-foreground">
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Maintain one account per person</li>
              <li>Don't share your account credentials</li>
              <li>You're responsible for all activity on your account</li>
              <li>Report unauthorized access immediately</li>
              <li>Keep your profile information current and accurate</li>
              <li>Don't create accounts on behalf of others without authorization</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">8. Reporting & Enforcement</h2>
          <div className="space-y-2 text-muted-foreground">
            <p>If you see violations of these guidelines:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Use the "Report" button on profiles, requests, or messages</li>
              <li>Provide specific details about the violation</li>
              <li>We review all reports within 24 hours</li>
            </ul>
            <p className="mt-3">Violations may result in:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Warning and guidance</li>
              <li>Temporary suspension</li>
              <li>Permanent account termination</li>
              <li>Legal action for serious violations</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">9. Provider-Specific Guidelines</h2>
          <div className="space-y-2 text-muted-foreground">
            <p>Service providers must:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Maintain required licenses and insurance for their services</li>
              <li>Comply with all local, state, and federal regulations</li>
              <li>Carry appropriate liability insurance when required</li>
              <li>Use proper safety equipment and procedures</li>
              <li>Not subcontract work without requester approval</li>
              <li>Maintain professional boundaries with clients</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">10. Changes to Guidelines</h2>
          <div className="space-y-2 text-muted-foreground">
            <p>
              We may update these guidelines as our community grows and evolves. Continued use of Fayvrs 
              constitutes acceptance of the current guidelines. We'll notify users of significant changes.
            </p>
          </div>
        </section>

        <div className="bg-muted/30 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-foreground mb-2">Questions or Concerns?</h3>
          <p className="text-sm text-muted-foreground">
            Contact us at <a href="mailto:contact@fayvrs.com" className="text-primary underline">contact@fayvrs.com</a>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            For safety emergencies, call 911 first, then report to Fayvrs.
          </p>
        </div>
      </div>
    </div>
  );
}
