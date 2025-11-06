'use client'

import { useState, useEffect } from 'react'

import DashboardHeader from '@/components/system/dashboard/DashboardHeader'
import Notices from '@/components/system/dashboard/Notices'

interface User {
  id: string
  email: string
  name: string
  role: string
  plan: string
  phoneNumber?: string
  createdAt: string
}

interface GymData {
  users: User[]
  totalUsers: number
  activeMembers: number
}

export default function Admin_dash() {
  const [gymData, setGymData] = useState<GymData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGymData()
  }, [])

  const fetchGymData = async () => {
    try {
      setLoading(true)

      const token = sessionStorage.getItem('token')

      if (!token) {
        setError('Not authenticated')
        return
      }

      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json() 
        console.log('Data received:', data) 

        // Process data
        setGymData({
          users: data.docs || [],
          totalUsers: data.totalDocs || 0,
          activeMembers: data.docs?.filter((u: User) => u.plan !== 'inactive').length || 0,
        })

      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        setError('Failed to fetch data')
      }
    } catch (error) {
      console.error('Error fetching gym data:', error)
      setError('Error fetching data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
        <DashboardHeader/>
        <Notices showAdminControls={true}/>
    </div>
  )
}
