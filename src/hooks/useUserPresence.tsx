import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserPresence {
  id: string;
  is_online: boolean;
  last_seen: string;
  current_latitude?: number;
  current_longitude?: number;
}

export const useUserPresence = (userId: string | undefined) => {
  const [presence, setPresence] = useState<UserPresence | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    const fetchPresence = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, is_online, last_seen, current_latitude, current_longitude')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setPresence(data);
      }
    };

    fetchPresence();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`presence:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const data = payload.new as UserPresence;
          setPresence(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const getStatusText = () => {
    if (!presence) return '';
    
    if (presence.is_online) {
      return 'Active now';
    }

    if (presence.last_seen) {
      const lastSeen = new Date(presence.last_seen);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / 60000);
      
      if (diffMinutes < 1) return 'Active now';
      if (diffMinutes < 60) return `Active ${diffMinutes}m ago`;
      if (diffMinutes < 1440) return `Active ${Math.floor(diffMinutes / 60)}h ago`;
      return `Active ${Math.floor(diffMinutes / 1440)}d ago`;
    }

    return 'Offline';
  };

  return {
    isOnline: presence?.is_online || false,
    lastSeen: presence?.last_seen,
    currentLocation: presence?.current_latitude && presence?.current_longitude
      ? { latitude: presence.current_latitude, longitude: presence.current_longitude }
      : null,
    statusText: getStatusText(),
  };
};
