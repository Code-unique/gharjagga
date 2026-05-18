'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AdminPropertiesPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
      return
    }
    if (isLoaded && isSignedIn) {
      fetchProperties()
    }
  }, [isLoaded, isSignedIn, page, statusFilter])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status: statusFilter,
        search: searchTerm,
      })
      
      const res = await fetch(`/api/admin/properties?${params}`)
      
      if (res.status === 403) {
        toast.error('Admin access required')
        router.push('/dashboard')
        return
      }
      
      const data = await res.json()
      setProperties(data.properties || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch (error) {
      console.error('Error fetching properties:', error)
      toast.error('Failed to fetch properties')
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchProperties()
  }

  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) {
      toast.error('Select properties first')
      return
    }

    try {
      const res = await fetch('/api/admin/properties', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyIds: selectedIds, action }),
      })

      if (res.ok) {
        toast.success(`Properties ${action}ed successfully`)
        setSelectedIds([])
        fetchProperties()
      } else {
        throw new Error('Failed')
      }
    } catch (error) {
      toast.error('Failed to update properties')
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === properties.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(properties.map(p => p._id))
    }
  }

  const formatPrice = (price: number) => {
    if (!price) return 'N/A'
    if (price >= 10000000) return `रु ${(price / 10000000).toFixed(2)}Cr`
    if (price >= 100000) return `रु ${(price / 100000).toFixed(2)}L`
    return `रु ${price.toLocaleString()}`
  }

  if (!isLoaded) return null

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600 text-sm mt-1">
            {properties.length} properties found
          </p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + Add Property
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by title, city, district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="for-sale">For Sale</option>
            <option value="for-rent">For Rent</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
          </select>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            Search
          </button>
        </form>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center gap-3">
          <span className="text-sm text-blue-800 font-medium">
            {selectedIds.length} selected
          </span>
          <button
            onClick={() => handleBulkAction('feature')}
            className="px-3 py-1.5 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
          >
            Feature
          </button>
          <button
            onClick={() => handleBulkAction('unfeature')}
            className="px-3 py-1.5 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            Unfeature
          </button>
          <button
            onClick={() => handleBulkAction('delete')}
            className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Delete
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 ml-auto"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={properties.length > 0 && selectedIds.length === properties.length}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Property</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Views</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Featured</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-500 text-sm mt-2">Loading...</p>
                  </td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <p className="text-gray-500">No properties found</p>
                  </td>
                </tr>
              ) : (
                properties.map((property) => (
                  <tr key={property._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(property._id)}
                        onChange={() => {
                          setSelectedIds(prev =>
                            prev.includes(property._id)
                              ? prev.filter(id => id !== property._id)
                              : [...prev, property._id]
                          )
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-sm">{property.title}</p>
                      <p className="text-xs text-gray-500">{property.location?.city}, {property.location?.district}</p>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">{property.type}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        property.status === 'for-sale' ? 'bg-green-100 text-green-800' :
                        property.status === 'for-rent' ? 'bg-blue-100 text-blue-800' :
                        property.status === 'sold' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {property.status?.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{formatPrice(property.price)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{property.views || 0}</td>
                    <td className="px-4 py-3 text-center">
                      {property.featured ? '⭐' : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <a href={`/properties/${property._id}`} target="_blank" className="text-blue-600 hover:text-blue-800 text-sm">
                          View
                        </a>
                        <a href={`/dashboard/properties/${property._id}/edit`} className="text-gray-600 hover:text-gray-800 text-sm">
                          Edit
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}