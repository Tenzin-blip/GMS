'use client'

import React, { useState, useEffect } from 'react'
import {
  Camera,
  Edit2,
  Save,
  X,
  Mail,
  Phone,
  Calendar,
  User,
  Scale,
  Ruler,
  Target,
  Utensils,
  Dumbbell,
  AlertCircle,
} from 'lucide-react'
import Image from 'next/image'
import Toast from '@/components/website/toast'

interface UserProfile {
  // Basic Info
  name: string
  email: string
  phoneNumber: string
  dob: string
  gender: string
  plan: string

  // Profile Picture
  profilePicture?: {
    url: string
  }

  // Fitness Data
  goal?: string
  currentWeight?: number
  height?: number
  targetWeight?: number
  activityLevel?: number
  hoursPerDay?: number
  daysPerWeek?: number
  dietType?: string
  allergies?: string
  preferences?: string
  age?: number
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
  } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = sessionStorage.getItem('token')

      // Fetch user data
      const userRes = await fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!userRes.ok) {
        throw new Error('Failed to fetch user data')
      }

      const userData = await userRes.json()
      console.log('User Data:', userData)

      // Fetch fitness data
      const fitnessRes = await fetch('/api/user-fitness', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!fitnessRes.ok) {
        console.error('Fitness fetch failed:', fitnessRes.status, fitnessRes.statusText)
      }

      const fitnessResponse = await fitnessRes.json()
      console.log('Fitness Data Response:', fitnessResponse)

      // Get the fitness profile
      const fitnessProfile = fitnessResponse?.data || null
      console.log('Fitness Profile:', fitnessProfile)

      // Combine data
      const combinedProfile: UserProfile = {
        ...userData.user,
        goal: fitnessProfile?.goal,
        activityLevel: fitnessProfile?.activityLevel || 3,
        currentWeight: fitnessProfile?.bodyMetrics?.currentWeight,
        height: fitnessProfile?.bodyMetrics?.height,
        targetWeight: fitnessProfile?.bodyMetrics?.targetWeight,
        hoursPerDay: fitnessProfile?.workoutPlan?.duration
          ? fitnessProfile.workoutPlan.duration / 60
          : 0,
        daysPerWeek: fitnessProfile?.workoutPlan?.frequency,
        dietType: fitnessProfile?.mealPlan?.dietType,
        allergies: fitnessProfile?.mealPlan?.allergies?.map((a: any) => a.allergen).join(', '),
        preferences: fitnessProfile?.mealPlan?.preferences,
      }

      console.log('Combined Profile:', combinedProfile)
      setProfile(combinedProfile)
      setEditData(combinedProfile)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }
  const handleEdit = (section: string) => {
    setIsEditing(true)
    setActiveSection(section)
    setEditData(profile ? { ...profile } : null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setActiveSection(null)
    setEditData(profile ? { ...profile } : null)
  }

  const handleSave = async () => {
    if (!editData) return

    setSaving(true)
    try {
      const token = sessionStorage.getItem('token')

      // Update user basic info if editing basic section
      if (activeSection === 'basic') {
        const userUpdateRes = await fetch('/api/users/me', {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: editData.name,
            phoneNumber: editData.phoneNumber,
            dob: editData.dob,
            gender: editData.gender,
          }),
        })

        if (!userUpdateRes.ok) {
          throw new Error('Failed to update user info')
        }
      }

      // Update fitness data for metrics, fitness, or diet sections
      if (activeSection === 'metrics' || activeSection === 'fitness' || activeSection === 'diet') {
        const fitnessUpdateRes = await fetch('/api/user-fitness', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            goal: editData.goal,
            activityLevel: editData.activityLevel || 3,
            bodyMetrics: {
              height: editData.height || 0,
              currentWeight: editData.currentWeight || 0,
              targetWeight: editData.targetWeight || 0,
            },
            workoutPlan: {
              frequency: editData.daysPerWeek || 0,
              duration: (editData.hoursPerDay || 0) * 60,
            },
            mealPlan: {
              dietType: editData.dietType,
              allergies: editData.allergies
                ? editData.allergies
                    .split(',')
                    .map((a) => ({ allergen: a.trim() }))
                    .filter((a) => a.allergen)
                : [],
              preferences: editData.preferences || '',
            },
          }),
        })

        if (!fitnessUpdateRes.ok) {
          throw new Error('Failed to update fitness data')
        }
      }

      // Update the profile state with saved data
      setProfile({ ...editData })
      setIsEditing(false)
      setActiveSection(null)
      showToast('Profile updated successfully!', 'success')

      // Refresh the data from server
      fetchProfile()
    } catch (error) {
      console.error('Error saving profile:', error)
      showToast('Failed to update profile. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setEditData((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  const toastNode = toast && (
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
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading profile...</p>
          </div>
        </div>
        {toastNode}
      </>
    )
  }

  const goalLabels: Record<string, string> = {
    weight_loss: 'Lose Weight & Burn Fat',
    muscle_building: 'Build Muscle & Strength',
    toning: 'Tone & Define',
    maintenance: 'General Fitness',
  }

  const activityLevels = ['Sedentary', 'Lightly Active', 'Moderate', 'Very Active', 'Extreme']
  const dietLabels: Record<string, string> = {
    non_vegetarian: 'Non-Vegetarian',
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    pescatarian: 'Pescatarian',
  }

  return (
    <>
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-orange-500 mb-2">My Profile</h1>
            <p className="text-gray-400">Manage your personal information and preferences</p>
          </div>

          {/* Profile Picture & Basic Info Section */}
          <div className="relative group mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-2xl blur-xl transition-all duration-300" />
            <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
              <div className="flex items-start gap-8">
                {/* Profile Picture */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-white/5 backdrop-blur-sm border-4 border-orange-500/50 shadow-lg shadow-orange-500/20">
                    {profile?.profilePicture?.url ? (
                      <Image
                        src={profile.profilePicture.url}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-orange-500">
                        {profile?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 p-2 rounded-full transition-all shadow-lg shadow-orange-500/30">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Basic Info */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-1">
                        {profile?.name}
                      </h2>
                      <p className="text-gray-400 capitalize">{profile?.plan} Member</p>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => handleEdit('basic')}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500/20 to-orange-600/20 hover:from-orange-500/30 hover:to-orange-600/30 backdrop-blur-sm border border-orange-400/30 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-gray-300 bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Mail className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Email</p>
                        <p className="text-sm">{profile?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300 bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Phone className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-400">Phone</p>
                        {isEditing && activeSection === 'basic' ? (
                          <input
                            type="text"
                            value={editData?.phoneNumber || ''}
                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm w-full focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                          />
                        ) : (
                          <p className="text-sm">{profile?.phoneNumber}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300 bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Calendar className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-400">Date of Birth</p>
                        {isEditing && activeSection === 'basic' ? (
                          <input
                            type="date"
                            value={editData?.dob || ''}
                            onChange={(e) => handleInputChange('dob', e.target.value)}
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                          />
                        ) : (
                          <p className="text-sm">
                            {new Date(profile?.dob || '').toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300 bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <User className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-400">Gender</p>
                        {isEditing && activeSection === 'basic' ? (
                          <select
                            value={editData?.gender || ''}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        ) : (
                          <p className="text-sm capitalize">{profile?.gender}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {isEditing && activeSection === 'basic' && (
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 backdrop-blur-sm border border-green-400/30 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-green-500/20"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg transition-all flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Body Metrics Section */}
          <div className="relative group mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-2xl blur-xl transition-all duration-300" />
            <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Scale className="w-6 h-6 text-orange-500" />
                  </div>
                  Body Metrics
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => handleEdit('metrics')}
                    className="p-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-orange-500/30 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="w-5 h-5 text-orange-500" />
                    <p className="text-gray-400 text-sm">Current Weight</p>
                  </div>
                  {isEditing && activeSection === 'metrics' ? (
                    <input
                      type="number"
                      value={editData?.currentWeight || ''}
                      onChange={(e) => handleInputChange('currentWeight', parseFloat(e.target.value))}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-2xl font-bold w-full focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                      placeholder="70"
                    />
                  ) : (
                    <p className="text-3xl font-bold bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
                      {profile?.currentWeight || 0} kg
                    </p>
                  )}
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-orange-500/30 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Ruler className="w-5 h-5 text-orange-500" />
                    <p className="text-gray-400 text-sm">Height</p>
                  </div>
                  {isEditing && activeSection === 'metrics' ? (
                    <input
                      type="number"
                      value={editData?.height || ''}
                      onChange={(e) => handleInputChange('height', parseFloat(e.target.value))}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-2xl font-bold w-full focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                      placeholder="175"
                    />
                  ) : (
                    <p className="text-3xl font-bold bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
                      {profile?.height || 0} cm
                    </p>
                  )}
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-orange-500/30 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    <p className="text-gray-400 text-sm">Target Weight</p>
                  </div>
                  {isEditing && activeSection === 'metrics' ? (
                    <input
                      type="number"
                      value={editData?.targetWeight || ''}
                      onChange={(e) => handleInputChange('targetWeight', parseFloat(e.target.value))}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-2xl font-bold w-full focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                      placeholder="65"
                    />
                  ) : (
                    <p className="text-3xl font-bold bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
                      {profile?.targetWeight || 0} kg
                    </p>
                  )}
                </div>
              </div>

              {isEditing && activeSection === 'metrics' && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 backdrop-blur-sm border border-green-400/30 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-green-500/20"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg transition-all flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Fitness Goals Section */}
          <div className="relative group mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-2xl blur-xl transition-all duration-300" />
            <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Dumbbell className="w-6 h-6 text-orange-500" />
                  </div>
                  Fitness Goals & Workout Plan
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => handleEdit('fitness')}
                    className="p-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <p className="text-gray-400 text-sm mb-2">Primary Goal</p>
                  {isEditing && activeSection === 'fitness' ? (
                    <select
                      value={editData?.goal || ''}
                      onChange={(e) => handleInputChange('goal', e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 w-full focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                    >
                      <option value="weight_loss">Lose Weight & Burn Fat</option>
                      <option value="muscle_building">Build Muscle & Strength</option>
                      <option value="toning">Tone & Define</option>
                      <option value="maintenance">General Fitness</option>
                    </select>
                  ) : (
                    <p className="text-lg font-semibold">
                      {goalLabels[profile?.goal || ''] || 'Not set'}
                    </p>
                  )}
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <p className="text-gray-400 text-sm mb-2">Activity Level</p>
                  {isEditing && activeSection === 'fitness' ? (
                    <select
                      value={editData?.activityLevel || 3}
                      onChange={(e) => handleInputChange('activityLevel', parseInt(e.target.value))}
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 w-full focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                    >
                      {activityLevels.map((level, idx) => (
                        <option key={idx} value={idx + 1}>
                          {level}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-lg font-semibold">
                      {activityLevels[(profile?.activityLevel || 3) - 1]}
                    </p>
                  )}
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <p className="text-gray-400 text-sm mb-2">Workout Duration (per session)</p>
                  {isEditing && activeSection === 'fitness' ? (
                    <input
                      type="number"
                      step="0.5"
                      value={editData?.hoursPerDay || ''}
                      onChange={(e) => handleInputChange('hoursPerDay', parseFloat(e.target.value))}
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 w-full focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                      placeholder="1.5"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{profile?.hoursPerDay || 0} hours</p>
                  )}
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <p className="text-gray-400 text-sm mb-2">Workout Frequency</p>
                  {isEditing && activeSection === 'fitness' ? (
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={editData?.daysPerWeek || ''}
                      onChange={(e) => handleInputChange('daysPerWeek', parseInt(e.target.value))}
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 w-full focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                      placeholder="5"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{profile?.daysPerWeek || 0} days per week</p>
                  )}
                </div>
              </div>

              {isEditing && activeSection === 'fitness' && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 backdrop-blur-sm border border-green-400/30 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-green-500/20"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg transition-all flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Dietary Preferences Section */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-2xl blur-xl transition-all duration-300" />
            <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Utensils className="w-6 h-6 text-orange-500" />
                  </div>
                  Dietary Preferences
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => handleEdit('diet')}
                    className="p-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <p className="text-gray-400 text-sm mb-2">Diet Type</p>
                  {isEditing && activeSection === 'diet' ? (
                    <select
                      value={editData?.dietType || ''}
                      onChange={(e) => handleInputChange('dietType', e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 w-full max-w-md focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                    >
                      <option value="non_vegetarian">Non-Vegetarian</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="pescatarian">Pescatarian</option>
                    </select>
                  ) : (
                    <p className="text-lg font-semibold">
                      {dietLabels[profile?.dietType || ''] || 'Not set'}
                    </p>
                  )}
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    Allergies or Restrictions
                  </p>
                  {isEditing && activeSection === 'diet' ? (
                    <input
                      type="text"
                      value={editData?.allergies || ''}
                      onChange={(e) => handleInputChange('allergies', e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 w-full focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-gray-500"
                      placeholder="e.g., Peanuts, Dairy, Gluten"
                    />
                  ) : (
                    <p className="text-lg">{profile?.allergies || 'None specified'}</p>
                  )}
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <p className="text-gray-400 text-sm mb-2">Food Preferences</p>
                  {isEditing && activeSection === 'diet' ? (
                    <textarea
                      value={editData?.preferences || ''}
                      onChange={(e) => handleInputChange('preferences', e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 w-full resize-none focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-gray-500"
                      rows={3}
                      placeholder="Tell us about your food preferences..."
                    />
                  ) : (
                    <p className="text-lg">{profile?.preferences || 'No preferences specified'}</p>
                  )}
                </div>
              </div>

              {isEditing && activeSection === 'diet' && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 backdrop-blur-sm border border-green-400/30 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-green-500/20"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg transition-all flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {toastNode}
    </>
  )
}