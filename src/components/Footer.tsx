"use client"
import React, { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

const Footer: React.FC = () => {
  const [showScrollButton, setShowScrollButton] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <footer className="relative w-full bg-neutral-800 text-white overflow-hidden rounded-l-2xl ">
        <div className="flex items-stretch min-h-80 ">
          {/* Main content */}
          <div className="flex-1 pl-8  flex flex-col">
            {/* Links section */}
            <div className="flex gap-20 pt-16">
              {/* Socials */}
              <div>
                <h3 className="text-xl text-geist-regular mb-2 tracking-widest">SOCIALS</h3>
                <ul className="space-y-3 text-md text-geist-light">
                  <li>
                    <a href="#" className="hover:text-gray-300 transition">
                      FACEBOOK
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-300 transition">
                      INSTAGRAM
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-300 transition">
                      TIKTOK
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-300 transition">
                      TWITTER
                    </a>
                  </li>
                </ul>
              </div>

              {/* Sitemap */}
              <div>
                <h3 className="text-xl text-geist-regular mb-2 tracking-widest">SITEMAP</h3>
                <ul className="space-y-3 text-md text-geist-light">
                  <li>
                    <button
                      onClick={() => scrollToSection('about')}
                      className="hover:text-gray-300 transition text-left"
                    >
                      ABOUT
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('trainers')}
                      className="hover:text-gray-300 transition text-left"
                    >
                      TRAINERS
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('plans')}
                      className="hover:text-gray-300 transition text-left"
                    >
                      PLANS
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('services')}
                      className="hover:text-gray-300 transition text-left"
                    >
                      SERVICES
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Logo */}
            <div>
              <h2 className="text-[256px] bebas leading-[0.8] pt-28">
                LEVEL UP<span className="text-lg align-super">™</span>
              </h2>
            </div>
          </div>

          {/* Diagonal right section - Bookmark triangle */}
          <div className="relative w-80 bg-slate-200" style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }}>

            {/* Scroll to top button */}
            <div className="absolute inset-0 flex items-center justify-end ">
              {showScrollButton && (
                <button
                  onClick={scrollToTop}
                  className="group flex flex-col items-center gap-16 text-neutral-900 hover:scale-110 transition-transform duration-300"
                  aria-label="Scroll to top"
                >
                  <ArrowUp size={24} className="group-hover:animate-bounce" />
                  <span className="text-md Sansation-regular font-bold writing-mode-vertical-rl transform -rotate-90 whitespace-nowrap">
                    SCROLL TO TOP
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer