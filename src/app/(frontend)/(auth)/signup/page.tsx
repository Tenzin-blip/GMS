'use client'
import { password } from 'node_modules/payload/dist/fields/validations'
import { useState } from 'react'

export default function SignupForm() {
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    dob: '',
    gender: '',
    plan: '',
    otp: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Step 1: Submit basic info
  const submitBasicInfo = async () => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phoneNumber: form.phoneNumber,
        dob: form.dob,
        gender: form.gender,
        plan: form.plan,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setUserId(data.userId)
      setStep(2)
      alert('OTP sent to your email ✉️')
    } else {
      alert('Error: ' + data.message)
    }
  }

  // Step 2: Verify OTP
  const submitOTP = async () => {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, otp: form.otp }),
    })
    const data = await res.json()
    if (res.ok) {
      setStep(3)
      alert('Email verified! Now set your password 🔒')
    } else {
      alert('Error: ' + data.message)
    }
  }

  // Step 3: Set password
  const submitPassword = async () => {
    if (!userId) return alert('User ID missing')
    const res = await fetch('/api/auth/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, password: form.password }),
    })
    const data = await res.json()
    if (res.ok) {
      alert('Signup complete ✅')
      setStep(1)
      setForm({
        name: '',
        email: '',
        phoneNumber: '',
        dob: '',
        gender: '',
        plan: '',
        otp: '',
        password: '',
      })
    } else {
      alert('Error: ' + data.message)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md flex flex-col gap-4 text-black">
      {step === 1 && (
        <>
          <h2 className="text-2xl font-semibold text-center">Sign Up</h2>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            value={form.phoneNumber}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <select
            name="plan"
            value={form.plan}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Payment Plan</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button
            type="button"
            onClick={submitBasicInfo}
            className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Next
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-2xl font-semibold text-center">Verify Email</h2>
          <input
            type="text"
            name="otp"
            placeholder="Enter OTP"
            value={form.otp}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="button"
            onClick={submitOTP}
            className="bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors"
          >
            Verify OTP
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="text-2xl font-semibold text-center">Set Password</h2>
          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={form.password}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="button"
            onClick={submitPassword}
            className="bg-purple-500 text-white py-2 rounded hover:bg-purple-600 transition-colors"
          >
            Finish Signup
          </button>
        </>
      )}
    </div>
  )
}
