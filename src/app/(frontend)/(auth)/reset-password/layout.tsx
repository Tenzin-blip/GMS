import React from 'react'
import '../../css/styles.css'
import { Suspense } from 'react'
import MotionProvider from '@/components/animations/MotionProvider'

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 ">
        <MotionProvider>
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </MotionProvider>
      </body>
    </html>
  )
}