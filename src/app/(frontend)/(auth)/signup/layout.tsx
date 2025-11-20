import React from 'react'
import '../../css/styles.css'
import { Suspense } from 'react'
import MotionProvider from '@/components/animations/MotionProvider'

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <body className="min-h-screen bg-gray-100 overflow-x-hidden">
        <MotionProvider>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </MotionProvider>
      </body>
    </html>
  )
}
