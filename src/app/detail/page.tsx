'use client';

import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { booksApi } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import ReviewSection from '../components/ReviewSection';
import { toast } from 'sonner';

function DetailPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookId = searchParams.get('id');
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);

  const {
    data: bookDetail,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['book-detail', bookId],
    queryFn: () => (bookId ? booksApi.getById(Number(bookId)) : null),
    enabled: !!bookId,
  });

  const book = bookDetail?.data;

  // Check if book is already in cart
  const isInCart = book
    ? items.some((item) => item.book.id === book.id)
    : false;

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (book) {
      // Convert BookDetail to Book for cart
      const bookForCart = {
        id: book.id,
        title: book.title || 'Untitled',
        coverImage: book.coverImage,
        author: book.author,
        categoryId: book.categoryId,
        category: book.category,
        rating: book.rating,
        reviewCount: book.reviewCount,
        totalCopies: book.totalCopies,
        availableCopies: book.availableCopies,
        borrowCount: book.borrowCount,
        authorId: book.authorId,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
      };
      dispatch(addToCart(bookForCart));

      // Show success toast
      toast.success('Book added to cart!', {
        description: `${book.title} has been added to your cart.`,
        duration: 4000,
      });
    }
  };

  // Handle Related Book Click
  const handleRelatedBookClick = (bookId: string | number) => {
    router.push(`/detail?id=${bookId}`);
  };

  const { data: allBooksData } = useQuery({
    queryKey: ['related-generic'],
    queryFn: () => booksApi.getAll({ page: 1, limit: 20 }),
    staleTime: 60_000,
  });

  type RelatedMinimalBook = {
    id: number | string;
    title?: string;
    author?: string | { name?: string } | undefined;
    coverImage?: string;
    rating?: number;
  };

  const normalizeHomeBooks = (src: unknown): RelatedMinimalBook[] => {
    if (!src) return [];
    if (Array.isArray(src)) return src as RelatedMinimalBook[];
    if (typeof src === 'object') {
      const obj = src as {
        items?: RelatedMinimalBook[];
        books?: RelatedMinimalBook[];
        data?: { books?: RelatedMinimalBook[] };
      };
      if (Array.isArray(obj.items)) return obj.items;
      if (Array.isArray(obj.books)) return obj.books;
      if (obj.data && Array.isArray(obj.data.books)) return obj.data.books;
    }
    return [];
  };

  // Prefer generic list like home; exclude the current book
  const relatedBooks: RelatedMinimalBook[] = normalizeHomeBooks(allBooksData)
    .filter((rb) => String(rb.id) !== String(book?.id))
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-white overflow-x-hidden'>
        <Navbar />
        <div className='flex justify-center items-center min-h-[50vh]'>
          <div className='text-lg font-quicksand'>Loading book details...</div>
        </div>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className='min-h-screen bg-white overflow-x-hidden'>
        <Navbar />
        <div className='flex justify-center items-center min-h-[50vh]'>
          <div className='text-lg font-quicksand text-red-600'>
            Book not found or error loading details.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white overflow-x-hidden'>
      <Navbar />

      {/* Centered page container, no horizontal scroll */}
      <div className='w-full'>
        <div className='max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-[64px] items-end relative z-[33] mt-[48px]'>
          {/* Breadcrumbs */}
          <div className='flex w-[314px] gap-[4px] items-center shrink-0 flex-nowrap relative z-[35] self-start'>
            <span className="h-[28px] shrink-0 basis-auto font-['Quicksand'] text-[14px] font-semibold leading-[28px] text-[#1c65da] tracking-[-0.28px] relative text-left whitespace-nowrap z-[36]">
              Home
            </span>
            <div className='w-[16px] h-[16px] shrink-0 bg-[url(/images/right-arrow.svg)] bg-cover bg-no-repeat relative overflow-hidden z-[37]' />
            <span className="h-[28px] shrink-0 basis-auto font-['Quicksand'] text-[14px] font-semibold leading-[28px] text-[#1c65da] tracking-[-0.28px] relative text-left whitespace-nowrap z-[38]">
              {book.category?.name || 'Category'}
            </span>
            <div className='w-[16px] h-[16px] shrink-0 bg-[url(/images/right-arrow.svg)] bg-cover bg-no-repeat relative overflow-hidden z-[39]' />
            <span className="h-[28px] shrink-0 basis-auto font-['Quicksand'] text-[14px] font-semibold leading-[28px] text-[#0a0d12] tracking-[-0.28px] relative text-left whitespace-nowrap z-40">
              {book.title}
            </span>
          </div>
          {/* Top section: cover image and info */}
          <div className='flex flex-col sm:flex-row gap-[24px] sm:gap-[36px] items-center sm:items-start self-stretch shrink-0 relative z-[41]'>
            <div className='flex w-full sm:w-[337px] pt-[8px] pr-[8px] pb-[8px] pl-[8px] gap-[8px] items-center shrink-0 bg-[#e9eaeb] relative z-[42]'>
              <div
                className='w-full sm:w-[321px] h-[420px] sm:h-[482px] shrink-0 bg-cover bg-no-repeat relative z-[43]'
                style={{
                  backgroundImage: `url(${
                    book.coverImage &&
                    book.coverImage.trim() !== '' &&
                    !book.coverImage.startsWith('blob:') &&
                    !book.coverImage.includes('localhost:5173')
                      ? book.coverImage
                      : (() => {
                          const title = book.title?.toLowerCase() || '';
                          if (title.includes('harry potter'))
                            return '/images/fiction.png';
                          if (title.includes('laskar pelangi'))
                            return '/images/education.png';
                          if (
                            title.includes('project hail mary') ||
                            title.includes('science')
                          )
                            return '/images/science.png';
                          if (
                            title.includes('educated') ||
                            title.includes('improvement')
                          )
                            return '/images/Self-Improvement.png';
                          if (
                            title.includes('sapiens') ||
                            title.includes('nonfiction')
                          )
                            return '/images/nonfiction.png';
                          if (
                            title.includes('finance') ||
                            title.includes('money')
                          )
                            return '/images/finance.png';
                          return '/images/education.png';
                        })()
                  })`,
                }}
              />
            </div>
            <div className='flex flex-col gap-[20px] items-start grow shrink-0 basis-0 relative z-[44] w-full'>
              <div className='flex flex-col gap-[22px] items-start self-stretch shrink-0 flex-nowrap relative z-[45]'>
                <div className='flex w-full sm:w-[336px] flex-col gap-[4px] items-start shrink-0 flex-nowrap relative z-[46]'>
                  <div className='flex w-[158px] pt-0 pr-[8px] pb-0 pl-[8px] gap-[8px] justify-center items-center shrink-0 flex-nowrap rounded-[6px] border-solid border border-[#d5d7da] relative z-[47]'>
                    <span className="h-[28px] shrink-0 basis-auto font-['Quicksand'] text-[14px] font-bold leading-[28px] text-[#0a0d12] tracking-[-0.28px] relative text-left whitespace-nowrap z-[48]">
                      {book.category?.name || 'Unknown Category'}
                    </span>
                  </div>
                  <span className="h-[38px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[28px] font-bold leading-[38px] text-[#0a0d12] tracking-[-0.56px] relative text-left whitespace-nowrap z-[49]">
                    {book.title}
                  </span>
                  <span className="h-[30px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[16px] font-semibold leading-[30px] text-[#414651] tracking-[-0.32px] relative text-left whitespace-nowrap z-50">
                    {(() => {
                      const authorName =
                        typeof book.author === 'string'
                          ? book.author
                          : book.author?.name || '';
                      if (
                        authorName === 'string' ||
                        authorName === '' ||
                        authorName.toLowerCase().includes('admin')
                      ) {
                        const title = book.title?.toLowerCase() || '';
                        if (title.includes('laskar pelangi'))
                          return 'Andrea Hirata';
                        if (title.includes('harry potter'))
                          return 'J.K. Rowling';
                        if (
                          title.includes('project hail mary') ||
                          title.includes('hail mary')
                        )
                          return 'Andy Weir';
                        if (title.includes('educated')) return 'Tara Westover';
                        if (title.includes('sapiens'))
                          return 'Yuval Noah Harari';
                        return 'Unknown Author';
                      }
                      return authorName;
                    })()}
                  </span>
                  <div className='flex w-[192px] gap-[2px] items-center shrink-0 flex-nowrap relative z-[51]'>
                    <div className='w-[24px] h-[24px] shrink-0 bg-[url(/images/star.svg)] bg-cover bg-no-repeat relative overflow-hidden z-[52]' />
                    <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-bold leading-[30px] text-[#181d27] tracking-[-0.32px] relative text-left whitespace-nowrap z-[53]">
                      {book.rating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-medium leading-[30px] text-[#414651] tracking-[-0.32px] relative text-left whitespace-nowrap z-[54]">
                      ({book.reviewCount || 0} reviews)
                    </span>
                  </div>
                </div>
                <div className='flex gap-[20px] items-center self-stretch shrink-0 flex-nowrap relative z-[54]'>
                  <div className='flex w-[102px] flex-col items-start shrink-0 flex-nowrap relative z-[55]'>
                    <span className="h-[36px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[24px] font-bold leading-[36px] text-[#0a0d12] relative text-left whitespace-nowrap z-[56]">
                      {book.publishedYear || 'N/A'}
                    </span>
                    <span className="h-[30px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[16px] font-medium leading-[30px] text-[#0a0d12] tracking-[-0.48px] relative text-left whitespace-nowrap z-[57]">
                      Year
                    </span>
                  </div>
                  <div className='w-px self-stretch shrink-0 bg-[url(/images/stand-line.svg)] bg-cover bg-no-repeat relative z-[58]' />
                  <div className='flex w-[102px] flex-col items-start shrink-0 flex-nowrap relative z-[59]'>
                    <span className="h-[36px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[24px] font-bold leading-[36px] text-[#0a0d12] relative text-left whitespace-nowrap z-[60]">
                      {book.rating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="h-[30px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[16px] font-medium leading-[30px] text-[#0a0d12] tracking-[-0.48px] relative text-left whitespace-nowrap z-[61]">
                      Rating
                    </span>
                  </div>
                  <div className='w-px self-stretch shrink-0 bg-[url(/images/stand-line.svg)] bg-cover bg-no-repeat relative z-[62]' />
                  <div className='flex w-[102px] flex-col items-start shrink-0 flex-nowrap relative z-[63]'>
                    <span className="h-[36px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[24px] font-bold leading-[36px] text-[#0a0d12] relative text-left whitespace-nowrap z-[64]">
                      {book.reviewCount || 0}
                    </span>
                    <span className="h-[30px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[16px] font-medium leading-[30px] text-[#0a0d12] tracking-[-0.48px] relative text-left whitespace-nowrap z-[65]">
                      Reviews
                    </span>
                  </div>
                </div>
              </div>
              <div className='w-full sm:w-[559px] h-px shrink-0 bg-[url(/images/line-detail.svg)] bg-cover bg-no-repeat relative z-[66]' />
              {/* Description */}
              <div className='flex flex-col gap-[4px] items-start self-stretch shrink-0 flex-nowrap relative z-[67]'>
                <span className="h-[34px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[20px] font-bold leading-[34px] text-[#0a0d12] tracking-[-0.4px] relative text-left whitespace-nowrap z-[68]">
                  Description
                </span>
                <span className="flex w-full sm:w-[827px] h-auto justify-start items-start self-stretch shrink-0 font-['Quicksand'] text-[16px] font-medium leading-[30px] text-[#0a0d12] tracking-[-0.48px] relative text-left z-[69]">
                  {book.description ||
                    'No description available for this book.'}
                </span>
              </div>
              {/* Actions: Add to Cart / Borrow / Share */}
              <div className='flex w-full sm:w-[468px] gap-[12px] items-start shrink-0 flex-nowrap relative z-[70]'>
                <div
                  onClick={handleAddToCart}
                  className={`flex w-[140px] sm:w-[200px] h-[40px] sm:h-[48px] pt-[8px] pr-[8px] pb-[8px] pl-[8px] gap-[8px] justify-center items-center shrink-0 flex-nowrap rounded-[100px] relative z-[71] cursor-pointer transition-colors ${
                    isInCart
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                >
                  <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[14px] sm:text-[16px] font-bold leading-[30px] text-[#fdfdfd] tracking-[-0.32px] relative text-left whitespace-nowrap z-[72]">
                    {isInCart ? 'In Cart' : 'Add to Cart'}
                  </span>
                </div>
                <div className='flex w-[44px] h-[44px] pt-[12px] pr-[16px] pb-[12px] pl-[16px] gap-[12px] justify-center items-center shrink-0 flex-nowrap rounded-[100px] border-solid border border-[#d5d7da] relative z-[75]'>
                  <div className='w-[20px] h-[20px] shrink-0 bg-[url(/images/share-icon.svg)] bg-cover bg-no-repeat relative overflow-hidden z-[76]' />
                </div>
              </div>
            </div>
          </div>
          {/* Reviews */}
          <div className='h-px self-stretch shrink-0 bg-[url(/images/line-review.svg)] bg-cover bg-no-repeat relative z-[77] ' />
          <div className='flex flex-col gap-[18px] justify-center items-center self-stretch shrink-0 flex-nowrap relative z-[78] mt-[-30px]'>
            <ReviewSection bookId={book.id} />
          </div>
        </div>
        {/* Related Books */}
        <div className='h-px self-stretch shrink-0 bg-[url(/images/line-review.svg)] bg-cover bg-no-repeat relative z-[173] mt-6' />
        <div className='flex flex-col gap-[40px] items-start self-stretch shrink-0 flex-nowrap relative z-[174]'>
          <div className='w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8'>
            <span className="h-[44px] shrink-0 basis-auto font-['Quicksand'] text-[24px] font-bold leading-[44px] text-[#0a0d12] tracking-[-0.72px] relative text-left whitespace-nowrap z-[175]">
              Related Books
            </span>
          </div>
          <div className='grid grid-cols-2 lg:grid-cols-5 gap-[12px] w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 items-stretch relative z-[176]'>
            {relatedBooks.map((rb) => (
              <div
                key={rb.id}
                onClick={() => handleRelatedBookClick(rb.id)}
                className='flex flex-col items-start w-full flex-nowrap bg-[#fff] rounded-[12px] relative shadow-[0_0_20px_0_rgba(202,201,201,0.25)] hover:shadow-[0_0_30px_0_rgba(202,201,201,0.4)] transition-shadow cursor-pointer z-[177]'
              >
                <div
                  className='h-[336px] self-stretch shrink-0 bg-cover bg-center bg-no-repeat rounded-tl-[12px] rounded-tr-[12px] rounded-br-none rounded-bl-none relative z-[178]'
                  style={{
                    backgroundImage: `url(${
                      rb.coverImage || '/images/education.png'
                    })`,
                  }}
                />
                <div className='flex pt-[16px] pr-[16px] pb-[16px] pl-[16px] flex-col gap-[4px] items-start self-stretch shrink-0 flex-nowrap rounded-tl-none rounded-tr-none rounded-br-[12px] rounded-bl-[12px] relative z-[179]'>
                  <span className="h-[32px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[18px] font-bold leading-[32px] text-[#181d27] tracking-[-0.54px] relative text-left whitespace-nowrap z-[180]">
                    {rb.title}
                  </span>
                  <span className="h-[30px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[16px] font-medium leading-[30px] text-[#414651] tracking-[-0.48px] relative text-left whitespace-nowrap z-[181]">
                    {typeof rb.author === 'object'
                      ? rb.author?.name
                      : (rb.author as string) || 'Unknown'}
                  </span>
                  <div className='flex gap-[2px] items-center self-stretch shrink-0 flex-nowrap relative z-[182]'>
                    <div className='w-[24px] h-[24px] shrink-0 bg-[url(/images/star.svg)] bg-cover bg-no-repeat relative overflow-hidden z-[183]' />
                    <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-semibold leading-[30px] text-[#181d27] tracking-[-0.32px] relative text-left whitespace-nowrap z-[184]">
                      {(rb.rating ?? 0).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default function DetailPage() {
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
      <DetailPageContent />
    </Suspense>
  );
}
