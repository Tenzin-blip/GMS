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

    // ============================================
    // AUTO-CREATE PLAN REQUEST FOR PREMIUM/ELITE
    // ============================================
    let planRequestResult = null
    
    if (user.plan === 'premium' || user.plan === 'elite') {
      try {
        // Check if user already has a pending or accepted request
        const existingRequests = await payload.find({
          collection: 'plan-requests',
          where: {
            and: [
              { user: { equals: user.id } },
              {
                or: [
                  { status: { equals: 'pending' } },
                  { status: { equals: 'accepted' } }
                ]
              }
            ]
          }
        })

        if (existingRequests.docs.length === 0) {
          // Get user's fitness goals from the data we just saved
          const userGoals = fitnessData.goals || []

          if (userGoals.length > 0) {
            // Find best matching trainer based on specializations
            const trainers = await payload.find({
              collection: 'users',
              where: {
                role: { equals: 'trainer' }
              },
              depth: 1
            })

            let bestTrainer = null
            let bestMatchScore = 0
            let matchedSpecs: string[] = []

            for (const trainer of trainers.docs) {
              if (!trainer.trainerProfile?.specializations) continue

              const trainerSpecs = trainer.trainerProfile.specializations
              
              // Calculate match score
              const matches = userGoals.filter((goal: string) => 
                trainerSpecs.includes(goal)
              )

              if (matches.length > bestMatchScore) {
                bestMatchScore = matches.length
                bestTrainer = trainer
                matchedSpecs = matches
              }
            }

            // If no perfect match, assign to first available trainer
            if (!bestTrainer && trainers.docs.length > 0) {
              bestTrainer = trainers.docs[0]
              matchedSpecs = []
            }

            if (bestTrainer) {
              // Create the plan request
              planRequestResult = await payload.create({
                collection: 'plan-requests',
                data: {
                  user: user.id,
                  userFitnessData: result.id,
                  goals: userGoals,
                  tier: user.plan,
                  assignedTrainer: bestTrainer.id,
                  matchedSpecializations: matchedSpecs.map(spec => ({ specialization: spec })),
                  matchScore: bestMatchScore,
                  status: 'pending'
                }
              })

              console.log('✅ Plan request created:', planRequestResult.id, 'assigned to:', bestTrainer.name)
            } else {
              console.warn('⚠️ No trainers available to create plan request')
            }
          }
        } else {
          console.log('ℹ️ User already has an active plan request')
        }
      } catch (planRequestError) {
        console.error('❌ Error creating plan request:', planRequestError)
        // Don't fail the whole onboarding if plan request fails
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
      profilePictureUploaded: !!profilePictureId,
      planRequestCreated: !!planRequestResult,
      planRequest: planRequestResult ? {
        id: planRequestResult.id,
        status: planRequestResult.status,
        trainer: planRequestResult.assignedTrainer
      } : null
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