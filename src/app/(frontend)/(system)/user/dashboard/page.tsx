'use client'

import React, { useState, useEffect } from 'react'
import Notices from '@/components/system/dashboard/Notices'
import DashboardHeader from '@/components/system/dashboard/DashboardHeader'
import AttendanceStatCard from '@/components/system/attendance/AttendanceStatCard'
import { SectionFade } from '@/components/animations/SectionFade'
import {
  Calendar,
  Flame,
  Users,
  TrendingUp,
  Bell,
  ChevronLeft,
  ChevronRight,
  Trophy,
} from 'lucide-react'

interface UserFitnessData {
  user: string
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

export default function Dashboard() {
  const [fitnessData, setFitnessData] = useState<UserFitnessData | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [attendance, setAttendance] = useState({ current: 0, total: 22 })
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    fetchFitnessData()
  }, [])

  const fetchFitnessData = async () => {
    try {
      const response = await fetch('/api/user-fitness')
      if (response.ok) {
        const data = await response.json()
        setFitnessData(data.data)
      }
    } catch (error) {
      console.error('Error fetching fitness data:', error)
    }
  }

  const calculateBMI = () => {
    if (!fitnessData) return 0
    const heightInMeters = fitnessData.bodyMetrics.height / 100
    return (fitnessData.bodyMetrics.currentWeight / (heightInMeters * heightInMeters)).toFixed(1)
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

  const mealPlan = [
    {
      name: 'Power Protein',
      time: 'Breakfast',
      intensity: 'Medium',
      calories: 1800,
      description: 'Scrambled eggs with sauted spinach',
    },
    {
      name: 'Vegan Energy Boost',
      time: 'Lunch',
      intensity: 'Medium',
      calories: 1800,
      description: 'Scrambled eggs with sauted spinach',
    },
    {
      name: 'Fruits & Nuts',
      time: 'Snacks',
      intensity: 'Medium',
      calories: 1800,
      description: 'Scrambled eggs with sauted spinach',
    },
    {
      name: 'Lean & Green',
      time: 'Dinner',
      intensity: 'Medium',
      calories: 1800,
      description: 'Scrambled eggs with sauted spinach',
    },
  ]

  const workoutPlan = [
    { name: 'Warmup', duration: '25 min', completed: true },
    { name: 'Shoulder Press', sets: '4x8', completed: false },
    { name: 'Bench Press', sets: '3x10', completed: false },
    { name: 'Pull-Ups', sets: '3x12', completed: false },
    { name: 'Pull-Ups', sets: '3x12', completed: false },
    { name: 'Pull-Ups', sets: '3x12', completed: false },
  ]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
  }

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate)

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
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
        <SectionFade>
          <DashboardHeader />
        </SectionFade>

        {/* Top Stats Grid */}
        <SectionFade delay={0.05} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Attendance Card */}

          {/* Streak Card */}
          {/* <div className="backdrop-blur-xl bg-white/5 rounded-xl p-6 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-300">Streak</span>
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-3xl font-bold mb-1">{streak} days</div>
              <p className="text-sm text-gray-400">Current active streak</p>
            </div>
          </div> */}

          {/* Active Members */}
          <div className="backdrop-blur-xl bg-white/5 rounded-xl p-6 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-300">Active members</span>
                  </div>
                  <div className="text-2xl font-bold mb-1">32</div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-gray-300">Trainers available</span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-gray-300">
                    <div>Hari Bohot</div>
                    <div>Peter Guru</div>
                    <div>Stephan Guru</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weight/BMI Card */}
          <div className="backdrop-blur-xl bg-white/5 rounded-xl p-6 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-300">Weight</span>
                <select className="backdrop-blur-md bg-white/10 border border-white/10 text-white text-sm px-2 py-1 rounded focus:outline-none focus:border-orange-500">
                  <option className="bg-gray-900">Kg</option>
                  <option className="bg-gray-900">Lbs</option>
                </select>
              </div>
              <div className="flex gap-8 mb-4">
                {[55, 60, 65, 70, 75].map((weight, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="text-xs text-gray-400 mb-2">{weight}</div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <div
                          key={bar}
                          className={`w-0.5 rounded ${weight === 70 ? 'bg-orange-500 h-12' : 'bg-white/20 h-8'}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-300">
                BMI Status: <span className="text-white">{calculateBMI()} BMI</span>
              </p>
            </div>
          </div>
        </SectionFade>

        {/* Main Content Grid */}
        <SectionFade delay={0.1} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Notice Board + Calendar */}
          <div className="space-y-6">
            {/* Notice Board */}
            <Notices/>

            {/* Calendar */}
            {/* <div className="backdrop-blur-xl bg-white/5 rounded-xl p-6 border border-white/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={previousMonth} className="p-1 hover:bg-white/10 rounded transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                    <div key={day} className="text-center text-xs text-gray-400 font-medium py-2">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }).map((_, idx) => (
                    <div key={`empty-${idx}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1
                    const isToday = day === 18
                    return (
                      <button
                        key={day}
                        className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-colors ${
                          isToday
                            ? 'bg-orange-500 text-white font-bold'
                            : 'hover:bg-white/10 text-gray-300'
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div> */}
          </div>

          {/* Middle Column - Leaderboard */}
          <div className="backdrop-blur-xl bg-white/5 rounded-xl p-6 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold">Leaderboard</h2>
              </div>

              <div className="space-y-4">
                {leaderboardData.map((member, idx) => (
                  <div key={idx} className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
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

          {/* Right Column - Meal & Workout Plans */}
          <div className="space-y-6">
            {/* Meal Plan */}
            <div className="backdrop-blur-xl bg-white/5 rounded-xl p-6 border border-white/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Meal plan</h2>
                  <span className="text-sm text-gray-300">Thu, 18 May</span>
                </div>

                <div className="space-y-3">
                  {mealPlan.map((meal, idx) => (
                    <div key={idx} className="p-4 backdrop-blur-md bg-white/5 border border-white/10 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-sm mb-1">{meal.name}</h3>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-orange-500">■ {meal.intensity}</span>
                            <span className="text-orange-500">🔥 {meal.calories} Calories</span>
                          </div>
                        </div>
                        <span className="text-xs px-3 py-1 backdrop-blur-md bg-white/10 rounded-full">
                          {meal.time}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{meal.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Workout Plan */}
            <div className="backdrop-blur-xl bg-white/5 rounded-xl p-6 border border-white/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Workout plan</h2>
                  <span className="text-sm text-gray-300">Thu, 18 May</span>
                </div>

                <div className="mb-4">
                  <h3 className="font-bold mb-3">Upper Body Strength</h3>
                  <div className="space-y-2">
                    {workoutPlan.map((exercise, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={exercise.completed}
                            className="w-4 h-4 rounded border-white/20 text-orange-500 focus:ring-orange-500"
                            readOnly
                          />
                          <span className={exercise.completed ? 'line-through text-gray-500' : ''}>
                            {exercise.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-400">
                          {exercise.duration || exercise.sets}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-2">Progress for today</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-300">25%</span>
                    <div className="flex-1 h-2 backdrop-blur-md bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-1/4 bg-orange-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionFade>
      </div>
    </div>
  )
}
