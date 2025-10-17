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
  const [images, setImages] = useState<string[]>([])
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

        const imageUrls = data.galleryImages.map((item) => item.image.url)
        setImages(imageUrls)
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

  // Column 1: 2 images (large)
  // Column 2: 3 images (medium, medium, large)
  // Column 3: 2 images (medium, medium) - but positioned differently
  const col1 = images.slice(0, 2)
  const col2 = images.slice(2, 5)
  const col3 = images.slice(5, 7)

  return (
    <div className="w-full p-[6~24]">
      <div className=" mx-auto">
        <div className="grid grid-cols-3 gap-4">
          {/* Column 1: 2 large images */}
          <div className="grid gap-4">
            {col1.map((src, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow relative w-full h-72"
              >
                <Image
                  src={src}
                  alt={`Gallery image ${idx + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>

          {/* Column 2: 3 images (2 medium, 1 large) */}
          <div className="grid gap-4">
            <div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow relative w-full h-36">
              <Image
                src={col2[0]}
                alt="Gallery image 3"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow relative w-full h-80">
              <Image
                src={col2[1]}
                alt="Gallery image 4"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow relative w-full h-32">
              <Image
                src={col2[2]}
                alt="Gallery image 5"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Column 3: 2 images (1 medium, 1 large) */}
          <div className="grid gap-4">
            <div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow relative w-full h-48">
              <Image
                src={col3[0]}
                alt="Gallery image 6"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow relative w-full h-56">
              <Image
                src={col3[1]}
                alt="Gallery image 7"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
