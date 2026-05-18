'use client'

export default function SearchBar() {
  return (
    <div className="w-full">
      <input
        type="text"
        placeholder="Search properties..."
        className="w-full px-4 py-2 border rounded-lg"
      />
    </div>
  )
}