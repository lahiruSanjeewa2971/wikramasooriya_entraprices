import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Star, Tag } from 'lucide-react'
import { cartAPI } from '../../services/api'
import { tokenUtils } from '../../services/api'

const ProductCard = ({ product }) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const navigate = useNavigate()

  const handleAddToCart = async () => {
    if (!tokenUtils.isAuthenticated()) {
      // Redirect to login page
      navigate('/login')
      return
    }

    setIsAddingToCart(true)
    try {
      await cartAPI.addItem({
        productId: product.id,
        qty: 1
      })
      
      // Show success message (you can implement a toast system)
      console.log('Product added to cart successfully!')
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('cart:updated', {
        detail: { action: 'add', productId: product.id }
      }))
    } catch (error) {
      console.error('Failed to add product to cart:', error)
      // Show error message (you can implement a toast system)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const getStockStatus = (stockQty) => {
    if (stockQty === 0) return { text: 'Out of Stock', color: 'text-red-600' }
    if (stockQty <= 5) return { text: `Only ${stockQty} left`, color: 'text-orange-600' }
    return { text: 'In Stock', color: 'text-green-600' }
  }

  const stockStatus = getStockStatus(product.stock_qty)

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image_url || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        
        {/* Product Tags */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.featured && (
            <span className="bg-accent-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Star className="h-3 w-3" />
              Featured
            </span>
          )}
          {product.new_arrival && (
            <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Tag className="h-3 w-3" />
              New
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-medium ${stockStatus.color}`}>
            {stockStatus.text}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Categories */}
        {product.categories && product.categories.length > 0 && (
          <div className="mb-2">
            <span className="text-xs text-gray-500">
              {product.categories.map(cat => cat.name).join(', ')}
            </span>
          </div>
        )}

        {/* Product Name */}
        <Link to={`/products/${product.id}`} className="block">
          <h3 className="font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Short Description */}
        {product.short_description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.short_description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-gray-500">
            SKU: {product.sku}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart || product.stock_qty === 0}
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
            product.stock_qty === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          {isAddingToCart ? 'Adding...' : product.stock_qty === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}

export default ProductCard
