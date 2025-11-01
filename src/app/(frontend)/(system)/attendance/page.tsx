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

      let bgColor = 'bg-gray-700'
      if (status === 'present') bgColor = 'bg-green-700'
      if (status === 'absent') bgColor = 'bg-red-900'
      if (status === 'skip') bgColor = 'bg-gray-800'
      if (isToday) bgColor = 'bg-orange-600'

      days.push(
        <div
          key={day}
          className={`aspect-square flex items-center justify-center text-white text-sm font-medium ${bgColor} ${isToday ? 'ring-2 ring-orange-400' : ''} transition-all hover:opacity-80 cursor-pointer rounded-lg`}
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
      alert('Please provide a reason for manual check-in')
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
        alert('Manual check-in request submitted! Waiting for admin approval.')
        setShowManualModal(false)
        setReason('')
      } else {
        alert(result.message || 'Failed to submit request')
      }
    } catch (error) {
      console.error('Manual check-in error:', error)
      alert('Failed to submit request')
    }
  }

  const changeMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your attendance data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-orange-500">Attendance</h1>
            <p className="text-gray-400 mt-1">Track your gym visits and maintain your streak</p>
          </div>
          <button
            onClick={() => setShowManualModal(true)}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-500 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            Manual Check-in
          </button>
        </div>

        {!hasData && motivationalMessage && (
          <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-700/50 rounded-2xl p-8 text-center">
            <Sparkles className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-orange-400 mb-2">Ready to Begin?</h2>
            <p className="text-gray-300 text-lg mb-4">{motivationalMessage}</p>
            <p className="text-gray-400 text-sm">
              Check in at the gym to start tracking your progress!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm">Attendance</h3>
              <Calendar className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-4xl font-bold">
              {stats.daysThisMonth}/{stats.totalDays}
            </p>
            <p className="text-gray-400 text-sm mt-1">Days this month</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm">Streak</h3>
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-4xl font-bold">{stats.currentStreak} days</p>
            <p className="text-gray-400 text-sm mt-1">Current active streak</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm">Avg Duration</h3>
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-4xl font-bold">
              {Math.floor(stats.avgDuration / 60)}h {stats.avgDuration % 60}m
            </p>
            <p className="text-gray-400 text-sm mt-1">Per Session</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm">Total Hours</h3>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-4xl font-bold">{stats.totalHours}h</p>
            <p className="text-gray-400 text-sm mt-1">This month</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => changeMonth(1)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
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
                <div className="w-4 h-4 bg-green-700 rounded"></div>
                <span className="text-gray-400">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-900 rounded"></div>
                <span className="text-gray-400">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-600 rounded"></div>
                <span className="text-gray-400">Today</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
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
                    className="bg-gray-700 bg-opacity-50 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <CheckSquare className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
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
                        className={`inline-block mt-1 px-3 py-1 text-white text-xs rounded-full ${
                          record.status === 'completed' ? 'bg-orange-600' : 'bg-blue-600'
                        }`}
                      >
                        {record.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showManualModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-2xl font-bold mb-4 text-orange-500">Manual Check-in Request</h3>
            <p className="text-gray-400 text-sm mb-6">
              Manual check-ins require admin approval. Please provide a valid reason.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Action</label>
                <select
                  value={manualAction}
                  onChange={(e) => setManualAction(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
                >
                  <option value="checkin">Check In</option>
                  <option value="checkout">Check Out</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., QR scanner not working, forgot to scan, etc."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white h-24 resize-none"
                />
              </div>

              <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg p-3">
                <p className="text-yellow-500 text-xs flex items-start gap-2">
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
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleManualCheckIn}
                className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-500 rounded-lg font-medium transition-colors"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
