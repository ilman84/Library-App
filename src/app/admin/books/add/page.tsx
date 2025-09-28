'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthors } from '@/hooks/api/useAuthors';
import { useCategories } from '@/hooks/api/useCategories';
import { useAdminCreateBook } from '@/hooks/api/useAdmin';

export default function AdminAddBookPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createBook = useAdminCreateBook();
  const { data: authorsResp, isLoading: authorsLoading } = useAuthors();
  const { data: categoriesResp, isLoading: categoriesLoading } =
    useCategories();

  const authors = useMemo(
    () =>
      (
        authorsResp?.data as unknown as {
          authors?: Array<{ id: number; name: string }>;
        }
      )?.authors || [],
    [authorsResp?.data]
  );

  const categories = useMemo(
    () =>
      (
        categoriesResp?.data as unknown as {
          categories?: Array<{ id: number; name: string }>;
        }
      )?.categories || [],
    [categoriesResp?.data]
  );

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState<number>(0);
  const [category, setCategory] = useState<number>(0);
  const [pages, setPages] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Set default author and category when data is loaded
  useEffect(() => {
    if (authors.length > 0 && author === 0) {
      setAuthor(authors[0].id);
    }
  }, [authors, author]);

  useEffect(() => {
    if (categories.length > 0 && category === 0) {
      setCategory(categories[0].id);
    }
  }, [categories, category]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Convert to base64 for API
      const reader = new FileReader();
      reader.onload = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoverImage(e.target.value);
    setSelectedFile(null);
    setPreviewUrl('');
  };

  // Clear selected file
  const clearFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl('');
    setCoverImage('');
  };

  const handleSave = async () => {
    try {
      if (!title.trim()) {
        toast.error('Title is required');
        return;
      }
      if (!author || author === 0 || !Number.isInteger(author)) {
        toast.error('Please select a valid author');
        return;
      }
      if (!category || category === 0 || !Number.isInteger(category)) {
        toast.error('Please select a valid category');
        return;
      }
      if (!coverImage.trim()) {
        toast.error('Cover image is required');
        return;
      }

      const bookData = {
        title: title.trim(),
        description: description.trim() || 'No description provided',
        isbn: '978-0-0000-0000-0', // Valid ISBN format
        publishedYear: 2024,
        coverImage: coverImage.trim(),
        authorId: author,
        categoryId: category,
        totalCopies: 1,
        availableCopies: 1,
      };

      console.log(
        '📚 Creating book with data:',
        JSON.stringify(bookData, null, 2)
      );
      console.log(
        '📚 Author ID:',
        author,
        'Type:',
        typeof author,
        'Valid:',
        Number.isInteger(author) && author > 0
      );
      console.log(
        '📚 Category ID:',
        category,
        'Type:',
        typeof category,
        'Valid:',
        Number.isInteger(category) && category > 0
      );
      console.log('📚 Title:', title, 'Length:', title.length);
      console.log('📚 Cover Image:', coverImage, 'Length:', coverImage.length);
      console.log(
        '📚 Published Year:',
        new Date().getFullYear(),
        'Type:',
        typeof new Date().getFullYear()
      );

      await createBook.mutateAsync(bookData);

      // Invalidate all relevant queries to refresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'books'] }),
        queryClient.invalidateQueries({ queryKey: ['books-recommend'] }),
        queryClient.invalidateQueries({ queryKey: ['books'] }),
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['authors'] }),
      ]);

      toast.success('Book created successfully! Redirecting to Book List...');

      // Redirect to admin page with Book List tab active
      router.push('/admin?tab=Book%20List');
    } catch (error) {
      console.error('Error creating book:', error);
      toast.error('Failed to create book');
    }
  };

  if (authorsLoading || categoriesLoading) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-md mx-auto px-4 py-6'>
        <div className='flex items-center gap-2 mb-4'>
          <button
            onClick={() => router.back()}
            className='p-2 rounded hover:bg-gray-100'
          >
            ←
          </button>
          <h1 className='text-xl font-bold font-quicksand'>Add Book</h1>
        </div>

        {/* Title */}
        <label className='block text-sm mb-1'>Title</label>
        <input
          className='w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Author */}
        <label className='block text-sm mt-4 mb-1'>Author</label>
        <select
          className='w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
          value={author}
          onChange={(e) => setAuthor(parseInt(e.target.value))}
        >
          <option value={0}>Select Author</option>
          {authors.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        {/* Category */}
        <label className='block text-sm mt-4 mb-1'>Category</label>
        <select
          className='w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
          value={category}
          onChange={(e) => setCategory(parseInt(e.target.value))}
        >
          <option value={0}>Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Number of Pages */}
        <label className='block text-sm mt-4 mb-1'>Number of Pages</label>
        <input
          type='number'
          className='w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
          value={pages}
          onChange={(e) =>
            setPages(e.target.value ? parseInt(e.target.value) : '')
          }
          placeholder='Optional'
        />

        {/* Description */}
        <label className='block text-sm mt-4 mb-1'>Description</label>
        <textarea
          className='w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Cover Image */}
        <label className='block text-sm mt-4 mb-1'>Cover Image</label>

        {/* File Upload */}
        <div className='mb-3'>
          <input
            type='file'
            accept='image/*'
            onChange={handleFileChange}
            className='w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
          />
          <p className='text-xs text-gray-500 mt-1'>
            Upload an image file (PNG, JPG, max 5MB)
          </p>
        </div>

        {/* URL Input */}
        <div className='mb-3'>
          <label className='block text-xs text-gray-600 mb-1'>
            Or enter image URL:
          </label>
          <input
            type='url'
            className='w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='https://example.com/image.jpg'
            value={selectedFile ? '' : coverImage}
            onChange={handleUrlChange}
            disabled={!!selectedFile}
          />
        </div>

        {/* Image Preview */}
        {(previewUrl || (!selectedFile && coverImage)) && (
          <div className='mt-3'>
            <div className='flex items-center justify-between mb-1'>
              <label className='block text-xs text-gray-600'>Preview:</label>
              {selectedFile && (
                <button
                  type='button'
                  onClick={clearFile}
                  className='text-xs text-red-600 hover:text-red-800 underline'
                >
                  Remove file
                </button>
              )}
            </div>
            <div className='w-full h-48 border border-gray-300 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center relative'>
              <Image
                src={previewUrl || coverImage}
                alt='Cover preview'
                fill
                className='object-contain'
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            {selectedFile && (
              <p className='text-xs text-gray-500 mt-1'>
                Selected: {selectedFile.name} (
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={createBook.isPending}
          className='w-full h-11 mt-6 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50'
        >
          {createBook.isPending ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
