import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found - Wikramasooriya Enterprises</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <div className="h-24 w-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home className="h-12 w-12 text-white" />
            </div>
            
            <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
            <p className="text-gray-600">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Home
            </Link>
            
            <div className="text-sm text-gray-500">
              <p>Or try one of these pages:</p>
              <div className="flex justify-center gap-4 mt-2">
                <Link to="/products" className="text-primary hover:text-primary-hover">
                  Products
                </Link>
                <Link to="/about" className="text-primary hover:text-primary-hover">
                  About
                </Link>
                <Link to="/contact" className="text-primary hover:text-primary-hover">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
