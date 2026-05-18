'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import PropertyCard from '@/components/properties/PropertyCard'

export default function Home() {
  const [featuredProperties, setFeaturedProperties] = useState([])
  const [stats, setStats] = useState([
    { label: 'Properties Listed', value: 1250, icon: '🏠', color: 'from-blue-500 to-blue-600' },
    { label: 'Happy Clients', value: 850, icon: '😊', color: 'from-emerald-500 to-emerald-600' },
    { label: 'Cities Covered', value: 45, icon: '🏙️', color: 'from-purple-500 to-purple-600' },
    { label: 'Years Experience', value: 5, icon: '⭐', color: 'from-amber-500 to-amber-600' },
  ])

  useEffect(() => {
    fetchFeaturedProperties()
  }, [])

  const fetchFeaturedProperties = async () => {
    try {
      const res = await fetch('/api/properties?featured=true&limit=6')
      const data = await res.json()
      setFeaturedProperties(data.properties || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-blue-200 text-sm font-medium mb-6 border border-white/20">
                🇳🇵 Nepal's Trusted Real Estate Platform
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Find Your Dream
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  Property in Nepal
                </span>
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-lg leading-relaxed">
                Discover premium properties across Nepal's most desirable locations. 
                From modern apartments in Kathmandu to serene villas in Pokhara.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/properties" className="btn-primary btn-lg text-center">
                  Browse Properties
                </Link>
                <Link href="/contact" className="btn-secondary btn-lg text-center !bg-white/10 !text-white !border-white/30 hover:!bg-white/20">
                  Contact Agent
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
                {[
                  { value: '1,250+', label: 'Properties' },
                  { value: '850+', label: 'Happy Clients' },
                  { value: '45+', label: 'Cities' },
                  { value: '5+', label: 'Years' },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hero Image/Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="w-full h-[500px] bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-3xl backdrop-blur-sm border border-white/20 p-8">
                  <div className="grid grid-cols-2 gap-4 h-full">
                    <div className="space-y-4">
                      <div className="h-40 bg-white/10 rounded-2xl backdrop-blur-sm"></div>
                      <div className="h-60 bg-white/10 rounded-2xl backdrop-blur-sm"></div>
                    </div>
                    <div className="space-y-4 pt-8">
                      <div className="h-60 bg-white/10 rounded-2xl backdrop-blur-sm"></div>
                      <div className="h-40 bg-white/10 rounded-2xl backdrop-blur-sm"></div>
                    </div>
                  </div>
                </div>
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-xl flex items-center justify-center text-3xl animate-bounce">
                  🏠
                </div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-xl flex items-center justify-center text-2xl animate-pulse">
                  💰
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-2xl bg-gray-50 border border-gray-200 hover:border-blue-300 transition-all"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg`}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value.toLocaleString()}+</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              Featured Properties
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Hand-Picked for You</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our selection of premium properties across Nepal
            </p>
          </motion.div>

          {featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property: any, index) => (
                <motion.div
                  key={property._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <PropertyCard property={property} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No featured properties yet.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/properties" className="btn-primary btn-lg">
              View All Properties →
            </Link>
          </div>
        </div>
      </section>

      {/* Property Types */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              Property Types
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Find What Suits You Best</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse properties by type and find your perfect match
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { type: 'House', icon: '🏘️', color: 'from-blue-500 to-blue-600', desc: 'Spacious homes' },
              { type: 'Apartment', icon: '🏢', color: 'from-purple-500 to-purple-600', desc: 'Modern living' },
              { type: 'Land', icon: '🌍', color: 'from-emerald-500 to-emerald-600', desc: 'Build your dream' },
              { type: 'Commercial', icon: '🏪', color: 'from-orange-500 to-orange-600', desc: 'Business spaces' },
              { type: 'Villa', icon: '🏰', color: 'from-red-500 to-red-600', desc: 'Luxury living' },
            ].map((item, index) => (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  href={`/properties?type=${item.type.toLowerCase()}`}
                  className="group block p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-500 transition-all duration-300 hover:shadow-xl text-center"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{item.type}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }} />
        </div>
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Find Your Dream Property?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of satisfied clients who found their perfect property through NepalRE
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/properties" className="btn bg-white text-blue-600 hover:bg-blue-50 btn-lg shadow-xl">
                Browse Properties
              </Link>
              <Link href="/sign-up" className="btn bg-transparent border-2 border-white text-white hover:bg-white/10 btn-lg">
                Create Free Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}