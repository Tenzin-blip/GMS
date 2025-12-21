'use client'

import React, { useState } from 'react'
import { SectionFade } from '@/components/animations/SectionFade'
import { Users, Check, XCircle, Sparkles } from 'lucide-react'

type Request = {
  id: string
  name: string
  goal: string
  tier: 'premium' | 'elite'
  specialization: string
  status: 'pending' | 'accepted' | 'rejected'
}

const initialRequests: Request[] = [
  { id: 'r1', name: 'Swoyam Pokharel', goal: 'Muscle building', tier: 'elite', specialization: 'Muscle building', status: 'pending' },
  { id: 'r2', name: 'Tenzin Dolker', goal: 'Weight loss', tier: 'premium', specialization: 'Weight loss', status: 'pending' },
  { id: 'r3', name: 'Dayjen Jigme', goal: 'Strength', tier: 'premium', specialization: 'Strength', status: 'accepted' },
]

export default function TrainerRequests() {
  const [requests, setRequests] = useState<Request[]>(initialRequests)

  const updateStatus = (id: string, status: Request['status']) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-8 left-10 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-12 right-10 w-80 h-80 bg-purple-500/25 rounded-full blur-3xl" />
      </div>

      <SectionFade className="max-w-5xl mx-auto relative z-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Requests</h1>
            <p className="text-gray-400 mt-2">Accept or reject members auto-matched to your specialization.</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-orange-500/15 border border-orange-400/20">
                  <Users className="w-5 h-5 text-orange-300" />
                </div>
                <div>
                  <p className="font-semibold">{request.name}</p>
                  <p className="text-sm text-gray-400">
                    Goal: {request.goal} • Tier: {request.tier.toUpperCase()}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-3 py-1 text-xs rounded-full bg-orange-500/15 text-orange-100 border border-orange-400/30">
                      {request.specialization}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs rounded-full border ${
                        request.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-100 border-yellow-400/30'
                          : request.status === 'accepted'
                            ? 'bg-green-500/15 text-green-100 border-green-400/30'
                            : 'bg-red-500/10 text-red-100 border-red-400/30'
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(request.id, 'accepted')}
                  className="px-4 py-2 rounded-lg bg-green-500/15 text-green-100 border border-green-400/40 text-sm flex items-center gap-2 hover:bg-green-500/20"
                >
                  <Check className="w-4 h-4" />
                  Accept
                </button>
                <button
                  onClick={() => updateStatus(request.id, 'rejected')}
                  className="px-4 py-2 rounded-lg bg-red-500/10 text-red-100 border border-red-400/30 text-sm flex items-center gap-2 hover:bg-red-500/15"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionFade>
    </div>
  )
}

