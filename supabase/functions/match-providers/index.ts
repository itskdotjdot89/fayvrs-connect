import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchRequest {
  request_id: string;
  latitude: number;
  longitude: number;
  category?: string;
  radius_miles?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { request_id, latitude, longitude, category, radius_miles = 25 }: MatchRequest = await req.json();
    
    console.log('[MATCH-PROVIDERS] Matching for request:', request_id, {
      latitude,
      longitude,
      category,
      radius_miles
    });

    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call the database function to find providers
    const { data: providers, error } = await supabase.rpc('find_providers_in_radius', {
      req_latitude: latitude,
      req_longitude: longitude,
      req_category: category || null,
      radius_miles: radius_miles
    });

    if (error) {
      console.error('[MATCH-PROVIDERS] Database error:', error);
      throw error;
    }

    console.log(`[MATCH-PROVIDERS] Found ${providers?.length || 0} matching providers`);

    // Call notification function for each provider
    if (providers && providers.length > 0) {
      const notificationResults = await Promise.allSettled(
        providers.map(async (provider: any) => {
          try {
            const response = await supabase.functions.invoke('notify-provider', {
              body: {
                provider_id: provider.provider_id,
                request_id: request_id,
                notification_channels: {
                  push: provider.has_push,
                  email: provider.has_email,
                  sms: provider.has_sms,
                  in_app: provider.has_in_app
                }
              }
            });
            return response;
          } catch (err) {
            console.error('[MATCH-PROVIDERS] Notification error for provider:', provider.provider_id, err);
            return null;
          }
        })
      );

      console.log('[MATCH-PROVIDERS] Notification results:', notificationResults);
    }

    return new Response(
      JSON.stringify({ 
        matched_count: providers?.length || 0,
        providers: providers || []
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[MATCH-PROVIDERS] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
