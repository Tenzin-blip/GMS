import React from 'react'
import '../css/styles.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <Navbar/>
      <body className="min-h-screen bg-slate-200 p-[10px]">   
        <main>{children}</main>
      </body>
    </html>
  )
}
