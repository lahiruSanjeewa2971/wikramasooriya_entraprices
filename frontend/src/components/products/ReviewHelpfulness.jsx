import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp } from 'lucide-react';
import reviewService from '@/services/reviewService';
import authService from '@/services/authService';
import toastService from '@/services/toastService';

const ReviewHelpfulness = ({ reviewId, productId, initialHelpfulCount, currentUserId, reviewUserId }) => {
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false); // Track if user has voted

  // Debug logging
  console.log('ReviewHelpfulness props:', { reviewId, productId, initialHelpfulCount, currentUserId, reviewUserId });
  console.log('ReviewHelpfulness state:', { helpfulCount, isLoading, hasVoted });

  // Check if user can vote (not their own review and is authenticated)
  const canVote = authService.isAuthenticated() && currentUserId !== reviewUserId;

  // Load user's vote status when component mounts or when user changes
  useEffect(() => {
    if (canVote) {
      loadUserVoteStatus();
    }
  }, [reviewId, canVote]);

  const loadUserVoteStatus = async () => {
    try {
      const response = await reviewService.getUserVoteStatus(reviewId);
      if (response.data) {
        setHasVoted(response.data.hasVoted);
        console.log('Loaded vote status:', response.data);
      }
    } catch (error) {
      console.error('Failed to load vote status:', error);
      // Don't show error to user, just assume no vote
      setHasVoted(false);
    }
  };

  const handleVote = async () => {
    if (!canVote) {
      toastService.warning('Please login to vote on reviews');
      return;
    }

    try {
      setIsLoading(true);
      
      // Toggle vote - if user has voted, remove vote; if not voted, add vote
      const response = await reviewService.markHelpful(productId, reviewId, true);
      console.log('Vote response:', response);
      setHelpfulCount(response.data.helpfulCount);
      setHasVoted(!hasVoted); // Toggle vote state
      
      if (hasVoted) {
        toastService.success('Vote removed');
      } else {
        toastService.success('Review marked as helpful');
      }
    } catch (error) {
      console.error('Failed to vote:', error);
      toastService.error(error.message || 'Failed to update vote');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonClasses = () => {
    const baseClasses = "flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    
    if (!canVote) {
      return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed`;
    }
    
    if (isLoading) {
      return `${baseClasses} bg-gray-100 text-gray-500 cursor-wait`;
    }
    
    // User can vote - show different styles based on vote state
    if (hasVoted) {
      return `${baseClasses} bg-green-100 text-green-700 border border-green-200 hover:bg-green-200`;
    }
    
    return `${baseClasses} bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800`;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
      {/* Helpful Button */}
      <motion.button
        onClick={handleVote}
        disabled={!canVote || isLoading}
        className={`${getButtonClasses()} w-full sm:w-auto`}
        whileHover={canVote && !isLoading ? { scale: 1.05 } : {}}
        whileTap={canVote && !isLoading ? { scale: 0.95 } : {}}
      >
        <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'text-green-600' : ''}`} />
        <span className="text-sm">{hasVoted ? 'Voted Helpful' : 'Helpful'}</span>
      </motion.button>

      {/* Helpful Count */}
      <motion.span 
        className="text-xs sm:text-sm text-gray-600 text-center sm:text-left"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        key={helpfulCount} // Force re-render when count changes
      >
        {helpfulCount === 0 
          ? "No votes yet" 
          : `${helpfulCount} ${helpfulCount === 1 ? 'person' : 'people'} found this helpful`
        }
      </motion.span>

      {/* Loading Spinner */}
      {isLoading && (
        <motion.div
          className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin mx-auto sm:mx-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </div>
  );
};

export default ReviewHelpfulness;
