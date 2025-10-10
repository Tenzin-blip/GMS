import React from 'react'
import '../../css/styles.css'

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 ">
        <main>{children}</main>
      </body>
    </html>
  )
}
