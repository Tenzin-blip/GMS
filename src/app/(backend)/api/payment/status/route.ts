import { NextRequest, NextResponse } from 'next/server'

const getPayloadServer = () => process.env.PAYLOAD_PUBLIC_SERVER_URL

const getKhaltiUrl = (path: string) =>
  `${process.env.KHALTI_API_BASE?.replace(/\/$/, '') || 'https://a.khalti.com/api/v2'}${path}`

const fetchUserByEmail = async (payloadServer: string, email?: string) => {
  if (!email) return null
  const res = await fetch(
    `${payloadServer}/api/users?where[email][equals]=${encodeURIComponent(email)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  if (!res.ok) return null
  const data = await res.json()
  return data.docs?.[0] || null
}

const fetchUserById = async (payloadServer: string, userId?: string) => {
  if (!userId) return null
  const res = await fetch(`${payloadServer}/api/users/${userId}?depth=0`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.doc || data
}

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json()

    if (!userId && !email) {
      return NextResponse.json({ message: 'Missing user reference' }, { status: 400 })
    }

    const payloadServer = getPayloadServer()
    if (!payloadServer) {
      return NextResponse.json({ message: 'Server not configured' }, { status: 500 })
    }

    const user = (await fetchUserById(payloadServer, userId)) || (await fetchUserByEmail(payloadServer, email))

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // If payment already completed, return true
    if (user.payment) {
      return NextResponse.json({ payment: true })
    }

    // If no pidx, payment hasn't been initiated
    if (!user.khaltiPidx) {
      return NextResponse.json({ payment: false })
    }

    const khaltiSecret = process.env.KHALTI_SECRET_KEY
    if (!khaltiSecret) {
      return NextResponse.json({ message: 'Payment provider not configured' }, { status: 500 })
    }

    console.log('Verifying payment with Khalti for PIDX:', user.khaltiPidx)

    // Store pidx before any updates
    const pidxToVerify = user.khaltiPidx

    // Lookup payment from Khalti
    const lookupRes = await fetch(getKhaltiUrl('/epayment/lookup/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${khaltiSecret}`,
      },
      body: JSON.stringify({ pidx: pidxToVerify }),
    })

    const lookupData = await lookupRes.json()
    

    if (!lookupRes.ok) {
      console.error('Khalti lookup failed', lookupData)
      return NextResponse.json({ payment: false })
    }

    // Try multiple possible response formats
    const paymentState = (
      lookupData?.state?.name || 
      lookupData?.status || 
      lookupData?.transaction?.state?.name ||
      ''
    ).toLowerCase()
    
    const isCompleted = paymentState === 'completed' || paymentState === 'complete'

    console.log('Payment state from Khalti:', paymentState, 'Is completed:', isCompleted)

    if (!isCompleted) {
      return NextResponse.json({ payment: false })
    }

    // Calculate validUntil date (31 days from now)
    const now = new Date()
    const validUntil = new Date(now)
    validUntil.setDate(validUntil.getDate() + 31)

    // Find and update payment record BEFORE clearing user's khaltiPidx
    const paymentRecordRes = await fetch(
      `${payloadServer}/api/payments?where[khaltiPidx][equals]=${encodeURIComponent(pidxToVerify)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
    )

    if (paymentRecordRes.ok) {
      const paymentData = await paymentRecordRes.json()
      const paymentRecord = paymentData.docs?.[0]

      if (paymentRecord) {
        console.log('Found payment record, updating to completed:', paymentRecord.id)

        const updatePaymentRes = await fetch(`${payloadServer}/api/payments/${paymentRecord.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'completed',
            paidAt: new Date().toISOString(),
            validUntil: validUntil.toISOString(),
            khaltiTransactionId: lookupData.transaction_id || lookupData.idx,
          }),
        })

        if (!updatePaymentRes.ok) {
          console.error('Failed to update payment record', await updatePaymentRes.text())
        } else {
          console.log('Payment record updated to completed')
        }
      } else {
        console.warn('No payment record found for PIDX:', pidxToVerify)
      }
    } else {
      console.error('Failed to fetch payment record', await paymentRecordRes.text())
    }

    // Now update user (after payment record is updated)
    const updateUserRes = await fetch(`${payloadServer}/api/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment: true,
        khaltiPidx: null,
        nextPaymentDate: validUntil.toISOString(),
      }),
    })

    if (!updateUserRes.ok) {
      console.error('Failed to update user payment status', await updateUserRes.text())
      return NextResponse.json({ payment: false })
    }

    console.log('User payment status updated successfully')

    return NextResponse.json({ payment: true })
  } catch (error: any) {
    console.error('Payment status verification failed', error)
    return NextResponse.json({ message: 'Unable to verify payment status' }, { status: 500 })
  }
}