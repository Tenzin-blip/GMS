'use client'
import React, { useMemo, useEffect, useState } from 'react'
import { Calendar, Utensils, Dumbbell, Gauge, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

const attendance = { current: 12, total: 22 }
const mealCompletion = 10
const mealTotal = 14
const workoutCompletion = 9
const workoutTotal = 12

export default function ProgressTracker() {
  const router = useRouter()
  const [userPlan, setUserPlan] = useState<'essential' | 'premium' | 'elite' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const response = await fetch('/api/user/me', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (response.ok) {
          const data = await response.json()
          setUserPlan(data.user?.plan || 'essential')
        } else {
          // Default to essential if fetch fails
          setUserPlan('essential')
        }
      } catch (error) {
        console.error('Error fetching user plan:', error)
        setUserPlan('essential')
      } finally {
        setLoading(false)
      }
    }

    fetchUserPlan()
  }, [])

  const attendanceRatio = attendance.total ? attendance.current / attendance.total : 0
  const mealRatio = mealTotal ? mealCompletion / mealTotal : 0
  const workoutRatio = workoutTotal ? workoutCompletion / workoutTotal : 0
  const overall = useMemo(
    () => Math.round(((attendanceRatio + mealRatio + workoutRatio) / 3) * 100),
    [attendanceRatio, mealRatio, workoutRatio],
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your progress...</p>
        </div>
      </div>
    )
  }

  if (userPlan === 'essential') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-2xl relative z-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-10 backdrop-blur-xl text-center space-y-6">
            <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-10 h-10 text-orange-400" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-bold">Upgrade to Track Your Progress</h2>
              <p className="text-gray-300 text-base leading-relaxed">
                Progress tracking is available on <span className="text-orange-400 font-semibold">Premium</span> and{' '}
                <span className="text-orange-400 font-semibold">Elite</span> plans. Upgrade now to unlock personalized
                tracking, detailed analytics, and custom meal and workout plans tailored to your goals.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                <h3 className="font-semibold text-orange-400 mb-2">Premium Plan</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>✓ Progress tracking</li>
                  <li>✓ Personalized plans</li>
                  <li>✓ Trainer matching</li>
                </ul>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                <h3 className="font-semibold text-orange-400 mb-2">Elite Plan</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>✓ Everything in Premium</li>
                  <li>✓ Priority support</li>
                  <li>✓ Advanced analytics</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => router.push('/upgrade-plan')}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-semibold transition-all shadow-lg shadow-orange-500/25"
              >
                Upgrade Now
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
          <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-xl">
            <span className="text-sm text-orange-300 font-medium capitalize">{userPlan} Plan</span>
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
                    className="h-full bg-orange-500 rounded-full transition-all duration-500"
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
                      className="h-full bg-orange-500 rounded-full transition-all duration-500"
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