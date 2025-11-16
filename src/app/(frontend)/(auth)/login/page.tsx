'use client'
import React, { useState, KeyboardEvent, ChangeEvent } from 'react'
import { Eye, EyeOff, Mail, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

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

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field as keyof FormErrors]) {
      setErrors({ ...errors, [field]: '' })
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

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

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
        console.log('Login successful:', data)
        if (data.token) {
          sessionStorage.setItem('token', data.token)
        }

        //CHECK USER ROLE
        if (data.user.role === 'admin') {
          window.location.href = 'admin-panel/admin-dash'
          return
        }

        // Check if user has fitness profile
        const profileCheck = await fetch('/api/user-fitness', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.token}`,
          },
        })

        const profileData = await profileCheck.json()

        // Route based on profile existence
        if (profileData.exists) {
          window.location.href = 'user/dashboard'
        } else {
          window.location.href = 'user/setup'
        }
      } else {
        setErrors({
          general: data.message || 'Invalid email or password. Please try again.',
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({
        general: 'An error occurred. Please try again later.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit()
    }
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <button
            onClick={() => setShowForgotPassword(false)}
            className="mb-6 text-white/80 hover:text-orange-500 flex items-center gap-2 text-sm backdrop-blur-xl bg-white/5 px-4 py-2 rounded-lg border border-white/10 transition-colors"
          >
            ← Back to Login
          </button>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-white/60 text-sm mb-6">
              Enter your email address and we will send you instructions to reset your password.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <button className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all shadow-lg">
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showTerms) {
    return (
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
              credentials and for all activities under your account. We reserve the right to suspend
              or terminate access for violations of these terms.
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
              Your fitness data, including workout history and personal metrics, is stored securely
              and encrypted. We use cookies and similar technologies to enhance your experience. You
              can manage your preferences in your account settings.
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
    )
  }

  return (
    <div className="h-[100vh] md:min-h-screen bg-black flex w-screen p-1 items-center justify-center">
      <div className="h-full md:w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
        {/* Left Side - Login Form */}
        <div className="backdrop-blur-xl bg-white/5 py-10 p-8 md:p-10 flex flex-col justify-center text-white border-r border-white/10">
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Image src={'/api/media/file/Logo-2.png'} alt={'Logo'} width={142} height={27} />
            </div>
            <h1 className="text-3xl bebas mb-2">Welcome Back</h1>
            <p className="font-regular text-white/60">Please enter your Login information.</p>
          </div>

          {errors.general && (
            <div className="mb-5 p-4 backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm text-center">{errors.general}</p>
            </div>
          )}

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
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
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
            <button onClick={() => setShowTerms(true)} className="text-orange-500 hover:text-orange-400 transition-colors">
              Terms of Service
            </button>{' '}
            and{' '}
            <button onClick={() => setShowTerms(true)} className="text-orange-500 hover:text-orange-400 transition-colors">
              Privacy Policy
            </button>
          </p>
        </div>

        {/* Right Side - Image */}
        <div
          className="hidden md:block bg-cover bg-center bg-no-repeat relative overflow-hidden"
          style={{
            backgroundImage: 'url(/api/media/file/individual-doing-sport-healthy-lifestyle.jpg)',
          }}
        >
          <div className="absolute inset-0 backdrop-blur-[2px] bg-black/40"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
              <p className="text-white text-4xl font-semibold bebas">Build Your Strength</p>
              <p className="text-white/80 text-2xl mt-2 bebas">Transform Your Body</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}