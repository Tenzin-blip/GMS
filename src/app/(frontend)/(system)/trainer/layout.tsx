import '../../css/styles.css'
import React from 'react'
import TrainerSidebar from '@/components/system/dashboard/TrainerSidebar'
import MotionProvider from '@/components/animations/MotionProvider'

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex">
        <TrainerSidebar />
        <MotionProvider>
          <main className="flex-1 md:ml-64 bg-black min-h-screen">{children}</main>
        </MotionProvider>
      </body>
    </html>
  )
}

