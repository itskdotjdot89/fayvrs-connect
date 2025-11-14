import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const FOUNDER_EMAIL = "contact@fayvrs.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FounderNotification {
  event_type: string;
  urgency: "urgent" | "info";
  title: string;
  message: string;
  user_id?: string;
  user_email?: string;
  related_id?: string;
  metadata?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const notification: FounderNotification = await req.json();
    console.log("Processing founder notification:", notification);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const projectId = supabaseUrl?.split("//")[1]?.split(".")[0];

    // Format timestamp
    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      dateStyle: "long",
      timeStyle: "short",
    });

    // Determine email styling based on urgency
    const headerColor = notification.urgency === "urgent" ? "#dc2626" : "#2563eb";
    const headerEmoji = notification.urgency === "urgent" ? "🚨" : "ℹ️";
    const urgencyLabel = notification.urgency === "urgent" ? "URGENT - Requires Attention" : "Informational";
    const subjectPrefix = notification.urgency === "urgent" ? "🚨 URGENT: " : "ℹ️ ";

    // Build metadata section
    let metadataHtml = "";
    if (notification.metadata && Object.keys(notification.metadata).length > 0) {
      metadataHtml = "<h3 style='margin-top: 20px; color: #374151;'>Additional Details:</h3><ul style='color: #6b7280;'>";
      for (const [key, value] of Object.entries(notification.metadata)) {
        metadataHtml += `<li><strong>${key}:</strong> ${value}</li>`;
      }
      metadataHtml += "</ul>";
    }

    // Build user details section
    let userDetailsHtml = "";
    if (notification.user_id || notification.user_email) {
      userDetailsHtml = "<h3 style='margin-top: 20px; color: #374151;'>User Details:</h3><ul style='color: #6b7280;'>";
      if (notification.user_id) {
        userDetailsHtml += `<li><strong>User ID:</strong> ${notification.user_id}</li>`;
      }
      if (notification.user_email) {
        userDetailsHtml += `<li><strong>Email:</strong> ${notification.user_email}</li>`;
      }
      userDetailsHtml += "</ul>";
    }

    // Build backend link
    let backendLinkHtml = "";
    if (projectId && notification.related_id) {
      backendLinkHtml = `
        <div style="margin-top: 24px;">
          <a href="https://lovable.app/projects/${projectId}/backend" 
             style="display: inline-block; background-color: ${headerColor}; color: white; 
                    padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            View in Lovable Cloud Backend →
          </a>
        </div>
      `;
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                     line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <!-- Header -->
          <div style="background-color: ${headerColor}; color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">
              ${headerEmoji} ${notification.title}
            </h1>
          </div>
          
          <!-- Content -->
          <div style="background-color: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            
            <!-- Event Info -->
            <div style="background-color: white; padding: 16px; border-radius: 6px; margin-bottom: 16px; border-left: 4px solid ${headerColor};">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
                <strong>Event:</strong> ${notification.event_type}
              </p>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
                <strong>Time:</strong> ${timestamp} EST
              </p>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                <strong>Urgency:</strong> <span style="color: ${headerColor}; font-weight: 600;">${urgencyLabel}</span>
              </p>
            </div>
            
            <!-- Message -->
            <div style="background-color: white; padding: 16px; border-radius: 6px; margin-bottom: 16px;">
              <p style="margin: 0; color: #374151; font-size: 15px;">
                ${notification.message}
              </p>
            </div>
            
            ${userDetailsHtml}
            ${metadataHtml}
            ${backendLinkHtml}
            
            <!-- Footer -->
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0;">
                This is an automated notification from Fayvrs platform monitoring.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Fayvrs <contact@fayvrs.com>",
      to: [FOUNDER_EMAIL],
      subject: `${subjectPrefix}${notification.title}`,
      html: emailHtml,
    });

    console.log("Founder notification sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        recipient: FOUNDER_EMAIL 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending founder notification:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
