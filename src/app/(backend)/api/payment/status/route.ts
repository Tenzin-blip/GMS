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

    let user = (await fetchUserById(payloadServer, userId)) || (await fetchUserByEmail(payloadServer, email))

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    if (user.payment) {
      return NextResponse.json({ payment: true })
    }

    if (!user.khaltiPidx) {
      return NextResponse.json({ payment: !!user.payment })
    }

    const khaltiSecret = process.env.KHALTI_SECRET_KEY
    if (!khaltiSecret) {
      return NextResponse.json({ message: 'Payment provider not configured' }, { status: 500 })
    }

    const lookupRes = await fetch(getKhaltiUrl('/epayment/lookup/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${khaltiSecret}`,
      },
      body: JSON.stringify({ pidx: user.khaltiPidx }),
    })

    const lookupData = await lookupRes.json()

    if (!lookupRes.ok) {
      console.error('Khalti lookup failed', lookupData)
      return NextResponse.json({ payment: false })
    }

    const paymentState = (lookupData?.state?.name || lookupData?.status || '').toLowerCase()
    const isCompleted = paymentState === 'completed'

    if (!isCompleted) {
      return NextResponse.json({ payment: false })
    }

    const updateRes = await fetch(`${payloadServer}/api/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment: true,
        khaltiPidx: null,
      }),
    })

    if (!updateRes.ok) {
      console.error('Failed to update payment status during verification', await updateRes.text())
      return NextResponse.json({ payment: false })
    }

    return NextResponse.json({ payment: true })
  } catch (error: any) {
    console.error('Payment status verification failed', error)
    return NextResponse.json({ message: 'Unable to verify payment status' }, { status: 500 })
  }
}

