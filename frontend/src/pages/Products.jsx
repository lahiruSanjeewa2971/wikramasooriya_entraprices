import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ShoppingCart, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EnhancedSearch from "@/components/EnhancedSearch";
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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState({});

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
        category: selectedCategory === "all" ? undefined : selectedCategory,
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

  const handleSearchResults = async (searchResults, query, isAISearch = false) => {
    if (searchResults === null) {
      // Clear search mode and fetch fresh data with current filters
      setIsSearchMode(false);
      setSearchQuery("");
      setSearchLoading(true);
      
      try {
        // Fetch fresh products with current category and sorting filters
        const filters = {
          category: selectedCategory === "all" ? undefined : selectedCategory,
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
      
      if (selectedCategory && selectedCategory !== "all") {
        // Filter search results by current category
        const filteredResults = searchResults.filter(product => 
          product.category_id === parseInt(selectedCategory)
        );
        setProducts(filteredResults);
        
        if (filteredResults.length !== searchResults.length) {
          const searchType = isAISearch ? 'AI search' : 'search';
          toastService.show(`Found ${filteredResults.length} products in "${categories.find(c => c.id === parseInt(selectedCategory))?.name}" category for "${query}" (${searchType})`, 'info');
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

      console.log('Products: Adding product to cart:', productId);
      await cartService.addToCart(productId, 1);
      console.log('Products: Product added to cart successfully');
      toastService.show("Item added to cart successfully!", "success");
      
      // Update cart count immediately
      await loadCartCount();
    } catch (error) {
      console.error('Products: Error adding to cart:', error);
      toastService.show(error.message || "Failed to add item to cart", "error");
    } finally {
      // Clear loading state for this product
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const clearFilters = async () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("created_at");
    setSortOrder("desc");
    setIsSearchMode(false);
    setSearchLoading(false);
    
    // Load products with cleared filters
    try {
      setLoading(true);
      const response = await productService.getProducts({
        category: undefined, // No category filter
        sortBy: "created_at",
        sortOrder: "desc"
      });
      
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
    // Convert "all" to undefined for "All Categories" selection
    const actualCategoryId = categoryId === "all" ? undefined : categoryId;
    setSelectedCategory(categoryId); // Keep the UI state consistent
    
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
            // Show all search results when "All Categories" is selected
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
        className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30"
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
        <div className="container mx-auto px-4 py-8">
          {/* Professional Header */}
          <motion.div 
            className="text-center mb-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div 
              className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 mb-4"
              variants={headerVariants}
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-600">Industrial Solutions</span>
            </motion.div>
            
            <motion.h1 
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
              variants={headerVariants}
            >
              Professional Equipment & Parts
            </motion.h1>
            <motion.p 
              className="text-gray-600 max-w-xl mx-auto text-sm"
              variants={headerVariants}
            >
              High-quality industrial components for your business operations
            </motion.p>
          </motion.div>

          {/* Compact Search and Filters */}
          <motion.div 
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              {/* Enhanced Search */}
              <motion.div 
                className="lg:col-span-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <EnhancedSearch 
                  onSearchResults={handleSearchResults}
                  placeholder={
                    isSearchMode 
                      ? selectedCategory 
                        ? `Search within ${categories.find(c => c.id === parseInt(selectedCategory))?.name}...`
                        : "Search within results..."
                      : "Search products by name or description..."
                  }
                />
              </motion.div>

              {/* Category Filter */}
              <motion.div
                className="lg:col-span-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <Select value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full h-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm bg-white">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Sort */}
              <motion.div
                className="lg:col-span-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
                <Select 
                  value={`${sortBy}-${sortOrder}`} 
                  onValueChange={handleSortChange}
                  disabled={isSearchMode}
                >
                  <SelectTrigger className="w-full h-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue placeholder="Newest First" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at-desc">Newest First</SelectItem>
                    <SelectItem value="created_at-asc">Oldest First</SelectItem>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                    <SelectItem value="price-asc">Price Low-High</SelectItem>
                    <SelectItem value="price-desc">Price High-Low</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            </div>

            {/* Clear Filters - Compact */}
            <AnimatePresence>
              {(searchQuery || (selectedCategory && selectedCategory !== "all") || sortBy !== "created_at" || sortOrder !== "desc" || isSearchMode) && (
                <motion.div 
                  className="mt-4 flex justify-center"
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs">
                      Clear All Filters
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
                    <Card 
                      className="group hover:shadow-2xl transition-all duration-500 border border-gray-100 bg-white h-full cursor-pointer overflow-hidden flex flex-col"
                      onClick={() => handleProductClick(product.id)}
                    >
                      <CardContent className="p-0 relative flex flex-col h-full">
                        {/* Product Image */}
                        <div className="relative aspect-square overflow-hidden bg-gray-50">
                          <motion.img
                            src={product.image_url || "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop"}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            variants={imageHoverVariants}
                            whileHover="hover"
                          />
                          
                          {/* Professional Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          {/* Stock Badge */}
                          <div className="absolute top-3 left-3">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.stock_qty > 0 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                              {product.stock_qty > 0 ? `${product.stock_qty} in stock` : 'Out of stock'}
                            </div>
                          </div>
                          
                          {/* Add to Cart Button */}
                          <div className="absolute top-3 right-3">
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product.id);
                              }}
                              disabled={addingToCart[product.id] || product.stock_qty === 0}
                              className="bg-white/95 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-blue-600 p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
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
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="plus"
                                    variants={plusIconVariants}
                                    initial="initial"
                                    whileHover="rotate"
                                    animate="reset"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.button>
                          </div>
                        </div>

                        {/* Product Info - Flex container to push button to bottom */}
                        <div className="p-5 flex flex-col flex-grow">
                          <div className="flex-grow">
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm leading-tight">
                              {product.name}
                            </h3>
                            
                            <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                              {product.short_description || product.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-lg font-bold text-blue-600">
                              {formatPrice(product.price)}
                            </span>
                            
                            <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                              {product.sku}
                            </div>
                          </div>
                          
                          {/* Professional Action Button - Always at bottom */}
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductClick(product.id);
                            }}
                            className="w-full py-2.5 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-lg text-xs font-medium transition-all duration-200 border border-gray-200 hover:border-blue-200 mt-auto"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            View Details
                          </motion.button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Professional Results Summary */}
          {products.length > 0 && (
            <motion.div 
              className="mt-8 bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {isSearchMode ? (
                      <>
                        Found {products.length} product{products.length !== 1 ? 's' : ''} for "{searchQuery}"
                        {selectedCategory && (
                          <span className="text-gray-500 ml-2">
                            in {categories.find(c => c.id === parseInt(selectedCategory))?.name}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        Showing {products.length} product{products.length !== 1 ? 's' : ''}
                        {selectedCategory && (
                          <span className="text-gray-500 ml-2">
                            in {categories.find(c => c.id === parseInt(selectedCategory))?.name}
                          </span>
                        )}
                      </>
                    )}
                  </span>
                </div>
                
                <div className="text-xs text-gray-400">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          )}

          {/* Removed Cart Count Display - no floating badge needed */}
        </div>
      </motion.div>
    </>
  );
};

export default Products;
