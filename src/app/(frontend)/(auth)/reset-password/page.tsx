'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [isValidating, setIsValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('No reset token provided')
        setIsValidating(false)
        return
      }

      try {
        const response = await fetch('/api/auth/validate-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (!response.ok || !data.valid) {
          setError(data.message || 'Invalid or expired reset link')
          setIsValid(false)
        } else {
          setIsValid(true)
        }
      } catch (error) {
        console.error('Token validation error:', error)
        setError('Unable to validate reset link. Please try again.')
        setIsValid(false)
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to reset password')
        return
      }

      setSuccess(true)

      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (error) {
      console.error('Reset password error:', error)
      setError('Unable to reset password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
if (isValidating) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-400">Validating reset link...</p>
        </div>
      </div>
    </div>
  )
}

// Invalid token state
if (!isValid || error) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 backdrop-blur-md bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Invalid Reset Link</h2>
          <p className="text-gray-400 mb-6">
            {error || 'This password reset link is invalid or has expired. Please request a new one.'}
          </p>
          <Link
            href="/login"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-all"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

// Success state
if (success) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 backdrop-blur-md bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Password Reset Successful!</h2>
          <p className="text-gray-400 mb-6">
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    </div>
  )
}

  // Reset password form
  return (
  <div className="min-h-screen flex items-center justify-center bg-black p-4">
    {/* Glassmorphism card */}
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 max-w-md w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Reset Your Password
        </h1>
        <p className="text-gray-400 text-sm">Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="backdrop-blur-md bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            New Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-3 backdrop-blur-md bg-white/5 border border-white/10 rounded-lg 
                     text-white placeholder-gray-500 
                     focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:bg-white/10
                     transition-all duration-200 outline-none"
            placeholder="Enter new password"
          />
          <p className="mt-2 text-xs text-gray-500">Must be at least 8 characters</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-3 backdrop-blur-md bg-white/5 border border-white/10 rounded-lg 
                     text-white placeholder-gray-500 
                     focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:bg-white/10
                     transition-all duration-200 outline-none"
            placeholder="Confirm new password"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-lg font-medium 
                   bg-orange-500 hover:bg-orange-600 
                   text-white 
                   transition-all duration-200 
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link 
          href="/login" 
          className="text-orange-500 hover:text-orange-400 text-sm font-medium transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  </div>
)
}