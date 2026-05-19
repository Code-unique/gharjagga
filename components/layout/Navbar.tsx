'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isSignedIn, user } = useUser()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-gray-200/50 border-b border-gray-100' 
        : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-11 h-11 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-bold text-2xl">N</span>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-gray-900 tracking-tight">NepalRE</span>
              <span className="block text-[10px] text-gray-500 -mt-1 font-medium tracking-widest uppercase">Real Estate</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {[
              { href: '/properties', label: 'Properties', icon: '🏠' },
              { href: '/about', label: 'About', icon: '📖' },
              { href: '/contact', label: 'Contact', icon: '📞' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-gray-600 hover:text-blue-600 rounded-xl transition-all duration-200 font-medium text-sm group"
              >
                <span className="mr-1.5 opacity-0 group-hover:opacity-100 transition-opacity">{link.icon}</span>
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-blue-600 rounded-full group-hover:w-3/4 transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-3">
            {isSignedIn ? (
              <>
                <Link href="/dashboard" className="btn-primary btn-sm">
                  <span className="mr-2">📊</span>
                  Dashboard
                </Link>
                <div className="w-px h-8 bg-gray-200 mx-1"></div>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 ring-2 ring-blue-100 hover:ring-blue-500 transition-all duration-300 rounded-xl"
                    }
                  }}
                />
              </>
            ) : (
              <>
                <Link href="/sign-in" className="btn-ghost btn-sm">
                  Sign In
                </Link>
                <Link href="/sign-up" className="btn-primary btn-sm">
                  <span className="mr-1">✨</span>
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-5 h-5 flex flex-col justify-center gap-1.5">
              <span className={`block h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
              <span className={`block h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-1 border-t border-gray-100">
                {[
                  { href: '/properties', label: '🏠 Properties' },
                  { href: '/about', label: '📖 About' },
                  { href: '/contact', label: '📞 Contact' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl font-medium transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                
                <div className="border-t border-gray-100 pt-3 mt-3 px-2 space-y-2">
                  {isSignedIn ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="block w-full text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        📊 Dashboard
                      </Link>
                      <div className="flex justify-center py-2">
                        <UserButton />
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/sign-in"
                        className="block w-full text-center px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/sign-up"
                        className="block w-full text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        ✨ Get Started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}