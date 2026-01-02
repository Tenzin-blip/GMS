'use client'

import React, { useState, useEffect } from 'react'
import { Users, Check, XCircle, Loader2, AlertCircle } from 'lucide-react'

type Request = {
  id: string
  user: {
    id: string
    name: string
    email: string
  }
  userFitnessData?: {
    id: string
    age?: number
    weight?: number
    height?: number
    activityLevel?: string
  }
  goals: string[]
  tier: 'premium' | 'elite'
  matchedSpecializations?: Array<{ specialization: string }>
  matchScore?: number
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

const goalLabels: Record<string, string> = {
  weight_loss: 'Weight Loss',
  muscle_building: 'Muscle Building',
  toning: 'Toning',
  maintenance: 'General Fitness',
}

export default function TrainerRequests() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/trainer/requests')
      
      if (!response.ok) {
        throw new Error('Failed to fetch requests')
      }

      const data = await response.json()
      setRequests(data.data || [])
    } catch (err: any) {
      console.error('Error fetching requests:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      setProcessingId(requestId)
      
      const response = await fetch('/api/trainer/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ requestId, action }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process request')
      }

      // Refresh the list
      await fetchRequests()
    } catch (err: any) {
      console.error('Error processing request:', err)
      alert(err.message)
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading requests...</p>
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
            onClick={fetchRequests}
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
        <div className="absolute top-8 left-10 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-12 right-10 w-80 h-80 bg-purple-500/25 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Requests</h1>
            <p className="text-gray-400 mt-2">
              Accept or reject members auto-matched to your specialization.
            </p>
          </div>
          <button
            onClick={fetchRequests}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-sm"
          >
            Refresh
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No requests yet</h3>
            <p className="text-gray-500">
              New member requests will appear here when they match your specializations.
            </p>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            {requests.map((request) => {
              const userData = request.user
              const isProcessing = processingId === request.id

              return (
                <div
                  key={request.id}
                  className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-orange-500/15 border border-orange-400/20 shrink-0">
                      <Users className="w-5 h-5 text-orange-300" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-lg">{userData?.name || 'Unknown User'}</p>
                        {request.matchScore && request.matchScore > 0 && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/15 text-green-100 border border-green-400/30">
                            {request.matchScore} match{request.matchScore > 1 ? 'es' : ''}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-2">
                        {userData?.email || 'No email'}
                      </p>

                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-gray-400">Goals:</span>
                          {request.goals.map((goal) => (
                            <span
                              key={goal}
                              className="px-2 py-1 text-xs rounded-full bg-blue-500/15 text-blue-100 border border-blue-400/30"
                            >
                              {goalLabels[goal] || goal}
                            </span>
                          ))}
                        </div>

                        {request.matchedSpecializations && request.matchedSpecializations.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-gray-400">Matched:</span>
                            {request.matchedSpecializations.map((match, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs rounded-full bg-orange-500/15 text-orange-100 border border-orange-400/30"
                              >
                                {goalLabels[match.specialization] || match.specialization}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>Tier: <span className="text-orange-300 font-medium">{request.tier.toUpperCase()}</span></span>
                          {request.userFitnessData && (
                            <>
                              {request.userFitnessData.age && <span>Age: {request.userFitnessData.age}</span>}
                              {request.userFitnessData.weight && <span>Weight: {request.userFitnessData.weight}kg</span>}
                              {request.userFitnessData.activityLevel && <span>Activity: {request.userFitnessData.activityLevel}</span>}
                            </>
                          )}
                        </div>
                      </div>

                      <span
                        className={`inline-block mt-3 px-3 py-1 text-xs rounded-full border ${
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

                  {request.status === 'pending' && (
                    <div className="flex gap-2 lg:flex-col">
                      <button
                        onClick={() => handleAction(request.id, 'accept')}
                        disabled={isProcessing}
                        className="flex-1 lg:flex-none px-4 py-2 rounded-lg bg-green-500/15 text-green-100 border border-green-400/40 text-sm flex items-center justify-center gap-2 hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Accept
                      </button>
                      <button
                        onClick={() => handleAction(request.id, 'reject')}
                        disabled={isProcessing}
                        className="flex-1 lg:flex-none px-4 py-2 rounded-lg bg-red-500/10 text-red-100 border border-red-400/30 text-sm flex items-center justify-center gap-2 hover:bg-red-500/15 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}