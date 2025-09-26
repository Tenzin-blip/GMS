import Image from 'next/image'
import Link from 'next/link'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import './styles.css'
export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })
  const homeData = await payload.findGlobal({ slug: 'home' })
  const heroSection = homeData?.heroSection
  console.log({ user, homeData })

  return (
    <div className="home">
      {heroSection && (
        <section className="relative w-full h-screen">
          {/* Background Image */}
          <Image
            src={heroSection.backgroundImage?.url}
            alt={heroSection.backgroundImage?.alt || 'Hero image'}
            fill
            priority
            className="object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-start justify-center h-full text-left text-white px-20 gap-6">
            <h1 className="text-8xl mb-4 dahlia-medium">{heroSection.title}</h1>
            <p className="text-xl max-w-2xl Sansation-regular">{heroSection.subtitle}</p>
            <Link
              href={homeData.ctaButton.href}
              className=" btn bg-[#f80a0a] p-4 px-7 py-2 rounded-2xl hover:bg-[#e00707] hover:shadow-lg hover:shadow-red-500/25 hover:scale-[1.02] transition-all duration-300 ease-out bebas text-2xl"
            >
              {homeData.ctaButton.text}
            </Link>
          </div>
        </section>
      )}

      <div className="flex flex-col items-left mt-8 px-[3rem] text-black">
        <h1 className="text-5xl Sansation-regular">
          About <span className="text-[#f80a0a]">Us</span>
        </h1>
        <h2 className="bebas text-7xl">Your <span className="text-[#f80a0a]">Fitness</span> Journey Starts Here</h2>
        <p className="sansation-regular text-gray-700">At Level Up, we believe fitness is more than just exercise - it's a lifestyle transformation. Our state-of-the-art facility combines cutting-edge equipment with personalized training to help you achieve your goals.</p>
      </div>
    </div>
  )
}
