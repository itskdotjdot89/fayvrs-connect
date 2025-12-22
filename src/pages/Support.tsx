import { Link } from "react-router-dom";
import { ArrowLeft, Headphones, Mail, HelpCircle, MessageCircle, Shield, CreditCard, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Support() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link to="/settings">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-semibold text-lg">Support</h1>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Headphones className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">How can we help?</h2>
                <p className="text-sm text-muted-foreground">
                  Find answers to common questions or contact our support team
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Us */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Contact Us
            </CardTitle>
            <CardDescription>
              Reach out to our support team for assistance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/50">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Email Support</p>
                <a 
                  href="mailto:support@fayvrs.com" 
                  className="text-sm text-primary hover:underline"
                >
                  support@fayvrs.com
                </a>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              We aim to respond to all inquiries within 24-48 hours. For urgent safety concerns, 
              please visit our <Link to="/safety-center" className="text-primary hover:underline">Safety Center</Link>.
            </p>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="verification">
                <AccordionTrigger>How do I become a verified provider?</AccordionTrigger>
                <AccordionContent>
                  To become verified, go to Settings → Identity Verification and submit your government-issued 
                  ID along with a selfie. Our team reviews submissions within 24-48 hours. Once approved, 
                  you'll receive a verification badge visible on your profile.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="payments">
                <AccordionTrigger>How do payments work?</AccordionTrigger>
                <AccordionContent>
                  Payments are handled directly between requesters and providers. We recommend using secure 
                  payment methods and never paying before meeting or verifying the service. For more details, 
                  see our <Link to="/community-guidelines" className="text-primary hover:underline">Community Guidelines</Link>.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="dispute">
                <AccordionTrigger>What if I have a dispute with a provider or requester?</AccordionTrigger>
                <AccordionContent>
                  If you have an issue, first try to resolve it directly through our messaging system. 
                  If that doesn't work, you can report the user or contact support. We take disputes seriously 
                  and will investigate all reported issues. Check our <Link to="/refund-policy" className="text-primary hover:underline">Refund Policy</Link> for 
                  subscription-related disputes.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="delete-account">
                <AccordionTrigger>How do I delete my account?</AccordionTrigger>
                <AccordionContent>
                  You can delete your account from Settings → Delete Account. This action is permanent and 
                  will remove all your data including messages, requests, and profile information. See our 
                  <Link to="/data-deletion" className="text-primary hover:underline ml-1">Data Deletion</Link> page for more details.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="update-profile">
                <AccordionTrigger>How do I update my profile?</AccordionTrigger>
                <AccordionContent>
                  Go to Settings to update your profile picture, username, and notification preferences. 
                  Providers can also update their portfolio and service areas from the Provider Dashboard.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="subscription">
                <AccordionTrigger>How do provider subscriptions work?</AccordionTrigger>
                <AccordionContent>
                  Providers need an active subscription to respond to requests and appear in search results. 
                  We offer monthly plans with all features included. Visit our 
                  <Link to="/subscription-details" className="text-primary hover:underline ml-1">Subscription Details</Link> page 
                  for pricing and features.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* For Requesters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              For Requesters
            </CardTitle>
            <CardDescription>
              Help for people looking for services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <p><strong>Posting a Request:</strong> Click "Post Request" to describe what you need. Be specific about your requirements, timeline, and budget range.</p>
              <p><strong>Choosing a Provider:</strong> Review proposals from providers, check their profiles, ratings, and portfolios. Message them to discuss details before accepting.</p>
              <p><strong>Payments:</strong> Agree on payment terms with your provider. We recommend using secure methods and paying only after satisfactory service.</p>
            </div>
            <Link to="/refund-policy" className="flex items-center text-sm text-primary hover:underline">
              View Refund Policy
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </CardContent>
        </Card>

        {/* For Providers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              For Providers
            </CardTitle>
            <CardDescription>
              Help for service providers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <p><strong>Setting Up Your Profile:</strong> Complete your profile with a photo, bio, and portfolio items. Get verified to build trust with requesters.</p>
              <p><strong>Subscriptions:</strong> An active subscription is required to respond to requests. Choose a plan that fits your needs.</p>
              <p><strong>Responding to Requests:</strong> Browse the feed for requests in your area. Submit thoughtful proposals with fair pricing to stand out.</p>
            </div>
            <Link to="/subscription-details" className="flex items-center text-sm text-primary hover:underline">
              View Subscription Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </CardContent>
        </Card>

        {/* Report Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Report Issues
            </CardTitle>
            <CardDescription>
              How to report problems or safety concerns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <p><strong>Report a User:</strong> Use the report button on any user's profile or in the messaging screen to flag inappropriate behavior.</p>
              <p><strong>Safety Concerns:</strong> For urgent safety matters, contact local authorities first. Then report to us for platform action.</p>
              <p><strong>What to Report:</strong> Scams, harassment, spam, fake profiles, inappropriate content, or any violations of our Community Guidelines.</p>
            </div>
            <Link to="/safety-center">
              <Button variant="outline" className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                Visit Safety Center
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Need More Help */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Headphones className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Still Need Help?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Our support team is here to assist you
                </p>
              </div>
              <a href="mailto:support@fayvrs.com">
                <Button className="w-full max-w-xs">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </a>
              <p className="text-xs text-muted-foreground">
                Response time: 24-48 hours
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
