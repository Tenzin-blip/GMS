import { NextRequest, NextResponse } from 'next/server'

const appUrl = process.env.PAYLOAD_PUBLIC_APP_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || ''

function successHtml(redirectTo: string) {
  return `
  <!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verified</title></head>
  <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#0b0b0f;color:#e5e7eb;display:flex;align-items:center;justify-content:center;height:100vh;">
    <div style="background:rgba(255,255,255,0.04);padding:32px;border-radius:16px;border:1px solid rgba(255,255,255,0.08);text-align:center;max-width:420px;">
      <h2 style="margin:0 0 12px;color:#fff;">Email verified</h2>
      <p style="margin:0 0 16px;color:#cfd5e3;">You can now continue to onboarding.</p>
      <a href="${redirectTo}" style="display:inline-block;padding:12px 20px;background:#ff6b35;color:#fff;text-decoration:none;border-radius:10px;font-weight:700;">Go to onboarding</a>
    </div>
  </body></html>`
}

function errorHtml(message: string) {
  return `
  <!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error</title></head>
  <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#0b0b0f;color:#e5e7eb;display:flex;align-items:center;justify-content:center;height:100vh;">
    <div style="background:rgba(255,255,255,0.04);padding:32px;border-radius:16px;border:1px solid rgba(255,255,255,0.08);text-align:center;max-width:420px;">
      <h2 style="margin:0 0 12px;color:#fff;">Verification failed</h2>
      <p style="margin:0;color:#cfd5e3;">${message}</p>
    </div>
  </body></html>`
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  const token = req.nextUrl.searchParams.get('token')

  if (!email || !token) {
    return new NextResponse(errorHtml('Missing verification parameters'), { status: 400, headers: { 'Content-Type': 'text/html' } })
  }

  try {
    const findRes = await fetch(
      `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/users?where[email][equals]=${encodeURIComponent(email)}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } },
    )
    if (!findRes.ok) return new NextResponse(errorHtml('User lookup failed'), { status: 500, headers: { 'Content-Type': 'text/html' } })

    const data = await findRes.json()
    const user = data?.docs?.[0]
    if (!user) return new NextResponse(errorHtml('User not found'), { status: 404, headers: { 'Content-Type': 'text/html' } })
    if (user.role !== 'trainer') return new NextResponse(errorHtml('Only trainers can verify here'), { status: 403, headers: { 'Content-Type': 'text/html' } })

    if (user.OTP !== token) {
      return new NextResponse(errorHtml('Invalid or expired token'), { status: 400, headers: { 'Content-Type': 'text/html' } })
    }

    await fetch(`${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        OTP: null,
        email_verified: true,
        otpflag: true,
      }),
    })

    const redirectUrl = `${appUrl}/trainer/onboarding`
    return new NextResponse(successHtml(redirectUrl), { status: 200, headers: { 'Content-Type': 'text/html' } })
  } catch (err: any) {
    console.error('trainer-verify error', err)
    return new NextResponse(errorHtml('Server error'), { status: 500, headers: { 'Content-Type': 'text/html' } })
  }
}

