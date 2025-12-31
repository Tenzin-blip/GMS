'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { Flame } from 'lucide-react'

interface Meal {
  name: string
  slot: string
  calories: number
  protein: number
  carbs: number
  fats: number
  description: string
}

interface WeeklyMealPlan {
  [key: string]: Meal[]
}

const weekDays = [
  { key: 'sunday', label: 'Sun', focus: 'Upper' },
  { key: 'monday', label: 'Mon', focus: 'Lower' },
  { key: 'tuesday', label: 'Tue', focus: 'Active' },
  { key: 'wednesday', label: 'Wed', focus: 'Chest' },
  { key: 'thursday', label: 'Thu', focus: 'Leg' },
  { key: 'friday', label: 'Fri', focus: 'Core' },
  { key: 'saturday', label: 'Sat', focus: 'Rest' },
]

export default function MealPlan() {
  const [activeDayKey, setActiveDayKey] = useState<string>('wednesday')
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyMealPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [planTier, setPlanTier] = useState<'essential' | 'premium' | 'elite'>('premium')

  useEffect(() => {
    fetchActivePlan()
    fetchUserPlan()
  }, [])

  const fetchUserPlan = async () => {
    try {
      const response = await fetch('/api/user-fitness')
      if (response.ok) {
        const data = await response.json()
        if (data?.data?.plan) {
          setPlanTier(data.data.plan)
        }
      }
    } catch (error) {
      console.error('Error fetching user plan:', error)
    }
  }

  const fetchActivePlan = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/active-plan?type=meal')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.plan) {
          console.log('Meal plan received:', data.plan)
          setWeeklyPlan(data.plan)
        } else {
          console.error('Failed to get meal plan:', data)
        }
      } else {
        console.error('Failed to fetch meal plan:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching meal plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const rotatedDays = useMemo(() => {
    const todayIndex = new Date().getDay()
    return [...weekDays.slice(todayIndex), ...weekDays.slice(0, todayIndex)]
  }, [])

  useEffect(() => {
    if (rotatedDays.length > 0) {
      const todayKey = rotatedDays[0]?.key
      if (todayKey) {
        setActiveDayKey(todayKey)
      }
    }
  }, [rotatedDays])

  const getDateLabel = (dayIndex: number) => {
    const today = new Date()
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + dayIndex)
    return targetDate.getDate().toString()
  }

  const getDayTotalCalories = (meals: Meal[]) => {
    return meals.reduce((total, meal) => total + meal.calories, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Loading meal plan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-12 left-8 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-12 right-10 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-orange-400 uppercase tracking-wide">Meal Plan</p>
            <h1 className="text-4xl font-bold">Your personalised weekly nutrition schedule</h1>
            <p className="text-sm text-gray-300 mt-1">Starting from today • tap any day to switch</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-gray-200">
              {new Intl.DateTimeFormat('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }).format(new Date())}
            </span>
          </div>
        </div>

        {planTier === 'essential' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-gray-200 backdrop-blur-xl">
            You are on the Essential plan. Upgrade to unlock trainer-personalized meals. Meanwhile,
            here's your generic plan.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 w-full h-28">
          {rotatedDays.map((day, index) => (
            <button
              key={day.key}
              onClick={() => setActiveDayKey(day.key)}
              className={`w-full px-4 py-3 rounded-2xl border text-left ${
                activeDayKey === day.key
                  ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/30'
                  : 'bg-white/5 text-gray-200 border-white/10 hover:bg-white/10'
              }`}
            >
              <p className="text-xs opacity-80">{day.label}</p>
              <p className="text-lg font-semibold">{getDateLabel(index)}</p>
              <p className="text-xs opacity-80">{day.focus}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {rotatedDays.map((d, index) => {
            const meals = weeklyPlan?.[d.key] || []
            const totalCalories = getDayTotalCalories(meals)
            return (
              <div
                key={d.key}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                  <div>
                    <p className="text-xs text-gray-300">{d.label}</p>
                  </div>
                  <span className="text-xs px-3 py-2 rounded-full bg-white/10 border border-white/10">
                    {totalCalories} cal
                  </span>
                </div>

                <div className="divide-y divide-white/10">
                  {meals.length === 0 ? (
                    <div className="p-5 text-sm text-gray-400">
                      No meals scheduled for this day.
                    </div>
                  ) : (
                    meals.map((meal, idx) => (
                      <div key={`${meal.slot}-${idx}`} className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <p className="font-semibold text-sm">{meal.name}</p>
                            <p className="text-xs text-gray-400">
                              {meal.calories} cal • P: {meal.protein}g • C: {meal.carbs}g • F:{' '}
                              {meal.fats}g
                            </p>
                          </div>
                          <span className="text-xs px-3 py-1 rounded-full bg-orange-500/10 border border-orange-400/30 text-orange-100">
                            {meal.slot}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{meal.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
