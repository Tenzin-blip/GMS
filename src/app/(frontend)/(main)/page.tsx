import Image from 'next/image'
import Link from 'next/link'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import '../css/styles.css'
import TrainerCard from '@/components/Card'
import Plans from '@/components/Plans'
import Toast from '@/components/toast'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })
  const homeData = await payload.findGlobal({ slug: 'home' })
  const heroSection = homeData?.heroSection
  console.log({ user, homeData })

  return (
    <main className="flex flex-col gap-[10px] w-full">
      {/* HERO SECTION (full width, no container px) */}
      {heroSection && (
        <section className="relative w-full h-[88vh] ">
          {/* Background Image */}
          <Image
            src={heroSection.backgroundImage?.url}
            alt={heroSection.backgroundImage?.alt || 'Hero image'}
            fill
            priority
            className="object-cover rounded-2xl"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 rounded-2xl" />

          {/* Hero Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-left text-white px-6 sm:px-12 lg:px-24 gap-[32px] w-full ">
            <h1 className="text-6xl md:text-7xl font-bold leading-tight bebas">
              {heroSection.title}
            </h1>
            <p className="text-base md:text-xl max-w-2xl leading-relaxed font-geist text-center ">
              {heroSection.subtitle}
            </p>
            <div className="flex flex-row gap-[1rem]">
              <Link
                href={homeData.ctaButton1.href}
                className="btn bg-[#f80a0a] px-7 py-3 rounded-2xl hover:bg-[#e00707] hover:shadow-lg hover:shadow-red-500/25 hover:scale-[1.02] transition-all duration-300 ease-out bebas text-xl md:text-2xl"
              >
                {homeData.ctaButton1.text}
              </Link>
              <Link
                href={homeData.ctaButton2.href}
                className="btn bg-slate-200 px-7 py-3 rounded-2xl hover:bg-[#e00707] hover:shadow-lg hover:shadow-red-500/25 hover:scale-[1.02] transition-all duration-300 ease-out bebas text-xl md:text-2xl !text-black"
              >
                {homeData.ctaButton2.text}
              </Link>
            </div>
          </div>
        </section>
      )}
      <Toast title="Hello" message="World!" />

      {/* ABOUT SECTION (with standard container) */}
      <section className=" text-white w-full flex flex-col gap-[10px]">
        {/* Heading */}
        <div className=" px-[6~24] flex flex-col gap-[10px] h-[40vh] bg-[#292929] rounded-2xl w-full text-center justify-center items-center">
          <h1 className="text-3xl font-semibold Sansation-bold mb-3 uppercase">
            About <span className="text-[#f80a0a]">Us</span>
          </h1>
          <h2 className="bebas text-[5xl~7xl] leading-none">
            Your <span className="text-[#f80a0a]">Fitness</span> Journey Starts Here
          </h2>
          {/* Description */}
          <p className="sansation-regular text-white-700 text-lg leading-[1.5] text-center max-w-4xl">
            At <span className="font-bold text-[#f80a0a]">Level Up</span>, we believe fitness is
            more than just exercise — it’s a lifestyle transformation. Our state-of-the-art facility
            combines cutting-edge equipment with personalized training to help you achieve your
            goals.
          </p>
        </div>

        {/* Stats Section */}
        <div className="flex flex-row gap-[10px] w-full">
          <div className=" flex flex-col gap-30 w-[50vh] bg-[#292929] rounded-l-2xl justify-center items-center">
            <div>
              <div className=" text-center Sansation-bold text-5xl">
                12<span className="text-[#f80a0a]">+</span>
              </div>
              <div className="text-white Sansation-regular">Years of experience</div>
            </div>

            <div>
            <div className="text-center text-5xl Sansation-bold">
              2K<span className="text-[#f80a0a]">+</span>
            </div>
            <div className="text-white Sansation-regular">Members</div>
            </div>
          </div>

          <div className="h-[450px] relative w-full">
            <Image
              src="/api/media/file/risen-wang-20jX9b35r_M-unsplash.jpg"
              alt="About image"
              width={1400}
              height={1200}
              className="object-cover w-full h-full brightness-69"
            />
          </div>

          <div className=" flex flex-col gap-30 w-[50vh] bg-[#292929] rounded-r-2xl justify-center items-center">
            <div>
              <div className=" text-center Sansation-bold text-5xl">
                24/<span className="text-[#f80a0a]">7</span>
              </div>
              <div className="text-white Sansation-regular text-center">Open</div>
            </div>
            <div>
              <div className="text-center text-5xl Sansation-bold">
                10<span className="text-[#f80a0a]">+</span>
              </div>
              <div className=" text-white Sansation-regular">Expert trainers</div>
            </div>
          </div>
        </div>
      </section>

      {/* TRAINERS SECTION (with standard container) */}
      <section className="py-10 bg-white text-black w-full">
        <div className=" px-[6~24] flex flex-col">
          {/* Heading */}
          <div>
            <h1 className="text-3xl font-semibold Sansation-bold mb-3 uppercase">
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
          <div className="stats stats-vertical lg:stats-horizontal  w-full py-10 justify-center items-center gap-10">
            <TrainerCard
              name="DAYJEN JIGME"
              category="Strength & Conditioning"
              experience="8 Years experience"
              description="Former NFL athlete specializing in functional strength training and performance optimization."
              imageUrl="/api/media/file/pexels-assomyron-32695888.jpg"
              instagramUrl="https://instagram.com/username"
              email="trainer@example.com"
            />
            <TrainerCard
              name="KUNSANG GURUNG"
              category="Yoga and Stretching"
              experience="10 Years experience"
              description="Mindfulness coach combining traditional yoga practices with modern stretching training methods."
              imageUrl="/api/media/file/pexels-koolshooters-6246587.jpg"
              instagramUrl="https://instagram.com/username"
              email="trainer@example.com"
            />
            <TrainerCard
              name="CHIME CHOENZOM"
              category="Pilates & Flexibility"
              experience="6 Years experience"
              description="Blending mindful movement with modern flexibility techniques for a balanced body and calm mind."
              imageUrl="/api/media/file/pexels-airamdphoto-13106577.jpg"
              instagramUrl="https://instagram.com/username"
              email="trainer@example.com"
            />
          </div>
        </div>
      </section>
      {/* PLAN SECTION (with standard container) */}
      <section className="py-15 bg-white text-black w-full ">
        <div className=" px-[6~24] flex flex-col justify-center items-center">
          {/* Heading */}
          <div>
            <h1 className="text-3xl font-semibold Sansation-bold mb-3 uppercase text-[#f80a0a]">
              Plans
            </h1>
          </div>

          {/* Description */}
          <p className="sansation-regular text-gray-700 text-lg leading-[1.5] max-w-3xl text-center">
            Flexible membership options designed to fit your lifestyle and fitness goals. Start your
            transformation today with our comprehensive training packages.
          </p>
          <Plans />
        </div>
      </section>

      {/* SERVICES SECTION (with standard container) */}
      <section className="py-10 bg-white text-black w-full">
        <div className=" px-[6~24] flex flex-col">
          {/* Heading */}
          <div>
            <h1 className="text-3xl font-semibold Sansation-bold mb-3 uppercase">
              Our <span className="text-[#f80a0a]">Services</span>
            </h1>
            <h2 className="bebas text-[5xl~7xl] leading-none">
              Premium <span className="text-[#f80a0a]">Fitness</span> Services Tailored for{' '}
              <span className="text-[#f80a0a]">You</span>
            </h2>
          </div>

          {/* Description */}
          <p className="sansation-regular text-gray-700 text-lg leading-[1.5] max-w-3xl">
            At Level Up Gym, we offer personalized fitness services to help you reach your goals.
            From one-on-one training to high-energy classes and recovery sessions, we provide
            everything you need to succeed in your fitness journey.
          </p>
        </div>
      </section>
    </main>
  )
}
