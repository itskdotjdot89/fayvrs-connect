import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('REVENUECAT_NATIVE_API_KEY');
    
    if (!apiKey) {
      console.error('[get-revenuecat-native-key] API key not configured');
      return new Response(
        JSON.stringify({ error: 'RevenueCat Native API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[get-revenuecat-native-key] Successfully retrieved API key');
    return new Response(
      JSON.stringify({ apiKey }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[get-revenuecat-native-key] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch API key' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
