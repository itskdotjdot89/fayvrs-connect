import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RevenueCatUI, PAYWALL_RESULT } from '@revenuecat/purchases-capacitor-ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Check, Crown, ArrowLeft, RotateCcw, Smartphone } from 'lucide-react';
import { useRevenueCat, PRODUCT_IDS } from '@/hooks/useRevenueCat';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isNative, isIOS, isAndroid } from '@/utils/platform';
import { PurchasesOfferings, PurchasesPackage } from '@revenuecat/purchases-capacitor';

export default function ProviderPaywall() {
  const navigate = useNavigate();
  const { user, refreshSubscriptionStatus } = useAuth();
  const { toast } = useToast();
  const {
    isInitialized,
    isLoading,
    error,
    offerings,
    isProSubscriber,
    initialize,
    identifyUser,
    purchasePackage,
    restorePurchases,
  } = useRevenueCat();
  
  const [isRestoring, setIsRestoring] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Initialize RevenueCat when component mounts (native only)
  useEffect(() => {
    // Platform detection logging for debugging iOS StoreKit vs Web Billing issue
    console.log('[ProviderPaywall] Platform detection:', {
      isNative: isNative(),
      isIOS: isIOS(),
      isAndroid: isAndroid(),
      userAgent: navigator.userAgent,
    });
    
    if (user?.id) {
      initialize(user.id);
    }
  }, [user?.id, initialize]);

  // Identify user when they're logged in (native only)
  useEffect(() => {
    if (isInitialized && user?.id && isNative()) {
      identifyUser(user.id);
    }
  }, [isInitialized, user?.id, identifyUser]);

  // Redirect to feed if already subscribed
  useEffect(() => {
    if (isProSubscriber) {
      toast({
        title: "You're already subscribed!",
        description: "Redirecting to the feed...",
      });
      navigate('/feed');
    }
  }, [isProSubscriber, navigate, toast]);

  const handlePresentPaywall = async () => {
    if (!isNative()) {
      return;
    }

    try {
      setShowPaywall(true);
      
      const paywallResult = await RevenueCatUI.presentPaywall();
      
      console.log('[ProviderPaywall] Paywall result:', paywallResult);
      
      if (paywallResult.result === PAYWALL_RESULT.PURCHASED || paywallResult.result === PAYWALL_RESULT.RESTORED) {
        // Sync subscription status immediately
        await refreshSubscriptionStatus();
        
        toast({
          title: "Welcome to Fayvrs Pro!",
          description: "Your subscription is now active.",
        });
        navigate('/feed');
      }
    } catch (error: any) {
      console.error('[ProviderPaywall] Error presenting paywall:', error);
    } finally {
      setShowPaywall(false);
    }
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

  // Auth guard (prevents infinite loading when user is not signed in)
  if (!user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>
              To view and purchase a subscription, please sign in (or create an account).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" onClick={() => navigate('/auth')}>
              Continue to Sign In
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state (native only)
  if (isNative() && (!isInitialized || isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading subscription options...</p>
        </div>
      </div>
    );
  }

  // Error state (native only)
  if (isNative() && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => initialize(user?.id)} className="w-full">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const features = [
    'Unlimited proposal submissions',
    'Priority visibility to requesters',
    'Direct messaging with clients',
    'Portfolio showcase',
    'Verified provider badge eligibility',
    'Access to premium requests',
  ];

  // Get payment method text based on platform
  const getPaymentMethodText = () => {
    if (isIOS()) {
      return "Subscriptions will be charged to your Apple ID account at confirmation of purchase.";
    } else if (isAndroid()) {
      return "Subscriptions will be charged to your Google Play account at confirmation of purchase.";
    } else {
      return "Subscriptions are available exclusively through the Fayvrs iOS app.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50 p-4">
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
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Fayvrs Pro
          </h1>
          <p className="text-muted-foreground">
            Unlock your full potential as a provider
          </p>
        </div>

        {/* Features */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">What's Included</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Native: Present Paywall CTA */}
        {isNative() && (
          <>
            <Button 
              onClick={handlePresentPaywall}
              className="w-full h-14 text-lg mb-4"
              disabled={showPaywall}
            >
              {showPaywall ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'View Subscription Options'
              )}
            </Button>

            {/* Restore purchases */}
            <Button
              variant="ghost"
              onClick={handleRestorePurchases}
              disabled={isRestoring}
              className="w-full"
            >
              {isRestoring ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore Purchases
                </>
              )}
            </Button>
          </>
        )}

        {/* Web: Download iOS App Message */}
        {!isNative() && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg text-center">Download the iOS App</CardTitle>
              <CardDescription className="text-center">
                Fayvrs Pro subscriptions are available exclusively through the iOS app using Apple In-App Purchases.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Download Fayvrs from the App Store to subscribe and unlock all provider features.
                </p>
                <div className="text-sm space-y-1">
                  <p className="font-medium text-foreground">Monthly: $29.99/month</p>
                  <p className="font-medium text-foreground">Annual: $239.99/year <span className="text-primary">(Save 33%)</span></p>
                </div>
              </div>
              
              <Button 
                className="w-full"
                onClick={() => window.open('https://apps.apple.com/app/fayvrs', '_blank')}
              >
                Download on the App Store
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Already subscribed? Download the app and sign in to access your subscription.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Terms */}
        <div className="mt-8 text-center text-xs text-muted-foreground space-y-2">
          <p>{getPaymentMethodText()}</p>
          {isNative() && (
            <p>
              Subscription automatically renews unless canceled at least 24 hours before the end of the current period.
            </p>
          )}
          <div className="flex justify-center gap-4">
            <Button variant="link" size="sm" className="text-xs h-auto p-0" onClick={() => navigate('/terms-of-service')}>
              Terms of Service
            </Button>
            <Button variant="link" size="sm" className="text-xs h-auto p-0" onClick={() => navigate('/privacy-policy')}>
              Privacy Policy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
