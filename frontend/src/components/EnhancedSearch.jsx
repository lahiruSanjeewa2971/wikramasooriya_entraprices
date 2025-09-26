import React, { useState } from 'react';
import { Search, X, Sparkles, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import productService from '../services/productService';
import toastService from '../services/toastService';

const EnhancedSearch = ({ onSearchResults, placeholder = "Search products..." }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isAISearchEnabled, setIsAISearchEnabled] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      // Clear search mode and fetch fresh data with current filters
      setHasSearched(false);
      onSearchResults(null, '', false); // This will trigger loadProducts() in parent
      toastService.show('Search cleared, showing all products', 'info');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      let response;
      
      if (isAISearchEnabled) {
        // Use semantic search (when backend is ready)
        response = await productService.semanticSearch(searchQuery.trim());
        toastService.show(`🧠 AI Search: Found ${response.data.products.length} semantically relevant products for "${searchQuery.trim()}"`, 'success');
      } else {
        // Use regular search
        response = await productService.searchProducts(searchQuery.trim());
        toastService.show(`Found ${response.data.products.length} products for "${searchQuery.trim()}"`, 'success');
      }
      
      if (response.success && response.data.products) {
        onSearchResults(response.data.products, searchQuery.trim(), isAISearchEnabled);
      } else {
        onSearchResults([], searchQuery.trim(), isAISearchEnabled);
        toastService.show('No products found for your search', 'info');
      }
    } catch (error) {
      console.error('Search error:', error);
      
      // If AI search fails, fall back to regular search
      if (isAISearchEnabled) {
        toastService.show('AI search unavailable, using regular search...', 'warning');
        try {
          const fallbackResponse = await productService.searchProducts(searchQuery.trim());
          if (fallbackResponse.success && fallbackResponse.data.products) {
            onSearchResults(fallbackResponse.data.products, searchQuery.trim(), false);
            toastService.show(`Found ${fallbackResponse.data.products.length} products for "${searchQuery.trim()}"`, 'success');
          } else {
            onSearchResults([], searchQuery.trim(), false);
            toastService.show('No products found for your search', 'info');
          }
        } catch (fallbackError) {
          toastService.show('Search failed. Please try again.', 'error');
          onSearchResults([], searchQuery.trim(), false);
        }
      } else {
        toastService.show('Search failed. Please try again.', 'error');
        onSearchResults([], searchQuery.trim(), false);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setHasSearched(false);
    // Clear search mode and fetch fresh data with current filters
    onSearchResults(null, '', false);
    toastService.show('Search cleared, showing all products', 'info');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const handleAIToggle = (checked) => {
    setIsAISearchEnabled(checked);
    if (checked) {
      toastService.show('🧠 AI Search enabled - Find products by meaning, not just keywords!', 'info');
    } else {
      toastService.show('Regular search enabled', 'info');
    }
  };

  return (
    <div className="space-y-3">
      {/* Compact Search Bar with AI Toggle */}
      <div className="relative">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="w-full pl-11 pr-24 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 shadow-sm hover:shadow-md text-sm"
              disabled={isSearching}
            />
            
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-16 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isSearching}
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Search'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Compact AI Toggle */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="flex items-center space-x-2">
          <Sparkles className={`w-4 h-4 transition-colors ${isAISearchEnabled ? 'text-blue-600' : 'text-gray-400'}`} />
          <span className={`text-sm font-medium transition-colors ${isAISearchEnabled ? 'text-blue-700' : 'text-gray-600'}`}>
            AI Search
          </span>
          <span className="text-xs text-gray-500">
            {isAISearchEnabled ? 'Smart matching' : 'Keyword only'}
          </span>
        </div>
        
        <Switch
          checked={isAISearchEnabled}
          onCheckedChange={handleAIToggle}
          className="data-[state=checked]:bg-blue-600"
        />
      </div>

      {/* Search Status - Compact */}
      {hasSearched && searchQuery && (
        <div className="flex items-center space-x-2 text-xs">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isAISearchEnabled 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {isAISearchEnabled ? 'AI' : 'Regular'}
          </div>
          <span className="text-gray-600">
            Results for: <span className="font-medium text-gray-900">"{searchQuery}"</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearch;
