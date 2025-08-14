import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

const Footer = () => {
  const [contactForm, setContactForm] = useState({
    email: '',
    title: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    console.log('Contact form submitted:', contactForm);
    
    setTimeout(() => {
      setContactForm({ email: '', title: '', message: '' });
      setIsSubmitting(false);
      // TODO: Add success message or redirect
    }, 1000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <footer className="bg-gray-900 text-white border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">
              Wikramasooriya Enterprises
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted partner for high-quality industrial spare parts and equipment. 
              Serving businesses across Sri Lanka with reliable solutions and expert support.
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Colombo, Sri Lanka</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+94 71 234 5678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@wikramasooriya.com</span>
              </div>
            </div>
          </div>

          {/* Site Map */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Site Map</h3>
            <nav className="space-y-2">
              <Link 
                to="/" 
                className="block text-sm text-gray-300 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className="block text-sm text-gray-300 hover:text-white transition-colors"
              >
                About Us
              </Link>
              <Link 
                to="/products" 
                className="block text-sm text-gray-300 hover:text-white transition-colors"
              >
                Products
              </Link>
              <Link 
                to="/contact" 
                className="block text-sm text-gray-300 hover:text-white transition-colors"
              >
                Contact
              </Link>
            </nav>
            
            <div className="pt-4">
              <h4 className="text-sm font-medium text-white mb-2">Quick Links</h4>
              <div className="space-y-1">
                <Link 
                  to="/cart" 
                  className="block text-xs text-gray-300 hover:text-white transition-colors"
                >
                  Shopping Cart
                </Link>
                <Link 
                  to="/login" 
                  className="block text-xs text-gray-300 hover:text-white transition-colors"
                >
                  Customer Login
                </Link>
                <Link 
                  to="/register" 
                  className="block text-xs text-gray-300 hover:text-white transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Get In Touch</h3>
            <form onSubmit={handleContactSubmit} className="space-y-3">
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={contactForm.email}
                onChange={handleInputChange}
                placeholder="your.email@company.com"
                required
                className="h-9"
              />
              <Input
                label="Subject"
                name="title"
                type="text"
                value={contactForm.title}
                onChange={handleInputChange}
                placeholder="How can we help?"
                required
                className="h-9"
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Message
                </label>
                <textarea
                  name="message"
                  value={contactForm.message}
                  onChange={handleInputChange}
                  placeholder="Tell us about your requirements..."
                  required
                  rows={3}
                  className="flex w-full rounded-md border border-gray-600 bg-gray-800 text-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
              <Button 
                type="submit" 
                size="sm" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              © 2025 Wikramasooriya Enterprises. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link 
                to="/privacy" 
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
