// app/api/trainer/assignments/route.ts
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
      trainer: { equals: user.id },
    }
    
    if (status) {
      where.status = { equals: status }
    }

    const results = await payload.find({
      collection: 'trainee-assignments',
      where,
      sort: '-startedAt',
      depth: 2,
    })

    return NextResponse.json({ success: true, data: results.docs })
  } catch (error: any) {
    console.error('Trainer assignments GET error', error)
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 })
  }
}