import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReverseGeocodeResponse {
  city: string;
  state: string;
  formatted: string;
}

// Rate limiting helper
async function checkRateLimit(supabase: any, clientIp: string): Promise<boolean> {
  const rateLimitKey = `reverse-geocode:${clientIp}`;
  const limit = 20; // 20 requests
  const windowMs = 60000; // per minute
  
  const { data, error } = await supabase
    .from('rate_limits')
    .select('count, last_request')
    .eq('key', rateLimitKey)
    .maybeSingle();
  
  if (error && error.code !== 'PGRST116') {
    console.error('[REVERSE-GEOCODE] Rate limit check error:', error);
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
  console.error('[REVERSE-GEOCODE] Error details:', error);
  
  if (error instanceof Error) {
    if (error.message.includes('not found') || error.message.includes('coordinates')) {
      return 'Location not found for these coordinates. Please try different coordinates.';
    }
    if (error.message.includes('Rate limit') || error.message.includes('429')) {
      return 'Service temporarily unavailable. Please try again in a moment.';
    }
  }
  
  return 'Unable to reverse geocode coordinates. Please try again.';
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
      console.log('[REVERSE-GEOCODE] Rate limit exceeded for IP:', clientIp);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again in a minute.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const { latitude, longitude } = await req.json();
    console.log('[REVERSE-GEOCODE] Reverse geocoding:', { latitude, longitude });

    if (!latitude || !longitude || typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new Error('Valid latitude and longitude are required');
    }

    // Use OpenStreetMap Nominatim API for reverse geocoding (free, no API key required)
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'FayvrsApp/1.0', // Nominatim requires a user agent
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.address) {
      console.error('[REVERSE-GEOCODE] Location not found for coordinates:', { latitude, longitude });
      return new Response(
        JSON.stringify({ error: 'Location not found for these coordinates' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract city and state from the address
    const address = data.address;
    const city = address.city || address.town || address.village || address.county || 'Unknown City';
    const state = address.state || '';
    
    // Format as "City, State" or just "City" if no state
    const formatted = state ? `${city}, ${state}` : city;

    const result: ReverseGeocodeResponse = {
      city,
      state,
      formatted
    };

    console.log('[REVERSE-GEOCODE] Successfully reverse geocoded:', result);

    return new Response(
      JSON.stringify(result),
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
