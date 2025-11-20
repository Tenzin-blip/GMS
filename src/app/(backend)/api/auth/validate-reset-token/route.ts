import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json(
        { valid: false, message: 'Token is required' },
        { status: 400 }
      )
    }

    // Hash the token to compare with stored hash
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
      console.log('No user found with this token')
      return NextResponse.json(
        { valid: false, message: 'Invalid or expired reset link' },
        { status: 400 }
      )
    }

    const user = users.docs[0]
    console.log('User found:', user.id)

    // Check if token has expired
    if (!user.passwordResetExpiry) {
      console.log('No expiry date set')
      return NextResponse.json(
        { valid: false, message: 'Invalid or expired reset link' },
        { status: 400 }
      )
    }

    const expiryDate = new Date(user.passwordResetExpiry)
    const now = new Date()

    console.log('Token expiry:', expiryDate.toISOString())
    console.log('Current time:', now.toISOString())
    console.log('Token expired?', now > expiryDate)

    if (now > expiryDate) {
      console.log('Token has expired')
      return NextResponse.json(
        { valid: false, message: 'This reset link has expired. Please request a new one.' },
        { status: 400 }
      )
    }
    console.log('Token is valid')
    return NextResponse.json(
      { valid: true, message: 'Token is valid' },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Validate token error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { valid: false, message: 'Unable to validate token. Please try again.' },
      { status: 500 }
    )
  }
}