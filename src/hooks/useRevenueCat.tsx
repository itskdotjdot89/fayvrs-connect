import { useState, useEffect, useCallback, useRef } from 'react';
import { Purchases, LOG_LEVEL, PurchasesOfferings, CustomerInfo, PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { Purchases as PurchasesWebClass } from '@revenuecat/purchases-js';
import { isNative } from '@/utils/platform';
import { supabase } from '@/integrations/supabase/client';

// RevenueCat configuration
const ENTITLEMENT_ID = 'Fayvrs Pro';

// Cached API keys
let cachedWebApiKey: string | null = null;
let cachedNativeApiKey: string | null = null;

// Fetch web API key from edge function
const fetchWebApiKey = async (): Promise<string | null> => {
  if (cachedWebApiKey) return cachedWebApiKey;
  
  try {
    const { data, error } = await supabase.functions.invoke('get-revenuecat-web-key');
    if (error) {
      console.error('[RevenueCat] Failed to fetch web API key:', error);
      return null;
    }
    cachedWebApiKey = data?.apiKey || null;
    return cachedWebApiKey;
  } catch (err) {
    console.error('[RevenueCat] Error fetching web API key:', err);
    return null;
  }
};

// Fetch native API key from edge function
const fetchNativeApiKey = async (): Promise<string | null> => {
  if (cachedNativeApiKey) return cachedNativeApiKey;
  
  try {
    const { data, error } = await supabase.functions.invoke('get-revenuecat-native-key');
    if (error) {
      console.error('[RevenueCat] Failed to fetch native API key:', error);
      return null;
    }
    cachedNativeApiKey = data?.apiKey || null;
    return cachedNativeApiKey;
  } catch (err) {
    console.error('[RevenueCat] Error fetching native API key:', err);
    return null;
  }
};

// Check if web API key is configured
export const isWebApiKeyConfigured = async (): Promise<boolean> => {
  const apiKey = await fetchWebApiKey();
  return !!apiKey;
};

// Product identifiers
export const PRODUCT_IDS = {
  monthly: 'monthly',
  yearly: 'yearly',
} as const;

// Web-compatible types that match the shape of native types
export interface WebCustomerInfo {
  entitlements: {
    active: Record<string, {
      identifier: string;
      isActive: boolean;
      willRenew: boolean;
      periodType: string;
      latestPurchaseDate: string;
      originalPurchaseDate: string;
      expirationDate: string | null;
      productIdentifier: string;
      isSandbox: boolean;
      unsubscribeDetectedAt: string | null;
      billingIssueDetectedAt: string | null;
    }>;
    all: Record<string, any>;
  };
  activeSubscriptions?: string[];
  originalAppUserId: string;
  managementURL: string | null;
  latestExpirationDate?: string | null;
  firstSeen: string;
}

export interface WebPackage {
  identifier: string;
  packageType: string;
  rcBillingProduct: {
    identifier: string;
    displayName: string;
    currentPrice: {
      amountMicros: number;
      currency: string;
      formattedPrice: string;
    };
    normalPeriodDuration: string | null;
  };
}

export interface WebOfferings {
  current: {
    identifier: string;
    availablePackages: WebPackage[];
  } | null;
  all: Record<string, any>;
}

export interface RevenueCatState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  customerInfo: CustomerInfo | WebCustomerInfo | null;
  offerings: PurchasesOfferings | WebOfferings | null;
  isProSubscriber: boolean;
}

export interface UseRevenueCatReturn extends RevenueCatState {
  initialize: (userId?: string) => Promise<void>;
  identifyUser: (userId: string) => Promise<void>;
  purchasePackage: (pkg: PurchasesPackage | WebPackage) => Promise<{ success: boolean; error?: string }>;
  restorePurchases: () => Promise<{ success: boolean; error?: string }>;
  checkEntitlements: () => Promise<boolean>;
  getOfferings: () => Promise<PurchasesOfferings | WebOfferings | null>;
  logout: () => Promise<void>;
}

// Type for the web purchases instance
type WebPurchasesInstance = ReturnType<typeof PurchasesWebClass.configure>;

// Store web purchases instance
let webPurchasesInstance: WebPurchasesInstance | null = null;

