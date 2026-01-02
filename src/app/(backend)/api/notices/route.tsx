import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config: configPromise })

    // Get query parameters from URL
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '20'
    const sort = searchParams.get('sort') || '-date'

    // Fetch notices from Payload
    const notices = await payload.find({
      collection: 'notices',
      where: {
        isActive: {
          equals: true,
        },
      },
      sort,
      limit: parseInt(limit),
      page: parseInt(page),
    })

    return NextResponse.json(notices, { status: 200 })
  } catch (error) {
    console.error('Error fetching notices:', error)
    return NextResponse.json({ error: 'Failed to fetch notices' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const { user } = await payload.auth({ headers: request.headers })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can create notices.' },
        { status: 403 },
      )
    }

    // Create new notice
    const notice = await payload.create({
      collection: 'notices',
      data: body,
    })

    return NextResponse.json(notice, { status: 201 })
  } catch (error) {
    console.error('Error creating notice:', error)
    return NextResponse.json({ error: 'Failed to create notice' }, { status: 500 })
  }
}
