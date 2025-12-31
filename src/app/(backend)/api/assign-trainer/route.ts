// app/api/user/create-plan-request/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config })
    const { user } = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has premium or elite plan
    if (user.plan !== 'premium' && user.plan !== 'elite') {
      return NextResponse.json({ error: 'Only Premium and Elite members can request plans' }, { status: 403 })
    }

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

    if (existingRequests.docs.length > 0) {
      return NextResponse.json({ 
        error: 'You already have an active plan request',
        existingRequest: existingRequests.docs[0]
      }, { status: 400 })
    }

    // Get user's fitness data
    const fitnessData = await payload.find({
      collection: 'user-fitness',
      where: {
        user: { equals: user.id }
      },
      limit: 1
    })

    const userFitness = fitnessData.docs[0]

    if (!userFitness || !userFitness.goals || userFitness.goals.length === 0) {
      return NextResponse.json({ 
        error: 'Please complete your fitness profile first' 
      }, { status: 400 })
    }

    // Find best matching trainer based on specializations
    const trainers = await payload.find({
      collection: 'users',
      where: {
        role: { equals: 'trainer' }
      }
    })

    let bestTrainer = null
    let bestMatchScore = 0
    let matchedSpecs: string[] = []

    for (const trainer of trainers.docs) {
      if (!trainer.trainerProfile?.specializations) continue

      const trainerSpecs = trainer.trainerProfile.specializations
      const userGoals = userFitness.goals

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

    // If no perfect match, assign to any available trainer
    if (!bestTrainer && trainers.docs.length > 0) {
      bestTrainer = trainers.docs[0]
      matchedSpecs = []
    }

    if (!bestTrainer) {
      return NextResponse.json({ 
        error: 'No trainers available at this time. Please try again later.' 
      }, { status: 404 })
    }

    // Create the plan request
    const planRequest = await payload.create({
      collection: 'plan-requests',
      data: {
        user: user.id,
        userFitnessData: userFitness.id,
        goals: userFitness.goals,
        tier: user.plan,
        assignedTrainer: bestTrainer.id,
        matchedSpecializations: matchedSpecs.map(spec => ({ specialization: spec })),
        matchScore: bestMatchScore,
        status: 'pending'
      }
    })

    return NextResponse.json({ 
      success: true, 
      request: planRequest,
      trainer: {
        id: bestTrainer.id,
        name: bestTrainer.name
      }
    })

  } catch (error: any) {
    console.error('Create plan request error:', error)
    return NextResponse.json({ 
      error: error?.message || 'Internal error' 
    }, { status: 500 })
  }
}