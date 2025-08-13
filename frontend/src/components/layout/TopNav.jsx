import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "@/store/slices/authSlice.js";
import { ShoppingCart, User, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const TopNav = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { itemCount } = useSelector(state => state.cart);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const navLinkCls = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive 
        ? "bg-primary-600 text-white" 
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">W</span>
          </div>
          <span className="font-semibold text-lg text-gray-900">
            Wikramasooriya Enterprises
          </span>
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavLink to="/" end className={navLinkCls}>
            Home
          </NavLink>
          <NavLink to="/about" className={navLinkCls}>
            About
          </NavLink>
          <NavLink to="/products" className={navLinkCls}>
            Products
          </NavLink>
          <NavLink to="/contact" className={navLinkCls}>
            Contact Us
          </NavLink>
        </nav>

        {/* Right side - Cart, Auth */}
        <div className="hidden md:flex items-center gap-4">
          {/* Cart */}
          <NavLink to="/cart" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors">
            <ShoppingCart className="h-6 w-6" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </NavLink>

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">
                Welcome, {user?.name || 'User'}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                asChild
              >
                <NavLink to="/login" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Login
                </NavLink>
              </Button>
              <Button size="sm" asChild>
                <NavLink to="/register">
                  Register
                </NavLink>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded-md border p-2 text-gray-700 hover:bg-gray-100"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-3 space-y-3">
            <NavLink 
              to="/" 
              end 
              className="block py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              Home
            </NavLink>
            <NavLink 
              to="/about" 
              className="block py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              About
            </NavLink>
            <NavLink 
              to="/products" 
              className="block py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              Products
            </NavLink>
            <NavLink 
              to="/contact" 
              className="block py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              Contact Us
            </NavLink>
            
            {/* Mobile Cart */}
            <NavLink 
              to="/cart" 
              className="flex items-center gap-2 py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              <ShoppingCart className="h-5 w-5" />
              Cart
              {itemCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </NavLink>

            {/* Mobile Auth */}
            {isAuthenticated ? (
              <div className="pt-2 border-t">
                <span className="block py-2 px-3 text-sm text-gray-700">
                  Welcome, {user?.name || 'User'}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="pt-2 border-t space-y-2">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <NavLink to="/login" onClick={() => setOpen(false)}>
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </NavLink>
                </Button>
                <Button size="sm" asChild className="w-full">
                  <NavLink to="/register" onClick={() => setOpen(false)}>
                    Register
                  </NavLink>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default TopNav;
