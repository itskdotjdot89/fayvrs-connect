import { useState, useEffect, useCallback, useRef } from 'react';
import { Purchases, LOG_LEVEL, PurchasesOfferings, CustomerInfo, PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { isNative } from '@/utils/platform';
import { supabase } from '@/integrations/supabase/client';

// RevenueCat configuration
const ENTITLEMENT_ID = 'Fayvrs Pro';

// Cached API key
let cachedNativeApiKey: string | null = null;

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

// Product identifiers
export const PRODUCT_IDS = {
  monthly: 'monthly',
  yearly: 'yearly',
} as const;

export interface RevenueCatState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOfferings | null;
  isProSubscriber: boolean;
}

export interface UseRevenueCatReturn extends RevenueCatState {
  initialize: (userId?: string) => Promise<void>;
  identifyUser: (userId: string) => Promise<void>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<{ success: boolean; error?: string }>;
  restorePurchases: () => Promise<{ success: boolean; error?: string }>;
  checkEntitlements: () => Promise<boolean>;
  getOfferings: () => Promise<PurchasesOfferings | null>;
  logout: () => Promise<void>;
}

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
  const hasProEntitlement = (customerInfo: CustomerInfo | null): boolean => {
    if (!customerInfo) return false;
    return !!customerInfo.entitlements.active[ENTITLEMENT_ID];
  };

  /**
   * Initialize RevenueCat SDK (native only - web shows download prompt)
   */
  const initialize = useCallback(async (userId?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    // Platform detection logging for debugging
    const platformInfo = {
      isNative: isNative(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    };
    console.log('[RevenueCat] Platform detection:', platformInfo);

    try {
      if (isNative()) {
        // Native initialization - uses Apple StoreKit / Google Play Billing
        console.log('[RevenueCat Native] Fetching API key for StoreKit...');
        
        // Clear cache to ensure fresh key fetch (debugging)
        cachedNativeApiKey = null;
        const nativeApiKey = await fetchNativeApiKey();
        
        // Log API key prefix to verify it's the correct type
        const keyPrefix = nativeApiKey?.substring(0, 5) || 'null';
        console.log('[RevenueCat Native] API key prefix:', keyPrefix);
        console.log('[RevenueCat Native] Expected prefix for iOS: "appl_", for Android: "goog_"');
        
        if (keyPrefix.startsWith('rcb_')) {
          console.error('[RevenueCat Native] ERROR: Web Billing key detected! This will cause StoreKit to fail.');
          console.error('[RevenueCat Native] Please update REVENUECAT_NATIVE_API_KEY with an Apple App Store key (appl_xxx)');
        }
        
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

        console.log('[RevenueCat Native] Configuring with native SDK...');
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
          packageCount: offerings?.current?.availablePackages?.length || 0,
        });
      } else {
        // Web: Subscriptions are iOS-only
        console.log('[RevenueCat Web] Subscriptions only available on iOS app');
        setState({
          isInitialized: true,
          isLoading: false,
          error: null,
          customerInfo: null,
          offerings: null,
          isProSubscriber: false,
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
   * Identify user with RevenueCat (link to Supabase user ID) - Native only
   */
  const identifyUser = useCallback(async (userId: string) => {
    if (!isNative()) {
      console.log('[RevenueCat Web] Skipping identify - subscriptions only on iOS');
      return;
    }

    try {
      const { customerInfo } = await Purchases.logIn({ appUserID: userId });
      const isProSubscriber = hasProEntitlement(customerInfo);

      setState(prev => ({
        ...prev,
        customerInfo,
        isProSubscriber,
      }));

      console.log('[RevenueCat Native] User identified:', userId);
    } catch (error: any) {
      console.error('[RevenueCat] Login error:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to identify user',
      }));
    }
  }, []);

  /**
   * Purchase a package - Native only (iOS StoreKit / Android Play Billing)
   */
  const purchasePackage = useCallback(async (pkg: PurchasesPackage): Promise<{ success: boolean; error?: string }> => {
    if (!isNative()) {
      return { success: false, error: 'Subscriptions are only available on the iOS app' };
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
      const isProSubscriber = hasProEntitlement(customerInfo);

      setState(prev => ({
        ...prev,
        isLoading: false,
        customerInfo,
        isProSubscriber,
      }));

      console.log('[RevenueCat Native] Purchase successful');
      return { success: true };
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
   * Restore previous purchases - Native only
   */
  const restorePurchases = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!isNative()) {
      return { success: false, error: 'Subscriptions are only available on the iOS app' };
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
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
   * Check if user has active entitlements - Native only
   */
  const checkEntitlements = useCallback(async (): Promise<boolean> => {
    if (!isNative()) {
      return false;
    }

    try {
      const { customerInfo } = await Purchases.getCustomerInfo();
      const isProSubscriber = hasProEntitlement(customerInfo);

      setState(prev => ({
        ...prev,
        customerInfo,
        isProSubscriber,
      }));

      return isProSubscriber;
    } catch (error: any) {
      console.error('[RevenueCat] Check entitlements error:', error);
      return false;
    }
  }, []);

  /**
   * Get available offerings - Native only
   */
  const getOfferings = useCallback(async (): Promise<PurchasesOfferings | null> => {
    if (!isNative()) {
      return null;
    }

    try {
      const offeringsResult = await Purchases.getOfferings();
      const offerings = offeringsResult as PurchasesOfferings;
      setState(prev => ({ ...prev, offerings }));
      return offerings;
    } catch (error: any) {
      console.error('[RevenueCat] Get offerings error:', error);
      return null;
    }
  }, []);

  /**
   * Logout from RevenueCat - Native only
   */
  const logout = useCallback(async () => {
    if (!isNative()) {
      return;
    }

    try {
      const { customerInfo } = await Purchases.logOut();
      setState(prev => ({
        ...prev,
        customerInfo,
        isProSubscriber: false,
      }));
      console.log('[RevenueCat Native] Logged out');
    } catch (error: any) {
      console.error('[RevenueCat] Logout error:', error);
    }
  }, []);

  /**
   * Set up customer info listener (native only)
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
