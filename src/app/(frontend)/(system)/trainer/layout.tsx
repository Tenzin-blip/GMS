import '../../css/styles.css'
import React from 'react'
import TrainerSidebar from '@/components/system/dashboard/TrainerSidebar'

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex">
        <TrainerSidebar />
        <main className="flex-1 md:ml-64 bg-black min-h-screen">{children}</main>
      </body>
    </html>
  )
}

