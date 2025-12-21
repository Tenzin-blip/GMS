import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config })
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

    return NextResponse.json({ success: true, plan: created })
  } catch (error: any) {
    console.error('Plan submit error', error)
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 })
  }
}

