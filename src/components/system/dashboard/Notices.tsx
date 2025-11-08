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

const Notices: React.FC<NoticesProps> = ({ showAdminControls = false }) => {
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

      // Refresh notices list
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
      <div className="bg-slate-950 flex items-center justify-center p-4">
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
      <div className="bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/50 rounded-2xl border border-slate-800/50 shadow-2xl p-6">
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden pb-4 px-2 border border-gray-400">
          <div className="p-6 border-b border-slate-800/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Bell className="text-orange-500" size={28} />
              <h1 className="text-2xl font-bold text-white">Notice Board</h1>
            </div>

            {showControls && (
              <button
                onClick={openCreateModal}
                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors"
              >
                <Plus size={16} /> Add
              </button>
            )}
          </div>

          {notices.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-slate-500">No notices available at the moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50 max-h-[456px] overflow-y-auto">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className="p-6 hover:bg-slate-800/30 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-2">{notice.title}</h3>
                      {notice.description && (
                        <p className="text-slate-400 text-sm mb-2">
                          {notice.description}
                        </p>
                      )}
                      <p className="text-slate-500 text-sm">{formatDate(notice.date)}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getTypeBadgeStyles(
                        notice.type
                      )}`}
                    >
                      {notice.type}
                    </span>
                  </div>

                  {showControls && (
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={() => openEditModal(notice)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs bg-blue-700 hover:bg-blue-800 text-white transition-colors"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(notice.id)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs bg-red-700 hover:bg-red-800 text-white transition-colors"
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
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {editingNotice ? 'Edit Notice' : 'Create New Notice'}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Enter optional description"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingNotice ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Notices