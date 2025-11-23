import { NextRequest, NextResponse } from 'next/server'

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  process.env.PAYLOAD_PUBLIC_FRONTEND_URL ||
  'http://localhost:3000'

const getPayloadServer = () => process.env.PAYLOAD_PUBLIC_SERVER_URL

const getKhaltiUrl = (path: string) =>
  `${process.env.KHALTI_API_BASE?.replace(/\/$/, '') || 'https://a.khalti.com/api/v2'}${path}`

const redirectWithStatus = (status: 'success' | 'failed' | 'cancelled', isRenewal: boolean = false) => {

  const redirectPath = isRenewal ? '/user/payment' : '/login'
  return NextResponse.redirect(`${getBaseUrl()}${redirectPath}?payment=${status}`, 302)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const pidx = searchParams.get('pidx')

  console.log('=== PAYMENT CALLBACK RECEIVED ===')

  if (!pidx) {
    console.error('No PIDX provided in callback')
    return redirectWithStatus('failed')
  }

  const khaltiSecret = process.env.KHALTI_SECRET_KEY
  const payloadServer = getPayloadServer()

  if (!khaltiSecret || !payloadServer) {
    console.error('Missing Khalti secret or Payload server URL')
    console.error('Khalti secret exists:', !!khaltiSecret)
    console.error('Payload server:', payloadServer)
    return redirectWithStatus('failed')
  }

  try {
    // Lookup payment from Khalti
    console.log('Looking up payment with Khalti...')
    const lookupRes = await fetch(getKhaltiUrl('/epayment/lookup/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${khaltiSecret}`,
      },
      body: JSON.stringify({ pidx }),
    })

    const lookupData = await lookupRes.json()

    console.log('=== KHALTI LOOKUP RESPONSE ===')
    console.log('Status code:', lookupRes.status)
    console.log('Response:', JSON.stringify(lookupData, null, 2))
    console.log('==============================')

    if (!lookupRes.ok) {
      console.error('Khalti lookup failed:', lookupData)
      return redirectWithStatus('failed')
    }

    // Try multiple possible status formats from Khalti
    const paymentState = (
      lookupData?.state?.name || 
      lookupData?.status || 
      lookupData?.transaction?.state?.name ||
      ''
    ).toLowerCase()
    
    const isCompleted = paymentState === 'completed' || paymentState === 'complete'

    console.log('Khalti payment state:', paymentState)
    console.log('Is completed:', isCompleted)

    // Find payment record first to determine if it's renewal
    console.log('Finding payment record by PIDX...')
    const paymentRecordRes = await fetch(
      `${payloadServer}/api/payments?where[khaltiPidx][equals]=${encodeURIComponent(pidx)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
    )

    let isRenewalPayment = false
    let paymentRecord = null

    if (paymentRecordRes.ok) {
      const paymentData = await paymentRecordRes.json()
      paymentRecord = paymentData.docs?.[0]
      
      if (paymentRecord) {
        isRenewalPayment = paymentRecord.paymentType === 'renewal'
        console.log('Payment record found:', paymentRecord.id)
        console.log('Payment type:', paymentRecord.paymentType)
        console.log('Current status:', paymentRecord.status)
      } else {
        console.warn('No payment record found for PIDX:', pidx)
      }
    } else {
      console.error('Failed to fetch payment record:', await paymentRecordRes.text())
    }

    // Find user by pidx
    console.log('Finding user by PIDX...')
    const userRes = await fetch(
      `${payloadServer}/api/users?where[khaltiPidx][equals]=${encodeURIComponent(pidx)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
    )

    if (!userRes.ok) {
      console.error('Failed to load user for payment callback', await userRes.text())
      return redirectWithStatus('failed', isRenewalPayment)
    }

    const userData = await userRes.json()
    const user = userData.docs?.[0]

    if (!user) {
      console.error('No user found for payment callback', pidx)
      return redirectWithStatus('failed', isRenewalPayment)
    }

    console.log('User found:', user.id, user.email)

    // Calculate validUntil date (31 days from now)
    const now = new Date()
    const validUntil = new Date(now)
    validUntil.setDate(validUntil.getDate() + 31)

    // Update payment record in Payments collection FIRST
    if (paymentRecord) {
      const paymentPatchBody = isCompleted
        ? {
            status: 'completed',
            paidAt: new Date().toISOString(),
            validUntil: validUntil.toISOString(),
            khaltiTransactionId: lookupData.transaction_id || lookupData.idx || pidx,
          }
        : {
            status: paymentState === 'initiated' || paymentState === 'pending' ? 'pending' : 'failed',
          }

      console.log('Updating payment record with status:', paymentPatchBody.status)
      console.log('Payment update body:', JSON.stringify(paymentPatchBody, null, 2))
      
      const updatePaymentRes = await fetch(`${payloadServer}/api/payments/${paymentRecord.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPatchBody),
      })

      if (!updatePaymentRes.ok) {
        const errorText = await updatePaymentRes.text()
        console.error('Failed to update payment record:', errorText)
      } else {
        const updatedPayment = await updatePaymentRes.json()
        console.log('Payment record updated successfully')
        console.log('Updated payment:', JSON.stringify(updatedPayment, null, 2))
      }
    } else {
      console.error('CRITICAL: No payment record to update!')
    }

    // Update user collection
    const userPatchBody = isCompleted
      ? { 
          payment: true, 
          khaltiPidx: null,
          nextPaymentDate: validUntil.toISOString()
        }
      : { payment: false }

    console.log('Updating user with payment status...')
    console.log('User update body:', JSON.stringify(userPatchBody, null, 2))
    
    const updateUserRes = await fetch(`${payloadServer}/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userPatchBody),
    })

    if (!updateUserRes.ok) {
      const errorText = await updateUserRes.text()
      console.error('Failed to update user payment status:', errorText)
    } else {
      const updatedUser = await updateUserRes.json()
      console.log('User payment status updated successfully')
      console.log('Updated user payment:', updatedUser.payment)
    }

    console.log('=== CALLBACK COMPLETE ===')
    console.log('Final payment state:', paymentState)
    console.log('Redirecting to:', isRenewalPayment ? '/payment' : '/login')

    if (isCompleted) {
      return redirectWithStatus('success', isRenewalPayment)
    }

    if (paymentState === 'initiated' || paymentState === 'pending') {
      return redirectWithStatus('cancelled', isRenewalPayment)
    }

    return redirectWithStatus('failed', isRenewalPayment)
  } catch (error) {
    console.error('Payment callback error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return redirectWithStatus('failed')
  }
}