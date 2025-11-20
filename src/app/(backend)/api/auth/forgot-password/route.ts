import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'

function getPasswordResetEmailTemplate(name: string, resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden;">
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 1px;">
                    LEVEL UP FITNESS
                  </h1>
                  <p style="margin: 10px 0 0 0; color: #f0f0f0; font-size: 14px;">
                    Your Fitness Journey Starts Here
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">
                    Hello, ${name}!
                  </h2>
                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                    We received a request to reset your password. Click the button below to choose a new password.
                  </p>
                  <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px 0;">
                    <tr>
                      <td align="center" style="padding: 0;">
                        <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 8px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                          Reset My Password
                        </a>
                      </td>
                    </tr>
                  </table>
                  <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 20px 0;">
                    <tr>
                      <td style="padding: 20px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                        <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                          <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons. If you didn't request a password reset, please ignore this email.
                        </p>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                    If the button doesn't work, copy and paste this link into your browser:
                  </p>
                  <p style="margin: 0; padding: 12px; background-color: #f8f9fa; border-radius: 6px; color: #667eea; font-size: 11px; word-break: break-all; font-family: 'Courier New', monospace;">
                    ${resetUrl}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6; text-align: center;">
                    This email was sent by Level Up Fitness. If you have any questions, please contact our support team.
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
    from: `"Level Up Fitness" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html: html || `<p>${text}</p>`,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }
    const payload = await getPayloadHMR({ config })
    // Find user by email using local API
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
      overrideAccess: true
    })

    if (!users.docs?.length) {
      return NextResponse.json({ 
        message: 'If an account with that email exists, we have sent a password reset link' 
      }, { status: 200 })
    }

    const user = users.docs[0]

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) 

    // Hash the token before storing
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    console.log('Generated reset token (first 10 chars):', resetToken.substring(0, 10))
    console.log('Hashed token (first 10 chars):', hashedToken.substring(0, 10))
    console.log('Token expiry:', resetTokenExpiry.toISOString())

    // Update user with hashed reset token using local API
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpiry: resetTokenExpiry.toISOString(),
      },
    })

    console.log('User updated successfully:', user.id)

    // Create reset URL with unhashed token
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`
    // Send email
    const htmlTemplate = getPasswordResetEmailTemplate(user.name || 'Member', resetUrl)

    await sendEmail(
      email,
      'Reset Your Password - Level Up Fitness',
      `Hello ${user.name || 'Member'}, you requested to reset your password. Click this link to reset it: ${resetUrl}. This link expires in 1 hour.`,
      htmlTemplate,
    )

    console.log('Password reset email sent to:', email)

    return NextResponse.json({ 
      message: 'Password reset email sent successfully. Please check your inbox.' 
    }, { status: 200 })

  } catch (error: any) {
    console.error('Forgot password error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json({ 
      message: 'Unable to process request. Please try again later.' 
    }, { status: 500 })
  }
}