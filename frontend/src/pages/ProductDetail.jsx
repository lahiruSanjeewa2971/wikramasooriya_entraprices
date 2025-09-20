import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Loader2 } from 'lucide-react';
import productService from '@/services/productService';
import toastService from '@/services/toastService';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import ProductInfo from '@/components/products/ProductInfo';
import ProductReviews from '@/components/products/ProductReviews';
import RelatedProducts from '@/components/products/RelatedProducts';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading product details for ID:', id);
      const response = await productService.getProductDetails(id);
      
      console.log('📦 Product details response:', response);
      console.log('📦 Product data:', response.data);
      console.log('📦 Product data.product:', response.data?.product);
      console.log('📦 Product images:', response.data?.product?.images);
      console.log('📦 Product name:', response.data?.product?.name);
      
      if (response.success && response.data && response.data.product) {
        setProduct(response.data.product);
        console.log('✅ Product loaded successfully:', response.data.product);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error loading product details:', error);
      setError(error.message);
      toastService.show(error.message || 'Failed to load product details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProductDetails();
    }
  }, [id]);

  const handleAddToCart = () => {
    // This will be called from ProductInfo component
    // Could be used for additional cart-related actions
  };

  const handleReviewSubmitted = () => {
    // Refresh product details to get updated reviews
    if (id) {
      loadProductDetails();
    }
  };

  // Helper function to get the best available images
  const getProductImages = (product) => {
    if (!product) return [];
    
    console.log('🔍 getProductImages - product.images:', product.images);
    console.log('🔍 getProductImages - product.image_url:', product.image_url);
    
    // If images array exists and doesn't contain placeholder URLs, use it
    if (product.images && product.images.length > 0) {
      const hasRealImages = product.images.some(img => 
        img.image_url && !img.image_url.includes('placeholder') && !img.image_url.includes('via.placeholder')
      );
      
      console.log('🔍 getProductImages - hasRealImages:', hasRealImages);
      
      if (hasRealImages) {
        console.log('🔍 getProductImages - Using images array:', product.images);
        return product.images;
      }
    }
    
    // Fallback to main product image_url
    if (product.image_url) {
      const fallbackImage = [{
        image_url: product.image_url,
        alt_text: product.name || 'Product Image',
        is_primary: true,
        sort_order: 0
      }];
      console.log('🔍 getProductImages - Using fallback image_url:', fallbackImage);
      return fallbackImage;
    }
    
    console.log('🔍 getProductImages - No images found');
    return [];
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading Product - Wikramasooriya Enterprises</title>
        </Helmet>
        
        <div className="min-h-screen bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Product Details</h3>
                  <p className="text-gray-600">Please wait while we fetch the product information...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Product Not Found - Wikramasooriya Enterprises</title>
        </Helmet>
        
        <div className="min-h-screen bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center py-12">
                  <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h3>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <div className="text-sm text-gray-500">
                    <p>Product ID: {id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product?.name || 'Product Details'} - Wikramasooriya Enterprises</title>
        <meta name="description" content={product?.description || 'View detailed information about our industrial parts and components.'} />
      </Helmet>
      
      <motion.div 
        className="min-h-screen bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Product Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Products</span>
              <span>/</span>
              <span>{product?.category_name}</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">{product?.name}</span>
            </div>
          </div>
        </div>

        {/* Main Product Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <ProductImageGallery 
                images={getProductImages(product)} 
                productName={product?.name}
              />
            </motion.div>
            
            {/* Product Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ProductInfo 
                product={product}
                onAddToCart={handleAddToCart}
              />
            </motion.div>
          </div>

          {/* Product Reviews */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-white rounded-lg shadow-sm p-8">
              <ProductReviews 
                reviews={product?.recent_reviews || []}
                averageRating={product?.average_rating || 0}
                reviewCount={product?.review_count || 0}
                productId={product?.id}
                productName={product?.name}
                onReviewSubmitted={handleReviewSubmitted}
              />
            </div>
          </motion.div>

          {/* Related Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="bg-white rounded-lg shadow-sm p-8">
              <RelatedProducts 
                products={product?.related_products || []}
                title="Related Products"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default ProductDetail;
