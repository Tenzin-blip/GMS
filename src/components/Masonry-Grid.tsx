'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface GalleryImage {
  image: {
    url: string
    alt?: string
  }
}

interface HomeData {
  galleryImages: GalleryImage[]
}

export default function Gallery() {
  const [galleryData, setGalleryData] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const response = await fetch(
          '/api/globals/home?depth=2&draft=false&locale=undefined&trash=false',
        )

        if (!response.ok) {
          throw new Error('Failed to fetch gallery images')
        }

        const data: HomeData = await response.json()
        setGalleryData(data.galleryImages)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchGalleryImages()
  }, [])

  if (loading) {
    return (
      <div className="w-full bg-white p-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500">Loading gallery...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full p-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    )
  }

  const col1 = galleryData.slice(0, 2)
  const col2 = galleryData.slice(2, 5)
  const col3 = galleryData.slice(5, 7)

  const ImageCard = ({
    item,
    height,
    rounded,
  }: {
    item: GalleryImage
    height: string
    rounded?: string
  }) => (
    <div className={`relative overflow-hidden group ${height} ${rounded || ''}`}>
      <Image
        src={item.image.url}
        alt={item.image.alt || 'Gallery image'}
        fill
        className="object-cover group-hover:blur-xl transition-all duration-300"
      />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-white/0 text-2xl sm:text-3xl md:text-4xl bebas text-center translate-y-20 group-hover:translate-y-0 transition-transform duration-500 group-hover:text-white">
          {item.image.alt || 'Gallery'}
        </p>
      </div>
    </div>
  )

  return (
    <div className="w-full px-2 sm:px-6 md:px-[24px] mt-4 sm:mt-6 md:mt-8 min-h-screen">
      <div className="mx-auto">
        {/* Mobile: stacked single column */}
        <div className="flex flex-col md:hidden gap-3 sm:gap-4">
          {galleryData.map((item, idx) => (
            <ImageCard key={idx} item={item} height="h-40 sm:h-48" rounded="rounded-lg sm:rounded-xl" />
          ))}
        </div>

        {/* Desktop: 3 column masonry */}
        <div className="hidden md:flex md:flex-row gap-4 h-screen">
          {/* Column 1: 2 images */}
          <div className="grid gap-4 flex-1">
            {col1.map((item, idx) => (
              <ImageCard
                key={idx}
                item={item}
                height="h-full"
                rounded={idx === 0 ? 'rounded-tl-2xl' : idx === 1 ? 'rounded-bl-2xl' : ''}
              />
            ))}
          </div>

          {/* Column 2: 3 images */}
          <div className="grid gap-4 flex-1">
            {col2.map((item, idx) => (
              <ImageCard
                key={idx}
                item={item}
                height="h-full"
                rounded=""
              />
            ))}
          </div>

          {/* Column 3: 2 images */}
          <div className="grid gap-4 flex-1">
            {col3.map((item, idx) => (
              <ImageCard
                key={idx}
                item={item}
                height="h-full"
                rounded={idx === 0 ? 'rounded-tr-2xl' : idx === 1 ? 'rounded-br-2xl' : ''}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}