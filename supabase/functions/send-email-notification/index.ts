import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  message: string;
  request_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const resend = new Resend(resendApiKey);
    const { to, subject, message, request_id }: EmailRequest = await req.json();
    
    console.log('[EMAIL-NOTIFICATION] Sending email to:', to);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const requestUrl = `${supabaseUrl.replace('.supabase.co', '.lovableproject.com')}/request/${request_id}`;

    // Send email with Resend
    const emailResponse = await resend.emails.send({
      from: 'Fayvrs <contact@fayvrs.com>',
      to: [to],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 8px 8px 0 0;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .content {
                background: #ffffff;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
              }
              .message {
                background: #f9fafb;
                padding: 20px;
                border-radius: 6px;
                margin: 20px 0;
              }
              .button {
                display: inline-block;
                background: #667eea;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
                font-weight: 600;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🎯 ${subject}</h1>
            </div>
            <div class="content">
              <div class="message">
                <p>${message}</p>
              </div>
              <p>A new request matching your service area and expertise has been posted on Fayvrs. Review the details and submit your proposal to win this job.</p>
              <center>
                <a href="${requestUrl}" class="button">View Request & Submit Proposal</a>
              </center>
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                💡 <strong>Tip:</strong> Respond quickly to increase your chances of being selected!
              </p>
            </div>
            <div class="footer">
              <p>This notification was sent because you're a registered service provider on Fayvrs.</p>
              <p>You can manage your notification preferences in your account settings.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (emailResponse.error) {
      console.error('[EMAIL-NOTIFICATION] Resend error:', emailResponse.error);
      throw new Error(emailResponse.error.message);
    }

    console.log('[EMAIL-NOTIFICATION] Email sent successfully:', emailResponse.data?.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        email_id: emailResponse.data?.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('[EMAIL-NOTIFICATION] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
