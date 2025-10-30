import '../../css/styles.css'
import React from 'react'

import Sidebar from '@/components/system/dashboard/Sidebar'



export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
    <body className="flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 bg-gray-100 min-h-screen">{children}</main>
    </body>
    </html>
  )
}

