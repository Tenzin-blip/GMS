'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import React from 'react'

interface NavbarData {
  logo: {
    url: string
    alt?: string
  }
  navLinks: Array<{
    id: string
    href: string
    title: string
  }>
  ctaButton: {
    href: string
    text: string
  }
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [navbar, setNavbar] = useState<NavbarData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch navbar data on client side
  React.useEffect(() => {
    const fetchNavbar = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const res = await fetch(
          `${baseUrl}/api/globals/navbar?depth=2&draft=false&locale=undefined&trash=false`,
          { cache: 'no-store' },
        )
        const data = await res.json()
        setNavbar(data)
      } catch (error) {
        console.error('Failed to fetch navbar:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNavbar()
  }, [])

  if (isLoading || !navbar) return null

  return (
    <nav className="w-full top-0 p-4 px-4 sm:px-6 md:px-[24px] mb-[10px] flex justify-between items-center text-white bebas text-xl tracking-wide bg-neutral-800 rounded-2xl">
      {/* Logo */}
      <div className="flex-shrink-0">
        <Image
          src="/api/media/file/logo-2.png"
          alt={'Logo'}
          priority
          width={120}
          height={27}
          className="w-auto h-auto"
        />
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex flex-row gap-12 items-center">
        <ul className="flex gap-12">
          {navbar.navLinks.map((link) => (
            <li key={link.id}>
              <Link
                className="relative hover:text-white transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-0.5 after:bg-[#696970] after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full text-md"
                href={link.href}
              >
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href={navbar.ctaButton.href}
          className="ml-6 px-6 py-1 bg-[#F80A0A] hover:bg-[#e00606] rounded-2xl text-white font-semibold transition-colors duration-300 whitespace-nowrap"
        >
          {navbar.ctaButton.text}
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden hover:bg-neutral-700 rounded-lg transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 mt-2 mx-2 bg-neutral-800 rounded-2xl shadow-lg md:hidden z-50">
          <ul className="flex flex-col p-4 gap-4">
            {navbar.navLinks.map((link) => (
              <li key={link.id}>
                <Link
                  href={link.href}
                  className="block py-2 px-4 hover:bg-neutral-700 rounded transition-colors text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  {link.title}
                </Link>
              </li>
            ))}
            <li className="border-t border-neutral-700 pt-4">
              <Link
                href={navbar.ctaButton.href}
                className="block w-full text-center px-4 py-2 bg-[#F80A0A] hover:bg-[#e00606] rounded-2xl text-white font-semibold transition-colors text-sm"
                onClick={() => setIsOpen(false)}
              >
                {navbar.ctaButton.text}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}
