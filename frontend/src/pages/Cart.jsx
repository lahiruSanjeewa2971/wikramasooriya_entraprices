import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ShoppingCart } from 'lucide-react';

const Cart = () => {
  return (
    <>
      <Helmet>
        <title>Shopping Cart - Wikramasooriya Enterprises</title>
        <meta name="description" content="View and manage your shopping cart items." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
              Shopping Cart
            </h1>
            
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center py-12">
                <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-6">
                  Start shopping to add items to your cart.
                </p>
                <a 
                  href="/products" 
                  className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Browse Products
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
