// app/api/gemini_brr/route.ts
import { NextResponse } from 'next/server'

const API_KEY = 'AIzaSyCRbn41PLttPttF9-vy38yeeAyPwRjMqNI'
const MODEL = 'models/gemini-2.5-flash'

export async function POST(request: Request) {
  try {
    const memberData = await request.json()

    // Build structured prompt from member data
    const prompt = buildPrompt(memberData)

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: 'Gemini API error', details: errorData },
        { status: response.status },
      )
    }

    const data = await response.json()
    const generatedText = data.candidates[0].content.parts[0].text

    // Try to parse as JSON (if Gemini returns structured data)
    let parsedPlan
    try {
      const cleaned = generatedText.replace(/```json|```/g, '').trim()
      parsedPlan = JSON.parse(cleaned)
    } catch {
      // If not JSON, return as raw text
      parsedPlan = { rawResponse: generatedText }
    }

    return NextResponse.json({
      success: true,
      plan: parsedPlan,
      rawResponse: generatedText,
    })
  } catch (error: any) {
    console.error('Error generating plan:', error)
    return NextResponse.json(
      { error: 'Failed to generate plan', details: error.message },
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
