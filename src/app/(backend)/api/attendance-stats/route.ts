import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const { user } = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.id

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    console.log('Authenticated user:', user)

    const searchParams = req.nextUrl.searchParams

    const month = searchParams.get('month')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Missing userId parameter' },
        { status: 400 },
      )
    }

    const query: Record<string, any> = {
      user: { equals: String(userId) },
      role: { equals: 'member' },
    }

    if (month) {
      const [year, monthNum] = month.split('-')
      const firstDay = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
      const lastDay = new Date(parseInt(year), parseInt(monthNum), 0)

      query.date = {
        greater_than_equal: firstDay.toISOString().split('T')[0],
        less_than_equal: lastDay.toISOString().split('T')[0],
      }
    } else if (startDate && endDate) {
      query.date = {
        greater_than_equal: startDate,
        less_than_equal: endDate,
      }
    }

    const attendanceRecords = await payload.find({
      collection: 'attendance',
      where: query,
      sort: '-date',
      limit: 50,
    })

    console.log('Attendance found:', attendanceRecords.docs.length)

    if (attendanceRecords.docs.length === 0) {
      return NextResponse.json({
        success: true,
        hasData: false,
        message:
          'No attendance data yet.',
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

   const formattedData = attendanceRecords.docs.map((record: any) => {
      const formatTime = (timeStr: string | null) => {
        if (!timeStr) return null
        const [hours, minutes] = timeStr.split(':').map(Number)
        const period = hours >= 12 ? 'PM' : 'AM'
        const displayHours = hours % 12 || 12
        return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`
      }

      return {
        id: record.id,
        date: record.date,
        checkIn: formatTime(record.checkInTime),
        checkOut: formatTime(record.checkOutTime),
        duration: record.durationMinutes || 0,
        status: record.status === 'checked-out' || record.status === 'auto-closed' 
          ? 'completed' 
          : record.status === 'absent' 
          ? 'absent' 
          : 'in-progress',
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
      (r: any) => r.status === 'checked-out' || r.status === 'auto-closed',
    )

    const totalMinutes = completedRecords.reduce(
      (sum: number, r: any) => sum + (r.durationMinutes || 0),
      0,
    )

    const avgDuration =
      completedRecords.length > 0 ? Math.round(totalMinutes / completedRecords.length) : 0

    const sortedDates = attendanceRecords.docs
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

