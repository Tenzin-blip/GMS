import Image from 'next/image'
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
          alt={heroSection.backgroundImage?.alt || "Hero image"}
          fill
          priority
          className="object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">
          <h1 className="text-8xl mb-4 dahlia-medium">{heroSection.title}</h1>
          <p className="text-xl max-w-2xl Sansation-regular">{heroSection.subtitle}</p>
        </div>
        <div className="flex flex-col items-center justify-center mt-8">
          <h1 className="text-5xl bebas">About <span className="text-[#f80a0a]">Us</span></h1>
        </div>
      </section>
    )}
  </div>
)

}
