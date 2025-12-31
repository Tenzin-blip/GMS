'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Notices from '@/components/system/dashboard/Notices'
import DashboardHeader from '@/components/system/dashboard/DashboardHeader'
import AttendanceStatCard from '@/components/system/attendance/AttendanceStatCard'
import { Calendar, Flame, Clock, Users, TrendingUp, Trophy } from 'lucide-react'

interface UserFitnessData {
  user: string
  plan?: 'essential' | 'premium' | 'elite'
  goal: string
  bodyMetrics: {
    height: number
    currentWeight: number
    targetWeight: number
  }
  dailyCalories: {
    target: number
    consumed: number
    burned: number
  }
  mealPlan: {
    dietType: string
    allergies: Array<{ allergen: string }>
    preferences: string
  }
  workoutPlan: {
    frequency: number
    duration: number
    preferredDays: string[]
    preferredTypes: string[]
  }
}

interface MealPlanItem {
  name: string
  time: string
  calories: number
  description: string
}

interface WorkoutPlanItem {
  name: string
  sets: string
}

interface WeeklyMealPlan {
  [key: string]: Array<{
    name: string
    slot: string
    calories: number
    protein: number
    carbs: number
    fats: number
    description: string
  }>
}

interface WeeklyWorkoutPlan {
  [key: string]: {
    title: string
    duration: number
    entries: Array<{
      name: string
      reps: string
      sets: number
      weight: string
    }>
  }
}

