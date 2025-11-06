'use client'

import { useState, useEffect } from 'react'

import DashboardHeader from '@/components/system/dashboard/DashboardHeader'

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-gray-400 mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{gymData?.totalUsers || 0}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-gray-400 mb-2">Active Members</h3>
          <p className="text-3xl font-bold">{gymData?.activeMembers || 0}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-gray-400 mb-2">Admins</h3>
          <p className="text-3xl font-bold">
            {gymData?.users.filter((u) => u.role === 'admin').length || 0}
          </p>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">All Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Plan</th>
                <th className="text-left p-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {gymData?.users.map((user) => (
                <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.role === 'admin' ? 'bg-orange-600' : 'bg-blue-600'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3">{user.plan}</td>
                  <td className="p-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
