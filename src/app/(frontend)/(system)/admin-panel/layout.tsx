import '../../css/styles.css'
import React from 'react'

import AdminSidebar from '@/components/system/dashboard/AdminSidebar'

export default function AttendanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex">
        <AdminSidebar />
        <main className="flex-1 md:ml-64 bg-black min-h-screen">{children}</main>
      </body>
    </html>
  )
}
