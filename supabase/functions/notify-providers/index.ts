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

// Sanitize text for SMS to prevent injection attacks
function sanitizeSMSContent(text: string): string {
  // Remove potentially dangerous characters, keep only alphanumeric and basic punctuation
  return text
    .replace(/[^\w\s\-.,!?]/g, '')
    .substring(0, 150)
    .trim();
}

// Validate input fields
function validateNotificationRequest(data: NotifyProvidersRequest): { valid: boolean; error?: string } {
  // Validate request_id format (UUID)
  if (!data.request_id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.request_id)) {
    return { valid: false, error: 'Invalid request_id format' };
  }

  // Validate title length and characters
  if (!data.request_title || data.request_title.length < 3 || data.request_title.length > 200) {
    return { valid: false, error: 'request_title must be between 3 and 200 characters' };
  }

  // Validate description length
  if (!data.request_description || data.request_description.length < 10 || data.request_description.length > 2000) {
    return { valid: false, error: 'request_description must be between 10 and 2000 characters' };
  }

  // Check for URLs in content to prevent phishing
  const urlPattern = /(https?:\/\/|www\.|[a-z0-9-]+\.(com|net|org|io|co))/i;
  if (urlPattern.test(data.request_title) || urlPattern.test(data.request_description)) {
    return { valid: false, error: 'URLs are not allowed in notifications' };
  }

  // Validate providers array
  if (!Array.isArray(data.providers) || data.providers.length === 0) {
    return { valid: false, error: 'providers array is required and must not be empty' };
  }

  if (data.providers.length > 50) {
    return { valid: false, error: 'Cannot notify more than 50 providers at once' };
  }

  // Validate phone numbers format if SMS notifications are requested
  for (const provider of data.providers) {
    if (provider.has_sms && provider.phone && !/^\+[1-9]\d{1,14}$/.test(provider.phone)) {
      return { valid: false, error: `Invalid phone number format for provider ${provider.provider_id}` };
    }
  }

  return { valid: true };
}

// Safe error message helper
function getSafeErrorMessage(error: unknown): string {
  console.error('[NOTIFY-PROVIDERS] Error details:', error);
  
  if (error instanceof Error) {
    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      return 'One or more resources not found. Please verify the request details.';
    }
    if (error.message.includes('validation') || error.message.includes('Invalid')) {
      return error.message; // Validation errors are safe to show
    }
    if (error.message.includes('network') || error.message.includes('timeout')) {
      return 'Network error. Please check your connection and try again.';
    }
  }
  
  return 'An error occurred while sending notifications. Please try again.';
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

    const requestData: NotifyProvidersRequest = await req.json();

    // Validate input
    const validation = validateNotificationRequest(requestData);
    if (!validation.valid) {
      console.error('[NOTIFY-PROVIDERS] Validation failed:', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { 
      request_id,
      request_title, 
      request_description,
      providers 
    } = requestData;

    // Sanitize content for notifications
    const sanitizedTitle = sanitizeSMSContent(request_title);
    const sanitizedDescription = sanitizeSMSContent(request_description);

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
            title: `New Request Near You: ${sanitizedTitle}`,
            message: `${sanitizedDescription.substring(0, 100)}... (${Math.round(provider.distance_miles)} miles away)`,
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
            formData.append('Body', `New Request: ${sanitizedTitle}\n\n${sanitizedDescription}\n\nDistance: ${Math.round(provider.distance_miles)} mi`);

            const response = await fetch(twilioUrl, {
              method: 'POST',
              headers: {
                'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: formData.toString(),
            });

            if (response.ok) {
              console.log('[NOTIFY-PROVIDERS] SMS sent successfully to provider:', provider.provider_id);
              notifications.push({ 
                provider_id: provider.provider_id, 
                channel: 'sms', 
                status: 'success' 
              });
            } else {
              const error = await response.text();
              console.error('[NOTIFY-PROVIDERS] SMS send failed for provider:', provider.provider_id);
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
