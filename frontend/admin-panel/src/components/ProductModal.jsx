import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import ImageUpload from './ImageUpload';
import ImageUploadService from '../services/imageUploadService';
import { toast } from 'react-toastify';

// Zod validation schema
const productSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(200, 'Name cannot exceed 200 characters'),
  sku: z.string()
    .min(3, 'SKU must be at least 3 characters')
    .max(50, 'SKU cannot exceed 50 characters'),
  description: z.string().optional(),
  short_description: z.string().max(500, 'Short description cannot exceed 500 characters').optional(),
  image_url: z.string().optional().or(z.literal('')),
  image_public_id: z.string().optional().or(z.literal('')),
  price: z.coerce.number()
    .positive('Price must be a positive number')
    .min(0.01, 'Price must be at least $0.01'),
  stock_qty: z.coerce.number()
    .int('Stock quantity must be a whole number')
    .min(0, 'Stock quantity cannot be negative'),
  category_id: z.coerce.number().positive('Please select a valid category').optional(),
  featured: z.boolean().default(false),
  new_arrival: z.boolean().default(false),
  weight: z.coerce.number().positive('Weight must be a positive number').optional(),
  dimensions: z.any().optional(),
  is_active: z.boolean().default(true),
});

export default function ProductModal({ product, categories, onClose, onSubmit, isLoading }) {
  const [productImage, setProductImage] = useState(product?.image_url || null);
  const [originalImage, setOriginalImage] = useState(null); // Track original image state
  const [pendingImageDeletion, setPendingImageDeletion] = useState(false); // Track if image is marked for deletion

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      short_description: '',
      image_url: '',
      image_public_id: '',
      price: '',
      stock_qty: '',
      category_id: undefined,
      featured: false,
      new_arrival: false,
      weight: '',
      dimensions: null,
      is_active: true,
    },
  });

  // Update form data when product changes
  useEffect(() => {
    if (product) {
      const imageData = product.image_url ? {
        url: product.image_url,
        public_id: product.image_public_id || `product_${product.id}`, // Use actual public_id if available
        secure_url: product.image_url,
        original_name: 'product_image.jpg',
        format: 'JPG',
        size: 0,
        width: 800,
        height: 600
      } : null;
      
      setProductImage(imageData);
      setOriginalImage(imageData); // Store original image state
      setPendingImageDeletion(false); // Reset deletion flag
      
      form.reset({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        short_description: product.short_description || '',
        image_url: product.image_url || '',
        image_public_id: product.image_public_id || '',
        price: product.price || '',
        stock_qty: product.stock_qty || '',
        category_id: product.category_id || undefined,
        featured: product.featured || false,
        new_arrival: product.new_arrival || false,
        weight: product.weight || '',
        dimensions: product.dimensions || null,
        is_active: product.is_active ?? true,
      });
    } else {
      setProductImage(null);
      setOriginalImage(null);
      setPendingImageDeletion(false);
      
      form.reset({
        name: '',
        sku: '',
        description: '',
        short_description: '',
        image_url: '',
        image_public_id: '',
        price: '',
        stock_qty: '',
        category_id: undefined,
        featured: false,
        new_arrival: false,
        weight: '',
        dimensions: null,
        is_active: true,
      });
    }
  }, [product, form]);

  // Handle image changes
  const handleImageChange = (imageData) => {
    console.log('🔍 ProductModal - handleImageChange received:', imageData);
    console.log('🔍 ProductModal - image_public_id:', imageData?.public_id);
    
    setProductImage(imageData);
    setPendingImageDeletion(false); // Clear pending deletion when new image is uploaded
    form.setValue('image_url', imageData?.url || '');
    form.setValue('image_public_id', imageData?.public_id || '');
    
    console.log('🔍 ProductModal - Form values after setting:', {
      image_url: form.getValues('image_url'),
      image_public_id: form.getValues('image_public_id')
    });
  };

  const handleImageRemove = () => {
    // If there's a current image, mark it for deletion
    if (productImage?.public_id) {
      setProductImage(null);
      setPendingImageDeletion(true);
      form.setValue('image_url', '');
      form.setValue('image_public_id', '');
      toast.success('Image marked for removal. Click Save to confirm deletion.');
    }
    // If there's no current image but we have an original image, mark it for deletion
    else if (originalImage?.public_id && !pendingImageDeletion) {
      setPendingImageDeletion(true);
      form.setValue('image_url', '');
      form.setValue('image_public_id', '');
      toast.success('Image marked for removal. Click Save to confirm deletion.');
    }
  };

  const handleImageRestore = () => {
    if (originalImage) {
      setProductImage(originalImage);
      setPendingImageDeletion(false);
      form.setValue('image_url', originalImage.url || '');
      form.setValue('image_public_id', originalImage.public_id || '');
      toast.info('Image restored.');
    }
  };

  const handleCancel = () => {
    // Revert image changes if any
    if (pendingImageDeletion && originalImage) {
      setProductImage(originalImage);
      setPendingImageDeletion(false);
      form.setValue('image_url', originalImage.url || '');
      form.setValue('image_public_id', originalImage.public_id || '');
      toast.info('Image changes reverted.');
    }
    
    // Close modal
    onClose();
  };

  const handleSubmit = async (data) => {
    console.log('🔍 ProductModal - Form data before processing:', data);
    console.log('🔍 ProductModal - Current productImage:', productImage);
    console.log('🔍 ProductModal - Form values for image fields:', {
      image_url: form.getValues('image_url'),
      image_public_id: form.getValues('image_public_id')
    });
    console.log('🔍 ProductModal - Pending image deletion:', pendingImageDeletion);
    console.log('🔍 ProductModal - Original image:', originalImage);
    
    try {
      // If there's a pending image deletion, call the Cloudinary API first
      if (pendingImageDeletion && originalImage?.public_id) {
        console.log('🔍 ProductModal - Deleting image from Cloudinary:', originalImage.public_id);
        await ImageUploadService.deleteImage(originalImage.public_id);
        console.log('🔍 ProductModal - Image deleted from Cloudinary successfully');
      }
      
      // Include the current image data in the submission
      // If productImage is null (image deleted), explicitly set image fields to empty
      const submitData = {
        ...data,
        image_url: productImage ? productImage.url : '',
        image_public_id: productImage ? productImage.public_id : ''
      };
      
      console.log('🔍 ProductModal - Final submit data:', submitData);
      console.log('🔍 ProductModal - image_public_id in submit:', submitData.image_public_id);
      console.log('🔍 ProductModal - image_url in submit:', submitData.image_url);

      if (product) {
        await onSubmit(product.id, submitData);
      } else {
        await onSubmit(submitData);
      }
      
      // Clear pending deletion flag after successful save
      setPendingImageDeletion(false);
      
    } catch (error) {
      console.error('🔍 ProductModal - Error during submission:', error);
      
      // If there was an error and we had pending deletion, revert the image
      if (pendingImageDeletion && originalImage) {
        setProductImage(originalImage);
        setPendingImageDeletion(false);
        form.setValue('image_url', originalImage.url || '');
        form.setValue('image_public_id', originalImage.public_id || '');
        toast.error('Failed to save product. Image changes reverted.');
      } else {
        toast.error('Failed to save product.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white dark:bg-gray-800">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
              {product ? 'Edit Product' : 'Create Product'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Product name"
                            {...field}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          SKU <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Product SKU"
                            {...field}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Product description"
                          {...field}
                          className="w-full"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="short_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Short Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief product description"
                          rows={2}
                          {...field}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image Upload Section */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Product Image
                  </Label>
                  <ImageUpload
                    currentImage={productImage}
                    onImageChange={handleImageChange}
                    onImageRemove={handleImageRemove}
                    onImageRestore={handleImageRestore}
                    disabled={isLoading}
                    className="w-full"
                    isMarkedForDeletion={pendingImageDeletion}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Price <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="stock_qty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Stock Quantity
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Weight (kg)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Category
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Featured Product
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="new_arrival"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            New Arrival
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Active Product
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : (product ? 'Update' : 'Create')}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
