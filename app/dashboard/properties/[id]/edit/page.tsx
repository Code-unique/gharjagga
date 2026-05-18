'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import ImageUpload from '@/components/ui/ImageUpload'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const propertySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  type: z.enum(['house', 'apartment', 'land', 'commercial', 'villa']),
  status: z.enum(['for-sale', 'for-rent', 'sold', 'rented']),
  price: z.string().min(1, 'Price is required'),
  area: z.string().min(1, 'Area is required'),
  areaUnit: z.enum(['sqft', 'aana', 'dhur', 'ropani', 'bigha', 'kattha']),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  floors: z.string().optional(),
  province: z.string().min(1, 'Province is required'),
  district: z.string().min(1, 'District is required'),
  city: z.string().min(1, 'City is required'),
  ward: z.string().optional(),
  tole: z.string().optional(),
  features: z.string().optional(),
})

type PropertyFormData = z.infer<typeof propertySchema>

export default function EditPropertyPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const params = useParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<Array<{ url: string; publicId: string }>>([])
  const [deleting, setDeleting] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [property, setProperty] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
  })

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
      return
    }
    if (isLoaded && isSignedIn && params?.id) {
      checkPermissions()
    }
  }, [isLoaded, isSignedIn, params?.id])

  // ✅ Check if user has permission to edit this property
  const checkPermissions = async () => {
    try {
      // First, fetch the property
      const res = await fetch(`/api/properties/${params.id}`)
      if (!res.ok) {
        throw new Error('Property not found')
      }
      
      const propertyData = await res.json()
      setProperty(propertyData)

      // Check if current user is the owner
      const isPropertyOwner = propertyData.owner?.clerkId === user?.id
      setIsOwner(isPropertyOwner)

      // Check if user is admin
      const userRes = await fetch('/api/user/sync', { method: 'POST' })
      if (userRes.ok) {
        const userData = await userRes.json()
        setIsAdmin(userData.user?.role === 'admin')
      }

      // If neither owner nor admin, deny access
      if (!isPropertyOwner && !isAdmin) {
        toast.error('You do not have permission to edit this property')
        router.push('/dashboard')
        return
      }

      // Populate form with property data
      reset({
        title: propertyData.title || '',
        description: propertyData.description || '',
        type: propertyData.type || 'house',
        status: propertyData.status || 'for-sale',
        price: propertyData.price?.toString() || '',
        area: propertyData.area?.toString() || '',
        areaUnit: propertyData.areaUnit || 'sqft',
        bedrooms: propertyData.bedrooms?.toString() || '0',
        bathrooms: propertyData.bathrooms?.toString() || '0',
        floors: propertyData.floors?.toString() || '0',
        province: propertyData.location?.province || '',
        district: propertyData.location?.district || '',
        city: propertyData.location?.city || '',
        ward: propertyData.location?.ward?.toString() || '',
        tole: propertyData.location?.tole || '',
        features: propertyData.features?.join(', ') || '',
      })
      
      setImages(propertyData.images || [])
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Failed to load property')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: PropertyFormData) => {
    if (images.length === 0) {
      toast.error('Please upload at least one image')
      return
    }

    // ✅ Double-check permission before submitting
    if (!isOwner && !isAdmin) {
      toast.error('You do not have permission to edit this property')
      return
    }

    setIsSubmitting(true)
    
    try {
      const features = data.features 
        ? data.features.split(',').map(f => f.trim()).filter(Boolean)
        : []

      const propertyData = {
        title: data.title.trim(),
        description: data.description.trim(),
        type: data.type,
        status: data.status,
        price: parseInt(data.price),
        area: parseInt(data.area),
        areaUnit: data.areaUnit,
        bedrooms: parseInt(data.bedrooms || '0'),
        bathrooms: parseInt(data.bathrooms || '0'),
        floors: parseInt(data.floors || '0'),
        location: {
          province: data.province,
          district: data.district,
          city: data.city,
          ward: data.ward ? parseInt(data.ward) : undefined,
          tole: data.tole?.trim() || undefined,
        },
        features,
        images,
      }

      const res = await fetch(`/api/properties/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyData),
      })

      const responseData = await res.json()

      if (!res.ok) {
        if (res.status === 403) {
          toast.error('You do not have permission to edit this property')
          router.push('/dashboard')
          return
        }
        throw new Error(responseData.error || 'Failed to update property')
      }
      
      toast.success('Property updated successfully!')
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      console.error('Submit error:', error)
      toast.error(error.message || 'Failed to update property')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    // ✅ Check permission before showing delete dialog
    if (!isOwner && !isAdmin) {
      toast.error('You do not have permission to delete this property')
      return
    }

    const confirmMessage = isAdmin && !isOwner
      ? '⚠️ Admin Delete: Are you sure you want to delete this property? This action cannot be undone.'
      : 'Are you sure you want to delete this property? This action cannot be undone.'

    if (!confirm(confirmMessage)) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch(`/api/properties/${params.id}`, {
        method: 'DELETE',
      })

      const responseData = await res.json()

      if (!res.ok) {
        if (res.status === 403) {
          toast.error('You do not have permission to delete this property')
          return
        }
        throw new Error(responseData.error || 'Failed to delete property')
      }
      
      toast.success('Property deleted successfully')
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete property')
    } finally {
      setDeleting(false)
    }
  }

  // Loading state
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property...</p>
        </div>
      </div>
    )
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to edit properties</p>
          <Link href="/sign-in" className="btn-primary">Sign In</Link>
        </div>
      </div>
    )
  }

  // No permission
  if (!isOwner && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to edit this property. Only the property owner or an admin can make changes.
          </p>
          <div className="space-y-3">
            <Link href="/dashboard" className="btn-primary block text-center">
              Go to Dashboard
            </Link>
            <button
              onClick={() => router.back()}
              className="btn-secondary block w-full text-center"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
              {isAdmin && !isOwner && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                  Admin Edit
                </span>
              )}
            </div>
            <p className="text-gray-600">
              {isAdmin && !isOwner 
                ? `Editing property owned by ${property?.owner?.name || 'Unknown'}`
                : 'Update your property details'
              }
            </p>
          </div>
          
          {/* Property Info Badge */}
          <div className="flex items-center gap-3">
            <Link
              href={`/properties/${params.id}`}
              target="_blank"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              View Property
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Property Owner Info */}
        {property?.owner && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">ℹ️</span>
              <p className="text-sm text-blue-800">
                <strong>Owner:</strong> {property.owner.name} ({property.owner.email})
              </p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Image Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 pb-4 border-b border-gray-100 mb-4">
              <span className="text-xl">📸</span>
              <h2 className="text-lg font-semibold text-gray-900">Property Images</h2>
              <span className="text-sm text-gray-500">({images.length}/5)</span>
            </div>
            <ImageUpload value={images} onChange={setImages} maxFiles={5} />
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center space-x-2 pb-4 border-b border-gray-100">
              <span className="text-xl">🏠</span>
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Title <span className="text-red-500">*</span>
              </label>
              <input 
                {...register('title')} 
                className="input"
                placeholder="e.g., Luxury Villa in Kathmandu" 
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea 
                {...register('description')} 
                rows={5} 
                className="input resize-none"
                placeholder="Describe the property in detail..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select {...register('type')} className="select">
                  <option value="house">🏘️ House</option>
                  <option value="apartment">🏢 Apartment</option>
                  <option value="land">🌍 Land</option>
                  <option value="commercial">🏪 Commercial</option>
                  <option value="villa">🏰 Villa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select {...register('status')} className="select">
                  <option value="for-sale">💰 For Sale</option>
                  <option value="for-rent">📋 For Rent</option>
                  <option value="sold">✅ Sold</option>
                  <option value="rented">🔒 Rented</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (NPR) *</label>
                <input {...register('price')} type="number" className="input" placeholder="5000000" />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area *</label>
                <input {...register('area')} type="number" className="input" placeholder="2500" />
                {errors.area && <p className="mt-1 text-sm text-red-600">{errors.area.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                <select {...register('areaUnit')} className="select">
                  <option value="sqft">Sq. Ft.</option>
                  <option value="aana">Aana</option>
                  <option value="dhur">Dhur</option>
                  <option value="ropani">Ropani</option>
                  <option value="bigha">Bigha</option>
                  <option value="kattha">Kattha</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input {...register('bedrooms')} type="number" className="input" placeholder="3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input {...register('bathrooms')} type="number" className="input" placeholder="2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Floors</label>
                <input {...register('floors')} type="number" className="input" placeholder="2" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center space-x-2 pb-4 border-b border-gray-100">
              <span className="text-xl">📍</span>
              <h2 className="text-lg font-semibold text-gray-900">Location</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
              <select {...register('province')} className="select">
                <option value="">Select Province</option>
                <option value="Province 1">Province 1 (Koshi)</option>
                <option value="Madhesh Province">Madhesh Province</option>
                <option value="Bagmati Province">Bagmati Province</option>
                <option value="Gandaki Province">Gandaki Province</option>
                <option value="Lumbini Province">Lumbini Province</option>
                <option value="Karnali Province">Karnali Province</option>
                <option value="Sudurpashchim Province">Sudurpashchim Province</option>
              </select>
              {errors.province && <p className="mt-1 text-sm text-red-600">{errors.province.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                <input {...register('district')} className="input" placeholder="Kathmandu" />
                {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input {...register('city')} className="input" placeholder="Kathmandu" />
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ward Number</label>
                <input {...register('ward')} type="number" className="input" placeholder="4" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tole/Area</label>
                <input {...register('tole')} className="input" placeholder="Lazimpat" />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center space-x-2 pb-4 border-b border-gray-100">
              <span className="text-xl">✨</span>
              <h2 className="text-lg font-semibold text-gray-900">Features & Amenities</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Features (comma-separated)
              </label>
              <input 
                {...register('features')} 
                className="input" 
                placeholder="Mountain View, Parking, Garden, Security, Internet" 
              />
              <p className="text-xs text-gray-500 mt-1">Separate each feature with a comma</p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-medium text-center"
            >
              🗑️ Delete Property
            </button>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  '💾 Save Changes'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}