import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

// Helper to generate HTML email template
function getOTPEmailTemplate(name: string, otp: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Account</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 1px;">
                    🏋️ GYM SYSTEM
                  </h1>
                  <p style="margin: 10px 0 0 0; color: #f0f0f0; font-size: 14px;">
                    Your Fitness Journey Starts Here
                  </p>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">
                    Welcome, ${name}! 👋
                  </h2>
                  
                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                    Thank you for joining our fitness community! We're excited to have you on board.
                  </p>
                  
                  <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                    To complete your registration, please use the verification code below:
                  </p>
                  
                  <!-- OTP Box -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px 0;">
                    <tr>
                      <td align="center" style="padding: 30px; background-color: #f8f9fa; border-radius: 8px; border: 2px dashed #667eea;">
                        <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                          Your Verification Code
                        </p>
                        <p style="margin: 0; color: #667eea; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                          ${otp}
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                    This code will expire in <strong>10 minutes</strong> for security reasons.
                  </p>
                  
                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                    If you didn't request this code, please ignore this email or contact our support team.
                  </p>
                  
                  <!-- Divider -->
                  <div style="margin: 30px 0; height: 1px; background-color: #e0e0e0;"></div>
                  
                  <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6;">
                    <strong>Security tip:</strong> Never share your verification code with anyone. Our team will never ask for your code.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                  <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">
                    Need help? Contact us at <a href="mailto:support@gymsystem.com" style="color: #667eea; text-decoration: none;">support@gymsystem.com</a>
                  </p>
                  <p style="margin: 0; color: #999999; font-size: 12px;">
                    © ${new Date().getFullYear()} Gym System. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

// helper to send email
async function sendEmail(to: string, subject: string, text: string, html?: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: `"Gym System" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html: html || `<p>${text}</p>`,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { name, phoneNumber, email, dob, gender, plan } = await req.json()

    if (!name || !email) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    const tempPassword = crypto.randomBytes(32).toString('hex')

    const payloadRes = await fetch(`${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password: tempPassword,
        phoneNumber: phoneNumber || '000-0000000',
        dob: dob || '2000-01-01',
        gender: gender || 'other',
        plan: plan || 'monthly',
        OTP: otp,
        role: 'user',
      }),
    })

    if (!payloadRes.ok) {
      const err = await payloadRes.json()
      console.error('Payload error:', err)

      const errorMessage = err.errors?.[0]?.message || err.message || 'Failed to create user'

      return NextResponse.json(
        {
          message: errorMessage,
          errors: err.errors || [],
        },
        { status: payloadRes.status },
      )
    }

    const newUser = await payloadRes.json()
    console.log('New user created:', newUser)

    // Send email with fancy HTML template
    const htmlTemplate = getOTPEmailTemplate(name, otp)
    await sendEmail(
      email,
      '🔐 Verify Your Gym System Account',
      `Hello ${name},\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.\n\nBest regards,\nGym System Team`,
      htmlTemplate
    )

    return NextResponse.json({
      message: 'User created, OTP sent!',
      userId: newUser.doc?.id || newUser.id,
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { message: 'Something went wrong', error: err.message },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: 'GET endpoint' }, { status: 200 })
}