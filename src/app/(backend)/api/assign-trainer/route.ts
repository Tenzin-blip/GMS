// app/api/user/create-plan-request/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has premium or elite plan
    if (user.plan !== 'premium' && user.plan !== 'elite') {
      return NextResponse.json(
        { error: 'Only Premium and Elite members can request plans' },
        { status: 403 },
      )
    }

    // Check if user already has a pending or accepted request
    const existingRequests = await payload.find({
      collection: 'plan-requests',
      where: {
        and: [
          { user: { equals: user.id } },
          {
            or: [{ status: { equals: 'pending' } }, { status: { equals: 'accepted' } }],
          },
        ],
      },
    })

    if (existingRequests.docs.length > 0) {
      return NextResponse.json(
        {
          error: 'You already have an active plan request',
          existingRequest: existingRequests.docs[0],
        },
        { status: 400 },
      )
    }

    // Get user's fitness data
    const fitnessData = await payload.find({
      collection: 'user-fitness',
      where: {
        user: { equals: user.id },
      },
      limit: 1,
    })

    const userFitness = fitnessData.docs[0]

    if (!userFitness || !userFitness.goals || userFitness.goals.length === 0) {
      return NextResponse.json(
        {
          error: 'Please complete your fitness profile first',
        },
        { status: 400 },
      )
    }

    // Find best matching trainer based on specializations
    const trainerProfiles = await payload.find({
      collection: 'trainer-profiles',
      where: {
        status: { equals: 'active' },
      },
      depth: 1, // Populate user relationship
    })

    let bestTrainerId = null
    let bestTrainerName = ''
    let bestMatchScore = 0
    let matchedSpecs: string[] = []

    for (const profile of trainerProfiles.docs) {
      if (!profile.specializations || profile.specializations.length === 0) {
        continue
      }

      const trainerSpecs = profile.specializations
      const userGoals = userFitness.goals

      // Calculate match score
      const matches = userGoals.filter((goal) => trainerSpecs.includes(goal))

      if (matches.length > bestMatchScore) {
        bestMatchScore = matches.length
        bestTrainerId = typeof profile.user === 'string' ? profile.user : profile.user.id
        bestTrainerName = typeof profile.user === 'string' ? '' : profile.user.name || ''
        matchedSpecs = matches
      }
    }

    // If no perfect match, assign to first available trainer with a profile
    if (!bestTrainerId && trainerProfiles.docs.length > 0) {
      const firstProfile = trainerProfiles.docs[0]
      bestTrainerId =
        typeof firstProfile.user === 'string' ? firstProfile.user : firstProfile.user.id
      bestTrainerName = typeof firstProfile.user === 'string' ? '' : firstProfile.user.name || ''
      matchedSpecs = []
    }

    if (!bestTrainerId) {
      return NextResponse.json(
        {
          error: 'No trainers available at this time. Please try again later.',
        },
        { status: 404 },
      )
    }

    // Create the plan request
    const planRequest = await payload.create({
      collection: 'plan-requests',
      data: {
        user: user.id,
        userFitnessData: userFitness.id,
        goals: userFitness.goals,
        tier: user.plan,
        assignedTrainer: bestTrainerId,
        matchedSpecializations: matchedSpecs.map((spec) => ({ specialization: spec })),
        matchScore: bestMatchScore,
        status: 'pending',
      },
    })

    return NextResponse.json({
      success: true,
      request: planRequest,
      trainer: {
        id: bestTrainerId,
        name: bestTrainerName,
      },
    })
  } catch (error: any) {
    console.error('Create plan request error:', error)
    return NextResponse.json(
      {
        error: error?.message || 'Internal error',
      },
      { status: 500 },
    )
  }
}
