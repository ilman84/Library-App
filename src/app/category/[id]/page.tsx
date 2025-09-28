'use client';

import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  setSelectedCategory,
  setSelectedRating,
} from '@/store/slices/categorySlice';
import { useBooksByCategory } from '../../../../hooks/api/useBooks';
import { useCategories } from '../../../../hooks/api/useCategories';
import BookCard from '@/app/components/BookCard';
import { Book } from '../../../../lib/api/config';

export default function CategoryPage() {
  const [showFilters, setShowFilters] = useState(false);
  const params = useParams();
  const dispatch = useAppDispatch();
  const categoryId = params.id as string;

  // Get category state from Redux
  const { selectedCategoryId, selectedCategoryName, selectedRating } =
    useAppSelector((state) => state.category);

  // Fetch categories from API
  const { data: categoriesData } = useCategories();
  interface Category {
    id: number;
    name: string;
  }
  const categories =
    (categoriesData?.data as { categories?: Category[] })?.categories || [];

  // Find current category by ID
  const currentCategory = categories.find(
    (cat: Category) => cat.id === parseInt(categoryId)
  );
  const categoryName = currentCategory?.name || 'All Categories';

  // Fetch books by category using TanStack Query
  const {
    data: booksData,
    isLoading: isBooksLoading,
    error: booksError,
  } = useBooksByCategory(parseInt(categoryId), {
    rating: selectedRating || undefined,
  });

  // Client-side filtering since server might not support categoryId/rating filters
  const books =
    booksData?.data && 'books' in booksData.data
      ? (booksData.data.books as Book[])
      : [];
  const filteredBooks = books.filter((book: Book) => {
    // Filter by category
    const matchesCategory = book.categoryId === parseInt(categoryId);

    // Filter by rating if selected
    const bookRating = book.rating || 3.5 + ((book.id * 7) % 15) / 10; // Use same rating logic as BookCard
    const matchesRating = selectedRating ? bookRating >= selectedRating : true;

    return matchesCategory && matchesRating;
  });

  useEffect(() => {
    // Update Redux state if it doesn't match URL parameter
    const numericCategoryId = parseInt(categoryId);
    if (selectedCategoryId !== numericCategoryId) {
      dispatch(
        setSelectedCategory({
          id: numericCategoryId,
          name: categoryName,
        })
      );
    }
  }, [categoryId, categoryName, selectedCategoryId, dispatch]);

  return (
    <div className='min-h-screen bg-white overflow-x-hidden'>
      <Navbar />

      {/* Main container */}
      <div className='main-container flex w-[393px] sm:w-[1200px] flex-col gap-[16px] sm:gap-[32px] items-start flex-nowrap relative mx-auto my-0 mt-4 sm:mt-8 px-4 sm:px-0'>
        {/* Page title */}
        <span className="h-[44px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[24px] sm:text-[36px] font-bold leading-[44px] text-[#0a0d12] relative text-left whitespace-nowrap">
          {categoryName} Books
        </span>

        {/* Mobile Filter bar */}
        <div className='flex w-full items-center justify-between sm:hidden'>
          <span className="h-[30px] font-['Quicksand'] text-[16px] font-bold leading-[30px] text-[#0a0d12]">
            Filter
          </span>
          <button
            aria-label='Open filters'
            onClick={() => setShowFilters(true)}
            className='w-[20px] h-[20px] bg-[url(/images/hamburger-icon.png)] bg-contain bg-no-repeat'
          />
        </div>

        <div className='flex flex-col sm:flex-row gap-[20px] sm:gap-[40px] items-start self-stretch shrink-0 flex-nowrap relative z-[1]'>
          {/* Desktop Filters Sidebar */}
          <div className='hidden sm:block w-[280px] shrink-0'>
            <div className='flex flex-col gap-[24px] p-6 bg-white rounded-lg shadow-sm border'>
              <h2 className="text-xl font-bold font-['Quicksand']">Filters</h2>

              {/* Category Filter */}
              <div className='flex flex-col gap-[12px]'>
                <span className="font-['Quicksand'] text-[18px] font-bold">
                  Category
                </span>
                <div className='flex flex-col gap-[8px]'>
                  {categories.map((category: Category) => (
                    <div
                      key={category.id}
                      className='flex gap-[8px] items-center'
                    >
                      <input
                        type='radio'
                        name='category'
                        value={category.id}
                        checked={selectedCategoryId === category.id}
                        onChange={() => {
                          dispatch(
                            setSelectedCategory({
                              id: category.id,
                              name: category.name,
                            })
                          );
                          window.location.href = `/category/${category.id}`;
                        }}
                        className='w-[20px] h-[20px]'
                      />
                      <span className="font-['Quicksand'] text-[16px]">
                        {category.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className='flex flex-col gap-[12px]'>
                <span className="font-['Quicksand'] text-[18px] font-bold">
                  Rating
                </span>
                <div className='flex flex-col gap-[8px]'>
                  <div className='flex gap-[8px] items-center'>
                    <input
                      type='radio'
                      name='rating'
                      value=''
                      checked={selectedRating === null}
                      onChange={() => dispatch(setSelectedRating(null))}
                      className='w-[20px] h-[20px]'
                    />
                    <span className="font-['Quicksand'] text-[16px]">
                      All Ratings
                    </span>
                  </div>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className='flex gap-[8px] items-center'>
                      <input
                        type='radio'
                        name='rating'
                        value={rating}
                        checked={selectedRating === rating}
                        onChange={() => dispatch(setSelectedRating(rating))}
                        className='w-[20px] h-[20px]'
                      />
                      <div className='flex items-center gap-[4px]'>
                        <span className="font-['Quicksand'] text-[16px]">
                          {rating}
                        </span>
                        <div className='flex gap-[2px]'>
                          {[...Array(rating)].map((_, i) => (
                            <svg
                              key={i}
                              className='w-[16px] h-[16px] fill-yellow-400'
                              viewBox='0 0 24 24'
                            >
                              <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
                            </svg>
                          ))}
                          {[...Array(5 - rating)].map((_, i) => (
                            <svg
                              key={i}
                              className='w-[16px] h-[16px] fill-gray-300'
                              viewBox='0 0 24 24'
                            >
                              <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Books list container */}
          <div className='flex w-full sm:w-[879px] flex-col gap-[20px] items-start shrink-0 flex-nowrap relative z-[59]'>
            {/* Loading State */}
            {isBooksLoading && (
              <div className='flex justify-center items-center w-full py-8'>
                <div className='text-lg font-quicksand'>
                  Loading {selectedCategoryName} books...
                </div>
              </div>
            )}

            {/* Error State */}
            {booksError && (
              <div className='flex justify-center items-center w-full py-8'>
                <div className='text-red-500 font-quicksand'>
                  Error loading books. Please try again.
                </div>
              </div>
            )}

            {/* Books Grid */}
            {filteredBooks && filteredBooks.length > 0 ? (
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-[12px] sm:gap-[20px] w-full'>
                {filteredBooks.map((book: Book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onClick={() => {
                      // Navigate to book details page
                      window.location.href = `/detail?id=${book.id}`;
                    }}
                  />
                ))}
              </div>
            ) : (
              !isBooksLoading && (
                <div className='flex justify-center items-center w-full py-8'>
                  <div className='text-gray-500 font-quicksand'>
                    No books found in {categoryName} category
                    {selectedRating ? ` with ${selectedRating}+ stars` : ''}.
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showFilters && (
        <div className='sm:hidden fixed inset-0 z-[300]'>
          <div
            className='absolute inset-0 bg-black/50'
            onClick={() => setShowFilters(false)}
          />
          <div className='absolute right-0 top-0 h-full w-[280px] bg-white p-4 overflow-y-auto'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className="text-xl font-bold font-['Quicksand']">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className='text-2xl font-bold'
              >
                ×
              </button>
            </div>

            {/* Mobile Category Filter */}
            <div className='flex flex-col gap-[12px]'>
              <span className="font-['Quicksand'] text-[18px] font-bold">
                Category
              </span>
              <div className='flex flex-col gap-[8px]'>
                {categories.map((category: Category) => (
                  <div
                    key={category.id}
                    className='flex gap-[8px] items-center'
                  >
                    <input
                      type='radio'
                      name='mobile-category'
                      value={category.id}
                      checked={selectedCategoryId === category.id}
                      onChange={() => {
                        dispatch(
                          setSelectedCategory({
                            id: category.id,
                            name: category.name,
                          })
                        );
                        setShowFilters(false);
                        window.location.href = `/category/${category.id}`;
                      }}
                      className='w-[20px] h-[20px]'
                    />
                    <span className="font-['Quicksand'] text-[16px]">
                      {category.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className='h-px bg-[#e5e7eb] my-4' />

            {/* Mobile Rating Filter */}
            <div className='flex flex-col gap-[12px]'>
              <span className="font-['Quicksand'] text-[18px] font-bold">
                Rating
              </span>
              <div className='flex flex-col gap-[8px]'>
                <div className='flex gap-[8px] items-center'>
                  <input
                    type='radio'
                    name='mobile-rating'
                    value=''
                    checked={selectedRating === null}
                    onChange={() => dispatch(setSelectedRating(null))}
                    className='w-[20px] h-[20px]'
                  />
                  <span className="font-['Quicksand'] text-[16px]">
                    All Ratings
                  </span>
                </div>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className='flex gap-[8px] items-center'>
                    <input
                      type='radio'
                      name='mobile-rating'
                      value={rating}
                      checked={selectedRating === rating}
                      onChange={() => dispatch(setSelectedRating(rating))}
                      className='w-[20px] h-[20px]'
                    />
                    <div className='flex items-center gap-[4px]'>
                      <span className="font-['Quicksand'] text-[16px]">
                        {rating}
                      </span>
                      <div className='flex gap-[2px]'>
                        {[...Array(rating)].map((_, i) => (
                          <svg
                            key={i}
                            className='w-[16px] h-[16px] fill-yellow-400'
                            viewBox='0 0 24 24'
                          >
                            <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
                          </svg>
                        ))}
                        {[...Array(5 - rating)].map((_, i) => (
                          <svg
                            key={i}
                            className='w-[16px] h-[16px] fill-gray-300'
                            viewBox='0 0 24 24'
                          >
                            <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
