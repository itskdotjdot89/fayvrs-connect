import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotifyProvidersRequest {
  request_id: string;
  request_title: string;
  request_description: string;
  providers: Array<{
    provider_id: string;
    full_name: string;
    email: string;
    phone: string;
    distance_miles: number;
    has_push: boolean;
    has_email: boolean;
    has_sms: boolean;
    has_in_app: boolean;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      request_id,
      request_title, 
      request_description,
      providers 
    }: NotifyProvidersRequest = await req.json();

    console.log('[NOTIFY-PROVIDERS] Notifying', providers.length, 'providers about request:', request_id);

    const notifications = [];

    for (const provider of providers) {
      // Create in-app notification (always enabled by default)
      if (provider.has_in_app) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: provider.provider_id,
            type: 'new_request',
            title: `New Request Near You: ${request_title}`,
            message: `${request_description.substring(0, 100)}... (${Math.round(provider.distance_miles)} miles away)`,
            request_id: request_id,
            is_read: false,
          });

        if (notificationError) {
          console.error('[NOTIFY-PROVIDERS] Error creating in-app notification:', notificationError);
        } else {
          notifications.push({ 
            provider_id: provider.provider_id, 
            channel: 'in-app', 
            status: 'success' 
          });
        }
      }

      // TODO: Email notifications (requires RESEND_API_KEY)
      if (provider.has_email && provider.email) {
        console.log('[NOTIFY-PROVIDERS] Email notification would be sent to:', provider.email);
        notifications.push({ 
          provider_id: provider.provider_id, 
          channel: 'email', 
          status: 'pending_implementation' 
        });
      }

      // Send SMS notification via Twilio
      if (provider.has_sms && provider.phone) {
        try {
          const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
          const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
          const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

          if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
            const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
            
            const formData = new URLSearchParams();
            formData.append('To', provider.phone);
            formData.append('From', twilioPhoneNumber);
            formData.append('Body', `New Request Near You: ${request_title}\n\n${request_description.substring(0, 150)}...\n\nDistance: ${Math.round(provider.distance_miles)} miles away`);

            const response = await fetch(twilioUrl, {
              method: 'POST',
              headers: {
                'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: formData.toString(),
            });

            if (response.ok) {
              console.log('[NOTIFY-PROVIDERS] SMS sent successfully to:', provider.phone);
              notifications.push({ 
                provider_id: provider.provider_id, 
                channel: 'sms', 
                status: 'success' 
              });
            } else {
              const error = await response.text();
              console.error('[NOTIFY-PROVIDERS] SMS send failed:', error);
              notifications.push({ 
                provider_id: provider.provider_id, 
                channel: 'sms', 
                status: 'failed' 
              });
            }
          } else {
            console.log('[NOTIFY-PROVIDERS] Twilio credentials not configured');
            notifications.push({ 
              provider_id: provider.provider_id, 
              channel: 'sms', 
              status: 'credentials_missing' 
            });
          }
        } catch (error) {
          console.error('[NOTIFY-PROVIDERS] SMS error:', error);
          notifications.push({ 
            provider_id: provider.provider_id, 
            channel: 'sms', 
            status: 'error' 
          });
        }
      }

      // TODO: Push notifications (requires FCM setup)
      if (provider.has_push) {
        console.log('[NOTIFY-PROVIDERS] Push notification would be sent to provider:', provider.provider_id);
        notifications.push({ 
          provider_id: provider.provider_id, 
          channel: 'push', 
          status: 'pending_implementation' 
        });
      }
    }

    console.log('[NOTIFY-PROVIDERS] Notifications sent:', notifications.length);

    return new Response(
      JSON.stringify({
        success: true,
        notifications_sent: notifications.length,
        details: notifications,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('[NOTIFY-PROVIDERS] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
