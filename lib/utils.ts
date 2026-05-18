export function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `रु ${(price / 10000000).toFixed(2)} करोड`
  } else if (price >= 100000) {
    return `रु ${(price / 100000).toFixed(2)} लाख`
  }
  return `रु ${price.toLocaleString('en-IN')}`
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatArea(area: number, unit: string): string {
  return `${area} ${unit}`
}

export function getStatusColor(status: string): string {
  const colors = {
    'for-sale': 'bg-green-100 text-green-800',
    'for-rent': 'bg-blue-100 text-blue-800',
    'sold': 'bg-red-100 text-red-800',
    'rented': 'bg-yellow-100 text-yellow-800',
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export function generatePropertyTitle(type: string, location: string): string {
  const typeLabels: { [key: string]: string } = {
    house: 'House',
    apartment: 'Apartment',
    land: 'Land',
    commercial: 'Commercial Property',
    villa: 'Villa',
  }
  return `${typeLabels[type] || 'Property'} in ${location}`
}