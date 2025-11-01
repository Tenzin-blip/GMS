import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const { user } = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    // Get last 30 days
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)

    const query: Record<string, any> = {
      user: { equals: String(userId) },
      role: { equals: 'member' },
      date: {
        greater_than_equal: thirtyDaysAgo.toISOString().split('T')[0],
        less_than_equal: today.toISOString().split('T')[0],
      },
    }

    const attendanceRecords = await payload.find({
      collection: 'attendance',
      where: query,
      sort: '-date',
      limit: 100,
    })

    if (attendanceRecords.docs.length === 0) {
      return NextResponse.json({
        success: true,
        hasData: false,
        message: 'No attendance data yet.',
        data: [],
        stats: {
          daysThisMonth: 0,
          totalDays: new Date().getDate(),
          currentStreak: 0,
          avgDuration: 0,
          totalHours: 0,
        },
      })
    }

    const formatTime = (timeStr: string | null | undefined | Date | any) => {
      if (!timeStr) return null

      if (timeStr instanceof Date) {
        const hours = timeStr.getHours().toString().padStart(2, '0')
        const minutes = timeStr.getMinutes().toString().padStart(2, '0')
        timeStr = `${hours}:${minutes}`
      }

      const timeString = String(timeStr)
      if (!timeString.includes(':')) return null

      const [hours, minutes] = timeString.split(':').map(Number)
      const period = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours % 12 || 12
      return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`
    }

    const formattedData = attendanceRecords.docs.map((record: any) => {
      let status = 'absent'
      if (
        record.status === 'checked-out' ||
        record.status === 'auto-closed' ||
        record.status === 'present'
      ) {
        status = 'completed'
      } else if (record.status === 'checked-in') {
        status = 'in-progress'
      }

      return {
        id: record.id,
        date: record.date,
        checkIn: formatTime(record.checkInTime),
        checkOut: formatTime(record.checkOutTime),
        duration: record.durationMinutes || 0,
        status: status,
      }
    })

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const thisMonthRecords = attendanceRecords.docs.filter((r: any) => {
      const recordDate = new Date(r.date)
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear
    })

    const completedRecords = thisMonthRecords.filter(
      (r: any) =>
        r.status === 'checked-out' || r.status === 'auto-closed' || r.status === 'present',
    )

    const totalMinutes = completedRecords.reduce(
      (sum: number, r: any) => sum + (r.durationMinutes || 0),
      0,
    )

    const avgDuration =
      completedRecords.length > 0 ? Math.round(totalMinutes / completedRecords.length) : 0

    const sortedDates = attendanceRecords.docs
      .filter((r: any) => r.status !== 'absent')
      .map((r: any) => new Date(r.date))
      .sort((a: Date, b: Date) => b.getTime() - a.getTime())

    let currentStreak = 0
    const checkDate = new Date()
    checkDate.setHours(0, 0, 0, 0)

    for (const recordDate of sortedDates) {
      const rDate = new Date(recordDate)
      rDate.setHours(0, 0, 0, 0)

      while (checkDate.getDay() === 6) {
        checkDate.setDate(checkDate.getDate() - 1)
      }

      if (rDate.getTime() === checkDate.getTime()) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (rDate.getTime() < checkDate.getTime()) {
        break
      }
    }

    const stats = {
      daysThisMonth: thisMonthRecords.length,
      totalDays: now.getDate(),
      currentStreak,
      avgDuration,
      totalHours: parseFloat((totalMinutes / 60).toFixed(1)),
    }

    return NextResponse.json({
      success: true,
      hasData: true,
      count: formattedData.length,
      data: formattedData,
      stats,
    })
  } catch (error: any) {
    console.error('Attendance fetch error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch attendance.',
      },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const { user } = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const date = searchParams.get('present')

    if (!date) {
      return NextResponse.json(
        { success: false, message: 'Missing date parameter' },
        { status: 400 },
      )
    }

    // Check if attendance already exists for this date
    const existing = await payload.find({
      collection: 'attendance',
      where: {
        user: { equals: String(userId) },
        date: { equals: date },
      },
    })

    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const currentTime = `${hours}:${minutes}`

    // If already checked in, check them out
    if (existing.docs.length > 0) {
      const record = existing.docs[0]

      // If already checked out, return error
      if (
        record.status === 'checked-out' ||
        record.status === 'auto-closed' ||
        record.status === 'present'
      ) {
        return NextResponse.json(
          { success: false, message: 'Already checked out for this date' },
          { status: 400 },
        )
      }

      // Calculate duration
      const checkInTime = record.checkInTime
      const [checkInHours, checkInMinutes] = checkInTime.split(':').map(Number)
      const [checkOutHours, checkOutMinutes] = currentTime.split(':').map(Number)

      const checkInTotalMinutes = checkInHours * 60 + checkInMinutes
      const checkOutTotalMinutes = checkOutHours * 60 + checkOutMinutes
      const durationMinutes = checkOutTotalMinutes - checkInTotalMinutes

      // Update to checked-out (don't set status, let hook handle it)
      const updated = await payload.update({
        collection: 'attendance',
        id: record.id,
        data: {
          checkOutTime: currentTime,
          durationMinutes: durationMinutes > 0 ? durationMinutes : 0,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Checked out successfully',
        action: 'checkout',
        data: updated,
      })
    }

    // Create new check-in record (don't set status, let hook handle it)
    const attendance = await payload.create({
      collection: 'attendance',
      data: {
        user: userId,
        date: date,
        role: 'member',
        checkInTime: currentTime,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Checked in successfully',
      action: 'checkin',
      data: attendance,
    })
  } catch (error: any) {
    console.error('Attendance POST error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to mark attendance',
      },
      { status: 500 },
    )
  }
}
