'use client'

import React from 'react'
import { Settings } from 'lucide-react'

export default function TrainerSettings() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-8 left-10 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-12 right-10 w-80 h-80 bg-purple-500/25 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-orange-400" />
          <div>
            <p className="text-sm text-orange-400 uppercase tracking-wide">Trainer</p>
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
          <p className="text-gray-300">
            Configuration options for trainer notifications, availability sync, and integrations will live here.
          </p>
        </div>
      </div>
    </div>
  )
}

