'use client';

import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { authorsApi } from '@/lib/api';
// Define types based on the API response structure
interface Author {
  id: number;
  name: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Book {
  id: number;
  title: string;
  description?: string;
  isbn?: string;
  publishedYear?: number;
  coverImage?: string;
  rating?: number;
  reviewCount?: number;
  totalCopies?: number;
  availableCopies?: number;
  borrowCount?: number;
  authorId?: number;
  categoryId?: number;
  createdAt?: string;
  updatedAt?: string;
}
import { Suspense } from 'react';

function AuthorPageContent() {
  const searchParams = useSearchParams();
  const authorId = searchParams.get('id');

  // Always call hooks at the top level
  const {
    data: authorBooksData,
    isLoading: authorBooksLoading,
    isError: authorBooksError,
  } = useQuery({
    queryKey: ['author-books', authorId],
    queryFn: () => authorsApi.getById(Number(authorId!)),
    enabled: !!authorId,
    staleTime: 60_000,
  });

  const {
    data: authorsData,
    isLoading: authorsLoading,
    isError: authorsError,
  } = useQuery({
    queryKey: ['authors'],
    queryFn: () => authorsApi.getAll(),
    enabled: !authorId,
    staleTime: 60_000,
  });

  // If specific author ID is provided, show that author's details with books
  if (authorId) {
    interface AuthorBooksData {
      author: Author;
      books: Book[];
    }
    const author: Author | undefined = (
      authorBooksData?.data as unknown as AuthorBooksData
    )?.author;
    const books: Book[] =
      (authorBooksData?.data as unknown as AuthorBooksData)?.books || [];

    if (authorBooksLoading) {
      return (
        <div className='min-h-screen bg-white overflow-x-hidden'>
          <Navbar />
          <div className='flex justify-center items-center min-h-[50vh]'>
            <div className='text-lg font-quicksand'>
              Loading author details...
            </div>
          </div>
        </div>
      );
    }

    if (authorBooksError || !author) {
      return (
        <div className='min-h-screen bg-white overflow-x-hidden'>
          <Navbar />
          <div className='flex justify-center items-center min-h-[50vh]'>
            <div className='text-lg font-quicksand text-red-600'>
              Author not found or error loading details.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className='min-h-screen bg-white overflow-x-hidden'>
        <Navbar />

        {/* Author Details */}
        <div className='main-container flex w-[393px] sm:w-[1200px] flex-col gap-[24px] sm:gap-[40px] items-start flex-nowrap relative mx-auto my-0 mt-4 sm:mt-8 px-4 sm:px-0'>
          {/* Author Info */}
          <div className='flex h-[113px] pt-[16px] pr-[16px] pb-[16px] pl-[16px] gap-[16px] items-center self-stretch shrink-0 flex-nowrap bg-[#fff] rounded-[16px] relative shadow-[0_0_20px_0_rgba(202,201,201,0.25)]'>
            <div className='w-[60px] h-[60px] sm:w-[81px] sm:h-[81px] shrink-0 bg-[url(/images/foto-profile.png)] bg-cover bg-no-repeat rounded-[50%] relative z-[1]' />
            <div className='flex flex-col gap-[2px] items-start grow shrink-0 flex-nowrap relative z-[2]'>
              <span className="h-[32px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[18px] sm:text-[20px] font-bold leading-[32px] text-[#181d27] tracking-[-0.54px] relative text-left whitespace-nowrap z-[3]">
                {author.name}
              </span>
              <div className='flex gap-[6px] items-center shrink-0 flex-nowrap relative z-[4]'>
                <div className='w-[24px] h-[24px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-22/n7OgMFxt6y.png)] bg-cover bg-no-repeat relative overflow-hidden z-[5]' />
                <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[14px] sm:text-[16px] font-medium leading-[30px] text-[#0a0d12] tracking-[-0.48px] relative text-left whitespace-nowrap z-[6]">
                  {books.length} books
                </span>
              </div>
              {author.bio && (
                <p className='text-[12px] sm:text-[14px] font-medium text-[#414651] font-quicksand mt-1 line-clamp-2'>
                  {author.bio}
                </p>
              )}
            </div>
          </div>

          {/* Author's Books */}
          <div className='flex flex-col gap-[16px] items-start self-stretch shrink-0 flex-nowrap'>
            <span className="h-[32px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[20px] font-bold leading-[32px] text-[#181d27] relative text-left whitespace-nowrap">
              Books by {author.name}
            </span>
            {books.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px] w-full'>
                {books.map((book) => (
                  <div
                    key={book.id}
                    className='flex flex-col items-start w-full flex-nowrap bg-[#fff] rounded-[12px] relative shadow-[0_0_20px_0_rgba(202,201,201,0.25)] hover:shadow-[0_0_30px_0_rgba(202,201,201,0.4)] transition-shadow cursor-pointer'
                    onClick={() =>
                      (window.location.href = `/detail?id=${book.id}`)
                    }
                  >
                    <div
                      className='h-[200px] self-stretch shrink-0 bg-cover bg-center bg-no-repeat rounded-tl-[12px] rounded-tr-[12px] rounded-br-none rounded-bl-none relative'
                      style={{
                        backgroundImage: `url(${
                          book.coverImage || '/images/education.png'
                        })`,
                      }}
                    />
                    <div className='flex pt-[16px] pr-[16px] pb-[16px] pl-[16px] flex-col gap-[4px] items-start self-stretch shrink-0 flex-nowrap'>
                      <span className="h-[32px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[16px] font-bold leading-[32px] text-[#181d27] tracking-[-0.32px] relative text-left line-clamp-1">
                        {book.title}
                      </span>
                      <div className='flex gap-[2px] items-center self-stretch shrink-0 flex-nowrap'>
                        <div className='w-[16px] h-[16px] shrink-0 bg-[url(/images/star.svg)] bg-cover bg-no-repeat relative overflow-hidden' />
                        <span className="h-[24px] shrink-0 basis-auto font-['Quicksand'] text-[14px] font-semibold leading-[24px] text-[#181d27] tracking-[-0.28px] relative text-left whitespace-nowrap">
                          {book.rating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='flex justify-center items-center self-stretch min-h-[200px]'>
                <span className='text-gray-500 font-quicksand'>
                  No books found for this author
                </span>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Otherwise, show all authors list
  interface AuthorsData {
    authors: Author[];
  }
  const authors: Author[] = (authorsData?.data as AuthorsData)?.authors || [];

  if (authorsLoading) {
    return (
      <div className='min-h-screen bg-white overflow-x-hidden'>
        <Navbar />
        <div className='flex justify-center items-center min-h-[50vh]'>
          <div className='text-lg font-quicksand'>Loading authors...</div>
        </div>
      </div>
    );
  }

  if (authorsError) {
    return (
      <div className='min-h-screen bg-white overflow-x-hidden'>
        <Navbar />
        <div className='flex justify-center items-center min-h-[50vh]'>
          <div className='text-lg font-quicksand text-red-600'>
            Failed to load authors.
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className='min-h-screen bg-white overflow-x-hidden'>
      <Navbar />

      {/* Main container */}
      <div className='main-container flex w-[393px] sm:w-[1200px] flex-col gap-[24px] sm:gap-[40px] items-start flex-nowrap relative mx-auto my-0 mt-4 sm:mt-8 px-4 sm:px-0'>
        {/* Authors List */}
        <div className='flex flex-col gap-[16px] items-start self-stretch shrink-0 flex-nowrap'>
          {authors.map((author) => (
            <div
              key={author.id}
              className='flex h-[113px] pt-[16px] pr-[16px] pb-[16px] pl-[16px] gap-[16px] items-center self-stretch shrink-0 flex-nowrap bg-[#fff] rounded-[16px] relative shadow-[0_0_20px_0_rgba(202,201,201,0.25)]'
            >
              <div className='w-[60px] h-[60px] sm:w-[81px] sm:h-[81px] shrink-0 bg-[url(/images/foto-profile.png)] bg-cover bg-no-repeat rounded-[50%] relative z-[1]' />
              <div className='flex flex-col gap-[2px] items-start grow shrink-0 flex-nowrap relative z-[2]'>
                <span className="h-[32px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[16px] sm:text-[18px] font-bold leading-[32px] text-[#181d27] tracking-[-0.54px] relative text-left whitespace-nowrap z-[3]">
                  {author.name}
                </span>
                <div className='flex gap-[6px] items-center shrink-0 flex-nowrap relative z-[4]'>
                  <div className='w-[24px] h-[24px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-22/n7OgMFxt6y.png)] bg-cover bg-no-repeat relative overflow-hidden z-[5]' />
                  <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[14px] sm:text-[16px] font-medium leading-[30px] text-[#0a0d12] tracking-[-0.48px] relative text-left whitespace-nowrap z-[6]">
                    Author
                  </span>
                </div>
                {author.bio && (
                  <p className='text-[12px] sm:text-[14px] font-medium text-[#414651] font-quicksand mt-1 line-clamp-2'>
                    {author.bio}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function AuthorPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
            <p className='mt-4 text-gray-600'>Loading...</p>
          </div>
        </div>
      }
    >
      <AuthorPageContent />
    </Suspense>
  );
}
