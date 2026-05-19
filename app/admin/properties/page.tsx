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
  const [totalProperties, setTotalProperties] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)
  const [stats, setStats] = useState({ total: 0, active: 0, deleted: 0 })

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
      return
    }
    if (isLoaded && isSignedIn) {
      fetchProperties()
    }
  }, [isLoaded, isSignedIn, page, statusFilter, showDeleted])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status: statusFilter,
        search: searchTerm,
        showDeleted: showDeleted.toString(),
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
      setTotalProperties(data.pagination?.total || 0)
      if (data.stats) {
        setStats(data.stats)
      }
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

    const confirmMessages: Record<string, string> = {
      'delete': `Are you sure you want to delete ${selectedIds.length} properties?`,
      'permanent-delete': `⚠️ PERMANENTLY DELETE ${selectedIds.length} properties? This cannot be undone!`,
      'restore': `Restore ${selectedIds.length} properties?`,
      'feature': `Feature ${selectedIds.length} properties?`,
      'unfeature': `Unfeature ${selectedIds.length} properties?`,
    }

    if (confirmMessages[action] && !confirm(confirmMessages[action])) {
      return
    }

    try {
      const res = await fetch('/api/admin/properties', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyIds: selectedIds, action }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || `Properties ${action}ed successfully`)
        setSelectedIds([])
        fetchProperties()
      } else {
        throw new Error(data.error || 'Failed')
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties Management</h1>
          <p className="text-gray-600 text-sm mt-1">
            {showDeleted 
              ? `Showing deleted properties` 
              : `${totalProperties} total properties`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/properties/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Property
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => { setShowDeleted(false); setStatusFilter('all'); setPage(1); }}
          className={`cursor-pointer bg-white rounded-xl border p-4 hover:shadow-md transition-all ${!showDeleted ? 'ring-2 ring-blue-500' : 'border-gray-200'}`}
        >
          <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
          <p className="text-sm text-gray-600">Active</p>
        </div>
        <div 
          onClick={() => { setShowDeleted(true); setStatusFilter('all'); setPage(1); }}
          className={`cursor-pointer bg-white rounded-xl border p-4 hover:shadow-md transition-all ${showDeleted ? 'ring-2 ring-red-500' : 'border-gray-200'}`}
        >
          <p className="text-2xl font-bold text-red-600">{stats.deleted}</p>
          <p className="text-sm text-gray-600">Deleted</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total All</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{selectedIds.length}</p>
          <p className="text-sm text-gray-600">Selected</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
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
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="for-sale">For Sale</option>
            <option value="for-rent">For Rent</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              Search
            </button>
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); setPage(1); fetchProperties(); }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-blue-800 font-semibold mr-2">
            {selectedIds.length} selected
          </span>
          
          {!showDeleted ? (
            <>
              <button onClick={() => handleBulkAction('feature')} className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 font-medium">
                ⭐ Feature
              </button>
              <button onClick={() => handleBulkAction('unfeature')} className="px-3 py-1.5 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 font-medium">
                ☆ Unfeature
              </button>
              <button onClick={() => handleBulkAction('delete')} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 font-medium">
                🗑️ Delete
              </button>
            </>
          ) : (
            <>
              <button onClick={() => handleBulkAction('restore')} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 font-medium">
                ↩️ Restore
              </button>
              <button onClick={() => handleBulkAction('permanent-delete')} className="px-3 py-1.5 bg-red-700 text-white rounded-lg text-sm hover:bg-red-800 font-medium">
                ⚠️ Permanent Delete
              </button>
            </>
          )}
          
          <button onClick={() => setSelectedIds([])} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 ml-auto font-medium">
            ✕ Clear
          </button>
        </div>
      )}

      {/* Toggle View */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => { setShowDeleted(false); setPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!showDeleted ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          Active Properties
        </button>
        <button
          onClick={() => { setShowDeleted(true); setPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${showDeleted ? 'bg-red-600 text-white shadow-sm' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          Deleted Properties
        </button>
      </div>

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
                    className="rounded border-gray-300 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Views</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Featured</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-500 text-sm mt-2">Loading properties...</p>
                  </td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="text-4xl mb-2">🏠</div>
                    <p className="text-gray-500 font-medium">
                      {showDeleted ? 'No deleted properties found' : 'No active properties found'}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {showDeleted ? 'Deleted properties will appear here' : 'Add your first property to get started'}
                    </p>
                  </td>
                </tr>
              ) : (
                properties.map((property) => (
                  <tr key={property._id} className={`hover:bg-gray-50 transition-colors ${!property.isActive ? 'bg-red-50/30' : ''}`}>
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
                        className="rounded border-gray-300 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* Property Image Thumbnail */}
                        <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                          {property.images?.[0]?.url ? (
                            <img src={property.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">N/A</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate max-w-[200px]">{property.title}</p>
                          <p className="text-xs text-gray-500 truncate">{property.location?.city}, {property.location?.district}</p>
                        </div>
                      </div>
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
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(property.price)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{property.views || 0}</td>
                    <td className="px-4 py-3 text-center">
                      {property.featured ? (
                        <span className="text-yellow-500 text-lg">★</span>
                      ) : (
                        <span className="text-gray-300 text-lg">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {property.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Deleted</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <a href={`/properties/${property._id}`} target="_blank" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View
                        </a>
                        <Link href={`/dashboard/properties/${property._id}/edit`} className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                          Edit
                        </Link>
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
          <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages} ({totalProperties} properties)
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50 disabled:opacity-50 font-medium"
              >
                First
              </button>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50 disabled:opacity-50 font-medium"
              >
                ← Prev
              </button>
              
              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 rounded text-sm font-medium ${
                      page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50 disabled:opacity-50 font-medium"
              >
                Next →
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50 disabled:opacity-50 font-medium"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}