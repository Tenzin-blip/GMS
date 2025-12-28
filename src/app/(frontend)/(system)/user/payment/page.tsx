'use client'

import React, { useState, useEffect } from 'react'
import {
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  Plus,
  Receipt,
  TrendingUp,
  Clock,
} from 'lucide-react'

const PaymentPage = () => {
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dataLoading, setDataLoading] = useState(true)

  const [userData, setUserData] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState({
    totalPaid: 0,
    nextPayment: null,
    upcomingAmount: 0,
  })

  const planPrices = {
    essential: 3500,
    premium: 5000,
    elite: 6500,
  }

  const PAYLOAD_SERVER = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

  // Check for payment status in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paymentStatus = params.get('payment')

    if (paymentStatus === 'success') {
      setSuccess('Payment completed successfully! 🎉')
      // Remove the query param
      window.history.replaceState({}, '', '/payment')
    } else if (paymentStatus === 'failed') {
      setError('Payment failed. Please try again.')
      window.history.replaceState({}, '', '/payment')
    } else if (paymentStatus === 'cancelled') {
      setError('Payment was cancelled.')
      window.history.replaceState({}, '', '/payment')
    }
  }, [])

  // Fetch user data and payment history
  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // Use Payload's built-in /api/users/me endpoint
      const response = await fetch(`${PAYLOAD_SERVER}/api/users/me`, {
        credentials: 'include', // Important: includes cookies
      })

      if (!response.ok) {
        setError('Please login to view payment details')
        setDataLoading(false)
        return
      }

      const data = await response.json()
      const user = data.user

      if (!user) {
        setError('Please login to view payment details')
        setDataLoading(false)
        return
      }

      setUserData(user)

      // Calculate next payment date
      const nextPaymentDate = user.nextPaymentDate ? new Date(user.nextPaymentDate) : null

      setStats((prev) => ({
        ...prev,
        nextPayment: nextPaymentDate,
        upcomingAmount: planPrices[user.plan?.toLowerCase()] || 5000,
      }))

      // Fetch payment history after we have user data
      fetchPaymentHistory(user.id)

      setDataLoading(false)
    } catch (err) {
      console.error('Error fetching user data:', err)
      setError('Failed to load user data')
      setDataLoading(false)
    }
  }

  const fetchPaymentHistory = async (userId) => {
    try {
      // Fetch all completed payments, sorted by payment date (newest first)
      const response = await fetch(
        `${PAYLOAD_SERVER}/api/payments?where[user][equals]=${userId}&where[status][equals]=completed&sort=-paidAt&limit=100`,
        {
          credentials: 'include',
        },
      )

      if (response.ok) {
        const data = await response.json()
        const payments = data.docs || []

        console.log('Payment history fetched:', payments.length, 'payments')
        setTransactions(payments)

        // Calculate total paid from all completed payments
        const total = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
        console.log('Total paid calculated:', total)

        setStats((prev) => ({
          ...prev,
          totalPaid: total,
        }))
      } else {
        console.error('Failed to fetch payment history:', response.status)
      }
    } catch (err) {
      console.error('Error fetching payment history:', err)
    }
  }

  const handleInitiatePayment = async () => {
    if (!userData) {
      setError('Please login first')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${PAYLOAD_SERVER}/api/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: userData.id }),
      })

      const data = await response.json()

      if (response.ok && data.paymentUrl) {
        // Redirect to Khalti
        window.location.href = data.paymentUrl
      } else {
        setError(data.message || 'Failed to initiate payment')
      }
    } catch (err) {
      setError('Unable to connect to payment service')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyPayment = async () => {
    if (!userData) {
      setError('Please login first')
      return
    }

    setVerifying(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${PAYLOAD_SERVER}/api/payment/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: userData.id }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.payment) {
          setSuccess('Payment verified successfully!')
          // Refresh data
          fetchUserData()
        } else {
          setError('Payment not completed yet')
        }
      } else {
        setError(data.message || 'Verification failed')
      }
    } catch (err) {
      setError('Unable to verify payment status')
    } finally {
      setVerifying(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatMonth = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-black text-white relative flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-gray-400">Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-black text-white relative flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please login to view your payment details</p>
          <a
            href="/login"
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl font-medium transition-colors inline-block"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  const isPaymentDue = stats.nextPayment ? new Date() >= new Date(stats.nextPayment) : false

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 bg-clip-text text-transparent">
              Payment
            </h1>
            <p className="text-gray-400">Manage your payments and transaction history</p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 backdrop-blur-xl flex items-start gap-3 shadow-lg shadow-red-500/5">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/30 backdrop-blur-xl flex items-start gap-3 shadow-lg shadow-green-500/5">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-green-400 text-sm">{success}</p>
              <button
                onClick={() => setSuccess('')}
                className="ml-auto text-green-400 hover:text-green-300"
              >
                ✕
              </button>
            </div>
          )}

          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Current Plan */}
            <div className="group bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/10 hover:border-orange-500/50 transition-all duration-300 shadow-xl hover:shadow-orange-500/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 text-sm font-medium">Current Plan</h3>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-600/30 backdrop-blur-sm flex items-center justify-center border border-orange-500/30 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                </div>
              </div>
              <p className="text-3xl font-bold capitalize bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {userData.plan || 'No Plan'}
              </p>
              <p className="text-xs text-gray-500 mt-2">Active Membership</p>
            </div>

            {/* Next Payment */}
            <div className="group bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 shadow-xl hover:shadow-purple-500/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 text-sm font-medium">Next Payment</h3>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-600/30 backdrop-blur-sm flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {stats.nextPayment ? formatDate(stats.nextPayment) : 'Not Set'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {isPaymentDue ? 'Payment Overdue' : 'Due Date'}
              </p>
            </div>

            {/* Total Paid */}
            <div className="group bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 shadow-xl hover:shadow-blue-500/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 text-sm font-medium">Total Paid</h3>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/30 backdrop-blur-sm flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Receipt className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                NPR {stats.totalPaid.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {transactions.length} {transactions.length === 1 ? 'Payment' : 'Payments'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Upcoming Payment */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-orange-500/10 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  {isPaymentDue ? 'Payment Due' : 'Upcoming Payment'}
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Plan</span>
                      <span className="text-white font-medium capitalize">
                        {userData.plan || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Due Date</span>
                      <span className="text-white font-medium">
                        {stats.nextPayment ? formatDate(stats.nextPayment) : 'Not Set'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Amount Due</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                        NPR {stats.upcomingAmount.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={handleInitiatePayment}
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-500/50 disabled:to-orange-600/50 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 disabled:scale-100"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          Pay Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-orange-500" />
                    Payment Method
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="bg-white/5 border border-white/20 rounded-xl p-4 hover:bg-white/10 hover:border-orange-500/50 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-medium">Khalti</p>
                          <p className="text-xs text-gray-500">Digital Wallet</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-lg text-xs text-orange-400 inline-block font-medium">
                      Default Method
                    </div>
                  </div>
                </div>
              </div>

              {/* Verify Payment */}
              {!userData.payment && (
                <button
                  onClick={handleVerifyPayment}
                  disabled={verifying}
                  className="w-full py-4 bg-white/5 border border-white/20 rounded-xl hover:bg-white/10 hover:border-green-500/50 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-xl hover:shadow-green-500/10"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      Verify Payment Status
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Right Column - Transaction History */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2 mb-2">
                      <Receipt className="w-6 h-6 text-orange-500" />
                      Transaction History
                    </h3>
                    <p className="text-sm text-gray-400">All your completed payments</p>
                  </div>
                </div>

                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">No payment history yet</p>
                    <p className="text-gray-600 text-sm mt-2">
                      Your completed payments will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((transaction, index) => (
                      <div
                        key={transaction.id}
                        className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-5 hover:bg-white/10 hover:border-orange-500/50 transition-all duration-300 group shadow-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-600/30 backdrop-blur-sm flex items-center justify-center border border-orange-500/30 group-hover:scale-110 transition-transform duration-300">
                              <CreditCard className="w-7 h-7 text-orange-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-lg capitalize">
                                {transaction.paymentType === 'signup'
                                  ? 'Initial Signup'
                                  : 'Monthly Renewal'}
                              </p>
                              <p className="text-sm text-gray-400 mt-0.5">
                                {formatMonth(transaction.paidAt)} • {formatDate(transaction.paidAt)}
                              </p>
                              <div className="items-centermt-2">
                                <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/10 capitalize">
                                  {transaction.paymentMethod || 'Khalti'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                              NPR {transaction.amount.toLocaleString()}
                            </p>
                            <span className="inline-block mt-2 px-4 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg text-sm font-semibold backdrop-blur-sm">
                              Completed
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage
