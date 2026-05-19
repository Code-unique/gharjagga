import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import UserSync from '@/components/auth/UserSync'

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
})

export const metadata: Metadata = {
  title: 'NepalRE | Find Your Dream Property in Nepal',
  description: 'Discover premium properties across Nepal. Modern platform for buying, selling, and renting real estate.',
  keywords: 'Nepal real estate, property Nepal, buy house Nepal, rent apartment Kathmandu',
  openGraph: {
    title: 'NepalRE - Premium Real Estate Platform',
    description: 'Find your dream property in Nepal',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${jakarta.variable} scroll-smooth`}>
        <body className={`${jakarta.className} bg-gray-50`}>
          <UserSync />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  )
}