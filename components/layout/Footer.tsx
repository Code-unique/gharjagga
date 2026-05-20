import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <div>
                <span className="text-xl font-bold text-white">NepalRE</span>
                <span className="block text-xs text-gray-400 -mt-1">Real Estate</span>
              </div>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Your trusted partner in finding the perfect property in Nepal. 
              We make real estate simple, transparent, and accessible.
            </p>
            <div className="flex space-x-3">
              {['facebook', 'twitter', 'instagram'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <span className="text-lg">
                    {social === 'facebook' ? 'f' : social === 'twitter' ? 't' : 'i'}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'Browse Properties', href: '/properties' },
                { label: 'For Sale', href: '/properties?status=for-sale' },
                { label: 'For Rent', href: '/properties?status=for-rent' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Property Types</h3>
            <ul className="space-y-3">
              {['House', 'Apartment', 'Land', 'Commercial', 'Villa'].map((type) => (
                <li key={type}>
                  <Link
                    href={`/properties?type=${type.toLowerCase()}`}
                    className="text-gray-400 hover:text-white transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {type}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <span className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  📍
                </span>
                <div>
                  <p className="text-white font-medium">Address</p>
                  <p className="text-gray-400 text-sm">Srijananagar, Bhaktapur, Nepal</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  📞
                </span>
                <div>
                  <p className="text-white font-medium">Phone</p>
                  <a href="tel:+9779862340551" className="text-gray-400 text-sm hover:text-white">
                    +9779862340551
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  ✉️
                </span>
                <div>
                  <p className="text-white font-medium">Email</p>
                  <a href="mailto:uniqueadhikari25@gmail.com" className="text-gray-400 text-sm hover:text-white">
                    info@nepalrealestate.com
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Nepal Real Estate. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}