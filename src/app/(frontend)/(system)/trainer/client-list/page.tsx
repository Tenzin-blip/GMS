'use client'

import React, { useMemo, useState } from 'react'
import { SectionFade } from '@/components/animations/SectionFade'
import { Users, Search, Sparkles } from 'lucide-react'

type Member = {
  id: string
  name: string
  goal: string
  tier: 'premium' | 'elite'
  status: 'active' | 'paused'
  specialization: string
}

const initialMembers: Member[] = [
  { id: '1', name: 'Hari Bohot', goal: 'Muscle building', tier: 'elite', status: 'active', specialization: 'Muscle building' },
  { id: '2', name: 'Peter Guru', goal: 'Strength', tier: 'premium', status: 'active', specialization: 'Strength' },
  { id: '3', name: 'Stephan Guru', goal: 'Mobility', tier: 'premium', status: 'paused', specialization: 'Mobility' },
]

export default function TrainerClientList() {
  const [search, setSearch] = useState('')
  const [members] = useState<Member[]>(initialMembers)

  const filtered = useMemo(
    () => members.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.goal.toLowerCase().includes(search.toLowerCase())),
    [members, search],
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-12 left-6 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-12 right-10 w-80 h-80 bg-purple-500/25 rounded-full blur-3xl" />
      </div>

      <SectionFade className="max-w-6xl mx-auto relative z-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-orange-400 uppercase tracking-wide">Trainer</p>
            <h1 className="text-4xl font-bold">Members</h1>
            <p className="text-gray-400 mt-2">Active roster with quick access to member detail view.</p>
          </div>
          <div className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>AI plan trigger inside details</span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or goal"
            className="bg-transparent text-white w-full focus:outline-none placeholder:text-gray-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((member) => (
            <div key={member.id} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-500/15 rounded-xl">
                      <Users className="w-5 h-5 text-orange-300" />
                    </div>
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-xs text-gray-400">{member.goal}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs rounded-full border ${
                      member.status === 'active'
                        ? 'bg-green-500/15 text-green-100 border-green-400/30'
                        : 'bg-yellow-500/10 text-yellow-100 border-yellow-400/30'
                    }`}
                  >
                    {member.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 text-xs rounded-full bg-orange-500/15 text-orange-100 border border-orange-400/30">
                    {member.specialization}
                  </span>
                  <span className="px-3 py-1 text-xs rounded-full bg-white/10 border border-white/10">
                    {member.tier.toUpperCase()}
                  </span>
                </div>

                <a
                  href={`/trainer/client-list/${member.id}`}
                  className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-sm transition-all"
                >
                  View details
                </a>
              </div>
            </div>
          ))}
        </div>
      </SectionFade>
    </div>
  )
}

