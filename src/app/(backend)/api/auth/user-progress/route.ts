import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

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
      return NextResponse.json({ message: 'Unable to fetch user' }, { status: 500 })
    }

    const userData = await findRes.json()

    if (!userData.docs?.length) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const user = userData.docs[0]

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      dob: user.dob,
      gender: user.gender,
      plan: user.plan,
      otpflag: user.otpflag,
      payment: user.payment,
      email_verified: user.email_verified,
      password_set: user.password_set,
    })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ message: 'Something went wrong', error: error.message }, { status: 500 })
  }
}

