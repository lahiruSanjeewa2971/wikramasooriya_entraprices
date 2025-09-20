import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductImageGallery = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Debug logging
  console.log('🔍 ProductImageGallery received images:', images);
  console.log('🔍 ProductImageGallery received productName:', productName);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
            📷
          </div>
          <p>No images available</p>
        </div>
      </div>
    );
  }

  const handleImageSelect = (index) => {
    setSelectedImage(index);
  };

  const handleNext = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg group">
        <motion.img
          src={images[selectedImage]?.image_url || images[selectedImage]}
          alt={images[selectedImage]?.alt_text || productName || 'Product'}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isZoomed ? 'scale-150' : 'group-hover:scale-105'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Zoom Button */}
        <motion.button
          onClick={handleZoom}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ZoomIn className="w-5 h-5" />
        </motion.button>

        {/* Navigation Arrows (if multiple images) */}
        {images.length > 1 && (
          <>
            <motion.button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {selectedImage + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Images */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <motion.button
              key={index}
              onClick={() => handleImageSelect(index)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                selectedImage === index 
                  ? 'border-primary shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={image?.image_url || image}
                alt={image?.alt_text || `${productName} view ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
