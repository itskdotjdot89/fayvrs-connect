import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeocodeRequest {
  location: string;
}

interface GeocodeResponse {
  latitude: number;
  longitude: number;
  formatted_address: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location }: GeocodeRequest = await req.json();
    
    console.log('[GEOCODE] Geocoding location:', location);

    if (!location || location.trim().length === 0) {
      throw new Error('Location is required');
    }

    // Use OpenStreetMap Nominatim API (free, no API key required)
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'FayvrsApp/1.0'
      }
    });

    if (!response.ok) {
      console.error('[GEOCODE] Nominatim API error:', response.status);
      throw new Error('Geocoding service error');
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

    const result: GeocodeResponse = {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      formatted_address: data[0].display_name
    };

    console.log('[GEOCODE] Success:', result);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
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
