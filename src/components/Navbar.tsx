// components/Navbar.tsx
import Link from 'next/link'
import Image from 'next/image'

export default async function Navbar() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const res = await fetch(
    `${baseUrl}/api/globals/navbar?depth=2&draft=false&locale=undefined&trash=false`,
    { cache: 'no-store' }
  )
  const navbar = await res.json()

  if (!navbar) return null

  return (
    <nav className="absolute top-0 left-0 w-full p-4 px-20  flex justify-between items-center z-20 text-white bebas text-xl tracking-wide bg-transparent">
      <div>
        <Image
          src={navbar.logo.url}
          alt={navbar.logo.alt || 'Logo'}
          width={142}
          height={27}
        />
      </div>
      <ul className="flex gap-12">
        {navbar.navLinks.map((link: any) => (
          <li key={link.id}>
            <Link href={link.href}>{link.title}</Link>
          </li>
        ))}
      </ul>
      <div>
        <Link
          href={navbar.ctaButton.href}
          className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
        >
          {navbar.ctaButton.text}
        </Link>
      </div>
    </nav>
  )
}
