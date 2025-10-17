"use client"
import React, { useEffect, useState } from 'react'
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(
          '/api/globals/reviews?depth=2&draft=false&locale=undefined&trash=false',
          { cache: 'no-store' },
        )
        if (!res.ok) throw new Error('Failed to fetch reviews')
        const data = await res.json()

        if (data?.reviews) setReviews(data.reviews)
        else setError('No reviews found.')
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  if (loading)
    return <div className="w-full flex justify-center py-10 text-gray-500">Loading reviews...</div>

  if (error) return <div className="w-full flex justify-center py-10 text-red-500">{error}</div>

  return (
    <section className="w-full flex flex-col items-center justify-center dark:bg-gray-900 py-10">
      <h2 className="text-3xl bebas mb-10 dark:text-white">
        What Our Clients Say
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-6 max-w-6xl">
        {reviews.map((review, i) => (
          <div key={i} className="bg-gray-800 text-white rounded-xl p-5 flex flex-col shadow-lg">
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
