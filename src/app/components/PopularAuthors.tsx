'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authorsApi } from '../../../lib/api/authors';
import { booksApi } from '../../../lib/api/books';
import { Author } from '../../../lib/api/config';
import { useState, useEffect } from 'react';

export default function PopularAuthors() {
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
    '📱🎯 Mobile: Prioritized authors:',
    prioritizedAuthors.map((a) => `${a.name} (ID: ${a.id})`)
  );
  console.log(
    '📱🏆 Mobile: Selected popular authors:',
    popularAuthors.map((a) => `${a.name} (ID: ${a.id})`)
  );

  // Fetch book counts for each popular author
  useEffect(() => {
    const fetchAuthorsWithBooks = async () => {
      if (popularAuthors.length > 0 && !isLoading) {
        console.log(
          'Mobile: Starting to fetch book counts for authors:',
          popularAuthors.map((a) => `${a.name} (ID: ${a.id})`)
        );
        console.log(
          '📱 Mobile: About to fetch books for',
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
            `📱🔍 Mobile: Checking ${authorsWithSameName.length} authors named "${authorName}"`
          );

          // Find the author with the most books
          for (const author of authorsWithSameName) {
            try {
              console.log(
                `📱📖 Mobile: Fetching books for ${author.name} (ID: ${author.id})`
              );
              const authorBooksData = await booksApi.getByAuthor(author.id);
              console.log(
                `📱📚 Mobile: Raw response for ${author.name} (ID: ${author.id}):`,
                JSON.stringify(authorBooksData, null, 2)
              );

              // Check if the API response is successful
              if (!authorBooksData.success) {
                console.warn(
                  `📱⚠️ Mobile: API error for ${author.name}: ${authorBooksData.message}`
                );
                continue;
              }

              const books = authorBooksData?.data?.books;
              const bookCount = Array.isArray(books) ? books.length : 0;
              console.log(
                `📱📊 Mobile: ${author.name} (ID: ${author.id}) has ${bookCount} books`
              );

              if (bookCount > maxBooks) {
                maxBooks = bookCount;
                bestAuthor = author;
                console.log(
                  `📱🏆 Mobile: New best for "${authorName}": ID ${author.id} with ${bookCount} books`
                );
              }
            } catch (error) {
              console.error(
                `📱❌ Mobile: Error fetching books for ${author.name} (ID: ${author.id}):`,
                error
              );
            }
          }

          console.log(
            `📱✅ Mobile: Final best ${authorName}: ID ${bestAuthor.id} with ${maxBooks} books`
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
          '📱🎯 Mobile: Final authors with book counts (sorted):',
          sortedAuthors
        );
        setAuthorsWithBooks(sortedAuthors);
      }
    };

    fetchAuthorsWithBooks();
  }, [popularAuthors, isLoading]); // Depend on authors and loading state

  console.log('=== MOBILE POPULAR AUTHORS DEBUG ===');
  console.log('Raw authorsData:', authorsData);
  console.log('Authors array:', authors);
  console.log('Popular authors (filtered):', popularAuthors);
  console.log('Authors with book counts:', authorsWithBooks);
  console.log('==============================');

  if (isLoading) {
    return (
      <div className='flex flex-col gap-[24px] items-start self-stretch shrink-0 flex-nowrap relative z-[139]'>
        <span className='h-[36px] self-stretch shrink-0 basis-auto font-quicksand text-[24px] font-bold leading-[36px] text-[#0a0d12] relative text-left whitespace-nowrap z-[140]'>
          Popular Authors
        </span>
        <div className='flex flex-col gap-[16px] justify-center items-start self-stretch shrink-0 flex-nowrap relative z-[141]'>
          {[...Array(4)].map((_, idx) => (
            <div
              key={idx}
              className='flex pt-[12px] pr-[12px] pb-[12px] pl-[12px] gap-[12px] items-center self-stretch shrink-0 flex-nowrap bg-[#f8f9fa] rounded-[12px] relative shadow-[0_0_20px_0_rgba(202,201,201,0.25)] z-[142] animate-pulse'
            >
              <div className='w-[60px] h-[60px] shrink-0 bg-[#e9ecef] rounded-[50%] relative z-[143]' />
              <div className='flex w-[108px] flex-col gap-[2px] items-start shrink-0 flex-nowrap relative z-[144]'>
                <div className='h-[30px] w-[80px] bg-[#e9ecef] rounded relative z-[145]' />
                <div className='h-[28px] w-[60px] bg-[#e9ecef] rounded relative z-[146]' />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='flex flex-col gap-[24px] items-start self-stretch shrink-0 flex-nowrap relative z-[139]'>
        <span className='h-[36px] self-stretch shrink-0 basis-auto font-quicksand text-[24px] font-bold leading-[36px] text-[#0a0d12] relative text-left whitespace-nowrap z-[140]'>
          Popular Authors
        </span>
        <div className='flex justify-center items-center self-stretch min-h-[200px]'>
          <span className='text-red-600 font-quicksand'>
            Failed to load authors
          </span>
        </div>
      </div>
    );
  }

  // Show authors immediately, then update with book counts
  const displayAuthors =
    authorsWithBooks.length > 0
      ? authorsWithBooks
      : popularAuthors.map((author) => ({ ...author, bookCount: '...' }));

  return (
    <div className='flex flex-col gap-[24px] items-start self-stretch shrink-0 flex-nowrap relative z-[139]'>
      <span className='h-[36px] self-stretch shrink-0 basis-auto font-quicksand text-[24px] font-bold leading-[36px] text-[#0a0d12] relative text-left whitespace-nowrap z-[140]'>
        Popular Authors
      </span>
      <div className='flex flex-col gap-[16px] justify-center items-start self-stretch shrink-0 flex-nowrap relative z-[141]'>
        {displayAuthors.map((author) => (
          <div
            key={author.id}
            onClick={() => router.push(`/author?id=${author.id}`)}
            className='flex pt-[12px] pr-[12px] pb-[12px] pl-[12px] gap-[12px] items-center self-stretch shrink-0 flex-nowrap bg-[#fff] rounded-[12px] relative shadow-[0_0_20px_0_rgba(202,201,201,0.25)] hover:shadow-[0_0_30px_0_rgba(202,201,201,0.4)] transition-shadow z-[142] cursor-pointer'
          >
            <div className='w-[60px] h-[60px] shrink-0 bg-[url(/images/foto-profile.png)] bg-cover bg-no-repeat rounded-[50%] relative z-[143]' />
            <div className='flex w-[108px] flex-col gap-[2px] items-start shrink-0 flex-nowrap relative z-[144]'>
              <span className='h-[30px] self-stretch shrink-0 basis-auto font-quicksand text-[16px] font-bold leading-[30px] text-[#181d27] tracking-[-0.32px] relative text-left whitespace-nowrap z-[145] overflow-hidden text-ellipsis'>
                {author.id === 1 && author.name === 'string'
                  ? 'Andrea Hirata'
                  : author.name}
              </span>
              <div className='flex w-[80px] gap-[6px] items-center shrink-0 flex-nowrap relative z-[146]'>
                <div className='w-[24px] h-[24px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-20/4zD0ghdcs6.png)] bg-cover bg-no-repeat relative overflow-hidden z-[147]' />
                <span className='h-[28px] shrink-0 basis-auto font-quicksand text-[14px] font-medium leading-[28px] text-[#0a0d12] tracking-[-0.42px] relative text-left whitespace-nowrap z-[148]'>
                  {typeof author.bookCount === 'number'
                    ? `${author.bookCount} books`
                    : `${author.bookCount}`}
                </span>
              </div>
            </div>
          </div>
        ))}
        {authorsWithBooks.length === 0 && !isLoading && (
          <div className='flex justify-center items-center self-stretch min-h-[100px]'>
            <span className='text-gray-500 font-quicksand'>
              No authors available
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
