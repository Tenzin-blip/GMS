import { NextRequest, NextResponse } from 'next/server'

const PLAN_FEES_NRP: Record<string, number> = {
  essential: 3500,
  premium: 5000,
  elite: 6500,
}

const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.PAYLOAD_PUBLIC_FRONTEND_URL ||
    'http://localhost:3000'
  
  console.log('Base URL being used:', url)
  return url
}

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

    // Fetch user
    const userRes = await fetch(`${payloadServer}/api/users/${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
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

    // Check if this is a signup payment or renewal
    const isSignup = !user.payment
    const paymentType = isSignup ? 'signup' : 'renewal'

    console.log(`\n=== PAYMENT INITIATION ===`)
    console.log(`Payment Type: ${paymentType}`)
    console.log(`User ID: ${userId}`)
    console.log(`User Email: ${user.email}`)
    console.log(`Plan: ${planKey}`)
    console.log(`Amount: NPR ${amountNpr} (${amountPaisa} paisa)`)
    console.log(`Order ID: ${purchaseOrderId}`)

    const baseUrl = getBaseUrl()
    
    // CRITICAL: Make sure these URLs are ABSOLUTE and PUBLICLY ACCESSIBLE
    const returnUrl = `${baseUrl}/api/payment/callback`
    const websiteUrl = baseUrl

    console.log(`Return URL: ${returnUrl}`)
    console.log(`Website URL: ${websiteUrl}`)

    const khaltiInitPayload = {
      return_url: returnUrl,
      website_url: websiteUrl,
      amount: amountPaisa,
      purchase_order_id: purchaseOrderId,
      purchase_order_name: `${planKey}-plan-${paymentType}`,
      customer_info: {
        name: user.name || 'Gym Member',
        email: user.email,
        phone: user.phoneNumber || '9800000000',
      },
    }

    console.log('Khalti payload:', JSON.stringify(khaltiInitPayload, null, 2))

    // Initiate Khalti payment
    console.log('Calling Khalti API...')
    const khaltiRes = await fetch(getKhaltiUrl('/epayment/initiate/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${khaltiSecret}`,
      },
      body: JSON.stringify(khaltiInitPayload),
    })

    const khaltiData = await khaltiRes.json()

    console.log('Khalti response status:', khaltiRes.status)
    console.log('Khalti response:', JSON.stringify(khaltiData, null, 2))

    if (!khaltiRes.ok || !khaltiData.payment_url) {
      const errorMessage = khaltiData.detail || 'Unable to start Khalti payment.'
      console.error('Khalti initiation failed:', errorMessage, khaltiData)
      return NextResponse.json({ message: errorMessage }, { status: khaltiRes.status || 500 })
    }

    console.log(`Khalti payment initiated - PIDX: ${khaltiData.pidx}`)

    // Create payment record in Payments collection
    const paymentRecord = {
      user: userId,
      orderId: purchaseOrderId,
      khaltiPidx: khaltiData.pidx,
      plan: planKey,
      amount: amountNpr,
      status: 'initiated',
      paymentMethod: 'khalti',
      paymentType: paymentType,
    }

    console.log('Creating payment record:', JSON.stringify(paymentRecord, null, 2))

    const createPaymentRes = await fetch(`${payloadServer}/api/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentRecord),
    })

    if (!createPaymentRes.ok) {
      const errorText = await createPaymentRes.text()
      console.error('Failed to create payment record:', errorText)
    } else {
      const createdPayment = await createPaymentRes.json()
      console.log(`Payment record created - ID: ${createdPayment.doc?.id || createdPayment.id}`)
    }

    // Update user with khaltiPidx
    console.log('Updating user with PIDX...')
    const updateUserRes = await fetch(`${payloadServer}/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payment: false,
        khaltiPidx: khaltiData.pidx,
        paymentOrderId: purchaseOrderId,
      }),
    })

    if (!updateUserRes.ok) {
      const errorText = await updateUserRes.text()
      console.error('Failed to update user with pidx:', errorText)
    } else {
      console.log('User updated with PIDX successfully')
    }

    console.log('=== PAYMENT INITIATION COMPLETE ===\n')

    return NextResponse.json({
      message: 'Payment initiated',
      paymentUrl: khaltiData.payment_url,
      pidx: khaltiData.pidx,
    })
  } catch (err: any) {
    console.error('Payment initiation error:', err)
    console.error('Error stack:', err.stack)
    return NextResponse.json(
      { message: 'Unable to initiate payment', error: err.message },
      { status: 500 },
    )
  }
}