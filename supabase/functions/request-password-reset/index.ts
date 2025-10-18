import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { Resend } from "npm:resend@2.0.0";

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

    // Send custom branded email via Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header with gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🔐 Reset Your Password</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hi there,
                      </p>
                      
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                        We received a request to reset your Fayvrs password. Click the button below to create a new password:
                      </p>
                      
                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${linkData.properties.action_link}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 20px; color: #666666; font-size: 14px; line-height: 1.6;">
                        ⏰ <strong>This link expires in 1 hour</strong> for your security.
                      </p>
                      
                      <p style="margin: 0 0 20px; color: #666666; font-size: 14px; line-height: 1.6;">
                        If the button doesn't work, copy and paste this link into your browser:
                      </p>
                      
                      <p style="margin: 0 0 30px; color: #667eea; font-size: 13px; word-break: break-all;">
                        ${linkData.properties.action_link}
                      </p>
                      
                      <div style="border-top: 1px solid #eeeeee; padding-top: 20px; margin-top: 30px;">
                        <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.6;">
                          🔒 <strong>Security reminder:</strong> If you didn't request this password reset, you can safely ignore this email. Your account remains secure.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                        Best regards,<br>
                        <strong>The Fayvrs Team</strong>
                      </p>
                      <p style="margin: 10px 0 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} Fayvrs. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const { error: emailError } = await resend.emails.send({
      from: 'Fayvrs <contact@fayvrs.com>',
      to: [email],
      subject: 'Reset Your Fayvrs Password',
      html: emailHtml,
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      throw emailError;
    }

    console.log('Password reset email sent successfully');

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
