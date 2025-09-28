'use client';

import { useState, useEffect } from 'react';
import {
  useAdminCreateBook,
  useAdminUpdateBook,
} from '../../../../hooks/api/useAdmin';

import { Book, Category, Author } from '../../../../lib/api/config';

interface BookFormModalProps {
  book?: Book;
  categories: Category[];
  authors: Author[];
  onClose: () => void;
}

export default function BookFormModal({
  book,
  categories,
  authors,
  onClose,
}: BookFormModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isbn: '',
    publishedYear: new Date().getFullYear(),
    coverImage: '',
    authorId: '',
    categoryId: '',
    totalCopies: 1,
    availableCopies: 1,
  });

  const createBookMutation = useAdminCreateBook();
  const updateBookMutation = useAdminUpdateBook();

  const isEditing = !!book;

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        description: book.description || '',
        isbn: book.isbn || '',
        publishedYear: book.publishedYear || new Date().getFullYear(),
        coverImage: book.coverImage || '',
        authorId:
          typeof book.author === 'object' && book.author?.id
            ? book.author.id.toString()
            : '',
        categoryId: book.categoryId?.toString() || '',
        totalCopies: book.totalCopies || 1,
        availableCopies: book.availableCopies || 1,
      });
    }
  }, [book]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'publishedYear' ||
        name === 'totalCopies' ||
        name === 'availableCopies' ||
        name === 'authorId' ||
        name === 'categoryId'
          ? value === ''
            ? ''
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitData = {
        ...formData,
        authorId: Number(formData.authorId),
        categoryId: Number(formData.categoryId),
      };

      if (isEditing) {
        await updateBookMutation.mutateAsync({ id: book.id, data: submitData });
      } else {
        await createBookMutation.mutateAsync(submitData);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save book:', error);
    }
  };

  const isLoading =
    createBookMutation.isPending || updateBookMutation.isPending;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='p-6 border-b border-gray-200'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold text-gray-900 font-quicksand'>
              {isEditing ? 'Edit Book' : 'Add New Book'}
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

        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* Title */}
          <div>
            <label
              htmlFor='title'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Title *
            </label>
            <input
              type='text'
              id='title'
              name='title'
              value={formData.title}
              onChange={handleInputChange}
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='Enter book title'
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor='description'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Description
            </label>
            <textarea
              id='description'
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='Enter book description'
            />
          </div>

          {/* ISBN and Published Year */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='isbn'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                ISBN
              </label>
              <input
                type='text'
                id='isbn'
                name='isbn'
                value={formData.isbn}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Enter ISBN'
              />
            </div>
            <div>
              <label
                htmlFor='publishedYear'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Published Year
              </label>
              <input
                type='number'
                id='publishedYear'
                name='publishedYear'
                value={formData.publishedYear}
                onChange={handleInputChange}
                min='1000'
                max={new Date().getFullYear()}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label
              htmlFor='coverImage'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Cover Image URL
            </label>
            <input
              type='url'
              id='coverImage'
              name='coverImage'
              value={formData.coverImage}
              onChange={handleInputChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='Enter cover image URL'
            />
          </div>

          {/* Author and Category */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='authorId'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Author *
              </label>
              <select
                id='authorId'
                name='authorId'
                value={formData.authorId}
                onChange={handleInputChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>Select an author</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor='categoryId'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Category *
              </label>
              <select
                id='categoryId'
                name='categoryId'
                value={formData.categoryId}
                onChange={handleInputChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Copies */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='totalCopies'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Total Copies *
              </label>
              <input
                type='number'
                id='totalCopies'
                name='totalCopies'
                value={formData.totalCopies}
                onChange={handleInputChange}
                min='1'
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
            <div>
              <label
                htmlFor='availableCopies'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Available Copies *
              </label>
              <input
                type='number'
                id='availableCopies'
                name='availableCopies'
                value={formData.availableCopies}
                onChange={handleInputChange}
                min='0'
                max={formData.totalCopies}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className='flex gap-4 justify-end pt-6 border-t border-gray-200'>
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
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading
                ? 'Saving...'
                : isEditing
                ? 'Update Book'
                : 'Create Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
