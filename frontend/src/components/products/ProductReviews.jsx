import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, User, Calendar, CheckCircle } from 'lucide-react';
import StarRating from './StarRating';
import ReviewFormModal from './ReviewFormModal';
import ReviewHelpfulness from './ReviewHelpfulness';
import authService from '@/services/authService';

const ProductReviews = ({ reviews, averageRating, reviewCount, productId, productName, onReviewSubmitted }) => {
  const [sortBy, setSortBy] = useState('newest');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'highest_rating':
        return b.rating - a.rating;
      case 'lowest_rating':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const ReviewCard = ({ review }) => {
    const currentUser = authService.getCurrentUser();
    const currentUserId = currentUser?.id;

    return (
      <motion.div
        className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start space-x-3 sm:space-x-4">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">
              {getInitials(review.user_name)}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Review Header - Mobile responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-2">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-semibold text-gray-900 truncate">{review.user_name}</h4>
                {review.is_verified_purchase && (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" title="Verified Purchase" />
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{formatDate(review.created_at)}</span>
              </div>
            </div>

            {/* Rating - Mobile responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-3">
              <div className="flex items-center space-x-2">
                <StarRating rating={review.rating} size="sm" />
              </div>
              <span className="text-sm text-gray-600 break-words">{review.title}</span>
            </div>

            {/* Review Content */}
            <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed break-words">{review.comment}</p>

            {/* Helpfulness Component */}
            <ReviewHelpfulness
              reviewId={review.id}
              productId={productId}
              initialHelpfulCount={review.helpful_count || 0}
              currentUserId={currentUserId}
              reviewUserId={review.user_id}
            />
          </div>
        </div>
      </motion.div>
    );
  };

  const handleReviewSubmitted = () => {
    // Call the parent component's callback to refresh reviews
    if (onReviewSubmitted) {
      onReviewSubmitted();
    }
  };

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Customer Reviews</h3>
          <div className="flex items-center space-x-4 mt-2">
            <StarRating 
              rating={averageRating} 
              size="lg" 
              showCount={true} 
              reviewCount={reviewCount} 
            />
          </div>
        </div>
        
        {/* Mobile-friendly controls */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 sm:justify-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest_rating">Highest Rating</option>
            <option value="lowest_rating">Lowest Rating</option>
          </select>
          
          <button
            onClick={() => setShowReviewForm(true)}
            className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Write a Review
          </button>
        </div>
      </div>

      {/* Review Form Modal */}
      <ReviewFormModal
        isOpen={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        productId={productId}
        productName={productName}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.length > 0 ? (
          sortedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
