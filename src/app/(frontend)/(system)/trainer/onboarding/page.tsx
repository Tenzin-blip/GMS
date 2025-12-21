'use client'

import React, { useMemo, useState } from 'react'
import { Clock, Dumbbell, Sparkles, CheckCircle, CalendarCheck, AlertCircle } from 'lucide-react'
import { SectionFade } from '@/components/animations/SectionFade'

const specializations = ['Muscle building', 'Strength', 'Weight loss', 'Mobility', 'Conditioning']
const workingDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function TrainerOnboarding() {
  const [selectedSpec, setSelectedSpec] = useState<string>('Muscle building')
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Wed', 'Fri'])
  const [startTime, setStartTime] = useState('07:00')
  const [endTime, setEndTime] = useState('19:00')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const weeklyHours = useMemo(() => {
    const start = parseInt(startTime.split(':')[0])
    const end = parseInt(endTime.split(':')[0])
    const hours = Math.max(end - start, 0)
    return hours * selectedDays.length
  }, [endTime, selectedDays.length, startTime])

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    // Placeholder for API integration (PATCH /api/trainer/onboarding)
    // fetch('/api/trainer/onboarding', { method: 'POST', body: JSON.stringify({ ... }) })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-4 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl" />
      </div>

      <SectionFade className="max-w-5xl mx-auto relative z-10 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mt-2">Tune your availability</h1>
            <p className="text-gray-400 mt-2 max-w-2xl">
              Set your speciality, preferred days and weekly hours so member requests can be matched to you
              automatically.
            </p>
          </div>
          {submitted && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/15 border border-green-500/40 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm text-green-100">Saved for matching</span>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
        >
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell className="w-5 h-5 text-orange-400" />
                <h2 className="text-xl font-semibold">Specialization</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {specializations.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => setSelectedSpec(spec)}
                    className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                      selectedSpec === spec
                        ? 'bg-orange-500/20 border-orange-400/40 text-orange-100'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <CalendarCheck className="w-5 h-5 text-orange-400" />
                <h2 className="text-xl font-semibold">Weekly working days</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {workingDays.map((day) => {
                  const isActive = selectedDays.includes(day)
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`w-16 px-4 py-3 rounded-xl border text-sm transition-all ${
                        isActive
                          ? 'bg-orange-500/20 border-orange-400/40 text-orange-100 shadow-lg shadow-orange-500/20'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-orange-400" />
                <h2 className="text-xl font-semibold">Preferred hours</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center justify-between gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                  <span className="text-sm text-gray-300">Start time</span>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-transparent text-white focus:outline-none"
                  />
                </label>
                <label className="flex items-center justify-between gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                  <span className="text-sm text-gray-300">End time</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-transparent text-white focus:outline-none"
                  />
                </label>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-orange-400" />
                <h2 className="text-xl font-semibold">Notes or preferences</h2>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Equipment constraints, small-group classes, remote coaching windows, etc."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-gray-500 focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20 outline-none min-h-[120px]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400">Weekly availability</p>
                  <h3 className="text-3xl font-bold text-white">{weeklyHours} hrs</h3>
                </div>
                <div className="p-3 bg-orange-500/15 rounded-xl">
                  <Clock className="w-6 h-6 text-orange-400" />
                </div>
              </div>
              <p className="text-sm text-gray-400">
                We surface you to members who match your speciality and fit within these windows.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5" />
                <div className="text-sm text-gray-300">
                  You can update this later from trainer settings. Admins can also adjust on your behalf.
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 transition-all shadow-lg shadow-orange-500/25 font-semibold"
            >
              Save and start taking requests
            </button>
          </div>
        </form>
      </SectionFade>
    </div>
  )
}

