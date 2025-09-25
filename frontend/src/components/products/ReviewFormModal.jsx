import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Loader2 } from 'lucide-react';
import { z } from 'zod';
import reviewService from '@/services/reviewService';
import toastService from '@/services/toastService';
import authService from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import Input from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Zod validation schema for review form
const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, "Please select a rating")
    .max(5, "Rating must be between 1 and 5"),
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters"),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(1000, "Comment must be less than 1000 characters")
});

const ReviewFormModal = ({ isOpen, onClose, productId, productName, onReviewSubmitted, reviewToEdit = null }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Initialize form with review data if editing
  useEffect(() => {
    if (reviewToEdit) {
      setFormData({
        rating: reviewToEdit.rating,
        title: reviewToEdit.title,
        comment: reviewToEdit.comment
      });
    } else {
      setFormData({
        rating: 0,
        title: '',
        comment: ''
      });
    }
    setErrors({});
  }, [reviewToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        toastService.warning("Please login to submit a review");
        navigate("/login");
        return;
      }

      // Validate form data
      const validatedData = reviewSchema.parse(formData);
      setErrors({});
      
      setIsLoading(true);
      
      let result;
      if (reviewToEdit) {
        // Update existing review
        result = await reviewService.updateReview(productId, reviewToEdit.id, validatedData);
        toastService.success("Review updated successfully!");
      } else {
        // Create new review
        result = await reviewService.createReview(productId, validatedData);
        toastService.success("Review submitted successfully! Thank you for your feedback.");
      }
      
      if (result.success) {
        onReviewSubmitted && onReviewSubmitted();
        onClose();
        // Reset form
        setFormData({ rating: 0, title: '', comment: '' });
        setErrors({});
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Validation errors
        const newErrors = {};
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      } else {
        // API errors
        toastService.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: "" }));
    }
  };

  const handleRatingHover = (rating) => {
    setHoveredRating(rating);
  };

  const handleRatingLeave = () => {
    setHoveredRating(0);
  };

  const StarRating = ({ rating, onRatingClick, onRatingHover, onRatingLeave, interactive = true }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hoveredRating || rating);
          return (
            <button
              key={star}
              type="button"
              onClick={() => interactive && onRatingClick(star)}
              onMouseEnter={() => interactive && onRatingHover(star)}
              onMouseLeave={() => interactive && onRatingLeave()}
              className={`transition-colors duration-200 ${
                interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
              }`}
              disabled={!interactive}
            >
              <Star
                className={`w-8 h-8 ${
                  isFilled ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {reviewToEdit ? 'Edit Review' : 'Write a Review'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{productName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Rating *
              </label>
              <StarRating
                rating={formData.rating}
                onRatingClick={handleRatingClick}
                onRatingHover={handleRatingHover}
                onRatingLeave={handleRatingLeave}
                interactive={true}
              />
              {errors.rating && (
                <p className="text-sm text-red-600 mt-2">{errors.rating}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title *
              </label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Give your review a title"
                className={errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/200 characters
              </p>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                rows={4}
                placeholder="Share your experience with this product. What did you like or dislike? How does it compare to your expectations?"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors resize-none ${
                  errors.comment 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-primary'
                }`}
              />
              {errors.comment && (
                <p className="text-sm text-red-600 mt-1">{errors.comment}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.comment.length}/1000 characters
              </p>
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Review Guidelines</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Be honest and specific about your experience</li>
                <li>• Focus on the product, not the seller or shipping</li>
                <li>• Avoid personal information or inappropriate language</li>
                <li>• Your review will be visible to other customers</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 flex items-center justify-center space-x-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{reviewToEdit ? 'Updating...' : 'Submitting...'}</span>
                  </>
                ) : (
                  reviewToEdit ? 'Update Review' : 'Submit Review'
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReviewFormModal;
