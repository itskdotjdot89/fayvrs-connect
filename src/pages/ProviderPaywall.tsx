import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RevenueCatUI, PAYWALL_RESULT } from '@revenuecat/purchases-capacitor-ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, Crown, ArrowLeft, RotateCcw } from 'lucide-react';
import { useRevenueCat, PRODUCT_IDS } from '@/hooks/useRevenueCat';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isNative, isWeb } from '@/utils/platform';

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

  // Initialize RevenueCat when component mounts
  useEffect(() => {
    if (isNative() && user?.id) {
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

  // If on web, redirect to Stripe checkout
  useEffect(() => {
    if (isWeb()) {
      navigate('/provider-checkout');
    }
  }, [navigate]);

  const handlePresentPaywall = async () => {
    try {
      setShowPaywall(true);
      
      // Present the RevenueCat paywall
      const paywallResult = await RevenueCatUI.presentPaywall();
      
      console.log('[ProviderPaywall] Paywall result:', paywallResult);
      
      // Check if purchase was made
      if (paywallResult.result === PAYWALL_RESULT.PURCHASED || paywallResult.result === PAYWALL_RESULT.RESTORED) {
        toast({
          title: "Welcome to Fayvrs Pro!",
          description: "Your subscription is now active.",
        });
        navigate('/feed');
      }
    } catch (error: any) {
      console.error('[ProviderPaywall] Error presenting paywall:', error);
      // User may have cancelled, which is fine
    } finally {
      setShowPaywall(false);
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

    // Find the package by product ID
    const pkg = offerings.current.availablePackages.find(
      p => p.product.identifier === productId
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
  };

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

        {/* CTA - Present Paywall */}
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

        {/* Manual subscription options (fallback) */}
        {offerings?.current && (
          <div className="space-y-3 mb-6">
            <p className="text-sm text-center text-muted-foreground">
              Or select a plan directly:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {offerings.current.availablePackages.map((pkg) => (
                <Card 
                  key={pkg.identifier}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleManualPurchase(pkg.product.identifier)}
                >
                  <CardContent className="p-4 text-center">
                    <p className="font-semibold text-foreground capitalize">
                      {pkg.product.identifier === PRODUCT_IDS.yearly ? 'Yearly' : 'Monthly'}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {pkg.product.priceString}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {pkg.product.identifier === PRODUCT_IDS.yearly ? 'per year' : 'per month'}
                    </p>
                    {pkg.product.identifier === PRODUCT_IDS.yearly && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        Save 33%
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
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
          <p>
            Subscriptions will be charged to your Apple ID account at confirmation of purchase.
          </p>
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
