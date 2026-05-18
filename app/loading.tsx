export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 bg-white rounded-full"></div>
          </div>
        </div>
        <p className="mt-6 text-gray-600 text-lg font-medium">Loading...</p>
      </div>
    </div>
  )
}