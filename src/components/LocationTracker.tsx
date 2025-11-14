import { useEffect } from 'react';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useAuth } from '@/contexts/AuthContext';

export const LocationTracker = () => {
  const { user, loading, userRoles } = useAuth();
  const shouldTrack = user && !loading && userRoles.includes('provider');
  
  // Only enable location tracking for providers after auth completes
  useLocationTracking(shouldTrack);
  
  return null;
};
