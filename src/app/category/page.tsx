'use client';

import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBooks } from '../../../hooks/api/useBooks';
import BookCard from '@/app/components/BookCard';

interface LocalBook {
  id: number;
  title: string;
  description?: string;
  author: string | { name: string };
  image?: string;
}

export default function CategoryPage() {
  const [showFilters, setShowFilters] = useState(false);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [searchResults, setSearchResults] = useState<LocalBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch books data
  const { data: booksData } = useBooks();

  const performSearch = useCallback(() => {
    const results: LocalBook[] = [];
    const searchTerm = searchQuery.toLowerCase();

    if (booksData?.data) {
      const books = Array.isArray(booksData.data)
        ? booksData.data
        : (booksData.data as unknown as Record<string, unknown>).books || [];
      (books as LocalBook[]).forEach((book: LocalBook) => {
        if (
          book.title?.toLowerCase().includes(searchTerm) ||
          book.description?.toLowerCase().includes(searchTerm) ||
          (typeof book.author === 'string'
            ? book.author.toLowerCase().includes(searchTerm)
            : book.author?.name?.toLowerCase().includes(searchTerm))
        ) {
          results.push(book);
        }
      });
    }

    setSearchResults(results);
    setIsSearching(false);
  }, [searchQuery, booksData]);

  useEffect(() => {
    if (searchQuery && booksData?.data) {
      setIsSearching(true);
      performSearch();
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, booksData, performSearch]);
  return (
    <div className='min-h-screen bg-white overflow-x-hidden'>
      <Navbar />

      {/* Main container */}
      <div className='main-container flex w-[393px] sm:w-[1200px] flex-col gap-[16px] sm:gap-[32px] items-start flex-nowrap relative mx-auto my-0 mt-4 sm:mt-8 px-4 sm:px-0'>
        {/* Page title */}
        <span className="h-[44px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[24px] sm:text-[36px] font-bold leading-[44px] text-[#0a0d12] relative text-left whitespace-nowrap">
          {searchQuery
            ? `Search Results for "${searchQuery}"`
            : 'All Categories'}
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
          {/* Sidebar: filters (hidden on mobile) */}
          <div className='hidden sm:flex w-[266px] pt-[16px] pr-0 pb-[16px] pl-0 flex-col gap-[24px] items-start shrink-0 flex-nowrap bg-[#fff] rounded-[12px] relative shadow-[0_0_20px_0_rgba(202,201,201,0.25)] z-[2]'>
            <div className='flex pt-0 pr-[16px] pb-0 pl-[16px] flex-col gap-[10px] items-start self-stretch shrink-0 flex-nowrap relative z-[3]'>
              <span className="h-[30px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[16px] font-bold leading-[30px] text-[#0a0d12] relative text-left whitespace-nowrap z-[4]">
                FILTER
              </span>
              <span className="h-[32px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[18px] font-bold leading-[32px] text-[#0a0d12] tracking-[-0.36px] relative text-left whitespace-nowrap z-[5]">
                Category
              </span>
              <div className='flex w-[234px] gap-[8px] items-center self-stretch shrink-0 flex-nowrap relative z-[6]'>
                <div className='w-[20px] h-[20px] shrink-0 bg-[#1c65da] rounded-[6px] relative overflow-hidden z-[7]'>
                  <div className='w-[14px] h-[14px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-22/BYbec9Dgvp.png)] bg-[length:100%_100%] bg-no-repeat relative overflow-hidden z-[8] mt-[3px] mr-0 mb-0 ml-[3px]' />
                </div>
                <span className="flex w-[206px] h-[30px] justify-start items-start shrink-0 basis-auto font-['Quicksand'] text-[16px] font-medium leading-[30px] text-[#0a0d12] tracking-[-0.48px] relative text-left whitespace-nowrap z-[9]">
                  Fiction
                </span>
              </div>
              <div className='flex gap-[8px] items-center self-stretch shrink-0 flex-nowrap relative z-10'>
                <div className='w-[20px] h-[20px] shrink-0 rounded-[6px] border-solid border border-[#a4a7ae] relative overflow-hidden z-[11]' />
                <span className="h-[30px] grow shrink-0 basis-auto font-['Quicksand'] text-[16px] font-medium leading-[30px] text-[#0a0d12] tracking-[-0.48px] relative text-left whitespace-nowrap z-[12]">
                  Non-fiction
                </span>
              </div>
              <div className='flex gap-[8px] items-center self-stretch shrink-0 flex-nowrap relative z-[13]'>
                <div className='w-[20px] h-[20px] shrink-0 rounded-[6px] border-solid border border-[#a4a7ae] relative overflow-hidden z-[14]' />
                <span className="h-[30px] grow shrink-0 basis-auto font-['Quicksand'] text-[16px] font-medium leading-[30px] text-[#0a0d12] tracking-[-0.48px] relative text-left whitespace-nowrap z-[15]">
                  Self-Improve
                </span>
              </div>
              <div className='flex gap-[8px] items-center self-stretch shrink-0 flex-nowrap relative z-[16]'>
                <div className='w-[20px] h-[20px] shrink-0 rounded-[6px] border-solid border border-[#a4a7ae] relative overflow-hidden z-[17]' />
                <span className="h-[30px] grow shrink-0 basis-auto font-['Quicksand'] text-[16px] font-medium leading-[30px] text-[#0a0d12] tracking-[-0.48px] relative text-left whitespace-nowrap z-[18]">
                  Finance
                </span>
              </div>
              <div className='flex gap-[8px] items-center self-stretch shrink-0 flex-nowrap relative z-[19]'>
                <div className='w-[20px] h-[20px] shrink-0 rounded-[6px] border-solid border border-[#a4a7ae] relative overflow-hidden z-20' />
                <span className="h-[30px] grow shrink-0 basis-auto font-['Quicksand'] text-[16px] font-medium leading-[30px] text-[#0a0d12] tracking-[-0.48px] relative text-left whitespace-nowrap z-[21]">
                  Science
                </span>
              </div>
              <div className='flex gap-[8px] items-center self-stretch shrink-0 flex-nowrap relative z-[22]'>
                <div className='w-[20px] h-[20px] shrink-0 rounded-[6px] border-solid border border-[#a4a7ae] relative overflow-hidden z-[23]' />
                <span className="h-[30px] grow shrink-0 basis-auto font-['Quicksand'] text-[16px] font-medium leading-[30px] text-[#0a0d12] tracking-[-0.48px] relative text-left whitespace-nowrap z-[24]">
                  Education
                </span>
              </div>
            </div>
            {/* Sidebar divider */}
            <div className='h-px self-stretch shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-22/8Rhdd7Mssd.png)] bg-cover bg-no-repeat relative z-[25]' />
            {/* Sidebar: rating filter */}
            <div className='flex pt-0 pr-[16px] pb-0 pl-[16px] flex-col gap-[10px] items-center self-stretch shrink-0 flex-nowrap relative z-[26]'>
              <span className="h-[32px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[18px] font-bold leading-[32px] text-[#0a0d12] tracking-[-0.36px] relative text-left whitespace-nowrap z-[27]">
                Rating
              </span>
              <div className='flex flex-col items-start self-stretch shrink-0 flex-nowrap relative z-[28]'>
                <div className='flex pt-[8px] pr-[8px] pb-[8px] pl-[8px] flex-col gap-[8px] items-start self-stretch shrink-0 flex-nowrap relative z-[29]'>
                  <div className='flex w-[63px] gap-[8px] items-center shrink-0 flex-nowrap relative z-30'>
                    <div className='w-[20px] h-[20px] shrink-0 rounded-[6px] border-solid border border-[#a4a7ae] relative overflow-hidden z-[31]' />
                    <div className='flex w-[35px] gap-[2px] items-center shrink-0 flex-nowrap relative z-[32]'>
                      <div className="w-[24px] h-[24px] shrink-0 bg-[url('/images/star.svg')] bg-cover bg-no-repeat relative overflow-hidden z-[33]" />
                      <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-normal leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap z-[34]">
                        5
                      </span>
                    </div>
                  </div>
                </div>
                <div className='flex pt-[8px] pr-[8px] pb-[8px] pl-[8px] flex-col gap-[8px] items-start self-stretch shrink-0 flex-nowrap relative z-[35]'>
                  <div className='flex w-[63px] gap-[8px] items-center shrink-0 flex-nowrap relative z-[36]'>
                    <div className='w-[20px] h-[20px] shrink-0 rounded-[6px] border-solid border border-[#a4a7ae] relative overflow-hidden z-[37]' />
                    <div className='flex w-[35px] gap-[2px] items-center shrink-0 flex-nowrap relative z-[38]'>
                      <div className="w-[24px] h-[24px] shrink-0 bg-[url('/images/star.svg')] bg-cover bg-no-repeat relative overflow-hidden z-[39]" />
                      <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-normal leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap z-40">
                        4
                      </span>
                    </div>
                  </div>
                </div>
                <div className='flex pt-[8px] pr-[8px] pb-[8px] pl-[8px] flex-col gap-[8px] items-start self-stretch shrink-0 flex-nowrap relative z-[41]'>
                  <div className='flex w-[63px] gap-[8px] items-center shrink-0 flex-nowrap relative z-[42]'>
                    <div className='w-[20px] h-[20px] shrink-0 rounded-[6px] border-solid border border-[#a4a7ae] relative overflow-hidden z-[43]' />
                    <div className='flex w-[35px] gap-[2px] items-center shrink-0 flex-nowrap relative z-[44]'>
                      <div className="w-[24px] h-[24px] shrink-0 bg-[url('/images/star.svg')] bg-cover bg-no-repeat relative overflow-hidden z-[45]" />
                      <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-normal leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap z-[46]">
                        3
                      </span>
                    </div>
                  </div>
                </div>
                <div className='flex pt-[8px] pr-[8px] pb-[8px] pl-[8px] flex-col gap-[8px] items-start self-stretch shrink-0 flex-nowrap relative z-[47]'>
                  <div className='flex w-[63px] gap-[8px] items-center shrink-0 flex-nowrap relative z-[48]'>
                    <div className='w-[20px] h-[20px] shrink-0 rounded-[6px] border-solid border border-[#a4a7ae] relative overflow-hidden z-[49]' />
                    <div className='flex w-[35px] gap-[2px] items-center shrink-0 flex-nowrap relative z-50'>
                      <div className="w-[24px] h-[24px] shrink-0 bg-[url('/images/star.svg')] bg-cover bg-no-repeat relative overflow-hidden z-[51]" />
                      <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-normal leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap z-[52]">
                        2
                      </span>
                    </div>
                  </div>
                </div>
                <div className='flex pt-[8px] pr-[8px] pb-[8px] pl-[8px] flex-col gap-[8px] items-start self-stretch shrink-0 flex-nowrap relative z-[53]'>
                  <div className='flex w-[60px] gap-[8px] items-center shrink-0 flex-nowrap relative z-[54]'>
                    <div className='w-[20px] h-[20px] shrink-0 rounded-[6px] border-solid border border-[#a4a7ae] relative overflow-hidden z-[55]' />
                    <div className='flex w-[32px] gap-[2px] items-center shrink-0 flex-nowrap relative z-[56]'>
                      <div className="w-[24px] h-[24px] shrink-0 bg-[url('/images/star.svg')] bg-cover bg-no-repeat relative overflow-hidden z-[57]" />
                      <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-normal leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap z-[58]">
                        1
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Books list container */}
          <div className='flex w-full sm:w-[879px] flex-col gap-[20px] items-start shrink-0 flex-nowrap relative z-[59]'>
            {/* Search Results or Default Books */}
            {searchQuery ? (
              <div className='w-full'>
                {isSearching ? (
                  <div className='flex justify-center items-center py-12'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'>
                    {searchResults.map((book) => (
                      <BookCard
                        key={book.id}
                        book={
                          book as unknown as import('../../../lib/api/config').Book
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-12'>
                    <div className='w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
                      <div className='w-12 h-12 bg-[url(/images/search-icon.svg)] bg-contain bg-no-repeat opacity-50' />
                    </div>
                    <h2 className='text-xl font-semibold text-gray-600 mb-2 font-quicksand'>
                      No results found
                    </h2>
                    <p className='text-gray-500 font-quicksand'>
                      Try searching with different keywords
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className='w-full'>
                <p className='text-center py-8 text-gray-500 font-quicksand'>
                  Browse all categories and books
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Mobile Filter bar - moved outside main content */}
        <div className='sm:hidden'>
          {/* Mobile Filter content can be added here */}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showFilters && (
        <div className='sm:hidden fixed inset-0 z-[300]'>
          <div
            className='absolute inset-0 bg-black/40'
            onClick={() => setShowFilters(false)}
          />
          <div className='absolute left-0 top-0 h-full w-[280px] bg-white shadow-xl p-4 overflow-y-auto'>
            <div className='flex items-center justify-between mb-4'>
              <span className="font-['Quicksand'] text-[18px] font-bold">
                Filter
              </span>
              <button
                aria-label='Close filters'
                onClick={() => setShowFilters(false)}
                className='text-[#0a0d12] text-[20px]'
              >
                ×
              </button>
            </div>
            {/* Filter content */}
            <div className='flex flex-col gap-[16px]'>
              <div className='flex flex-col gap-[10px]'>
                <span className="font-['Quicksand'] text-[18px] font-bold">
                  Category
                </span>
                <div className='flex gap-[8px] items-center'>
                  <div className='w-[20px] h-[20px] shrink-0 bg-[#1c65da] rounded-[6px]' />
                  <span className="font-['Quicksand'] text-[16px]">
                    Fiction
                  </span>
                </div>
                <div className='flex gap-[8px] items-center'>
                  <div className='w-[20px] h-[20px] shrink-0 rounded-[6px] border border-[#a4a7ae]' />
                  <span className="font-['Quicksand'] text-[16px]">
                    Non-fiction
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
