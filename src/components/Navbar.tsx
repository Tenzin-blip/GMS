// components/Navbar.tsx
import Link from 'next/link'
import Image from 'next/image'

export default async function Navbar() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const res = await fetch(
    `${baseUrl}/api/globals/navbar?depth=2&draft=false&locale=undefined&trash=false`,
    { cache: 'no-store' },
  )
  const navbar = await res.json()

  if (!navbar) return null

  return (
    <nav className="w-full top-0 p-4 px-[24px] mb-[10px] flex justify-between items-center text-white bebas text-xl tracking-wide bg-neutral-800 rounded-2xl">
      <div>
        <Image src={navbar.logo.url} alt={navbar.logo.alt || 'Logo'} width={142} height={27} />
      </div>
      <div className="flex flex-row gap-12">
      <ul className="flex gap-12">
        {navbar.navLinks.map((link: any) => (
          <li key={link.id}>
            <Link
              className="relative hover:text-white transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-0.5 after:bg-[#696970] after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full"
              href={link.href}
            >
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
      <div>
        <Link
          href={navbar.ctaButton.href}
          className="bg-[#f80a0a] px-4 py-1 rounded-2xl hover:bg-[#e00707] hover:shadow-lg hover:shadow-red-500/25 hover:scale-[1.02] transition-all duration-300 ease-out font-medium text-"
        >
          {navbar.ctaButton.text}
        </Link>
      </div>
      </div>
    </nav>
  )
}
