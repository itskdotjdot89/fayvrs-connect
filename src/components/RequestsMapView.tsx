import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';

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
  serviceRadius 
}: RequestsMapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [providerLongitude, providerLatitude],
      zoom: 11,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;

      // Add service radius circle
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
          'line-opacity': 0.5
        }
      });

      // Add provider location marker
      new mapboxgl.Marker({ color: 'hsl(var(--primary))' })
        .setLngLat([providerLongitude, providerLatitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML('<strong>Your Location</strong><p>Service Radius: ' + serviceRadius + ' miles</p>')
        )
        .addTo(map.current);

      // Add request markers
      requests.forEach((request) => {
        if (!map.current) return;
        
        const color = CATEGORY_COLORS[request.category] || CATEGORY_COLORS.default;
        
        const popupContent = `
          <div class="p-2">
            <h3 class="font-semibold mb-1">${request.title}</h3>
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

        new mapboxgl.Marker({ color })
          .setLngLat([request.longitude, request.latitude])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
          .addTo(map.current);
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [requests, providerLatitude, providerLongitude, serviceRadius, navigate]);

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
