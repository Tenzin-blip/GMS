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

    const existing = await payload.find({
      collection: 'trainer-profiles',
      where: {
        user: { equals: user.id },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return NextResponse.json({ success: true, profile: existing.docs[0] })
    }

    return NextResponse.json({ success: true, profile: null })
  } catch (error: any) {
    console.error('Trainer profile fetch error', error)
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 })
  }
}
