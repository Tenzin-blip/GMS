'use client'

import { useState, useEffect } from 'react'
import DashboardHeader from '@/components/system/dashboard/DashboardHeader'
import Toast from '@/components/website/toast'

interface User {
  id: string
  email: string
  name: string
  role: string
  plan: string
  phoneNumber?: string
  dob?: string
  gender?: string
  createdAt: string
}

interface GymData {
  users: User[]
  totalUsers: number
  activeMembers: number
}

interface UserFormData {
  email: string
  password: string
  name: string
  role: string
  plan: string
  phoneNumber: string
  dob: string
  gender: string
}

export default function Admin_dash() {
  const [gymData, setGymData] = useState<GymData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    name: '',
    role: 'user',
    plan: 'essential',
    phoneNumber: '',
    dob: '',
    gender: 'other',
  })
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
  } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
  }

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

  const handleCreateUser = () => {
    setModalMode('create')
    setSelectedUser(null)
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'user',
      plan: 'essential',
      phoneNumber: '',
      dob: '',
      gender: 'other',
    })
    setShowModal(true)
  }

  const handleEditUser = (user: User) => {
    setModalMode('edit')
    setSelectedUser(user)
    setFormData({
      email: user.email,
      password: '',
      name: user.name,
      role: user.role,
      plan: user.plan,
      phoneNumber: user.phoneNumber || '',
      dob: user.dob || '',
      gender: user.gender || 'other',
    })
    setShowModal(true)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const token = sessionStorage.getItem('token')
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        showToast('User deleted successfully.', 'success')
        fetchGymData()
      } else {
        showToast('Failed to delete user.', 'error')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      showToast('Error deleting user.', 'error')
    }
  }

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault()

    try {
      const token = sessionStorage.getItem('token')
      const url = modalMode === 'create' ? '/api/users' : `/api/users/${selectedUser?.id}`

      const method = modalMode === 'create' ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        showToast(`User ${modalMode === 'create' ? 'created' : 'updated'} successfully.`, 'success')
        setShowModal(false)
        fetchGymData()
      } else {
        const errorData = await response.json()
        showToast(`Failed to ${modalMode} user: ${errorData.message || 'Unknown error'}`, 'error')
      }
    } catch (error) {
      console.error(`Error ${modalMode}ing user:`, error)
      showToast(`Error ${modalMode}ing user.`, 'error')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
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
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <p>Loading...</p>
        </div>
        {toastNode}
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <p className="text-red-500">{error}</p>
        </div>
        {toastNode}
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen text-white p-4 md:p-6 pt-20 md:pt-6">
        <DashboardHeader />
      </div>
      {toastNode}
    </>
  )
}
