import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useLocationTracking = () => {
  const { user } = useAuth();
  const watchIdRef = useRef<number | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!user) return;

    const updateLocation = async (position: GeolocationPosition) => {
      const now = Date.now();
      // Throttle updates to once every 30 seconds
      if (now - lastUpdateRef.current < 30000) return;
      
      lastUpdateRef.current = now;

      const { error } = await supabase
        .from('profiles')
        .update({
          current_latitude: position.coords.latitude,
          current_longitude: position.coords.longitude,
          location_updated_at: new Date().toISOString(),
          is_online: true,
          last_seen: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating location:', error);
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      console.error('Geolocation error:', error);
    };

    // Check if geolocation is available
    if ('geolocation' in navigator) {
      // Get initial position
      navigator.geolocation.getCurrentPosition(
        updateLocation,
        handleError,
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 30000,
        }
      );

      // Watch position for updates
      watchIdRef.current = navigator.geolocation.watchPosition(
        updateLocation,
        handleError,
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 30000,
        }
      );

      // Update last_seen every 30 seconds to show active status
      updateIntervalRef.current = setInterval(async () => {
        await supabase
          .from('profiles')
          .update({
            is_online: true,
            last_seen: new Date().toISOString(),
          })
          .eq('id', user.id);
      }, 30000);
    }

    // Set user as offline when they leave
    const handleBeforeUnload = async () => {
      await supabase
        .from('profiles')
        .update({
          is_online: false,
          last_seen: new Date().toISOString(),
        })
        .eq('id', user.id);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Mark user as offline on cleanup
      supabase
        .from('profiles')
        .update({
          is_online: false,
          last_seen: new Date().toISOString(),
        })
        .eq('id', user.id);
    };
  }, [user]);
};
