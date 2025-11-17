import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

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
                    Welcome back, ${name}!
                  </h2>
                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                    Use the verification code below to finish setting up your account.
                  </p>
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
                    This code expires in 10 minutes. Please do not share it with anyone.
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
    from: `"Gym System" <${process.env.SMTP_USER}>`,
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

    const findRes = await fetch(
      `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/users?where[email][equals]=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (!findRes.ok) {
      return NextResponse.json({ message: 'Unable to find user' }, { status: 404 })
    }

    const userData = await findRes.json()

    if (!userData.docs?.length) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const user = userData.docs[0]
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    const updateRes = await fetch(`${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        OTP: otp,
        otpflag: false,
        payment: false,
      }),
    })

    if (!updateRes.ok) {
      return NextResponse.json({ message: 'Failed to update user' }, { status: 500 })
    }

    const htmlTemplate = getOTPEmailTemplate(user.name || 'Member', otp)

    await sendEmail(
      email,
      'Your verification code',
      `Hello ${user.name || 'member'}, your verification code is ${otp}`,
      htmlTemplate,
    )

    return NextResponse.json({ message: 'OTP sent successfully' })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ message: 'Unable to resend OTP', error: error.message }, { status: 500 })
  }
}

