'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import PropertyCard from '@/components/properties/PropertyCard'

export default function Home() {
  const [featuredProperties, setFeaturedProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalCities: 0,
    isLoading: true
  })
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

  useEffect(() => {
    fetchHomepageData()
  }, [])

  const fetchHomepageData = async () => {
    try {
      // Fetch real stats and featured properties
      const [propertiesRes, statsRes] = await Promise.all([
        fetch('/api/properties?featured=true&limit=6'),
        fetch('/api/properties?limit=1') // Just to get total count
      ])
      
      const propertiesData = await propertiesRes.json()
      const statsData = await statsRes.json()
      
      setFeaturedProperties(propertiesData.properties || [])
      
      // Get real stats
      if (statsData.pagination) {
        setStats({
          totalProperties: statsData.pagination.total || 0,
          totalCities: 0, // We'll calculate this
          isLoading: false
        })
      }
      
      // Fetch unique cities count
      fetchUniqueStats()
    } catch (error) {
      console.error('Error fetching homepage data:', error)
      setStats({ totalProperties: 0, totalCities: 0, isLoading: false })
    } finally {
      setLoading(false)
    }
  }

  const fetchUniqueStats = async () => {
    try {
      const res = await fetch('/api/stats/public')
      if (res.ok) {
        const data = await res.json()
        setStats(prev => ({
          ...prev,
          totalCities: data.totalCities || 0,
          totalProvinces: data.totalProvinces || 0,
        }))
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const testimonials = [
    {
      name: 'What Our Users Say',
      role: 'Real Stories from Nepal',
      text: 'Loading testimonials...',
      avatar: '💬',
      rating: 5,
    },
  ]

  const propertyTypes = [
    { 
      type: 'House', 
      icon: '🏘️', 
      color: 'from-blue-500 to-cyan-500', 
      desc: 'Find your perfect family home',
      href: '/properties?type=house'
    },
    { 
      type: 'Apartment', 
      icon: '🏢', 
      color: 'from-purple-500 to-pink-500', 
      desc: 'Modern urban living spaces',
      href: '/properties?type=apartment'
    },
    { 
      type: 'Land', 
      icon: '🌍', 
      color: 'from-emerald-500 to-teal-500', 
      desc: 'Build your dream from ground up',
      href: '/properties?type=land'
    },
    { 
      type: 'Commercial', 
      icon: '🏪', 
      color: 'from-orange-500 to-red-500', 
      desc: 'Business & investment spaces',
      href: '/properties?type=commercial'
    },
    { 
      type: 'Villa', 
      icon: '🏰', 
      color: 'from-rose-500 to-pink-500', 
      desc: 'Luxury living at its finest',
      href: '/properties?type=villa'
    },
  ]

  return (
    <div className="overflow-hidden">
      {/* ========== HERO SECTION ========== */}
      <section ref={heroRef} className="relative min-h-[100svh] flex items-center">
        {/* Animated Background */}
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"></div>
          
          {/* Animated Gradient Orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ x: [0, 80, 0], y: [0, -40, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              className="absolute top-20 left-10 w-[400px] h-[400px] bg-blue-500/15 rounded-full blur-[100px]"
            />
            <motion.div
              animate={{ x: [0, -60, 0], y: [0, 50, 0], scale: [1.1, 1, 1.1] }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-20 right-10 w-[350px] h-[350px] bg-purple-500/15 rounded-full blur-[100px]"
            />
            <motion.div
              animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [0.9, 1.05, 0.9] }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[120px]"
            />
          </div>

          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Dynamic Stat Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 mb-8">
                  {!stats.isLoading && stats.totalProperties > 0 ? (
                    <>
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                      <span className="text-sm text-blue-100 font-medium">
                        {stats.totalProperties.toLocaleString()} Properties Available
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                      <span className="text-sm text-blue-100 font-medium">
                        Nepal's Real Estate Platform
                      </span>
                    </>
                  )}
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight"
              >
                Find Your
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300">
                  Perfect Property
                </span>
                <br />
                in Nepal
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg sm:text-xl text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Browse verified properties across Nepal. From Kathmandu apartments to Pokhara villas — 
                your dream property is just a click away.
              </motion.p>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="max-w-md mx-auto lg:mx-0 mb-8"
              >
                <Link href="/properties" className="flex bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20 shadow-2xl hover:bg-white/15 transition-all group">
                  <span className="flex-1 bg-transparent text-gray-400 px-4 py-3 text-sm flex items-center">
                    🔍 Search by city, type, or price range...
                  </span>
                  <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm group-hover:from-blue-600 group-hover:to-blue-700 transition-all shadow-lg whitespace-nowrap">
                    Explore
                  </span>
                </Link>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link
                  href="/properties"
                  className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold text-lg shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:-translate-y-1"
                >
                  Browse Properties
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-xl text-white border-2 border-white/20 rounded-2xl font-semibold text-lg hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-1"
                >
                  How It Works
                </Link>
              </motion.div>
            </div>

            {/* Right Visual - Desktop */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block relative"
            >
              <div className="relative">
                {/* Main Property Card */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl"
                >
                  <div className="relative h-52 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-blue-400/20 to-purple-400/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-7xl opacity-50">🏠</span>
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="bg-emerald-500/90 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                        For Sale
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs">
                        Kathmandu
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-white/20 rounded-full w-3/4"></div>
                    <div className="h-3 bg-white/10 rounded-full w-1/2"></div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                      <span className="text-white font-bold text-xl">रु 2.5 करोड</span>
                      <div className="flex gap-2">
                        <span className="bg-white/10 rounded-lg px-2 py-1 text-white text-xs backdrop-blur-sm">🛏️ 3</span>
                        <span className="bg-white/10 rounded-lg px-2 py-1 text-white text-xs backdrop-blur-sm">🚿 2</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Badges */}
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -top-6 -right-6 z-20 bg-white/15 backdrop-blur-xl rounded-2xl border border-white/20 p-4 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg shadow-lg">🏰</div>
                    <div>
                      <div className="text-white font-semibold text-sm">Villas</div>
                      <div className="text-gray-300 text-xs">Available Now</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  className="absolute -bottom-4 -left-4 z-20 bg-white/15 backdrop-blur-xl rounded-2xl border border-white/20 p-4 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-lg shadow-lg">📐</div>
                    <div>
                      <div className="text-white font-semibold text-sm">Land Plots</div>
                      <div className="text-gray-300 text-xs">Multiple Cities</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 bg-white/60 rounded-full"></motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ========== REAL STATS SECTION ========== */}
      <section className="relative -mt-16 z-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Properties - REAL DATA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                <span className="text-white text-lg">🏠</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.isLoading ? (
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  stats.totalProperties.toLocaleString()
                )}
              </div>
              <div className="text-sm text-gray-600 mt-1">Properties Listed</div>
            </motion.div>

            {/* Cities - REAL DATA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                <span className="text-white text-lg">🏙️</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  (stats.totalCities || '—')
                )}
              </div>
              <div className="text-sm text-gray-600 mt-1">Cities Covered</div>
            </motion.div>

            {/* Property Types */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                <span className="text-white text-lg">🏘️</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">5</div>
              <div className="text-sm text-gray-600 mt-1">Property Types</div>
            </motion.div>

            {/* Verified */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                <span className="text-white text-lg">✅</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-gray-600 mt-1">Verified Listings</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== FEATURED PROPERTIES ========== */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-4 border border-blue-200">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Featured Properties
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              {featuredProperties.length > 0 ? (
                <>Hand-Picked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">for You</span></>
              ) : (
                <>Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Properties</span></>
              )}
            </h2>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                  <div className="animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property: any, i) => (
                <motion.div
                  key={property._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <PropertyCard property={property} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🏠</div>
              <p className="text-gray-500 text-lg mb-4">No featured properties yet.</p>
              <Link href="/properties" className="btn-primary">
                Browse All Properties
              </Link>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-2xl font-semibold hover:border-blue-300 hover:shadow-xl transition-all duration-300 group"
            >
              View All Properties
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ========== PROPERTY TYPES ========== */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-semibold mb-4 border border-purple-200">
              🏘️ Property Types
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Find What <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Suits You</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {propertyTypes.map((item, i) => (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
              >
                <Link
                  href={item.href}
                  className="group block p-6 sm:p-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl text-center relative overflow-hidden"
                >
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{item.type}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">{item.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold mb-4 border border-emerald-200">
              🚀 Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Works</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Browse Properties', desc: 'Explore our curated collection of verified properties across Nepal.', icon: '🔍', color: 'from-blue-500 to-cyan-500' },
              { step: '02', title: 'Connect & Inquire', desc: 'Contact us directly about any property. We respond within 24 hours.', icon: '💬', color: 'from-purple-500 to-pink-500' },
              { step: '03', title: 'Secure Your Deal', desc: 'Get expert guidance through the entire buying or renting process.', icon: '🤝', color: 'from-emerald-500 to-teal-500' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className={`w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${item.color} rounded-3xl flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-5 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  {item.icon}
                </div>
                <div className="text-sm font-bold text-gray-300 mb-2">{item.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white rounded-full blur-[100px]"></div>
          </div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
              Ready to Find Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">
                Dream Property?
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Start browsing our verified listings today. Your perfect property in Nepal is waiting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/properties"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-700 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/25 hover:-translate-y-1 transition-all duration-300"
              >
                🔍 Browse Properties
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white/50 text-white rounded-2xl font-bold text-lg hover:bg-white/10 hover:border-white transition-all duration-300 hover:-translate-y-1"
              >
                💬 Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}