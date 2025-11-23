import { NextRequest, NextResponse } from 'next/server'

const getPayloadServer = () => process.env.PAYLOAD_PUBLIC_SERVER_URL

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 })
    }

    const payloadServer = getPayloadServer()
    if (!payloadServer) {
      return NextResponse.json({ message: 'Server not configured' }, { status: 500 })
    }

    const response = await fetch(
      `${payloadServer}/api/payments?where[user][equals]=${userId}&sort=-createdAt&limit=50`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
    )

    if (!response.ok) {
      return NextResponse.json({ message: 'Failed to fetch payment history' }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ payments: data.docs || [] })
  } catch (error: any) {
    console.error('Payment history error', error)
    return NextResponse.json({ message: 'Unable to fetch payment history' }, { status: 500 })
  }
}