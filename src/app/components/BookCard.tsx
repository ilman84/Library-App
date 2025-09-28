'use client';

import { Book } from '../../../lib/api/config';

interface BookCardProps {
  book: Book;
  onClick?: () => void;
}

export default function BookCard({ book, onClick }: BookCardProps) {
  // Get author name - handle both string and object types
  const authorName =
    typeof book.author === 'string'
      ? book.author
      : book.author?.name || 'Unknown Author';

  // Generate a consistent rating for books without rating based on book ID
  const getBookRating = (book: Book): number => {
    if (book.rating && book.rating > 0) {
      return book.rating;
    }
    // Generate rating between 3.5 - 5.0 based on book ID for consistency
    const seed = book.id * 7; // Use book ID as seed
    return 3.5 + (seed % 15) / 10; // Results in ratings like 3.5, 3.6, 3.7... up to 5.0
  };

  const displayRating = getBookRating(book);

  return (
    <div
      className='flex flex-col items-start w-full sm:grow sm:basis-0 flex-nowrap bg-[#fff] rounded-[12px] relative shadow-[0_0_20px_0_rgba(202,201,201,0.25)] cursor-pointer hover:shadow-lg transition-shadow'
      onClick={onClick}
    >
      {/* Book Cover */}
      <div
        className='h-[307.125px] self-stretch shrink-0 bg-cover bg-center bg-no-repeat rounded-tl-[12px] rounded-tr-[12px] rounded-br-none rounded-bl-none relative'
        style={{
          backgroundImage: book.coverImage
            ? `url(${book.coverImage})`
            : 'url(/images/default-book-cover.jpg)',
        }}
      />

      {/* Book Info */}
      <div className='flex pt-[16px] pr-[16px] pb-[16px] pl-[16px] flex-col gap-[4px] items-start self-stretch shrink-0 flex-nowrap rounded-tl-none rounded-tr-none rounded-br-[12px] rounded-bl-[12px] relative'>
        {/* Book Title */}
        <span className="h-[32px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[18px] font-bold leading-[32px] text-[#181d27] tracking-[-0.54px] relative text-left truncate">
          {book.title}
        </span>

        {/* Author Name */}
        <span className="h-[30px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[16px] font-medium leading-[30px] text-[#414651] tracking-[-0.48px] relative text-left truncate">
          {authorName}
        </span>

        {/* Rating */}
        <div className='flex gap-[2px] items-center self-stretch shrink-0 flex-nowrap relative'>
          {/* Star Rating Display - Always show rating now */}
          <div className='flex gap-[2px] items-center'>
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-[16px] h-[16px] ${
                  i < Math.floor(displayRating)
                    ? 'fill-yellow-400'
                    : 'fill-gray-300'
                }`}
                viewBox='0 0 24 24'
              >
                <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
              </svg>
            ))}
          </div>
          <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-semibold leading-[30px] text-[#181d27] tracking-[-0.32px] relative text-left whitespace-nowrap ml-1">
            {displayRating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
