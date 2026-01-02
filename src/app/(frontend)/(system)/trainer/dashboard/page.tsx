'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { Users, ClipboardList, CheckCircle2, Clock4, Loader2, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Request = {
  id: string
  user: {
    id: string
    name: string
  }
  goals: string[]
  tier: 'premium' | 'elite'
  status: 'pending' | 'accepted' | 'rejected'
}

type Assignment = {
  id: string
  user: {
    id: string
    name: string
    plan?: string
  }
  status: 'active' | 'paused' | 'ended'
  planStatus: 'pending' | 'active' | 'revision'
}

const goalLabels: Record<string, string> = {
  weight_loss: 'Weight Loss',
  muscle_building: 'Muscle Building',
  toning: 'Toning',
  maintenance: 'General Fitness',
}

export default function TrainerDashboard() {
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      const requestsRes = await fetch('/api/trainer/requests?status=pending')
      const requestsData = await requestsRes.json()

      const assignmentsRes = await fetch('/api/trainer/assignments')
      const assignmentsData = await assignmentsRes.json()

      setRequests(requestsData.data || [])
      setAssignments(assignmentsData.data || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch('/api/trainer/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ requestId, action }),
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error processing request:', error)
    }
  }

  const metrics = useMemo(() => {
    const active = assignments.filter((a) => a.status === 'active').length
    const pending = requests.filter((r) => r.status === 'pending').length
    const needsPlan = assignments.filter((a) => a.planStatus === 'pending').length
    const elite = assignments.filter((a) => a.user.plan === 'elite').length
    return { active, pending, needsPlan, elite }
  }, [assignments, requests])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-6 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-16 right-8 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-gray-400 mt-2">
              Manage incoming requests, active members, and plan actions.
            </p>
          </div>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-sm"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active members"
            value={metrics.active}
            icon={<Users className="w-5 h-5 text-orange-400" />}
          />
          <MetricCard
            title="Pending requests"
            value={metrics.pending}
            icon={<ClipboardList className="w-5 h-5 text-orange-400" />}
          />
          <MetricCard
            title="Needs plan"
            value={metrics.needsPlan}
            icon={<AlertTriangle className="w-5 h-5 text-yellow-400" />}
            highlight={metrics.needsPlan > 0}
          />
          <MetricCard
            title="Elite tier"
            value={metrics.elite}
            icon={<CheckCircle2 className="w-5 h-5 text-orange-400" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Incoming requests</h2>
                <p className="text-gray-400 text-sm">Auto-matched for your specialization</p>
              </div>
              {requests.length > 0 && (
                <button
                  onClick={() => router.push('/trainer/requests')}
                  className="text-sm text-orange-400 hover:text-orange-300"
                >
                  View all
                </button>
              )}
            </div>
            <div className="space-y-3">
              {requests.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No pending requests</p>
                </div>
              ) : (
                requests.slice(0, 3).map((request) => (
                  <div
                    key={request.id}
                    className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <p className="font-semibold">{request.user.name}</p>
                        <p className="text-xs text-gray-400">
                          {request.goals.map((g) => goalLabels[g] || g).join(', ')} •{' '}
                          {request.tier.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRequestAction(request.id, 'accept')}
                        className="flex-1 px-3 py-2 rounded-lg bg-green-500/15 text-green-100 border border-green-400/40 text-xs hover:bg-green-500/20"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRequestAction(request.id, 'reject')}
                        className="flex-1 px-3 py-2 rounded-lg bg-red-500/10 text-red-100 border border-red-400/30 text-xs hover:bg-red-500/15"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Active members</h2>
                <p className="text-gray-400 text-sm">Quick view of current roster</p>
              </div>
              {assignments.length > 0 && (
                <button
                  onClick={() => router.push('/trainer/client-list')}
                  className="text-sm text-orange-400 hover:text-orange-300"
                >
                  View all
                </button>
              )}
            </div>
            <div className="space-y-3">
              {assignments.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No active members yet</p>
                </div>
              ) : (
                assignments.slice(0, 3).map((assignment) => (
                  <div
                    key={assignment.id}
                    className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold">{assignment.user.name}</p>
                        <p className="text-xs text-gray-400">
                          Plan: {assignment.user.plan?.toUpperCase() || 'N/A'}
                        </p>
                      </div>
                      {assignment.planStatus === 'pending' && (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/15 text-yellow-100 border border-yellow-400/30">
                          Needs Plan
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => router.push(`/trainer/client-list/${assignment.user.id}`)}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/15 text-xs hover:bg-white/15"
                    >
                      View Details
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  icon,
  highlight = false,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className="relative group">
      <div
        className={`absolute inset-0 ${highlight ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/10' : 'bg-gradient-to-br from-orange-500/15 to-orange-600/5'} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300`}
      />
      <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl hover:shadow-orange-500/15 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
          <div className={`p-2 ${highlight ? 'bg-yellow-500/15' : 'bg-orange-500/10'} rounded-lg`}>
            {icon}
          </div>
        </div>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  )
}
