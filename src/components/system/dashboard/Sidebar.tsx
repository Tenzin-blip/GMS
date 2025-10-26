'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Dumbbell, 
  UtensilsCrossed, 
  TrendingUp, 
  Calendar, 
  CreditCard, 
  User, 
  QrCode, 
  Settings, 
  LogOut 
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />
  },
  {
    label: 'Workout plan',
    href: '/workout-plan',
    icon: <Dumbbell className="w-5 h-5" />
  },
  {
    label: 'Meal Plan',
    href: '/meal-plan',
    icon: <UtensilsCrossed className="w-5 h-5" />
  },
  {
    label: 'Track-progress',
    href: '/track-progress',
    icon: <TrendingUp className="w-5 h-5" />
  },
  {
    label: 'Attendance',
    href: '/attendance',
    icon: <Calendar className="w-5 h-5" />
  },
  {
    label: 'Payment',
    href: '/payment',
    icon: <CreditCard className="w-5 h-5" />
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: <User className="w-5 h-5" />
  },
]

const bottomNavItems: NavItem[] = [
  {
    label: 'QR',
    href: '/qr',
    icon: <QrCode className="w-5 h-5" />
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <Settings className="w-5 h-5" />
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logging out...')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-gray-900 to-black border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex gap-0.5">
              <div className="w-1 h-6 bg-white rounded-sm"></div>
              <div className="w-1 h-6 bg-white rounded-sm"></div>
              <div className="w-1 h-6 bg-white rounded-sm"></div>
              <div className="w-1 h-6 bg-white rounded-sm"></div>
            </div>
          </div>
          <div>
            <div className="text-white font-bold text-lg tracking-wider">LEVEL UP</div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-800 p-3">
        <ul className="space-y-1 mb-2">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </aside>
  )
}