import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[ANALYZE-REQUEST] Function started');
    
    const { prompt, images } = await req.json();
    
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt provided');
    }

    console.log('[ANALYZE-REQUEST] Analyzing prompt:', prompt.substring(0, 100));
    console.log('[ANALYZE-REQUEST] Images provided:', images?.length || 0);

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful assistant that analyzes user service/product requests and extracts structured information. If images are provided, analyze them to better understand the request. Be comprehensive and professional in your parsing.' 
          },
          { 
            role: 'user', 
            content: images && images.length > 0 
              ? [
                  { type: 'text', text: prompt },
                  ...images.map((img: string) => ({
                    type: 'image_url',
                    image_url: { url: img }
                  }))
                ]
              : prompt
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_request_details',
              description: 'Extract structured details from a user\'s service or product request',
              parameters: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                    description: 'A clear, concise title for the request (e.g., "Bathroom Sink Plumbing Repair")'
                  },
                  description: {
                    type: 'string',
                    description: 'A detailed, professional description of what the user needs. Expand on the user\'s input with helpful context.'
                  },
                  request_type: {
                    type: 'string',
                    enum: ['service', 'product', 'other'],
                    description: 'Whether this is a service request, product request, or other'
                  },
                  category: {
                    type: 'string',
                    description: 'The category of the request (e.g., "Plumbing", "Home Services", "Electronics")'
                  },
                  location: {
                    type: 'string',
                    description: 'The location mentioned in the request, if any (e.g., "Brooklyn, NY", "Manhattan")'
                  },
                  budget_min: {
                    type: 'number',
                    description: 'Minimum budget if mentioned, in dollars'
                  },
                  budget_max: {
                    type: 'number',
                    description: 'Maximum budget if mentioned, in dollars'
                  },
                  tags: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of relevant keywords/tags for provider matching (e.g., ["plumbing", "urgent", "residential"])'
                  },
                  confidence: {
                    type: 'number',
                    description: 'Confidence score from 0 to 1 indicating how well the request was understood'
                  }
                },
                required: ['title', 'description', 'request_type', 'category', 'tags', 'confidence']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_request_details' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ANALYZE-REQUEST] OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your configuration.');
      }
      
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[ANALYZE-REQUEST] OpenAI response received');

    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in response');
    }

    const extractedData = JSON.parse(toolCall.function.arguments);
    console.log('[ANALYZE-REQUEST] Extracted data:', extractedData);

    return new Response(JSON.stringify(extractedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[ANALYZE-REQUEST] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to analyze request. Please try again or fill out the form manually.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