export const useRevenueCat = (): UseRevenueCatReturn => {
  const [state, setState] = useState<RevenueCatState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    customerInfo: null,
    offerings: null,
    isProSubscriber: false,
  });

  /**
   * Helper to check if user has pro entitlement
   */
  const hasProEntitlement = (customerInfo: CustomerInfo | WebCustomerInfo | null): boolean => {
    if (!customerInfo) return false;
    return !!customerInfo.entitlements.active[ENTITLEMENT_ID];
  };

  /**
   * Initialize RevenueCat SDK (works on both native and web)
   */
  const initialize = useCallback(async (userId?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (isNative()) {
        // Native initialization
        console.log('[RevenueCat Native] Fetching API key...');
        const nativeApiKey = await fetchNativeApiKey();
        
        if (!nativeApiKey) {
          console.warn('[RevenueCat Native] API key not configured - subscriptions will not work');
          setState({
            isInitialized: true,
            isLoading: false,
            error: 'RevenueCat Native API key not configured. Please set up your RevenueCat API key.',
            customerInfo: null,
            offerings: null,
            isProSubscriber: false,
          });
          return;
        }

        await Purchases.configure({
          apiKey: nativeApiKey,
          appUserID: userId,
        });

        await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

        const { customerInfo } = await Purchases.getCustomerInfo();
        const isProSubscriber = hasProEntitlement(customerInfo);

        const offeringsResult = await Purchases.getOfferings();
        const offerings = offeringsResult as PurchasesOfferings;
        
        setState({
          isInitialized: true,
          isLoading: false,
          error: null,
          customerInfo,
          offerings,
          isProSubscriber,
        });

        console.log('[RevenueCat Native] Initialized successfully', {
          userId: customerInfo.originalAppUserId,
          isProSubscriber,
          hasOfferings: !!offerings?.current,
        });
      } else {
        // Web initialization
        console.log('[RevenueCat Web] Fetching API key...');
        const webApiKey = await fetchWebApiKey();
        
        if (!webApiKey) {
          console.warn('[RevenueCat Web] API key not configured - subscriptions will not work');
          setState({
            isInitialized: true,
            isLoading: false,
            error: 'RevenueCat Web API key not configured. Please set up your RevenueCat Web Billing API key.',
            customerInfo: null,
            offerings: null,
            isProSubscriber: false,
          });
          return;
        }

        console.log('[RevenueCat Web] Initializing...');
        
        webPurchasesInstance = PurchasesWebClass.configure(
          webApiKey,
          userId || 'anonymous'
        );

        const customerInfo = await webPurchasesInstance.getCustomerInfo();
        const isProSubscriber = hasProEntitlement(customerInfo as unknown as WebCustomerInfo);

        const offerings = await webPurchasesInstance.getOfferings();
        
        setState({
          isInitialized: true,
          isLoading: false,
          error: null,
          customerInfo: customerInfo as unknown as WebCustomerInfo,
          offerings: offerings as unknown as WebOfferings,
          isProSubscriber,
        });

        console.log('[RevenueCat Web] Initialized successfully', {
          userId: customerInfo.originalAppUserId,
          isProSubscriber,
          hasOfferings: !!offerings?.current,
        });
      }
    } catch (error: any) {
      console.error('[RevenueCat] Initialization error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to initialize RevenueCat',
      }));
    }
  }, []);

  /**
   * Identify user with RevenueCat (link to Supabase user ID)
   */
  const identifyUser = useCallback(async (userId: string) => {
    try {
      if (isNative()) {
        const { customerInfo } = await Purchases.logIn({ appUserID: userId });
        const isProSubscriber = hasProEntitlement(customerInfo);

        setState(prev => ({
          ...prev,
          customerInfo,
          isProSubscriber,
        }));

        console.log('[RevenueCat Native] User identified:', userId);
      } else if (webPurchasesInstance) {
        const customerInfo = await webPurchasesInstance.changeUser(userId);
        const isProSubscriber = hasProEntitlement(customerInfo as unknown as WebCustomerInfo);

        setState(prev => ({
          ...prev,
          customerInfo: customerInfo as unknown as WebCustomerInfo,
          isProSubscriber,
        }));

        console.log('[RevenueCat Web] User identified:', userId);
      }
    } catch (error: any) {
      console.error('[RevenueCat] Login error:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to identify user',
      }));
    }
  }, []);

  /**
   * Purchase a package
   */
  const purchasePackage = useCallback(async (pkg: PurchasesPackage | WebPackage): Promise<{ success: boolean; error?: string }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (isNative()) {
        const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg as PurchasesPackage });
        const isProSubscriber = hasProEntitlement(customerInfo);

        setState(prev => ({
          ...prev,
          isLoading: false,
          customerInfo,
          isProSubscriber,
        }));

        console.log('[RevenueCat Native] Purchase successful');
        return { success: true };
      } else if (webPurchasesInstance) {
        const webPkg = pkg as WebPackage;
        const { customerInfo } = await webPurchasesInstance.purchase({ rcPackage: webPkg as any });
        const isProSubscriber = hasProEntitlement(customerInfo as unknown as WebCustomerInfo);

        setState(prev => ({
          ...prev,
          isLoading: false,
          customerInfo: customerInfo as unknown as WebCustomerInfo,
          isProSubscriber,
        }));

        console.log('[RevenueCat Web] Purchase successful');
        return { success: true };
      }
      
      return { success: false, error: 'RevenueCat not initialized' };
    } catch (error: any) {
      console.error('[RevenueCat] Purchase error:', error);
      
      // Handle user cancellation
      if (error.code === 'PURCHASE_CANCELLED' || error.message?.includes('cancelled')) {
        setState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: 'Purchase was cancelled' };
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Purchase failed',
      }));
      
      return { success: false, error: error.message || 'Purchase failed' };
    }
  }, []);

  /**
   * Restore previous purchases
   */
  const restorePurchases = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (isNative()) {
        const { customerInfo } = await Purchases.restorePurchases();
        const isProSubscriber = hasProEntitlement(customerInfo);

        setState(prev => ({
          ...prev,
          isLoading: false,
          customerInfo,
          isProSubscriber,
        }));

        console.log('[RevenueCat Native] Restore successful, isProSubscriber:', isProSubscriber);
        return { success: true };
      } else if (webPurchasesInstance) {
        // Web SDK doesn't have restorePurchases - get current customer info instead
        const customerInfo = await webPurchasesInstance.getCustomerInfo();
        const isProSubscriber = hasProEntitlement(customerInfo as unknown as WebCustomerInfo);

        setState(prev => ({
          ...prev,
          isLoading: false,
          customerInfo: customerInfo as unknown as WebCustomerInfo,
          isProSubscriber,
        }));

        console.log('[RevenueCat Web] Restore successful, isProSubscriber:', isProSubscriber);
        return { success: true };
      }
      
      return { success: false, error: 'RevenueCat not initialized' };
    } catch (error: any) {
      console.error('[RevenueCat] Restore error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Restore failed',
      }));
      return { success: false, error: error.message || 'Restore failed' };
    }
  }, []);

  /**
   * Check if user has active entitlements
   */
  const checkEntitlements = useCallback(async (): Promise<boolean> => {
    try {
      if (isNative()) {
        const { customerInfo } = await Purchases.getCustomerInfo();
        const isProSubscriber = hasProEntitlement(customerInfo);

        setState(prev => ({
          ...prev,
          customerInfo,
          isProSubscriber,
        }));

        return isProSubscriber;
      } else if (webPurchasesInstance) {
        const customerInfo = await webPurchasesInstance.getCustomerInfo();
        const isProSubscriber = hasProEntitlement(customerInfo as unknown as WebCustomerInfo);

        setState(prev => ({
          ...prev,
          customerInfo: customerInfo as unknown as WebCustomerInfo,
          isProSubscriber,
        }));

        return isProSubscriber;
      }
      
      return false;
    } catch (error: any) {
      console.error('[RevenueCat] Check entitlements error:', error);
      return false;
    }
  }, []);

  /**
   * Get available offerings
   */
  const getOfferings = useCallback(async (): Promise<PurchasesOfferings | WebOfferings | null> => {
    try {
      if (isNative()) {
        const offeringsResult = await Purchases.getOfferings();
        const offerings = offeringsResult as PurchasesOfferings;
        setState(prev => ({ ...prev, offerings }));
        return offerings;
      } else if (webPurchasesInstance) {
        const offerings = await webPurchasesInstance.getOfferings();
        setState(prev => ({ ...prev, offerings: offerings as unknown as WebOfferings }));
        return offerings as unknown as WebOfferings;
      }
      
      return null;
    } catch (error: any) {
      console.error('[RevenueCat] Get offerings error:', error);
      return null;
    }
  }, []);

  /**
   * Logout from RevenueCat
   */
  const logout = useCallback(async () => {
    try {
      if (isNative()) {
        const { customerInfo } = await Purchases.logOut();
        setState(prev => ({
          ...prev,
          customerInfo,
          isProSubscriber: false,
        }));
        console.log('[RevenueCat Native] Logged out');
      } else if (webPurchasesInstance) {
        // Web SDK doesn't have logOut - reset state manually
        webPurchasesInstance = null;
        setState(prev => ({
          ...prev,
          customerInfo: null,
          isProSubscriber: false,
          isInitialized: false,
        }));
        console.log('[RevenueCat Web] Logged out');
      }
    } catch (error: any) {
      console.error('[RevenueCat] Logout error:', error);
    }
  }, []);

  /**
   * Set up customer info listener (native only - web uses polling or re-fetch)
   */
  const listenerIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isNative()) return;

    const setupListener = async () => {
      try {
        const listenerId = await Purchases.addCustomerInfoUpdateListener((customerInfo) => {
          const isProSubscriber = hasProEntitlement(customerInfo);
          setState(prev => ({
            ...prev,
            customerInfo,
            isProSubscriber,
          }));
          console.log('[RevenueCat Native] Customer info updated, isProSubscriber:', isProSubscriber);
        });
        listenerIdRef.current = listenerId;
      } catch (error) {
        console.error('[RevenueCat] Failed to add listener:', error);
      }
    };

    setupListener();

    return () => {
      if (listenerIdRef.current) {
        Purchases.removeCustomerInfoUpdateListener({ listenerToRemove: listenerIdRef.current });
      }
    };
  }, []);

  return {
    ...state,
    initialize,
    identifyUser,
    purchasePackage,
    restorePurchases,
    checkEntitlements,
    getOfferings,
    logout,
  };
};

export default useRevenueCat;
