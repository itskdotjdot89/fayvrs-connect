import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useProviderAccess = () => {
  const { user, subscriptionStatus } = useAuth();
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  
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
  
  const hasProviderAccess = !!(
    user && 
    isVerified && 
    subscriptionStatus?.subscribed
  );
  
  const missingRequirements = {
    needsAuth: !user,
    needsVerification: user && !isVerified,
    needsSubscription: user && isVerified && !subscriptionStatus?.subscribed,
  };
  
  return { 
    hasProviderAccess, 
    loading,
    isVerified,
    isSubscribed: subscriptionStatus?.subscribed || false,
    missingRequirements
  };
};
