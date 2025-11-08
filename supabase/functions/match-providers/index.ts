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

// Safe error message helper
function getSafeErrorMessage(error: unknown): string {
  console.error('[MATCH-PROVIDERS] Error details:', error);
  
  if (error instanceof Error) {
    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      return 'Request not found or no providers available in the area.';
    }
    if (error.message.includes('required')) {
      return 'Missing required location information. Please provide valid coordinates.';
    }
    if (error.message.includes('database') || error.message.includes('rpc')) {
      return 'Unable to search for providers at this time. Please try again.';
    }
  }
  
  return 'An error occurred while matching providers. Please try again.';
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

    // Score and rank providers
    const scoredProviders = providers ? providers.map((provider: any) => {
      let score = 100;
      
      // Distance penalty: closer is better (subtract 2 points per mile)
      score -= (provider.distance_miles * 2);
      
      // Specialty match bonus
      if (provider.has_specialty) {
        score += 50;
      }
      
      return { ...provider, score };
    }).sort((a: any, b: any) => b.score - a.score).slice(0, 20) : [];

    console.log(`[MATCH-PROVIDERS] Top ${scoredProviders.length} providers selected after scoring`);

    // Call notification function for top-ranked providers
    if (scoredProviders && scoredProviders.length > 0) {
      const notificationResults = await Promise.allSettled(
        scoredProviders.map(async (provider: any) => {
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
        matched_count: scoredProviders?.length || 0,
        providers: scoredProviders || []
      }),
      { 
        status: 200, 
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
