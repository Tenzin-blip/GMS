import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const planType = searchParams.get('type') || 'workout' // 'workout' or 'meal'

    // First, check if user has an active plan in PlanVersions
    const activePlanVersion = await payload.find({
      collection: 'plan-versions',
      where: {
        and: [
          {
            user: { equals: user.id },
          },
          {
            type: { equals: planType },
          },
          {
            status: { equals: 'active' },
          },
        ],
      },
      limit: 1,
      sort: '-activatedAt', // Get the most recently activated one
    })

    if (activePlanVersion.docs.length > 0) {
      const plan = activePlanVersion.docs[0]
      return NextResponse.json({
        success: true,
        plan: plan.payload,
        source: plan.source,
        isDefault: false,
        activatedAt: plan.activatedAt,
      })
    }

    // If no active plan, fetch default plan from Global
    const defaultPlans = await payload.findGlobal({
      slug: 'default-plans',
    })

    if (!defaultPlans) {
      return NextResponse.json(
        {
          error:
            'Default plans not configured. Please initialize the Default Plans global in the admin panel.',
        },
        { status: 500 },
      )
    }

    // Get default plan from Global (contains all 7 days: sunday through saturday)
    const defaultPlan =
      planType === 'meal' ? defaultPlans.defaultMealPlan : defaultPlans.defaultWorkoutPlan

    if (!defaultPlan) {
      return NextResponse.json(
        {
          error: `Default ${planType} plan not found in Global. Please configure it in the admin panel.`,
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      plan: defaultPlan,
      source: 'generic',
      isDefault: true,
    })
  } catch (error: any) {
    console.error('Error fetching active plan:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
