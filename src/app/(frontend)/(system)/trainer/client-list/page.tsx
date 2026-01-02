'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { Users, Search, Loader2, AlertCircle, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Member = {
  id: string
  user: {
    id: string
    name: string
    email: string
  }
  status: 'active' | 'paused' | 'ended'
  planStatus: 'pending' | 'active' | 'revision'
  tier?: 'premium' | 'elite'
  goals?: string[]
  startedAt: string
}

const goalLabels: Record<string, string> = {
  weight_loss: 'Weight Loss',
  muscle_building: 'Muscle Building',
  toning: 'Toning',
  maintenance: 'General Fitness',
}

export default function TrainerClientList() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/trainer/assignments')

      if (!response.ok) {
        throw new Error('Failed to fetch members')
      }

      const data = await response.json()
      setMembers(data.data || [])
    } catch (err: any) {
      console.error('Error fetching members:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(
    () =>
      members.filter(
        (m) =>
          m.user.name.toLowerCase().includes(search.toLowerCase()) ||
          m.user.email.toLowerCase().includes(search.toLowerCase()) ||
          m.goals?.some((g) => goalLabels[g]?.toLowerCase().includes(search.toLowerCase())),
      ),
    [members, search],
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading members...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchMembers}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-12 left-6 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-12 right-10 w-80 h-80 bg-purple-500/25 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        <div className="items-center justify-between">
          <p className="text-sm text-orange-400 uppercase tracking-wide">Trainer</p>
          <h1 className="text-4xl font-bold">Members</h1>
          <p className="text-gray-400 mt-2">
            Active roster with quick access to member details and plans.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or goal"
            className="bg-transparent text-white w-full focus:outline-none placeholder:text-gray-500"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {search ? 'No members found' : 'No members yet'}
            </h3>
            <p className="text-gray-500">
              {search ? 'Try adjusting your search' : 'Accept member requests to see them here'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((member) => (
              <div key={member.id} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-3 bg-orange-500/15 rounded-xl shrink-0">
                        <Users className="w-5 h-5 text-orange-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{member.user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{member.user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {member.goals && member.goals.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {member.goals.slice(0, 2).map((goal) => (
                          <span
                            key={goal}
                            className="px-2 py-1 text-xs rounded-full bg-blue-500/15 text-blue-100 border border-blue-400/30"
                          >
                            {goalLabels[goal] || goal}
                          </span>
                        ))}
                        {member.goals.length > 2 && (
                          <span className="px-2 py-1 text-xs rounded-full bg-white/10 text-gray-300">
                            +{member.goals.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-3 py-1 text-xs rounded-full border ${
                          member.status === 'active'
                            ? 'bg-green-500/15 text-green-100 border-green-400/30'
                            : member.status === 'paused'
                              ? 'bg-yellow-500/10 text-yellow-100 border-yellow-400/30'
                              : 'bg-gray-500/10 text-gray-100 border-gray-400/30'
                        }`}
                      >
                        {member.status}
                      </span>
                      {member.tier && (
                        <span className="px-3 py-1 text-xs rounded-full bg-white/10 border border-white/10">
                          {member.tier.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {member.planStatus === 'pending' && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-400/30">
                        <AlertTriangle className="w-4 h-4 text-yellow-300 shrink-0" />
                        <span className="text-xs text-yellow-100">Pending to make plan</span>
                      </div>
                    )}
                    {member.planStatus === 'active' && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-400/30">
                        <span className="text-xs text-green-100">Active plan</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => router.push(`/trainer/client-list/${member.user.id}`)}
                    className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-sm transition-all"
                  >
                    View details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
