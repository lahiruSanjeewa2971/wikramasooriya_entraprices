import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { updateCartItem, removeFromCart, clearCart } from '../store/slices/cartSlice.js'
import { showToast } from '../store/slices/uiSlice.js'
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'

const Cart = () => {
  const dispatch = useDispatch()
  const { items, totalAmount, itemCount, loading } = useSelector(state => state.cart)
  const { isAuthenticated } = useSelector(state => state.auth)

  const handleQuantityChange = async (itemId, newQty) => {
    try {
      await dispatch(updateCartItem({ id: itemId, qty: newQty })).unwrap()
      dispatch(showToast({
        message: 'Cart updated successfully!',
        type: 'success'
      }))
    } catch (error) {
      // Error is handled by the API interceptor
    }
  }

  const handleRemoveItem = async (itemId) => {
    try {
      await dispatch(removeFromCart(itemId)).unwrap()
      dispatch(showToast({
        message: 'Item removed from cart!',
        type: 'success'
      }))
    } catch (error) {
      // Error is handled by the API interceptor
    }
  }

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await dispatch(clearCart()).unwrap()
        dispatch(showToast({
          message: 'Cart cleared successfully!',
          type: 'success'
        }))
      } catch (error) {
        // Error is handled by the API interceptor
      }
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to view your cart and make purchases.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Login to Continue
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading cart...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/products"
              className="text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          </div>
          <p className="text-gray-600">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Cart Items</h2>
                  
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        {/* Product Image */}
                        <div className="w-20 h-20 flex-shrink-0">
                          <img
                            src={item.product.image_url || '/placeholder-product.jpg'}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            SKU: {item.product.sku}
                          </p>
                          <p className="text-lg font-semibold text-primary-600">
                            {formatPrice(item.price_at_add)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <select
                            value={item.qty}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                            className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            {[...Array(10)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatPrice(item.subtotal)}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Clear Cart Button */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleClearCart}
                      className="text-red-600 hover:text-red-700 font-medium transition-colors"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                    <span className="font-medium">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-primary-600">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors mb-4"
                >
                  Proceed to Checkout
                </button>

                <Link
                  to="/products"
                  className="block w-full text-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
