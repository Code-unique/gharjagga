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
    if (params?.id) {
      fetchProperty()
    }
  }, [isLoaded, isSignedIn, params?.id])

  const fetchProperty = async () => {
    try {
      const res = await fetch(`/api/properties/${params.id}`)
      if (!res.ok) throw new Error('Property not found')
      
      const property = await res.json()
      
      // Populate form
      reset({
        title: property.title,
        description: property.description,
        type: property.type,
        status: property.status,
        price: property.price?.toString(),
        area: property.area?.toString(),
        areaUnit: property.areaUnit || 'sqft',
        bedrooms: property.bedrooms?.toString() || '0',
        bathrooms: property.bathrooms?.toString() || '0',
        floors: property.floors?.toString() || '0',
        province: property.location?.province || '',
        district: property.location?.district || '',
        city: property.location?.city || '',
        ward: property.location?.ward?.toString() || '',
        tole: property.location?.tole || '',
        features: property.features?.join(', ') || '',
      })
      
      setImages(property.images || [])
    } catch (error) {
      console.error('Error fetching property:', error)
      toast.error('Failed to load property')
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

    setIsSubmitting(true)
    
    try {
      const features = data.features 
        ? data.features.split(',').map(f => f.trim()).filter(Boolean)
        : []

      const propertyData = {
        title: data.title,
        description: data.description,
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
          tole: data.tole || undefined,
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
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch(`/api/properties/${params.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')
      
      toast.success('Property deleted successfully')
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete property')
    } finally {
      setDeleting(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isSignedIn) return null

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
            <p className="text-gray-600 mt-2">Update your property details</p>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
          >
            {deleting ? 'Deleting...' : 'Delete Property'}
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Image Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 pb-4 border-b border-gray-100 mb-4">
              <span className="text-xl">📸</span>
              <h2 className="text-lg font-semibold text-gray-900">Property Images</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input {...register('title')} className="input" />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea {...register('description')} rows={5} className="input resize-none" />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select {...register('type')} className="select">
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                  <option value="villa">Villa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select {...register('status')} className="select">
                  <option value="for-sale">For Sale</option>
                  <option value="for-rent">For Rent</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (NPR) *</label>
                <input {...register('price')} type="number" className="input" />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area *</label>
                <input {...register('area')} type="number" className="input" />
                {errors.area && <p className="mt-1 text-sm text-red-600">{errors.area.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                <select {...register('areaUnit')} className="select">
                  <option value="sqft">Sq. Ft.</option>
                  <option value="aana">Aana</option>
                  <option value="dhur">Dhur</option>
                  <option value="ropani">Ropani</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input {...register('bedrooms')} type="number" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input {...register('bathrooms')} type="number" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Floors</label>
                <input {...register('floors')} type="number" className="input" />
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
                <option value="Province 1">Province 1</option>
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
                <input {...register('district')} className="input" />
                {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input {...register('city')} className="input" />
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
                <input {...register('ward')} type="number" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tole</label>
                <input {...register('tole')} className="input" />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center space-x-2 pb-4 border-b border-gray-100">
              <span className="text-xl">✨</span>
              <h2 className="text-lg font-semibold text-gray-900">Features</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Features (comma-separated)
              </label>
              <input {...register('features')} className="input" placeholder="Mountain View, Parking, Garden" />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-medium"
            >
              Delete Property
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
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}