export default function Dashboard() {
  const [fitnessData, setFitnessData] = useState<UserFitnessData | null>(null)
  const [attendance] = useState({ current: 12, total: 22 })
  const [streak] = useState(5)
  const [mealCompletion, setMealCompletion] = useState<Set<number>>(new Set())
  const [workoutCompletion, setWorkoutCompletion] = useState<Set<number>>(new Set())
  const [planTier, setPlanTier] = useState<'essential' | 'premium' | 'elite'>('premium')
  const [showGenericToast, setShowGenericToast] = useState(false)
  const [mealPlan, setMealPlan] = useState<MealPlanItem[]>([])
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlanItem[]>([])
  const [plansLoading, setPlansLoading] = useState(true)

  useEffect(() => {
    fetchFitnessData()
    fetchActivePlans()
  }, [])

  const fetchFitnessData = async () => {
    try {
      const response = await fetch('/api/user-fitness')
      if (response.ok) {
        const data = await response.json()
        setFitnessData(data.data)
        if (data?.data?.plan) {
          setPlanTier(data.data.plan)
        }
      }
    } catch (error) {
      console.error('Error fetching fitness data:', error)
    }
  }

  const getTodayDayKey = () => {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const today = new Date().getDay()
    return dayNames[today]
  }

  const fetchActivePlans = async () => {
    try {
      setPlansLoading(true)
      const todayKey = getTodayDayKey()

      // Fetch meal plan
      const mealResponse = await fetch('/api/active-plan?type=meal')
      if (mealResponse.ok) {
        const mealData = await mealResponse.json()
        if (mealData.success && mealData.plan) {
          const plan = mealData.plan
          // Check if it's weekly structure (object) or old format (array)
          if (typeof plan === 'object' && !Array.isArray(plan)) {
            const weeklyPlan = plan as WeeklyMealPlan
            const todayMeals = weeklyPlan[todayKey] || []
            // Convert to dashboard format
            const dashboardMeals: MealPlanItem[] = todayMeals.map((meal) => ({
              name: meal.name,
              time: meal.slot,
              calories: meal.calories,
              description: meal.description,
            }))
            setMealPlan(dashboardMeals)
          } else if (Array.isArray(plan)) {
            // Old format - use as is
            setMealPlan(plan)
          }
        }
      }

      // Fetch workout plan
      const workoutResponse = await fetch('/api/active-plan?type=workout')
      if (workoutResponse.ok) {
        const workoutData = await workoutResponse.json()
        if (workoutData.success && workoutData.plan) {
          const plan = workoutData.plan
          // Check if it's weekly structure (object) or old format (array)
          if (typeof plan === 'object' && !Array.isArray(plan)) {
            const weeklyPlan = plan as WeeklyWorkoutPlan
            const todayWorkout = weeklyPlan[todayKey]
            // Convert to dashboard format
            const dashboardWorkouts: WorkoutPlanItem[] =
              todayWorkout?.entries.map((entry) => {
                // If it's a duration-based entry (like warmup with "10 min"), use reps directly
                // Otherwise combine sets and reps (e.g., "4 x 8 rep")
                const setsValue =
                  entry.reps.includes('min') || entry.reps.includes('sec')
                    ? entry.reps
                    : `${entry.sets} x ${entry.reps}`
                return {
                  name: entry.name,
                  sets: setsValue,
                }
              }) || []
            setWorkoutPlan(dashboardWorkouts)
          } else if (Array.isArray(plan)) {
            // Old format - use as is
            setWorkoutPlan(plan)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching active plans:', error)
    } finally {
      setPlansLoading(false)
    }
  }

  const leaderboardData = [
    {
      name: 'Swoyam Pokharel',
      rank: 2,
      total: 520,
      squat: 180,
      bench: 120,
      deadlift: 220,
      gender: 'Male',
      weight: 62,
      month: 'Sep 2025',
      progress: 15,
    },
    {
      name: 'Tenzin Dolker',
      rank: 1,
      total: 520,
      squat: 180,
      bench: 120,
      deadlift: 220,
      gender: 'Female',
      weight: 68,
      month: 'Sep 2025',
      progress: 10,
    },
    {
      name: 'Dayjen Jigme',
      rank: 2,
      total: 520,
      squat: 180,
      bench: 120,
      deadlift: 220,
      gender: 'Male',
      weight: 75,
      month: 'Sep 2025',
      progress: 5,
    },
  ]

  const attendanceRatio = attendance.total ? attendance.current / attendance.total : 0
  const mealRatio = mealPlan.length ? mealCompletion.size / mealPlan.length : 0
  const workoutRatio = workoutPlan.length ? workoutCompletion.size / workoutPlan.length : 0
  const overallProgress = Math.round(((attendanceRatio + mealRatio + workoutRatio) / 3) * 100)
  const isEssential = planTier === 'essential'

  const attendanceStats = [
    {
      title: 'Attendance',
      value: `${attendance.current}/${attendance.total}`,
      subtitle: 'Days this month',
      icon: Calendar,
    },
    {
      title: 'Streak',
      value: `${streak} days`,
      subtitle: 'Current active streak',
      icon: Flame,
    },
    {
      title: 'Avg duration',
      value: '1h 12m',
      subtitle: 'Per session',
      icon: Clock,
    },
    {
      title: 'Total hours',
      value: '28h',
      subtitle: 'This month',
      icon: TrendingUp,
    },
  ]

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(
        new Date(),
      ),
    [],
  )

  useEffect(() => {
    if ((planTier === 'premium' || planTier === 'elite') && !showGenericToast) {
      setShowGenericToast(true)
      const toastEvent = new CustomEvent('toast', {
        detail: {
          message: 'You are viewing a generic plan. Your trainer will update this soon.',
          type: 'info',
        },
      })
      window.dispatchEvent(toastEvent)
    }
  }, [planTier, showGenericToast])

  const toggleMeal = (idx: number) => {
    setMealCompletion((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const toggleWorkout = (idx: number) => {
    setWorkoutCompletion((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Header */}
        <div>
          <DashboardHeader />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {attendanceStats.map((stat) => (
            <AttendanceStatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={stat.icon}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Notice Board */}
          <div className="space-y-6">
            {/* Notice Board */}
            <Notices />

            <div className="backdrop-blur-xl bg-white/5 rounded-xl p-6 border border-white/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-bold">Active members</h2>
                </div>
                <p className="text-sm text-gray-400 mb-4">Trainers available</p>
                <div className="space-y-1 text-sm text-gray-300">
                  <div>Hari Bohot</div>
                  <div>Peter Guru</div>
                  <div>Stephan Guru</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Meal & Workout Plans */}
          <div className="space-y-6">
            {isEssential ? (
              <UpgradeCard />
            ) : plansLoading ? (
              <div className="backdrop-blur-xl bg-white/5 rounded-xl p-6 border border-white/10 text-center text-gray-400">
                Loading plans...
              </div>
            ) : (
      
                <PlanSnippet
                  title="Meal plan"
                  subtitle={todayLabel}
                  items={mealPlan.map((m) => ({
                    title: m.name,
                    meta: `🔥 ${m.calories} cal • ${m.time}`,
                    detail: m.description,
                  }))}
                  progress={mealRatio}
                  completion={mealCompletion}
                  onToggle={toggleMeal}
                />

                
            )}
          </div>

          <div className="space-y-6">
            {isEssential ? (
              <UpgradeCard />
            ) : plansLoading ? (
              <div className="backdrop-blur-xl bg-white/5 rounded-xl p-6 border border-white/10 text-center text-gray-400">
                Loading plans...
              </div>
            ) : (
              

                <PlanSnippet
                  title="Workout plan"
                  subtitle={todayLabel}
                  items={workoutPlan.map((w) => ({
                    title: w.name,
                    meta: w.sets,
                    detail: '',
                  }))}
                  progress={workoutRatio}
                  completion={workoutCompletion}
                  onToggle={toggleWorkout}
                />
              
            )}
          </div>
        </div>
      </div>
      {/* Middle Column - Leaderboard */}
          <div className="backdrop-blur-xl bg-white/5 rounded-xl p-6 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold">Leaderboard</h2>
              </div>

              <div className="space-y-4 flex justify-content ">
                {leaderboardData.map((member, idx) => (
                  <div
                    key={idx}
                    className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-bold">
                          {member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <h3 className="font-bold">{member.name}</h3>
                          <div className="flex items-center gap-2 text-sm">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                member.rank === 1
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-white/10 text-gray-300'
                              }`}
                            >
                              Rank #{member.rank}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{member.total}kg</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-gray-400">Total</div>
                        <div className="font-bold">{member.total}kg</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Squat</div>
                        <div className="font-bold">{member.squat}kg</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Bench</div>
                        <div className="font-bold">{member.bench}kg</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-gray-400">Deadlift</div>
                        <div className="font-bold">{member.deadlift}kg</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span>
                          {member.gender} {member.weight}kg
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{member.month}</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-400">
                        <TrendingUp className="w-3 h-3" />
                        <span>+ {member.progress}kg</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
    </div>
  )
}

type SnippetItem = { title: string; meta: string; detail?: string }

function PlanSnippet({
  title,
  subtitle,
  items,
  progress,
  completion,
  onToggle,
}: {
  title: string
  subtitle: string
  items: SnippetItem[]
  progress: number
  completion: Set<number>
  onToggle: (idx: number) => void
}) {
  const percent = Math.round(progress * 100)
  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-xl p-6 border border-white/10 relative overflow-hidden flex flex-col gap-4">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none" />
      <div className="relative z-10 flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <span className="text-sm text-gray-300">{subtitle}</span>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => {
            const checked = completion.has(idx)
            return (
              <div
                key={idx}
                className="p-4 backdrop-blur-md bg-white/5 border border-white/10 rounded-lg flex items-start justify-between"
              >
                <div>
                  <h3
                    className={`font-bold text-sm mb-1 ${checked ? 'line-through text-gray-500' : ''}`}
                  >
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-orange-400">{item.meta}</div>
                  {item.detail ? <p className="text-xs text-gray-400 mt-1">{item.detail}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(idx)}
                    className="w-4 h-4 rounded border-white/20 text-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-300">{percent}%</span>
          <div className="flex-1 h-2 backdrop-blur-md bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function UpgradeCard() {
  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-xl p-6 border border-white/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none" />
      <div className="relative z-10 space-y-3">
        <h2 className="text-xl font-bold">Unlock personalized plans</h2>
        <p className="text-sm text-gray-300">
          Upgrade from Essential to Premium/Elite to get trainer-created workout and meal plans
          tailored to you.
        </p>
        <button className="px-4 py-2 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition">
          Upgrade plan
        </button>
      </div>
    </div>
  )
}
