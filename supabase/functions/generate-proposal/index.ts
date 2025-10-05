import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { providerInput, requestTitle, requestDescription, requestBudget, providerPrice } = await req.json();

    console.log('[GENERATE-PROPOSAL] Request received', { 
      hasInput: !!providerInput, 
      requestTitle,
      price: providerPrice 
    });

    // Validate inputs
    if (!providerInput || !requestTitle || !providerPrice) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    // Determine which API to use
    // Use Lovable AI (Gemini) by default during promotional period (until Oct 6, 2025)
    // Fall back to OpenAI after that or if Lovable AI fails
    const isPromotionalPeriod = new Date() < new Date('2025-10-06');
    const useLovableAI = LOVABLE_API_KEY && isPromotionalPeriod;

    console.log('[GENERATE-PROPOSAL] Using API:', useLovableAI ? 'Lovable AI (Gemini)' : 'OpenAI');

    // Build context for AI
    const budgetText = requestBudget?.min && requestBudget?.max 
      ? `Budget range: $${requestBudget.min}-$${requestBudget.max}`
      : requestBudget?.max 
      ? `Budget: up to $${requestBudget.max}`
      : '';

    const systemPrompt = `You are a professional proposal writer helping service providers create compelling, detailed proposals for client requests.

Your task is to transform the provider's brief notes into a well-structured, professional proposal.

Guidelines:
- Write in a professional yet warm tone
- Structure the proposal with clear sections
- Highlight the provider's experience and qualifications
- Explain the approach to solving the problem
- Include timeline if mentioned
- Emphasize value and professionalism
- Keep it concise but detailed (200-300 words)
- End with a professional closing

Format the proposal with these sections:
1. Greeting
2. Approach & Methodology
3. Experience & Qualifications
4. Timeline/Availability
5. Investment (mention the price: $${providerPrice})
6. Closing

Do NOT use markdown formatting, asterisks, or special characters. Use plain text with line breaks for structure.`;

    const userPrompt = `Request Title: ${requestTitle}

Request Description: ${requestDescription}

${budgetText}

Provider's Notes: ${providerInput}

Provider's Price Quote: $${providerPrice}

Generate a professional proposal based on the provider's notes above.`;

    let generatedProposal = '';
    let modelUsed = '';

    if (useLovableAI) {
      try {
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 500,
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            return new Response(
              JSON.stringify({ error: 'AI service is busy. Please try again in a moment.' }),
              { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          if (response.status === 402) {
            console.log('[GENERATE-PROPOSAL] Lovable AI credits depleted, falling back to OpenAI');
            throw new Error('Credits depleted, switching to OpenAI');
          }
          throw new Error(`Lovable AI error: ${response.status}`);
        }

        const data = await response.json();
        generatedProposal = data.choices[0].message.content;
        modelUsed = 'Lovable AI (Gemini 2.5 Flash)';
        console.log('[GENERATE-PROPOSAL] Successfully generated with Lovable AI');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[GENERATE-PROPOSAL] Lovable AI failed, falling back to OpenAI:', errorMessage);
        // Fall through to OpenAI
      }
    }

    // Use OpenAI if Lovable AI wasn't used or failed
    if (!generatedProposal && OPENAI_API_KEY) {
      console.log('[GENERATE-PROPOSAL] Using OpenAI GPT-5 Mini');
      
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
          max_completion_tokens: 500,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'AI service is busy. Please try again in a moment.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const errorText = await response.text();
        console.error('[GENERATE-PROPOSAL] OpenAI error:', response.status, errorText);
        throw new Error(`OpenAI error: ${response.status}`);
      }

      const data = await response.json();
      generatedProposal = data.choices[0].message.content;
      modelUsed = 'OpenAI GPT-5 Mini';
      console.log('[GENERATE-PROPOSAL] Successfully generated with OpenAI');
    }

    if (!generatedProposal) {
      return new Response(
        JSON.stringify({ error: 'AI service unavailable. Please try manual mode.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        proposal: generatedProposal,
        model: modelUsed 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[GENERATE-PROPOSAL] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
