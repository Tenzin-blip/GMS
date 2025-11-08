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
    gender: 'other'
  })

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
      gender: 'other'
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
      gender: user.gender || 'other'
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
        alert('User deleted successfully')
        fetchGymData()
      } else {
        alert('Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = sessionStorage.getItem('token')
      const url = modalMode === 'create' 
        ? '/api/users' 
        : `/api/users/${selectedUser?.id}`
      
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
        alert(`User ${modalMode === 'create' ? 'created' : 'updated'} successfully`)
        setShowModal(false)
        fetchGymData()
      } else {
        const errorData = await response.json()
        alert(`Failed to ${modalMode} user: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error(`Error ${modalMode}ing user:`, error)
      alert(`Error ${modalMode}ing user`)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
    <div className="min-h-screen text-white p-6 ">
      <DashboardHeader/>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 Poppins-regular">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
          <h3 className="text-gray-400 mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{gymData?.totalUsers || 0}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
          <h3 className="text-gray-400 mb-2">Active Members</h3>
          <p className="text-3xl font-bold">{gymData?.activeMembers || 0}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
          <h3 className="text-gray-400 mb-2">Admins</h3>
          <p className="text-3xl font-bold">
            {gymData?.users.filter((u) => u.role === 'admin').length || 0}
          </p>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold p-3 Poppins-bold">All Users</h2>
          <button
            onClick={handleCreateUser}
            className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg transition-colors Poppins-semibold"
          >
            + Add User
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 Poppins-bold">
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Plan</th>
                <th className="text-left p-3">Joined</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {gymData?.users.map((user) => (
                <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700 transition-colors text-sm Poppins-regular">
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
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Create/Edit User */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {modalMode === 'create' ? 'Add New User' : 'Edit User'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {modalMode === 'create' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="trainer">Trainer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Plan *</label>
                  <select
                    name="plan"
                    value={formData.plan}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="essential">Essential</option>
                    <option value="premium">Premium</option>
                    <option value="elite">Elite</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
                >
                  {modalMode === 'create' ? 'Create User' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}