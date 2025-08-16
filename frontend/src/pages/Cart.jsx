import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ShoppingCart, Trash2, Plus, Minus, Store, Truck, MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import cartService from "@/services/cartService";
import authService from "@/services/authService";
import toastService from "@/services/toastService";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [checkoutOption, setCheckoutOption] = useState('pickup'); // 'pickup' or 'delivery'

  // Load cart on component mount
  useEffect(() => {
    if (authService.isAuthenticated()) {
      loadCart();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await cartService.getCart();
      // console.log('cartData :', cartData); // Removed for production
      
      if (cartData?.success && cartData?.data?.cart) {
        setCart(cartData.data.cart);
      } else {
        setCart(null);
      }
    } catch (error) {
      toastService.show("Failed to load cart", "error");
      console.error("Error loading cart:", error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdating(true);
      await cartService.updateCartItem(itemId, newQuantity);
      await loadCart(); // Reload cart to get updated data
      toastService.show("Cart updated successfully", "success");
    } catch (error) {
      toastService.show("Failed to update cart", "error");
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await cartService.removeFromCart(itemId);
      await loadCart(); // Reload cart to get updated data
      toastService.show("Item removed from cart", "success");
    } catch (error) {
      toastService.show("Failed to remove item", "error");
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      await loadCart(); // Reload cart to get updated data
      toastService.show("Cart cleared successfully", "success");
    } catch (error) {
      toastService.show("Failed to clear cart", "error");
    }
  };

  const handleCheckout = async () => {
    // Show notification that checkout feature is coming soon
    toastService.show("Checkout feature will be developed soon!", "info");
    
    // TODO: Implement actual checkout functionality
    // - Create order in database
    // - Process payment
    // - Handle delivery/pickup options
    // - Send confirmation emails
    // - Update inventory
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
            <p className="mt-4 text-gray-600">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Cart | Wikramasooriya Enterprises</title>
          <meta name="description" content="Your shopping cart" />
        </Helmet>

        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">Add some products to get started!</p>
              <Button onClick={() => navigate('/products')}>
                Browse Products
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Cart | Wikramasooriya Enterprises</title>
        <meta name="description" content="Your shopping cart" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <p className="text-gray-600">
              Review your items ({cart.item_count} items) and proceed to checkout
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Cart Items ({cart.items.length})</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Cart
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product_image || "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop"}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {item.product_name}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          SKU: {item.product_sku}
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(item.product_price)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Stock: {item.product_stock} units
                        </p>
                        <p className="text-xs text-gray-400">
                          Price captured: {formatPrice(item.price_at_add)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.qty - 1)}
                          disabled={updating}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {item.qty}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.qty + 1)}
                          disabled={updating}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatPrice(parseFloat(item.subtotal))}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Checkout Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Subtotal */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(cart.total_amount)}</span>
                  </div>

                  {/* Delivery Option */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Delivery Option (Preview)</h4>
                    <p className="text-xs text-gray-500 mb-3">These options will be available when checkout is implemented</p>
                    
                    {/* Pickup Option */}
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="checkoutOption"
                        value="pickup"
                        checked={checkoutOption === 'pickup'}
                        onChange={(e) => setCheckoutOption(e.target.value)}
                        className="text-primary focus:ring-primary"
                      />
                      <div className="flex items-center space-x-2">
                        <Store className="w-5 h-5 text-gray-600" />
                        <span className="text-sm">Pickup from Store</span>
                      </div>
                    </label>

                    {/* Delivery Option */}
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="checkoutOption"
                        value="delivery"
                        checked={checkoutOption === 'delivery'}
                        onChange={(e) => setCheckoutOption(e.target.value)}
                        className="text-primary focus:ring-primary"
                      />
                      <div className="flex items-center space-x-2">
                        <Truck className="w-5 h-5 text-gray-600" />
                        <span className="text-sm">Pay & Deliver</span>
                      </div>
                    </label>

                    {/* Location Info for Delivery */}
                    {checkoutOption === 'delivery' && (
                      <div className="ml-8 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2 text-sm text-blue-800">
                          <MapPin className="w-4 h-4" />
                          <span>Delivery to: {authService.getCurrentUser()?.location}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(cart.total_amount)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    onClick={handleCheckout}
                    className="w-full"
                    size="lg"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Proceed to Checkout (Coming Soon)
                  </Button>

                  {/* Continue Shopping */}
                  <Button
                    variant="outline"
                    onClick={() => navigate('/products')}
                    className="w-full"
                  >
                    Continue Shopping
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
