import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: req.headers })

    if (!user || user.role !== 'trainer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { specializations, workingDays, workingHours, notes } = body || {}

    if (
      !Array.isArray(specializations) ||
      !Array.isArray(workingDays) ||
      !workingHours?.start ||
      !workingHours?.end
    ) {
      return NextResponse.json({ error: 'Missing required onboarding fields' }, { status: 400 })
    }

    const existing = await payload.find({
      collection: 'trainer-profiles',
      where: {
        user: { equals: user.id },
      },
      limit: 1,
    })

    let record
    if (existing.docs.length > 0) {
      record = await payload.update({
        collection: 'trainer-profiles',
        id: existing.docs[0].id,
        data: {
          specializations,
          workingDays,
          workingHours,
          notes,
          status: 'active',
        },
      })
    } else {
      record = await payload.create({
        collection: 'trainer-profiles',
        data: {
          user: user.id,
          specializations,
          workingDays,
          workingHours,
          notes,
          status: 'active',
        },
      })
    }

    return NextResponse.json({ success: true, profile: record })
  } catch (error: any) {
    console.error('Trainer onboarding error', error)
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 })
  }
}
