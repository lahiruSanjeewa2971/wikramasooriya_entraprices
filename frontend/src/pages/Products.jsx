import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Package } from 'lucide-react';

const Products = () => {
  return (
    <>
      <Helmet>
        <title>Products - Wikramasooriya Enterprises</title>
        <meta name="description" content="Browse our comprehensive catalog of industrial parts and components." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
              Our Products
            </h1>
            
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center py-12">
                <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Products page coming soon</h3>
                <p className="text-gray-600 mb-6">
                  Our comprehensive catalog of industrial parts will be available here.
                </p>
                <div className="text-sm text-gray-500">
                  <p>Categories will include:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>Bearings</div>
                    <div>Fasteners</div>
                    <div>Hydraulics</div>
                    <div>Electronics</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Products;
