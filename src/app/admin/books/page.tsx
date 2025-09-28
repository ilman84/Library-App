'use client';

import { useState } from 'react';
import {
  useAdminBooks,
  useAdminDeleteBook,
} from '../../../../hooks/api/useAdmin';
import { useCategories } from '../../../../hooks/api/useCategories';
import { useAuthors } from '../../../../hooks/api/useAuthors';
import { Book } from '../../../../lib/api/config';
import BookFormModal from '@/app/admin/books/BookFormModal';
import Image from 'next/image';

export default function AdminBooks() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const {
    data: booksData,
    isLoading,
    refetch,
  } = useAdminBooks({ page: currentPage, limit: 10 });
  const { data: categoriesData } = useCategories();
  const { data: authorsData } = useAuthors();
  const deleteBookMutation = useAdminDeleteBook();

  // Extract data from API responses
  const books = booksData?.data?.data?.books || [];
  interface Category {
    id: number;
    name: string;
    createdAt?: string;
    updatedAt?: string;
  }
  const categories =
    (categoriesData?.data as { categories?: Category[] })?.categories || [];
  const pagination = booksData?.data?.data?.pagination;

  const filteredBooks = books.filter((book: Book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof book.author === 'string' ? book.author : book.author?.name || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || book.categoryId?.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteBook = async (bookId: number) => {
    try {
      await deleteBookMutation.mutateAsync(bookId);
      setDeleteConfirm(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete book:', error);
    }
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingBook(null);
    refetch();
  };

  return (
    <div>
      {/* Page Header */}
      <div className='mb-8'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 font-quicksand'>
              Book Management
            </h1>
            <p className='text-gray-600 font-quicksand'>
              Manage your library collection
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
            Add New Book
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className='bg-white rounded-lg shadow p-6 mb-6'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1'>
            <input
              type='text'
              placeholder='Search books by title or author...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
          <div className='sm:w-48'>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value=''>All Categories</option>
              {categories.map((category: Category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Books Table */}
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900 font-quicksand'>
            Books ({filteredBooks.length})
          </h3>
        </div>

        {isLoading ? (
          <div className='p-8 text-center'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            <p className='mt-2 text-gray-600'>Loading books...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className='p-8 text-center text-gray-500'>No books found</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Book
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Author
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Category
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Copies
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredBooks.map((book: Book) => (
                  <tr key={book.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='w-12 h-16 bg-gray-200 rounded flex-shrink-0 relative'>
                          {book.coverImage ? (
                            <Image
                              src={book.coverImage}
                              alt={book.title}
                              fill
                              className='object-cover rounded'
                              sizes='48px'
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center text-gray-400'>
                              <svg
                                className='w-6 h-6'
                                fill='currentColor'
                                viewBox='0 0 20 20'
                              >
                                <path
                                  fillRule='evenodd'
                                  d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z'
                                  clipRule='evenodd'
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900 max-w-xs truncate'>
                            {book.title}
                          </div>
                          <div className='text-sm text-gray-500'>
                            ISBN: {book.isbn || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {typeof book.author === 'string'
                        ? book.author
                        : book.author?.name || 'Unknown'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {categories.find(
                        (cat: Category) => cat.id === book.categoryId
                      )?.name || 'Uncategorized'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      <div>
                        <div>Total: {book.totalCopies || 0}</div>
                        <div className='text-green-600'>
                          Available: {book.availableCopies || 0}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          (book.availableCopies || 0) > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {(book.availableCopies || 0) > 0
                          ? 'Available'
                          : 'Out of Stock'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex justify-end gap-2'>
                        <button
                          onClick={() => handleEditBook(book)}
                          className='text-blue-600 hover:text-blue-900'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(book.id)}
                          className='text-red-600 hover:text-red-900 ml-4'
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
            <div className='text-sm text-gray-700'>
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
              of {pagination.total} books
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={pagination.page === 1}
                className='px-3 py-2 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, pagination.totalPages)
                  )
                }
                disabled={pagination.page === pagination.totalPages}
                className='px-3 py-2 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Book Modal */}
      {(showCreateModal || editingBook) && (
        <BookFormModal
          book={editingBook || undefined}
          categories={
            categories as unknown as import('@/lib/api/config').Category[]
          }
          authors={authorsData?.data?.authors || []}
          onClose={handleCloseModal}
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
              Are you sure you want to delete this book? This action cannot be
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
                onClick={() => handleDeleteBook(deleteConfirm)}
                disabled={deleteBookMutation.isPending}
                className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50'
              >
                {deleteBookMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
