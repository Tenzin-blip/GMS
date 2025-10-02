import Image from 'next/image'
import { Instagram } from 'lucide-react';
import { Mail } from 'lucide-react';

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
              <Mail size={20} />
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-6 h-6 cursor-pointer transition-opacity hover:opacity-70"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
          </div>
        </div>
        <div className="text-[#f80a0a] text-sm font-bold mb-2 font-['Sansation']">{category}</div>
        <div className="text-xs text-gray-600 mb-3 Sansation-regular">{experience}</div>
        <p className="text-[13px] leading-relaxed text-gray-800 font-['Sansation']">
          {description}
        </p>
      </div>
    </div>
  )
}
