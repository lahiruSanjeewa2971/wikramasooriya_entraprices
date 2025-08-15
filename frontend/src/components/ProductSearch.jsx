import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import productService from '../services/productService';
import toastService from '../services/toastService';

const ProductSearch = ({ onSearchResults, placeholder = "Search products..." }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      // Clear search mode and fetch fresh data with current filters
      setHasSearched(false);
      onSearchResults(null, ''); // This will trigger loadProducts() in parent
      toastService.show('Search cleared, showing all products', 'info');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await productService.searchProducts(searchQuery.trim());
      
      if (response.success && response.data.products) {
        onSearchResults(response.data.products, searchQuery.trim());
        toastService.show(`Found ${response.data.products.length} products for "${searchQuery.trim()}"`, 'success');
      } else {
        onSearchResults([], searchQuery.trim());
        toastService.show('No products found for your search', 'info');
      }
    } catch (error) {
      console.error('Search error:', error);
      toastService.show('Search failed. Please try again.', 'error');
      onSearchResults([], searchQuery.trim());
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setHasSearched(false);
    // Clear search mode and fetch fresh data with current filters
    onSearchResults(null, '');
    toastService.show('Search cleared, showing all products', 'info');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full pl-10 pr-12 py-2 border border-input-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-background text-foreground"
            disabled={isSearching}
          />
          
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isSearching}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {hasSearched && searchQuery && (
        <div className="mt-2 text-sm text-muted-foreground">
          Search results for: <span className="font-medium text-foreground">"{searchQuery}"</span>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
