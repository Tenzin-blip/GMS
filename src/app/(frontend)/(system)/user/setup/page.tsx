'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronRight, ChevronLeft, AlertCircle, Check, Upload, Camera } from 'lucide-react'

export default function OnboardingForm() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    goal: '',
    currentWeight: '',
    height: '',
    age: '',
    gender: '',
    targetWeight: '',
    activityLevel: 3,
    hoursPerDay: '',
    daysPerWeek: '',
    dietType: '',
    allergies: '',
    preferences: '',
    profilePicture: null as File | null,
    profilePicturePreview: '',
    name: '',
  })

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
      } 
    }

    fetchUserData()
  }, [])

  const userName = userData?.name || 'Friend'
  const userInitial = userName.charAt(0).toUpperCase()

  const totalSteps = 5 // Updated to 5 steps

  const goals = [
    {
      id: 'weight_loss',
      label: 'Lose Weight & Burn Fat',
      icon: '🔥',
      desc: 'Shed fat, feel lighter',
    },
    {
      id: 'muscle_building',
      label: 'Build Muscle & Strength',
      icon: '🏋️',
      desc: 'Get stronger, bigger',
    },
    { id: 'toning', label: 'Tone & Define', icon: '💪', desc: 'Sculpt your physique' },
    { id: 'maintenance', label: 'General Fitness', icon: '🎯', desc: 'Stay healthy, active' },
  ]

  const activityLevels = [
    { value: 1, label: 'Sedentary', desc: 'Desk job, minimal activity' },
    { value: 2, label: 'Lightly Active', desc: 'Light exercise 1-2x/week' },
    { value: 3, label: 'Moderate', desc: 'Exercise 3-4x/week' },
    { value: 4, label: 'Very Active', desc: 'Exercise 5-6x/week' },
    { value: 5, label: 'Extreme', desc: 'Athlete/physical job' },
  ]

  const dietTypes = [
    { id: 'non_vegetarian', label: 'Non-Vegetarian', icon: '🥩' },
    { id: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
    { id: 'vegan', label: 'Vegan', icon: '🌱' },
    { id: 'pescatarian', label: 'Pescatarian', icon: '🐟' },
  ]

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file')
        return
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }

      setFormData((prev) => ({
        ...prev,
        profilePicture: file,
        profilePicturePreview: URL.createObjectURL(file),
      }))
    }
  }

  const handleSubmit = async () => {
    try {
      // Calculate BMR and TDEE for target calories
      const bmr = calculateBMR(
        parseFloat(formData.currentWeight),
        parseFloat(formData.height),
        parseInt(formData.age),
        formData.gender,
      )
      const tdee = calculateTDEE(bmr, formData.activityLevel)
      const targetCalories = adjustCaloriesForGoal(tdee, formData.goal)

      // Create FormData for multipart/form-data upload
      const submitData = new FormData()

      // Add fitness data as JSON string
      const fitnessData = {
        goal: formData.goal,
        bodyMetrics: {
          height: parseFloat(formData.height),
          currentWeight: parseFloat(formData.currentWeight),
          targetWeight: parseFloat(formData.targetWeight),
        },
        dailyCalories: {
          target: Math.round(targetCalories),
          consumed: 0,
          burned: 0,
        },
        mealPlan: {
          dietType: formData.dietType,
          allergies: formData.allergies
            ? formData.allergies.split(',').map((a) => ({ allergen: a.trim() }))
            : [],
          preferences: formData.preferences,
        },
        workoutPlan: {
          frequency: parseInt(formData.daysPerWeek),
          duration: parseFloat(formData.hoursPerDay) * 60,
          preferredDays: [],
          preferredTypes: [],
        },
      }

      submitData.append('fitnessData', JSON.stringify(fitnessData))

      // Add profile picture if exists
      if (formData.profilePicture) {
        submitData.append('profilePicture', formData.profilePicture)
      }

      const response = await fetch('/api/user-fitness', {
        method: 'POST',
        body: submitData,
      })

      if (response.ok) {
        alert('Welcome to Level Up! Your personalized dashboard is ready 🎉')
        window.location.href = '/dashboard'
      } else {
        const error = await response.json()
        console.error('Error saving fitness data:', error)
        alert('There was an error saving your data. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('There was an error saving your data. Please try again.')
    }
  }

  const calculateBMR = (weight: number, height: number, age: number, gender: string) => {
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161
    }
  }

  const calculateTDEE = (bmr: number, activityLevel: number) => {
    const multipliers = [1.2, 1.375, 1.55, 1.725, 1.9]
    return bmr * multipliers[activityLevel - 1]
  }

  const adjustCaloriesForGoal = (tdee: number, goal: string) => {
    switch (goal) {
      case 'weight_loss':
        return tdee - 500
      case 'weight_gain':
      case 'muscle_building':
        return tdee + 300
      case 'toning':
        return tdee - 200
      case 'maintenance':
      default:
        return tdee
    }
  }

  const handleSkip = () => {
    alert('No worries! You can complete this anytime from Settings.')
  }

  const updateFormData = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.goal !== ''
      case 2:
        return formData.currentWeight && formData.height
      case 3:
        return formData.hoursPerDay && formData.daysPerWeek
      case 4:
        return formData.dietType !== ''
      case 5:
        return true 
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome to Level Up, <span className="text-orange-500">{userInitial}</span> ! 
          </h1>
          <p className="text-gray-400">Let's personalize your fitness journey</p>
          <p className="text-sm text-gray-500 mt-1">(Takes just 60 seconds)</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm text-gray-400">
              {step} of {totalSteps}
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-300 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i <= step ? 'bg-orange-500' : 'bg-gray-600'}`}
              />
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
          {/* Step 1: Primary Goal */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">What's your primary goal?</h2>
                <p className="text-gray-400 text-sm">This helps us customize everything for you</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => updateFormData('goal', goal.id)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      formData.goal === goal.id
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                    }`}
                  >
                    <div className="text-4xl mb-3">{goal.icon}</div>
                    <h3 className="font-bold mb-1">{goal.label}</h3>
                    <p className="text-sm text-gray-400">{goal.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Basic Metrics */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Tell us about yourself</h2>
                <p className="text-gray-400 text-sm">
                  We'll use this to calculate your BMI and calorie needs
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Weight</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.currentWeight}
                      onChange={(e) => updateFormData('currentWeight', e.target.value)}
                      placeholder="70"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 text-white"
                    />
                    <span className="absolute right-4 top-3 text-gray-400">kg</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Height</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => updateFormData('height', e.target.value)}
                      placeholder="175"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 text-white"
                    />
                    <span className="absolute right-4 top-3 text-gray-400">cm</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Target Weight</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.targetWeight}
                      onChange={(e) => updateFormData('targetWeight', e.target.value)}
                      placeholder="65"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 text-white"
                    />
                    <span className="absolute right-4 top-3 text-gray-400">kg</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => updateFormData('age', e.target.value)}
                    placeholder="25"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Male', 'Female', 'Other'].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => updateFormData('gender', gender.toLowerCase())}
                      className={`py-3 rounded-lg border-2 transition-all ${
                        formData.gender === gender.toLowerCase()
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Activity & Commitment */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Your workout commitment</h2>
                <p className="text-gray-400 text-sm">How much time can you dedicate?</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Current Activity Level</label>
                <div className="relative pt-6 pb-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.activityLevel}
                    onChange={(e) => updateFormData('activityLevel', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #f97316 0%, #f97316 ${((formData.activityLevel - 1) / 4) * 100}%, #374151 ${((formData.activityLevel - 1) / 4) * 100}%, #374151 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Sedentary</span>
                    <span>Very Active</span>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-gray-700/50 rounded-lg">
                  <p className="text-sm font-medium">
                    {activityLevels[formData.activityLevel - 1].label}
                  </p>
                  <p className="text-xs text-gray-400">
                    {activityLevels[formData.activityLevel - 1].desc}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Hours per day</label>
                  <select
                    value={formData.hoursPerDay}
                    onChange={(e) => updateFormData('hoursPerDay', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 text-white"
                  >
                    <option value="">Select</option>
                    <option value="0.5">30 mins</option>
                    <option value="1">1 hour</option>
                    <option value="1.5">1.5 hours</option>
                    <option value="2">2 hours</option>
                    <option value="2.5">2+ hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Days per week</label>
                  <select
                    value={formData.daysPerWeek}
                    onChange={(e) => updateFormData('daysPerWeek', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 text-white"
                  >
                    <option value="">Select</option>
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <option key={day} value={day}>
                        {day} {day === 1 ? 'day' : 'days'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-300">
                  <strong>Pro tip:</strong> Consistency beats intensity. Start with what you can
                  sustain!
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Dietary Preferences */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Dietary preferences</h2>
                <p className="text-gray-400 text-sm">
                  Help us create the perfect meal plan for you
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Diet Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {dietTypes.map((diet) => (
                    <button
                      key={diet.id}
                      onClick={() => updateFormData('dietType', diet.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.dietType === diet.id
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{diet.icon}</div>
                      <p className="text-sm font-medium">{diet.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Allergies or Restrictions <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => updateFormData('allergies', e.target.value)}
                  placeholder="e.g., Peanuts, Dairy, Gluten"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Food Preferences <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  value={formData.preferences}
                  onChange={(e) => updateFormData('preferences', e.target.value)}
                  placeholder="Tell us what you love or avoid..."
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 resize-none text-white"
                />
              </div>
            </div>
          )}

          {/* Step 5: Profile Picture */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Show us your best smile! 📸</h2>
                <p className="text-gray-400 text-sm">
                  Add a profile picture to personalize your experience
                </p>
              </div>

              <div className="flex flex-col items-center justify-center">
                {/* Preview Area */}
                <div className="relative mb-6">
                  {formData.profilePicturePreview ? (
                    <div className="relative">
                      <Image
                        src={formData.profilePicturePreview}
                        alt="Profile preview"
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                        unoptimized // Required for blob URLs
                      />
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            profilePicture: null,
                            profilePicturePreview: '',
                          }))
                        }
                        className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="w-40 h-40 rounded-full bg-gray-700 border-4 border-dashed border-gray-600 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <label className="cursor-pointer">
                  <div className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors flex items-center gap-2 text-white font-medium">
                    <Upload className="w-5 h-5" />
                    {formData.profilePicturePreview ? 'Change Picture' : 'Upload Picture'}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </label>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  Recommended: Square image, max 5MB
                  <br />
                  Formats: JPG, PNG, GIF
                </p>
              </div>

              <div className="flex items-start gap-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-purple-300">
                  Don't worry! You can always add or change your profile picture later from
                  settings.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-300 transition-colors text-sm"
            >
              Skip for now
            </button>

            <div className="flex gap-3">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}

              {step < totalSteps ? (
                <button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className={`px-6 py-3 rounded-lg transition-all flex items-center gap-2 ${
                    isStepValid()
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!isStepValid()}
                  className={`px-8 py-3 rounded-lg transition-all flex items-center gap-2 ${
                    isStepValid()
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  Complete Setup
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't worry, you can change these settings anytime
        </p>
      </div>
    </div>
  )
}
