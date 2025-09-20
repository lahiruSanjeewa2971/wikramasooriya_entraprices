import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';

const RelatedProducts = ({ products, title = "Related Products" }) => {
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const ProductCard = ({ product, index }) => (
    <motion.div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <div 
        className="relative aspect-square overflow-hidden cursor-pointer"
        onClick={() => handleProductClick(product.id)}
      >
        <img
          src={product.image_url || "https://via.placeholder.com/300x300?text=Product"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Quick Add to Cart */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-primary p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Stock Status */}
        {product.stock_qty === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 
          className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors cursor-pointer"
          onClick={() => handleProductClick(product.id)}
        >
          {product.name}
        </h3>
        
        <div className="flex items-center space-x-2 mb-2">
          <StarRating rating={product.average_rating || 0} size="sm" />
          <span className="text-sm text-gray-600">
            ({product.review_count || 0})
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          
          <div className="text-sm text-gray-500">
            SKU: {product.sku}
          </div>
        </div>

        {/* Stock Status */}
        <div className="mt-2">
          {product.stock_qty > 0 ? (
            <span className="text-sm text-green-600 font-medium">
              ✓ In Stock ({product.stock_qty})
            </span>
          ) : (
            <span className="text-sm text-red-600 font-medium">
              ✗ Out of Stock
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        <div className="text-sm text-gray-500">
          {products.length} product{products.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
