import { NextResponse } from 'next/server'

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY environment variable')
}

const MODEL = 'gemini-2.5-flash'

export async function POST(request: Request) {
  try {
    console.log('POST request received')
    console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY)
    console.log('GEMINI_API_KEY first 10 chars:', process.env.GEMINI_API_KEY?.substring(0, 10))

    let memberData
    try {
      memberData = await request.json()
      console.log('Received member data:', JSON.stringify(memberData).substring(0, 200))
    } catch (jsonError) {
      console.error('Failed to parse JSON:', jsonError)
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    // Build structured prompt from member data
    const prompt = buildPrompt(memberData)
    console.log('Built prompt, length:', prompt.length)

    // Call Gemini API
    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

    console.log('Calling Gemini API...')
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY || '',
      },
      body: JSON.stringify(payload),
    })

    console.log('Gemini response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }
      return NextResponse.json(
        { error: 'Gemini API error', details: errorData },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log('Gemini response received')

    const generatedText = data.candidates[0].content.parts[0].text

    // Try to parse as JSON (if Gemini returns structured data)
    let parsedPlan
    try {
      const cleaned = generatedText.replace(/```json|```/g, '').trim()
      parsedPlan = JSON.parse(cleaned)
      console.log('Successfully parsed JSON plan')
    } catch (e) {
      console.log('Could not parse as JSON, returning raw response')
      // If not JSON, return as raw text
      parsedPlan = { rawResponse: generatedText }
    }

    return NextResponse.json({
      success: true,
      plan: parsedPlan,
      rawResponse: generatedText,
    })
  } catch (error: any) {
    console.error('Error in POST handler:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      {
        error: 'Failed to generate plan',
        details: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}

function buildPrompt(memberData: any): string {
  const { user, fitness } = memberData

  // Extract data with safe fallbacks
  const name = user?.name || 'User'
  const goals = fitness?.goals?.join(', ') || 'General Fitness'
  const height = fitness?.bodyMetrics?.height || 'N/A'
  const currentWeight = fitness?.bodyMetrics?.currentWeight || 'N/A'
  const targetWeight = fitness?.bodyMetrics?.targetWeight || 'N/A'
  const dailyCalories = fitness?.dailyCalories?.target || 'N/A'
  const dietType = fitness?.mealPlan?.dietType || 'N/A'
  const allergies = fitness?.mealPlan?.allergies?.map((a: any) => a.allergen).join(', ') || 'None'
  const dietPreferences = fitness?.mealPlan?.preferences || 'None'
  const workoutFrequency = fitness?.workoutPlan?.frequency || 'N/A'
  const workoutDuration = fitness?.workoutPlan?.duration || 'N/A'
  const preferredDays = fitness?.workoutPlan?.preferredDays?.join(', ') || 'N/A'
  const preferredTypes = fitness?.workoutPlan?.preferredTypes?.join(', ') || 'N/A'

  return `You are an expert fitness trainer and nutritionist. Create a comprehensive personalized workout and meal plan for the following client.

CLIENT INFORMATION:
Name: ${name}
Goals: ${goals}

BODY METRICS:
- Height: ${height} cm
- Current Weight: ${currentWeight} kg
- Target Weight: ${targetWeight} kg
- Daily Calorie Target: ${dailyCalories} calories

DIETARY PREFERENCES:
- Diet Type: ${dietType}
- Allergies: ${allergies}
- Additional Preferences: ${dietPreferences}

WORKOUT PREFERENCES:
- Frequency: ${workoutFrequency}x per week
- Duration: ${workoutDuration} minutes per session
- Preferred Days: ${preferredDays}
- Preferred Types: ${preferredTypes}

IMPORTANT: Return ONLY a valid JSON object with the following exact structure (no additional text, no markdown):

{
  "workout_plan": {
    "overview": "Brief overview of the workout approach",
    "weekly_schedule": [
      {
        "day": "Monday",
        "focus": "Chest & Triceps",
        "exercises": [
          {
            "name": "Bench Press",
            "sets": 4,
            "reps": "8-10",
            "rest": "90s",
            "notes": "Focus on form"
          }
        ]
      }
    ]
  },
  "meal_plan": {
    "overview": "Brief overview of the meal plan approach",
    "daily_meals": [
      {
        "day": "Monday",
        "meals": [
          {
            "type": "Breakfast",
            "time": "8:00 AM",
            "items": ["2 eggs", "whole wheat toast", "avocado"],
            "calories": 450,
            "protein": 25,
            "carbs": 35,
            "fats": 20
          }
        ],
        "total_calories": 2645
      }
    ]
  }
}

Generate a complete 7-day plan considering the client's goals, metrics, and preferences.`
}

export async function GET() {
  return NextResponse.json({
    message: 'Hello from gemini_brr!',
    data: {
      name: 'Test User',
      age: 25,
      hobbies: ['coding', 'gaming', 'fitness'],
    },
    timestamp: new Date().toISOString(),
  })
}
