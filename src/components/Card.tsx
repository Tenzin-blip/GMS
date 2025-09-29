import Image from 'next/image'

interface TrainerCardProps {
  name: string
  category: string
  experience: string
  description: string
  imageUrl: string
  instagramUrl: string
  email: string
}

export default function TrainerCard({
  name,
  category,
  experience,
  description,
  imageUrl,
  instagramUrl,
  email,
}: TrainerCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md max-w-[280px] w-full">
      <div className="w-full h-[280px] relative overflow-hidden">
        <Image
          src={imageUrl}
          alt={name}
          width={280}
          height={280}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-5">
        <div className="flex justify-between items-center mb-1">
          <h2 className="font-['Bebas_Neue'] text-xl tracking-wide text-black">{name}</h2>
          <div className="flex gap-2.5">
            <a
              href={`mailto:${email}`}
              className="w-6 h-6 cursor-pointer transition-opacity hover:opacity-70"
              aria-label="Email"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
                <path d="M3 7l9 6 9-6"></path>
              </svg>
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-6 h-6 cursor-pointer transition-opacity hover:opacity-70"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>
        </div>
        <div className="text-[#ff6b00] text-sm font-bold mb-2 font-['Sansation']">{category}</div>
        <div className="text-xs text-gray-600 mb-3 Sansation-regular">{experience}</div>
        <p className="text-[13px] leading-relaxed text-gray-800 font-['Sansation']">
          {description}
        </p>
      </div>
    </div>
  )
}
