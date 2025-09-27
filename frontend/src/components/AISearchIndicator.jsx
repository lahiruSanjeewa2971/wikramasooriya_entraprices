import React from 'react';
import { Sparkles, Brain, Zap, AlertTriangle } from 'lucide-react';

const AISearchIndicator = ({ product, searchMetadata }) => {
  // Only show AI indicators if this is a semantic search result
  if (!searchMetadata || !searchMetadata.aiEnabled || !product.similarity) {
    return null;
  }

  const getSimilarityColor = (similarity) => {
    if (similarity >= 0.8) return 'text-green-600 bg-green-50';
    if (similarity >= 0.6) return 'text-blue-600 bg-blue-50';
    if (similarity >= 0.4) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getSimilarityLabel = (similarity) => {
    if (similarity >= 0.8) return 'Highly Relevant';
    if (similarity >= 0.6) return 'Very Relevant';
    if (similarity >= 0.4) return 'Relevant';
    return 'Somewhat Relevant';
  };

  return (
    <div className="absolute top-2 right-2 z-10">
      <div className="flex items-center space-x-1">
        {/* AI Search Badge */}
        <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium rounded-full shadow-sm">
          <Brain className="w-3 h-3" />
          <span>AI</span>
        </div>
        
        {/* Similarity Score */}
        <div className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getSimilarityColor(product.similarity)}`}>
          <Zap className="w-3 h-3" />
          <span>{Math.round(product.similarity * 100)}%</span>
        </div>
      </div>
      
      {/* Relevance Label */}
      <div className="mt-1 text-xs text-gray-600 font-medium">
        {getSimilarityLabel(product.similarity)}
      </div>
    </div>
  );
};

const SearchStatusIndicator = ({ searchMetadata }) => {
  if (!searchMetadata) return null;

  const getStatusIcon = () => {
    switch (searchMetadata.searchType) {
      case 'semantic':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'semantic_fallback':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'fallback':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (searchMetadata.searchType) {
      case 'semantic':
        return 'AI Search Active';
      case 'semantic_fallback':
        return 'AI Search (No Semantic Matches)';
      case 'fallback':
        return 'AI Search Unavailable';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (searchMetadata.searchType) {
      case 'semantic':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'semantic_fallback':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'fallback':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getStatusColor()}`}>
      {getStatusIcon()}
      <span className="text-sm font-medium">{getStatusText()}</span>
      {searchMetadata.searchMetadata && (
        <span className="text-xs text-gray-500">
          (Avg: {Math.round(searchMetadata.searchMetadata.avgSimilarity * 100)}%)
        </span>
      )}
    </div>
  );
};

export { AISearchIndicator, SearchStatusIndicator };
