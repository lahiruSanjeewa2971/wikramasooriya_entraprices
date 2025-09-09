import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
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
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const headerVariants = {
    initial: { opacity: 0, y: -30 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const productCardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.4, 
        ease: "easeOut" 
      }
    },
    hover: { 
      y: -8, 
      scale: 1.02,
      transition: { 
        duration: 0.3, 
        ease: "easeOut" 
      }
    }
  };

  const plusIconVariants = {
    initial: { rotate: 0, scale: 1 },
    rotate: { 
      rotate: 180, 
      scale: 1.1,
      transition: { 
        duration: 0.3, 
        ease: "easeInOut" 
      }
    },
    reset: { 
      rotate: 0, 
      scale: 1,
      transition: { 
        duration: 0.3, 
        ease: "easeInOut" 
      }
    }
  };

  const imageHoverVariants = {
    hover: { 
      scale: 1.1,
      transition: { 
        duration: 0.4, 
        ease: "easeOut" 
      }
    }
  };

  // Dropdown animations
  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -10,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: "easeIn"
      }
    }
  };

  const optionVariants = {
    hidden: { 
      opacity: 0, 
      x: -20,
      scale: 0.9
    },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        delay: i * 0.05
      }
    }),
    hover: {
      scale: 1.02,
      x: 5,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  // Enhanced products grid with individual timing
  const productItemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30, 
      scale: 0.9,
      rotateX: -15
    },
    visible: (i) => ({ 
      opacity: 1, 
      y: 0, 
      scale: 1,
      rotateX: 0,
      transition: { 
        duration: 0.5, 
        ease: "easeOut",
        delay: i * 0.1
      }
    }),
    hover: { 
      y: -8, 
      scale: 1.02,
      rotateX: 5,
      transition: { 
        duration: 0.3, 
        ease: "easeOut" 
      }
    }
  };

  const productsGridVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

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

      <motion.div 
        className="min-h-screen bg-gray-50 py-12"
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              variants={headerVariants}
            >
              Industrial Products
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              variants={headerVariants}
            >
              Discover our comprehensive collection of high-quality industrial spare parts, 
              tools, and equipment for your business needs.
            </motion.p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <motion.div 
                className="md:col-span-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
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
              </motion.div>

              {/* Category Filter */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    onFocus={() => setIsCategoryDropdownOpen(true)}
                    onBlur={() => setIsCategoryDropdownOpen(false)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category, index) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  
                  {/* Animated dropdown indicator */}
                  <motion.div
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                    animate={{ rotate: isCategoryDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>

              {/* Sort */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <div className="relative">
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => handleSortChange(e.target.value)}
                    onFocus={() => setIsSortDropdownOpen(true)}
                    onBlur={() => setIsSortDropdownOpen(false)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    disabled={isSearchMode}
                  >
                    <option value="created_at-desc">Newest First</option>
                    <option value="created_at-asc">Oldest First</option>
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="price-asc">Price Low-High</option>
                    <option value="price-desc">Price High-Low</option>
                  </select>
                  
                  {/* Animated dropdown indicator */}
                  <motion.div
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                    animate={{ rotate: isSortDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Clear Filters */}
            <AnimatePresence>
              {(searchQuery || selectedCategory || sortBy !== "created_at" || sortOrder !== "desc" || isSearchMode) && (
                <motion.div 
                  className="mt-4 text-center"
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

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
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={productsGridVariants}
              initial="initial"
              animate="animate"
            >
              <AnimatePresence mode="wait">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    variants={productItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    whileHover="hover"
                    layout
                    custom={index}
                  >
                    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white h-full">
                  <CardContent className="p-0 relative overflow-hidden">
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden rounded-t-lg">
                      <motion.img
                        src={product.image_url || "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        variants={imageHoverVariants}
                        whileHover="hover"
                      />
                      
                      {/* Add to Cart Button - Modern Plus Icon */}
                      <div className="absolute top-3 right-3">
                        <motion.button
                          onClick={() => handleAddToCart(product.id)}
                          disabled={addingToCart[product.id] || product.stock_qty === 0}
                          className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-primary p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Add to Cart"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <AnimatePresence mode="wait">
                            {addingToCart[product.id] ? (
                              <motion.div
                                key="loading"
                                initial={{ opacity: 0, rotate: -90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                exit={{ opacity: 0, rotate: 90 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Loader2 className="w-5 h-5 animate-spin" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="plus"
                                variants={plusIconVariants}
                                initial="initial"
                                whileHover="rotate"
                                animate="reset"
                              >
                                <Plus className="w-5 h-5" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
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
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
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
      </motion.div>
    </>
  );
};

export default Products;
