import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_AUTH_EMAIL_HOOK_SECRET') as string

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('not allowed', { status: 400 })
  }

  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)
  const wh = new Webhook(hookSecret)
  
  try {
    const webhookPayload = wh.verify(payload, headers) as {
      user: {
        email: string
      }
      email_data: {
        token: string
        token_hash: string
        redirect_to: string
        email_action_type: string
        site_url: string
      }
    }

    const { user, email_data } = webhookPayload

    // Only handle password recovery emails
    if (email_data.email_action_type !== 'recovery') {
      console.log(`Skipping email type: ${email_data.email_action_type}`)
      return new Response(JSON.stringify({ message: 'Email type not handled by this function' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log(`Processing password recovery for: ${user.email}`)

    // Construct the password reset URL
    const resetUrl = `${email_data.site_url}/auth/confirm?token_hash=${email_data.token_hash}&type=recovery&redirect_to=${encodeURIComponent(email_data.redirect_to || email_data.site_url)}`

    // Generate custom branded HTML email
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #9b87f5 0%, #7E69AB 100%);
      padding: 40px 20px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .header-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #333;
      font-size: 24px;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .content p {
      margin: 15px 0;
      color: #555;
      font-size: 16px;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #9b87f5 0%, #7E69AB 100%);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .button:hover {
      opacity: 0.9;
    }
    .otp-section {
      background-color: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .otp-code {
      font-size: 32px;
      font-weight: bold;
      color: #9b87f5;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
      margin: 10px 0;
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning p {
      margin: 0;
      color: #856404;
      font-size: 14px;
    }
    .security-notice {
      background-color: #e7f3ff;
      border-left: 4px solid #2196f3;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .security-notice p {
      margin: 0;
      color: #0c5460;
      font-size: 14px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #6c757d;
      font-size: 14px;
    }
    .footer p {
      margin: 5px 0;
    }
    .footer a {
      color: #9b87f5;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-icon">🔐</div>
      <h1>Reset Your Password</h1>
    </div>
    
    <div class="content">
      <h2>Hello!</h2>
      <p>We received a request to reset your password for your Fayvrs account. Click the button below to create a new password:</p>
      
      <center>
        <a href="${resetUrl}" class="button">Reset Password</a>
      </center>
      
      <div class="otp-section">
        <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Or copy and paste this code:</p>
        <div class="otp-code">${email_data.token}</div>
      </div>
      
      <div class="warning">
        <p><strong>⏱️ This link expires in 1 hour</strong> for security reasons. If it expires, you can request a new password reset link.</p>
      </div>
      
      <div class="security-notice">
        <p><strong>🛡️ Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged and your account is secure.</p>
      </div>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        Need help? Contact our support team at support@fayvrs.com
      </p>
    </div>
    
    <div class="footer">
      <p><strong>Fayvrs</strong></p>
      <p>Connecting requesters with trusted service providers</p>
      <p style="margin-top: 15px;">
        This email was sent to ${user.email} because a password reset was requested for your Fayvrs account.
      </p>
    </div>
  </div>
</body>
</html>
    `

    const { error } = await resend.emails.send({
      from: 'Fayvrs <onboarding@resend.dev>',
      to: [user.email],
      subject: 'Reset Your Fayvrs Password',
      html,
    })

    if (error) {
      console.error('Error sending email:', error)
      throw error
    }

    console.log(`Password recovery email sent successfully to: ${user.email}`)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in send-auth-email function:', error)
    return new Response(
      JSON.stringify({
        error: {
          http_code: error.code || 500,
          message: error.message,
        },
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})
