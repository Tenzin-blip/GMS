'use client'

import React, { useState, useEffect } from 'react'
import { Bell, Plus, Pencil, Trash2, X } from 'lucide-react'
import Toast from '@/components/website/toast'

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
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
  } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
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
      setError(null)
      const response = await fetch('/api/notices?where[isActive][equals]=true&sort=-date')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notices: ${response.status}`)
      }

      const data = await response.json()
      setNotices(data.docs || [])
    } catch (err) {
      console.error('Error fetching notices:', err)
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
        return 'bg-red-500/20 text-red-400 border border-red-500/30'
      case 'warning':
        return 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
      case 'reminder':
        return 'bg-green-500/20 text-green-400 border border-green-500/30'
      default:
        return 'bg-white/10 text-gray-300 border border-white/20'
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
      showToast(`Error ${editingNotice ? 'updating' : 'creating'} notice. Please try again.`, 'error')
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
        showToast('Notice deleted successfully.', 'success')
      } else {
        showToast('Failed to delete notice.', 'error')
      }
    } catch (err) {
      console.error(err)
      showToast('Error deleting notice.', 'error')
    }
  }

  const isAdmin = user?.role === 'admin'
  const showControls = showAdminControls && isAdmin

  if (loading) {
    return (
      <>
        <div className="bg-black flex items-center justify-center p-4 min-h-screen">
          <div className="w-full max-w-md backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 shadow-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none" />
            <div className="relative z-10 flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
              <p className="text-gray-300">Loading notices...</p>
            </div>
          </div>
        </div>
        {toastNode}
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="bg-black flex items-center justify-center p-4 min-h-screen">
          <div className="w-full max-w-md backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 shadow-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none" />
            <div className="relative z-10">
              <p className="text-red-400 mb-3">Error: {error}</p>
              <button
                onClick={fetchNotices}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white text-sm transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
        {toastNode}
      </>
    )
  }

  return (
    <>
      <div className="w-full p-4 min-h-screen pt-20 md:pt-4">
        <div className="w-full mx-auto backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <div className="p-4 md:p-7 border-b border-white/10">
              <div className="flex items-center gap-3 justify-center mb-4 md:mb-0">
                <Bell className="text-orange-500" size={24} />
                <h1 className="text-xl md:text-2xl Poppins-bold text-white">Notice Board</h1>
              </div>

              {showControls && (
                <div className="flex justify-end mt-4 md:mt-0">
                  <button
                    onClick={openCreateModal}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors Poppins-semibold w-full sm:w-auto justify-center shadow-lg"
                  >
                    <Plus size={16} /> Add Notice
                  </button>
                </div>
              )}
            </div>

            {notices.length === 0 ? (
              <div className="p-6 text-center Poppins-regular">
                <p className="text-gray-400">No notices available at the moment.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
                {notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="p-4 md:p-6 hover:bg-white/5 transition-colors duration-200"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                      <div className="flex-1 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                          <h3 className="text-white Poppins-bold text-base md:text-lg">{notice.title}</h3>
                          <span
                            className={`px-3 py-1 Poppins-semibold rounded-full text-xs font-medium whitespace-nowrap self-start backdrop-blur-md ${getTypeBadgeStyles(
                              notice.type
                            )}`}
                          >
                            {notice.type}
                          </span>
                        </div>
                        {notice.description && (
                          <p className="text-gray-300 text-sm mb-2 Poppins-regular break-words">
                            {notice.description}
                          </p>
                        )}
                        <p className="text-gray-400 text-sm Poppins-regular">{formatDate(notice.date)}</p>
                      </div>
                    </div>

                    {showControls && (
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 Poppins-regular">
                        <button
                          onClick={() => openEditModal(notice)}
                          className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs backdrop-blur-md bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 transition-colors"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(notice.id)}
                          className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs backdrop-blur-md bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-colors"
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none" />
            
            <div className="relative z-10">
              <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center sticky top-0 backdrop-blur-xl bg-white/10 z-10">
                <h2 className="text-lg md:text-xl font-bold text-white">
                  {editingNotice ? 'Edit Notice' : 'Create New Notice'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 md:p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full backdrop-blur-md bg-white/5 border border-white/10 rounded-lg px-3 md:px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base transition-all"
                      placeholder="Enter notice title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full backdrop-blur-md bg-white/5 border border-white/10 rounded-lg px-3 md:px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as NoticeType })}
                      className="w-full backdrop-blur-md bg-white/5 border border-white/10 rounded-lg px-3 md:px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base transition-all"
                    >
                      <option value="reminder" className="bg-gray-900">Reminder</option>
                      <option value="warning" className="bg-gray-900">Warning</option>
                      <option value="important" className="bg-gray-900">Important</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full backdrop-blur-md bg-white/5 border border-white/10 rounded-lg px-3 md:px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-sm md:text-base transition-all"
                      placeholder="Enter optional description"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg transition-colors text-sm md:text-base order-2 sm:order-1"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base order-1 sm:order-2 shadow-lg"
                      disabled={submitting}
                    >
                      {submitting ? 'Saving...' : editingNotice ? 'Update' : 'Create'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {toastNode}
    </>
  )
}

export default Notices