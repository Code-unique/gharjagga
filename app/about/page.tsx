import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Nepal Real Estate</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted partner in finding the perfect property across Nepal
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To revolutionize the real estate industry in Nepal by providing a transparent, 
              efficient, and user-friendly platform that connects property seekers with their 
              dream homes and investments.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              To become Nepal's most trusted real estate platform, empowering people to make 
              informed decisions about their property investments while contributing to the 
              country's sustainable urban development.
            </p>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '✅',
                title: 'Verified Properties',
                description: 'All properties are verified by our team to ensure accuracy and authenticity.'
              },
              {
                icon: '💰',
                title: 'Best Prices',
                description: 'We help you find the best deals with competitive pricing across all property types.'
              },
              {
                icon: '🤝',
                title: 'Trusted Service',
                description: 'Years of experience in Nepal\'s real estate market with thousands of satisfied clients.'
              },
              {
                icon: '📍',
                title: 'Pan Nepal Coverage',
                description: 'Properties available across all 7 provinces and major cities of Nepal.'
              },
              {
                icon: '📱',
                title: 'Easy to Use',
                description: 'Modern, user-friendly platform designed for seamless property search experience.'
              },
              {
                icon: '🔒',
                title: 'Secure Platform',
                description: 'Your data and transactions are protected with enterprise-grade security.'
              }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Team</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            Dedicated professionals committed to helping you find the perfect property
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((member) => (
              <div key={member} className="bg-white rounded-xl shadow-sm p-6">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900">Team Member {member}</h3>
                <p className="text-gray-600">Real Estate Expert</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}