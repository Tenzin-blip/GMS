'use client'
import React, { useMemo } from 'react'
import { Calendar, Utensils, Dumbbell, Gauge } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

const attendance = { current: 12, total: 22 }
const mealCompletion = 10
const mealTotal = 14
const workoutCompletion = 9
const workoutTotal = 12

export default function ProgressTracker() {
  const searchParams = useSearchParams()
  const planTier = (searchParams.get('plan') as 'essential' | 'premium' | 'elite') || 'premium'
  if (planTier === 'essential') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 flex items-center justify-center">
        <div className="max-w-xl bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl text-center space-y-3">
          <h2 className="text-2xl font-bold">Upgrade to track your progress</h2>
          <p className="text-gray-300 text-sm">
            Progress tracking is available on Premium and Elite plans. Upgrade to unlock
            personalized tracking and analytics.
          </p>
          <button className="px-5 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition">
            Upgrade plan
          </button>
        </div>
      </div>
    )
  }
  const attendanceRatio = attendance.total ? attendance.current / attendance.total : 0
  const mealRatio = mealTotal ? mealCompletion / mealTotal : 0
  const workoutRatio = workoutTotal ? workoutCompletion / workoutTotal : 0
  const overall = useMemo(
    () => Math.round(((attendanceRatio + mealRatio + workoutRatio) / 3) * 100),
    [attendanceRatio, mealRatio, workoutRatio],
  )

  const cards = [
    {
      title: 'Overall progress',
      icon: <Gauge className="w-5 h-5 text-orange-400" />,
      percent: overall,
      detail: 'Based on attendance, meals, and workouts',
    },
    {
      title: 'Attendance',
      icon: <Calendar className="w-5 h-5 text-orange-400" />,
      percent: Math.round(attendanceRatio * 100),
      detail: `${attendance.current}/${attendance.total} days this month`,
    },
    {
      title: 'Meals completed',
      icon: <Utensils className="w-5 h-5 text-orange-400" />,
      percent: Math.round(mealRatio * 100),
      detail: `${mealCompletion}/${mealTotal} meals`,
    },
    {
      title: 'Workouts completed',
      icon: <Dumbbell className="w-5 h-5 text-orange-400" />,
      percent: Math.round(workoutRatio * 100),
      detail: `${workoutCompletion}/${workoutTotal} sessions`,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-orange-400 uppercase tracking-wide">Progress</p>
            <h1 className="text-4xl font-bold">Your daily completion overview</h1>
            <p className="text-sm text-gray-300 mt-1">
              Attendance, meals, and workouts roll into one progress indicator.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-gray-200 text-sm font-medium">{card.title}</h3>
                <div className="p-2 bg-orange-500/10 rounded-lg">{card.icon}</div>
              </div>
              <div className="text-3xl font-bold text-white">{card.percent}%</div>
              <p className="text-xs text-gray-400">{card.detail}</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${card.percent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Daily ticks</h3>
            <div className="space-y-3">
              {[
                { label: 'Attendance', value: attendanceRatio },
                { label: 'Meals', value: mealRatio },
                { label: 'Workouts', value: workoutRatio },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-sm text-gray-300 mb-1">
                    <span>{row.label}</span>
                    <span>{Math.round(row.value * 100)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${Math.round(row.value * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Notes</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Progress recalculates as you mark meals/workouts and attend sessions.</li>
              <li>Generic plans are shown until your trainer publishes new plans.</li>
              <li>Each day refreshes to the current plan automatically.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
