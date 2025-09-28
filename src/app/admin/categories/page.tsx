'use client';

import { useState } from 'react';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../../../hooks/api/useCategories';

export default function AdminCategories() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    id: number;
    name: string;
    description?: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: categoriesData, isLoading, refetch } = useCategories();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  interface Category {
    id: number;
    name: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  const categories =
    (categoriesData?.data as { categories?: Category[] })?.categories || [];

  const filteredCategories = categories.filter((category: Category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCategory = async (categoryData: {
    name: string;
    description?: string;
  }) => {
    try {
      await createCategoryMutation.mutateAsync(categoryData);
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleUpdateCategory = async (categoryData: {
    name: string;
    description?: string;
  }) => {
    if (!editingCategory) return;

    try {
      await updateCategoryMutation.mutateAsync({
        id: editingCategory.id,
        data: categoryData,
      });
      setEditingCategory(null);
      refetch();
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await deleteCategoryMutation.mutateAsync(categoryId);
      setDeleteConfirm(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className='mb-8'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 font-quicksand'>
              Category Management
            </h1>
            <p className='text-gray-600 font-quicksand'>
              Manage book categories
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 4v16m8-8H4'
              />
            </svg>
            Add New Category
          </button>
        </div>
      </div>

      {/* Search */}
      <div className='bg-white rounded-lg shadow p-6 mb-6'>
        <input
          type='text'
          placeholder='Search categories by name...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        />
      </div>

      {/* Categories Grid */}
      <div className='bg-white rounded-lg shadow'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900 font-quicksand'>
            Categories ({filteredCategories.length})
          </h3>
        </div>

        {isLoading ? (
          <div className='p-8 text-center'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            <p className='mt-2 text-gray-600'>Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className='p-8 text-center text-gray-500'>
            No categories found
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6'>
            {filteredCategories.map((category: Category) => (
              <div
                key={category.id}
                className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
              >
                <div className='flex items-start justify-between mb-3'>
                  <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
                    <svg
                      className='w-6 h-6 text-green-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z'
                      />
                    </svg>
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => setEditingCategory(category)}
                      className='text-blue-600 hover:text-blue-800 text-sm'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(category.id)}
                      className='text-red-600 hover:text-red-800 text-sm'
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <h4 className='font-semibold text-gray-900 mb-2'>
                  {category.name}
                </h4>
                <p className='text-gray-600 text-sm line-clamp-3'>
                  {category.description || 'No description available'}
                </p>
                <div className='mt-3 text-xs text-gray-500'>
                  Created:{' '}
                  {category.createdAt
                    ? new Date(category.createdAt).toLocaleDateString()
                    : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Category Modal */}
      {(showCreateModal || editingCategory) && (
        <CategoryFormModal
          category={editingCategory}
          onSave={editingCategory ? handleUpdateCategory : handleCreateCategory}
          onClose={() => {
            setShowCreateModal(false);
            setEditingCategory(null);
          }}
          isLoading={
            createCategoryMutation.isPending || updateCategoryMutation.isPending
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Confirm Delete
            </h3>
            <p className='text-gray-600 mb-6'>
              Are you sure you want to delete this category? This action cannot
              be undone and may affect books in this category.
            </p>
            <div className='flex gap-4 justify-end'>
              <button
                onClick={() => setDeleteConfirm(null)}
                className='px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCategory(deleteConfirm)}
                disabled={deleteCategoryMutation.isPending}
                className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50'
              >
                {deleteCategoryMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Category Form Modal Component
function CategoryFormModal({
  category,
  onSave,
  onClose,
  isLoading,
}: {
  category?: { id: number; name: string; description?: string } | null;
  onSave: (data: { name: string; description?: string }) => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isEditing = !!category;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg max-w-md w-full'>
        <div className='p-6 border-b border-gray-200'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold text-gray-900 font-quicksand'>
              {isEditing ? 'Edit Category' : 'Add New Category'}
            </h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Name *
            </label>
            <input
              type='text'
              id='name'
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='Enter category name'
            />
          </div>

          <div>
            <label
              htmlFor='description'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Description
            </label>
            <textarea
              id='description'
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={4}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='Enter category description'
            />
          </div>

          <div className='flex gap-4 justify-end pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
