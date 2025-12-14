'use client'
import React, { useMemo, useState, useEffect } from 'react'
import { SectionFade } from '@/components/animations/SectionFade'
import { Clock3, Flame } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

const weekDays = [
  { key: 'sunday', label: 'Sun', dateLabel: '5', focus: 'Upper' },
  { key: 'monday', label: 'Mon', dateLabel: '6', focus: 'Lower' },
  { key: 'tuesday', label: 'Tue', dateLabel: '7', focus: 'Active' },
  { key: 'wednesday', label: 'Wed', dateLabel: '8', focus: 'Chest' },
  { key: 'thursday', label: 'Thu', dateLabel: '9', focus: 'Leg' },
  { key: 'friday', label: 'Fri', dateLabel: '10', focus: 'Core' },
  { key: 'saturday', label: 'Sat', dateLabel: '11', focus: 'Rest' },
]

const workoutBlocks = {
  sunday: {
    title: 'Upper Body Strength',
    duration: 60,
    entries: [
      { name: 'Warmup', reps: '10 min', sets: 1, weight: '-' },
      { name: 'Bench Press', reps: '8 rep', sets: 4, weight: '40 kg' },
      { name: 'Shoulder Press', reps: '10 rep', sets: 3, weight: '25 kg' },
      { name: 'Push Up', reps: '12 rep', sets: 3, weight: 'Body Weight' },
      { name: 'Pull Ups', reps: '12 rep', sets: 3, weight: 'Body Weight' },
      { name: 'Bicep Curls', reps: '15 rep', sets: 3, weight: '25 kgs' },
    ],
  },
  monday: {
    title: 'Lower Body Strength',
    duration: 60,
    entries: [
      { name: 'Warmup', reps: '10 min', sets: 1, weight: '-' },
      { name: 'Bench Press', reps: '8 rep', sets: 4, weight: '40 kg' },
      { name: 'Shoulder Press', reps: '10 rep', sets: 3, weight: '25 kg' },
      { name: 'Push Up', reps: '12 rep', sets: 3, weight: 'Body Weight' },
      { name: 'Pull Ups', reps: '12 rep', sets: 3, weight: 'Body Weight' },
      { name: 'Bicep Curls', reps: '15 rep', sets: 3, weight: '25 kgs' },
    ],
  },
  tuesday: {
    title: 'Active',
    duration: 60,
    entries: [
      { name: 'Warmup', reps: '10 min', sets: 1, weight: '-' },
      { name: 'Bench Press', reps: '8 rep', sets: 4, weight: '40 kg' },
      { name: 'Shoulder Press', reps: '10 rep', sets: 3, weight: '25 kg' },
      { name: 'Push Up', reps: '12 rep', sets: 3, weight: 'Body Weight' },
      { name: 'Pull Ups', reps: '12 rep', sets: 3, weight: 'Body Weight' },
      { name: 'Bicep Curls', reps: '15 rep', sets: 3, weight: '25 kgs' },
    ],
  },
  wednesday: {
    title: 'Chest',
    duration: 60,
    entries: [
      { name: 'Warmup', reps: '10 min', sets: 1, weight: '-' },
      { name: 'Bench Press', reps: '8 rep', sets: 4, weight: '40 kg' },
      { name: 'Shoulder Press', reps: '10 rep', sets: 3, weight: '25 kg' },
      { name: 'Push Up', reps: '12 rep', sets: 3, weight: 'Body Weight' },
      { name: 'Pull Ups', reps: '12 rep', sets: 3, weight: 'Body Weight' },
      { name: 'Bicep Curls', reps: '15 rep', sets: 3, weight: '25 kgs' },
    ],
  },
  thursday: {
    title: 'Legs',
    duration: 60,
    entries: [
      { name: 'Warmup', reps: '10 min', sets: 1, weight: '-' },
      { name: 'Bench Press', reps: '8 rep', sets: 4, weight: '40 kg' },
      { name: 'Shoulder Press', reps: '10 rep', sets: 3, weight: '25 kg' },
      { name: 'Push Up', reps: '12 rep', sets: 3, weight: 'Body Weight' },
      { name: 'Pull Ups', reps: '12 rep', sets: 3, weight: 'Body Weight' },
      { name: 'Bicep Curls', reps: '15 rep', sets: 3, weight: '25 kgs' },
    ],
  },
  friday: {
    title: 'Core',
    duration: 60,
    entries: [
      { name: 'Warmup', reps: '10 min', sets: 1, weight: '-' },
      { name: 'Bench Press', reps: '8 rep', sets: 4, weight: '40 kg' },
      { name: 'Shoulder Press', reps: '10 rep', sets: 3, weight: '25 kg' },
      { name: 'Push Up', reps: '12 rep', sets: 3, weight: 'Body Weight' },
      { name: 'Pull Ups', reps: '12 rep', sets: 3, weight: 'Body Weight' },
      { name: 'Bicep Curls', reps: '15 rep', sets: 3, weight: '25 kgs' },
    ],
  },
  saturday: {
    title: 'Rest',
    duration: 0,
    entries: [],
  },
}

export default function WorkoutPlan() {
  const searchParams = useSearchParams()
  const planTier = (searchParams.get('plan') as 'essential' | 'premium' | 'elite') || 'premium'
  const [activeDayKey, setActiveDayKey] = useState<string>('wednesday')

  const rotatedDays = useMemo(() => {
    const today = new Date()
    const todayIndex = today.getDay() // 0=Sun
    const ordered = [...weekDays.slice(todayIndex), ...weekDays.slice(0, todayIndex)]
    return ordered
  }, [])

  useEffect(() => {
    setActiveDayKey(rotatedDays[0]?.key || 'wednesday')
  }, [rotatedDays])

  const blocks = rotatedDays.map((d) => ({ dayKey: d.key, ...workoutBlocks[d.key as keyof typeof workoutBlocks], label: d.label, dateLabel: d.dateLabel, focus: d.focus }))

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
              {new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date())}
            </span>
          </div>
        </div>

        {planTier === 'essential' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-gray-200 backdrop-blur-xl">
            You are on the Essential plan. Upgrade to unlock trainer-personalized workouts. Meanwhile, here’s your
            generic plan.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 w-full h-28">
          {rotatedDays.map((day) => {
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
                <p className="text-lg font-semibold">{day.dateLabel}</p>
                <p className="text-xs opacity-80">{day.focus}</p>
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {blocks.map((block) => (
            <div key={block.dayKey} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
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
                  <span className="text-xs px-3 py-2 rounded-full bg-white/10 border border-white/10">Rest</span>
                )}
              </div>

              {block.entries.length === 0 ? (
                <div className="p-5 text-sm text-gray-400">Recovery day. Mobility & light walk recommended.</div>
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
                      <div key={`${entry.name}-${idx}`} className="grid grid-cols-4 py-3 text-sm items-center">
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