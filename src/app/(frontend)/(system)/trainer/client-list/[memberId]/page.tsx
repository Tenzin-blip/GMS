'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  BadgeCheck,
  Dumbbell,
  Utensils,
  Sparkles,
  Loader2,
  AlertCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  Calendar,
} from 'lucide-react'

type MemberData = {
  assignment: {
    id: string
    status: 'active' | 'paused' | 'ended'
    planStatus: 'pending' | 'active' | 'revision'
    startedAt: string
    planSentAt?: string
  }
  user: {
    id: string
    name: string
    email: string
  }
  fitness: {
    goals?: string[]
    bodyMetrics?: {
      height?: number
      currentWeight?: number
      targetWeight?: number
    }
    dailyCalories?: {
      target?: number
      consumed?: number
      burned?: number
    }
    mealPlan?: {
      dietType?: string
      allergies?: Array<{ allergen: string }>
      preferences?: string
    }
    workoutPlan?: {
      frequency?: number
      preferredDays?: string[]
      duration?: number
      preferredTypes?: string[]
    }
  }
  currentWorkoutPlan?: any
  currentMealPlan?: any
}

const goalLabels: Record<string, string> = {
  weight_loss: 'Weight Loss',
  muscle_building: 'Muscle Building',
  toning: 'Toning',
  maintenance: 'General Fitness',
}

const dietLabels: Record<string, string> = {
  vegetarian: 'Vegetarian',
  non_vegetarian: 'Non-Vegetarian',
  vegan: 'Vegan',
  pescatarian: 'Pescatarian',
}

const dayLabels: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
}

