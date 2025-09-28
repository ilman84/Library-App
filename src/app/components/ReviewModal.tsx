'use client';

import { useState } from 'react';
import { useCreateReview } from '../../../hooks/api/useReviews';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: number;
  bookTitle?: string;
}

export default function ReviewModal({
  isOpen,
  onClose,
  bookId,
  bookTitle,
}: ReviewModalProps) {
  const { user } = useAuth();
  const createReviewMutation = useCreateReview();

  console.log('ReviewModal rendered - isOpen:', isOpen, 'bookId:', bookId);

  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState('');

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please login to submit a review');
      return;
    }

    if (!comment.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      console.log('Submitting review:', {
        bookId,
        star: rating,
        comment: comment.trim(),
      });
      await createReviewMutation.mutateAsync({
        bookId,
        star: rating,
        comment: comment.trim(),
      });

      console.log('Review submitted successfully!');
      setComment('');
      setRating(4);
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-3xl shadow-xl w-full max-w-md mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 pb-4'>
          <h2 className='text-xl font-bold text-gray-900'>Give Review</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 transition-colors'
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

        {/* Book Title */}
        {bookTitle && (
          <div className='px-6 pb-2'>
            <p className='text-sm text-gray-600'>
              Reviewing: <span className='font-medium'>{bookTitle}</span>
            </p>
          </div>
        )}

        {/* Rating Section */}
        <div className='px-6 pb-4'>
          <h3 className='text-center text-gray-900 font-medium mb-4'>
            Give Rating
          </h3>
          <div className='flex justify-center space-x-2'>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type='button'
                onClick={() => setRating(star)}
                className={`w-8 h-8 transition-colors ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400`}
              >
                <svg
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  className='w-full h-full'
                >
                  <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmitReview} className='px-6 pb-6'>
          <div className='mb-6'>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder='Please share your thoughts about this book'
              className='w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
              rows={4}
              required
            />
          </div>

          {/* Send Button */}
          <button
            type='submit'
            disabled={createReviewMutation.isPending}
            className='w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {createReviewMutation.isPending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
