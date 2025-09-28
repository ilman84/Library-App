'use client';

import { useState } from 'react';
import {
  useAuthors,
  useCreateAuthor,
  useUpdateAuthor,
  useDeleteAuthor,
} from '../../../../hooks/api/useAuthors';

export default function AdminAuthors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<{
    id: number;
    name: string;
    bio?: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: authorsData, isLoading, refetch } = useAuthors();
  const createAuthorMutation = useCreateAuthor();
  const updateAuthorMutation = useUpdateAuthor();
  const deleteAuthorMutation = useDeleteAuthor();

  const authors = authorsData?.data?.authors || [];

  const filteredAuthors = authors.filter((author) =>
    author.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateAuthor = async (authorData: {
    name: string;
    bio?: string;
  }) => {
    try {
      await createAuthorMutation.mutateAsync(authorData);
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      console.error('Failed to create author:', error);
    }
  };

  const handleUpdateAuthor = async (authorData: {
    name: string;
    bio?: string;
  }) => {
    if (!editingAuthor) return;

    try {
      await updateAuthorMutation.mutateAsync({
        id: editingAuthor.id,
        data: authorData,
      });
      setEditingAuthor(null);
      refetch();
    } catch (error) {
      console.error('Failed to update author:', error);
    }
  };

  const handleDeleteAuthor = async (authorId: number) => {
    try {
      await deleteAuthorMutation.mutateAsync(authorId);
      setDeleteConfirm(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete author:', error);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className='mb-8'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 font-quicksand'>
              Author Management
            </h1>
            <p className='text-gray-600 font-quicksand'>Manage book authors</p>
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
            Add New Author
          </button>
        </div>
      </div>

      {/* Search */}
      <div className='bg-white rounded-lg shadow p-6 mb-6'>
        <input
          type='text'
          placeholder='Search authors by name...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        />
      </div>

      {/* Authors Grid */}
      <div className='bg-white rounded-lg shadow'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900 font-quicksand'>
            Authors ({filteredAuthors.length})
          </h3>
        </div>

        {isLoading ? (
          <div className='p-8 text-center'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            <p className='mt-2 text-gray-600'>Loading authors...</p>
          </div>
        ) : filteredAuthors.length === 0 ? (
          <div className='p-8 text-center text-gray-500'>No authors found</div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6'>
            {filteredAuthors.map((author) => (
              <div
                key={author.id}
                className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
              >
                <div className='flex items-start justify-between mb-3'>
                  <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                    <span className='text-blue-600 font-semibold text-lg'>
                      {author.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => setEditingAuthor(author)}
                      className='text-blue-600 hover:text-blue-800 text-sm'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(author.id)}
                      className='text-red-600 hover:text-red-800 text-sm'
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <h4 className='font-semibold text-gray-900 mb-2'>
                  {author.name}
                </h4>
                <p className='text-gray-600 text-sm line-clamp-3'>
                  {author.bio || 'No biography available'}
                </p>
                <div className='mt-3 text-xs text-gray-500'>
                  Added:{' '}
                  {author.createdAt
                    ? new Date(author.createdAt).toLocaleDateString()
                    : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Author Modal */}
      {(showCreateModal || editingAuthor) && (
        <AuthorFormModal
          author={editingAuthor}
          onSave={editingAuthor ? handleUpdateAuthor : handleCreateAuthor}
          onClose={() => {
            setShowCreateModal(false);
            setEditingAuthor(null);
          }}
          isLoading={
            createAuthorMutation.isPending || updateAuthorMutation.isPending
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
              Are you sure you want to delete this author? This action cannot be
              undone.
            </p>
            <div className='flex gap-4 justify-end'>
              <button
                onClick={() => setDeleteConfirm(null)}
                className='px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAuthor(deleteConfirm)}
                disabled={deleteAuthorMutation.isPending}
                className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50'
              >
                {deleteAuthorMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Author Form Modal Component
function AuthorFormModal({
  author,
  onSave,
  onClose,
  isLoading,
}: {
  author?: { id: number; name: string; bio?: string } | null;
  onSave: (data: { name: string; bio?: string }) => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: author?.name || '',
    bio: author?.bio || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isEditing = !!author;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg max-w-md w-full'>
        <div className='p-6 border-b border-gray-200'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold text-gray-900 font-quicksand'>
              {isEditing ? 'Edit Author' : 'Add New Author'}
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
              placeholder='Enter author name'
            />
          </div>

          <div>
            <label
              htmlFor='bio'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Biography
            </label>
            <textarea
              id='bio'
              value={formData.bio}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bio: e.target.value }))
              }
              rows={4}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='Enter author biography'
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
