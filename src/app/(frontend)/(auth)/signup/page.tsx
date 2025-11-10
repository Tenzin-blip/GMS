'use client'
import React, { useState } from 'react'
import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Toast from '@/components/website/toast'

const Plans = ({ onSelectPlan, selectedPlan }) => {
  const plans = [
    {
      id: 'essential',
      name: 'Essential',
      icon: '⚡',
      description: 'Perfect for beginners starting their fitness journey',
      price: 'NRP 3,000',
      features: [
        'Access to basic gym equipment',
        'Basic fitness assessment',
        'System access',
        'Locker room access',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      icon: '👑',
      description: 'Most popular choice for serious fitness enthusiasts',
      price: 'NRP 4,500',
      popular: true,
      features: [
        'Everything in Essential',
        'Nutrition consultation',
        'Guest passes (2/month)',
        'Recovery zone access',
        'Progress tracking',
      ],
    },
    {
      id: 'elite',
      name: 'Elite',
      icon: '💎',
      description: 'Ultimate experience for dedicated athletes',
      price: 'NRP 6,000',
      features: [
        'Everything in Premium',
        'VIP amenities',
        'Unlimited guest passes',
        'Recovery treatments',
        'Private training area',
      ],
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {plans.map((plan) => (
        <div
          key={plan.id}
          onClick={() => onSelectPlan(plan.id)}
          className={`relative bg-white rounded-2xl p-8 cursor-pointer transition-all duration-300  ${
            selectedPlan === plan.id
              ? 'border-2 border-orange-500 shadow-lg scale-105'
              : 'border-2 border-gray-200 hover:border-orange-300 hover:shadow-md'
          } ${plan.popular ? 'border-orange-400' : ''}`}
        >
          {plan.popular && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-red-500 text-white px-6 py-1.5 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
          )}

          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl">
              {plan.icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <p className="text-gray-600 text-sm">{plan.description}</p>
          </div>

          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-gray-900">
              {plan.price}
              <span className="text-lg font-normal text-gray-500">/month</span>
            </div>
          </div>

          <ul className="space-y-3 mb-8">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3 text-gray-700">
                <span className="text-orange-500 mt-1">✓</span>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className={`w-full py-3 rounded-xl font-semibold transition-all ${
              selectedPlan === plan.id
                ? 'bg-orange-500 text-white'
                : plan.popular
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'border-2 border-orange-500 text-orange-500 hover:bg-orange-50'
            }`}
          >
            {selectedPlan === plan.id ? 'Selected' : 'Choose Plan'}
          </button>
        </div>
      ))}
    </div>
  )
}

export default function SignupForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)
  const [userId, setUserId] = useState(null)
  const [formData, setFormData] = useState({
    plan: '',
    name: '',
    email: '',
    dob: '',
    phoneNumber: '',
    gender: '',
    otp: '',
    password: '',
  })

  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
  } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
  }

  const [errors, setErrors] = useState({})

  const tabs = ['Select Plan', 'Basic Information', 'Verify Email', 'Check Out', 'Sign Up']

  const validateTab = (tabIndex) => {
    const newErrors = {}

    switch (tabIndex) {
      case 0:
        if (!formData.plan) newErrors.plan = 'Please select a plan'
        break
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Name is required'
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email'
        if (!formData.dob) newErrors.dob = 'Date of birth is required'
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required'
        else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, '')))
          newErrors.phoneNumber = 'Invalid phone number'
        if (!formData.gender) newErrors.gender = 'Gender is required'
        break
      case 2:
        if (!formData.otp.trim()) newErrors.otp = 'Verification code is required'
        else if (formData.otp.length !== 6) newErrors.otp = 'Code must be 6 digits'
        break
      case 4:
        if (!formData.password) newErrors.password = 'Password is required'
        else if (formData.password.length < 8)
          newErrors.password = 'Password must be at least 8 characters'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit basic info and get OTP
  const submitBasicInfo = async () => {
    if (!validateTab(1)) return

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          dob: formData.dob,
          gender: formData.gender,
          plan: formData.plan,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setUserId(data.userId)
        setActiveTab(2)
        showToast('OTP sent to your email!', 'success')
      } else {
        const errorMsg = data.errors?.[0]?.message || data.message || 'An error occurred'
        showToast(errorMsg, 'error')
      }
    } catch (error) {
      console.error(error)
      showToast('Error submitting form', 'error')
    }
  }

  // Verify OTP
  const submitOTP = async () => {
    if (!validateTab(2)) return

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      })

      const data = await res.json()

      if (res.ok) {
        setActiveTab(3)
        showToast('Email verified successfully!', 'success')
      } else {
        // Extract error message from nested structure
        const errorMsg = data.errors?.[0]?.message || data.message || 'An error occurred'
        showToast(errorMsg, 'error')
      }
    } catch (error) {
      showToast('Error verifying OTP', 'error')
      console.error(error)
    }
  }

  // Set password and complete signup
  const submitPassword = async () => {
    if (!validateTab(4)) return
    if (!userId) {
      showToast('User ID missing', 'error')
      return
    }
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password: formData.password }),
      })

      const data = await res.json()

      if (res.ok) {
        showToast('Signup complete ✅', 'success')
        setTimeout(() => {
          setActiveTab(0)
          setFormData({
            plan: '',
            name: '',
            email: '',
            dob: '',
            phoneNumber: '',
            gender: '',
            otp: '',
            password: '',
          })
          setUserId(null)
          router.push('/login')
        }, 2000)
      } else {
        // Extract error message from nested structure
        const errorMsg = data.errors?.[0]?.message || data.message || 'An error occurred'
        showToast(errorMsg, 'error')
      }
    } catch (error) {
      showToast('Error setting password', 'error')
      console.error(error)
    }
  }

  const handleNext = () => {
    if (activeTab === 0) {
      if (validateTab(0)) {
        setActiveTab(1)
      }
    } else if (activeTab === 1) {
      submitBasicInfo()
    } else if (activeTab === 2) {
      submitOTP()
    } else if (activeTab === 3) {
      setActiveTab(4)
    } else if (activeTab === 4) {
      submitPassword()
    }
  }

  const handleBack = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <div className="py-5">
            <Plans
              onSelectPlan={(plan) => handleInputChange('plan', plan.toLowerCase())}
              selectedPlan={formData.plan}
            />
            {errors.plan && <p className="text-red-500 text-center mt-4">{errors.plan}</p>}
          </div>
        )

      case 1:
        return (
          <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
            <div className="space-y-5 text-black">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500  ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.dob ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="9801234567"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Male', 'Female', 'Other'].map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => handleInputChange('gender', gender.toLowerCase())}
                      className={`px-4 py-3 rounded-xl font-medium transition-all ${
                        formData.gender === gender.toLowerCase()
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="max-w-md mx-auto py-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">📧</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Verify Your Email</h2>
            <p className="text-gray-600 mb-8">
              We've sent a 6-digit verification code to
              <br />
              <span className="font-semibold text-gray-900">{formData.email}</span>
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Enter Code</label>
              <input
                type="text"
                maxLength={6}
                value={formData.otp}
                onChange={(e) => handleInputChange('otp', e.target.value.replace(/\D/g, ''))}
                className={`w-full px-4 py-4 text-center text-gray-900 placeholder:text-gray-400 text-2xl font-bold tracking-widest border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.otp ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="000000"
              />
              {errors.otp && <p className="text-red-500 text-sm mt-2">{errors.otp}</p>}
            </div>

            <button type="button" className="text-orange-500 font-medium hover:text-orange-600">
              Resend Code
            </button>
          </div>
        )

      case 3:
        return (
          <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 capitalize">
                    {formData.plan} Plan
                  </h3>
                  <p className="text-gray-600">Monthly Membership</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    NRP{' '}
                    {formData.plan === 'essential'
                      ? '3,000'
                      : formData.plan === 'premium'
                        ? '4,500'
                        : '6,000'}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>
                    NRP{' '}
                    {formData.plan === 'essential'
                      ? '3,000'
                      : formData.plan === 'premium'
                        ? '4,500'
                        : '6,000'}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Registration Fee</span>
                  <span>NRP 500</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>
                    NRP{' '}
                    {formData.plan === 'essential'
                      ? '3,500'
                      : formData.plan === 'premium'
                        ? '5,000'
                        : '6,500'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Member Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900">{formData.phoneNumber}</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="max-w-md mx-auto py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Your Account</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder:text-gray-400 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Create a strong password"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mt-6">
                <p className="text-sm text-gray-700">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-start justify-between max-w-4xl mx-auto">
            {tabs.map((tab, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      index < activeTab
                        ? 'bg-green-500 text-white'
                        : index === activeTab
                          ? 'bg-orange-500 text-white ring-4 ring-orange-200'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < activeTab ? <Check size={20} /> : index + 1}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium text-center whitespace-nowrap ${
                      index === activeTab ? 'text-orange-500' : 'text-gray-500'
                    }`}
                  >
                    {tab}
                  </span>
                </div>
                {index < tabs.length - 1 && (
                  <div className="flex items-center flex-1 px-2" style={{ marginTop: '20px' }}>
                    <div
                      className={`h-1 w-full rounded transition-all ${
                        index < activeTab ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          {renderTabContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-3 max-w-2xl mx-auto">
            <button
              onClick={handleBack}
              disabled={activeTab === 0}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all"
            >
              {activeTab === tabs.length - 1 ? 'Complete Signup' : 'Continue'}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}
    </div>
  )
}
