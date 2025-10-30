import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LocationUpdate {
  userId: string;
  currentLatitude: number | null;
  currentLongitude: number | null;
  profileLatitude: number | null;
  profileLongitude: number | null;
  isOnline: boolean;
  lastUpdated: string | null;
}

export const useRealtimeLocation = (userIds: string[]) => {
  const [locations, setLocations] = useState<Map<string, LocationUpdate>>(new Map());

  useEffect(() => {
    if (userIds.length === 0) return;

    // Fetch initial locations
    const fetchInitialLocations = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, current_latitude, current_longitude, latitude, longitude, is_online, location_updated_at')
        .in('id', userIds);

      if (data) {
        const newLocations = new Map<string, LocationUpdate>();
        data.forEach(profile => {
          newLocations.set(profile.id, {
            userId: profile.id,
            currentLatitude: profile.current_latitude,
            currentLongitude: profile.current_longitude,
            profileLatitude: profile.latitude,
            profileLongitude: profile.longitude,
            isOnline: profile.is_online || false,
            lastUpdated: profile.location_updated_at,
          });
        });
        setLocations(newLocations);
      }
    };

    fetchInitialLocations();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('location-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=in.(${userIds.join(',')})`,
        },
        (payload) => {
          const updated = payload.new as {
            id: string;
            current_latitude: number | null;
            current_longitude: number | null;
            latitude: number | null;
            longitude: number | null;
            is_online: boolean;
            location_updated_at: string | null;
          };

          setLocations(prev => {
            const newMap = new Map(prev);
            const existing = newMap.get(updated.id);
            
            // Only update if coordinates actually changed (>10 meters)
            const shouldUpdate = !existing || 
              Math.abs((existing.currentLatitude || 0) - (updated.current_latitude || 0)) > 0.0001 ||
              Math.abs((existing.currentLongitude || 0) - (updated.current_longitude || 0)) > 0.0001;

            if (shouldUpdate) {
              newMap.set(updated.id, {
                userId: updated.id,
                currentLatitude: updated.current_latitude,
                currentLongitude: updated.current_longitude,
                profileLatitude: updated.latitude,
                profileLongitude: updated.longitude,
                isOnline: updated.is_online,
                lastUpdated: updated.location_updated_at,
              });
            } else if (existing) {
              // Update online status even if location didn't change
              newMap.set(updated.id, {
                ...existing,
                isOnline: updated.is_online,
              });
            }

            return newMap;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userIds.join(',')]);

  return locations;
};
