import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, MapPin, Phone, Calendar, Users, FileText, Camera, Trash2, Plus, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { z } from 'zod';
import userProfileService from '@/services/userProfileService';
import toastService from '@/services/toastService';

// Zod validation schemas
const personalInfoSchema = z.object({
  mobile: z.string().min(1, 'Mobile number is required').regex(/^[0-9+\-\s()]+$/, 'Invalid mobile number format'),
  location: z.string().min(1, 'Location is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Please select a gender' }),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

const addressSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(255, 'Full name must be less than 255 characters')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Full name can only contain letters, spaces, hyphens, apostrophes, and periods'),
  address_line_1: z
    .string()
    .min(1, 'Address line 1 is required')
    .min(5, 'Address line 1 must be at least 5 characters')
    .max(255, 'Address line 1 must be less than 255 characters'),
  address_line_2: z
    .string()
    .max(255, 'Address line 2 must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .min(1, 'City is required')
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'City can only contain letters, spaces, hyphens, apostrophes, and periods'),
  state_province: z
    .string()
    .min(1, 'State/Province is required')
    .min(2, 'State/Province must be at least 2 characters')
    .max(100, 'State/Province must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'State/Province can only contain letters, spaces, hyphens, apostrophes, and periods'),
  postal_code: z
    .string()
    .min(1, 'Postal code is required')
    .min(3, 'Postal code must be at least 3 characters')
    .max(20, 'Postal code must be less than 20 characters')
    .regex(/^[a-zA-Z0-9\s\-]+$/, 'Postal code can only contain letters, numbers, spaces, and hyphens'),
  country: z
    .string()
    .min(1, 'Country is required')
    .min(2, 'Country must be at least 2 characters')
    .max(100, 'Country must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Country can only contain letters, spaces, hyphens, apostrophes, and periods'),
  phone: z
    .string()
    .regex(/^[+]?[\d\s\-\(\)]{10,15}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  address_type: z.enum(['shipping', 'billing', 'home', 'work', 'other'], {
    required_error: 'Please select an address type'
  }),
});

const ProfileEditModal = ({ isOpen, onClose, user, profileData, onProfileUpdated }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [addressErrors, setAddressErrors] = useState({});
  const [deleteAddressId, setDeleteAddressId] = useState(null);
  const [showRemoveAvatarDialog, setShowRemoveAvatarDialog] = useState(false);
  
  
  // Personal Information State
  const [personalInfo, setPersonalInfo] = useState({
    mobile: '',
    location: '',
    date_of_birth: '',
    gender: '',
    bio: '',
  });

  // Address Management State
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: 'Sri Lanka',
    phone: '',
    address_type: 'shipping',
  });

  // Avatar State
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && profileData) {
      console.log('ProfileEditModal: Initializing with profileData:', profileData);
      console.log('ProfileEditModal: date_of_birth from backend:', profileData.date_of_birth);
      
      const newPersonalInfo = {
        mobile: profileData.mobile || user?.mobile || '',
        location: profileData.location || user?.location || '',
        date_of_birth: profileData.date_of_birth || '',
        gender: profileData.gender || '',
        bio: profileData.bio || '',
      };
      
      console.log('ProfileEditModal: Setting personalInfo to:', newPersonalInfo);
      setPersonalInfo(newPersonalInfo);
    }
  }, [isOpen, profileData, user]);

  // Load addresses when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAddresses();
    }
  }, [isOpen]);

  const loadAddresses = async () => {
    try {
      const response = await userProfileService.getUserAddresses();
      setAddresses(response.data.addresses || []);
    } catch (error) {
      console.error('Failed to load addresses:', error);
      toastService.error('Failed to load addresses');
    }
  };

  const handlePersonalInfoChange = (field, value) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const validatedData = personalInfoSchema.parse(personalInfo);
      setErrors({});
      setIsLoading(true);

      const response = await userProfileService.updateUserProfile(validatedData);
      
      toastService.success('Personal information updated successfully!');
      onProfileUpdated();
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = {};
        error.errors.forEach(err => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        toastService.error(error.message || 'Failed to update personal information');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressChange = (field, value) => {
    setAddressForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (addressErrors[field]) {
      setAddressErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const validatedData = addressSchema.parse(addressForm);
      setAddressErrors({});
      setIsLoading(true);

      if (editingAddress) {
        await userProfileService.updateUserAddress(editingAddress.id, validatedData);
        toastService.success('Address updated successfully!');
      } else {
        await userProfileService.addUserAddress(validatedData);
        toastService.success('Address added successfully!');
      }

      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        full_name: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state_province: '',
        postal_code: '',
        country: 'Sri Lanka',
        phone: '',
        address_type: 'shipping',
      });
      loadAddresses();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = {};
        error.errors.forEach(err => {
          fieldErrors[err.path[0]] = err.message;
        });
        setAddressErrors(fieldErrors);
      } else {
        toastService.error(error.message || 'Failed to save address');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressErrors({});
    setAddressForm({
      full_name: address.full_name,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || '',
      city: address.city,
      state_province: address.state_province || '',
      postal_code: address.postal_code,
      country: address.country,
      phone: address.phone || '',
      address_type: address.address_type,
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async () => {
    if (!deleteAddressId) return;
    
    try {
      await userProfileService.deleteUserAddress(deleteAddressId);
      toastService.success('Address deleted successfully!');
      loadAddresses();
      setDeleteAddressId(null);
    } catch (error) {
      toastService.error(error.message || 'Failed to delete address');
    }
  };

  const confirmDeleteAddress = (addressId) => {
    setDeleteAddressId(addressId);
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await userProfileService.setDefaultAddress(addressId);
      toastService.success('Default address updated!');
      loadAddresses();
    } catch (error) {
      toastService.error(error.message || 'Failed to set default address');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toastService.error('Please select an image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toastService.error('Image size must be less than 5MB');
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    try {
      setIsLoading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await userProfileService.uploadAvatar(formData);
      
      toastService.success('Profile picture updated successfully!');
      onProfileUpdated();
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      toastService.error(error.message || 'Failed to upload profile picture');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setIsLoading(true);
      await userProfileService.removeAvatar();
      toastService.success('Profile picture removed successfully!');
      onProfileUpdated();
      setShowRemoveAvatarDialog(false);
    } catch (error) {
      toastService.error(error.message || 'Failed to remove profile picture');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'avatar', label: 'Profile Picture', icon: Camera },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activeTab === 'personal' && (
              <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mobile Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="tel"
                        value={personalInfo.mobile}
                        onChange={(e) => handlePersonalInfoChange('mobile', e.target.value)}
                        className={`pl-10 ${errors.mobile ? 'border-red-500' : ''}`}
                        placeholder="Enter mobile number"
                      />
                    </div>
                    {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        value={personalInfo.location}
                        onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                        className={`pl-10 ${errors.location ? 'border-red-500' : ''}`}
                        placeholder="Enter your location"
                      />
                    </div>
                    {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <DatePicker
                      value={personalInfo.date_of_birth}
                      onChange={(value) => handlePersonalInfoChange('date_of_birth', value)}
                      placeholder="Select your date of birth"
                      error={!!errors.date_of_birth}
                    />
                    {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={personalInfo.gender}
                        onChange={(e) => handlePersonalInfoChange('gender', e.target.value)}
                        className={`w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      value={personalInfo.bio}
                      onChange={(e) => handlePersonalInfoChange('bio', e.target.value)}
                      className={`w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none ${errors.bio ? 'border-red-500' : 'border-gray-300'}`}
                      rows={4}
                      placeholder="Tell us about yourself..."
                      maxLength={500}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
                    <p className="text-gray-500 text-sm ml-auto">{personalInfo.bio.length}/500</p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            )}

            {activeTab === 'avatar' && (
              <div className="space-y-6">
                {/* Current Avatar */}
                <div className="text-center">
                  <div className="relative inline-block">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Preview"
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                      />
                    ) : profileData?.avatar_url || user?.avatar_url ? (
                      <img
                        src={profileData?.avatar_url || user?.avatar_url}
                        alt="Current avatar"
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center text-4xl font-bold text-white border-4 border-gray-200">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Controls */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload New Picture
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: JPG, PNG, GIF. Max size: 5MB
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    {avatarFile && (
                      <Button
                        onClick={handleAvatarUpload}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {isLoading ? 'Uploading...' : 'Upload Picture'}
                      </Button>
                    )}
                    
                    {(profileData?.avatar_url || user?.avatar_url) && (
                      <Button
                        onClick={() => setShowRemoveAvatarDialog(true)}
                        disabled={isLoading}
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Picture
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-6">
                {/* Add Address Button */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Your Addresses</h3>
                  <Button
                    onClick={() => setShowAddressForm(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Address
                  </Button>
                </div>

                {/* Address Form */}
                {showAddressForm && (
                  <div className="bg-gray-50 p-6 rounded-lg border">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h4>
                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                          </label>
                          <Input
                            value={addressForm.full_name}
                            onChange={(e) => handleAddressChange('full_name', e.target.value)}
                            placeholder="Enter full name"
                            className={addressErrors.full_name ? 'border-red-500' : ''}
                          />
                          <div className="flex justify-between mt-1">
                            {addressErrors.full_name && (
                              <p className="text-red-500 text-sm">{addressErrors.full_name}</p>
                            )}
                            <p className="text-gray-500 text-sm ml-auto">{addressForm.full_name.length}/255</p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Type *
                          </label>
                          <select
                            value={addressForm.address_type}
                            onChange={(e) => handleAddressChange('address_type', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${addressErrors.address_type ? 'border-red-500' : 'border-gray-300'}`}
                          >
                            <option value="">Select address type</option>
                            <option value="shipping">Shipping</option>
                            <option value="billing">Billing</option>
                            <option value="home">Home</option>
                            <option value="work">Work</option>
                            <option value="other">Other</option>
                          </select>
                          {addressErrors.address_type && (
                            <p className="text-red-500 text-sm mt-1">{addressErrors.address_type}</p>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 1 *
                          </label>
                          <Input
                            value={addressForm.address_line_1}
                            onChange={(e) => handleAddressChange('address_line_1', e.target.value)}
                            placeholder="Street address, P.O. box, company name, c/o"
                            className={addressErrors.address_line_1 ? 'border-red-500' : ''}
                          />
                          <div className="flex justify-between mt-1">
                            {addressErrors.address_line_1 && (
                              <p className="text-red-500 text-sm">{addressErrors.address_line_1}</p>
                            )}
                            <p className="text-gray-500 text-sm ml-auto">{addressForm.address_line_1.length}/255</p>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 2
                          </label>
                          <Input
                            value={addressForm.address_line_2}
                            onChange={(e) => handleAddressChange('address_line_2', e.target.value)}
                            placeholder="Apartment, suite, unit, building, floor, etc."
                            className={addressErrors.address_line_2 ? 'border-red-500' : ''}
                          />
                          <div className="flex justify-between mt-1">
                            {addressErrors.address_line_2 && (
                              <p className="text-red-500 text-sm">{addressErrors.address_line_2}</p>
                            )}
                            <p className="text-gray-500 text-sm ml-auto">{addressForm.address_line_2.length}/255</p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City *
                          </label>
                          <Input
                            value={addressForm.city}
                            onChange={(e) => handleAddressChange('city', e.target.value)}
                            placeholder="Enter city"
                            className={addressErrors.city ? 'border-red-500' : ''}
                          />
                          <div className="flex justify-between mt-1">
                            {addressErrors.city && (
                              <p className="text-red-500 text-sm">{addressErrors.city}</p>
                            )}
                            <p className="text-gray-500 text-sm ml-auto">{addressForm.city.length}/100</p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State/Province *
                          </label>
                          <Input
                            value={addressForm.state_province}
                            onChange={(e) => handleAddressChange('state_province', e.target.value)}
                            placeholder="Enter state/province"
                            className={addressErrors.state_province ? 'border-red-500' : ''}
                          />
                          <div className="flex justify-between mt-1">
                            {addressErrors.state_province && (
                              <p className="text-red-500 text-sm">{addressErrors.state_province}</p>
                            )}
                            <p className="text-gray-500 text-sm ml-auto">{addressForm.state_province.length}/100</p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Postal Code *
                          </label>
                          <Input
                            value={addressForm.postal_code}
                            onChange={(e) => handleAddressChange('postal_code', e.target.value)}
                            placeholder="Enter postal code"
                            className={addressErrors.postal_code ? 'border-red-500' : ''}
                          />
                          <div className="flex justify-between mt-1">
                            {addressErrors.postal_code && (
                              <p className="text-red-500 text-sm">{addressErrors.postal_code}</p>
                            )}
                            <p className="text-gray-500 text-sm ml-auto">{addressForm.postal_code.length}/20</p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country *
                          </label>
                          <Input
                            value={addressForm.country}
                            onChange={(e) => handleAddressChange('country', e.target.value)}
                            placeholder="Enter country"
                            className={addressErrors.country ? 'border-red-500' : ''}
                          />
                          <div className="flex justify-between mt-1">
                            {addressErrors.country && (
                              <p className="text-red-500 text-sm">{addressErrors.country}</p>
                            )}
                            <p className="text-gray-500 text-sm ml-auto">{addressForm.country.length}/100</p>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <Input
                            value={addressForm.phone}
                            onChange={(e) => handleAddressChange('phone', e.target.value)}
                            placeholder="Enter phone number"
                            className={addressErrors.phone ? 'border-red-500' : ''}
                          />
                          <div className="flex justify-between mt-1">
                            {addressErrors.phone && (
                              <p className="text-red-500 text-sm">{addressErrors.phone}</p>
                            )}
                            <p className="text-gray-500 text-sm ml-auto">e.g., +94 77 123 4567</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddress(null);
                            setAddressErrors({});
                            setAddressForm({
                              full_name: '',
                              address_line_1: '',
                              address_line_2: '',
                              city: '',
                              state_province: '',
                              postal_code: '',
                              country: 'Sri Lanka',
                              phone: '',
                              address_type: 'shipping',
                            });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {isLoading ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Address List */}
                <div className="space-y-4">
                  {addresses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No addresses added yet</p>
                      <p className="text-sm">Add your first address to get started</p>
                    </div>
                  ) : (
                    addresses.map((address) => (
                      <div key={address.id} className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h5 className="font-medium text-gray-900">{address.full_name}</h5>
                              {address.is_default && (
                                <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                                  Default
                                </span>
                              )}
                              <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full capitalize">
                                {address.address_type}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">
                              {address.address_line_1}
                              {address.address_line_2 && `, ${address.address_line_2}`}
                            </p>
                            <p className="text-gray-700 text-sm">
                              {address.city}, {address.state_province} {address.postal_code}
                            </p>
                            <p className="text-gray-700 text-sm">{address.country}</p>
                            {address.phone && (
                              <p className="text-gray-700 text-sm">{address.phone}</p>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            {!address.is_default && (
                              <Button
                                onClick={() => handleSetDefaultAddress(address.id)}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                              >
                                Set Default
                              </Button>
                            )}
                            <Button
                              onClick={() => handleEditAddress(address)}
                              variant="outline"
                              size="sm"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => confirmDeleteAddress(address.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
      
      {/* Delete Address Confirmation Dialog */}
      <AlertDialog open={!!deleteAddressId} onOpenChange={() => setDeleteAddressId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteAddressId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAddress}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Avatar Confirmation Dialog */}
      <AlertDialog open={showRemoveAvatarDialog} onOpenChange={() => setShowRemoveAvatarDialog(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Profile Picture</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove your profile picture? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowRemoveAvatarDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveAvatar}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AnimatePresence>
  );
};

export default ProfileEditModal;
