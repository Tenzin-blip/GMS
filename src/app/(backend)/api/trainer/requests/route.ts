import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config })
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
      depth: 1,
    })

    return NextResponse.json({ success: true, data: results.docs })
  } catch (error: any) {
    console.error('Trainer requests GET error', error)
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config })
    const { user } = await payload.auth({ headers: req.headers })

    if (!user || user.role !== 'trainer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { requestId, action } = await req.json()
    if (!requestId || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const requestRecord = await payload.findByID({
      collection: 'plan-requests',
      id: requestId,
    })

    if (!requestRecord || requestRecord.assignedTrainer !== user.id) {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
    }

    if (requestRecord.status !== 'pending') {
      return NextResponse.json({ error: 'Request already handled' }, { status: 400 })
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected'

    const updated = await payload.update({
      collection: 'plan-requests',
      id: requestId,
      data: {
        status: newStatus,
        respondedAt: new Date().toISOString(),
      },
    })

    let assignment = null
    if (newStatus === 'accepted') {
      assignment = await payload.create({
        collection: 'trainee-assignments',
        data: {
          trainer: user.id,
          user: requestRecord.user,
          status: 'active',
          startedAt: new Date().toISOString(),
        },
      })

      await payload.update({
        collection: 'users',
        id: requestRecord.user,
        data: {
          currentTrainer: user.id,
        },
      })
    }

    return NextResponse.json({ success: true, request: updated, assignment })
  } catch (error: any) {
    console.error('Trainer requests POST error', error)
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 })
  }
}

