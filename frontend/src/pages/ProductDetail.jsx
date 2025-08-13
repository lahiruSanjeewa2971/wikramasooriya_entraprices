import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductById } from '../store/slices/productSlice.js'
import { addToCart } from '../store/slices/cartSlice.js'
import { showModal, showToast } from '../store/slices/uiSlice.js'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import { ShoppingCart, Star, Tag, Package, Truck } from 'lucide-react'

const ProductDetail = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  
  const { currentProduct, loading } = useSelector(state => state.products)
  const { isAuthenticated } = useSelector(state => state.auth)

  useEffect(() => {
    dispatch(fetchProductById(id))
  }, [dispatch, id])

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      dispatch(showModal({ type: 'login' }))
      return
    }

    try {
      await dispatch(addToCart({
        productId: currentProduct.id,
        qty: quantity
      })).unwrap()
      
      dispatch(showToast({
        message: 'Product added to cart successfully!',
        type: 'success'
      }))
    } catch (error) {
      // Error is handled by the API interceptor
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const getStockStatus = (stockQty) => {
    if (stockQty === 0) return { text: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-100' }
    if (stockQty <= 5) return { text: `Only ${stockQty} left`, color: 'text-orange-600', bgColor: 'bg-orange-100' }
    return { text: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-100' }
  }

  if (loading || !currentProduct) {
    return <LoadingSpinner />
  }

  const stockStatus = getStockStatus(currentProduct.stock_qty)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div>
              <div className="aspect-square overflow-hidden rounded-lg mb-4">
                <img
                  src={currentProduct.image_url || '/placeholder-product.jpg'}
                  alt={currentProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Product Tags */}
              <div className="flex gap-2 mb-4">
                {currentProduct.featured && (
                  <span className="bg-accent-500 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    Featured
                  </span>
                )}
                {currentProduct.new_arrival && (
                  <span className="bg-primary-600 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    New Arrival
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className={`inline-flex items-center px-3 py-1 rounded-full ${stockStatus.bgColor}`}>
                <span className={`text-sm font-medium ${stockStatus.color}`}>
                  {stockStatus.text}
                </span>
              </div>
            </div>

            {/* Product Info */}
            <div>
              {/* Categories */}
              {currentProduct.categories && currentProduct.categories.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm text-gray-500">
                    {currentProduct.categories.map(cat => cat.name).join(', ')}
                  </span>
                </div>
              )}

              {/* Product Name */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {currentProduct.name}
              </h1>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-bold text-primary-600">
                  {formatPrice(currentProduct.price)}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  SKU: {currentProduct.sku}
                </span>
              </div>

              {/* Description */}
              {currentProduct.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {currentProduct.description}
                  </p>
                </div>
              )}

              {/* Add to Cart Section */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                    Quantity:
                  </label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={currentProduct.stock_qty === 0}
                  >
                    {[...Array(Math.min(10, currentProduct.stock_qty))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={currentProduct.stock_qty === 0}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-colors ${
                    currentProduct.stock_qty === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {currentProduct.stock_qty === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                {currentProduct.weight && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Package className="h-4 w-4" />
                    <span>Weight: {currentProduct.weight} kg</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Truck className="h-4 w-4" />
                  <span>Free shipping on orders over $50</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
