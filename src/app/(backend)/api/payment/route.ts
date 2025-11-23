import { NextRequest, NextResponse } from 'next/server'

const PLAN_FEES_NRP: Record<string, number> = {
  essential: 3500,
  premium: 5000,
  elite: 6500,
}

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  process.env.PAYLOAD_PUBLIC_FRONTEND_URL ||
  'http://localhost:3000'

const getPayloadServer = () => process.env.PAYLOAD_PUBLIC_SERVER_URL

const getKhaltiUrl = (path: string) =>
  `${process.env.KHALTI_API_BASE?.replace(/\/$/, '') || 'https://a.khalti.com/api/v2'}${path}`

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 })
    }

    const payloadServer = getPayloadServer()

    if (!payloadServer) {
      return NextResponse.json({ message: 'Payload server URL not configured' }, { status: 500 })
    }

    const khaltiSecret = process.env.KHALTI_SECRET_KEY

    if (!khaltiSecret) {
      return NextResponse.json({ message: 'Khalti secret key missing' }, { status: 500 })
    }

    const userRes = await fetch(`${payloadServer}/api/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!userRes.ok) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const userPayload = await userRes.json()
    const user = userPayload.doc || userPayload

    if (!user.email_verified) {
      return NextResponse.json({ message: 'Verify your email first.' }, { status: 400 })
    }

    if (!user.password_set) {
      return NextResponse.json({ message: 'Set your password before payment.' }, { status: 400 })
    }

    const planKey = (user.plan || 'essential').toLowerCase()
    const amountNpr = PLAN_FEES_NRP[planKey] || PLAN_FEES_NRP.essential
    const amountPaisa = amountNpr * 100
    const purchaseOrderId = `ORDER-${userId}-${Date.now()}`

    const baseUrl = getBaseUrl()
    const khaltiInitPayload = {
      return_url: `${baseUrl}/api/payment/callback`,
      website_url: baseUrl,
      amount: amountPaisa,
      purchase_order_id: purchaseOrderId,
      purchase_order_name: `${planKey}-plan`,
      customer_info: {
        name: user.name || 'Gym Member',
        email: user.email,
        phone: user.phoneNumber || '9800000000',
      },
    }

    const khaltiRes = await fetch(getKhaltiUrl('/epayment/initiate/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${khaltiSecret}`,
      },
      body: JSON.stringify(khaltiInitPayload),
    })

    const khaltiData = await khaltiRes.json()

    if (!khaltiRes.ok || !khaltiData.payment_url) {
      const errorMessage = khaltiData.detail || 'Unable to start Khalti payment.'
      return NextResponse.json({ message: errorMessage }, { status: khaltiRes.status || 500 })
    }

    const resetRes = await fetch(`${payloadServer}/api/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment: false,
        khaltiPidx: khaltiData.pidx,
      }),
    })

    if (!resetRes.ok) {
      const errBody = await resetRes.json().catch(() => ({}))
      console.error('Failed to persist payment intent', errBody)
      return NextResponse.json(
        { message: 'Unable to persist payment intent. Please try again.' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      message: 'Payment initiated',
      paymentUrl: khaltiData.payment_url,
      pidx: khaltiData.pidx,
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { message: 'Unable to initiate payment', error: err.message },
      { status: 500 },
    )
  }
}
