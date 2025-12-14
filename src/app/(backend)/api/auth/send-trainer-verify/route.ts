import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const appUrl = process.env.PAYLOAD_PUBLIC_APP_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || ''

function getVerifyEmailTemplate(name: string, link: string) {
  return `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Verify your trainer email</title>
    </head>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#0b0b0f;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b0b0f;padding:32px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;backdrop-filter: blur(8px);">
              <tr>
                <td style="padding:32px;text-align:center;background:linear-gradient(135deg,#11151f,#1c1f2b);">
                  <h1 style="margin:0;color:#ff6b35;font-size:26px;letter-spacing:0.5px;">LEVEL UP FITNESS</h1>
                  <p style="margin:8px 0 0;color:#cfd5e3;font-size:14px;">Trainer email verification</p>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;color:#e5e7eb;">
                  <h2 style="margin:0 0 16px;font-size:22px;color:#fff;">Welcome${name ? `, ${name}` : ''}!</h2>
                  <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#cfd5e3;">
                    Please verify your trainer account so you can access onboarding and start handling member requests.
                  </p>
                  <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#cfd5e3;">
                    Click the button below to confirm your email.
                  </p>
                  <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 24px;">
                    <tr>
                      <td style="border-radius:12px;overflow:hidden;">
                        <a href="${link}" style="display:inline-block;padding:14px 28px;background:#ff6b35;color:#fff;font-weight:700;text-decoration:none;font-size:15px;border-radius:12px;">Verify email</a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:0 0 8px;font-size:13px;color:#8f96aa;text-align:center;">If the button doesn’t work, copy and paste this link:</p>
                  <p style="margin:0;font-size:12px;color:#6b7280;word-break:break-all;text-align:center;">${link}</p>
                  <div style="margin-top:28px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;font-size:12px;color:#6b7280;">
                    This link expires soon for security. If you didn’t request this, ignore this email.
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`
}

async function sendEmail(to: string, subject: string, html: string) {
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
    html,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ message: 'Email required' }, { status: 400 })

    const findRes = await fetch(
      `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/users?where[email][equals]=${encodeURIComponent(email)}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } },
    )
    if (!findRes.ok) return NextResponse.json({ message: 'User lookup failed' }, { status: 500 })

    const data = await findRes.json()
    const user = data?.docs?.[0]
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 })
    if (user.role !== 'trainer') return NextResponse.json({ message: 'Only trainers can use this' }, { status: 403 })

    const token = Math.floor(100000 + Math.random() * 900000).toString()

    const updateRes = await fetch(`${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        OTP: token,
        email_verified: false,
        otpflag: false,
      }),
    })
    if (!updateRes.ok) {
      const err = await updateRes.json()
      return NextResponse.json({ message: 'Failed to set token', error: err }, { status: 500 })
    }

    const verifyLink = `${appUrl}/api/auth/trainer-verify?email=${encodeURIComponent(email)}&token=${token}`
    const html = getVerifyEmailTemplate(user.name || 'Trainer', verifyLink)

    await sendEmail(email, 'Verify your trainer email', html)
    return NextResponse.json({ message: 'Verification email sent' })
  } catch (err: any) {
    console.error('send-trainer-verify error', err)
    return NextResponse.json({ message: 'Internal error', error: err?.message }, { status: 500 })
  }
}

