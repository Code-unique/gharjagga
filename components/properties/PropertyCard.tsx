import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface PropertyCardProps {
  property: {
    _id: string
    title: string
    type: string
    status: string
    price: number
    area: number
    areaUnit: string
    bedrooms: number
    bathrooms: number
    location: {
      city: string
      district: string
    }
    images: { url: string }[]
    featured: boolean
  }
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `रु ${(price / 10000000).toFixed(2)} करोड`
    } else if (price >= 100000) {
      return `रु ${(price / 100000).toFixed(2)} लाख`
    }
    return `रु ${price.toLocaleString()}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'for-sale': return 'bg-emerald-500 text-white'
      case 'for-rent': return 'bg-blue-500 text-white'
      case 'sold': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'for-sale': return 'For Sale'
      case 'for-rent': return 'For Rent'
      case 'sold': return 'Sold'
      default: return status
    }
  }

  return (
    <Link href={`/properties/${property._id}`} className="block group">
      <div className="card overflow-hidden group-hover:shadow-xl transition-all duration-300">
        {/* Image Section */}
        <div className="relative h-56 overflow-hidden">
          <Image
            src={property.images[0]?.url || '/placeholder.jpg'}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Status Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${getStatusColor(property.status)}`}>
              {getStatusLabel(property.status)}
            </span>
            {property.featured && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-amber-900 shadow-lg">
                ★ Featured
              </span>
            )}
          </div>

          {/* Price Tag */}
          <div className="absolute bottom-4 right-4 bg-white rounded-xl px-4 py-2 shadow-xl">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(property.price)}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
            {property.title}
          </h3>
          
          {/* Location */}
          <div className="flex items-center text-gray-600 mb-4">
            <svg className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm truncate">
              {property.location.city}, {property.location.district}
            </span>
          </div>

          {/* Property Details */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {property.bedrooms > 0 && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {property.bedrooms}
                </span>
              )}
              {property.bathrooms > 0 && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                  {property.bathrooms}
                </span>
              )}
            </div>
            <span className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              {property.area} {property.areaUnit}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}