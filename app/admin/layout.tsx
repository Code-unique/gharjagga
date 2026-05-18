'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

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

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
      return
    }
    if (isLoaded && isSignedIn) {
      checkAuthorization()
    }
  }, [isLoaded, isSignedIn])

  const checkAuthorization = async () => {
    try {
      const res = await fetch('/api/user/sync', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        console.log('Admin check - User role:', data.user?.role)
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    )
  }

  if (!authorized) return null

  const sidebarLinks = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/properties', label: 'Properties', icon: '🏠' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/inquiries', label: 'Inquiries', icon: '💬' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40 h-16 flex items-center px-6">
        <Link href="/admin" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-gray-900">Admin Panel</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">Admin</span>
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          <span className="text-sm text-gray-600">{user?.fullName}</span>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-800">
            User Dashboard →
          </Link>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto">
        <nav className="p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || 
              (link.href !== '/admin' && pathname.startsWith(link.href))
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-6 bg-blue-600 rounded-full"></span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <Link
            href="/dashboard/properties/new"
            className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <span>+</span>
            <span>Add Property</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 pt-16">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}