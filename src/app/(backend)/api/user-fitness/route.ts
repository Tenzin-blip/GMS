import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config })
    const token = req.cookies.get('payload-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { user } = await payload.auth({ headers: req.headers })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const contentType = req.headers.get('content-type') || ''
    let fitnessData
    let profilePictureFile = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const fitnessDataString = formData.get('fitnessData') as string
      fitnessData = JSON.parse(fitnessDataString)
      profilePictureFile = formData.get('profilePicture') as File | null
    } else {
      fitnessData = await req.json()
    }

    let profilePictureId = null
    if (profilePictureFile && profilePictureFile.size > 0) {
      try {

        const bytes = await profilePictureFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const uploadedImage = await payload.create({
          collection: 'media', 
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
      }
    }

    if (profilePictureId) {
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          profilePicture: profilePictureId,
        },
      })
    }

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
      result = await payload.update({
        collection: 'user-fitness',
        id: existingProfile.docs[0].id,
        data: {
          ...fitnessData,
          user: user.id,
        },
      })
    } else {
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

    const { user } = await payload.auth({ headers: req.headers })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await payload.find({
      collection: 'user-fitness',
      where: {
        user: {
          equals: user.id,
        },
      },
      limit: 1,
    })


    const userData = await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 2, 
    })

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