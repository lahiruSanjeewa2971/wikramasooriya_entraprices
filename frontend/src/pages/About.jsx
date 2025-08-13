const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Wikramasooriya Enterprises</h1>
          <p className="text-xl text-gray-600">Your trusted partner for quality and excellence</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Story</h2>
          <p className="text-gray-600 mb-4">
            Founded with a vision to provide exceptional products and services, Wikramasooriya Enterprises 
            has been serving our customers with dedication and commitment since our establishment. 
            We believe in building lasting relationships through trust, quality, and innovation.
          </p>
          <p className="text-gray-600">
            Our mission is to deliver superior value to our customers while maintaining the highest 
            standards of business ethics and customer satisfaction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">✓</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality</h3>
            <p className="text-gray-600">We never compromise on quality in any of our products or services.</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">🤝</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Trust</h3>
            <p className="text-gray-600">Building lasting relationships through transparency and reliability.</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">💡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Innovation</h3>
            <p className="text-gray-600">Continuously improving and adapting to meet customer needs.</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Choose Us?</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              <span>Extensive product range with carefully curated selections</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              <span>Competitive pricing and value for money</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              <span>Exceptional customer service and support</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              <span>Fast and reliable delivery services</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              <span>Secure and convenient online shopping experience</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default About
