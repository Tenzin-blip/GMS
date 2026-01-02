import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const payload = await getPayload({ config })
    const { user: trainer } = await payload.auth({ headers: req.headers })

    if (!trainer || trainer.role !== 'trainer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId } = await params

    // Find the trainee assignment
    const assignmentResults = await payload.find({
      collection: 'trainee-assignments',
      where: {
        and: [{ user: { equals: userId } }, { trainer: { equals: trainer.id } }],
      },
      depth: 2,
      limit: 1,
    })

    if (assignmentResults.docs.length === 0) {
      return NextResponse.json(
        { error: 'Member not found or not assigned to you' },
        { status: 404 },
      )
    }

    const assignment = assignmentResults.docs[0]

    // Fetch user data
    const user = await payload.findByID({
      collection: 'users',
      id: userId,
    })

    // Fetch user fitness data
    const fitnessResults = await payload.find({
      collection: 'user-fitness',
      where: {
        user: { equals: userId },
      },
      limit: 1,
    })
    const fitnessData = fitnessResults.docs[0] || null

    // Fetch current workout plan from PlanVersions
    let workoutPlan = null
    try {
      const workoutPlanResults = await payload.find({
        collection: 'plan-versions',
        where: {
          and: [
            { user: { equals: userId } },
            { type: { equals: 'workout' } },
            { status: { equals: 'active' } },
          ],
        },
        limit: 1,
        sort: '-activatedAt',
      })
      workoutPlan = workoutPlanResults.docs[0] || null
    } catch (err) {
      console.error('Error fetching workout plan:', err)
    }

    // Fetch current meal plan from PlanVersions
    let mealPlan = null
    try {
      const mealPlanResults = await payload.find({
        collection: 'plan-versions',
        where: {
          and: [
            { user: { equals: userId } },
            { type: { equals: 'meal' } },
            { status: { equals: 'active' } },
          ],
        },
        limit: 1,
        sort: '-activatedAt',
      })
      mealPlan = mealPlanResults.docs[0] || null
    } catch (err) {
      console.error('Error fetching meal plan:', err)
    }

    // Get plan request for tier info
    const planRequestResults = await payload.find({
      collection: 'plan-requests',
      where: {
        and: [
          { user: { equals: userId } },
          { assignedTrainer: { equals: trainer.id } },
          { status: { equals: 'accepted' } },
        ],
      },
      limit: 1,
      sort: '-createdAt',
    })
    const planRequest = planRequestResults.docs[0] || null

    return NextResponse.json({
      success: true,
      data: {
        assignment: {
          id: assignment.id,
          status: assignment.status,
          planStatus: assignment.planStatus,
          startedAt: assignment.startedAt,
          planSentAt: assignment.planSentAt,
          notes: assignment.notes,
        },
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        fitness: fitnessData || {},
        tier: planRequest?.tier || null,
        currentWorkoutPlan: workoutPlan
          ? {
              id: workoutPlan.id,
              payload: workoutPlan.payload,
              source: workoutPlan.source,
              activatedAt: workoutPlan.activatedAt,
            }
          : null,
        currentMealPlan: mealPlan
          ? {
              id: mealPlan.id,
              payload: mealPlan.payload,
              source: mealPlan.source,
              activatedAt: mealPlan.activatedAt,
            }
          : null,
      },
    })
  } catch (error: any) {
    console.error('Trainer member detail GET error', error)
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 })
  }
}
