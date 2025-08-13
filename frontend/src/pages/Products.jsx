import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { fetchProducts, setFilters } from '../store/slices/productSlice.js'
import ProductCard from '../components/products/ProductCard.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import { Filter, Search } from 'lucide-react'

const Products = () => {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const [localFilters, setLocalFilters] = useState({
    category: searchParams.get('category') || '',
    featured: searchParams.get('featured') === 'true',
    new_arrival: searchParams.get('new_arrival') === 'true',
    search: searchParams.get('q') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: searchParams.get('sortOrder') || 'DESC'
  })

  const { products, categories, pagination, loading } = useSelector(state => state.products)

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams()
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value.toString())
      }
    })
    setSearchParams(params)
  }, [localFilters, setSearchParams])

  useEffect(() => {
    // Fetch products when filters change
    dispatch(fetchProducts(localFilters))
  }, [dispatch, localFilters])

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
    dispatch(setFilters({ [key]: value }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    handleFilterChange('search', localFilters.search)
  }

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      featured: false,
      new_arrival: false,
      search: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'created_at',
      sortOrder: 'DESC'
    }
    setLocalFilters(clearedFilters)
    dispatch(setFilters(clearedFilters))
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600">Discover our collection of quality products</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              </div>

              {/* Search */}
              <div className="mb-6">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={localFilters.search}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </form>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
                <select
                  value={localFilters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={localFilters.minPrice}
                    onChange={(e) => setLocalFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={localFilters.maxPrice}
                    onChange={(e) => setLocalFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Sort By</h3>
                <select
                  value={localFilters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="created_at">Newest First</option>
                  <option value="name">Name A-Z</option>
                  <option value="price">Price Low to High</option>
                  <option value="price">Price High to Low</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {products.length} of {pagination.totalItems} products
              </p>
            </div>

            {/* Products */}
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your criteria</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  {pagination.hasPrevPage && (
                    <button
                      onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                  )}
                  
                  <span className="px-3 py-2 text-gray-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  
                  {pagination.hasNextPage && (
                    <button
                      onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </button>
                  )}
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Products
