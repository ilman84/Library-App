'use client';

import { useBookReviews, useDeleteReview } from '../../../hooks/api/useReviews';
import { Review } from '../../../lib/api/reviews';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewSectionProps {
  bookId: number;
}

export default function ReviewSection({ bookId }: ReviewSectionProps) {
  const { user } = useAuth();
  const { data: reviewsData, isLoading, error } = useBookReviews(bookId);
  const deleteReviewMutation = useDeleteReview();

  // Debug logging
  console.log('ReviewSection - bookId:', bookId);
  console.log('ReviewSection - reviewsData:', reviewsData);
  console.log('ReviewSection - isLoading:', isLoading);
  console.log('ReviewSection - error:', error);
  console.log('ReviewSection - reviewsData?.data:', reviewsData?.data);

  const reviews: Review[] =
    (reviewsData?.data as unknown as { reviews: Review[] })?.reviews || [];
  console.log('ReviewSection - reviews array:', reviews);
  console.log('ReviewSection - reviews length:', reviews.length);
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, review: Review) => sum + review.star, 0) /
        reviews.length
      : 0;

  const handleDeleteReview = async (reviewId: number) => {
    if (!user) {
      alert('Please login to delete a review');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await deleteReviewMutation.mutateAsync(reviewId);
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='h-6 bg-gray-200 rounded animate-pulse'></div>
        <div className='space-y-2'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='h-16 bg-gray-200 rounded animate-pulse'
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-red-500 text-center py-4'>
        Error loading reviews. Please try again.
      </div>
    );
  }

  return (
    <div
      className='flex flex-col gap-[40px] items-start self-stretch shrink-0 flex-nowrap relative'
      style={{ boxSizing: 'border-box', margin: 0, padding: 0 }}
    >
      {/* Reviews Header */}
      <div className='w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between'>
          <div>
            <span className="h-[44px] shrink-0 basis-auto font-['Quicksand'] text-[24px] font-bold leading-[44px] text-[#0a0d12] tracking-[-0.72px] relative text-left whitespace-nowrap">
              Reviews
            </span>
            <div className='flex items-center space-x-2 mt-1'>
              <div className='flex items-center'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(averageRating)
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
              <span className="font-['Quicksand'] text-sm text-gray-600">
                {averageRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div
        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[12px] w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 items-stretch relative'
        style={{ boxSizing: 'border-box', margin: 0, padding: 0 }}
      >
        {reviews.length === 0 ? (
          <div className='col-span-full text-center py-8 text-gray-500'>
            No reviews yet. Be the first to review this book!
          </div>
        ) : (
          reviews.map((review: Review) => (
            <div
              key={review.id}
              className='flex flex-col items-start w-full flex-nowrap bg-[#fff] rounded-[12px] relative shadow-[0_0_20px_0_rgba(202,201,201,0.25)] hover:shadow-[0_0_30px_0_rgba(202,201,201,0.4)] transition-shadow cursor-pointer'
            >
              <div className='flex pt-[16px] pr-[16px] pb-[16px] pl-[16px] flex-col gap-[4px] items-start self-stretch shrink-0 flex-nowrap rounded-[12px] relative'>
                <div className='flex items-center justify-between w-full mb-2'>
                  <div className='flex items-center space-x-2'>
                    <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold'>
                      {(
                        review as Review & {
                          user?: { id: number; name: string };
                        }
                      ).user?.name?.charAt(0) || review.userId}
                    </div>
                    <div>
                      <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-bold leading-[30px] text-[#181d27] tracking-[-0.48px] relative text-left whitespace-nowrap">
                        {(
                          review as Review & {
                            user?: { id: number; name: string };
                          }
                        ).user?.name || `User ${review.userId}`}
                      </span>
                      <div className="h-[24px] shrink-0 basis-auto font-['Quicksand'] text-[12px] font-medium leading-[24px] text-[#414651] tracking-[-0.36px] relative text-left whitespace-nowrap">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <div className='flex items-center'>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.star
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
                    {user && user.id === review.userId && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={deleteReviewMutation.isPending}
                        className='p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        title='Delete review'
                      >
                        <svg
                          className='w-3 h-3'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <span className="h-[30px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[16px] font-medium leading-[30px] text-[#414651] tracking-[-0.48px] relative text-left whitespace-normal break-words">
                  {review.comment}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
