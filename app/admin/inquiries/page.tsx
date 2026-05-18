'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface Inquiry {
  _id: string
  name: string
  email: string
  phone: string
  message: string
  status: string
  propertyId?: {
    _id: string
    title: string
  }
  createdAt: string
}

export default function AdminInquiriesPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
      return
    }
    if (isLoaded && isSignedIn) {
      fetchInquiries()
    }
  }, [isLoaded, isSignedIn, page, statusFilter])

  const fetchInquiries = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status: statusFilter,
      })
      
      const res = await fetch(`/api/admin/inquiries?${params}`)
      
      if (res.status === 403) {
        toast.error('Admin access required')
        router.push('/dashboard')
        return
      }
      
      const data = await res.json()
      setInquiries(data.inquiries || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch (error) {
      console.error('Error fetching inquiries:', error)
      toast.error('Failed to fetch inquiries')
      setInquiries([])
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (inquiryId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryId, status }),
      })

      if (res.ok) {
        toast.success(`Marked as ${status}`)
        fetchInquiries()
        if (selectedInquiry?._id === inquiryId) {
          setSelectedInquiry(prev => prev ? { ...prev, status } : null)
        }
      } else {
        throw new Error('Failed')
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-100 text-red-800 border-red-200'
      case 'read': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'replied': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!isLoaded) return null

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
          <p className="text-gray-600 text-sm mt-1">
            {inquiries.length} inquiries found
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
          <button
            onClick={fetchInquiries}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm ml-auto"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inquiries List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">From</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Property</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      </td>
                    </tr>
                  ) : inquiries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <p className="text-gray-500">No inquiries found</p>
                      </td>
                    </tr>
                  ) : (
                    inquiries.map((inquiry) => (
                      <tr
                        key={inquiry._id}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedInquiry?._id === inquiry._id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedInquiry(inquiry)}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 text-sm">{inquiry.name}</p>
                          <p className="text-xs text-gray-500">{inquiry.email}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {inquiry.propertyId?.title || 'General Inquiry'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(inquiry.status)}`}>
                            {inquiry.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(inquiry.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={`mailto:${inquiry.email}?subject=Re: ${inquiry.propertyId?.title || 'Your Inquiry'}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Reply
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-3 border-t flex justify-between items-center">
                <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Inquiry Detail Panel */}
        <div className="lg:col-span-1">
          {selectedInquiry ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900">Inquiry Detail</h3>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => updateStatus(selectedInquiry._id, e.target.value)}
                    className={`mt-1 px-3 py-1.5 rounded-full text-sm font-medium border w-full ${getStatusColor(selectedInquiry.status)}`}
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">From</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{selectedInquiry.name}</p>
                  <p className="text-sm text-gray-600">{selectedInquiry.email}</p>
                  <p className="text-sm text-gray-600">{selectedInquiry.phone}</p>
                </div>

                {selectedInquiry.propertyId && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Property</label>
                    <a
                      href={`/properties/${selectedInquiry.propertyId._id}`}
                      target="_blank"
                      className="text-sm text-blue-600 hover:text-blue-800 block mt-1"
                    >
                      {selectedInquiry.propertyId.title}
                    </a>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Message</label>
                  <p className="text-sm text-gray-700 mt-1 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                    {selectedInquiry.message}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Date</label>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(selectedInquiry.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.propertyId?.title || 'Your Inquiry'}&body=Dear ${selectedInquiry.name},%0D%0A%0D%0A`}
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Reply via Email
                  </a>
                  <a
                    href={`tel:${selectedInquiry.phone}`}
                    className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                  >
                    Call {selectedInquiry.phone}
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <p className="text-gray-400 text-4xl mb-3">💬</p>
              <p className="text-gray-500 text-sm">Select an inquiry to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}