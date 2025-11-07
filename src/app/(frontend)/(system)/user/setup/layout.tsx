import '../../../css/styles.css'
import React from 'react'

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 ">
        <main>{children}</main>
      </body>
    </html>
  )
}