export default function MemberDetail() {
  const params = useParams()
  const router = useRouter()
  const userId = params?.memberId as string

  const [memberData, setMemberData] = useState<MemberData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'plans' | 'details' | 'progress'>('plans')
  const [generatingPlan, setGeneratingPlan] = useState(false)

  const fetchMemberData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/trainer/members/${userId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch member data')
      }

      const data = await response.json()
      setMemberData(data.data)
    } catch (err: any) {
      console.error('Error fetching member data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchMemberData()
    }
  }, [userId])

  const handleCreatePlan = async () => {
    if (!memberData) return

    try {
      setGeneratingPlan(true)

      // Call Gemini API with member data
      const response = await fetch('/api/gemini_brr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      })
      console.log(response)

      if (!response.ok) {
        throw new Error('Failed to generate plan')
      }

      const result = await response.json()

      if (result.success) {
        console.log('Generated Plan:', result.plan)
        alert('Plan generated successfully! Check console for details.')
        // TODO: Next step - display the plan for trainer to review/edit
      } else {
        throw new Error('Plan generation failed')
      }
    } catch (err: any) {
      console.error('Error generating plan:', err)
      alert(`Failed to generate plan: ${err.message}`)
    } finally {
      setGeneratingPlan(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading member data...</p>
        </div>
      </div>
    )
  }

  if (error || !memberData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error || 'Member not found'}</p>
          <button
            onClick={() => router.push('/trainer/client-list')}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white"
          >
            Back to Members
          </button>
        </div>
      </div>
    )
  }

  const { assignment, user, fitness } = memberData

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-4 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <p className="text-sm text-orange-400 uppercase tracking-wide">Member detail</p>
            <h1 className="text-4xl font-bold">{user.name}</h1>
            <p className="text-gray-400 mt-2">{user.email}</p>
            <div className="flex items-center gap-2 mt-3">
              <span
                className={`px-3 py-1 text-xs rounded-full border ${
                  assignment.status === 'active'
                    ? 'bg-green-500/15 text-green-100 border-green-400/30'
                    : 'bg-yellow-500/10 text-yellow-100 border-yellow-400/30'
                }`}
              >
                {assignment.status}
              </span>
              <span
                className={`px-3 py-1 text-xs rounded-full border ${
                  assignment.planStatus === 'pending'
                    ? 'bg-yellow-500/15 text-yellow-100 border-yellow-400/30'
                    : 'bg-green-500/15 text-green-100 border-green-400/30'
                }`}
              >
                {assignment.planStatus === 'pending' ? 'Plan Pending' : 'Plan Active'}
              </span>
            </div>
          </div>

          {assignment.planStatus === 'pending' && (
            <button
              onClick={handleCreatePlan}
              disabled={generatingPlan}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 border border-orange-400/40 shadow-lg shadow-orange-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingPlan ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Create Plan
                </>
              )}
            </button>
          )}
        </div>

        {assignment.planStatus === 'pending' && (
          <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-100 font-semibold">Pending to make plan</p>
              <p className="text-yellow-200/80 text-sm mt-1">
                This member is waiting for their workout and meal plan. Review their fitness data
                below and create a personalized plan.
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-6 py-3 font-medium transition-all border-b-2 ${
              activeTab === 'plans'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Plans
            </div>
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 font-medium transition-all border-b-2 ${
              activeTab === 'details'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4" />
              Details
            </div>
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-6 py-3 font-medium transition-all border-b-2 ${
              activeTab === 'progress'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Progress
            </div>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {memberData.currentWorkoutPlan ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-orange-400" />
                    <h3 className="text-lg font-semibold">Workout Plan</h3>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-green-500/15 text-green-100 border border-green-400/30">
                    Active
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-400">
                    Source:{' '}
                    <span className="text-white capitalize">
                      {memberData.currentWorkoutPlan.source || 'N/A'}
                    </span>
                  </p>
                  {memberData.currentWorkoutPlan.activatedAt && (
                    <p className="text-gray-400">
                      Activated:{' '}
                      <span className="text-white">
                        {new Date(memberData.currentWorkoutPlan.activatedAt).toLocaleDateString()}
                      </span>
                    </p>
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-4">
                  Plan content will be displayed here in future updates
                </p>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl text-center">
                <Dumbbell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No workout plan assigned yet</p>
                {assignment.planStatus === 'pending' && (
                  <p className="text-gray-500 text-sm mt-2">Create a plan to get started</p>
                )}
              </div>
            )}

            {memberData.currentMealPlan ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-orange-400" />
                    <h3 className="text-lg font-semibold">Meal Plan</h3>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-green-500/15 text-green-100 border border-green-400/30">
                    Active
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-400">
                    Source:{' '}
                    <span className="text-white capitalize">
                      {memberData.currentMealPlan.source || 'N/A'}
                    </span>
                  </p>
                  {memberData.currentMealPlan.activatedAt && (
                    <p className="text-gray-400">
                      Activated:{' '}
                      <span className="text-white">
                        {new Date(memberData.currentMealPlan.activatedAt).toLocaleDateString()}
                      </span>
                    </p>
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-4">
                  Plan content will be displayed here in future updates
                </p>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl text-center">
                <Utensils className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No meal plan assigned yet</p>
                {assignment.planStatus === 'pending' && (
                  <p className="text-gray-500 text-sm mt-2">Create a plan to get started</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <BadgeCheck className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-semibold">Profile Information</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name</span>
                  <span className="text-white">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email</span>
                  <span className="text-white">{user.email}</span>
                </div>
                {fitness.goals && fitness.goals.length > 0 && (
                  <div>
                    <span className="text-gray-400">Goals</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {fitness.goals.map((goal) => (
                        <span
                          key={goal}
                          className="px-2 py-1 text-xs rounded-full bg-orange-500/15 text-orange-100 border border-orange-400/30"
                        >
                          {goalLabels[goal] || goal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <BadgeCheck className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-semibold">Body Metrics</h3>
              </div>
              <div className="space-y-3 text-sm">
                {fitness.bodyMetrics && (
                  <>
                    {fitness.bodyMetrics.height && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Height</span>
                        <span className="text-white">{fitness.bodyMetrics.height} cm</span>
                      </div>
                    )}
                    {fitness.bodyMetrics.currentWeight && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current Weight</span>
                        <span className="text-white">{fitness.bodyMetrics.currentWeight} kg</span>
                      </div>
                    )}
                    {fitness.bodyMetrics.targetWeight && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Target Weight</span>
                        <span className="text-white">{fitness.bodyMetrics.targetWeight} kg</span>
                      </div>
                    )}
                  </>
                )}
                {fitness.dailyCalories && fitness.dailyCalories.target && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Daily Calorie Target</span>
                    <span className="text-white">{fitness.dailyCalories.target} cal</span>
                  </div>
                )}
              </div>
            </div>

            {fitness.mealPlan && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Utensils className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-semibold">Dietary Preferences</h3>
                </div>
                <div className="space-y-3 text-sm">
                  {fitness.mealPlan.dietType && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Diet Type</span>
                      <span className="text-white">
                        {dietLabels[fitness.mealPlan.dietType] || fitness.mealPlan.dietType}
                      </span>
                    </div>
                  )}
                  {fitness.mealPlan.allergies && fitness.mealPlan.allergies.length > 0 && (
                    <div>
                      <span className="text-gray-400">Allergies</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {fitness.mealPlan.allergies.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs rounded-full bg-red-500/15 text-red-100 border border-red-400/30"
                          >
                            {item.allergen}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {fitness.mealPlan.preferences && (
                    <div>
                      <span className="text-gray-400">Preferences</span>
                      <p className="text-white mt-1">{fitness.mealPlan.preferences}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {fitness.workoutPlan && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Dumbbell className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-semibold">Workout Preferences</h3>
                </div>
                <div className="space-y-3 text-sm">
                  {fitness.workoutPlan.frequency && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Frequency</span>
                      <span className="text-white">{fitness.workoutPlan.frequency}x per week</span>
                    </div>
                  )}
                  {fitness.workoutPlan.duration && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration</span>
                      <span className="text-white">{fitness.workoutPlan.duration} min</span>
                    </div>
                  )}
                  {fitness.workoutPlan.preferredDays &&
                    fitness.workoutPlan.preferredDays.length > 0 && (
                      <div>
                        <span className="text-gray-400">Preferred Days</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {fitness.workoutPlan.preferredDays.map((day) => (
                            <span
                              key={day}
                              className="px-2 py-1 text-xs rounded-full bg-blue-500/15 text-blue-100 border border-blue-400/30"
                            >
                              {dayLabels[day] || day}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  {fitness.workoutPlan.preferredTypes &&
                    fitness.workoutPlan.preferredTypes.length > 0 && (
                      <div>
                        <span className="text-gray-400">Preferred Types</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {fitness.workoutPlan.preferredTypes.map((type) => (
                            <span
                              key={type}
                              className="px-2 py-1 text-xs rounded-full bg-purple-500/15 text-purple-100 border border-purple-400/30"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-semibold">Progress Tracking</h3>
            </div>
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">Progress tracking coming soon</p>
              <p className="text-gray-500 text-sm">
                View attendance, meal completion, and workout progress here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
