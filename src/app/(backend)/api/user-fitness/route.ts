import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config })
    const body = await req.json()

    // Get the authenticated user from the request
    const token = req.cookies.get('payload-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the user is authenticated
    const { user } = await payload.auth({ headers: req.headers })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user already has a fitness profile
    const existingProfile = await payload.find({
      collection: 'user-fitness',
      where: {
        user: {
          equals: user.id,
        },
      },
      limit: 1,
    })

    let result

    if (existingProfile.docs.length > 0) {
      // Update existing profile
      result = await payload.update({
        collection: 'user-fitness',
        id: existingProfile.docs[0].id,
        data: {
          ...body,
          user: user.id,
        },
      })
    } else {
      // Create new profile
      result = await payload.create({
        collection: 'user-fitness',
        data: {
          ...body,
          user: user.id,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error: any) {
    console.error('Error in user-fitness API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config })

    // Get the authenticated user
    const { user } = await payload.auth({ headers: req.headers })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user's fitness profile
    const result = await payload.find({
      collection: 'user-fitness',
      where: {
        user: {
          equals: user.id,
        },
      },
      limit: 1,
    })

    // Return exists status regardless of whether profile is found
    return NextResponse.json({
      success: true,
      exists: result.docs.length > 0,
      data: result.docs.length > 0 ? result.docs[0] : null,
    })
  } catch (error: any) {
    console.error('Error fetching user-fitness:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}