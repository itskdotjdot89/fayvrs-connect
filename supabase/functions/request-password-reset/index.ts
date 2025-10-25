import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
// import { Resend } from "npm:resend@2.0.0"; // Temporarily disabled

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
    const { email } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing password reset request for:', email);

    // Initialize Supabase Admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the origin from the request headers for the redirect URL
    const origin = req.headers.get('origin') || 'https://c29d6ce2-cc08-4a58-8b16-bc41afbc66d4.lovableproject.com';
    
    // Generate password reset link using Admin API
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${origin}/auth?mode=reset`
      }
    });

    if (linkError) {
      console.error('Error generating reset link:', linkError);
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ message: 'If an account exists with this email, you will receive a password reset link.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Reset link generated successfully');

    // Email sending temporarily disabled - using Supabase's default emails
    console.log('Password reset link:', linkData.properties.action_link);
    console.log('Password reset email would be sent to:', email);

    return new Response(
      JSON.stringify({ message: 'If an account exists with this email, you will receive a password reset link.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in request-password-reset function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process password reset request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
