import Image from 'next/image'
import Link from 'next/link'

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
    location: { city: string; district: string }
    images: { url: string }[]
    featured: boolean
    views: number
  }
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    if (!price) return 'Price on Request'
    if (price >= 10000000) return `रु ${(price / 10000000).toFixed(2)} करोड`
    if (price >= 100000) return `रु ${(price / 100000).toFixed(2)} लाख`
    return `रु ${price.toLocaleString()}`
  }

  return (
    <Link href={`/properties/${property._id}`} className="block group">
      <div className="premium-card">
        {/* Image */}
        <div className="relative h-52 sm:h-56 overflow-hidden">
          <Image
            src={property.images?.[0]?.url || '/placeholder.svg'}
            alt={property.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Status Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
              property.status === 'for-sale' 
                ? 'bg-emerald-500/90 text-white' 
                : property.status === 'for-rent'
                ? 'bg-blue-500/90 text-white'
                : 'bg-gray-500/90 text-white'
            }`}>
              {property.status === 'for-sale' ? 'For Sale' : property.status === 'for-rent' ? 'For Rent' : property.status}
            </span>
            {property.featured && (
              <span className="px-3 py-1 bg-amber-400/90 text-amber-900 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
                ★ Featured
              </span>
            )}
          </div>

          {/* Price */}
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-xl">
            <span className="text-lg font-bold text-gray-900">{formatPrice(property.price)}</span>
          </div>

          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-blue-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-white font-semibold px-6 py-3 border-2 border-white rounded-xl">
              View Details
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
            {property.title}
          </h3>
          
          <div className="flex items-center text-gray-500 text-sm mb-4">
            <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{property.location?.city}, {property.location?.district}</span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              {property.bedrooms > 0 && (
                <span className="flex items-center gap-1">
                  <span>🛏️</span> {property.bedrooms}
                </span>
              )}
              {property.bathrooms > 0 && (
                <span className="flex items-center gap-1">
                  <span>🚿</span> {property.bathrooms}
                </span>
              )}
            </div>
            <span className="flex items-center gap-1 text-sm text-gray-600">
              <span>📐</span> {property.area} {property.areaUnit}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}