import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotifyRequest {
  provider_id: string;
  request_id: string;
  notification_channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    in_app: boolean;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider_id, request_id, notification_channels }: NotifyRequest = await req.json();
    
    console.log('[NOTIFY-PROVIDER] Notifying provider:', provider_id, 'for request:', request_id);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get request details
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .select('title, description, category, budget_min, budget_max, location')
      .eq('id', request_id)
      .single();

    if (requestError || !request) {
      console.error('[NOTIFY-PROVIDER] Request not found:', requestError);
      throw new Error('Request not found');
    }

    // Get provider details
    const { data: provider, error: providerError } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', provider_id)
      .single();

    if (providerError || !provider) {
      console.error('[NOTIFY-PROVIDER] Provider not found:', providerError);
      throw new Error('Provider not found');
    }

    const notificationTitle = `New Request Near You: ${request.title}`;
    const notificationMessage = `A new ${request.category || 'service'} request has been posted in your area. Budget: $${request.budget_min}-$${request.budget_max}. Location: ${request.location}`;

    const results = {
      in_app: false,
      email: false,
      sms: false,
      push: false
    };

    // In-app notification (always create)
    if (notification_channels.in_app) {
      const { error: inAppError } = await supabase
        .from('notifications')
        .insert({
          user_id: provider_id,
          type: 'new_request',
          title: notificationTitle,
          message: notificationMessage,
          request_id: request_id,
          is_read: false
        });

      if (!inAppError) {
        results.in_app = true;
        console.log('[NOTIFY-PROVIDER] In-app notification created');
      } else {
        console.error('[NOTIFY-PROVIDER] In-app notification error:', inAppError);
      }
    }

    // Email notification
    if (notification_channels.email && provider.email) {
      try {
        const emailResponse = await supabase.functions.invoke('send-email-notification', {
          body: {
            to: provider.email,
            subject: notificationTitle,
            message: notificationMessage,
            request_id: request_id
          }
        });
        results.email = !emailResponse.error;
        console.log('[NOTIFY-PROVIDER] Email sent:', results.email);
      } catch (err) {
        console.error('[NOTIFY-PROVIDER] Email error:', err);
      }
    }

    // SMS notification
    if (notification_channels.sms && provider.phone) {
      try {
        const smsResponse = await supabase.functions.invoke('send-sms-notification', {
          body: {
            to: provider.phone,
            message: `${notificationTitle}\n\n${notificationMessage}\n\nView: ${supabaseUrl}/request/${request_id}`
          }
        });
        results.sms = !smsResponse.error;
        console.log('[NOTIFY-PROVIDER] SMS sent:', results.sms);
      } catch (err) {
        console.error('[NOTIFY-PROVIDER] SMS error:', err);
      }
    }

    // Push notification (via Realtime - handled by frontend)
    if (notification_channels.push) {
      results.push = true;
      console.log('[NOTIFY-PROVIDER] Push notification will be handled by frontend via Realtime');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[NOTIFY-PROVIDER] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
