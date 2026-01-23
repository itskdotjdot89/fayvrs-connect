import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RevenueCatUI } from '@revenuecat/purchases-capacitor-ui';
import { CustomerInfo } from '@revenuecat/purchases-capacitor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, CreditCard, RefreshCw, HelpCircle, XCircle, Smartphone } from 'lucide-react';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isNative, isIOS } from '@/utils/platform';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CustomerCenter() {
  const navigate = useNavigate();
  const { user, refreshSubscriptionStatus } = useAuth();
  const { toast } = useToast();
  const {
    isInitialized,
    isLoading,
    customerInfo,
    isProSubscriber,
    initialize,
    identifyUser,
    restorePurchases,
  } = useRevenueCat();

  const [isRestoring, setIsRestoring] = useState(false);
  const [showingCustomerCenter, setShowingCustomerCenter] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelSubscription = async () => {
    setIsCancelling(true);

    // Native: Open App Store/Play Store subscription management
    const url = isIOS()
      ? 'https://apps.apple.com/account/subscriptions'
      : 'https://play.google.com/store/account/subscriptions';
    window.open(url, '_blank');
    setIsCancelling(false);
  };

  // Initialize RevenueCat when component mounts (native only)
  useEffect(() => {
    if (user?.id && isNative()) {
      initialize(user.id);
    }
  }, [user?.id, initialize]);

  // Identify user when they're logged in (native only)
  useEffect(() => {
    if (isInitialized && user?.id && isNative()) {
      identifyUser(user.id);
    }
  }, [isInitialized, user?.id, identifyUser]);

  const handlePresentCustomerCenter = async () => {
    if (!isNative()) {
      return;
    }
    
    try {
      setShowingCustomerCenter(true);
      
      // Present the RevenueCat Customer Center
      await RevenueCatUI.presentCustomerCenter();
      
      console.log('[CustomerCenter] Customer center closed');
    } catch (error: any) {
      console.error('[CustomerCenter] Error presenting customer center:', error);
      toast({
        title: "Error",
        description: "Unable to open subscription management. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowingCustomerCenter(false);
    }
  };

  const handleManageSubscription = () => {
    const url = isIOS()
      ? 'https://apps.apple.com/account/subscriptions'
      : 'https://play.google.com/store/account/subscriptions';
    window.open(url, '_blank');
  };

  const handleRestorePurchases = async () => {
    if (!isNative()) {
      toast({
        title: "iOS App Required",
        description: "Please download the Fayvrs app to restore purchases.",
        variant: "destructive",
      });
      return;
    }

    setIsRestoring(true);
    const result = await restorePurchases();
    setIsRestoring(false);

    if (result.success) {
      await refreshSubscriptionStatus();
      toast({
        title: "Purchases restored",
        description: "Your previous purchases have been restored.",
      });
    } else {
      toast({
        title: "No purchases found",
        description: result.error || "No previous purchases were found for this account.",
        variant: "destructive",
      });
    }
  };

  // Web: Show download app message
  if (!isNative()) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-lg mx-auto pt-8">
          {/* Back button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Manage Subscription
            </h1>
            <p className="text-muted-foreground">
              Subscription management is available in the iOS app
            </p>
          </div>

          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg text-center">Download the iOS App</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Fayvrs Pro subscriptions are managed through Apple's App Store. Download the iOS app to subscribe, restore purchases, or manage your subscription.
              </p>
              
              <Button 
                className="w-full"
                onClick={() => window.open('https://apps.apple.com/app/fayvrs', '_blank')}
              >
                Download on the App Store
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Already have an active subscription? Sign in on the iOS app to access your Fayvrs Pro benefits.
              </p>
            </CardContent>
          </Card>

          {/* Help text */}
          <div className="mt-8 text-center text-xs text-muted-foreground space-y-2">
            <p>
              Need help? Contact us at support@fayvrs.com
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state (native only)
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Get subscription info from native CustomerInfo
  const activeSubscriptions = customerInfo?.activeSubscriptions || [];
  const expirationDate = customerInfo?.latestExpirationDate || null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto pt-8">
        {/* Back button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Manage Subscription
          </h1>
          <p className="text-muted-foreground">
            View and manage your Fayvrs Pro subscription
          </p>
        </div>

        {/* Subscription Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isProSubscriber ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Status</span>
                  <span className="text-primary font-semibold">Active</span>
                </div>
                {activeSubscriptions.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Plan</span>
                    <span className="text-muted-foreground">
                      {activeSubscriptions[0].includes('yearly') ? 'Yearly' : 'Monthly'}
                    </span>
                  </div>
                )}
                {expirationDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Renews</span>
                    <span className="text-muted-foreground">
                      {new Date(expirationDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  You don't have an active subscription
                </p>
                <Button onClick={() => navigate('/provider-paywall')}>
                  Subscribe to Fayvrs Pro
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subscription Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Center (RevenueCat native UI) */}
            <Button
              variant="outline"
              onClick={handlePresentCustomerCenter}
              disabled={showingCustomerCenter}
              className="w-full justify-start"
            >
              {showingCustomerCenter ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <HelpCircle className="h-4 w-4 mr-2" />
              )}
              Subscription Help & Support
            </Button>

            <Separator />

            {/* Manage via App Store/Play Store */}
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              className="w-full justify-start"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Manage in {isIOS() ? 'App Store' : 'Play Store'}
            </Button>

            {/* Restore purchases */}
            <Button
              variant="outline"
              onClick={handleRestorePurchases}
              disabled={isRestoring}
              className="w-full justify-start"
            >
              {isRestoring ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Restore Purchases
            </Button>

            {/* Cancel Subscription */}
            {isProSubscriber && (
              <>
                <Separator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      disabled={isCancelling}
                    >
                      {isCancelling ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Cancel Subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
                      <AlertDialogDescription asChild>
                        <div className="space-y-3 text-sm text-muted-foreground">
                          <p>Are you sure you want to cancel your Fayvrs Pro subscription?</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Your access will continue until the end of your billing period</li>
                            <li>You'll lose access to provider features after cancellation</li>
                            <li>You can resubscribe anytime</li>
                          </ul>
                          <p className="font-medium mt-2">
                            You'll be taken to your {isIOS() ? 'App Store' : 'Play Store'} subscriptions to complete cancellation.
                          </p>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleCancelSubscription}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, Cancel
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </CardContent>
        </Card>

        {/* Help text */}
        <div className="mt-8 text-center text-xs text-muted-foreground space-y-2">
          <p>
            To cancel your subscription, go to your device's App Store settings.
          </p>
          <p>
            Need help? Contact us at support@fayvrs.com
          </p>
        </div>
      </div>
    </div>
  );
}
