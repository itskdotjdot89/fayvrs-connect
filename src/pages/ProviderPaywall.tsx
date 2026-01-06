import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RevenueCatUI, PAYWALL_RESULT } from '@revenuecat/purchases-capacitor-ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, Crown, ArrowLeft, RotateCcw, X, AlertTriangle } from 'lucide-react';
import { useRevenueCat, PRODUCT_IDS, WebPackage, WebOfferings, isYearlyProduct } from '@/hooks/useRevenueCat';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isNative, isIOS, isAndroid } from '@/utils/platform';
import { PurchasesOfferings, PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Debug mode - set to true in development or via URL param
const DEBUG_MODE = import.meta.env.DEV || new URLSearchParams(window.location.search).has('debug');

// Timeout for loading state (prevents infinite spinner)
const LOADING_TIMEOUT_MS = 15000;

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
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const checkoutContainerRef = useRef<HTMLDivElement>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize RevenueCat when component mounts (both native and web)
  useEffect(() => {
    if (user?.id) {
      setLoadingTimedOut(false);
      initialize(user.id);
      
      // Set loading timeout
      loadingTimeoutRef.current = setTimeout(() => {
        setLoadingTimedOut(true);
        console.warn('[ProviderPaywall] Loading timed out after', LOADING_TIMEOUT_MS, 'ms');
      }, LOADING_TIMEOUT_MS);
    }
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [user?.id, initialize]);

  // Clear timeout when initialized
  useEffect(() => {
    if (isInitialized && loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
  }, [isInitialized]);

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

  // Debug: Log offerings structure when it changes
  useEffect(() => {
    if (offerings && DEBUG_MODE) {
      console.group('[ProviderPaywall] 📦 Offerings Debug');
      console.log('Raw offerings:', offerings);
      console.log('Current offering:', offerings.current);
      
      const packages = getAvailablePackages();
      console.log('Available packages count:', packages.length);
      
      packages.forEach((pkg, index) => {
        const info = getPackageInfo(pkg as PurchasesPackage | WebPackage);
        console.log(`Package ${index}:`, {
          identifier: info.identifier,
          priceString: info.priceString,
          isYearly: info.isYearly,
          raw: pkg,
        });
      });
      
      const monthlyPkg = findMonthlyPackage();
      const yearlyPkg = findYearlyPackage();
      
      console.log('Monthly package found:', monthlyPkg ? getPackageInfo(monthlyPkg as PurchasesPackage | WebPackage) : 'NOT FOUND');
      console.log('Yearly package found:', yearlyPkg ? getPackageInfo(yearlyPkg as PurchasesPackage | WebPackage) : 'NOT FOUND');
      console.log('Expected product IDs:', PRODUCT_IDS);
      console.groupEnd();
    }
  }, [offerings]);

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

  const handlePurchaseWithPackage = async (pkg: PurchasesPackage | WebPackage | null, planType: 'monthly' | 'yearly') => {
    setPurchaseError(null);
    
    // If no package found, show detailed error
    if (!pkg) {
      const errorMsg = `${planType === 'yearly' ? 'Annual' : 'Monthly'} subscription package not found. Please try again or contact support.`;
      console.error('[ProviderPaywall] Package not found:', {
        planType,
        expectedProductId: planType === 'yearly' ? PRODUCT_IDS.yearly : PRODUCT_IDS.monthly,
        availablePackages: getAvailablePackages().map(p => getPackageInfo(p as PurchasesPackage | WebPackage)),
      });
      
      setPurchaseError(errorMsg);
      toast({
        title: "Subscription Error",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }
    
    const info = getPackageInfo(pkg);
    console.log('[ProviderPaywall] Starting purchase for package:', info);
    
    // Validate the package matches the expected plan type
    if ((planType === 'yearly' && !info.isYearly) || (planType === 'monthly' && info.isYearly)) {
      console.error('[ProviderPaywall] Package mismatch:', {
        expectedPlanType: planType,
        packageIsYearly: info.isYearly,
        packageIdentifier: info.identifier,
      });
      
      const errorMsg = `Package configuration error: Expected ${planType} but got ${info.isYearly ? 'yearly' : 'monthly'}. Please contact support.`;
      setPurchaseError(errorMsg);
      toast({
        title: "Configuration Error",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }
    
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
          setPurchaseError(result.error || 'Purchase failed');
          toast({
            title: "Purchase failed",
            description: result.error,
            variant: "destructive",
          });
        }
      } else {
        // Web purchase - show checkout modal and pass the container ref
        setShowCheckoutModal(true);
        
        // Wait for the modal to render
        await new Promise(resolve => setTimeout(resolve, 100));

        // Pass the checkout container to RevenueCat
        const result = await purchasePackage(pkg as WebPackage, checkoutContainerRef.current);
        console.log('[ProviderPaywall] Web purchase result:', result);

        setShowCheckoutModal(false);

        if (result.success) {
          toast({
            title: "Welcome to Fayvrs Pro!",
            description: "Your subscription is now active.",
          });
          navigate('/feed');
        } else if (result.error && result.error !== 'Purchase was cancelled') {
          setPurchaseError(result.error);
          toast({
            title: "Purchase failed",
            description: result.error,
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error('[ProviderPaywall] Purchase error:', error);
      setShowCheckoutModal(false);
      const errorMsg = error.message || "An unexpected error occurred. Please try again.";
      setPurchaseError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
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

  // Find monthly package - try by duration first, then by product ID
  const findMonthlyPackage = () => {
    const packages = getAvailablePackages();
    
    // First try to find by checking it's NOT yearly AND matches monthly product ID
    let pkg = packages.find(p => {
      const info = getPackageInfo(p as PurchasesPackage | WebPackage);
      return info.identifier === PRODUCT_IDS.monthly && !info.isYearly;
    });
    
    // Fallback: find any package that is NOT yearly
    if (!pkg) {
      pkg = packages.find(p => {
        const info = getPackageInfo(p as PurchasesPackage | WebPackage);
        return !info.isYearly;
      });
    }
    
    if (DEBUG_MODE && pkg) {
      const info = getPackageInfo(pkg as PurchasesPackage | WebPackage);
      console.log('[ProviderPaywall] Found monthly package:', info);
    }
    
    return pkg;
  };

  // Find yearly package - try by duration first, then by product ID
  const findYearlyPackage = () => {
    const packages = getAvailablePackages();
    
    // First try to find by checking isYearly AND matches yearly product ID
    let pkg = packages.find(p => {
      const info = getPackageInfo(p as PurchasesPackage | WebPackage);
      return info.identifier === PRODUCT_IDS.yearly && info.isYearly;
    });
    
    // Fallback: find any package that IS yearly
    if (!pkg) {
      pkg = packages.find(p => {
        const info = getPackageInfo(p as PurchasesPackage | WebPackage);
        return info.isYearly;
      });
    }
    
    if (DEBUG_MODE && pkg) {
      const info = getPackageInfo(pkg as PurchasesPackage | WebPackage);
      console.log('[ProviderPaywall] Found yearly package:', info);
    }
    
    return pkg;
  };

  // Memoized package info to detect misconfigurations
  const packagesStatus = useMemo(() => {
    const monthlyPkg = findMonthlyPackage();
    const yearlyPkg = findYearlyPackage();
    const allPackages = getAvailablePackages();
    
    const monthlyInfo = monthlyPkg ? getPackageInfo(monthlyPkg as PurchasesPackage | WebPackage) : null;
    const yearlyInfo = yearlyPkg ? getPackageInfo(yearlyPkg as PurchasesPackage | WebPackage) : null;
    
    // Detect misconfigurations
    const issues: string[] = [];
    
    if (allPackages.length === 0 && isInitialized && !isLoading) {
      issues.push('No packages found in offerings');
    }
    
    if (!monthlyPkg && allPackages.length > 0) {
      issues.push('Monthly package not found');
    }
    
    if (!yearlyPkg && allPackages.length > 0) {
      issues.push('Yearly package not found');
    }
    
    if (monthlyInfo && monthlyInfo.identifier !== PRODUCT_IDS.monthly) {
      issues.push(`Monthly package ID mismatch: expected ${PRODUCT_IDS.monthly}, got ${monthlyInfo.identifier}`);
    }
    
    if (yearlyInfo && yearlyInfo.identifier !== PRODUCT_IDS.yearly) {
      issues.push(`Yearly package ID mismatch: expected ${PRODUCT_IDS.yearly}, got ${yearlyInfo.identifier}`);
    }
    
    return {
      monthlyPkg,
      yearlyPkg,
      monthlyInfo,
      yearlyInfo,
      allPackages,
      issues,
      hasMisconfiguration: issues.length > 0,
    };
  }, [offerings, isInitialized, isLoading]);

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

  // Loading state (initialization only)
  // IMPORTANT: do NOT gate the whole page on `isLoading` after init, because purchases/restores set
  // `isLoading=true` inside the hook and would otherwise unmount the checkout modal target.
  if (!isInitialized && !loadingTimedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading subscription options...</p>
        </div>
      </div>
    );
  }

  // Loading timed out - show fallback UI
  if (loadingTimedOut && !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <CardTitle className="text-center">Loading Took Too Long</CardTitle>
            <CardDescription className="text-center">
              We're having trouble loading subscription options. This might be a network issue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => {
                setLoadingTimedOut(false);
                initialize(user?.id);
              }} 
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)} className="w-full">
              Go Back
            </Button>
            {DEBUG_MODE && (
              <p className="text-xs text-muted-foreground text-center">
                Debug: Timeout after {LOADING_TIMEOUT_MS}ms. Check console for errors.
              </p>
            )}
          </CardContent>
        </Card>
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
            {DEBUG_MODE && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Debug: Check console for detailed error logs.
              </p>
            )}
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
              onClick={() => handlePurchaseWithPackage(packagesStatus.monthlyPkg as PurchasesPackage | WebPackage | null, 'monthly')}
            >
              <CardContent className="p-4 text-center">
                {isPurchasing ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  <>
                    <p className="font-semibold text-foreground">Monthly</p>
                    <p className="text-lg font-bold text-primary">
                      {packagesStatus.monthlyInfo?.priceString || '$29.99'}
                    </p>
                    <p className="text-xs text-muted-foreground">per month</p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Yearly Plan */}
            <Card 
              className="cursor-pointer hover:border-primary transition-colors border-primary/50"
              onClick={() => handlePurchaseWithPackage(packagesStatus.yearlyPkg as PurchasesPackage | WebPackage | null, 'yearly')}
            >
              <CardContent className="p-4 text-center">
                {isPurchasing ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  <>
                    <p className="font-semibold text-foreground">Annual</p>
                    <p className="text-lg font-bold text-primary">
                      {packagesStatus.yearlyInfo?.priceString || '$239.99'}
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

          {/* Purchase Error Display */}
          {purchaseError && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Purchase Error</AlertTitle>
              <AlertDescription>{purchaseError}</AlertDescription>
            </Alert>
          )}

          {/* Debug: Package Status (only in dev or with ?debug) */}
          {DEBUG_MODE && packagesStatus.hasMisconfiguration && (
            <Alert className="mt-4 border-yellow-500/50 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-600">Configuration Issues Detected</AlertTitle>
              <AlertDescription className="text-yellow-600">
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {packagesStatus.issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs">
                  Check RevenueCat dashboard: Offerings → Packages → Ensure correct product IDs
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Debug Panel */}
          {DEBUG_MODE && (
            <details className="mt-4 text-xs border rounded-lg p-3 bg-muted/50">
              <summary className="cursor-pointer font-medium">Debug Info</summary>
              <div className="mt-2 space-y-2 overflow-auto max-h-48">
                <div><strong>Platform:</strong> {isNative() ? 'Native' : 'Web'}</div>
                <div><strong>Initialized:</strong> {isInitialized ? 'Yes' : 'No'}</div>
                <div><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
                <div><strong>Error:</strong> {error || 'None'}</div>
                <div><strong>Packages count:</strong> {packagesStatus.allPackages.length}</div>
                <div>
                  <strong>Monthly:</strong>{' '}
                  {packagesStatus.monthlyInfo 
                    ? `${packagesStatus.monthlyInfo.identifier} (${packagesStatus.monthlyInfo.priceString})`
                    : 'Not found'}
                </div>
                <div>
                  <strong>Yearly:</strong>{' '}
                  {packagesStatus.yearlyInfo 
                    ? `${packagesStatus.yearlyInfo.identifier} (${packagesStatus.yearlyInfo.priceString})`
                    : 'Not found'}
                </div>
                <div><strong>Expected Monthly ID:</strong> {PRODUCT_IDS.monthly}</div>
                <div><strong>Expected Yearly ID:</strong> {PRODUCT_IDS.yearly}</div>
              </div>
            </details>
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

      {/* RevenueCat Checkout Modal for Web */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-lg max-h-[90vh] overflow-auto relative">
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <h2 className="font-semibold text-lg">Complete Your Purchase</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowCheckoutModal(false);
                  setIsPurchasing(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div 
              ref={checkoutContainerRef} 
              className="p-4 min-h-[400px]"
              id="revenuecat-checkout-container"
            >
              {isPurchasing && (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Loading checkout...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
