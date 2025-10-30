import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Request {
  request_id: string;
  title: string;
  description: string;
  category: string;
  distance_miles: number;
  budget_min?: number;
  budget_max?: number;
  latitude: number;
  longitude: number;
}

interface RequestsMapViewProps {
  requests: Request[];
  providerLatitude: number;
  providerLongitude: number;
  currentLatitude?: number;
  currentLongitude?: number;
  serviceRadius: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Home Repair': '#ef4444',
  'Cleaning': '#3b82f6',
  'Moving': '#f59e0b',
  'Pet Care': '#8b5cf6',
  'Tutoring': '#10b981',
  'Event Services': '#ec4899',
  'default': '#6366f1'
};

export const RequestsMapView = ({ 
  requests, 
  providerLatitude, 
  providerLongitude,
  currentLatitude,
  currentLongitude,
  serviceRadius 
}: RequestsMapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const navigate = useNavigate();
  const [onlineRequesters, setOnlineRequesters] = useState<Set<string>>(new Set());
  const currentMarkerRef = useRef<mapboxgl.Marker | null>(null);
  
  // Use current location if available, otherwise fall back to profile location
  const displayLatitude = currentLatitude || providerLatitude;
  const displayLongitude = currentLongitude || providerLongitude;

  // Subscribe to online status updates for requesters
  useEffect(() => {
    const requesterIds = requests.map(r => r.request_id);
    if (requesterIds.length === 0) return;

    const channel = supabase
      .channel('requesters-presence')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          const data = payload.new as { id: string; is_online: boolean };
          setOnlineRequesters(prev => {
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
  }, [requests]);

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

      // Add service radius circle (centered on profile location)
      const radiusInMeters = serviceRadius * 1609.34; // Convert miles to meters
      const radiusGeoJSON = createCircle([providerLongitude, providerLatitude], radiusInMeters);

      map.current.addSource('service-radius', {
        type: 'geojson',
        data: radiusGeoJSON
      });

      map.current.addLayer({
        id: 'service-radius-fill',
        type: 'fill',
        source: 'service-radius',
        paint: {
          'fill-color': 'hsl(var(--primary))',
          'fill-opacity': 0.1
        }
      });

      map.current.addLayer({
        id: 'service-radius-line',
        type: 'line',
        source: 'service-radius',
        paint: {
          'line-color': 'hsl(var(--primary))',
          'line-width': 2,
          'line-opacity': 0.5,
          'line-dasharray': [2, 2]
        }
      });

      // Add current location marker (pulsing blue dot)
      const currentLocationEl = document.createElement('div');
      currentLocationEl.className = 'current-location-marker';
      currentLocationEl.style.cssText = `
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 rgba(59, 130, 246, 0.4);
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        cursor: pointer;
      `;

      currentMarkerRef.current = new mapboxgl.Marker({ element: currentLocationEl })
        .setLngLat([displayLongitude, displayLatitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <strong class="text-blue-600">Your Current Location</strong>
                ${currentLatitude ? '<p class="text-xs text-green-600 mt-1">● Live tracking active</p>' : '<p class="text-xs text-muted-foreground mt-1">Using profile location</p>'}
              </div>
            `)
        )
        .addTo(map.current);

      // Add profile location marker (if different from current)
      if (currentLatitude && currentLongitude && 
          (Math.abs(currentLatitude - providerLatitude) > 0.001 || 
           Math.abs(currentLongitude - providerLongitude) > 0.001)) {
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
          .setLngLat([providerLongitude, providerLatitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML('<div class="p-2"><strong>Service Area Center</strong><p class="text-xs mt-1">Radius: ' + serviceRadius + ' miles</p></div>')
          )
          .addTo(map.current);
      }

      // Add request markers
      requests.forEach((request) => {
        if (!map.current) return;
        
        const color = CATEGORY_COLORS[request.category] || CATEGORY_COLORS.default;
        const isOnline = onlineRequesters.has(request.request_id);
        
        // Create marker element with pulse animation for online users
        const el = document.createElement('div');
        el.className = 'request-marker';
        el.style.cssText = `
          background-color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ${isOnline ? 'animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;' : ''}
        `;
        
        const popupContent = `
          <div class="p-2">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold">${request.title}</h3>
              ${isOnline ? '<div class="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Requester is online"></div>' : ''}
            </div>
            <p class="text-sm text-muted-foreground mb-2">${request.category}</p>
            <p class="text-sm mb-2 line-clamp-2">${request.description}</p>
            ${request.budget_min && request.budget_max ? 
              `<p class="text-sm font-medium">$${request.budget_min}-$${request.budget_max}</p>` : ''}
            <p class="text-sm text-muted-foreground">${request.distance_miles.toFixed(1)} miles away</p>
            <button 
              class="mt-2 w-full px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary-hover"
              onclick="window.location.href='/request/${request.request_id}'"
            >
              View Details
            </button>
          </div>
        `;

        new mapboxgl.Marker({ element: el })
          .setLngLat([request.longitude, request.latitude])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
          .addTo(map.current);
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [requests, providerLatitude, providerLongitude, currentLatitude, currentLongitude, serviceRadius, navigate, onlineRequesters]);

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
