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
      assignedTrainer: { equals: user.id },
    }
    if (status) {
      where.status = { equals: status }
    }

    const results = await payload.find({
      collection: 'plan-requests',
      where,
      sort: '-createdAt',
      depth: 2,
    })

    return NextResponse.json({ success: true, data: results.docs })
  } catch (error: any) {
    console.error('Trainer requests GET error', error)
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: req.headers })

    if (!user || user.role !== 'trainer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { requestId, action, rejectionReason } = await req.json()
    if (!requestId || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Fetch the request with user data
    const requestRecord = await payload.findByID({
      collection: 'plan-requests',
      id: requestId,
      depth: 1,
    })

    // ✅ FIX: Extract ID from assignedTrainer (which is an object due to depth: 1)
    const trainerId =
      typeof requestRecord.assignedTrainer === 'string'
        ? requestRecord.assignedTrainer
        : requestRecord.assignedTrainer?.id

    if (!requestRecord || trainerId !== user.id) {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
    }

    // Rest of your code stays the same...
    if (requestRecord.status !== 'pending') {
      return NextResponse.json({ error: 'Request already handled' }, { status: 400 })
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected'

    const updateData: any = {
      status: newStatus,
      respondedAt: new Date().toISOString(),
    }

    if (action === 'reject' && rejectionReason) {
      updateData.rejectionReason = rejectionReason
    }

    const updated = await payload.update({
      collection: 'plan-requests',
      id: requestId,
      data: updateData,
    })

    let assignment = null

    if (newStatus === 'accepted') {
      const existingAssignment = await payload.find({
        collection: 'trainee-assignments',
        where: {
          and: [{ user: { equals: requestRecord.user } }, { trainer: { equals: user.id } }],
        },
      })

      if (existingAssignment.docs.length === 0) {
        assignment = await payload.create({
          collection: 'trainee-assignments',
          data: {
            trainer: user.id,
            user: requestRecord.user,
            status: 'active',
            planStatus: 'pending',
            startedAt: new Date().toISOString(),
          },
        })

        await payload.update({
          collection: 'users',
          id: typeof requestRecord.user === 'string' ? requestRecord.user : requestRecord.user.id,
          data: {
            currentTrainer: user.id,
          },
        })

        console.log(`✅ Created trainee assignment for user ${requestRecord.user}`)
      } else {
        assignment = existingAssignment.docs[0]

        if (assignment.status !== 'active') {
          assignment = await payload.update({
            collection: 'trainee-assignments',
            id: assignment.id,
            data: {
              status: 'active',
            },
          })
        }

        console.log(`ℹ️ Trainee assignment already exists for user ${requestRecord.user}`)
      }
    }

    return NextResponse.json({
      success: true,
      request: updated,
      assignment,
      message: action === 'accept' ? 'Request accepted and member added!' : 'Request rejected',
    })
  } catch (error: any) {
    console.error('Trainer requests POST error', error)
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 })
  }
}
