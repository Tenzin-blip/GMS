import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config })
    
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

    // Check if request contains multipart form data (with image)
    const contentType = req.headers.get('content-type') || ''
    let fitnessData
    let profilePictureFile = null

    if (contentType.includes('multipart/form-data')) {
      // Handle form data with file upload
      const formData = await req.formData()
      const fitnessDataString = formData.get('fitnessData') as string
      fitnessData = JSON.parse(fitnessDataString)
      profilePictureFile = formData.get('profilePicture') as File | null
    } else {
      // Handle regular JSON request (no file upload)
      fitnessData = await req.json()
    }

    // Upload profile picture if provided
    let profilePictureId = null
    if (profilePictureFile && profilePictureFile.size > 0) {
      try {
        // Convert File to Buffer
        const bytes = await profilePictureFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create media document in Payload
        const uploadedImage = await payload.create({
          collection: 'media', // Make sure you have a media collection
          data: {
            alt: `${user.name || 'User'} profile picture`,
          },
          file: {
            data: buffer,
            mimetype: profilePictureFile.type,
            name: profilePictureFile.name,
            size: profilePictureFile.size,
          },
        })

        profilePictureId = uploadedImage.id
      } catch (uploadError) {
        console.error('Error uploading profile picture:', uploadError)
        // Continue without profile picture if upload fails
      }
    }

    // Update user's profile picture if uploaded
    if (profilePictureId) {
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          profilePicture: profilePictureId,
        },
      })
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
          ...fitnessData,
          user: user.id,
        },
      })
    } else {
      // Create new profile
      result = await payload.create({
        collection: 'user-fitness',
        data: {
          ...fitnessData,
          user: user.id,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: result,
      profilePictureUploaded: !!profilePictureId,
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

    // Fetch user data with profile picture
    const userData = await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 2, // To populate the profilePicture relationship
    })

    // Return exists status regardless of whether profile is found
    return NextResponse.json({
      success: true,
      exists: result.docs.length > 0,
      data: result.docs.length > 0 ? result.docs[0] : null,
      user: {
        name: userData.name,
        email: userData.email,
        profilePicture: userData.profilePicture,
      },
    })
  } catch (error: any) {
    console.error('Error fetching user-fitness:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}