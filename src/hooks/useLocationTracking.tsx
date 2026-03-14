import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useLocationTracking = (enabled: boolean = true) => {
  const { user } = useAuth();
  const watchIdRef = useRef<number | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const hasSetProfileLocationRef = useRef(false);

  const updateLocation = useCallback(async (position: GeolocationPosition) => {
    if (!user) return;

    const now = Date.now();
    // Throttle updates to once every 30 seconds
    if (now - lastUpdateRef.current < 30000) return;
    lastUpdateRef.current = now;

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    // Build update payload — always update current location
    const updatePayload: Record<string, any> = {
      current_latitude: lat,
      current_longitude: lng,
      location_updated_at: new Date().toISOString(),
      is_online: true,
      last_seen: new Date().toISOString(),
    };

    // If profile latitude/longitude are not set, auto-populate them from GPS
    // This ensures nearby search RPCs work immediately for new users
    if (!hasSetProfileLocationRef.current) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('latitude, longitude')
        .eq('id', user.id)
        .single();

      if (profile && (profile.latitude === null || profile.longitude === null)) {
        updatePayload.latitude = lat;
        updatePayload.longitude = lng;
      }
      hasSetProfileLocationRef.current = true;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating location:', error);
    }
  }, [user]);

  useEffect(() => {
    if (!user || !enabled) return;

    // Reset the profile location check on each mount
    hasSetProfileLocationRef.current = false;

    const handleError = (error: GeolocationPositionError) => {
      console.warn('Geolocation error:', error.message);
    };

    const geoOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000,
    };

    // Check if geolocation is available
    if ('geolocation' in navigator) {
      // Get initial position
      navigator.geolocation.getCurrentPosition(updateLocation, handleError, geoOptions);

      // Watch position for updates
      watchIdRef.current = navigator.geolocation.watchPosition(
        updateLocation,
        handleError,
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 15000,
        }
      );

      // Heartbeat: update last_seen every 30 seconds
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
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliability on page close
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`;
      const body = JSON.stringify({
        is_online: false,
        last_seen: new Date().toISOString(),
      });
      const headers = {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        'Prefer': 'return=minimal',
      };

      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        // sendBeacon doesn't support custom headers, fall back to fetch
        fetch(url, { method: 'PATCH', headers, body, keepalive: true }).catch(() => {});
      } else {
        fetch(url, { method: 'PATCH', headers, body, keepalive: true }).catch(() => {});
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handleBeforeUnload();
      } else if (document.visibilityState === 'visible') {
        // Re-fetch location when app comes back to foreground
        navigator.geolocation.getCurrentPosition(updateLocation, handleError, geoOptions);
      }
    });

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
  }, [user, enabled, updateLocation]);
};
