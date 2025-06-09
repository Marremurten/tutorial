import Link from 'next/link'

interface FooterProps {
  companyName?: string
}

export default function Footer({ companyName = 'Your Company' }: FooterProps) {
  const currentYear = new Date().getFullYear()

  const linkClassName = "text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"

  return (
    <footer 
      role="contentinfo" 
      className="flex flex-col md:flex-row justify-between items-center p-4 bg-gray-50 border-t border-gray-200 mt-auto"
    >
      <nav className="flex space-x-6 mb-2 md:mb-0">
        <Link href="/" className={linkClassName}>
          Home
        </Link>
        <Link href="/about" className={linkClassName}>
          About
        </Link>
        <Link href="/contact" className={linkClassName}>
          Contact
        </Link>
      </nav>
      
      <div className="text-sm text-gray-600">
        © {currentYear} {companyName}. All rights reserved.
      </div>
    </footer>
  )
}