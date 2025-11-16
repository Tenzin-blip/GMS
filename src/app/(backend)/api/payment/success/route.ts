import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ message: 'Missing session ID' }, { status: 400 })
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ message: 'Payment not completed' }, { status: 400 })
    }

    // Find and update transaction
    const transactionRes = await fetch(
      `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/transaction?where[stripeSessionId][equals]=${sessionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (!transactionRes.ok) {
      return NextResponse.json({ message: 'Failed to find transaction' }, { status: 500 })
    }

    const transactionData = await transactionRes.json()

    if (!transactionData.docs || transactionData.docs.length === 0) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 })
    }

    const transaction = transactionData.docs[0]

    // Update transaction status to completed
    const updateRes = await fetch(
      `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/transaction/${transaction.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
          stripeTransactionId: session.payment_intent,
        }),
      },
    )

    if (!updateRes.ok) {
      console.error('Failed to update transaction')
    }

    // Update user's active subscription
    const userUpdateRes = await fetch(
      `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/users/${transaction.user}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: transaction.subscription,
        }),
      },
    )

    if (!userUpdateRes.ok) {
      console.error('Failed to update user subscription')
    }

    return NextResponse.json({
      message: 'Payment successful',
      transactionId: transaction.id,
      sessionId: sessionId,
    })
  } catch (err) {
    console.error('Payment success error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { message: 'Something went wrong', error: errorMessage },
      { status: 500 },
    )
  }
}
