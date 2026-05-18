'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface StatsData {
  properties: any
  users: any
  inquiries: any
  growth: any
  recentProperties: any[]
  recentInquiries: any[]
  propertyTypeDistribution: any[]
  popularProperties: any[]
}

export default function AdminStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `रु ${(value / 10000000).toFixed(2)}Cr`
    if (value >= 100000) return `रु ${(value / 100000).toFixed(2)}L`
    return `रु ${value.toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Total Properties',
            value: stats?.properties?.total || 0,
            subtext: `${stats?.properties?.active || 0} active`,
            color: 'blue',
            icon: '🏠',
            trend: stats?.growth?.monthlyRate || 0,
          },
          {
            label: 'Total Users',
            value: stats?.users?.total || 0,
            subtext: `${stats?.users?.agents || 0} agents`,
            color: 'green',
            icon: '👥',
          },
          {
            label: 'Total Inquiries',
            value: stats?.inquiries?.total || 0,
            subtext: `${stats?.inquiries?.new || 0} new`,
            color: 'orange',
            icon: '💬',
          },
          {
            label: 'Total Views',
            value: stats?.properties?.totalViews || 0,
            subtext: 'All time',
            color: 'purple',
            icon: '👁️',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{stat.icon}</span>
              {stat.trend !== undefined && (
                <span className={`text-sm font-medium ${
                  stat.trend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend > 0 ? '↑' : '↓'} {Math.abs(stat.trend)}%
                </span>
              )}
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {stat.value.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue & Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Total Property Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.properties?.totalValue || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Price</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.properties?.avgPrice || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Types</h3>
          <div className="space-y-3">
            {stats?.propertyTypeDistribution?.map((type: any) => (
              <div key={type._id} className="flex items-center justify-between">
                <span className="text-gray-600 capitalize">{type._id}</span>
                <span className="font-semibold">{type.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats?.recentProperties?.slice(0, 5).map((property: any) => (
              <div key={property._id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 truncate">{property.title}</span>
                <span className="text-gray-400 text-xs">
                  {new Date(property.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Properties */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Properties</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm font-medium text-gray-600 border-b">
                <th className="pb-3">Property</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Views</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.popularProperties?.map((property: any) => (
                <tr key={property._id} className="border-b">
                  <td className="py-3">
                    <p className="font-medium">{property.title}</p>
                    <p className="text-sm text-gray-500">{property.location?.city}</p>
                  </td>
                  <td className="py-3 capitalize">{property.type}</td>
                  <td className="py-3">{property.views}</td>
                  <td className="py-3">{formatCurrency(property.price)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      property.status === 'for-sale' ? 'bg-green-100 text-green-800' :
                      property.status === 'for-rent' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {property.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}