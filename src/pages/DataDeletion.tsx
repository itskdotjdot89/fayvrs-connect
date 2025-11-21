import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function DataDeletion() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-foreground">Data Deletion</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <CardTitle>Your Right to Delete Your Data</CardTitle>
                <CardDescription className="mt-1">
                  Control your personal information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              At Fayvrs, we respect your privacy and your right to control your personal data. 
              You can request deletion of your account and all associated information at any time.
            </p>
          </CardContent>
        </Card>

        {/* What Gets Deleted */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              What Gets Deleted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              When you delete your account, we permanently remove:
            </p>
            <ul className="space-y-2">
              {[
                "Your profile information (name, email, phone, location)",
                "Profile photos and avatar",
                "All service requests you've posted",
                "All proposals you've submitted",
                "All messages you've sent or received",
                "Your identity verification documents",
                "Notification preferences",
                "Subscription records and payment history",
                "Portfolio items and work samples",
                "Referral links and earnings",
                "All other personal data",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="w-5 h-5" />
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="space-y-2">
              <p className="font-medium text-foreground">This Action Is Permanent</p>
              <p>
                Once you delete your account, all your data is permanently removed from our servers. 
                This cannot be undone.
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="font-medium text-foreground">Legal Retention</p>
              <p>
                Some data may be retained for legal compliance purposes (e.g., transaction records 
                for tax purposes) as required by law, but your personal information will be anonymized.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-foreground">Active Transactions</p>
              <p>
                If you have any active service requests or ongoing transactions, please complete or 
                cancel them before deleting your account.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-foreground">Subscription Cancellation</p>
              <p>
                If you're a provider with an active subscription, it will be automatically cancelled, 
                but you won't receive a refund for the current billing period.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* How to Delete */}
        <Card>
          <CardHeader>
            <CardTitle>How to Delete Your Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
              <li>Go to your Settings page</li>
              <li>Scroll to the bottom to find "Delete Account"</li>
              <li>Read the warning and click "Delete My Account"</li>
              <li>Confirm the deletion when prompted</li>
              <li>Type "DELETE" to finalize the deletion</li>
              <li>Your account and all data will be permanently removed</li>
            </ol>

            <div className="mt-6 pt-6 border-t">
              <Link to="/settings">
                <Button variant="destructive" size="lg" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Go to Settings to Delete Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Options */}
        <Card>
          <CardHeader>
            <CardTitle>Not Ready to Delete?</CardTitle>
            <CardDescription>
              Consider these alternatives
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="font-medium text-foreground text-sm">Disable Location Sharing</p>
              <p className="text-sm text-muted-foreground">
                You can turn off location sharing in your Settings without deleting your account.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-foreground text-sm">Manage Notifications</p>
              <p className="text-sm text-muted-foreground">
                Adjust your notification preferences to reduce alerts without losing your account.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-foreground text-sm">Cancel Provider Subscription</p>
              <p className="text-sm text-muted-foreground">
                If you're a provider, you can cancel your subscription while keeping your account.
              </p>
            </div>

            <div className="mt-4">
              <Link to="/settings">
                <Button variant="outline" className="w-full">
                  Update Your Settings Instead
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              If you have questions about data deletion or need assistance, contact our support team:
            </p>
            <div className="space-y-2">
              <a 
                href="mailto:contact@fayvrs.com" 
                className="text-sm text-primary hover:underline flex items-center gap-2"
              >
                contact@fayvrs.com
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Policy Link */}
        <div className="text-center text-sm text-muted-foreground">
          For more information about how we handle your data, see our{" "}
          <Link to="/privacy-policy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
