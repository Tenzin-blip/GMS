'use client'
import React, { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Toast from '@/components/website/toast'
import { SectionFade } from '@/components/animations/SectionFade'

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
          className={`relative backdrop-blur-xl bg-white/5 rounded-2xl p-8 cursor-pointer transition-all duration-300  ${
            selectedPlan === plan.id
              ? 'border-2 border-orange-500 shadow-lg shadow-orange-500/20 scale-105'
              : 'border-2 border-white/10 hover:border-orange-500/50 hover:shadow-md'
          } ${plan.popular ? 'border-orange-500/30' : ''}`}
        >
          {plan.popular && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-orange-500 text-white px-6 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                Most Popular
              </span>
            </div>
          )}

          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-3xl">
              {plan.icon}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
            <p className="text-white/60 text-sm">{plan.description}</p>
          </div>

          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-white">
              {plan.price}
              <span className="text-lg font-normal text-white/60">/month</span>
            </div>
          </div>

          <ul className="space-y-3 mb-8">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3 text-white/80">
                <span className="text-orange-500 mt-1">✓</span>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className={`w-full py-3 rounded-xl font-semibold transition-all ${
              selectedPlan === plan.id
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : plan.popular
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'border-2 border-orange-500 text-orange-500 hover:bg-orange-500/10'
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
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(0)
  const [userId, setUserId] = useState(null)
  const [userStatus, setUserStatus] = useState(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isResendingOTP, setIsResendingOTP] = useState(false)
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

  const hydrateUserProgress = async (emailParam: string) => {
    try {
      const res = await fetch(`/api/auth/user-progress?email=${encodeURIComponent(emailParam)}`)
      if (!res.ok) {
        return
      }

      const data = await res.json()

      setUserId(data.id)
      setUserStatus({
        password_set: data.password_set,
        otpflag: data.otpflag,
        payment: data.payment,
      })

      setFormData((prev) => ({
        ...prev,
        name: data.name || prev.name,
        email: data.email || prev.email,
        phoneNumber: data.phoneNumber || prev.phoneNumber,
        dob: data.dob ? data.dob.split('T')[0] : prev.dob,
        gender: data.gender || prev.gender,
        plan: data.plan || prev.plan,
      }))
    } catch (error) {
      console.error(error)
      showToast('Could not load your info.', 'error')
    }
  }

  const [errors, setErrors] = useState({})

  // Updated tab order: Select Plan → Basic Info → Verify Email → Set Password → Checkout
  const tabs = ['Select Plan', 'Basic Information', 'Verify Email', 'Check Out']

  const validateTab = (tabIndex) => {
    const newErrors = {}

    switch (tabIndex) {
      case 0:
        if (!formData.plan) newErrors.plan = 'Please select a plan'
        break
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Name is required'
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format'
        if (!formData.dob) newErrors.dob = 'Date of birth is required'
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required'
        else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, '')))
          newErrors.phoneNumber = 'Please enter a valid 10-digit phone number'
        if (!formData.gender) newErrors.gender = 'Please select your gender'
        if (!userStatus?.password_set) {
          if (!formData.password) newErrors.password = 'Password is required'
          else if (formData.password.length < 8)
            newErrors.password = 'Password must be at least 8 characters'
        }
        break
      case 2:
        if (!formData.otp.trim()) newErrors.otp = 'Verification code is required'
        else if (formData.otp.length !== 6) newErrors.otp = 'Code must be 6 digits'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    const stepParam = searchParams.get('step')
    if (stepParam) {
      const parsedStep = Number(stepParam)
      if (!Number.isNaN(parsedStep)) {
        const safeIndex = Math.min(tabs.length - 1, Math.max(0, parsedStep - 1))
        setActiveTab(safeIndex)
      }
    }

    const emailParam = searchParams.get('email')
    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam }))
      hydrateUserProgress(emailParam)
    }
  }, [searchParams, tabs.length])

  // Submit basic info and get OTP
  const submitBasicInfo = async () => {
    if (!validateTab(1)) return

    if (userId) {
      setActiveTab(2)
      showToast('Continue verification.', 'info')
      return
    }

    setIsActionLoading(true)

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
        setUserStatus((prev) => ({ ...(prev || {}), password_set: false }))
        const passwordSaved = await finalizePassword(data.userId)
        if (!passwordSaved) {
          return
        }
        setActiveTab(2)
        showToast('Code sent to your email.', 'success')
      } else {
        // Handle specific error codes
        if (data.code === 'EMAIL_EXISTS') {
          showToast('This email already exists. Please login.', 'error')
          setTimeout(() => router.push('/login'), 1500)
        } else if (data.code === 'PAYMENT_PENDING') {
          showToast('Login to finish your payment.', 'info')
          setTimeout(() => router.push('/login'), 1500)
        } else {
          const errorMsg = data.errors?.[0]?.message || data.message || 'Could not save info.'
          showToast(errorMsg, 'error')
        }
      }
    } catch (error) {
      console.error(error)
      showToast('Network error. Please try again.', 'error')
    } finally {
      setIsActionLoading(false)
    }
  }

  const finalizePassword = async (targetUserId?: string | null) => {
    if (userStatus?.password_set) {
      return true
    }

    const resolvedUserId = targetUserId || userId

    if (!resolvedUserId) {
      showToast('Session expired. Please start again.', 'error')
      return false
    }

    if (!formData.password) {
      showToast('Please enter your password.', 'error')
      return false
    }

    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: resolvedUserId, password: formData.password }),
      })

      const data = await res.json()

      if (res.ok) {
        setUserStatus((prev) => ({ ...(prev || {}), password_set: true }))
        return true
      }

      const errorMsg = data.errors?.[0]?.message || data.message || 'Could not set password.'
      showToast(errorMsg, 'error')
      return false
    } catch (error) {
      console.error(error)
      showToast('Error setting password. Please try again.', 'error')
      return false
    }
  }

  // Verify OTP
  const submitOTP = async () => {
    if (!validateTab(2)) return

    setIsActionLoading(true)

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      })

      const data = await res.json()

      if (res.ok) {
        const passwordReady = await finalizePassword()
        if (!passwordReady) {
          return
        }
        setActiveTab(3) // Move to Checkout
        showToast('Email verified.', 'success')
      } else {
        const errorMsg = data.errors?.[0]?.message || data.message || 'Invalid verification code'
        showToast(errorMsg, 'error')
      }
    } catch (error) {
      showToast('Error verifying code. Please try again.', 'error')
      console.error(error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!formData.email) {
      showToast('Enter your email first.', 'error')
      return
    }

    setIsResendingOTP(true)

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await res.json()

      if (res.ok) {
        showToast('New code sent.', 'success')
      } else {
        const errorMsg = data.errors?.[0]?.message || data.message || 'Could not resend code.'
        showToast(errorMsg, 'error')
      }
    } catch (error) {
      console.error(error)
      showToast('Could not resend code.', 'error')
    } finally {
      setIsResendingOTP(false)
    }
  }

  // Complete signup
  const completeSignup = async () => {
    if (!userId) {
      showToast('Session error. Please start over.', 'error')
      return
    }

    setIsActionLoading(true)

    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data = await res.json()

      if (res.ok && data.paymentUrl) {
        showToast('Redirecting to payment...', 'success')
        setTimeout(() => {
          window.location.href = data.paymentUrl
        }, 800)
      } else {
        const errorMsg = data.errors?.[0]?.message || data.message || 'Could not start payment.'
        showToast(errorMsg, 'error')
      }
    } catch (error) {
      console.error(error)
      showToast('Payment failed. Please try again.', 'error')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleNext = () => {
    if (activeTab === 0) {
      if (validateTab(0)) setActiveTab(1)
    } else if (activeTab === 1) {
      submitBasicInfo()
    } else if (activeTab === 2) {
      submitOTP()
    } else if (activeTab === 3) {
      completeSignup()
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
            {errors.plan && <p className="text-red-400 text-center mt-4">{errors.plan}</p>}
          </div>
        )

      case 1:
        return (
          <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 backdrop-blur-xl bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all ${
                    errors.name ? 'border-red-500/50' : 'border-white/10'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 backdrop-blur-xl bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all ${
                    errors.email ? 'border-red-500/50' : 'border-white/10'
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    className={`w-full px-4 py-3 backdrop-blur-xl bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all ${
                      errors.dob ? 'border-red-500/50' : 'border-white/10'
                    }`}
                  />
                  {errors.dob && <p className="text-red-400 text-sm mt-1">{errors.dob}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={`w-full px-4 py-3 backdrop-blur-xl bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all ${
                      errors.phoneNumber ? 'border-red-500/50' : 'border-white/10'
                    }`}
                    placeholder="9801234567"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-400 text-sm mt-1">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Gender</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Male', 'Female', 'Other'].map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => handleInputChange('gender', gender.toLowerCase())}
                      className={`px-4 py-3 rounded-xl font-medium transition-all ${
                        formData.gender === gender.toLowerCase()
                          ? 'bg-orange-500 text-white'
                          : 'backdrop-blur-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
                {errors.gender && <p className="text-red-400 text-sm mt-1">{errors.gender}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Account Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={userStatus?.password_set}
                  className={`w-full px-4 py-3 backdrop-blur-xl bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all ${
                    errors.password ? 'border-red-500/50' : 'border-white/10'
                  } ${userStatus?.password_set ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder={
                    userStatus?.password_set ? 'Password already set' : 'Create a strong password'
                  }
                />
                {!userStatus?.password_set && errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
                {userStatus?.password_set && (
                  <p className="text-white/60 text-sm mt-1">Your password is already set.</p>
                )}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="max-w-md mx-auto py-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
              <span className="text-4xl">📧</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Verify Your Email</h2>
            <p className="text-white/60 mb-8">
              We've sent a 6-digit verification code to
              <br />
              <span className="font-semibold text-white">{formData.email}</span>
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-3">Enter Code</label>
              <input
                type="text"
                maxLength={6}
                value={formData.otp}
                onChange={(e) => handleInputChange('otp', e.target.value.replace(/\D/g, ''))}
                className={`w-full px-4 py-4 text-center text-white placeholder-white/40 text-2xl font-bold tracking-widest backdrop-blur-xl bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all ${
                  errors.otp ? 'border-red-500/50' : 'border-white/10'
                }`}
                placeholder="000000"
              />
              {errors.otp && <p className="text-red-400 text-sm mt-2">{errors.otp}</p>}
            </div>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isResendingOTP}
              className={`text-orange-500 font-medium hover:text-orange-400 transition-colors ${
                isResendingOTP ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isResendingOTP ? 'Sending...' : 'Resend Code'}
            </button>
          </div>
        )

      case 3:
        return (
          <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

            <div className="backdrop-blur-xl bg-white/5 border-2 border-white/10 rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white capitalize">
                    {formData.plan} Plan
                  </h3>
                  <p className="text-white/60">Monthly Membership</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    NRP{' '}
                    {formData.plan === 'essential'
                      ? '3,000'
                      : formData.plan === 'premium'
                        ? '4,500'
                        : '6,000'}
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-white/80">
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
                <div className="flex justify-between text-white/80">
                  <span>Registration Fee</span>
                  <span>NRP 500</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-xl font-bold text-white">
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

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <h3 className="font-semibold text-white mb-3">Member Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Name:</span>
                  <span className="font-medium text-white">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Email:</span>
                  <span className="font-medium text-white">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Phone:</span>
                  <span className="font-medium text-white">{formData.phoneNumber}</span>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <p className="text-sm text-white/80 text-center">
                ✓ Email verified  •  ✓ Password set  •  Ready to complete!
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-black py-6 px-4">
      <SectionFade className="max-w-7xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-start justify-between max-w-4xl mx-auto">
            {tabs.map((tab, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all backdrop-blur-xl ${
                      index < activeTab
                        ? 'bg-orange-500 text-white'
                        : index === activeTab
                          ? 'bg-orange-500 text-white ring-4 ring-orange-500/20'
                          : 'bg-white/5 border border-white/10 text-white/40'
                    }`}
                  >
                    {index < activeTab ? <Check size={20} /> : index + 1}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium text-center whitespace-nowrap ${
                      index === activeTab ? 'text-orange-500' : 'text-white/60'
                    }`}
                  >
                    {tab}
                  </span>
                </div>
                {index < tabs.length - 1 && (
                  <div className="flex items-center flex-1 px-2" style={{ marginTop: '20px' }}>
                    <div
                      className={`h-1 w-full rounded transition-all ${
                        index < activeTab ? 'bg-orange-500' : 'bg-white/10'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-5">
          {renderTabContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-3 max-w-2xl mx-auto">
            <button
              onClick={handleBack}
              disabled={activeTab === 0}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 0
                  ? 'backdrop-blur-xl bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                  : 'backdrop-blur-xl bg-white/10 text-white hover:bg-white/20 border border-white/10'
              }`}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={isActionLoading}
              className={`px-8 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                isActionLoading
                  ? 'bg-orange-500/60 text-white cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {isActionLoading
                ? 'Please wait...'
                : activeTab === tabs.length - 1
                  ? 'Complete Signup'
                  : 'Continue'}
            </button>
          </div>
        </div>
      </SectionFade>

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