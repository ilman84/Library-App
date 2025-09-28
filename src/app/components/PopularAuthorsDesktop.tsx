'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authorsApi } from '../../../lib/api/authors';
import { booksApi } from '../../../lib/api/books';
import { Author } from '../../../lib/api/config';
import { useState, useEffect } from 'react';

export default function PopularAuthorsDesktop() {
  const router = useRouter();
  const [authorsWithBooks, setAuthorsWithBooks] = useState<
    (Author & { bookCount: number })[]
  >([]);

  const {
    data: authorsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['authors'],
    queryFn: async () => {
      const result = await authorsApi.getAll();
      return result; // ApiResponse<{ authors: Author[] }>
    },
    staleTime: 60_000,
  });

  const authors = authorsData?.data?.authors || [];

  // Fallback authors if API data is not available
  const fallbackAuthors = [
    { id: 1, name: 'Andrea Hirata', bio: 'Penulis Indonesia' },
    { id: 2, name: 'Yuval Noah Harari', bio: 'Historian & Author' },
    { id: 4, name: 'J. K. Rowling', bio: 'Author of Harry Potter series' },
    {
      id: 9,
      name: 'Agatha Christie',
      bio: 'English writer known for her detective novels',
    },
  ];

  // Use API data if available, otherwise use fallback
  const availableAuthors = authors.length > 0 ? authors : fallbackAuthors;

  // Prioritize known good authors, then filter others
  // Known authors with their IDs to prioritize
  const knownGoodAuthors = [
    { name: 'J. K. Rowling', id: 4 },
    { name: 'Andrea Hirata', id: 1 },
    { name: 'Yuval Noah Harari', id: 2 },
    { name: 'Agatha Christie', id: 9 },
  ];

  const prioritizedAuthors = availableAuthors
    .filter(
      (author) =>
        !author.name?.toLowerCase().includes('admin') &&
        author.name.length > 2 && // Filter out very short names
        !author.name?.toLowerCase().includes('test') // Filter out test names
    )
    .filter(
      (author, index, self) =>
        // Remove duplicates by name (case-insensitive)
        index ===
        self.findIndex(
          (a) => a.name?.toLowerCase() === author.name?.toLowerCase()
        )
    )
    .sort((a, b) => {
      // Prioritize known good authors by ID and name
      const aIsKnown = knownGoodAuthors.some(
        (known) => known.id === a.id || known.name === a.name
      );
      const bIsKnown = knownGoodAuthors.some(
        (known) => known.id === b.id || known.name === b.name
      );
      if (aIsKnown && !bIsKnown) return -1;
      if (!aIsKnown && bIsKnown) return 1;
      return 0;
    });

  const popularAuthors = prioritizedAuthors.slice(0, 4);

  console.log(
    '🎯 Prioritized authors:',
    prioritizedAuthors.map((a) => `${a.name} (ID: ${a.id})`)
  );
  console.log(
    '🏆 Selected popular authors:',
    popularAuthors.map((a) => `${a.name} (ID: ${a.id})`)
  );

  // Fetch book counts for each popular author
  useEffect(() => {
    const fetchAuthorsWithBooks = async () => {
      if (popularAuthors.length > 0 && !isLoading) {
        console.log(
          'Desktop: Starting to fetch book counts for authors:',
          popularAuthors.map((a) => `${a.name} (ID: ${a.id})`)
        );
        console.log(
          'About to fetch books for',
          popularAuthors.length,
          'authors'
        );
        const authorsWithBookCounts = [];

        // For each unique author name, find the one with most books
        const uniqueNames = [...new Set(popularAuthors.map((a) => a.name))];

        for (const authorName of uniqueNames) {
          const authorsWithSameName = popularAuthors.filter(
            (a) => a.name === authorName
          );
          let bestAuthor = authorsWithSameName[0];
          let maxBooks = 0;

          console.log(
            `🔍 Desktop: Checking ${authorsWithSameName.length} authors named "${authorName}"`
          );

          // Find the author with the most books
          for (const author of authorsWithSameName) {
            try {
              console.log(
                `📖 Desktop: Fetching books for ${author.name} (ID: ${author.id})`
              );
              const authorBooksData = await booksApi.getByAuthor(author.id);
              console.log(
                `📚 Raw response for ${author.name} (ID: ${author.id}):`,
                JSON.stringify(authorBooksData, null, 2)
              );

              // Check if the API response is successful
              if (!authorBooksData.success) {
                console.warn(
                  `⚠️ Desktop: API error for ${author.name}: ${authorBooksData.message}`
                );
                continue;
              }

              const books = authorBooksData?.data?.books;
              const bookCount = Array.isArray(books) ? books.length : 0;
              console.log(
                `📊 ${author.name} (ID: ${author.id}) has ${bookCount} books`
              );

              if (bookCount > maxBooks) {
                maxBooks = bookCount;
                bestAuthor = author;
                console.log(
                  `🏆 New best for "${authorName}": ID ${author.id} with ${bookCount} books`
                );
              }
            } catch (error) {
              console.error(
                `❌ Error fetching books for ${author.name} (ID: ${author.id}):`,
                error
              );
            }
          }

          console.log(
            `✅ Final best ${authorName}: ID ${bestAuthor.id} with ${maxBooks} books`
          );
          authorsWithBookCounts.push({
            ...bestAuthor,
            bookCount: maxBooks,
          });
        }

        // Sort by book count (descending) and take top 4
        const sortedAuthors = authorsWithBookCounts
          .sort((a, b) => b.bookCount - a.bookCount)
          .slice(0, 4);

        console.log(
          '🎯 Final authors with book counts (sorted):',
          sortedAuthors
        );
        setAuthorsWithBooks(sortedAuthors);
      }
    };

    fetchAuthorsWithBooks();
  }, [popularAuthors, isLoading]); // Depend on authors and loading state

  console.log('=== DESKTOP POPULAR AUTHORS DEBUG ===');
  console.log('Raw authorsData:', authorsData);
  console.log('All authors:', authors);
  console.log(
    'Authors names:',
    authors.map((a) => a.name)
  );
  console.log('Filtered popular authors:', popularAuthors);
  console.log('Authors with book counts:', authorsWithBooks);
  console.log('=====================================');

  if (isLoading) {
    return (
      <div className='grid grid-cols-4 gap-[20px]'>
        {[...Array(4)].map((_, idx) => (
          <div
            key={idx}
            className='flex pt-[12px] pr-[12px] pb-[12px] pl-[12px] gap-[12px] items-center bg-[#f8f9fa] rounded-[12px] shadow-[0_0_20px_0_rgba(202,201,201,0.25)] animate-pulse'
          >
            <div className='w-[60px] h-[60px] bg-[#e9ecef] rounded-[50%]' />
            <div className='flex flex-col gap-[2px]'>
              <div className='h-[20px] w-[80px] bg-[#e9ecef] rounded' />
              <div className='h-[18px] w-[60px] bg-[#e9ecef] rounded' />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className='flex justify-center items-center min-h-[200px]'>
        <span className='text-red-600 font-quicksand'>
          Failed to load authors
        </span>
      </div>
    );
  }

  // Show authors immediately, then update with book counts
  const displayAuthors =
    authorsWithBooks.length > 0
      ? authorsWithBooks
      : popularAuthors.map((author) => ({ ...author, bookCount: '...' }));

  return (
    <div className='grid grid-cols-4 gap-[20px]'>
      {displayAuthors.map((author) => (
        <div
          key={author.id}
          onClick={() => router.push(`/author?id=${author.id}`)}
          className='flex pt-[12px] pr-[12px] pb-[12px] pl-[12px] gap-[12px] items-center bg-[#fff] rounded-[12px] shadow-[0_0_20px_0_rgba(202,201,201,0.25)] hover:shadow-[0_0_30px_0_rgba(202,201,201,0.4)] transition-shadow cursor-pointer'
        >
          <div className='w-[60px] h-[60px] bg-[url(/images/foto-profile.png)] bg-cover bg-no-repeat rounded-[50%]' />
          <div className='flex flex-col gap-[2px]'>
            <span className='text-[16px] font-bold text-[#181d27] font-quicksand line-clamp-1'>
              {author.id === 1 && author.name === 'string'
                ? 'Andrea Hirata'
                : author.name}
            </span>
            <div className='flex gap-[6px] items-center'>
              <div className='w-[24px] h-[24px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-20/4zD0ghdcs6.png)] bg-contain bg-no-repeat' />
              <span className='text-[14px] font-medium text-[#0a0d12] font-quicksand'>
                {typeof author.bookCount === 'number'
                  ? `${author.bookCount} books`
                  : `${author.bookCount}`}
              </span>
            </div>
          </div>
        </div>
      ))}
      {authorsWithBooks.length === 0 && !isLoading && (
        <div className='col-span-4 flex justify-center items-center min-h-[100px]'>
          <span className='text-gray-500 font-quicksand'>
            No authors available
          </span>
        </div>
      )}
    </div>
  );
}
