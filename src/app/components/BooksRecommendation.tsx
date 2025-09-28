'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { booksApi } from '../../../lib/api/books';
import { Book } from '../../../lib/api/config';

type Props = {
  variant: 'desktop' | 'mobile';
};

function useBooks(source: 'popular' | 'rating', limit: number) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['books-recommend', source, limit],
    queryFn: async () => {
      try {
        console.log(`🔍 Fetching ${source} books with limit ${limit}`);
        console.log(
          '📡 API URL:',
          `https://belibraryformentee-production.up.railway.app/api/books/recommend?by=${source}&limit=${limit}`
        );

        // Use the new recommendations endpoint
        const result = await booksApi.getRecommendations({ by: source, limit });
        console.log('✅ API Response:', result);

        // Check if the API response is successful
        if (!result.success) {
          console.error('❌ API returned success: false', result.message);
          throw new Error(result.message || 'Failed to fetch books');
        }

        console.log('📚 Books data:', result.data);

        // Use API data as-is without fallback
        const apiBooks = result.data?.books || [];
        console.log(`✅ Using ${apiBooks.length} books from API server`);

        return result.data;
      } catch (err) {
        console.error('💥 API Error:', err);
        // Fallback to local data
        console.log('🔄 Using fallback local data');
        const fallbackResponse = await fetch('/response_popular.json');
        const fallbackData = await fallbackResponse.json();
        console.log('📄 Fallback data:', fallbackData);
        return fallbackData;
      }
    },
    staleTime: 60_000,
    retry: false,
  });

  const normalize = (src: unknown): Book[] => {
    if (!src) return [];
    if (Array.isArray(src)) return src as Book[];
    if (typeof src === 'object') {
      const obj = src as {
        data?: { books?: Book[] };
        books?: Book[];
        mode?: string;
      };
      // Handle new recommend endpoint structure
      if (obj.books && Array.isArray(obj.books)) return obj.books;
      // Handle old structure
      if (obj.data?.books && Array.isArray(obj.data.books))
        return obj.data.books;
    }
    return [];
  };
  const books: Book[] = normalize(data);

  const getCover = (b: Book) => {
    const cover = b.coverImage;

    // Check if cover is valid (not empty, not blob URL, not localhost URL)
    const isValidCover =
      cover &&
      cover.trim() !== '' &&
      !cover.startsWith('blob:') &&
      !cover.includes('localhost:5173');

    if (!isValidCover) {
      // Use category-based fallback images based on title/content
      const title = (b.title || '').toLowerCase();
      if (title.includes('harry potter') || title.includes('fiction'))
        return '/images/fiction.png';
      if (title.includes('laskar pelangi')) return '/images/education.png';
      if (title.includes('project hail mary') || title.includes('science'))
        return '/images/science.png';
      if (title.includes('educated') || title.includes('improvement'))
        return '/images/Self-Improvement.png';
      if (title.includes('sapiens') || title.includes('nonfiction'))
        return '/images/nonfiction.png';
      if (title.includes('finance') || title.includes('money'))
        return '/images/finance.png';
      return '/images/education.png';
    }

    return cover;
  };
  const getTitle = (b: Book) => b.title || 'Untitled';
  const getAuthor = (b: Book) => {
    let authorName = '';

    if (typeof b.author === 'string') {
      authorName = b.author;
    } else if (b.author && typeof b.author === 'object' && 'name' in b.author) {
      authorName = (b.author as { name: string }).name;
    } else {
      authorName = '';
    }

    // Fix known incorrect author names with proper fallbacks
    if (
      authorName === 'string' ||
      authorName === '' ||
      authorName.toLowerCase().includes('admin')
    ) {
      const title = (b.title || '').toLowerCase();
      if (title.includes('laskar pelangi')) return 'Andrea Hirata';
      if (title.includes('harry potter')) return 'J.K. Rowling';
      if (title.includes('project hail mary') || title.includes('hail mary'))
        return 'Andy Weir';
      if (title.includes('educated')) return 'Tara Westover';
      if (title.includes('sapiens')) return 'Yuval Noah Harari';
      return 'Unknown Author';
    }

    return authorName;
  };
  const getRating = (b: Book) => {
    const rating = b.rating || 3.5 + ((b.id * 7) % 15) / 10; // Use same logic as BookCard
    return rating.toFixed(1);
  };

  return {
    books,
    isLoading,
    isError,
    error: error as Error | null,
    getCover,
    getTitle,
    getAuthor,
    getRating,
    rawData: data,
  };
}

