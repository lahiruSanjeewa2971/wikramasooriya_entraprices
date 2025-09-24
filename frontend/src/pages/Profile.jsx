import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Settings, Star, Package, History, Loader2, Heart, Share2, Eye, EyeOff, Trash2, Truck } from 'lucide-react';
import authService from '@/services/authService';
import toastService from '@/services/toastService';
import userProfileService from '@/services/userProfileService';
import ProfileEditModal from '@/components/profile/ProfileEditModal';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      toastService.warning('Please login to view your profile');
      window.location.href = '/login';
      return;
    }
    
    setUser(currentUser);
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const response = await userProfileService.getUserProfile();
      setProfileData(response.data.profile);
      console.log('user', user);
      console.log('Profile data loaded:', response.data.profile);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toastService.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await userProfileService.getUserReviews();
      setReviews(response.data.reviews);
      console.log('Reviews loaded:', response.data.reviews);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      toastService.error('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await userProfileService.getUserOrders();
      setOrders(response.data.orders);
      console.log('Orders loaded:', response.data.orders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toastService.error('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Load data when switching to specific tabs
    if (tabId === 'reviews' && reviews.length === 0) {
      loadReviews();
    } else if (tabId === 'orders' && orders.length === 0) {
      loadOrders();
    }
  };

  const handleProfileUpdated = async () => {
    // Refresh profile data when modal closes after successful update
    await loadProfileData();
    
    // Also update the user data in localStorage to reflect changes in TopNav
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      // Get the updated profile data from the API response
      try {
        const response = await userProfileService.getUserProfile();
        const updatedProfileData = response.data.profile;
        
        const updatedUser = {
          ...currentUser,
          avatar_url: updatedProfileData.avatar_url
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Dispatch event to notify TopNav of user data change
        window.dispatchEvent(new CustomEvent('auth:userUpdated', { detail: { user: updatedUser } }));
      } catch (error) {
        console.error('Failed to update user data:', error);
      }
    }
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading Profile - Wikramasooriya Enterprises</title>
        </Helmet>
        
        <div className="min-h-screen bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Profile</h3>
                  <p className="text-gray-600">Please wait while we fetch your profile information...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Helmet>
          <title>Access Denied - Wikramasooriya Enterprises</title>
        </Helmet>
        
        <div className="min-h-screen bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center py-12">
                  <User className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
                  <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
                  <button
                    onClick={() => window.location.href = '/login'}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(price);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <>
      <Helmet>
        <title>My Profile - {user.name} - Wikramasooriya Enterprises</title>
        <meta name="description" content="Manage your account, view your reviews, and track your orders." />
      </Helmet>
      
      <motion.div 
        className="min-h-screen bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Professional Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Professional Avatar */}
              <div className="flex-shrink-0 relative">
                <div className="relative">
                  {profileData?.avatar_url || user.avatar_url ? (
                    <img 
                      src={profileData?.avatar_url || user.avatar_url} 
                      alt={user.name}
                      className="w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover shadow-lg border-4 border-primary/20"
                    />
                  ) : (
                    <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-primary to-primary-variant rounded-full flex items-center justify-center text-3xl lg:text-4xl font-bold text-white shadow-lg border-4 border-primary/20">
                      {getInitials(user.name)}
                    </div>
                  )}
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-10 blur-sm"></div>
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 truncate">
                  {user.name}
                </h1>
                <p className="text-gray-600 text-lg mb-2 truncate">{user.email}</p>
                <p className="text-gray-500 text-sm mb-4">
                  Member since {formatDate(user.created_at)}
                </p>
                {profileData && (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                      <span className="text-gray-700 text-sm font-medium">
                        {profileData.profile_completion_percentage}% Complete
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Button */}
              <div className="flex space-x-3">
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="group relative px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <Edit3 className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="font-medium">Edit Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Professional Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex flex-wrap justify-center lg:justify-start space-x-1 lg:space-x-0 px-4 lg:px-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`group relative py-4 px-4 lg:px-6 font-medium text-sm flex items-center space-x-2 transition-all duration-300 rounded-t-lg ${
                          activeTab === tab.id
                            ? 'text-primary bg-gray-50 border-b-2 border-primary'
                            : 'text-gray-500 hover:text-primary hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 transition-transform duration-300 ${
                          activeTab === tab.id ? 'text-primary' : 'text-gray-500 group-hover:text-primary'
                        }`} />
                        <span className="hidden sm:inline">{tab.label}</span>
                        {activeTab === tab.id && (
                          <div className="absolute inset-0 bg-primary/5 rounded-t-lg"></div>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Overview</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{profileData?.name || user.name}</p>
                            <p className="text-xs text-gray-500">Full Name</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Mail className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{profileData?.email || user.email}</p>
                            <p className="text-xs text-gray-500">Email Address</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Phone className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{profileData?.mobile || user.mobile || 'Not provided'}</p>
                            <p className="text-xs text-gray-500">Mobile Number</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{profileData?.location || user.location || 'Not provided'}</p>
                            <p className="text-xs text-gray-500">Location</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{formatDate(profileData?.created_at || user.created_at)}</p>
                            <p className="text-xs text-gray-500">Member Since</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Account Statistics */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                          <Settings className="w-5 h-5 text-secondary" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Account Statistics</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Profile Completion</p>
                              <p className="text-xs text-gray-500">Complete your profile</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary">{profileData?.profile_completion_percentage || 0}%</p>
                            </div>
                          </div>
                          <div className="bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-primary to-primary-variant h-3 rounded-full transition-all duration-500 ease-out" 
                              style={{ width: `${profileData?.profile_completion_percentage || 0}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-accent/5 to-accent/10 rounded-lg p-6 border border-accent/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                                <Star className="w-5 h-5 text-accent" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">Reviews Written</p>
                                <p className="text-xs text-gray-500">Product reviews</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-accent">{reviews.length}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-secondary/5 to-secondary/10 rounded-lg p-6 border border-secondary/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-secondary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">Orders Placed</p>
                                <p className="text-xs text-gray-500">Total orders</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-secondary">{orders.length}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">My Reviews</h2>
                    {reviewsLoading && <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary animate-spin" />}
                  </div>
                  
                  {reviewsLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary animate-spin mx-auto mb-3 sm:mb-4" />
                      <p className="text-gray-600 text-sm sm:text-base">Loading reviews...</p>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-12 sm:py-16">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <Star className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">No Reviews Yet</h3>
                      <p className="text-gray-600 mb-6 sm:mb-8 max-w-sm sm:max-w-md mx-auto text-sm sm:text-base px-4">You haven't written any product reviews yet. Share your experience with our industrial tools!</p>
                      <button 
                        onClick={() => window.location.href = '/products'}
                        className="px-6 sm:px-8 py-2 sm:py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base"
                      >
                        Browse Products
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow duration-300">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                                <div className="flex">{renderStars(review.rating)}</div>
                                <span className="text-base sm:text-lg font-semibold text-gray-900 break-words">{review.title}</span>
                              </div>
                              <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base break-words">{review.comment}</p>
                              <div className="space-y-2 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-4 text-xs sm:text-sm text-gray-500">
                                <div className="flex items-center space-x-2">
                                  <Package className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span className="break-words">{review.product_name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span>{formatDate(review.created_at)}</span>
                                </div>
                                {review.is_verified_purchase && (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
                                    <span className="text-accent font-medium">Verified Purchase</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2 sm:ml-4 sm:flex-shrink-0">
                              <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
                    {ordersLoading && <Loader2 className="h-5 w-5 text-primary animate-spin" />}
                  </div>
                  
                  {ordersLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">Loading orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">No Orders Yet</h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">You haven't placed any orders yet. Discover our range of industrial tools and equipment!</p>
                      <button 
                        onClick={() => window.location.href = '/products'}
                        className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-300">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 mb-4">
                                <div className="flex items-center space-x-2">
                                  <Package className="w-5 h-5 text-primary" />
                                  <span className="text-lg font-semibold text-gray-900">Order #{order.id}</span>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  order.status === 'converted' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-secondary/10 text-secondary border border-secondary/20'
                                }`}>
                                  {order.status === 'converted' ? 'Completed' : order.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <Package className="w-4 h-4 text-gray-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{order.item_count} Items</p>
                                    <p className="text-gray-500">Products</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <span className="text-gray-600 font-bold">₨</span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{formatPrice(order.total_amount)}</p>
                                    <p className="text-gray-500">Total Amount</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <Truck className="w-4 h-4 text-gray-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{order.delivery_method}</p>
                                    <p className="text-gray-500">Delivery</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-gray-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{formatDate(order.created_at)}</p>
                                    <p className="text-gray-500">Order Date</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <button className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-secondary" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
                  </div>
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Settings className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Settings Coming Soon</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">Account settings and preferences will be available soon. We're working on bringing you more control over your account.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium">
                        Under Development
                      </button>
                      <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
                        Contact Support
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        profileData={profileData}
        onProfileUpdated={handleProfileUpdated}
      />
    </>
  );
};

export default Profile;