import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut } from "lucide-react";
import authService from "@/services/authService";
import cartService from "@/services/cartService";
import toastService from "@/services/toastService";

const TopNav = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    console.log('TopNav: Initial user check:', currentUser);
    setUser(currentUser);
    
    if (currentUser) {
      loadCartItemCount();
    }
  }, []);

  // Listen for auth events
  useEffect(() => {
    const handleLogin = (event) => {
      console.log('TopNav: Received auth:login event', event.detail.user);
      setUser(event.detail.user);
      loadCartItemCount();
    };

    const handleLogout = () => {
      console.log('TopNav: Received auth:logout event');
      setUser(null);
      setCartItemCount(0);
    };

    const handleCartUpdate = () => {
      if (user) {
        loadCartItemCount();
      }
    };

    window.addEventListener('auth:login', handleLogin);
    window.addEventListener('auth:logout', handleLogout);
    window.addEventListener('cart:updated', handleCartUpdate);

    return () => {
      window.removeEventListener('auth:login', handleLogin);
      window.removeEventListener('auth:logout', handleLogout);
      window.removeEventListener('cart:updated', handleCartUpdate);
    };
  }, []); // Remove user dependency to prevent constant re-registration

  // Load cart item count
  const loadCartItemCount = async () => {
    try {
      const count = await cartService.getCartItemCount();
      setCartItemCount(count || 0);
    } catch (error) {
      console.error('Failed to load cart count:', error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      authService.logout();
      toastService.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toastService.error("Logout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Debug: Log current user state
  console.log('TopNav: Current user state:', user);

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
              <span className="text-white font-bold text-xl">W</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                Wikramasooriya
              </span>
              <div className="text-xs text-gray-500 -mt-1">Enterprises</div>
            </div>
            <span className="font-bold text-lg text-gray-900 sm:hidden group-hover:text-blue-600 transition-colors">
              WE
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {[
              { to: '/', label: 'Home' },
              { to: '/products', label: 'Products' },
              { to: '/about', label: 'About' },
              { to: '/contact', label: 'Contact' }
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Cart Icon */}
            <Link to="/cart" className="relative p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group">
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {cartItemCount >= 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center space-x-3">
                {/* User Profile Dropdown */}
                <div className="flex items-center space-x-3 bg-gray-50 rounded-2xl px-4 py-2 hover:bg-gray-100 transition-all duration-200 group">
                  {/* Profile Picture or Fallback Avatar */}
                  <div className="relative">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback Avatar with Initials */}
                    <div 
                      className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-sm font-bold shadow-md ${user.avatar_url ? 'hidden' : 'flex'}`}
                      style={{ display: user.avatar_url ? 'none' : 'flex' }}
                    >
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    
                    {/* Online Status Indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  
                  {/* User Info */}
                  <div className="hidden lg:block">
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.email}
                    </div>
                  </div>
                </div>
                
                {/* Logout Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="flex items-center space-x-2 border-gray-300 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all duration-200 rounded-xl px-4 py-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">
                    {isLoading ? "Logging out..." : "Logout"}
                  </span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {/* Mobile: Single Account Button */}
                <Link to="/login" className="md:hidden">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="rounded-xl px-4 py-2 border-gray-300 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
                
                {/* Desktop: Separate Login and Sign Up Buttons */}
                <div className="hidden md:flex items-center space-x-2">
                  <Link to="/login">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-xl px-4 py-2 border-gray-300 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button 
                      size="sm"
                      className="rounded-xl px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
