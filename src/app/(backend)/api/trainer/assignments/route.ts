// app/api/trainer/assignments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: req.headers })

    if (!user || user.role !== 'trainer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const status = req.nextUrl.searchParams.get('status')

    const where: any = {
      trainer: { equals: user.id },
    }

    // Filter by status if provided (active, paused, ended)
    if (status) {
      where.status = { equals: status }
    }

    // Fetch all trainee assignments for this trainer
    const results = await payload.find({
      collection: 'trainee-assignments',
      where,
      sort: '-startedAt',
      depth: 2, // Get user and trainer data
      limit: 100,
    })

    // Enrich with user fitness data and plan info
    const enrichedAssignments = await Promise.all(
      results.docs.map(async (assignment: any) => {
        const userId = typeof assignment.user === 'string' ? assignment.user : assignment.user?.id

        // Fetch user fitness data
        let fitnessData = null
        try {
          const fitnessResults = await payload.find({
            collection: 'user-fitness',
            where: {
              user: { equals: userId },
            },
            limit: 1,
          })
          fitnessData = fitnessResults.docs[0] || null
        } catch (err) {
          console.error('Error fetching fitness data:', err)
        }

        // Get plan request info for tier
        let planRequest = null
        try {
          const requestResults = await payload.find({
            collection: 'plan-requests',
            where: {
              and: [
                { user: { equals: userId } },
                { assignedTrainer: { equals: user.id } },
                { status: { equals: 'accepted' } },
              ],
            },
            limit: 1,
            sort: '-createdAt',
          })
          planRequest = requestResults.docs[0] || null
        } catch (err) {
          console.error('Error fetching plan request:', err)
        }

        return {
          ...assignment,
          fitness: fitnessData,
          tier: planRequest?.tier || null,
          goals: fitnessData?.goals || [],
        }
      }),
    )

    return NextResponse.json({
      success: true,
      data: enrichedAssignments,
      total: results.totalDocs,
    })
  } catch (error: any) {
    console.error('Trainer assignments GET error', error)
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 })
  }
}
