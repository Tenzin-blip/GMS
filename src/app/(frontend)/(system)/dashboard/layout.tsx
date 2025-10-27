import '../../css/styles.css'
import React from 'react'

import Sidebar from '@/components/system/dashboard/Sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black">
        {/* Sidebar - Fixed */}
        <Sidebar />

        {/* Main Content Area - Scrollable */}
        <main className="ml-64 min-h-screen overflow-y-auto">{children}</main>
      </body>
    </html>
  )
}
