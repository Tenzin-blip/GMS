import '../../css/styles.css'
import React from 'react'

import AdminSidebar from '@/components/system/dashboard/AdminSidebar'
import MotionProvider from '@/components/animations/MotionProvider'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex">
        <AdminSidebar />
        <MotionProvider>
          <main className="flex-1 md:ml-64 bg-black min-h-screen">{children}</main>
        </MotionProvider>
      </body>
    </html>
  )
}
