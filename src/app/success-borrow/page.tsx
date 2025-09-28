'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { booksApi } from '@/lib/api';
import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';

function SuccessBorrowPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookId = searchParams.get('id');
  const [returnDate, setReturnDate] = useState('');

  const { data: bookData, isLoading: bookLoading } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => (bookId ? booksApi.getById(Number(bookId)) : null),
    enabled: !!bookId,
    staleTime: 60_000,
  });

  const book = bookData?.data;

  useEffect(() => {
    if (bookId) {
      // Calculate return date (3 days from now)
      const today = new Date();
      const returnDate = new Date(today);
      returnDate.setDate(today.getDate() + 3);

      const formattedDate = returnDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      setReturnDate(formattedDate);
    }
  }, [bookId]);

  const handleSeeBorrowedList = () => {
    router.push('/profile?tab=borrowed');
  };

  if (bookLoading) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <div className="text-gray-800 font-['Quicksand']">Loading...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white flex flex-col items-center justify-center px-4'>
      {/* Success Icon */}
      <div className='mb-8'>
        <div className='w-24 h-24 border-4 border-gray-800 rounded-full flex items-center justify-center mb-4'>
          <div className='w-16 h-16 bg-[#1c65da] rounded-full flex items-center justify-center'>
            <svg
              className='w-8 h-8 text-white'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className='text-center mb-8'>
        <h1 className="text-3xl font-bold text-gray-800 mb-4 font-['Quicksand']">
          Borrowing Successful!
        </h1>

        <div className="text-gray-600 text-lg mb-2 font-['Quicksand']">
          Your book has been successfully borrowed. Please return it by{' '}
          <span className='text-pink-500 font-semibold'>{returnDate}</span>
        </div>
      </div>

      {/* Book Info */}
      {book && (
        <div className='bg-gray-100 rounded-lg p-4 mb-8 max-w-md w-full border border-gray-200'>
          <div className='flex items-center space-x-4'>
            {book.coverImage ? (
              <Image
                src={book.coverImage as string}
                alt={book.title || 'Book cover'}
                width={64}
                height={80}
                className='w-16 h-20 object-cover rounded'
              />
            ) : (
              <div className='w-16 h-20 bg-gray-300 rounded flex items-center justify-center'>
                <span className="text-gray-500 text-xs font-['Quicksand']">
                  No Image
                </span>
              </div>
            )}
            <div className='flex-1'>
              <h3 className="text-gray-800 font-semibold text-lg font-['Quicksand']">
                {book.title}
              </h3>
              <p className="text-gray-600 text-sm font-['Quicksand']">
                by{' '}
                {typeof book.author === 'string'
                  ? book.author
                  : book.author?.name || 'Unknown Author'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleSeeBorrowedList}
        className="bg-[#1c65da] hover:bg-[#1557c4] text-white font-semibold py-3 px-8 rounded-lg transition-colors font-['Quicksand']"
      >
        See Borrowed List
      </button>
    </div>
  );
}

export default function SuccessBorrowPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessBorrowPageContent />
    </Suspense>
  );
}
