import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, AlertTriangle, Lock, Phone, MessageSquare, Flag } from "lucide-react";

export default function SafetyCenter() {
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
            <h1 className="text-lg font-semibold text-foreground">Safety Center</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-primary/10 rounded-card p-5 flex items-start gap-4">
          <Shield className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
          <div>
            <h2 className="font-semibold text-foreground mb-2">Your Safety is Our Priority</h2>
            <p className="text-sm text-muted-foreground">
              Fayvrs connects you with real people for real-world services. Follow these guidelines to stay safe.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              Meeting Safety
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-1">Before Meeting:</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Review the provider's profile, ratings, and verification status</li>
                <li>Communicate through Fayvrs messaging first</li>
                <li>Get detailed quotes and service descriptions in writing</li>
                <li>Share your meeting details with a friend or family member</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">During Service:</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Meet in public places when possible</li>
                <li>Trust your instincts - if something feels wrong, leave</li>
                <li>Keep valuables secure</li>
                <li>Don't share unnecessary personal information</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">In an Emergency:</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Call 911 immediately if you feel unsafe</li>
                <li>Report the incident to Fayvrs support</li>
                <li>Document everything with photos and messages</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Payment & Fraud Safety
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>All payments are processed securely through Stripe</li>
              <li>Never send money outside of the Fayvrs platform</li>
              <li>Be wary of requests for cash, wire transfers, or gift cards</li>
              <li>Report any suspicious payment requests immediately</li>
              <li>Get detailed quotes before agreeing to services</li>
              <li>Keep all communication and payment records in the app</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Communication Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Keep all communication within Fayvrs messaging</li>
              <li>Never share personal contact information until you're comfortable</li>
              <li>Be professional and respectful in all interactions</li>
              <li>Report harassment, threats, or inappropriate messages</li>
              <li>Don't share sensitive information like passwords or financial details</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Verification & Trust
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">What Verification Means:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Email Verified:</strong> User has confirmed their email address</li>
              <li><strong>Phone Verified:</strong> User has confirmed their phone number</li>
              <li><strong>ID Verified:</strong> User has submitted government-issued ID (reviewed by our team)</li>
            </ul>
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <p className="text-xs">
                <strong>Important:</strong> Verification badges confirm identity information but do not guarantee service quality, 
                reliability, or trustworthiness. Always review ratings, communicate clearly, and follow safety guidelines.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-primary" />
              Report & Block Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>If you encounter inappropriate behavior, scams, or safety concerns:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Use the "Report" button on profiles, requests, or messages</li>
              <li>Provide detailed information about the issue</li>
              <li>Block users to prevent further contact</li>
              <li>Our team reviews all reports within 24 hours</li>
            </ul>
            <div className="mt-4">
              <p className="font-medium text-foreground mb-2">Report these immediately:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Threats or violence</li>
                <li>Harassment or hate speech</li>
                <li>Fraud or scam attempts</li>
                <li>Inappropriate content</li>
                <li>Impersonation</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>Our support team is here to help</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Contact us at: <a href="mailto:contact@fayvrs.com" className="text-primary underline">contact@fayvrs.com</a>
            </p>
            <p className="text-sm text-muted-foreground">
              Emergency? Call 911 first, then report to Fayvrs.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
