import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut, ChevronDown } from "lucide-react";
import authService from "@/services/authService";
import cartService from "@/services/cartService";
import toastService from "@/services/toastService";

const TopNav = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

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
      console.log('TopNav: Received cart:updated event');
      loadCartItemCount();
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Cleanup timeout on unmount
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Load cart item count
  const loadCartItemCount = async () => {
    try {
      console.log('TopNav: Loading cart count...');
      const count = await cartService.getCartItemCount();
      console.log('TopNav: Cart count received:', count);
      setCartItemCount(count || 0);
    } catch (error) {
      console.error('Failed to load cart count:', error);
      setCartItemCount(0);
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
              <div 
                className="relative" 
                ref={profileDropdownRef}
                onMouseEnter={() => {
                  if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current);
                  }
                  setIsProfileDropdownOpen(true);
                }}
                onMouseLeave={() => {
                  hoverTimeoutRef.current = setTimeout(() => {
                    setIsProfileDropdownOpen(false);
                  }, 150); // 150ms delay before closing
                }}
              >
                {/* Profile Icon with Dropdown Trigger */}
                <div className="relative cursor-pointer group">
                  {/* Profile Picture or Fallback Avatar */}
                  <div className="relative">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback Avatar with Initials */}
                    <div 
                      className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-105 ${user.avatar_url ? 'hidden' : 'flex'}`}
                      style={{ display: user.avatar_url ? 'none' : 'flex' }}
                    >
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    
                    {/* Online Status Indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>

                  {/* Dropdown Arrow */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md">
                    <ChevronDown className={`w-2.5 h-2.5 text-gray-600 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-4 z-50 animate-in slide-in-from-top-2 duration-200">
                    {/* User Info Header */}
                    <div className="px-6 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        {/* Avatar in dropdown */}
                        <div className="relative">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          
                          <div 
                            className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-lg font-bold ${user.avatar_url ? 'hidden' : 'flex'}`}
                            style={{ display: user.avatar_url ? 'none' : 'flex' }}
                          >
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {user.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {user.email}
                          </div>
                          <div className="text-xs text-green-600 font-medium">
                            Online
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {/* Profile Link */}
                      <button className="w-full px-6 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3">
                        <User className="w-4 h-4" />
                        <span>View Profile</span>
                      </button>
                      
                      {/* Settings Link */}
                      <button className="w-full px-6 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Settings</span>
                      </button>
                    </div>

                    {/* Logout Button */}
                    <div className="px-4 py-2 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        disabled={isLoading}
                        className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium">
                          {isLoading ? "Logging out..." : "Logout"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
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
