'use client'
import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

type Review = {
  name: string
  email: string
  message: string
  image?: {
    url?: string
  }
}

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [displayReviews, setDisplayReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(
          '/api/globals/reviews?depth=2&draft=false&locale=undefined&trash=false',
          { cache: 'no-store' },
        )
        if (!res.ok) throw new Error('Failed to fetch reviews')
        const data = await res.json()

        if (data?.reviews) {
          setReviews(data.reviews)
          setDisplayReviews([...data.reviews, ...data.reviews])
        } else setError('No reviews found.')
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer || isHovering || reviews.length === 0) return

    const scroll = () => {
      scrollContainer.scrollLeft += 1

      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth
      const singleSetWidth = scrollContainer.scrollWidth / 2

      if (scrollContainer.scrollLeft >= singleSetWidth) {
        scrollContainer.scrollLeft = 0
      }
    }

    const interval = setInterval(scroll, 30)
    return () => clearInterval(interval)
  }, [isHovering, reviews.length])

  if (loading)
    return <div className="w-full flex justify-center py-10 text-gray-500">Loading reviews...</div>

  if (error) return <div className="w-full flex justify-center py-10 text-red-500">{error}</div>

  return (
    <section className="w-full flex flex-col items-center justify-center pt-15">
      <h1 className="text-3xl Sansation-bold mb-10 text-black">What Our <span className="text-[#F80A0A]">Clients</span> Say</h1>

      <div 
        ref={scrollContainerRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="w-full flex overflow-x-auto gap-6 px-6 py-4 scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        {displayReviews.map((review, i) => (
          <div key={i} className="flex-shrink-0 w-88 bg-neutral-800 text-white rounded-xl p-5 flex flex-col shadow-lg">
            <div className="flex items-center mb-4">
              {review.image?.url ? (
                <Image
                  src={review.image.url}
                  alt={review.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-700"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-green-400 mr-3"></div>
              )}
              <div>
                <h3 className="font-semibold">{review.name}</h3>
                <p className="text-gray-400 text-sm">{review.email}</p>
              </div>
            </div>
            <p className="text-gray-200">{review.message}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Reviews