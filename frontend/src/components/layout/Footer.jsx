import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="ml-2 text-xl font-bold">Wikramasooriya Enterprises</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Your trusted partner for quality products and exceptional service. 
              We are committed to delivering excellence in everything we do.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <MapPin className="h-4 w-4 mr-2" />
                <span>123 Business St, Colombo, Sri Lanka</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="h-4 w-4 mr-2" />
                <span>+94 11 234 5678</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Mail className="h-4 w-4 mr-2" />
                <span>info@wikramasooriya.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Wikramasooriya Enterprises. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
