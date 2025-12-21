'use client'
import React, { useMemo, useState, useEffect } from 'react'
import { SectionFade } from '@/components/animations/SectionFade'
import { Clock3, Flame } from 'lucide-react'

interface WorkoutEntry {
  name: string
  reps: string
  sets: number
  weight: string
}

interface DayWorkout {
  title: string
  duration: number
  entries: WorkoutEntry[]
}

interface WeeklyWorkoutPlan {
  [key: string]: DayWorkout
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

export default function WorkoutPlan() {
  const [activeDayKey, setActiveDayKey] = useState<string>('wednesday')
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyWorkoutPlan | null>(null)
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
      const response = await fetch('/api/active-plan?type=workout')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.plan) {
          console.log('Workout plan received:', data.plan)
          setWeeklyPlan(data.plan)
        } else {
          console.error('Failed to get workout plan:', data)
        }
      } else {
        console.error('Failed to fetch workout plan:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching workout plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const rotatedDays = useMemo(() => {
    const today = new Date()
    const todayIndex = today.getDay() // 0=Sun
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

  const getDayLabel = (dayKey: string) => {
    const day = weekDays.find((d) => d.key === dayKey)
    return day?.label || dayKey
  }

  const getDayFocus = (dayKey: string) => {
    const day = weekDays.find((d) => d.key === dayKey)
    return day?.focus || ''
  }

  const getDateLabel = (dayIndex: number) => {
    const today = new Date()
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + dayIndex)
    return targetDate.getDate().toString()
  }

  const blocks = rotatedDays.map((d, index) => {
    const dayPlan = weeklyPlan?.[d.key] || {
      title: 'Rest',
      duration: 0,
      entries: [],
    }
    return {
      dayKey: d.key,
      ...dayPlan,
      label: d.label,
      dateLabel: getDateLabel(index),
      focus: d.focus,
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Loading workout plan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-12 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-16 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <SectionFade className="max-w-6xl mx-auto relative z-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-orange-400 uppercase tracking-wide">Workout Plan</p>
            <h1 className="text-4xl font-bold">Your personalised training schedule</h1>
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
            You are on the Essential plan. Upgrade to unlock trainer-personalized workouts.
            Meanwhile, here's your generic plan.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 w-full h-28">
          {rotatedDays.map((day, index) => {
            const isActive = activeDayKey === day.key
            return (
              <button
                key={day.label}
                onClick={() => setActiveDayKey(day.key)}
                className={`w-full text-left px-4 py-3 rounded-2xl border ${
                  isActive
                    ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/30'
                    : 'bg-white/5 text-gray-200 border-white/10 hover:bg-white/10'
                }`}
              >
                <p className="text-xs opacity-80">{day.label}</p>
                <p className="text-lg font-semibold">{getDateLabel(index)}</p>
                <p className="text-xs opacity-80">{day.focus}</p>
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {blocks.map((block) => (
            <div
              key={block.dayKey}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div>
                  <p className="text-xs text-gray-300">{block.label}</p>
                  <h3 className="text-lg font-semibold">{block.title}</h3>
                </div>
                {block.duration ? (
                  <span className="flex items-center gap-2 text-xs px-3 py-2 rounded-full bg-white/10 border border-white/10">
                    <Clock3 className="w-4 h-4 text-orange-400" />
                    {block.duration} min
                  </span>
                ) : (
                  <span className="text-xs px-3 py-2 rounded-full bg-white/10 border border-white/10">
                    Rest
                  </span>
                )}
              </div>

              {block.entries.length === 0 ? (
                <div className="p-5 text-sm text-gray-400">
                  Recovery day. Mobility & light walk recommended.
                </div>
              ) : (
                <div className="p-5">
                  <div className="grid grid-cols-4 text-xs text-gray-400 uppercase tracking-wide pb-3 border-b border-white/10">
                    <span>Exercise</span>
                    <span>Repetition</span>
                    <span>Sets</span>
                    <span className="text-right">Weight</span>
                  </div>
                  <div className="divide-y divide-white/10">
                    {block.entries.map((entry, idx) => (
                      <div
                        key={`${entry.name}-${idx}`}
                        className="grid grid-cols-4 py-3 text-sm items-center"
                      >
                        <span className="font-medium text-white">{entry.name}</span>
                        <span className="text-gray-300">{entry.reps}</span>
                        <span className="text-gray-300">{entry.sets}</span>
                        <span className="text-gray-300 text-right">{entry.weight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionFade>
    </div>
  )
}
