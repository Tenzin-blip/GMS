import Image from 'next/image'
import Link from 'next/link'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import './css/styles.css'
import TrainerCard from '@/components/Card'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })
  const homeData = await payload.findGlobal({ slug: 'home' })
  const heroSection = homeData?.heroSection
  console.log({ user, homeData })

  return (
    <main className="flex flex-col w-full">
      {/* HERO SECTION (full width, no container px) */}
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

          {/* Hero Content */}
          <div className="relative z-10 flex flex-col items-start justify-center h-full text-left text-white px-6 sm:px-12 lg:px-24 gap-6 max-w-7xl ">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-4 dahlia-medium">
              {heroSection.title}
            </h1>
            <p className="text-lg md:text-xl max-w-2xl leading-relaxed Sansation-regular">
              {heroSection.subtitle}
            </p>
            <Link
              href={homeData.ctaButton.href}
              className="btn bg-[#f80a0a] px-7 py-3 rounded-2xl hover:bg-[#e00707] hover:shadow-lg hover:shadow-red-500/25 hover:scale-[1.02] transition-all duration-300 ease-out bebas text-xl md:text-2xl"
            >
              {homeData.ctaButton.text}
            </Link>
          </div>
        </section>
      )}

      {/* ABOUT SECTION (with standard container) */}
      <section className="py-24 bg-white text-black w-full">
        <div className=" px-[6~24] flex flex-col">
          {/* Heading */}
          <div>
            <h1 className="text-3xl font-semibold Sansation-regular mb-3 uppercase">
              About <span className="text-[#f80a0a]">Us</span>
            </h1>
            <h2 className="bebas text-[5xl~7xl] leading-none">
              Your <span className="text-[#f80a0a]">Fitness</span> Journey Starts Here
            </h2>
          </div>

          {/* Description */}
          <p className="sansation-regular text-gray-700 text-lg leading-[1.5] max-w-3xl">
            At <span className="font-bold text-[#f80a0a]">Level Up</span>, we believe fitness is
            more than just exercise — it’s a lifestyle transformation. Our state-of-the-art facility
            combines cutting-edge equipment with personalized training to help you achieve your
            goals.
          </p>

          {/* Stats Section */}
          <div className="stats stats-vertical lg:stats-horizontal  w-full">
            <div className="stat !border-none">
              <div className="stat-value Sansation-bold">
                12<span className="text-[#f80a0a]">+</span>
              </div>
              <div className="stat-desc text-gray-700 Sansation-regular">Years of experience</div>
            </div>

            <div className="stat !border-none">
              <div className="stat-value Sansation-bold">
                2K<span className="text-[#f80a0a]">+</span>
              </div>
              <div className="stat-desc text-gray-700 Sansation-regular">Members</div>
            </div>

            <div className="stat !border-none ">
              <div className="stat-value Sansation-bold">
                24/<span className="text-[#f80a0a]">7</span>
              </div>
              <div className="stat-desc text-gray-700 Sansation-regular">Open</div>
            </div>

            <div className="stat !border-none">
              <div className="stat-value Sansation-bold">
                15<span className="text-[#f80a0a]">+</span>
              </div>
              <div className="stat-desc text-gray-700 Sansation-regular">Expert trainers</div>
            </div>
          </div>
          <div className="h-[450px] relative">
            <Image
              src="/api/media/file/risen-wang-20jX9b35r_M-unsplash.jpg"
              alt="About image"
              width={1440}
              height={1200}
              className="object-cover w-full h-full brightness-69"
            />
          </div>
        </div>
      </section>

      {/* TRAINERS SECTION (with standard container) */}
      <section className="py-24 bg-white text-black w-full">
        <div className=" px-[6~24] flex flex-col">
          {/* Heading */}
          <div>
            <h1 className="text-3xl font-semibold Sansation-regular mb-3 uppercase">
              Our <span className="text-[#f80a0a]">Trainers</span>
            </h1>
            <h2 className="bebas text-[5xl~7xl] leading-none">
              Meet <span className="text-[#f80a0a]">Our</span> Trainers
            </h2>
          </div>

          {/* Description */}
          <p className="sansation-regular text-gray-700 text-lg leading-[1.5] max-w-3xl">
            Train with certified professionals who are passionate about helping you achieve your
            fitness goals through personalized guidance and proven methodologies.
          </p>

          {/* Card Section */}
          <div className="stats stats-vertical lg:stats-horizontal  w-full mt-10">
            <TrainerCard
              name="SWOYAM POKHAREL"
              category="Strength & Conditioning"
              experience="8 Years experience"
              description="Former NFL athlete specializing in functional strength training and performance optimization."
              imageUrl="/api/media/file/pexels-assomyron-32695888.jpg"
              instagramUrl="https://instagram.com/username"
              email="trainer@example.com"
            />
          </div>
        </div>
      </section>
    </main>
  )
}
