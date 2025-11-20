import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token and password are required' },
        { status: 400 }
      )
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const payload = await getPayloadHMR({ config })

    // Find user with matching token
    const users = await payload.find({
      collection: 'users',
      where: {
        passwordResetToken: {
          equals: hashedToken,
        },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (!users.docs?.length) {
      return NextResponse.json(
        { message: 'Invalid or expired reset link' },
        { status: 400 }
      )
    }

    const user = users.docs[0]

    // Check if token has expired
    if (!user.passwordResetExpiry || new Date() > new Date(user.passwordResetExpiry)) {
      return NextResponse.json(
        { message: 'This reset link has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Update password and clear reset token
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        password: password, 
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
      overrideAccess: true,
    })

    console.log('Password reset successfully for user:', user.id)

    return NextResponse.json(
      { message: 'Password reset successfully. You can now log in with your new password.' },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Reset password error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { message: 'Unable to reset password. Please try again.' },
      { status: 500 }
    )
  }
}