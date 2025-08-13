import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { Package } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();

  return (
    <>
      <Helmet>
        <title>Product Details - Wikramasooriya Enterprises</title>
        <meta name="description" content="View detailed information about our industrial parts and components." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
              Product Details
            </h1>
            
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center py-12">
                <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Product page coming soon</h3>
                <p className="text-gray-600 mb-6">
                  Detailed product information will be displayed here.
                </p>
                <div className="text-sm text-gray-500">
                  <p>Product ID: {id}</p>
                  <p>Features, specifications, and pricing will be shown here.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
