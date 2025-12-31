'use client'
import React, { useState, KeyboardEvent, ChangeEvent, useEffect } from 'react'
import { Eye, EyeOff, Mail, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import Toast from '@/components/website/toast'

interface FormData {
  email: string
  password: string
  rememberMe: boolean
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false)
  const [showTerms, setShowTerms] = useState<boolean>(false)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
  } | null>(null)
  const [blockedReason, setBlockedReason] = useState<'otp' | 'payment' | null>(null)
  const [blockedIsTrainer, setBlockedIsTrainer] = useState<boolean>(false)
  const [blockedEmail, setBlockedEmail] = useState<string>('')

  // Forgot password state
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState<string>('')
  const [forgotPasswordError, setForgotPasswordError] = useState<string>('')
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState<boolean>(false)
  const [isSendingReset, setIsSendingReset] = useState<boolean>(false)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
  }

  useEffect(() => {
    const paymentStatus = searchParams.get('payment')
    if (paymentStatus === 'success') {
      showToast('Payment completed. Please login.', 'success')
    } else if (paymentStatus === 'failed') {
      showToast('Payment could not be completed.', 'error')
    } else if (paymentStatus === 'cancelled') {
      showToast('Payment was cancelled.', 'info')
    }
  }, [searchParams])

  const toastNode = toast && (
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={() => setToast(null)}
      duration={3000}
    />
  )

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field as keyof FormErrors]) {
      setErrors({ ...errors, [field]: '' })
    }
    if (field === 'email' || field === 'password') {
      setBlockedReason(null)
      setBlockedEmail('')
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const ensurePaymentStatus = async (user: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/payment/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || user?._id,
          email: user?.email,
        }),
      })

      if (!res.ok) {
        return false
      }

      const data = await res.json()
      return Boolean(data.payment)
    } catch (error) {
      console.error('Payment status check failed:', error)
      return false
    }
  }
  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})
    setBlockedReason(null)

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const user = data.user
        const token = data.token

        // Fix: Check email_verified first, then otpflag as fallback
        const emailVerified = Boolean(user?.email_verified || user?.otpflag)
        const passwordReady = Boolean(user?.password_set ?? true) // Default to true if not set
        let paymentDone = Boolean(user?.payment)
        const userEmail = user?.email || formData.email
        const isTrainer = user?.role === 'trainer'

        // Check email verification status
        if (!emailVerified) {
          if (isTrainer) {
            // Send trainer verify email with CTA
            await fetch('/api/auth/send-trainer-verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: userEmail }),
            })
            showToast('Trainer email not verified. Check your inbox to verify.', 'error')
            setBlockedReason('otp')
            setBlockedIsTrainer(true)
            setBlockedEmail(userEmail)
            return
          }
          showToast('Email not verified.', 'error')
          setBlockedReason('otp')
          setBlockedEmail(userEmail)
          const verified = await ensurePaymentStatus(user)
          if (verified) {
            paymentDone = true
          }
          return
        }

        // Check password setup (only for non-trainers if needed)
        if (!passwordReady && !isTrainer) {
          showToast('Please complete your password setup.', 'error')
          return
        }

        // Check payment status for non-trainers
        if (!isTrainer && !paymentDone) {
          const verified = await ensurePaymentStatus(user)
          if (verified) {
            paymentDone = true
          }
        }

        if (!isTrainer && !paymentDone) {
          showToast('Payment not completed.', 'info')
          setBlockedReason('payment')
          setBlockedIsTrainer(false)
          setBlockedEmail(userEmail)
          return
        }

        if (token) {
          sessionStorage.setItem('token', token)
        }

        // Route based on user role
        if (user.role === 'admin') {
          router.push('/admin-panel/admin-dash')
          return
        }

        if (isTrainer) {
          router.push('/trainer/onboarding')
          return
        }

        if (!token) {
          showToast('Missing session token.', 'error')
          return
        }

        const profileCheck = await fetch('/api/user-fitness', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        const profileData = await profileCheck.json()

        if (profileData.exists) {
          router.push('/user/dashboard')
        } else {
          router.push('/user/setup')
        }
      } else {
        showToast(data.message || 'Invalid email or password.', 'error')
      }
    } catch (error) {
      console.error('Login error:', error)
      showToast('Could not sign in. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBlockedAction = async (): Promise<void> => {
    if (!blockedReason || !blockedEmail) return

    if (blockedReason === 'otp') {
      try {
        const endpoint = blockedIsTrainer ? '/api/auth/send-trainer-verify' : '/api/auth/resend-otp'
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: blockedEmail }),
        })

        const data = await response.json()

        if (response.ok) {
          showToast(blockedIsTrainer ? 'Verification email sent.' : 'OTP sent again.', 'success')
          if (!blockedIsTrainer) {
            router.push(`/signup?step=3&email=${encodeURIComponent(blockedEmail)}`)
          }
        } else {
          showToast(data.message || 'Could not resend OTP.', 'error')
        }
      } catch (error) {
        console.error('Resend OTP error:', error)
        showToast('Could not resend OTP.', 'error')
      }
    } else if (blockedReason === 'payment') {
      showToast('Finish your payment to continue.', 'info')
      router.push(`/signup?step=4&email=${encodeURIComponent(blockedEmail)}`)
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !isLoading) {
      if (blockedReason) {
        handleBlockedAction()
      } else {
        handleSubmit()
      }
    }
  }

  const validateForgotPasswordEmail = (): boolean => {
    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordError('Email is required')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      setForgotPasswordError('Invalid email address')
      return false
    }
    return true
  }

  const handleForgotPasswordSubmit = async (): Promise<void> => {
    if (!validateForgotPasswordEmail()) return

    setIsSendingReset(true)
    setForgotPasswordError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotPasswordEmail,
        }),
      })

      const data = await response.json()

      if (response.ok || response.status === 200) {
        setForgotPasswordSuccess(true)
      } else {
        setForgotPasswordError(data.message || 'An error occurred. Please try again.')
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      setForgotPasswordError('Network error. Please try again later.')
    } finally {
      setIsSendingReset(false)
    }
  }

  const handleForgotPasswordKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !isSendingReset) {
      handleForgotPasswordSubmit()
    }
  }

  const resetForgotPasswordState = () => {
    setShowForgotPassword(false)
    setForgotPasswordEmail('')
    setForgotPasswordError('')
    setForgotPasswordSuccess(false)
  }

  if (showForgotPassword) {
    if (forgotPasswordSuccess) {
      return (
        <>
          <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="w-full max-w-md">
              <button
                onClick={resetForgotPasswordState}
                className="mb-6 text-white/80 hover:text-orange-500 flex items-center gap-2 text-sm backdrop-blur-xl bg-white/5 px-4 py-2 rounded-lg border border-white/10 transition-colors"
              >
                ← Back to Login
              </button>
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 backdrop-blur-xl bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center">
                  <span className="text-4xl">✉️</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
                <p className="text-white/60 text-sm mb-6">
                  We have sent password reset instructions to
                  <br />
                  <span className="font-semibold text-white">{forgotPasswordEmail}</span>
                </p>
                <p className="text-sm text-white/60 mb-6">
                  The link will expire in 1 hour. If you do not see the email, check your spam
                  folder.
                </p>
                <button
                  onClick={resetForgotPasswordState}
                  className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all shadow-lg"
                >
                  Back to Login
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
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <button
              onClick={resetForgotPasswordState}
              className="mb-6 text-white/80 hover:text-orange-500 flex items-center gap-2 text-sm backdrop-blur-xl bg-white/5 px-4 py-2 rounded-lg border border-white/10 transition-colors"
            >
              ← Back to Login
            </button>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8">
              <div className="w-20 h-20 mx-auto mb-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                <span className="text-4xl">🔑</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
              <p className="text-white/60 text-sm mb-6">
                Enter your email address and we will send you instructions to reset your password.
              </p>

              {forgotPasswordError && (
                <div className="mb-4 p-4 backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 text-sm text-center">{forgotPasswordError}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => {
                        setForgotPasswordEmail(e.target.value)
                        setForgotPasswordError('')
                      }}
                      onKeyPress={handleForgotPasswordKeyPress}
                      disabled={isSendingReset}
                      className={`w-full pl-10 pr-4 py-3 backdrop-blur-xl bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all ${
                        forgotPasswordError ? 'border-red-500/50' : 'border-white/10'
                      } ${isSendingReset ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <button
                  onClick={handleForgotPasswordSubmit}
                  disabled={isSendingReset}
                  className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSendingReset ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        {toastNode}
      </>
    )
  }

  if (showTerms) {
    return (
      <>
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
          <div className="w-full max-w-2xl">
            <button
              onClick={() => setShowTerms(false)}
              className="mb-6 text-white/80 hover:text-orange-500 flex items-center gap-2 text-sm backdrop-blur-xl bg-white/5 px-4 py-2 rounded-lg border border-white/10 transition-colors"
            >
              ← Back
            </button>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-4">
                Terms of Service & Privacy Policy
              </h2>

              <h3 className="text-lg font-semibold text-white mt-6 mb-2">Terms of Service</h3>
              <p className="text-white/60 text-sm mb-4">
                By using this fitness platform, you agree to comply with all applicable laws and
                regulations. You are responsible for maintaining the confidentiality of your account
                credentials and for all activities under your account. We reserve the right to
                suspend or terminate access for violations of these terms.
              </p>

              <h3 className="text-lg font-semibold text-white mt-6 mb-2">Privacy Policy</h3>
              <p className="text-white/60 text-sm mb-4">
                We collect personal information to provide and improve our services. Your data is
                protected with industry-standard security measures. We do not share your personal
                information with third parties without your consent, except as required by law. You
                have the right to access, modify, or delete your personal data at any time.
              </p>

              <h3 className="text-lg font-semibold text-white mt-6 mb-2">Data Protection</h3>
              <p className="text-white/60 text-sm mb-4">
                Your fitness data, including workout history and personal metrics, is stored
                securely and encrypted. We use cookies and similar technologies to enhance your
                experience. You can manage your preferences in your account settings.
              </p>

              <button
                onClick={() => setShowTerms(false)}
                className="mt-6 w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all shadow-lg"
              >
                I Agree & Accept
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
      <div className="h-[100vh] md:min-h-screen bg-black flex w-full p-1 items-center justify-center">
        <div className=" max-h-screen md:w-full max-w-xl  rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 ">
          {/* Left Side - Login Form */}
          <div className="backdrop-blur-xl bg-white/5 py-10 p-8 md:p-10 flex flex-col justify-center text-white border-r border-white/10 rounded-2xl">
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2 mb-16">
                <Image src={'/api/media/file/Logo-2.png'} alt={'Logo'} width={142} height={27} />
              </div>
              <h1 className="text-3xl bebas mb-2">Welcome Back</h1>
              <p className="font-regular text-white/60">Please enter your Login information.</p>
            </div>

            <div className="space-y-5">
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-2 font-semibold rounded-lg transition-all ${
                    activeTab === 'login'
                      ? 'backdrop-blur-xl bg-white/10 text-white border border-white/20'
                      : 'backdrop-blur-xl bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 border border-white/10'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => router.push('/signup')}
                  className={`flex-1 py-2 font-semibold rounded-lg transition-all ${
                    activeTab === 'signup'
                      ? 'backdrop-blur-xl bg-white/10 text-white border border-white/20'
                      : 'backdrop-blur-xl bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 border border-white/10'
                  }`}
                >
                  Sign up
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('email', e.target.value)
                  }
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 backdrop-blur-xl bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all ${
                    errors.email ? 'border-red-500/50' : 'border-white/10'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="your@email.com"
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange('password', e.target.value)
                    }
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className={`w-full px-4 py-3 backdrop-blur-xl bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all pr-10 ${
                      errors.password ? 'border-red-500/50' : 'border-white/10'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
              </div>

              <button
                type="button"
                onClick={blockedReason ? handleBlockedAction : handleSubmit}
                disabled={isLoading}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : blockedReason === 'otp' ? (
                  'Verify email'
                ) : blockedReason === 'payment' ? (
                  'Complete payment'
                ) : (
                  'Login'
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                disabled={isLoading}
                className="w-full text-center text-orange-500 hover:text-orange-400 text-sm font-medium disabled:opacity-50 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <p className="text-center text-xs text-white/40 mt-6">
              By signing in, you agree to our{' '}
              <button
                onClick={() => setShowTerms(true)}
                className="text-orange-500 hover:text-orange-400 transition-colors"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                onClick={() => setShowTerms(true)}
                className="text-orange-500 hover:text-orange-400 transition-colors"
              >
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </div>
      {toastNode}
    </>
  )
}
