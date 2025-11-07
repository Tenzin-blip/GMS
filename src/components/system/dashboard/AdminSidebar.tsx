'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Dumbbell, CreditCard, Settings, LogOut, Menu, X } from 'lucide-react'
import Image from 'next/image'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin-panel/admin-dash',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  { label: 'Notices', href: '/admin-panel/notices', icon: <Dumbbell className="w-5 h-5" /> },
  { label: 'Payment', href: '/admin-panel/payment', icon: <CreditCard className="w-5 h-5" /> },
]

const bottomNavItems: NavItem[] = [
  { label: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" /> },
]

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    sessionStorage.clear()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 p-2 rounded-md text-white border border-gray-700"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-black backdrop-blur-md flex flex-col transform transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6 flex  items-center gap-3 bg-white/10 backdrop-blur-md">
          <Image
            src="/api/media/file/logo-2.png"
            alt={'Logo'}
            priority
            width={120}
            height={27}
          />
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 bg-white/10 backdrop-blur-md">
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
                    onClick={() => setIsOpen(false)}
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
        <div className="border-t border-gray-800 p-3 bg-white/10 backdrop-blur-md">
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
                    onClick={() => setIsOpen(false)}
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

      {/* Overlay when sidebar open on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
