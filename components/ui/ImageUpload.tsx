'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  value: Array<{ url: string; publicId: string }>
  onChange: (images: Array<{ url: string; publicId: string }>) => void
  maxFiles?: number
}

export default function ImageUpload({ value = [], onChange, maxFiles = 5 }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (value.length + acceptedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`)
      return
    }

    setIsUploading(true)
    const uploadPromises = acceptedFiles.map(async (file) => {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Upload failed')
      }

      return await res.json()
    })

    try {
      const results = await Promise.all(uploadPromises)
      const newImages = results.map(r => ({ url: r.url, publicId: r.publicId }))
      onChange([...value, ...newImages])
      toast.success('Images uploaded successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload images')
    } finally {
      setIsUploading(false)
    }
  }, [value, maxFiles, onChange])

  const removeImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: maxFiles - value.length,
    disabled: isUploading || value.length >= maxFiles,
  })

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Property Images ({value.length}/{maxFiles})
      </label>

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {value.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={image.url}
                  alt={`Property image ${index + 1}`}
                  width={400}
                  height={300}
                  className="object-cover w-full h-full"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                ✕
              </button>
              {index === 0 && (
                <span className="absolute bottom-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                  Main Image
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {value.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-600">Uploading...</p>
              </>
            ) : (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600">
                  {isDragActive
                    ? 'Drop images here...'
                    : 'Drag & drop images here, or click to select'}
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WebP up to 5MB each
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}