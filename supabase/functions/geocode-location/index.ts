import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeocodeResponse {
  latitude: number;
  longitude: number;
  formatted_address: string;
}

// Rate limiting helper
async function checkRateLimit(supabase: any, clientIp: string): Promise<boolean> {
  const rateLimitKey = `geocode:${clientIp}`;
  const limit = 20; // 20 requests
  const windowMs = 60000; // per minute
  
  const { data, error } = await supabase
    .from('rate_limits')
    .select('count, last_request')
    .eq('key', rateLimitKey)
    .maybeSingle();
  
  if (error && error.code !== 'PGRST116') {
    console.error('[GEOCODE] Rate limit check error:', error);
    return true; // Allow on error
  }
  
  const now = Date.now();
  
  if (data) {
    const timeSinceLastRequest = now - new Date(data.last_request).getTime();
    
    if (timeSinceLastRequest < windowMs) {
      if (data.count >= limit) {
        return false; // Rate limit exceeded
      }
      // Increment count
      await supabase
        .from('rate_limits')
        .update({ count: data.count + 1, last_request: new Date().toISOString() })
        .eq('key', rateLimitKey);
    } else {
      // Reset count (new window)
      await supabase
        .from('rate_limits')
        .update({ count: 1, last_request: new Date().toISOString() })
        .eq('key', rateLimitKey);
    }
  } else {
    // First request
    await supabase
      .from('rate_limits')
      .insert({ key: rateLimitKey, count: 1, last_request: new Date().toISOString() });
  }
  
  return true; // Allow request
}

// Safe error message helper
function getSafeErrorMessage(error: unknown): string {
  console.error('[GEOCODE] Error details:', error);
  
  if (error instanceof Error) {
    if (error.message.includes('not found') || error.message.includes('No results')) {
      return 'Location not found. Please try a different address.';
    }
    if (error.message.includes('Rate limit') || error.message.includes('429')) {
      return 'Service temporarily unavailable. Please try again in a moment.';
    }
    if (error.message.includes('length')) {
      return 'Location address is too long. Please use a shorter address.';
    }
  }
  
  return 'Unable to geocode location. Please check the address and try again.';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client for rate limiting
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Rate limiting check
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    const allowed = await checkRateLimit(supabase, clientIp);
    if (!allowed) {
      console.log('[GEOCODE] Rate limit exceeded for IP:', clientIp);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again in a minute.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const { location } = await req.json();
    console.log('[GEOCODE] Geocoding location:', location);

    // Input validation
    if (!location || typeof location !== 'string') {
      throw new Error('Valid location string is required');
    }
    
    if (location.length < 3 || location.length > 200) {
      throw new Error('Location must be between 3 and 200 characters');
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
        JSON.stringify({ error: 'Location not found. Please try a different address.' }),
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
    const safeMessage = getSafeErrorMessage(error);
    return new Response(
      JSON.stringify({ error: safeMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
