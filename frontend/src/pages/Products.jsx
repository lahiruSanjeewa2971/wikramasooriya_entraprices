import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Search, Filter, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sortBy, sortOrder]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const filters = {
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        sortBy,
        sortOrder
      };
      
      const response = await productService.getProducts(filters);
      setProducts(response.products || response);
      
      // Extract unique categories if not already loaded
      if (response.categories) {
        setCategories(response.categories);
      }
    } catch (error) {
      toastService.error("Failed to load products");
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts();
  };

  const handleAddToCart = async (productId) => {
    try {
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        toastService.warning("Please login to add items to cart");
        navigate("/login");
        return;
      }

      await cartService.addToCart(productId, 1);
      toastService.success("Item added to cart successfully!");
    } catch (error) {
      toastService.error(error.message || "Failed to add item to cart");
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSortBy("name");
    setSortOrder("asc");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
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
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </form>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
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
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="price-asc">Price Low-High</option>
                  <option value="price-desc">Price High-Low</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedCategory || sortBy !== "name" || sortOrder !== "asc") && (
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
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-0">
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden rounded-t-lg">
                      <img
                        src={product.imageUrl || "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop"}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Quick Actions Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleProductClick(product.id)}
                            className="bg-white text-gray-900 hover:bg-gray-100"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product.id)}
                            className="bg-primary text-white hover:bg-primary-hover"
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        
                        <div className="text-sm text-gray-500">
                          SKU: {product.sku}
                        </div>
                      </div>
                      
                      {/* Stock Status */}
                      <div className="mt-3">
                        {product.stockQuantity > 0 ? (
                          <span className="text-sm text-green-600">
                            In Stock ({product.stockQuantity})
                          </span>
                        ) : (
                          <span className="text-sm text-red-600">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Results Count */}
          {products.length > 0 && (
            <div className="mt-8 text-center text-gray-600">
              Showing {products.length} product{products.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Products;
