'use client'

import React, { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { BadgeCheck, Dumbbell, Utensils, Sparkles } from 'lucide-react'

const memberProfiles = {
  '1': {
    name: 'Hari Bohot',
    goal: 'Muscle building',
    age: 29,
    height: 175,
    weight: 72,
    tier: 'elite',
    specialization: 'Muscle building',
  },
  '2': {
    name: 'Peter Guru',
    goal: 'Strength',
    age: 31,
    height: 178,
    weight: 76,
    tier: 'premium',
    specialization: 'Strength',
  },
  '3': {
    name: 'Stephan Guru',
    goal: 'Mobility',
    age: 34,
    height: 180,
    weight: 80,
    tier: 'premium',
    specialization: 'Mobility',
  },
}

const workoutPlan = [
  { name: 'Warmup', sets: '10 min', weight: '-' },
  { name: 'Bench Press', sets: '4 x 8', weight: '40 kg' },
  { name: 'Shoulder Press', sets: '3 x 10', weight: '25 kg' },
  { name: 'Push Up', sets: '3 x 12', weight: 'BW' },
  { name: 'Pull Ups', sets: '3 x 12', weight: 'BW' },
  { name: 'Bicep Curls', sets: '3 x 15', weight: '25 kg' },
]

const mealPlan = [
  { name: 'Power Protein', calories: 650, protein: 25, carbs: 45, fat: 25, slot: 'Breakfast' },
  { name: 'Power Protein', calories: 650, protein: 25, carbs: 45, fat: 25, slot: 'Lunch' },
  { name: 'Power Protein', calories: 650, protein: 25, carbs: 45, fat: 25, slot: 'Snacks' },
  { name: 'Power Protein', calories: 650, protein: 25, carbs: 45, fat: 25, slot: 'Dinner' },
]

export default function MemberDetail() {
  const params = useParams()
  const memberId = params?.memberId as string
  const profile = useMemo(() => memberProfiles[memberId as keyof typeof memberProfiles], [memberId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-4 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-orange-400 uppercase tracking-wide">Member detail</p>
            <h1 className="text-4xl font-bold">{profile?.name ?? 'Member'}</h1>
            <p className="text-gray-400 mt-2">
              Goal: {profile?.goal} • Tier: {profile?.tier.toUpperCase()} • Specialization: {profile?.specialization}
            </p>
          </div>
          <button className="px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 border border-orange-400/40 shadow-lg shadow-orange-500/30 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Generate using AI
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <BadgeCheck className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-semibold">Profile</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Age</span>
                  <span className="text-white">{profile?.age ?? '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Height</span>
                  <span className="text-white">{profile?.height ?? '--'} cm</span>
                </div>
                <div className="flex justify-between">
                  <span>Weight</span>
                  <span className="text-white">{profile?.weight ?? '--'} kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Goal</span>
                  <span className="text-white">{profile?.goal ?? '--'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-semibold">Workout plan</h3>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10">Today</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workoutPlan.map((item) => (
                  <div key={item.name} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <div>
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.sets}</p>
                    </div>
                    <span className="text-xs text-gray-300">{item.weight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-semibold">Meal plan</h3>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10">2400 cal</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mealPlan.map((item, idx) => (
                  <div key={`${item.slot}-${idx}`} className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-500/10 border border-orange-400/30 text-orange-100">
                        {item.slot}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {item.calories} cal • P: {item.protein}g • C: {item.carbs}g • F: {item.fat}g
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

