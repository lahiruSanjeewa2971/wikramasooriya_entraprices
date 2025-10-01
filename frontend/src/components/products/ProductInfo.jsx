import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import StarRating from './StarRating';
import cartService from '@/services/cartService';
import authService from '@/services/authService';
import toastService from '@/services/toastService';
import { useNavigate } from 'react-router-dom';

const ProductInfo = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Debug logging
  console.log('🔍 ProductInfo received product:', product);
  console.log('🔍 Product name:', product?.name);
  console.log('🔍 Product price:', product?.price);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product?.stock_qty) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    try {
      if (!authService.isAuthenticated()) {
        toastService.show("Please login to add items to cart", "warning");
        navigate("/login");
        return;
      }

      setIsAddingToCart(true);
      await cartService.addToCart(product.id, quantity);
      toastService.show("Item added to cart successfully!", "success");
      
      if (onAddToCart) {
        onAddToCart();
      }
    } catch (error) {
      toastService.show(error.message || "Failed to add item to cart", "error");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toastService.show(
      isWishlisted ? "Removed from wishlist" : "Added to wishlist", 
      "success"
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toastService.show("Link copied to clipboard", "success");
    }
  };

  const stockStatus = () => {
    if (product?.stock_qty === 0) {
      return { text: "Out of Stock", color: "text-red-600", bg: "bg-red-50" };
    } else if (product?.stock_qty <= 5) {
      return { text: `Only ${product.stock_qty} left`, color: "text-orange-600", bg: "bg-orange-50" };
    } else {
      return { text: "In Stock", color: "text-green-600", bg: "bg-green-50" };
    }
  };

  const stock = stockStatus();

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Product Title & Category */}
      <div>
        <div className="text-sm text-gray-500 mb-2">{product?.category_name}</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{product?.name}</h1>
        
        {/* Rating */}
        <div className="flex items-center space-x-4 mb-4">
          <StarRating 
            rating={product?.average_rating || 0} 
            size="lg" 
            showCount={true} 
            reviewCount={product?.review_count || 0} 
          />
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center space-x-4">
        <span className="text-4xl font-bold text-primary">
          {formatPrice(product?.price)}
        </span>
        {product?.new_arrival && (
          <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
            New Arrival
          </span>
        )}
        {product?.featured && (
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            Featured
          </span>
        )}
      </div>

      {/* Stock Status */}
      <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${stock.bg} ${stock.color}`}>
        <div className={`w-2 h-2 rounded-full mr-2 ${stock.color.replace('text-', 'bg-')}`}></div>
        {stock.text}
      </div>

      {/* Short Description */}
      {product?.short_description && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 mb-1">
                Quick Overview
              </h3>
              <p className="text-sm text-blue-700 leading-relaxed">
                {product.short_description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
        {product?.description}
      </div>

      {/* Quantity & Add to Cart */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Quantity:</label>
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= product?.stock_qty}
              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex space-x-3">
          <motion.button
            onClick={handleAddToCart}
            disabled={isAddingToCart || product?.stock_qty === 0}
            className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isAddingToCart ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </>
            )}
          </motion.button>

          <motion.button
            onClick={handleWishlist}
            className={`p-3 rounded-lg border-2 transition-colors ${
              isWishlisted 
                ? 'border-red-500 text-red-500 bg-red-50' 
                : 'border-gray-300 text-gray-500 hover:border-red-500 hover:text-red-500'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </motion.button>

          <motion.button
            onClick={handleShare}
            className="p-3 rounded-lg border-2 border-gray-300 text-gray-500 hover:border-primary hover:text-primary transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Product Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Truck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Free Shipping</div>
            <div className="text-xs text-gray-500">On orders over $100</div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Warranty</div>
            <div className="text-xs text-gray-500">1 year manufacturer</div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <RotateCcw className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Returns</div>
            <div className="text-xs text-gray-500">30 day return policy</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductInfo;
