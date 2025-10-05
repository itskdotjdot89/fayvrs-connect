import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeocodeResponse {
  latitude: number;
  longitude: number;
  formatted_address: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location } = await req.json();
    console.log('[GEOCODE] Geocoding location:', location);

    if (!location || typeof location !== 'string') {
      throw new Error('Location string is required');
    }

    // Use OpenStreetMap Nominatim API (free, no API key required)
    const encodedLocation = encodeURIComponent(location);
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&limit=1`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'FayvrsApp/1.0', // Nominatim requires a user agent
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      console.error('[GEOCODE] Location not found:', location);
      return new Response(
        JSON.stringify({ error: 'Location not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const result = data[0];
    const geocodedData: GeocodeResponse = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      formatted_address: result.display_name,
    };

    console.log('[GEOCODE] Successfully geocoded:', geocodedData);

    return new Response(
      JSON.stringify(geocodedData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('[GEOCODE] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
