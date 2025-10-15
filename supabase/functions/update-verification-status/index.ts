import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateStatusRequest {
  verification_id: string;
  status: 'approved' | 'rejected';
  reviewer_notes?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      console.error('Permission denied for user:', user.id, roleError);
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { verification_id, status, reviewer_notes }: UpdateStatusRequest = await req.json();

    // Validate inputs
    if (!verification_id || !status) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (status === 'rejected' && !reviewer_notes) {
      return new Response(
        JSON.stringify({ error: 'Reviewer notes are required for rejection' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get verification details
    const { data: verification, error: verificationError } = await supabaseClient
      .from('identity_verifications')
      .select('user_id')
      .eq('id', verification_id)
      .single();

    if (verificationError || !verification) {
      console.error('Verification not found:', verificationError);
      return new Response(
        JSON.stringify({ error: 'Verification not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update verification status
    const { error: updateVerificationError } = await supabaseClient
      .from('identity_verifications')
      .update({
        status: status,
        reviewer_notes: reviewer_notes || null,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', verification_id);

    if (updateVerificationError) {
      console.error('Error updating verification:', updateVerificationError);
      throw updateVerificationError;
    }

    // Update user's verified status in profiles
    const { error: updateProfileError } = await supabaseClient
      .from('profiles')
      .update({
        is_verified: status === 'approved'
      })
      .eq('id', verification.user_id);

    if (updateProfileError) {
      console.error('Error updating profile:', updateProfileError);
      throw updateProfileError;
    }

    // Get user email for notification
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', verification.user_id)
      .single();

    // Send email notification
    if (profile?.email) {
      const emailSubject = status === 'approved' 
        ? '✅ Identity Verification Approved' 
        : '❌ Identity Verification Rejected';
      
      const emailMessage = status === 'approved'
        ? `Congratulations ${profile.full_name || 'there'}! Your identity verification has been approved. You now have full access to all features.`
        : `Hello ${profile.full_name || 'there'}, unfortunately your identity verification was not approved. Reason: ${reviewer_notes}. Please resubmit your documents addressing the issues mentioned.`;

      try {
        await supabaseClient.functions.invoke('send-email-notification', {
          body: {
            to: profile.email,
            subject: emailSubject,
            message: emailMessage,
            request_id: verification_id
          }
        });
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't fail the request if email fails
      }
    }

    console.log(`Verification ${verification_id} ${status} by admin ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        verification_id,
        status 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error updating verification status:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
