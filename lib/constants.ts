export const PROVINCES = [
  'Province 1',
  'Madhesh Province',
  'Bagmati Province',
  'Gandaki Province',
  'Lumbini Province',
  'Karnali Province',
  'Sudurpashchim Province',
]

export const DISTRICTS: { [key: string]: string[] } = {
  'Bagmati Province': [
    'Kathmandu', 'Bhaktapur', 'Lalitpur', 'Kavrepalanchok',
    'Dhading', 'Nuwakot', 'Rasuwa', 'Sindhupalchok',
    'Dolakha', 'Ramechhap', 'Sindhuli', 'Makwanpur', 'Chitwan'
  ],
  'Province 1': [
    'Jhapa', 'Ilam', 'Panchthar', 'Taplejung', 'Morang',
    'Sunsari', 'Dhankuta', 'Sankhuwasabha', 'Bhojpur',
    'Terhathum', 'Okhaldhunga', 'Khotang', 'Solukhumbu', 'Udayapur'
  ],
  // Add more districts for other provinces
}

export const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'villa', label: 'Villa' },
]

export const PROPERTY_STATUS = [
  { value: 'for-sale', label: 'For Sale' },
  { value: 'for-rent', label: 'For Rent' },
  { value: 'sold', label: 'Sold' },
  { value: 'rented', label: 'Rented' },
]

export const AREA_UNITS = [
  { value: 'sqft', label: 'Sq. Ft.' },
  { value: 'aana', label: 'Aana' },
  { value: 'dhur', label: 'Dhur' },
  { value: 'ropani', label: 'Ropani' },
  { value: 'bigha', label: 'Bigha' },
  { value: 'kattha', label: 'Kattha' },
]

export const AMENITIES = [
  'Parking', 'Garden', 'Security', 'Gym', 'Swimming Pool',
  'Elevator', 'Power Backup', 'Water Supply', 'Internet',
  'Cable TV', 'Furnished', 'Balcony', 'Terrace', 'Storage'
]

export const FEATURES = [
  'Mountain View', 'City View', 'Road Access', 'Corner Plot',
  'New Construction', 'Renovated', 'Earthquake Resistant',
  'Solar System', 'Rainwater Harvesting', 'Wheelchair Accessible'
]

export const NEPAL_CITIES = [
  'Kathmandu', 'Pokhara', 'Lalitpur', 'Bhaktapur', 'Chitwan',
  'Biratnagar', 'Birgunj', 'Butwal', 'Dharan', 'Hetauda',
  'Janakpur', 'Nepalgunj', 'Dhulikhel', 'Banepa', 'Panauti'
]