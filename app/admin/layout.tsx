'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Sidebar width constants
  const SIDEBAR_EXPANDED = 256
  const SIDEBAR_COLLAPSED = 72

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
      return
    }
    if (isLoaded && isSignedIn) {
      checkAuthorization()
    }
  }, [isLoaded, isSignedIn])

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [pathname])

  // Handle escape key to close mobile sidebar
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileSidebarOpen(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const checkAuthorization = async () => {
    try {
      const res = await fetch('/api/user/sync', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        if (data.user?.role === 'admin') {
          setAuthorized(true)
        } else {
          router.push('/dashboard')
        }
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/dashboard')
    } finally {
      setChecking(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <div className="w-full h-full rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          </motion.div>
          <p className="text-gray-600 font-medium">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!authorized) return null

  const sidebarLinks = [
    { 
      href: '/admin', 
      label: 'Dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    { 
      href: '/admin/properties', 
      label: 'Properties', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    { 
      href: '/admin/users', 
      label: 'Users', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      href: '/admin/inquiries', 
      label: 'Inquiries', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== TOP BAR ===== */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 h-16">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileSidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="hidden sm:block text-lg font-bold text-gray-900 tracking-tight">
                Admin<span className="text-blue-600">Panel</span>
              </span>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Add - Mobile */}
            <Link
              href="/dashboard/properties/new"
              className="sm:hidden flex items-center justify-center w-9 h-9 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Add Property"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>

            {/* Quick Add - Desktop */}
            <Link
              href="/dashboard/properties/new"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden md:inline">Add Property</span>
            </Link>

            {/* User */}
            <div className="hidden sm:flex items-center gap-2 text-sm border-l border-gray-200 pl-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                {user?.firstName?.charAt(0)?.toUpperCase() || user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <span className="text-gray-700 font-medium hidden lg:block text-sm">
                {user?.fullName || 'Admin'}
              </span>
            </div>

            {/* View Site */}
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="hidden md:inline">View Site</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ===== MOBILE SIDEBAR OVERLAY ===== */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* ===== MOBILE SIDEBAR ===== */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed left-0 top-16 w-[280px] h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-50 overflow-y-auto shadow-2xl"
          >
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Navigation</h2>
            </div>
            <SidebarContent 
              links={sidebarLinks} 
              pathname={pathname} 
              collapsed={false}
              onClose={() => setMobileSidebarOpen(false)}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside
        className="hidden lg:block fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 z-30 transition-all duration-300 ease-in-out overflow-hidden"
        style={{ width: sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
      >
        <div className={`p-4 border-b border-gray-100 ${sidebarCollapsed ? 'px-2' : ''}`}>
          {!sidebarCollapsed && (
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Navigation</h2>
          )}
        </div>
        <SidebarContent 
          links={sidebarLinks} 
          pathname={pathname} 
          collapsed={sidebarCollapsed}
        />
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main
        className="pt-16 transition-all duration-300 ease-in-out"
        style={{ 
          marginLeft: 0,
        }}
      >
        {/* Desktop: add margin based on sidebar state */}
        <div className="hidden lg:block">
          <div style={{ marginLeft: sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}>
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </div>
        </div>
        
        {/* Mobile: full width */}
        <div className="lg:hidden">
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

// ===== SIDEBAR CONTENT COMPONENT =====
function SidebarContent({ 
  links, 
  pathname, 
  collapsed,
  onClose 
}: { 
  links: any[]
  pathname: string
  collapsed: boolean
  onClose?: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || 
            (link.href !== '/admin' && pathname.startsWith(link.href))
          
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl transition-all duration-200 group ${
                collapsed 
                  ? 'justify-center p-3' 
                  : 'px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={collapsed ? link.label : undefined}
            >
              <span className={`flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                {link.icon}
              </span>
              
              {!collapsed && (
                <span className="text-sm truncate">{link.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Add Property Button */}
      <div className={`p-3 border-t border-gray-200 ${collapsed ? 'px-2' : ''}`}>
        {!collapsed ? (
          <Link
            href="/dashboard/properties/new"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Property</span>
          </Link>
        ) : (
          <Link
            href="/dashboard/properties/new"
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 mx-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            title="Add Property"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  )
}