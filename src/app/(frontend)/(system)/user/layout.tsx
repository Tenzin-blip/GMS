import '../../css/styles.css'
import React from 'react'

import Sidebar from '@/components/system/dashboard/Sidebar'
import MotionProvider from '@/components/animations/MotionProvider'

export default function AttendanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex">
        <Sidebar />
        <MotionProvider>
          <main className="flex-1 md:ml-64 bg-black min-h-screen">{children}</main>
        </MotionProvider>
      </body>
    </html>
  )
}
