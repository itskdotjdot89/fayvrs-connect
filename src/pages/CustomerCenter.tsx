import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RevenueCatUI } from '@revenuecat/purchases-capacitor-ui';
import { CustomerInfo } from '@revenuecat/purchases-capacitor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, CreditCard, RefreshCw, HelpCircle } from 'lucide-react';
import { useRevenueCat, WebCustomerInfo } from '@/hooks/useRevenueCat';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isNative, isWeb, getSubscriptionManagementUrl } from '@/utils/platform';
import { Separator } from '@/components/ui/separator';

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

  // Initialize RevenueCat when component mounts (both native and web now)
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

  const handlePresentCustomerCenter = async () => {
    if (!isNative()) {
      // On web, navigate to settings or open management URL
      navigate('/settings');
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
    const url = getSubscriptionManagementUrl();
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleRestorePurchases = async () => {
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

  // Loading state
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

  // Helper functions to safely access properties that may differ between native and web
  const getActiveSubscriptions = (): string[] => {
    if (!customerInfo) return [];
    if (isNative()) {
      return (customerInfo as CustomerInfo).activeSubscriptions || [];
    }
    // For web, derive from active entitlements
    const webInfo = customerInfo as WebCustomerInfo;
    return Object.keys(webInfo.entitlements.active).map(key => 
      webInfo.entitlements.active[key].productIdentifier
    );
  };

  const getExpirationDate = (): string | null => {
    if (!customerInfo) return null;
    if (isNative()) {
      return (customerInfo as CustomerInfo).latestExpirationDate || null;
    }
    // For web, get from first active entitlement
    const webInfo = customerInfo as WebCustomerInfo;
    const firstEntitlement = Object.values(webInfo.entitlements.active)[0];
    return firstEntitlement?.expirationDate || null;
  };

  const activeSubscriptions = getActiveSubscriptions();
  const expirationDate = getExpirationDate();
  const managementUrl = customerInfo?.managementURL;

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
              Manage in App Store
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
