import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useRevenueCat } from '@/hooks/useRevenueCat';

/**
 * Provider Access Hook
 * 
 * APPLE APP STORE COMPLIANCE (Guideline 5.1.1):
 * - Identity verification is OPTIONAL for basic provider actions
 * - Verification is only required for:
 *   1. High-value jobs (configurable threshold, e.g., $200+)
 *   2. Requesting payouts / connecting payout account
 *   3. Enabling "Verified Provider" badge
 * 
 * This hook provides granular access checks for different scenarios.
 */

// Configurable threshold for high-value jobs requiring verification
const HIGH_VALUE_JOB_THRESHOLD = 200;

export const useProviderAccess = () => {
  const { user, subscriptionStatus } = useAuth();
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // RevenueCat is the source of truth for entitlements on both web + native.
  // The backend "check-subscription" is best-effort, but can legitimately fail to map
  // a billing account back to a user (e.g., missing Stripe email).
  const { isInitialized, isProSubscriber, initialize, identifyUser } = useRevenueCat();

  useEffect(() => {
    if (user?.id) {
      initialize(user.id);
    }
  }, [user?.id, initialize]);

  useEffect(() => {
    if (isInitialized && user?.id) {
      identifyUser(user.id);
    }
  }, [isInitialized, user?.id, identifyUser]);
  
  useEffect(() => {
    const checkVerification = async () => {
      if (!user) {
        setIsVerified(false);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_verified')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error checking verification:', error);
        setIsVerified(false);
      } else {
        setIsVerified(data?.is_verified || false);
      }
      setLoading(false);
    };
    
    checkVerification();
  }, [user]);

  const subscribed = !!(user && (isProSubscriber || subscriptionStatus?.subscribed));
  
  // Basic provider access: user + subscription (verification NOT required)
  const hasBasicProviderAccess = subscribed;

  // Full provider access: includes verification (for high-value actions)
  const hasFullProviderAccess = !!(
    user && 
    isVerified && 
    subscribed
  );

  // Check if a specific job value requires verification
  const requiresVerificationForJob = (jobValue?: number) => {
    if (!jobValue) return false;
    return jobValue >= HIGH_VALUE_JOB_THRESHOLD;
  };

  // Check if user can accept a specific job
  const canAcceptJob = (jobValue?: number) => {
    if (!hasBasicProviderAccess) return false;
    if (requiresVerificationForJob(jobValue) && !isVerified) return false;
    return true;
  };

  // Actions that ALWAYS require verification
  const canRequestPayout = isVerified && subscribed;
  const canEnableVerifiedBadge = isVerified;
  
  const missingRequirements = {
    needsAuth: !user,
    needsSubscription: user && !subscribed,
    // Verification is now optional for basic access
    needsVerification: false, // Changed from: user && !isVerified
    // New granular checks
    needsVerificationForPayout: user && subscribed && !isVerified,
    needsVerificationForHighValue: (jobValue?: number) => 
      user && subscribed && requiresVerificationForJob(jobValue) && !isVerified,
  };
  
  return { 
    // Basic access for proposals (verification optional)
    hasProviderAccess: hasBasicProviderAccess,
    // Full access including verification
    hasFullProviderAccess,
    loading,
    isVerified,
    isSubscribed: subscribed,
    missingRequirements,
    // Granular permission checks
    canAcceptJob,
    canRequestPayout,
    canEnableVerifiedBadge,
    requiresVerificationForJob,
    HIGH_VALUE_JOB_THRESHOLD,
  };
};
