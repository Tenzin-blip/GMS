import React from 'react'
import '../../css/styles.css'
import MotionProvider from '@/components/animations/MotionProvider'

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 ">
        <MotionProvider>
          <main>{children}</main>
        </MotionProvider>
      </body>
    </html>
  )
}