import { NextRequest, NextResponse } from 'next/server'

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  process.env.PAYLOAD_PUBLIC_FRONTEND_URL ||
  'http://localhost:3000'

const getPayloadServer = () => process.env.PAYLOAD_PUBLIC_SERVER_URL

const getKhaltiUrl = (path: string) =>
  `${process.env.KHALTI_API_BASE?.replace(/\/$/, '') || 'https://a.khalti.com/api/v2'}${path}`

const redirectWithStatus = (status: 'success' | 'failed' | 'cancelled') =>
  NextResponse.redirect(`${getBaseUrl()}/login?payment=${status}`, 302)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const pidx = searchParams.get('pidx')

  if (!pidx) {
    return redirectWithStatus('failed')
  }

  const khaltiSecret = process.env.KHALTI_SECRET_KEY
  const payloadServer = getPayloadServer()

  if (!khaltiSecret || !payloadServer) {
    return redirectWithStatus('failed')
  }

  try {
    const lookupRes = await fetch(getKhaltiUrl('/epayment/lookup/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${khaltiSecret}`,
      },
      body: JSON.stringify({ pidx }),
    })

    const lookupData = await lookupRes.json()

    if (!lookupRes.ok) {
      console.error('Khalti lookup failed', lookupData)
      return redirectWithStatus('failed')
    }

    const paymentState = (lookupData?.state?.name || lookupData?.status || '').toLowerCase()
    const isCompleted = paymentState === 'completed'

    const userRes = await fetch(
      `${payloadServer}/api/users?where[khaltiPidx][equals]=${encodeURIComponent(pidx)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (!userRes.ok) {
      console.error('Failed to load user for payment callback', await userRes.text())
      return redirectWithStatus('failed')
    }

    const userData = await userRes.json()
    const user = userData.docs?.[0]

    if (!user) {
      console.error('No user found for payment callback', pidx)
      return redirectWithStatus('failed')
    }

    const patchBody = isCompleted
      ? {
          payment: true,
          khaltiPidx: null,
        }
      : {
          payment: false,
        }

    const updateRes = await fetch(`${payloadServer}/api/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patchBody),
    })

    if (!updateRes.ok) {
      console.error('Failed to update payment status', await updateRes.text())
      return redirectWithStatus('failed')
    }

    if (paymentState === 'completed') {
      return redirectWithStatus('success')
    }

    if (paymentState === 'initiated' || paymentState === 'pending') {
      return redirectWithStatus('cancelled')
    }

    return redirectWithStatus('failed')
  } catch (error) {
    console.error('Payment callback error', error)
    return redirectWithStatus('failed')
  }
}

