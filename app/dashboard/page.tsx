'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, active: 0, sold: 0, inquiries: 0 })

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
      return
    }
    if (isLoaded && user) {
      fetchDashboardData()
    }
  }, [isLoaded, user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [propertiesRes, statsRes] = await Promise.all([
        fetch('/api/properties?limit=10'),
        fetch('/api/dashboard/stats')
      ])
      
      const propertiesData = await propertiesRes.json()
      const statsData = await statsRes.json()
      
      setProperties(propertiesData.properties || [])
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return
    
    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Property deleted')
        fetchDashboardData()
      }
    } catch (error) {
      toast.error('Failed to delete property')
    }
  }

  const formatPrice = (price: number) => {
    if (!price) return 'N/A'
    if (price >= 10000000) return `रु ${(price / 10000000).toFixed(2)}Cr`
    if (price >= 100000) return `रु ${(price / 100000).toFixed(2)}L`
    return `रु ${price.toLocaleString()}`
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.fullName}</p>
          </div>
          <Link href="/dashboard/properties/new" className="btn-primary">
            + Add New Property
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'bg-blue-50 text-blue-600' },
            { label: 'Active', value: stats.active, color: 'bg-green-50 text-green-600' },
            { label: 'Sold/Rented', value: stats.sold, color: 'bg-purple-50 text-purple-600' },
            { label: 'Inquiries', value: stats.inquiries, color: 'bg-orange-50 text-orange-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-600 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Properties Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Properties</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No properties yet</p>
              <Link href="/dashboard/properties/new" className="btn-primary text-sm">
                Add Your First Property
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {properties.map((property: any) => (
                    <tr key={property._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{property.title}</p>
                        <p className="text-sm text-gray-500">{property.location?.city}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          property.status === 'for-sale' ? 'bg-green-100 text-green-800' :
                          property.status === 'for-rent' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {property.status?.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{formatPrice(property.price)}</td>
                      <td className="px-6 py-4 text-gray-600">{property.views || 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <Link href={`/properties/${property._id}`} className="text-blue-600 hover:text-blue-800 text-sm">
                            View
                          </Link>
                          <Link href={`/dashboard/properties/${property._id}/edit`} className="text-gray-600 hover:text-gray-800 text-sm">
                            Edit
                          </Link>
                          <button onClick={() => handleDelete(property._id)} className="text-red-600 hover:text-red-800 text-sm">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}