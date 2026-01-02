import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { getPayload } from 'payload'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: req.headers })

    if (!user || (user.role !== 'trainer' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId, type, payload: planPayload, source, status } = await req.json()

    if (!userId || !type || !planPayload) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const planType = type === 'meal' ? 'meal' : 'workout'
    const planSource = source || (user.role === 'trainer' ? 'trainer' : 'generic')
    const planStatus = status || 'active'

    const existing = await payload.find({
      collection: 'plan-versions',
      where: {
        user: { equals: userId },
        type: { equals: planType },
        status: { equals: 'active' },
      },
    })

    for (const doc of existing.docs) {
      await payload.update({
        collection: 'plan-versions',
        id: doc.id,
        data: { status: 'inactive' },
      })
    }

    const created = await payload.create({
      collection: 'plan-versions',
      data: {
        user: userId,
        trainer: user.role === 'trainer' ? user.id : undefined,
        type: planType,
        source: planSource,
        status: planStatus,
        activatedAt: planStatus === 'active' ? new Date().toISOString() : undefined,
        payload: planPayload,
      },
    })

    // If both workout and meal plans are active, update assignment planStatus to 'active'
    if (planStatus === 'active' && user.role === 'trainer') {
      try {
        // Check if both plans exist and are active
        const workoutPlan = await payload.find({
          collection: 'plan-versions',
          where: {
            and: [
              { user: { equals: userId } },
              { type: { equals: 'workout' } },
              { status: { equals: 'active' } },
            ],
          },
          limit: 1,
        })

        const mealPlan = await payload.find({
          collection: 'plan-versions',
          where: {
            and: [
              { user: { equals: userId } },
              { type: { equals: 'meal' } },
              { status: { equals: 'active' } },
            ],
          },
          limit: 1,
        })

        // If both plans are active, update assignment
        if (workoutPlan.docs.length > 0 && mealPlan.docs.length > 0) {
          const assignmentResults = await payload.find({
            collection: 'trainee-assignments',
            where: {
              and: [{ user: { equals: userId } }, { trainer: { equals: user.id } }],
            },
            limit: 1,
          })

          if (assignmentResults.docs.length > 0) {
            await payload.update({
              collection: 'trainee-assignments',
              id: assignmentResults.docs[0].id,
              data: {
                planStatus: 'active',
                planSentAt: new Date().toISOString(),
              },
            })
          }
        }
      } catch (err) {
        console.error('Error updating assignment planStatus:', err)
        // Don't fail the plan creation if this update fails
      }
    }

    return NextResponse.json({ success: true, plan: created })
  } catch (error: any) {
    console.error('Plan submit error', error)
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 })
  }
}
