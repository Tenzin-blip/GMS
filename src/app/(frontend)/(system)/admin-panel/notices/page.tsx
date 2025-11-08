'use client'

import React, { useState, useEffect } from 'react'
import { Bell, Plus, Pencil, Trash2, X } from 'lucide-react'

type NoticeType = 'important' | 'warning' | 'reminder'

interface Notice {
  id: string
  title: string
  date: string
  type: NoticeType
  description?: string
  isActive: boolean
  createdAt: string
}

interface User {
  id: string
  role: 'admin' | 'member' | 'trainer'
}

interface NoticesProps {
  showAdminControls?: boolean
}

interface NoticeFormData {
  title: string
  date: string
  type: NoticeType
  description: string
}

const Notices: React.FC<NoticesProps> = ({ showAdminControls = true }) => {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<NoticeFormData>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: 'reminder',
    description: ''
  })

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/me')
        if (res.ok) {
          const data = await res.json()
          const userData = data.user || data
          setUser(userData)
        }
      } catch (err) {
        console.error('Error fetching user:', err)
      }
    }
    fetchUser()
  }, [])

  // Fetch notices
  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notices?where[isActive][equals]=true&sort=-date')
      if (!response.ok) throw new Error('Failed to fetch notices')

      const data = await response.json()
      setNotices(data.docs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getTypeBadgeStyles = (type: NoticeType) => {
    switch (type) {
      case 'important':
        return 'bg-red-900/40 text-red-400 border border-red-800/50'
      case 'warning':
        return 'bg-orange-900/40 text-orange-400 border border-orange-800/50'
      case 'reminder':
        return 'bg-green-900/40 text-green-400 border border-green-800/50'
      default:
        return 'bg-gray-700 text-gray-300'
    }
  }

  const openCreateModal = () => {
    setEditingNotice(null)
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      type: 'reminder',
      description: ''
    })
    setShowModal(true)
  }

  const openEditModal = (notice: Notice) => {
    setEditingNotice(notice)
    setFormData({
      title: notice.title,
      date: new Date(notice.date).toISOString().split('T')[0],
      type: notice.type,
      description: notice.description || ''
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingNotice(null)
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      type: 'reminder',
      description: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingNotice ? `/api/notices/${editingNotice.id}` : '/api/notices'
      const method = editingNotice ? 'PATCH' : 'POST'

      const payload = {
        ...formData,
        isActive: true
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        throw new Error(`Failed to ${editingNotice ? 'update' : 'create'} notice`)
      }

      await fetchNotices()
      closeModal()
    } catch (err) {
      console.error(err)
      alert(`Error ${editingNotice ? 'updating' : 'creating'} notice. Please try again.`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return
    try {
      const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setNotices((prev) => prev.filter((n) => n.id !== id))
      } else {
        alert('Failed to delete notice.')
      }
    } catch (err) {
      console.error(err)
      alert('Error deleting notice.')
    }
  }

  const isAdmin = user?.role === 'admin'
  const showControls = showAdminControls && isAdmin

  if (loading) {
    return (
      <div className="bg-slate-950 flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-md bg-slate-900/50 rounded-2xl border border-slate-800/50 shadow-2xl p-6">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            <p className="text-slate-400">Loading notices...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-slate-950 flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-md bg-slate-900/50 rounded-2xl border border-slate-800/50 shadow-2xl p-6">
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className=" w-full p-4 min-h-screen pt-20 md:pt-4">
        <div className="w-full mx-auto bg-white/10 backdrop-blur-md border border-gray-400 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-4 md:p-7 border-b border-slate-800/50">
            <div className="flex items-center gap-3 justify-center mb-4 md:mb-0">
              <Bell className="text-orange-500" size={24} />
              <h1 className="text-xl md:text-2xl Poppins-bold text-white">Notice Board</h1>
            </div>

            {showControls && (
              <div className="flex justify-end mt-4 md:mt-0">
                <button
                  onClick={openCreateModal}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors Poppins-semibold w-full sm:w-auto justify-center"
                >
                  <Plus size={16} /> Add Notice
                </button>
              </div>
            )}
          </div>

          {notices.length === 0 ? (
            <div className="p-6 text-center Poppins-regular">
              <p className="text-slate-500">No notices available at the moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50 max-h-[600px] overflow-y-auto">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className="p-4 md:p-6 hover:bg-slate-800/30 transition-colors duration-200"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                        <h3 className="text-white Poppins-bold text-base md:text-lg">{notice.title}</h3>
                        <span
                          className={`px-3 py-1 Poppins-semibold rounded-full text-xs font-medium whitespace-nowrap self-start ${getTypeBadgeStyles(
                            notice.type
                          )}`}
                        >
                          {notice.type}
                        </span>
                      </div>
                      {notice.description && (
                        <p className="text-slate-400 text-sm mb-2 Poppins-regular break-words">
                          {notice.description}
                        </p>
                      )}
                      <p className="text-slate-500 text-sm Poppins-regular">{formatDate(notice.date)}</p>
                    </div>
                  </div>

                  {showControls && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 Poppins-regular">
                      <button
                        onClick={() => openEditModal(notice)}
                        className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs bg-blue-700 hover:bg-blue-800 text-white transition-colors"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(notice.id)}
                        className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs bg-red-700 hover:bg-red-800 text-white transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
              <h2 className="text-lg md:text-xl font-bold text-white">
                {editingNotice ? 'Edit Notice' : 'Create New Notice'}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 md:p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 md:px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
                    placeholder="Enter notice title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 md:px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as NoticeType })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 md:px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
                  >
                    <option value="reminder">Reminder</option>
                    <option value="warning">Warning</option>
                    <option value="important">Important</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 md:px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-sm md:text-base"
                    placeholder="Enter optional description"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors text-sm md:text-base order-2 sm:order-1"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base order-1 sm:order-2"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : editingNotice ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Notices