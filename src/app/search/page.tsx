'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import BookCard from '@/app/components/BookCard';
import { useBooks } from '../../../hooks/api/useBooks';
import { useCategories } from '../../../hooks/api/useCategories';
import { useAuthors } from '../../../hooks/api/useAuthors';
import Image from 'next/image';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  interface SearchResult {
    id: number | string;
    type: 'book' | 'category' | 'author';
    title?: string;
    name?: string;
    coverImage?: string;
    image?: string;
    author?: string | { name?: string };
    rating?: number;
  }

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data
  const { data: booksData } = useBooks();
  const { data: categoriesData } = useCategories();
  const { data: authorsData } = useAuthors();

  const performSearch = useCallback(() => {
    const results: SearchResult[] = [];
    const searchTerm = query.toLowerCase();

    // Search in books
    if (booksData?.data) {
      const books = (booksData.data as { books?: unknown[] })?.books || [];
      books.forEach((book: unknown) => {
        const bookObj = book as {
          title?: string;
          description?: string;
          author?: string | { name?: string };
        };
        if (
          bookObj.title?.toLowerCase().includes(searchTerm) ||
          bookObj.description?.toLowerCase().includes(searchTerm) ||
          (typeof bookObj.author === 'string'
            ? bookObj.author.toLowerCase().includes(searchTerm)
            : bookObj.author?.name?.toLowerCase().includes(searchTerm))
        ) {
          results.push({
            ...(book as Record<string, unknown>),
            type: 'book',
            id:
              ((book as Record<string, unknown>).id as string | number) ||
              Math.random(),
          });
        }
      });
    }

    // Search in categories
    if (categoriesData?.data) {
      const categories =
        (categoriesData.data as { categories?: unknown[] })?.categories || [];
      categories.forEach((category: unknown) => {
        const categoryObj = category as { name?: string };
        if (categoryObj.name?.toLowerCase().includes(searchTerm)) {
          results.push({
            ...(category as Record<string, unknown>),
            type: 'category',
            id:
              ((category as Record<string, unknown>).id as string | number) ||
              Math.random(),
          });
        }
      });
    }

    // Search in authors
    if (authorsData?.data) {
      const authors =
        (authorsData.data as { authors?: unknown[] })?.authors || [];
      authors.forEach((author: unknown) => {
        const authorObj = author as { name?: string };
        if (authorObj.name?.toLowerCase().includes(searchTerm)) {
          results.push({
            ...(author as Record<string, unknown>),
            type: 'author',
            id:
              ((author as Record<string, unknown>).id as string | number) ||
              Math.random(),
          });
        }
      });
    }

    setSearchResults(results);
    setIsLoading(false);
  }, [query, booksData, categoriesData, authorsData]);

  useEffect(() => {
    if (query && (booksData || categoriesData || authorsData)) {
      setIsLoading(true);
      performSearch();
    }
  }, [query, booksData, categoriesData, authorsData, performSearch]);

  return (
    <div className='min-h-screen bg-white'>
      <Navbar />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 font-quicksand mb-2'>
            Search Results
          </h1>
          <p className='text-gray-600 font-quicksand'>
            {query ? `Searching for "${query}"` : 'Enter a search term'}
          </p>
        </div>

        {isLoading ? (
          <div className='flex justify-center items-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className='space-y-8'>
            {/* Books Section */}
            {searchResults.filter((item: SearchResult) => item.type === 'book')
              .length > 0 && (
              <div>
                <h2 className='text-2xl font-semibold text-gray-900 font-quicksand mb-4'>
                  Books (
                  {
                    searchResults.filter(
                      (item: SearchResult) => item.type === 'book'
                    ).length
                  }
                  )
                </h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                  {searchResults
                    .filter((item: SearchResult) => item.type === 'book')
                    .map((book: SearchResult) => (
                      <BookCard
                        key={book.id}
                        book={
                          book as unknown as import('@/lib/api/config').Book
                        }
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Categories Section */}
            {searchResults.filter(
              (item: SearchResult) => item.type === 'category'
            ).length > 0 && (
              <div>
                <h2 className='text-2xl font-semibold text-gray-900 font-quicksand mb-4'>
                  Categories (
                  {
                    searchResults.filter(
                      (item: SearchResult) => item.type === 'category'
                    ).length
                  }
                  )
                </h2>
                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'>
                  {searchResults
                    .filter((item: SearchResult) => item.type === 'category')
                    .map((category: SearchResult) => (
                      <div
                        key={category.id}
                        className='bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer'
                      >
                        <div className='w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center'>
                          <Image
                            src={
                              ((category as unknown as Record<string, unknown>)
                                .image as string) ||
                              '/images/default-category.png'
                            }
                            alt={
                              (category as unknown as Record<string, unknown>)
                                .name as string
                            }
                            width={32}
                            height={32}
                            className='w-8 h-8 object-cover rounded'
                          />
                        </div>
                        <h3 className='font-semibold text-sm text-gray-900 font-quicksand'>
                          {
                            (category as unknown as Record<string, unknown>)
                              .name as string
                          }
                        </h3>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Authors Section */}
            {searchResults.filter(
              (item: SearchResult) => item.type === 'author'
            ).length > 0 && (
              <div>
                <h2 className='text-2xl font-semibold text-gray-900 font-quicksand mb-4'>
                  Authors (
                  {
                    searchResults.filter(
                      (item: SearchResult) => item.type === 'author'
                    ).length
                  }
                  )
                </h2>
                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'>
                  {searchResults
                    .filter((item: SearchResult) => item.type === 'author')
                    .map((author: SearchResult) => (
                      <div
                        key={author.id}
                        className='bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer'
                      >
                        <div className='w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center'>
                          <span className='text-2xl font-bold text-gray-600'>
                            {
                              (author as unknown as Record<string, unknown>)
                                .name as string
                            }
                            ?.charAt(0)?.toUpperCase()
                          </span>
                        </div>
                        <h3 className='font-semibold text-sm text-gray-900 font-quicksand'>
                          {
                            (author as unknown as Record<string, unknown>)
                              .name as string
                          }
                        </h3>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : query ? (
          <div className='text-center py-12'>
            <div className='w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
              <div className='w-12 h-12 bg-[url(/images/search-icon.svg)] bg-contain bg-no-repeat opacity-50' />
            </div>
            <h2 className='text-xl font-semibold text-gray-600 mb-2 font-quicksand'>
              No results found
            </h2>
            <p className='text-gray-500 mb-6 font-quicksand'>
              Try searching with different keywords
            </p>
          </div>
        ) : (
          <div className='text-center py-12'>
            <div className='w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
              <div className='w-12 h-12 bg-[url(/images/search-icon.svg)] bg-contain bg-no-repeat opacity-50' />
            </div>
            <h2 className='text-xl font-semibold text-gray-600 mb-2 font-quicksand'>
              Start searching
            </h2>
            <p className='text-gray-500 font-quicksand'>
              Enter a search term to find books, categories, or authors
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
