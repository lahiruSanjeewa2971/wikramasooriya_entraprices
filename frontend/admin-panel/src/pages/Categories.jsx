import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Tags,
  Package
} from 'lucide-react';
import adminService from '../services/adminService';
import CategoryModal from '../components/CategoryModal';
import { categoryToast } from '../services/toastService';

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ['admin-categories', searchTerm],
    queryFn: () => adminService.getCategories(),
    onError: (error) => {
      categoryToast.fetchError(error.message || 'Failed to fetch categories');
    }
  });

  const createMutation = useMutation({
    mutationFn: adminService.createCategory,
    onSuccess: (response) => {
      const categoryName = response?.data?.category?.name || 'Category';
      categoryToast.created(categoryName);
      queryClient.invalidateQueries(['admin-categories']);
      setShowCreateModal(false);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error';
      if (errorMessage.includes('already exists')) {
        categoryToast.nameExists(error.response?.data?.error?.details?.[0]?.value || 'Category');
      } else {
        categoryToast.createError(errorMessage);
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminService.updateCategory(id, data),
    onSuccess: (response) => {
      const categoryName = response?.data?.category?.name || 'Category';
      categoryToast.updated(categoryName);
      queryClient.invalidateQueries(['admin-categories']);
      setEditingCategory(null);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error';
      if (errorMessage.includes('already exists')) {
        categoryToast.nameExists(error.response?.data?.error?.details?.[0]?.value || 'Category');
      } else {
        categoryToast.updateError(errorMessage);
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteCategory,
    onSuccess: (response, variables) => {
      // Find the category name from the current categories list
      const deletedCategory = categoriesData?.data?.categories.find(cat => cat.id === variables);
      const categoryName = deletedCategory?.name || 'Category';
      categoryToast.deleted(categoryName);
      queryClient.invalidateQueries(['admin-categories']);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error';
      
      if (errorMessage.includes('Cannot delete category') && errorMessage.includes('product(s)')) {
        // Extract category name and product count from error message
        const match = errorMessage.match(/category "([^"]+)".*?(\d+) product\(s\)/);
        if (match) {
          const [, categoryName, productCount] = match;
          categoryToast.deleteWarning(categoryName, productCount);
        } else {
          categoryToast.deleteError(errorMessage);
        }
      } else {
        categoryToast.deleteError(errorMessage);
      }
    }
  });

  const handleCreate = (categoryData) => {
    categoryToast.loading();
    createMutation.mutate(categoryData);
  };

  const handleUpdate = (id, categoryData) => {
    categoryToast.loading();
    updateMutation.mutate({ id, data: categoryData });
  };

  const handleDelete = (id) => {
    const category = categoriesData?.data?.categories.find(cat => cat.id === id);
    const categoryName = category?.name || 'this category';
    
    if (window.confirm(`Are you sure you want to delete "${categoryName}"? This will affect all products in this category.`)) {
      deleteMutation.mutate(id);
    }
  };

  const categories = categoriesData?.data?.categories || [];
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage product categories
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
        <div className="max-w-md w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Categories
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 ">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))
        ) : filteredCategories.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Tags className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No categories</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No categories match your search.' : 'Get started by creating a new category.'}
            </p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div key={category.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 min-h-[180px] flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <Tags className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate" title={category.name}>
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {category.product_count || 0} products
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title="Edit category"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {category.description && (
                <div className="flex-1 mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2" title={category.description}>
                    {category.description}
                  </p>
                </div>
              )}
              
              <div className="mt-auto flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-500 dark:text-gray-400 truncate flex-1 mr-2" title={`Created: ${new Date(category.created_at).toLocaleDateString()}`}>
                  {new Date(category.created_at).toLocaleDateString()}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                  category.is_active 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCategory) && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setShowCreateModal(false);
            setEditingCategory(null);
          }}
          onSubmit={editingCategory ? handleUpdate : handleCreate}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
