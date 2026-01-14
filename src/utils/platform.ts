import { Capacitor } from '@capacitor/core';

/**
 * Platform detection utilities for handling native vs web functionality
 */

export const isNative = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const isIOS = (): boolean => {
  return Capacitor.getPlatform() === 'ios';
};

export const isAndroid = (): boolean => {
  return Capacitor.getPlatform() === 'android';
};

export const isWeb = (): boolean => {
  return Capacitor.getPlatform() === 'web';
};

export const getPlatform = (): 'ios' | 'android' | 'web' => {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
};

/**
 * Get the appropriate subscription management URL based on platform
 */
export const getSubscriptionManagementUrl = (): string | null => {
  if (isIOS()) {
    return 'https://apps.apple.com/account/subscriptions';
  }
  if (isAndroid()) {
    return 'https://play.google.com/store/account/subscriptions';
  }
  return null; // Web uses RevenueCat subscription management
};
