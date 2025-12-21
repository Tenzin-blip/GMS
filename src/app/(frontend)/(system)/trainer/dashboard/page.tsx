'use client'

import React, { useMemo, useState } from 'react'
import { SectionFade } from '@/components/animations/SectionFade'
import { Users, ClipboardList, CheckCircle2, Clock4, Sparkles } from 'lucide-react'

type Member = {
  id: string
  name: string
  goal: string
  tier: 'premium' | 'elite'
  status: 'active' | 'pending'
  specialization: string
}

const seedMembers: Member[] = [
  { id: '1', name: 'Tenzin Dolker', goal: 'Weight loss', tier: 'premium', status: 'pending', specialization: 'Weight loss' },
  { id: '2', name: 'Hari Bohot', goal: 'Muscle building', tier: 'elite', status: 'active', specialization: 'Muscle building' },
  { id: '3', name: 'Peter Guru', goal: 'Strength', tier: 'premium', status: 'active', specialization: 'Strength' },
]

export default function TrainerDashboard() {
  const [members] = useState<Member[]>(seedMembers)

  const metrics = useMemo(() => {
    const active = members.filter((m) => m.status === 'active').length
    const pending = members.filter((m) => m.status === 'pending').length
    const elite = members.filter((m) => m.tier === 'elite').length
    return { active, pending, elite, avgResponse: '02:15' }
  }, [members])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-6 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-16 right-8 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <SectionFade className="max-w-6xl mx-auto relative z-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-gray-400 mt-2">Manage incoming requests, active members, and plan actions.</p>
          </div>
        </div>

        <SectionFade delay={0.05} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Active members" value={metrics.active} icon={<Users className="w-5 h-5 text-orange-400" />} />
          <MetricCard title="Pending requests" value={metrics.pending} icon={<ClipboardList className="w-5 h-5 text-orange-400" />} />
          <MetricCard title="Elite tier" value={metrics.elite} icon={<CheckCircle2 className="w-5 h-5 text-orange-400" />} />
          <MetricCard title="Avg response" value={metrics.avgResponse} icon={<Clock4 className="w-5 h-5 text-orange-400" />} />
        </SectionFade>

        <SectionFade delay={0.1} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Incoming requests</h2>
                <p className="text-gray-400 text-sm">Auto-matched for your specialization</p>
              </div>
            </div>
            <div className="space-y-3">
              {members
                .filter((m) => m.status === 'pending')
                .map((request) => (
                  <div
                    key={request.id}
                    className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold">{request.name}</p>
                      <p className="text-xs text-gray-400">
                        Goal: {request.goal} • Tier: {request.tier.toUpperCase()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 text-xs rounded-full bg-orange-500/15 text-orange-100 border border-orange-400/30">
                        {request.specialization}
                      </span>
                      <button className="px-3 py-2 rounded-lg bg-green-500/15 text-green-100 border border-green-400/40 text-xs">
                        Accept
                      </button>
                      <button className="px-3 py-2 rounded-lg bg-red-500/10 text-red-100 border border-red-400/30 text-xs">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Active members</h2>
                <p className="text-gray-400 text-sm">Quick view of current roster</p>
              </div>
            </div>
            <div className="space-y-3">
              {members
                .filter((m) => m.status === 'active')
                .map((member) => (
                  <div
                    key={member.id}
                    className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-xs text-gray-400">
                        Goal: {member.goal} • Tier: {member.tier.toUpperCase()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 text-xs rounded-full bg-orange-500/15 text-orange-100 border border-orange-400/30">
                        {member.specialization}
                      </span>
                      <a
                        href={`/trainer/client-list/${member.id}`}
                        className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/15 text-xs hover:bg-white/15"
                      >
                        View
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </SectionFade>
      </SectionFade>
    </div>
  )
}

function MetricCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 to-orange-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
      <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl hover:shadow-orange-500/15 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
          <div className="p-2 bg-orange-500/10 rounded-lg">{icon}</div>
        </div>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  )
}

