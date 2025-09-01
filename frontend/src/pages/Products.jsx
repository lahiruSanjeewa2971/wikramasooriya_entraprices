import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Filter, ShoppingCart, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductSearch from "@/components/ProductSearch";
import productService from "@/services/productService";
import cartService from "@/services/cartService";
import authService from "@/services/authService";
import toastService from "@/services/toastService";
import { useNavigate } from "react-router-dom";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState({});

  // Load products on component mount
  useEffect(() => {
    loadProducts();
    loadCategories();
    if (authService.isAuthenticated()) {
      loadCartCount();
    }
  }, [sortBy, sortOrder]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      if (authService.isAuthenticated()) {
        loadCartCount();
      }
    };

    window.addEventListener('cart:updated', handleCartUpdate);
    return () => window.removeEventListener('cart:updated', handleCartUpdate);
  }, []);

  const loadCategories = async () => {
    try {
      const response = await productService.getCategories();
      if (response.success && response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      toastService.show("Failed to load categories", "error");
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const filters = {
        category: selectedCategory || undefined,
        sortBy,
        sortOrder
      };
      
      const response = await productService.getProducts(filters);
      
      if (response.success && response.data.products) {
        setProducts(response.data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      toastService.show("Failed to load products", "error");
      console.error("Error loading products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCartCount = async () => {
    try {
      const count = await cartService.getCartItemCount();
      setCartCount(count);
    } catch (error) {
      console.error("Error loading cart count:", error);
      setCartCount(0);
    }
  };

  const handleSearchResults = async (searchResults, query) => {
    if (searchResults === null) {
      // Clear search mode and fetch fresh data with current filters
      setIsSearchMode(false);
      setSearchQuery("");
      setSearchLoading(true);
      
      try {
        // Fetch fresh products with current category and sorting filters
        const filters = {
          category: selectedCategory || undefined,
          sortBy,
          sortOrder
        };
        
        const response = await productService.getProducts(filters);
        
        if (response.success && response.data.products) {
          setProducts(response.data.products);
        } else {
          setProducts([]);
        }
        
        toastService.show('Showing all products with current filters', 'info');
      } catch (error) {
        console.error('Error loading products after search clear:', error);
        toastService.show('Failed to load products. Please try again.', 'error');
      } finally {
        setSearchLoading(false);
      }
    } else {
      // Show search results - but filter by current category if one is selected
      setIsSearchMode(true);
      setSearchQuery(query);
      
      if (selectedCategory) {
        // Filter search results by current category
        const filteredResults = searchResults.filter(product => 
          product.category_id === parseInt(selectedCategory)
        );
        setProducts(filteredResults);
        
        if (filteredResults.length !== searchResults.length) {
          toastService.show(`Found ${filteredResults.length} products in "${categories.find(c => c.id === parseInt(selectedCategory))?.name}" category for "${query}"`, 'info');
        }
      } else {
        setProducts(searchResults);
      }
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        toastService.show("Please login to add items to cart", "warning");
        navigate("/login");
        return;
      }

      // Set loading state for this specific product
      setAddingToCart(prev => ({ ...prev, [productId]: true }));

      await cartService.addToCart(productId, 1);
      toastService.show("Item added to cart successfully!", "success");
      
      // Update cart count immediately
      await loadCartCount();
    } catch (error) {
      toastService.show(error.message || "Failed to add item to cart", "error");
    } finally {
      // Clear loading state for this product
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Removed handleProductClick function - no single product view needed

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSortBy("created_at");
    setSortOrder("desc");
    setIsSearchMode(false);
    setSearchLoading(false);
    loadProducts();
    toastService.show('All filters cleared, showing all products', 'info');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleCategoryChange = async (categoryId) => {
    // Convert empty string to undefined for "All Categories" selection
    const actualCategoryId = categoryId === "" ? undefined : categoryId;
    setSelectedCategory(categoryId); // Keep the UI state as empty string for the select element
    
    if (isSearchMode) {
      // If in search mode, re-apply search with new category filter
      try {
        const response = await productService.searchProducts(searchQuery);
        if (response.success && response.data.products) {
          if (actualCategoryId) {
            // Filter search results by new category
            const filteredResults = response.data.products.filter(product => 
              product.category_id === parseInt(actualCategoryId)
            );
            setProducts(filteredResults);
            toastService.show(`Showing ${filteredResults.length} products in "${categories.find(c => c.id === parseInt(actualCategoryId))?.name}" category for "${searchQuery}"`, 'info');
          } else {
            // Show all search results when no category is selected
            setProducts(response.data.products);
            toastService.show(`Showing all ${response.data.products.length} search results for "${searchQuery}"`, 'info');
          }
        }
      } catch (error) {
        console.error('Error filtering search results by category:', error);
        toastService.show('Failed to filter search results by category', 'error');
      }
    } else {
      // If not in search mode, load products with new category filter
      try {
        setLoading(true);
        const filters = {
          category: actualCategoryId,
          sortBy,
          sortOrder
        };
        
        const response = await productService.getProducts(filters);
        
        if (response.success && response.data.products) {
          setProducts(response.data.products);
          if (actualCategoryId) {
            const categoryName = categories.find(c => c.id === parseInt(actualCategoryId))?.name;
            toastService.show(`Showing ${response.data.products.length} products in ${categoryName} category`, 'info');
          } else {
            toastService.show(`Showing all ${response.data.products.length} products`, 'info');
          }
        } else {
          setProducts([]);
        }
      } catch (error) {
        toastService.show("Failed to load products", "error");
        console.error("Error loading products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSortChange = async (sortValue) => {
    const [field, order] = sortValue.split('-');
    setSortBy(field);
    setSortOrder(order);
    
    if (isSearchMode) {
      // If in search mode, re-sort the current search results
      const sortedResults = [...products].sort((a, b) => {
        let aValue = a[field];
        let bValue = b[field];
        
        // Handle string sorting
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        // Handle date sorting
        if (field === 'created_at') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        
        if (order === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      setProducts(sortedResults);
      toastService.show(`Search results sorted by ${field} (${order === 'asc' ? 'ascending' : 'descending'})`, 'info');
    }
    // If not in search mode, the useEffect will handle loading products with new sorting
  };

  if (loading || searchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {searchLoading ? 'Restoring products with current filters...' : 'Loading products...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Products | Wikramasooriya Enterprises</title>
        <meta name="description" content="Browse our comprehensive collection of industrial spare parts and equipment" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Industrial Products
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our comprehensive collection of high-quality industrial spare parts, 
              tools, and equipment for your business needs.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <ProductSearch 
                  onSearchResults={handleSearchResults}
                  placeholder={
                    isSearchMode 
                      ? selectedCategory 
                        ? `Search within ${categories.find(c => c.id === parseInt(selectedCategory))?.name} category...`
                        : "Search within results..."
                      : "Search products by name..."
                  }
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isSearchMode}
                >
                  <option value="created_at-desc">Newest First</option>
                  <option value="created_at-asc">Oldest First</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="price-asc">Price Low-High</option>
                  <option value="price-desc">Price High-Low</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedCategory || sortBy !== "created_at" || sortOrder !== "desc" || isSearchMode) && (
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Filter className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isSearchMode ? 'No products found for your search' : 'No products found'}
              </h3>
              <p className="text-gray-600">
                {isSearchMode 
                  ? `Try searching for different terms or browse all products.`
                  : 'Try adjusting your filter criteria.'
                }
              </p>
              {isSearchMode && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={clearFilters}
                >
                  Browse All Products
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white">
                  <CardContent className="p-0 relative overflow-hidden">
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden rounded-t-lg">
                      <img
                        src={product.image_url || "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      
                      {/* Add to Cart Button - Modern Plus Icon */}
                      <div className="absolute top-3 right-3">
                        <button
                          onClick={() => handleAddToCart(product.id)}
                          disabled={addingToCart[product.id] || product.stock_qty === 0}
                          className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-primary p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Add to Cart"
                        >
                          {addingToCart[product.id] ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Plus className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* Removed Quick Actions Overlay - no single product view needed */}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.short_description || product.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        
                        <div className="text-sm text-gray-500">
                          SKU: {product.sku}
                        </div>
                      </div>
                      
                      {/* Stock Status */}
                      <div className="mb-3">
                        {product.stock_qty > 0 ? (
                          <span className="text-sm text-green-600 font-medium">
                            ✓ In Stock ({product.stock_qty})
                          </span>
                        ) : (
                          <span className="text-sm text-red-600 font-medium">
                            ✗ Out of Stock
                          </span>
                        )}
                      </div>

                      {/* Removed Add to Cart Button - only plus icon needed */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Results Count */}
          {products.length > 0 && (
            <div className="mt-8 text-center text-gray-600">
              {isSearchMode ? (
                <>
                  Found {products.length} product{products.length !== 1 ? 's' : ''} for "{searchQuery}"
                  {selectedCategory && (
                    <span className="block text-sm text-gray-500 mt-1">
                      in {categories.find(c => c.id === parseInt(selectedCategory))?.name} category
                    </span>
                  )}
                </>
              ) : (
                <>
                  Showing {products.length} product{products.length !== 1 ? 's' : ''}
                  {selectedCategory && (
                    <span className="block text-sm text-gray-500 mt-1">
                      in {categories.find(c => c.id === parseInt(selectedCategory))?.name} category
                    </span>
                  )}
                </>
              )}
            </div>
          )}

          {/* Removed Cart Count Display - no floating badge needed */}
        </div>
      </div>
    </>
  );
};

export default Products;
