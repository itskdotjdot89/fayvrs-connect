import { useState, useEffect, useCallback, useRef } from 'react';
import { Purchases, LOG_LEVEL, PurchasesOfferings, CustomerInfo, PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { isNative } from '@/utils/platform';

// RevenueCat configuration
const REVENUECAT_API_KEY = 'test_gCfXtDhlnIpvuRkUHaiDhCwdhwc';
const ENTITLEMENT_ID = 'Fayvrs Pro';

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
   * Initialize RevenueCat SDK
   */
  const initialize = useCallback(async (userId?: string) => {
    // Only run on native platforms
    if (!isNative()) {
      console.log('[RevenueCat] Not a native platform, skipping initialization');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Configure the SDK
      await Purchases.configure({
        apiKey: REVENUECAT_API_KEY,
        appUserID: userId,
      });

      // Set log level for debugging
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

      // Get initial customer info
      const { customerInfo } = await Purchases.getCustomerInfo();
      const isProSubscriber = !!customerInfo.entitlements.active[ENTITLEMENT_ID];

      // Get offerings
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

      console.log('[RevenueCat] Initialized successfully', {
        userId: customerInfo.originalAppUserId,
        isProSubscriber,
        hasOfferings: !!offerings?.current,
      });
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
    if (!isNative()) return;

    try {
      const { customerInfo } = await Purchases.logIn({ appUserID: userId });
      const isProSubscriber = !!customerInfo.entitlements.active[ENTITLEMENT_ID];

      setState(prev => ({
        ...prev,
        customerInfo,
        isProSubscriber,
      }));

      console.log('[RevenueCat] User identified:', userId);
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
  const purchasePackage = useCallback(async (pkg: PurchasesPackage): Promise<{ success: boolean; error?: string }> => {
    if (!isNative()) {
      return { success: false, error: 'Purchases only available on native platforms' };
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
      const isProSubscriber = !!customerInfo.entitlements.active[ENTITLEMENT_ID];

      setState(prev => ({
        ...prev,
        isLoading: false,
        customerInfo,
        isProSubscriber,
      }));

      console.log('[RevenueCat] Purchase successful');
      return { success: true };
    } catch (error: any) {
      console.error('[RevenueCat] Purchase error:', error);
      
      // Handle user cancellation
      if (error.code === 'PURCHASE_CANCELLED') {
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
    if (!isNative()) {
      return { success: false, error: 'Restore only available on native platforms' };
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { customerInfo } = await Purchases.restorePurchases();
      const isProSubscriber = !!customerInfo.entitlements.active[ENTITLEMENT_ID];

      setState(prev => ({
        ...prev,
        isLoading: false,
        customerInfo,
        isProSubscriber,
      }));

      console.log('[RevenueCat] Restore successful, isProSubscriber:', isProSubscriber);
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
   * Check if user has active entitlements
   */
  const checkEntitlements = useCallback(async (): Promise<boolean> => {
    if (!isNative()) {
      return false;
    }

    try {
      const { customerInfo } = await Purchases.getCustomerInfo();
      const isProSubscriber = !!customerInfo.entitlements.active[ENTITLEMENT_ID];

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
   * Get available offerings
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
   * Logout from RevenueCat
   */
  const logout = useCallback(async () => {
    if (!isNative()) return;

    try {
      const { customerInfo } = await Purchases.logOut();
      setState(prev => ({
        ...prev,
        customerInfo,
        isProSubscriber: false,
      }));
      console.log('[RevenueCat] Logged out');
    } catch (error: any) {
      console.error('[RevenueCat] Logout error:', error);
    }
  }, []);

  /**
   * Set up customer info listener
   */
  const listenerIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isNative()) return;

    const setupListener = async () => {
      try {
        // Listen for customer info updates
        const listenerId = await Purchases.addCustomerInfoUpdateListener((customerInfo) => {
          const isProSubscriber = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
          setState(prev => ({
            ...prev,
            customerInfo,
            isProSubscriber,
          }));
          console.log('[RevenueCat] Customer info updated, isProSubscriber:', isProSubscriber);
        });
        listenerIdRef.current = listenerId;
      } catch (error) {
        console.error('[RevenueCat] Failed to add listener:', error);
      }
    };

    setupListener();

    return () => {
      // Cleanup listener on unmount
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
