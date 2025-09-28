'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { booksApi } from '@/lib/api';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import ReviewModal from '@/app/components/ReviewModal';

function ReviewPageContent() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('id');
  const [showReviewModal, setShowReviewModal] = useState(false);

  console.log('showReviewModal state:', showReviewModal);

  const {
    data: bookData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => (bookId ? booksApi.getById(Number(bookId)) : null),
    enabled: !!bookId,
    staleTime: 60_000,
  });

  const book = bookData?.data;

  if (isLoading) {
    return (
      <div className='min-h-screen bg-white'>
        <Navbar />
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>Loading book details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className='min-h-screen bg-white'>
        <Navbar />
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-gray-900 mb-4'>
              Book not found
            </h1>
            <p className='text-gray-600'>
              The book you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white'>
      <Navbar />

      {/* Main Content */}
      <div className='max-w-4xl mx-auto px-4 py-8'>
        {/* Test Button */}
        <div className='mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg'>
          <button
            onClick={() => {
              console.log('TEST BUTTON CLICKED');
              alert('Test button works!');
              setShowReviewModal(true);
            }}
            className='bg-red-600 text-white font-bold py-2 px-4 rounded cursor-pointer'
          >
            TEST BUTTON - Click Me
          </button>
          <p className='text-sm text-gray-600 mt-2'>
            If this button works, the issue is with the other buttons
          </p>
        </div>
        {/* Book Info */}
        <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
          <div className='flex flex-col md:flex-row gap-6'>
            {/* Book Cover */}
            <div className='flex-shrink-0'>
              <div
                className='w-48 h-72 mx-auto md:mx-0 bg-cover bg-center bg-no-repeat rounded-lg shadow-md'
                style={{
                  backgroundImage: `url(${
                    book.coverImage || '/images/education.png'
                  })`,
                }}
              />
            </div>

            {/* Book Details */}
            <div className='flex-1 relative'>
              <h1 className='text-3xl font-bold text-gray-900 mb-4'>
                {book.title}
              </h1>

              <div className='mb-4'>
                <p className='text-lg text-gray-600 mb-2'>
                  by{' '}
                  {typeof book.author === 'object'
                    ? book.author?.name
                    : book.author || 'Unknown Author'}
                </p>
                <p className='text-sm text-gray-500'>
                  {book.category?.name || 'Uncategorized'}
                </p>
              </div>

              {/* Rating Display */}
              <div className='flex items-center space-x-2 mb-6'>
                <div className='flex items-center'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= (book.rating || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  ))}
                </div>
                <span className='text-sm text-gray-600'>
                  {(book.rating || 0).toFixed(1)} ({book.reviewCount || 0}{' '}
                  reviews)
                </span>
              </div>

              {/* Description */}
              {book.description && (
                <div className='mb-6'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    Description
                  </h3>
                  <p className='text-gray-700 leading-relaxed'>
                    {book.description}
                  </p>
                </div>
              )}

              {/* Give Review Button */}
              <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
                <button
                  onClick={() => {
                    console.log('Give Review button clicked');
                    setShowReviewModal(true);
                  }}
                  className='bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer'
                  type='button'
                >
                  Give Review
                </button>
                <p className='text-xs text-gray-500 mt-2'>
                  Click this button to open review modal
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className='bg-white rounded-2xl shadow-lg p-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>Reviews</h2>
          <p className='text-gray-600 mb-4'>
            Share your thoughts about this book and help other readers make
            informed decisions.
          </p>

          {/* Alternative Give Review Button */}
          <div className='border-2 border-dashed border-gray-300 p-4 rounded-lg text-center'>
            <button
              onClick={() => {
                console.log('Alternative Give Review button clicked');
                setShowReviewModal(true);
              }}
              className='bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors cursor-pointer'
              type='button'
            >
              Alternative Give Review Button
            </button>
            <p className='text-xs text-gray-500 mt-2'>
              Try this button if the one above doesn&apos;t work
            </p>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          console.log('Closing modal');
          setShowReviewModal(false);
        }}
        bookId={book.id}
        bookTitle={book.title}
      />

      <Footer />
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-white'>
          <Navbar />
          <div className='flex items-center justify-center min-h-[400px]'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
          </div>
          <Footer />
        </div>
      }
    >
      <ReviewPageContent />
    </Suspense>
  );
}
