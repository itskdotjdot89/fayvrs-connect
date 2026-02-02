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
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Initialize RevenueCat when component mounts (both native and web)
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
          await refreshSubscriptionStatus();
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
          await refreshSubscriptionStatus();
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

  // Helper to detect yearly product
  const isYearlyProduct = (identifier: string, duration?: string | null) => {
    const lowerId = identifier.toLowerCase();
    return lowerId.includes('_1y') || 
           lowerId.includes('yearly') || 
           lowerId.includes('annual') ||
           duration === 'P1Y';
  };

  // Helper to get package display info (works for both native and web)
  const getPackageInfo = (pkg: PurchasesPackage | WebPackage) => {
    if ('product' in pkg) {
      // Native package
      return {
        identifier: pkg.product.identifier,
        priceString: pkg.product.priceString,
        isYearly: isYearlyProduct(pkg.product.identifier),
      };
    } else {
      // Web package
      return {
        identifier: pkg.rcBillingProduct.identifier,
        priceString: pkg.rcBillingProduct.currentPrice.formattedPrice,
        isYearly: isYearlyProduct(pkg.rcBillingProduct.identifier, pkg.rcBillingProduct.normalPeriodDuration),
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
      return "Subscriptions will be charged to your payment method at confirmation of purchase.";
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

        {/* Subscription options - WEB ONLY (iOS must use RevenueCat native paywall for Apple compliance) */}
        {!isNative() && (
          <div id="subscription-options" className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-center text-foreground mb-4">
              Choose Your Plan
            </h3>
            
            {/* Pricing cards - WEB ONLY - Apple Guideline 3.1.2 compliant: billed amount is most prominent */}
            <div className="space-y-3">
              {/* Monthly Plan */}
              <Card 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => {
                  const monthlyPkg = availablePackages.find(pkg => {
                    const info = getPackageInfo(pkg as PurchasesPackage | WebPackage);
                    return !info.isYearly;
                  });
                  if (monthlyPkg) {
                    const info = getPackageInfo(monthlyPkg as PurchasesPackage | WebPackage);
                    handleManualPurchase(info.identifier);
                  } else {
                    toast({
                      title: "Loading...",
                      description: "Please wait while subscription options load.",
                    });
                  }
                }}
              >
                <CardContent className="p-5">
                  {isPurchasing ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground text-lg">Monthly</p>
                        <p className="text-sm text-muted-foreground">Billed monthly</p>
                      </div>
                      <div className="text-right">
                        {/* Primary billed amount - most prominent per Apple 3.1.2 */}
                        <p className="text-2xl font-bold text-foreground">
                          {(() => {
                            const monthlyPkg = availablePackages.find(pkg => {
                              const info = getPackageInfo(pkg as PurchasesPackage | WebPackage);
                              return !info.isYearly;
                            });
                            if (monthlyPkg) {
                              return getPackageInfo(monthlyPkg as PurchasesPackage | WebPackage).priceString;
                            }
                            return '$29.99';
                          })()}
                        </p>
                        <p className="text-sm text-muted-foreground">per month</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Yearly Plan */}
              <Card 
                className="cursor-pointer hover:border-primary transition-colors border-2 border-primary relative"
                onClick={() => {
                  const yearlyPkg = availablePackages.find(pkg => {
                    const info = getPackageInfo(pkg as PurchasesPackage | WebPackage);
                    return info.isYearly;
                  });
                  if (yearlyPkg) {
                    const info = getPackageInfo(yearlyPkg as PurchasesPackage | WebPackage);
                    handleManualPurchase(info.identifier);
                  } else {
                    toast({
                      title: "Loading...",
                      description: "Please wait while subscription options load.",
                    });
                  }
                }}
              >
                <Badge className="absolute -top-2 left-4 text-xs">Best Value</Badge>
                <CardContent className="p-5 pt-6">
                  {isPurchasing ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground text-lg">Annual</p>
                        <p className="text-sm text-muted-foreground">Billed annually</p>
                        {/* Subordinate calculated pricing per Apple 3.1.2 */}
                        <p className="text-xs text-muted-foreground mt-1">
                          (~$20/mo, save 33%)
                        </p>
                      </div>
                      <div className="text-right">
                        {/* Primary billed amount - most prominent per Apple 3.1.2 */}
                        <p className="text-2xl font-bold text-foreground">
                          {(() => {
                            const yearlyPkg = availablePackages.find(pkg => {
                              const info = getPackageInfo(pkg as PurchasesPackage | WebPackage);
                              return info.isYearly;
                            });
                            if (yearlyPkg) {
                              return getPackageInfo(yearlyPkg as PurchasesPackage | WebPackage).priceString;
                            }
                            return '$239.99';
                          })()}
                        </p>
                        <p className="text-sm text-muted-foreground">per year</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

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
            <Button variant="link" size="sm" className="text-xs h-auto p-0" asChild>
              <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>
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
