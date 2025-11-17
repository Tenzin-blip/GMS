import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json({ message: 'Missing email or OTP' }, { status: 400 })
    }

    // Find user by email using fetch
    const findRes = await fetch(
      `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/users?where[email][equals]=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (!findRes.ok) {
      const err = await findRes.json()
      return NextResponse.json({ message: 'Error finding user', error: err }, { status: 500 })
    }

    const userData = await findRes.json()

    if (!userData.docs || userData.docs.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const user = userData.docs[0]

    // Check OTP
    if (user.OTP !== otp) {
      await fetch(`${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otpflag: false,
          payment: false,
        }),
      })
      return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 })
    }

    // Clear OTP after verification & mark flags
    const updateRes = await fetch(`${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        OTP: null,
        email_verified: true,
        otpflag: true,
      }),
    })

    if (!updateRes.ok) {
      const err = await updateRes.json()
      console.error('Error clearing OTP:', err)
    }

    return NextResponse.json({
      message: 'Email verified successfully!',
      userId: user.id,
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { message: 'Something went wrong', error: err.message },
      { status: 500 },
    )
  }
}
