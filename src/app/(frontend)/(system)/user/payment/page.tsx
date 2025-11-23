"use client"

import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, AlertCircle, CheckCircle, Loader2, Trash2, Plus, Receipt, TrendingUp, Clock } from 'lucide-react';

const PaymentPage = () => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Mock user data - replace with actual user from your auth context
  const [userData, setUserData] = useState({
    id: '123',
    name: 'John Doe',
    email: 'user@example.com',
    plan: 'premium',
    payment: false,
    nextPayment: '2025-12-01',
    totalPaid: 20000,
    upcomingAmount: 5000
  });

  const [paymentMethods] = useState([
    { id: 1, type: 'Khalti', last4: '9800', isDefault: true }
  ]);

  // This would come from your Payments collection
  const [transactions] = useState([
    { id: 1, month: 'October', date: 'Oct 1, 2025', amount: 5000, status: 'completed', method: 'Khalti', pidx: 'XYZ123' },
    { id: 2, month: 'September', date: 'Sep 1, 2025', amount: 5000, status: 'completed', method: 'Khalti', pidx: 'ABC456' },
    { id: 3, month: 'August', date: 'Aug 1, 2025', amount: 5000, status: 'completed', method: 'Khalti', pidx: 'DEF789' },
    { id: 4, month: 'July', date: 'Jul 1, 2025', amount: 5000, status: 'completed', method: 'Khalti', pidx: 'GHI012' },
    { id: 5, month: 'June', date: 'Jun 1, 2025', amount: 5000, status: 'completed', method: 'Khalti', pidx: 'JKL345' }
  ]);

  const planPrices = {
    essential: 3500,
    premium: 5000,
    elite: 6500
  };

  const handleInitiatePayment = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id })
      });

      const data = await response.json();

      if (response.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setError(data.message || 'Failed to initiate payment');
      }
    } catch (err) {
      setError('Unable to connect to payment service');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    setVerifying(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/payment/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.payment) {
          setSuccess('Payment verified successfully!');
          setUserData(prev => ({ ...prev, payment: true }));
        } else {
          setError('Payment not completed yet');
        }
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Unable to verify payment status');
    } finally {
      setVerifying(false);
    }
  };

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
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/30 backdrop-blur-xl flex items-start gap-3 shadow-lg shadow-green-500/5">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-green-400 text-sm">{success}</p>
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
              <p className="text-3xl font-bold capitalize bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{userData.plan}</p>
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
                {new Date(userData.nextPayment).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <p className="text-xs text-gray-500 mt-2">Due Date</p>
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
                NPR {userData.totalPaid.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-2">Lifetime Total</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Upcoming Payment */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-orange-500/10 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  Upcoming Payment
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Plan</span>
                      <span className="text-white font-medium capitalize">{userData.plan}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Due Date</span>
                      <span className="text-white font-medium">Nov 1, 2025</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Amount Due</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                        NPR {userData.upcomingAmount.toLocaleString()}
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
                    Payment Methods
                  </h3>
                  <button className="text-sm text-orange-500 hover:text-orange-400 transition-colors font-medium">
                    Plans
                  </button>
                </div>
                
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="bg-white/5 border border-white/20 rounded-xl p-4 hover:bg-white/10 hover:border-orange-500/50 transition-all duration-300 group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
                            <CreditCard className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-medium">{method.type}</p>
                            <p className="text-xs text-gray-500">•••• {method.last4}</p>
                          </div>
                        </div>
                        <button className="text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {method.isDefault && (
                        <div className="mt-3 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-lg text-xs text-orange-400 inline-block font-medium">
                          Default Method
                        </div>
                      )}
                    </div>
                  ))}

                  <button className="w-full py-4 border-2 border-dashed border-white/30 rounded-xl hover:border-orange-500/70 hover:bg-orange-500/5 transition-all duration-300 flex items-center justify-center gap-2 text-gray-400 hover:text-orange-400 group">
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Add Payment Method</span>
                  </button>
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
                    <p className="text-sm text-gray-400">All your payment transactions</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {transactions.map((transaction, index) => (
                    <div 
                      key={transaction.id} 
                      className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-5 hover:bg-white/10 hover:border-orange-500/50 transition-all duration-300 group shadow-lg"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-600/30 backdrop-blur-sm flex items-center justify-center border border-orange-500/30 group-hover:scale-110 transition-transform duration-300">
                            <CreditCard className="w-7 h-7 text-orange-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-lg">Monthly Membership</p>
                            <p className="text-sm text-gray-400 mt-0.5">{transaction.month} • {transaction.date}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/10">
                                {transaction.method}
                              </span>
                              <span className="text-xs text-gray-600">
                                PIDX: {transaction.pidx}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;