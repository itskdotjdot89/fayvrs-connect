import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RevenueCatUI, PAYWALL_RESULT } from '@revenuecat/purchases-capacitor-ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, Crown, ArrowLeft, RotateCcw } from 'lucide-react';
import { useRevenueCat, PRODUCT_IDS, WebPackage, WebOfferings } from '@/hooks/useRevenueCat';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isNative, isIOS, isAndroid } from '@/utils/platform';
import { PurchasesOfferings, PurchasesPackage } from '@revenuecat/purchases-capacitor';

export default function ProviderPaywall() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Initialize RevenueCat when component mounts (both native and web)
  useEffect(() => {
    if (user?.id) {
      initialize(user.id);
    }
  }, [user?.id, initialize]);

  // Identify user when they're logged in
  useEffect(() => {
    if (isInitialized && user?.id) {
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
    if (isNative()) {
      // Native: use RevenueCat UI paywall
      try {
        setShowPaywall(true);
        
        const paywallResult = await RevenueCatUI.presentPaywall();
        
        console.log('[ProviderPaywall] Paywall result:', paywallResult);
        
        if (paywallResult.result === PAYWALL_RESULT.PURCHASED || paywallResult.result === PAYWALL_RESULT.RESTORED) {
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
    } else {
      // Web: scroll to subscription options
      const subscriptionSection = document.getElementById('subscription-options');
      subscriptionSection?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRestorePurchases = async () => {
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

  const handleManualPurchase = async (productId: string) => {
    if (!offerings?.current) {
      toast({
        title: "Error",
        description: "Unable to load subscription options. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsPurchasing(true);

    try {
      if (isNative()) {
        // Native purchase
        const nativeOfferings = offerings as PurchasesOfferings;
        const pkg = nativeOfferings.current?.availablePackages.find(
          (p: PurchasesPackage) => p.product.identifier === productId
        );

        if (!pkg) {
          toast({
            title: "Error",
            description: "Subscription package not found.",
            variant: "destructive",
          });
          return;
        }

        const result = await purchasePackage(pkg);

        if (result.success) {
          toast({
            title: "Welcome to Fayvrs Pro!",
            description: "Your subscription is now active.",
          });
          navigate('/feed');
        } else if (result.error !== 'Purchase was cancelled') {
          toast({
            title: "Purchase failed",
            description: result.error,
            variant: "destructive",
          });
        }
      } else {
        // Web purchase
        const webOfferings = offerings as WebOfferings;
        const pkg = webOfferings.current?.availablePackages.find(
          (p: WebPackage) => p.rcBillingProduct.identifier === productId
        );

        if (!pkg) {
          toast({
            title: "Error",
            description: "Subscription package not found.",
            variant: "destructive",
          });
          return;
        }

        const result = await purchasePackage(pkg);

        if (result.success) {
          toast({
            title: "Welcome to Fayvrs Pro!",
            description: "Your subscription is now active.",
          });
          navigate('/feed');
        } else if (result.error !== 'Purchase was cancelled') {
          toast({
            title: "Purchase failed",
            description: result.error,
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  // Helper to get package display info (works for both native and web)
  const getPackageInfo = (pkg: PurchasesPackage | WebPackage) => {
    if ('product' in pkg) {
      // Native package
      return {
        identifier: pkg.product.identifier,
        priceString: pkg.product.priceString,
        isYearly: pkg.product.identifier === PRODUCT_IDS.yearly,
      };
    } else {
      // Web package
      return {
        identifier: pkg.rcBillingProduct.identifier,
        priceString: pkg.rcBillingProduct.currentPrice.formattedPrice,
        isYearly: pkg.rcBillingProduct.identifier === PRODUCT_IDS.yearly,
      };
    }
  };

  // Get available packages based on platform
  const getAvailablePackages = () => {
    if (!offerings?.current) return [];

    if (isNative()) {
      return (offerings as PurchasesOfferings).current?.availablePackages || [];
    }

    return (offerings as WebOfferings).current?.availablePackages || [];
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

  // Loading state
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading subscription options...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
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

  const availablePackages = getAvailablePackages();

  // Get payment method text based on platform
  const getPaymentMethodText = () => {
    if (isIOS()) {
      return "Subscriptions will be charged to your Apple ID account at confirmation of purchase.";
    } else if (isAndroid()) {
      return "Subscriptions will be charged to your Google Play account at confirmation of purchase.";
    } else {
      return "Subscriptions will be charged to your payment method via Stripe at confirmation of purchase.";
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

        {/* CTA - Present Paywall (native) or scroll to options (web) */}
        {isNative() && (
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
        )}

        {/* Subscription options */}
        <div id="subscription-options" className="space-y-3 mb-6">
          {!isNative() && (
            <h3 className="text-lg font-semibold text-center text-foreground mb-4">
              Choose Your Plan
            </h3>
          )}
          {isNative() && availablePackages.length > 0 && (
            <p className="text-sm text-center text-muted-foreground">
              Or select a plan directly:
            </p>
          )}
          {availablePackages.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center space-y-3">
                <p className="font-medium text-foreground">No subscription plans available yet</p>
                <p className="text-sm text-muted-foreground">
                  RevenueCat initialized, but your current offering has no packages. Add your Monthly/Yearly packages to the
                  active offering (and ensure web billing products are configured) to display plans here.
                </p>
                <Button variant="outline" onClick={() => initialize(user.id)} className="w-full">
                  Reload Subscription Options
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {availablePackages.map((pkg) => {
                const info = getPackageInfo(pkg as PurchasesPackage | WebPackage);
                return (
                  <Card 
                    key={info.identifier}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleManualPurchase(info.identifier)}
                  >
                    <CardContent className="p-4 text-center">
                      {isPurchasing ? (
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      ) : (
                        <>
                          <p className="font-semibold text-foreground capitalize">
                            {info.isYearly ? 'Yearly' : 'Monthly'}
                          </p>
                          <p className="text-lg font-bold text-primary">
                            {info.priceString}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {info.isYearly ? 'per year' : 'per month'}
                          </p>
                          {info.isYearly && (
                            <Badge variant="secondary" className="mt-2 text-xs">
                              Save 33%
                            </Badge>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

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

        {/* Terms */}
        <div className="mt-8 text-center text-xs text-muted-foreground space-y-2">
          <p>{getPaymentMethodText()}</p>
          <p>
            Subscription automatically renews unless canceled at least 24 hours before the end of the current period.
          </p>
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
