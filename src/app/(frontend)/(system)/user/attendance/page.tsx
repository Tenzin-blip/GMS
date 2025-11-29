'use client'

import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Flame,
  Clock,
  TrendingUp,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import Toast from '@/components/website/toast'
import { SectionFade } from '@/components/animations/SectionFade'

export default function AttendancePage() {
  type AttendanceRecord = {
    id: string
    date: string
    checkIn?: string
    checkOut?: string | null
    duration: number
    status?: 'completed' | 'in-progress' | 'absent'
  }

  type Stats = {
    daysThisMonth: number
    totalDays: number
    currentStreak: number
    avgDuration: number
    totalHours: number
  }

  const [currentDate, setCurrentDate] = useState(new Date())
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<Stats>({
    daysThisMonth: 0,
    totalDays: 0,
    currentStreak: 0,
    avgDuration: 0,
    totalHours: 0,
  })
  const [showManualModal, setShowManualModal] = useState(false)
  const [manualAction, setManualAction] = useState('checkin')
  const [reason, setReason] = useState('')
  const [motivationalMessage, setMotivationalMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasData, setHasData] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
  } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
  }

  useEffect(() => {
    fetchAttendanceData()
  }, [currentDate])

  const fetchAttendanceData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/attendance-stats`)
      const result = await response.json()

      if (result.success) {
        setHasData(result.hasData)
        setAttendanceData(result.data || [])
        setStats(
          result.stats || {
            daysThisMonth: 0,
            totalDays: 0,
            currentStreak: 0,
            avgDuration: 0,
            totalHours: 0,
          },
        )
        setMotivationalMessage(result.hasData ? null : result.message)
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error)
      setHasData(false)
      setMotivationalMessage('Unable to load data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }
  
  const { daysInMonth } = getDaysInMonth(currentDate)
  
  const getAttendanceStatus = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    const attendance = attendanceData.find((a) => {
      const recordDate = new Date(a.date).toISOString().split('T')[0]
      return recordDate === dateStr
    })

    if (attendance && attendance.status !== 'absent') return 'present'

    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    if (date.getDay() === 6) return 'skip'
    if (date > new Date()) return 'future'
    return 'absent'
  }

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)
    const days = []
    const today = new Date().getDate()
    const isCurrentMonth =
      currentDate.getMonth() === new Date().getMonth() &&
      currentDate.getFullYear() === new Date().getFullYear()

    const adjustedStartDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1

    for (let i = 0; i < adjustedStartDay; i++) {
      const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate()
      days.push(
        <div
          key={`prev-${i}`}
          className="aspect-square flex items-center justify-center text-gray-600 text-sm"
        >
          {prevMonthDays - adjustedStartDay + i + 1}
        </div>,
      )
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const status = getAttendanceStatus(day)
      const isToday = isCurrentMonth && day === today

      let bgColor = 'bg-white/5 backdrop-blur-sm'
      if (status === 'present') bgColor = 'bg-green-500/20 backdrop-blur-sm border-green-400/30'
      if (status === 'absent') bgColor = 'bg-red-500/20 backdrop-blur-sm border-red-400/30'
      if (status === 'skip') bgColor = 'bg-gray-500/20 backdrop-blur-sm'
      if (isToday) bgColor = 'bg-orange-500/30 backdrop-blur-sm border-orange-400/50'

      days.push(
        <div
          key={day}
          className={`aspect-square flex items-center justify-center text-white text-sm font-medium ${bgColor} ${isToday ? 'ring-2 ring-orange-400 shadow-lg shadow-orange-500/20' : ''} transition-all hover:opacity-80 cursor-pointer rounded-lg border border-white/10`}
        >
          {day}
        </div>,
      )
    }

    const remainingCells = 42 - days.length
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div
          key={`next-${i}`}
          className="aspect-square flex items-center justify-center text-gray-600 text-sm"
        >
          {i}
        </div>,
      )
    }

    return days
  }

  const handleManualCheckIn = async () => {
    if (!reason.trim()) {
      showToast('Please provide a reason for manual check-in.', 'error')
      return
    }

    try {
      const response = await fetch('/api/manual-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: manualAction,
          reason: reason,
          timestamp: new Date().toISOString(),
        }),
      })

      const result = await response.json()

      if (result.success) {
        showToast('Manual check-in request submitted. Waiting for approval.', 'success')
        setShowManualModal(false)
        setReason('')
      } else {
        showToast(result.message || 'Failed to submit request.', 'error')
      }
    } catch (error) {
      console.error('Manual check-in error:', error)
      showToast('Failed to submit request.', 'error')
    }
  }

  const changeMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const toastNode =
    toast && (
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(null)}
        duration={3000}
      />
    )

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your attendance data...</p>
          </div>
        </div>
        {toastNode}
      </>
    )
  }

  return (
    <>
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6">
        <SectionFade className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-orange-500">Attendance</h1>
              <p className="text-gray-400 mt-1">Track your gym visits and maintain your streak</p>
            </div>
            <button
              onClick={() => setShowManualModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-500/20 to-orange-600/20 hover:from-orange-500/30 hover:to-orange-600/30 backdrop-blur-xl border border-orange-400/30 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20"
            >
              <AlertCircle className="w-5 h-5" />
              Manual Check-in
            </button>
          </div>

          {!hasData && motivationalMessage && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-2xl blur-2xl" />
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
                <div className="p-4 bg-orange-500/10 rounded-full w-fit mx-auto mb-4">
                  <Sparkles className="w-16 h-16 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-2">
                  Ready to Begin?
                </h2>
                <p className="text-gray-300 text-lg mb-4">{motivationalMessage}</p>
                <p className="text-gray-400 text-sm">
                  Check in at the gym to start tracking your progress!
                </p>
              </div>
            </div>
          )}

          <SectionFade delay={0.05} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl hover:shadow-orange-500/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 text-sm font-medium">Attendance</h3>
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Calendar className="w-5 h-5 text-orange-500" />
                  </div>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
                  {stats.daysThisMonth}/{daysInMonth}
                </p>
                <p className="text-gray-400 text-sm mt-1">Days this month</p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl hover:shadow-orange-500/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 text-sm font-medium">Streak</h3>
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
                  {stats.currentStreak} days
                </p>
                <p className="text-gray-400 text-sm mt-1">Current active streak</p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl hover:shadow-orange-500/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 text-sm font-medium">Avg Duration</h3>
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-500" />
                  </div>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
                  {Math.floor(stats.avgDuration / 60)}h {stats.avgDuration % 60}m
                </p>
                <p className="text-gray-400 text-sm mt-1">Per Session</p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl hover:shadow-orange-500/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 text-sm font-medium">Total Hours</h3>
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                  </div>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
                  {stats.totalHours}h
                </p>
                <p className="text-gray-400 text-sm mt-1">This month</p>
              </div>
            </div>
          </SectionFade>

          <SectionFade delay={0.1} className="grid lg:grid-cols-2 gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-2xl blur-xl transition-all duration-300" />
              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => changeMonth(-1)}
                      className="p-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-lg transition-all border border-white/10"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => changeMonth(1)}
                      className="p-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-lg transition-all border border-white/10"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                      <div key={day} className="text-center text-gray-400 text-sm font-medium">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
                </div>

                <div className="flex items-center gap-4 mt-6 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500/30 backdrop-blur-sm border border-green-400/50 rounded shadow-lg shadow-green-500/20"></div>
                    <span className="text-gray-300">Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500/30 backdrop-blur-sm border border-red-400/50 rounded shadow-lg shadow-red-500/20"></div>
                    <span className="text-gray-300">Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500/30 backdrop-blur-sm border border-orange-400/50 rounded shadow-lg shadow-orange-500/20"></div>
                    <span className="text-gray-300">Today</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-2xl blur-xl transition-all duration-300" />
              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-1">Recent Attendance</h2>
                  <p className="text-gray-400 text-sm">Your check-in and check-out history</p>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {attendanceData.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No attendance records yet</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Start checking in to see your history
                      </p>
                    </div>
                  ) : (
                    attendanceData.map((record) => (
                      <div
                        key={record.id}
                        className="relative group/item"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                        <div className="relative bg-white/5 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between border border-white/10 hover:border-orange-500/30 transition-all duration-300">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                              <CheckSquare className="w-5 h-5 text-orange-500 flex-shrink-0" />
                            </div>
                            <div>
                              <p className="font-semibold text-white">
                                {new Date(record.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {record.checkIn || 'N/A'} - {record.checkOut || 'In Progress'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-white">
                              {Math.floor(record.duration / 60)}h {record.duration % 60}m
                            </p>
                            <p className="text-gray-400 text-sm">Duration</p>
                            <span
                              className={`inline-block mt-1 px-3 py-1 text-white text-xs rounded-full backdrop-blur-sm ${
                                record.status === 'completed' 
                                  ? 'bg-orange-500/20 border border-orange-400/30' 
                                  : 'bg-blue-500/20 border border-blue-400/30'
                              }`}
                            >
                              {record.status === 'completed' ? 'Completed' : 'Inprogress'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </SectionFade>
        </SectionFade>
      </div>

      {showManualModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-600/5 rounded-2xl blur-xl" />
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-2xl p-6 border border-white/20 shadow-2xl">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Manual Check-in Request
              </h3>
              <p className="text-gray-300 text-sm mb-6">
                Manual check-ins require admin approval. Please provide a valid reason.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Action</label>
                  <select
                    value={manualAction}
                    onChange={(e) => setManualAction(e.target.value)}
                    className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                  >
                    <option value="checkin">Check In</option>
                    <option value="checkout">Check Out</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Reason</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., QR scanner not working, forgot to scan, etc."
                    className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-white h-24 resize-none focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-gray-500"
                  />
                </div>

                <div className="bg-yellow-500/10 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-3">
                  <p className="text-yellow-400 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      This request will be sent to administrators for approval. Misuse may result in
                      account suspension.
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowManualModal(false)
                    setReason('')
                  }}
                  className="flex-1 px-4 py-3 bg-white/5 backdrop-blur-sm hover:bg-white/10 rounded-xl font-medium transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualCheckIn}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500/20 to-orange-600/20 backdrop-blur-sm hover:from-orange-500/30 hover:to-orange-600/30 rounded-xl font-medium transition-all border border-orange-400/30 shadow-lg shadow-orange-500/20"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {toastNode}
    </>
  )
}