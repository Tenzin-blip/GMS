import Image from 'next/image'
import Link from 'next/link'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import '../css/styles.css'
import TrainerCard from '@/components/website/Card'
import Plans from '@/components/website/Plans'
import Toast from '@/components/website/toast'
import MasonryGrid from '@/components/website/Masonry-Grid'
import Reviews from '@/components/website/Reviews'
import Footer from '@/components/website/Footer'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })
  const homeData = await payload.findGlobal({ slug: 'home' })
  const heroSection = homeData?.heroSection
  console.log({ user, homeData })

  return (
    <main className=" scroll-behavior-smooth flex flex-col gap-[10px] w-full">
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
            <p className="text-base md:text-xl max-w-2xl text-left md:text-center leading-relaxed font-geist text-center ">
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
                className="btn bg-slate-200 px-7 py-3 rounded-2xl hover:bg-[#e00707] hover:shadow-lg hover:shadow-red-500/25 hover:scale-[1.02] transition-all duration-300 ease-out bebas text-xl md:text-2xl !text-black hover:!text-white"
              >
                {homeData.ctaButton2.text}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ABOUT SECTION (with standard container) */}
      <section className="text-white w-full flex flex-col gap-[10px]">
        {/* Heading */}
        <div className="py-[8~12] px-4 sm:px-6 md:px-6 flex flex-col gap-[10px] min-h-[20vh~50vh] bg-neutral-800 rounded-2xl w-full text-center justify-center items-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold Sansation-bold mb-3 uppercase">
            About <span className="text-[#f80a0a]">Us</span>
          </h1>
          <h2 className="bebas text-2xl sm:text-4xl md:text-5xl lg:text-6xl leading-none px-2">
            Your <span className="text-[#f80a0a]">Fitness</span> Journey Starts Here
          </h2>
          {/* Description */}
          <p className="sansation-regular text-gray-300 text-sm sm:text-base md:text-lg leading-[1.5] text-center max-w-4xl px-2 sm:px-4">
            At <span className="font-bold text-[#f80a0a]">Level Up</span>, we believe fitness is
            more than just exercise — it's a lifestyle transformation. Our state-of-the-art facility
            combines cutting-edge equipment with personalized training to help you achieve your
            goals.
          </p>
        </div>

        {/* Stats Section */}
        <div className="flex flex-col md:flex-row gap-[10px] w-full">
          {/* Left Stats Card */}
          <div className="flex md:flex-col  w-full md:w-[20%] bg-neutral-800 rounded-t-2xl md:rounded-t-none md:rounded-l-2xl justify-between items-center py-8 md:py-16 px-12 md:px-0">
            <div className="text-center">
              <div className="Sansation-bold text-3xl sm:text-4xl md:text-5xl">
                12<span className="text-[#f80a0a]">+</span>
              </div>
              <div className="text-gray-300 Sansation-regular text-xs sm:text-sm md:text-base mt-2">
                Years of experience
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl Sansation-bold">
                2K<span className="text-[#f80a0a]">+</span>
              </div>
              <div className="text-gray-300 Sansation-regular text-xs sm:text-sm md:text-base mt-2">
                Members
              </div>
            </div>
          </div>

          {/* Center Image */}
          <div className="h-[250px] sm:h-[350px] md:h-[450px] relative w-full md:w-[60%]">
            <Image
              src="/api/media/file/risen-wang-20jX9b35r_M-unsplash.jpg"
              alt="About image"
              width={1400}
              height={1200}
              className="object-cover w-full h-full brightness-69"
            />
          </div>

          {/* Right Stats Card */}
          <div className="flex md:flex-col gap-8 sm:gap-12 md:gap-6 lg:gap-8 w-full md:w-[20%] bg-neutral-800 rounded-b-2xl md:rounded-br-2xl md:rounded-b-none md:rounded-tr-2xl justify-between items-center py-8 md:py-16 px-12 md:px-0">
            <div className="text-center">
              <div className="Sansation-bold text-3xl sm:text-4xl md:text-5xl">
                24/<span className="text-[#f80a0a]">7</span>
              </div>
              <div className="text-gray-300 Sansation-regular text-xs sm:text-sm md:text-base text-center mt-2">
                Open
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl Sansation-bold">
                10<span className="text-[#f80a0a]">+</span>
              </div>
              <div className="text-gray-300 Sansation-regular text-xs sm:text-sm md:text-base mt-2">
                Expert trainers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRAINERS SECTION (with standard container) */}
      <section className="text-black w-full">
        <div className=" px-[1~24] flex flex-col">
          {/* Heading */}

          <div className="flex flex-col items-center justify-center text-center gap-[10px] h-[40vh]">
            <h1 className="text-3xl font-semibold Sansation-bold mb-3 uppercase">
              Our <span className="text-[#f80a0a]">Trainers</span>
            </h1>
            <h2 className="bebas text-[5xl~7xl] leading-none">
              Meet <span className="text-[#f80a0a]">Our</span> Trainers
            </h2>
            {/* Description */}
            <p className="sansation-regular text-gray-700 text-lg leading-[1.5] max-w-4xl">
              Train with certified professionals who are passionate about helping you achieve your
              fitness goals through personalized guidance and proven methodologies.
            </p>
          </div>

          {/* Card Section */}
          <div className="stats stats-vertical lg:stats-horizontal  w-full mb-[3rem] justify-center items-center gap-10 ">
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
      <section className="pt-15 bg-neutral-800 rounded-t-2xl text-black w-full ">
        <div className=" px-2 md:px-24 flex flex-col justify-between items-center">
          {/* Heading */}
          <div>
            <h1 className="text-3xl font-semibold Sansation-bold mb-3 uppercase text-[#f80a0a]">
              Plans
            </h1>
          </div>

          {/* Description */}
          <p className="sansation-regular text-white text-lg leading-[1.5] max-w-3xl text-center">
            Flexible membership options designed to fit your lifestyle and fitness goals. Start your
            transformation today with our comprehensive training packages.
          </p>
          <Plans />
          <p className="sansation-regular text-slate-200 pt-12 text-center">
            All plan include access to our system and basic amenities. No setup fees
          </p>
        </div>
        <div className="bg-slate-200 overflow-hidden">
          <svg
            className="w-full h-auto block bg-slate-200"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            style={{ display: 'block' }}
          >
            <path
              fill="#262626"
              fillOpacity="1"
              d="M0,96L48,106.7C96,117,192,139,288,170.7C384,203,480,245,576,240C672,235,768,181,864,154.7C960,128,1056,128,1152,138.7C1248,149,1344,171,1392,181.3L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* SERVICES SECTION (with standard container) */}
      <section className="text-black w-full">
        <div className=" px-[1~24] flex flex-col">
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
          <p className="Sansation-regular text-gray-700 text-lg leading-[1.5] max-w-5xl">
            At Level Up Gym, we offer personalized fitness services to help you reach your goals.
            From one-on-one training to high-energy classes and recovery sessions, we provide
            everything you need to succeed in your fitness journey.
          </p>
        </div>

        {/*Services grid*/}
        <MasonryGrid />
      </section>

      {/*Review Section*/}
      <Reviews />

      {/* Footer Section */}
      <Footer />
    </main>
  )
}
