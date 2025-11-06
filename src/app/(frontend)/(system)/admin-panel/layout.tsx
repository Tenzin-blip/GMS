import '../../../css/styles.css'
import React from 'react'

import AdminSidebar from '@/components/system/dashboard/Sidebar'

export default function AttendanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex">
        <AdminSidebar />
        <main className="flex-1 bg-gray-100 min-h-screen">{children}</main>
      </body>
    </html>
  )
}
