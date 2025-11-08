'use client'

import React, { useEffect, useState } from 'react'

export default function DashboardHeader() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/user-fitness')
        const data = await response.json()
        
        if (data.success && data.user) {
          setUserData(data.user)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Get profile picture URL from the user data
  const getProfilePictureUrl = () => {
    if (!userData?.profilePicture) return null
    
    // Handle if profilePicture is an object with sizes
    if (typeof userData.profilePicture === 'object') {
      return userData.profilePicture.sizes?.profile?.url || 
             userData.profilePicture.sizes?.thumbnail?.url || 
             userData.profilePicture.url
    }
    
    // Handle if it's a direct URL string
    return userData.profilePicture
  }

  const profilePictureUrl = getProfilePictureUrl()
  const userName = userData?.name || 'Tenzin'
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <div className="mb-8 flex flex-row gap-6 items-center">
      <div className="w-16 h-16 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : profilePictureUrl ? (
          <img
            src={profilePictureUrl}
            alt={`${userName}'s profile`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
            {userInitial}
          </div>
        )}
      </div>
      
      <div>
        <h1 className="text-3xl font-bold mb-2 Poppins-bold">
          Hello, <span className="text-orange-500">{userName}</span>!
        </h1>
        <p className="text-gray-400 Poppins-regular">Here is your fitness overview for today</p>
      </div>
    </div>
  )
}