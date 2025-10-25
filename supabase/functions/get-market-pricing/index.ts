import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, location, serviceDescription } = await req.json();
    
    if (!category || !location) {
      throw new Error('Missing required fields: category and location');
    }

    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('[MARKET-PRICING] Researching pricing for:', { category, location, serviceDescription });

    const systemPrompt = `You are a market research assistant specializing in service and product pricing. 
Your task is to provide current average market prices for specific services/products in given locations.
Base your analysis on your knowledge of typical pricing from sources like HomeAdvisor, Angi, Thumbtack, 
local trade associations, and general market rates.

Return your analysis in this exact JSON format:
{
  "dataAvailable": true,
  "averagePrice": { "min": 200, "max": 400 },
  "sources": ["HomeAdvisor 2025 data", "Angi pricing guides", "Industry averages"],
  "locationSpecific": true,
  "caveats": "Prices vary based on complexity and provider experience",
  "lastUpdated": "2025"
}

If you cannot provide reliable pricing, return:
{
  "dataAvailable": false,
  "message": "Insufficient data for accurate pricing in this area"
}`;

    const userPrompt = `Find the average market price for this service/product:

Category: ${category}
Service/Product: ${serviceDescription || category}
Location: ${location}

Provide:
1. Typical price range (min-max) in USD
2. Your knowledge sources (reference typical pricing databases/guides)
3. Whether pricing is location-specific or regional estimate
4. Important caveats about price variability

Return ONLY valid JSON matching the format specified.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 800,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[MARKET-PRICING] OpenAI error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('OpenAI rate limit exceeded. Please try again shortly.');
      }
      if (response.status === 401) {
        throw new Error('Invalid OpenAI API key.');
      }
      if (response.status === 402) {
        throw new Error('OpenAI payment required. Please add credits to your account.');
      }
      
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('[MARKET-PRICING] Raw response:', content);
    
    const pricingData = JSON.parse(content);
    
    return new Response(JSON.stringify(pricingData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[MARKET-PRICING] Error:', error);
    return new Response(
      JSON.stringify({ 
        dataAvailable: false,
        error: error instanceof Error ? error.message : 'Failed to fetch market pricing',
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
