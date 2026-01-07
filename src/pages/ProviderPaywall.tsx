import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RevenueCatUI, PAYWALL_RESULT } from '@revenuecat/purchases-capacitor-ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, Crown, ArrowLeft, RotateCcw, X } from 'lucide-react';
import { useRevenueCat, PRODUCT_IDS, WebPackage, WebOfferings, isYearlyProduct } from '@/hooks/useRevenueCat';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isNative, isIOS, isAndroid } from '@/utils/platform';
import { PurchasesOfferings, PurchasesPackage } from '@revenuecat/purchases-capacitor';

export default function ProviderPaywall() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
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
  const [showCheckout, setShowCheckout] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const checkoutContainerRef = useRef<HTMLDivElement>(null);
  const initializedUserRef = useRef<string | null>(null);

  // Initialize RevenueCat when component mounts (both native and web)
  // Use a ref to ensure we only initialize once per user ID
  useEffect(() => {
    if (user?.id && initializedUserRef.current !== user.id) {
      initializedUserRef.current = user.id;
      console.log('[ProviderPaywall] Initializing RevenueCat for user:', user.id);
      console.log('[ProviderPaywall] Platform check:', {
        isNative: isNative(),
        isIOS: isIOS(),
        isAndroid: isAndroid(),
        userAgent: navigator.userAgent
      });
      initialize(user.id).then(() => {
        console.log('[ProviderPaywall] RevenueCat initialized successfully');
      }).catch((err) => {
        console.error('[ProviderPaywall] RevenueCat init failed:', err);
      });
    }
  }, [user?.id, initialize]);

  // Identify user when they're logged in
  useEffect(() => {
    if (isInitialized && user?.id) {
      identifyUser(user.id);
    }
  }, [isInitialized, user?.id, identifyUser]);

  // Web checkout: show a loader until RevenueCat injects the checkout UI into our container
  useEffect(() => {
    if (!showCheckout) return;

    const el = checkoutContainerRef.current;
    if (!el) return;

    const sync = () => setIsCheckoutLoading(el.childElementCount === 0);
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(el, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [showCheckout]);

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

  const handlePurchaseWithPackage = async (pkg: PurchasesPackage | WebPackage) => {
    const info = getPackageInfo(pkg);
    console.log('[ProviderPaywall] Starting purchase for package:', info);
    
    setIsPurchasing(true);

    try {
      if (isNative()) {
        const result = await purchasePackage(pkg as PurchasesPackage);
        console.log('[ProviderPaywall] Native purchase result:', result);

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
        // Web purchase - show inline checkout and pass a stable, mounted container to RevenueCat
        setShowCheckout(true);
        setIsCheckoutLoading(true);
        console.log('[ProviderPaywall] Web checkout: showing checkout container');

        const waitForContainer = async () => {
          const startedAt = Date.now();
          while (!checkoutContainerRef.current && Date.now() - startedAt < 3000) {
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
          }
          return checkoutContainerRef.current;
        };

        const container = await waitForContainer();
        console.log('[ProviderPaywall] Container ready:', !!container, container?.id);
        
        if (!container) {
          throw new Error('Checkout failed to open. Please try again.');
        }

        console.log('[ProviderPaywall] Calling purchasePackage with container:', {
          containerId: container.id,
          containerChildren: container.childElementCount,
          packageId: (pkg as WebPackage).identifier
        });

        const result = await purchasePackage(pkg as WebPackage, container);
        console.log('[ProviderPaywall] Purchase result received:', result);
        console.log('[ProviderPaywall] Web purchase result:', result);

        // Hide checkout after purchase flow finishes
        setShowCheckout(false);
        setIsCheckoutLoading(false);

        if (result.success) {
          toast({
            title: "Welcome to Fayvrs Pro!",
            description: "Your subscription is now active.",
          });
          navigate('/feed');
        } else if (result.error && result.error !== 'Purchase was cancelled') {
          toast({
            title: "Purchase failed",
            description: result.error,
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error('[ProviderPaywall] Purchase error:', error);
      setShowCheckout(false);
      setIsCheckoutLoading(false);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  // Find monthly package - try by duration first, then by product ID
  const findMonthlyPackage = () => {
    const packages = getAvailablePackages();
    // First try to find by checking it's NOT yearly
    let pkg = packages.find(p => {
      const info = getPackageInfo(p as PurchasesPackage | WebPackage);
      return !info.isYearly;
    });
    // Fallback: find by PRODUCT_IDS.monthly
    if (!pkg) {
      pkg = packages.find(p => {
        const info = getPackageInfo(p as PurchasesPackage | WebPackage);
        return info.identifier === PRODUCT_IDS.monthly;
      });
    }
    return pkg;
  };

  // Find yearly package - try by duration first, then by product ID
  const findYearlyPackage = () => {
    const packages = getAvailablePackages();
    // First try to find by checking isYearly
    let pkg = packages.find(p => {
      const info = getPackageInfo(p as PurchasesPackage | WebPackage);
      return info.isYearly;
    });
    // Fallback: find by PRODUCT_IDS.yearly
    if (!pkg) {
      pkg = packages.find(p => {
        const info = getPackageInfo(p as PurchasesPackage | WebPackage);
        return info.identifier === PRODUCT_IDS.yearly;
      });
    }
    return pkg;
  };

  // Helper to get package display info (works for both native and web)
  const getPackageInfo = (pkg: PurchasesPackage | WebPackage) => {
    if ('product' in pkg) {
      // Native package
      const identifier = pkg.product.identifier;
      return {
        identifier,
        priceString: pkg.product.priceString,
        isYearly: isYearlyProduct(identifier),
      };
    } else {
      // Web package
      const identifier = pkg.rcBillingProduct.identifier;
      const duration = pkg.rcBillingProduct.normalPeriodDuration;
      return {
        identifier,
        priceString: pkg.rcBillingProduct.currentPrice.formattedPrice,
        isYearly: isYearlyProduct(identifier, duration),
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

  // Wait for auth to finish loading before checking user
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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
  // NOTE: RevenueCat sets isLoading=true during purchases/restores too.
  // We should only block the whole screen while initializing (i.e., before offerings are available).
  if (!isInitialized || (isLoading && !offerings)) {
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
          
          {/* Always show pricing cards - use RevenueCat data if available, fallback to hardcoded */}
          <div className="grid grid-cols-2 gap-3">
            {/* Monthly Plan */}
            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => {
                const monthlyPkg = findMonthlyPackage();
                if (monthlyPkg) {
                  handlePurchaseWithPackage(monthlyPkg as PurchasesPackage | WebPackage);
                } else {
                  toast({
                    title: "Loading...",
                    description: "Please wait while subscription options load.",
                  });
                }
              }}
            >
              <CardContent className="p-4 text-center">
                {isPurchasing ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  <>
                    <p className="font-semibold text-foreground">Monthly</p>
                    <p className="text-lg font-bold text-primary">
                      {(() => {
                        const monthlyPkg = findMonthlyPackage();
                        if (monthlyPkg) {
                          return getPackageInfo(monthlyPkg as PurchasesPackage | WebPackage).priceString;
                        }
                        return '$29.99';
                      })()}
                    </p>
                    <p className="text-xs text-muted-foreground">per month</p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Yearly Plan */}
            <Card 
              className="cursor-pointer hover:border-primary transition-colors border-primary/50"
              onClick={() => {
                const yearlyPkg = findYearlyPackage();
                if (yearlyPkg) {
                  handlePurchaseWithPackage(yearlyPkg as PurchasesPackage | WebPackage);
                } else {
                  toast({
                    title: "Loading...",
                    description: "Please wait while subscription options load.",
                  });
                }
              }}
            >
              <CardContent className="p-4 text-center">
                {isPurchasing ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  <>
                    <p className="font-semibold text-foreground">Annual</p>
                    <p className="text-lg font-bold text-primary">
                      {(() => {
                        const yearlyPkg = findYearlyPackage();
                        if (yearlyPkg) {
                          return getPackageInfo(yearlyPkg as PurchasesPackage | WebPackage).priceString;
                        }
                        return '$239.99';
                      })()}
                    </p>
                    <p className="text-xs text-muted-foreground">per year</p>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      Save 33%
                    </Badge>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
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

      {/* RevenueCat Checkout Container for Web - inline, no modal */}
      {showCheckout && (
        <div className="mt-6 bg-background border rounded-lg p-4 relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Checkout</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowCheckout(false);
                setIsCheckoutLoading(false);
                setIsPurchasing(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative min-h-[360px]">
            {/* IMPORTANT: keep this div empty so RevenueCat can inject the checkout UI */}
            <div
              ref={checkoutContainerRef}
              className="min-h-[360px]"
              id="revenuecat-checkout-container"
            />

            {isCheckoutLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="text-muted-foreground">Loading checkout...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