export default function BooksRecommendation({ variant }: Props) {
  const router = useRouter();
  const source: 'popular' | 'rating' =
    variant === 'desktop' ? 'popular' : 'popular';
  const initialVisible = variant === 'desktop' ? 3 : 3;
  const increment = variant === 'desktop' ? 3 : 3;
  const limit = 20;
  const {
    books,
    isLoading,
    isError,
    error,
    getCover,
    getTitle,
    getAuthor,
    getRating,
    rawData: data,
  } = useBooks(source, limit);
  const [visibleCount, setVisibleCount] = useState(initialVisible);

  console.log(`=== ${variant.toUpperCase()} DEBUG ===`);
  console.log('Raw API data:', data);
  console.log('Parsed books array:', books);
  console.log('Books length:', books.length);
  console.log('Visible count:', visibleCount);
  console.log('Initial visible:', initialVisible);
  console.log('Is loading:', isLoading);
  console.log('Is error:', isError);
  console.log('Books to display:', books.slice(0, visibleCount).length);
  console.log('=======================');

  if (variant === 'desktop') {
    return (
      <div className='grid grid-cols-5 gap-[20px]'>
        {isLoading &&
          Array.from({ length: initialVisible }).map((_, i) => (
            <div
              key={`d-skel-${i}`}
              className='animate-pulse h-[400px] bg-[#fff] rounded-[12px] shadow-[0_0_20px_0_rgba(202,201,201,0.25)]'
            >
              <div className='h-[280px] bg-[#eef2ff] rounded-t-[12px]' />
              <div className='p-[16px]'>
                <div className='h-[20px] bg-[#eef2ff] rounded w-3/4 mb-2' />
                <div className='h-[16px] bg-[#eef2ff] rounded w-1/2' />
              </div>
            </div>
          ))}
        {isError && (
          <div className='col-span-5 text-red-600 font-quicksand'>
            {error?.message || 'Failed to load books'}
          </div>
        )}
        {!isLoading &&
          !isError &&
          books.slice(0, visibleCount).map((b, idx) => (
            <div
              key={b.id ?? `book-${idx}`}
              onClick={() => router.push(`/detail?id=${b.id}`)}
              className='flex flex-col h-[400px] bg-[#fff] rounded-[12px] shadow-[0_0_20px_0_rgba(202,201,201,0.25)] hover:shadow-[0_0_30px_0_rgba(202,201,201,0.4)] transition-shadow cursor-pointer'
            >
              <div
                className='h-[280px] bg-cover bg-no-repeat rounded-t-[12px]'
                style={{ backgroundImage: `url(${getCover(b)})` }}
              />
              <div className='p-[16px] flex-1 flex flex-col justify-between'>
                <div>
                  <h3 className='text-[16px] font-bold text-[#181d27] font-quicksand mb-[4px]'>
                    {getTitle(b)}
                  </h3>
                  <p className='text-[14px] font-medium text-[#414651] font-quicksand mb-[8px]'>
                    {getAuthor(b)}
                  </p>
                </div>
                <div className='flex items-center gap-[4px]'>
                  <svg
                    className='w-[20px] h-[20px] fill-yellow-400'
                    viewBox='0 0 24 24'
                  >
                    <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
                  </svg>
                  <span className='text-[14px] font-semibold text-[#181d27] font-quicksand'>
                    {getRating(b)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        {!isLoading && !isError && (
          <div className='col-span-5 flex justify-center mt-[12px]'>
            {books.length > visibleCount ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  console.log(
                    'Desktop Load More clicked, current:',
                    visibleCount
                  );
                  setVisibleCount((n) => n + increment);
                }}
                className='px-[24px] py-[12px] rounded-[100px] border border-[#d5d7da] text-[#0a0d12] font-quicksand text-[14px] font-bold hover:bg-[#f8f9fa] transition-colors cursor-pointer'
                style={{ zIndex: 9999 }}
              >
                Load More ({books.length - visibleCount} more)
              </button>
            ) : visibleCount > initialVisible ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Desktop Show less clicked');
                  setVisibleCount(initialVisible);
                }}
                className='px-[24px] py-[12px] rounded-[100px] border border-[#d5d7da] text-[#0a0d12] font-quicksand text-[14px] font-bold hover:bg-[#f8f9fa] transition-colors cursor-pointer'
                style={{ zIndex: 9999 }}
              >
                Show less
              </button>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  // mobile
  return (
    <div className='flex flex-col gap-[16px] items-start self-stretch shrink-0 flex-nowrap'>
      <div className='grid grid-cols-2 gap-[12px] w-full justify-items-center'>
        {isLoading &&
          Array.from({ length: initialVisible }).map((_, i) => (
            <div
              key={`m-skel-${i}`}
              className='flex w-[172px] flex-col items-start bg-[#fff] rounded-[12px] shadow-[0_0_20px_0_rgba(202,201,201,0.25)] animate-pulse'
            >
              <div className='h-[258px] self-stretch bg-[#eef2ff] rounded-t-[12px]' />
              <div className='p-[12px] w-full'>
                <div className='h-[20px] bg-[#eef2ff] rounded w-3/4 mb-2' />
                <div className='h-[16px] bg-[#eef2ff] rounded w-1/2' />
              </div>
            </div>
          ))}
        {isError && (
          <span className='text-red-600 font-quicksand'>
            {error?.message || 'Failed to load books'}
          </span>
        )}
        {!isLoading &&
          !isError &&
          books.slice(0, visibleCount).map((b, idx) => (
            <div
              key={b.id ?? `m-book-${idx}`}
              onClick={() => router.push(`/detail?id=${b.id}`)}
              className='flex w-[172px] flex-col items-start flex-nowrap bg-[#fff] rounded-[12px] relative shadow-[0_0_20px_0_rgba(202,201,201,0.25)] hover:shadow-[0_0_30px_0_rgba(202,201,201,0.4)] transition-shadow cursor-pointer'
            >
              <div
                className='h-[258px] self-stretch shrink-0 bg-cover bg-no-repeat rounded-tl-[12px] rounded-tr-[12px] rounded-br-none rounded-bl-none relative'
                style={{ backgroundImage: `url(${getCover(b)})` }}
              />
              <div className='flex pt-[12px] pr-[12px] pb-[12px] pl-[12px] flex-col gap-[2px] items-start self-stretch shrink-0 flex-nowrap rounded-tl-none rounded-tr-none rounded-br-[12px] rounded-bl-[12px] relative'>
                <span className='h-[28px] self-stretch font-quicksand text-[14px] font-bold leading-[28px] text-[#181d27] tracking-[-0.28px] text-left truncate w-full'>
                  {getTitle(b)}
                </span>
                <span className='h-[28px] self-stretch font-quicksand text-[14px] font-medium leading-[28px] text-[#414651] tracking-[-0.42px] text-left truncate w-full'>
                  {getAuthor(b)}
                </span>
                <div className='flex gap-[2px] items-center self-stretch'>
                  <svg
                    className='w-[24px] h-[24px] fill-yellow-400'
                    viewBox='0 0 24 24'
                  >
                    <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
                  </svg>
                  <span className='h-[28px] font-quicksand text-[14px] font-semibold leading-[28px] text-[#181d27] tracking-[-0.28px]'>
                    {getRating(b)}
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>
      {!isLoading && !isError && books.length > 0 && (
        <div className='w-full flex justify-center mt-[16px]'>
          {books.length > visibleCount ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                console.log('Mobile Load More clicked, current:', visibleCount);
                setVisibleCount((n) => Math.min(n + increment, books.length));
              }}
              className='px-[24px] py-[12px] rounded-[100px] border border-[#d5d7da] text-[#0a0d12] font-quicksand text-[14px] font-bold hover:bg-[#f8f9fa] transition-colors cursor-pointer'
              style={{ zIndex: 9999, position: 'relative' }}
            >
              Load More ({books.length - visibleCount} more)
            </button>
          ) : visibleCount > initialVisible ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                console.log('Mobile Show less clicked');
                setVisibleCount(initialVisible);
              }}
              className='px-[24px] py-[12px] rounded-[100px] border border-[#d5d7da] text-[#0a0d12] font-quicksand text-[14px] font-bold hover:bg-[#f8f9fa] transition-colors cursor-pointer'
              style={{ zIndex: 9999, position: 'relative' }}
            >
              Show less
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
