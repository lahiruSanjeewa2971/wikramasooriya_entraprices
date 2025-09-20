import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, size = 'md', showCount = false, reviewCount = 0, interactive = false, onRatingChange }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const handleStarClick = (starRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      let starClass = 'text-gray-300';
      
      if (i <= fullStars) {
        starClass = 'text-yellow-400';
      } else if (i === fullStars + 1 && hasHalfStar) {
        starClass = 'text-yellow-400';
      }

      stars.push(
        <Star
          key={i}
          className={`${sizeClasses[size]} ${starClass} ${
            interactive ? 'cursor-pointer hover:scale-110 transition-transform duration-200' : ''
          }`}
          fill={i <= fullStars || (i === fullStars + 1 && hasHalfStar) ? 'currentColor' : 'none'}
          onClick={() => handleStarClick(i)}
        />
      );
    }

    return stars;
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex">
        {renderStars()}
      </div>
      {showCount && (
        <span className="text-sm text-gray-600 ml-2">
          ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
        </span>
      )}
    </div>
  );
};

export default StarRating;
