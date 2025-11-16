import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { userId, subscriptionId, stripePriceId, amount } = await req.json()

    if (!userId || !subscriptionId || !stripePriceId || !amount) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // Create transaction record
    const transactionRes = await fetch(`${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: userId,
        subscription: subscriptionId,
        amount,
        status: 'pending',
      }),
    })

    if (!transactionRes.ok) {
      const err = await transactionRes.json()
      console.error('Failed to create transaction:', err)
      return NextResponse.json({ message: 'Failed to create transaction' }, { status: 500 })
    }

    const transaction = await transactionRes.json()
    const transactionId = transaction.doc?.id || transaction.id

    // Create Stripe checkout session
    const successUrl = `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/payment/success`
    const cancelUrl = `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/signup?step=5`

    const session = await createCheckoutSession(
      userId,
      subscriptionId,
      stripePriceId,
      amount,
      successUrl,
      cancelUrl,
    )

    // Update transaction with Stripe session ID
    await fetch(`${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/transaction/${transactionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stripeSessionId: session.id,
      }),
    })

    return NextResponse.json({
      message: 'Checkout session created',
      sessionId: session.id,
      url: session.url,
    })
  } catch (err) {
    console.error('Checkout error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { message: 'Something went wrong', error: errorMessage },
      { status: 500 },
    )
  }
}
