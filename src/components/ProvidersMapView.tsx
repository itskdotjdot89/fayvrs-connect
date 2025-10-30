import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Provider {
  provider_id: string;
  provider_name: string;
  provider_bio?: string;
  provider_location?: string;
  distance_miles: number;
  latitude: number;
  longitude: number;
  service_radius: number;
  is_verified: boolean;
  specialties: string[];
}

interface ProvidersMapViewProps {
  providers: Provider[];
  requesterLatitude: number;
  requesterLongitude: number;
  currentLatitude?: number;
  currentLongitude?: number;
  searchRadius: number;
}

const SPECIALTY_COLORS: Record<string, string> = {
  'Home Repair': '#ef4444',
  'Cleaning': '#3b82f6',
  'Moving': '#f59e0b',
  'Pet Care': '#8b5cf6',
  'Tutoring': '#10b981',
  'Event Services': '#ec4899',
  'default': '#6366f1'
};

export const ProvidersMapView = ({ 
  providers, 
  requesterLatitude, 
  requesterLongitude,
  currentLatitude,
  currentLongitude,
  searchRadius 
}: ProvidersMapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const navigate = useNavigate();
  const [onlineProviders, setOnlineProviders] = useState<Set<string>>(new Set());
  const currentMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Use current location if available, otherwise fall back to profile location
  const displayLatitude = currentLatitude || requesterLatitude;
  const displayLongitude = currentLongitude || requesterLongitude;

  // Subscribe to online status updates
  useEffect(() => {
    const providerIds = providers.map(p => p.provider_id);
    if (providerIds.length === 0) return;

    const channel = supabase
      .channel('providers-presence')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          const data = payload.new as { id: string; is_online: boolean };
          setOnlineProviders(prev => {
            const newSet = new Set(prev);
            if (data.is_online) {
              newSet.add(data.id);
            } else {
              newSet.delete(data.id);
            }
            return newSet;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [providers]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [displayLongitude, displayLatitude],
      zoom: 11,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;

      // Add search radius circle (centered on profile location)
      const radiusInMeters = searchRadius * 1609.34; // Convert miles to meters
      const radiusGeoJSON = createCircle([requesterLongitude, requesterLatitude], radiusInMeters);

      map.current.addSource('search-radius', {
        type: 'geojson',
        data: radiusGeoJSON
      });

      map.current.addLayer({
        id: 'search-radius-fill',
        type: 'fill',
        source: 'search-radius',
        paint: {
          'fill-color': 'hsl(var(--primary))',
          'fill-opacity': 0.1
        }
      });

      map.current.addLayer({
        id: 'search-radius-line',
        type: 'line',
        source: 'search-radius',
        paint: {
          'line-color': 'hsl(var(--primary))',
          'line-width': 2,
          'line-opacity': 0.5,
          'line-dasharray': [2, 2]
        }
      });

      // Add current location marker (pulsing green dot for requester)
      const currentLocationEl = document.createElement('div');
      currentLocationEl.className = 'current-location-marker';
      currentLocationEl.style.cssText = `
        background: linear-gradient(135deg, #10b981, #059669);
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 rgba(16, 185, 129, 0.4);
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        cursor: pointer;
      `;

      currentMarkerRef.current = new mapboxgl.Marker({ element: currentLocationEl })
        .setLngLat([displayLongitude, displayLatitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <strong class="text-green-600">You Are Here</strong>
                ${currentLatitude ? '<p class="text-xs text-green-600 mt-1">● Live tracking active</p>' : '<p class="text-xs text-muted-foreground mt-1">Using profile location</p>'}
              </div>
            `)
        )
        .addTo(map.current);

      // Add profile location marker (if different from current)
      if (currentLatitude && currentLongitude && 
          (Math.abs(currentLatitude - requesterLatitude) > 0.001 || 
           Math.abs(currentLongitude - requesterLongitude) > 0.001)) {
        const profileLocationEl = document.createElement('div');
        profileLocationEl.className = 'profile-location-marker';
        profileLocationEl.style.cssText = `
          background-color: hsl(var(--primary));
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid white;
          opacity: 0.6;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;

        new mapboxgl.Marker({ element: profileLocationEl })
          .setLngLat([requesterLongitude, requesterLatitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML('<div class="p-2"><strong>Search Center</strong><p class="text-xs mt-1">Radius: ' + searchRadius + ' miles</p></div>')
          )
          .addTo(map.current);
      }

      // Add provider markers
      providers.forEach((provider) => {
        if (!map.current) return;
        
        // Use color based on first specialty or default
        const color = provider.specialties?.[0] 
          ? SPECIALTY_COLORS[provider.specialties[0]] || SPECIALTY_COLORS.default
          : SPECIALTY_COLORS.default;
        
        const isOnline = onlineProviders.has(provider.provider_id);
        
        // Create custom marker element with pulse for online providers
        const el = document.createElement('div');
        el.className = 'provider-marker';
        el.style.cssText = `
          background-color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ${isOnline ? 'animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;' : ''}
        `;
        
        const verifiedBadge = provider.is_verified 
          ? '<span class="inline-flex items-center gap-1 text-green-600 text-xs font-medium"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>Verified</span>'
          : '';
        
        const popupContent = `
          <div class="p-2 min-w-[200px]">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold">${provider.provider_name}</h3>
              ${isOnline ? '<div class="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Provider is online"></div>' : ''}
            </div>
            ${verifiedBadge}
            ${provider.provider_bio ? `<p class="text-sm text-muted-foreground mb-2 line-clamp-2">${provider.provider_bio}</p>` : ''}
            ${provider.specialties?.length > 0 
              ? `<div class="flex flex-wrap gap-1 mb-2">
                  ${provider.specialties.slice(0, 3).map(s => 
                    `<span class="text-xs bg-secondary px-2 py-0.5 rounded">${s}</span>`
                  ).join('')}
                </div>` 
              : ''}
            ${provider.provider_location ? `<p class="text-sm text-muted-foreground mb-1">${provider.provider_location}</p>` : ''}
            <p class="text-sm text-muted-foreground mb-2">${provider.distance_miles.toFixed(1)} miles away</p>
            <p class="text-xs text-muted-foreground mb-2">Service radius: ${provider.service_radius} miles</p>
            <button 
              class="mt-2 w-full px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              onclick="window.location.href='/portfolio/${provider.provider_id}'"
            >
              View Profile
            </button>
          </div>
        `;

        new mapboxgl.Marker({ element: el })
          .setLngLat([provider.longitude, provider.latitude])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
          .addTo(map.current);
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [providers, requesterLatitude, requesterLongitude, currentLatitude, currentLongitude, searchRadius, navigate, onlineProviders]);

  // Update current location marker when coordinates change
  useEffect(() => {
    if (currentMarkerRef.current && currentLatitude && currentLongitude) {
      currentMarkerRef.current.setLngLat([currentLongitude, currentLatitude]);
    }
  }, [currentLatitude, currentLongitude]);

  return <div ref={mapContainer} className="w-full h-[500px] rounded-lg" />;
};

// Helper function to create a circle GeoJSON
function createCircle(center: [number, number], radiusInMeters: number, points = 64) {
  const coords = {
    latitude: center[1],
    longitude: center[0]
  };

  const km = radiusInMeters / 1000;
  const ret = [];
  const distanceX = km / (111.32 * Math.cos(coords.latitude * Math.PI / 180));
  const distanceY = km / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);

    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [ret]
    }
  } as GeoJSON.Feature;
}
