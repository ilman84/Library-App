'use client';

import { useState, useRef, useEffect } from 'react';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useSearchParams } from 'next/navigation';
import { useMe } from '../../../hooks/api/useMe';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { loadCartFromStorage, addToCart } from '@/store/slices/cartSlice';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateLoan } from '../../../hooks/api/useLoans';
import { useBooks } from '../../../hooks/api/useBooks';
import { toast } from 'sonner';

function CartBooks() {
  const { items } = useAppSelector((state) => state.cart);

  if (items.length === 0) {
    return (
      <div className='text-center py-8'>
        <span className="font-['Quicksand'] text-[16px] text-[#414651]">
          No books in cart
        </span>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {items.map((item) => {
        const rawCover =
          typeof item.book.coverImage === 'string' ? item.book.coverImage : '';
        const isValidCover =
          rawCover.trim() !== '' &&
          !rawCover.startsWith('blob:') &&
          !rawCover.includes('localhost:5173');
        const cover: string = isValidCover ? rawCover : '/images/education.png';

        const authorName =
          typeof item.book.author === 'string'
            ? item.book.author
            : typeof item.book.author === 'object'
            ? item.book.author?.name ?? 'Unknown'
            : 'Unknown';

        return (
          <div
            key={item.book.id}
            className='flex gap-[16px] items-center self-stretch'
          >
            <div
              className='w-[92px] h-[138px] shrink-0 bg-cover bg-no-repeat rounded'
              style={{ backgroundImage: `url(${cover})` }}
            />
            <div className='flex w-[196px] flex-col gap-[4px] items-start'>
              <div className='flex w-[78px] pt-0 pr-[8px] pb-0 pl-[8px] gap-[8px] justify-center items-center rounded-[6px] border border-[#d5d7da]'>
                <span className="font-['Quicksand'] text-[14px] font-bold text-[#0a0d12]">
                  Category
                </span>
              </div>
              <span className="font-['Quicksand'] text-[20px] font-bold text-[#0a0d12] leading-tight break-words">
                {item.book.title || 'Untitled'}
              </span>
              <span className="font-['Quicksand'] text-[16px] font-medium text-[#414651] leading-tight break-words">
                {authorName}
              </span>
              <span className="font-['Quicksand'] text-[14px] font-medium text-[#666]">
                Quantity: {item.quantity}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('id');
  const { user } = useAuth();
  const { data: me, error: meError } = useMe();
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);
  const createLoanMutation = useCreateLoan();

  // Get user data directly from API and AuthContext (same as profile page)
  const userName = me?.profile?.name || user?.name || 'Loading...';
  const userEmail = me?.profile?.email || user?.email || 'Loading...';
  const userPhone = me?.profile?.phone || 'Not provided';
  const userRole = me?.profile?.role || user?.role || 'Loading...';

  // Load cart from localStorage on component mount
  useEffect(() => {
    dispatch(loadCartFromStorage());
  }, [dispatch]);

  // Fetch books data for adding to cart
  const { data: booksData } = useBooks({ page: 1, limit: 100 });

  // Add book to cart if bookId is provided in URL
  useEffect(() => {
    console.log('=== CART ADD DEBUG ===');
    console.log('bookId:', bookId);
    console.log('booksData:', booksData);
    console.log('items.length:', items.length);
    console.log('booksData?.data:', booksData?.data);

    if (bookId && booksData?.data) {
      // Correctly access the books array from BooksResponse structure
      const books = (booksData.data as { books?: unknown[] }).books || [];
      console.log('books array:', books);
      console.log('Looking for book ID:', Number(bookId));

      const book = books.find(
        (b: unknown) =>
          typeof b === 'object' &&
          b !== null &&
          'id' in b &&
          (b as { id: number }).id === Number(bookId)
      ) as { id: number; title: string; [key: string]: unknown } | undefined;
      console.log('Found book:', book);

      if (book) {
        // Check if book is already in cart
        const isAlreadyInCart = items.some(
          (item) => item.book.id === Number(bookId)
        );
        console.log('Is already in cart:', isAlreadyInCart);

        if (!isAlreadyInCart) {
          console.log('📚 Adding book to cart from URL:', book);
          dispatch(addToCart(book));
        } else {
          console.log('📚 Book already in cart, skipping add');
        }
      } else {
        console.log('❌ Book not found with ID:', bookId);
      }
    } else {
      console.log('❌ Conditions not met for adding book to cart');
    }
    console.log('====================');
  }, [bookId, booksData, items, dispatch]);

  // Debug logging for cart items
  useEffect(() => {
    console.log('=== CART DEBUG ===');
    console.log('Cart items:', items);
    console.log('Cart items length:', items.length);
    console.log('==================');
  }, [items]);

  // State for borrow date and duration
  const [borrowDate, setBorrowDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [borrowDuration, setBorrowDuration] = useState(3);

  // State for agreements
  const [agreement1, setAgreement1] = useState(false);
  const [agreement2, setAgreement2] = useState(false);

  // Ref for date button
  const dateButtonRef = useRef<HTMLDivElement>(null);

  // Calculate return date based on borrow date and duration
  const calculateReturnDate = (startDate: string, days: number) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const returnDate = calculateReturnDate(borrowDate, borrowDuration);

  // Check if all agreements are accepted
  const canBorrow = agreement1 && agreement2;

  // Debug logging for agreements
  useEffect(() => {
    console.log('=== AGREEMENTS DEBUG ===');
    console.log('Agreement 1:', agreement1);
    console.log('Agreement 2:', agreement2);
    console.log('Can borrow:', canBorrow);
    console.log('========================');
  }, [agreement1, agreement2, canBorrow]);

  // Handle borrow confirmation
  const handleBorrow = async () => {
    console.log('=== BORROW DEBUG ===');
    console.log('Can borrow:', canBorrow);
    console.log('Book ID:', bookId);
    console.log('Agreement 1:', agreement1);
    console.log('Agreement 2:', agreement2);
    console.log('Cart items:', items);
    console.log('===================');

    if (!canBorrow) {
      toast.error('Please accept all agreements to continue.');
      return;
    }

    if (items.length === 0) {
      toast.error('No books in cart to borrow.');
      return;
    }

    try {
      // Create loans for each book in cart
      const loanPromises = items
        .filter((item) => item.book.id != null)
        .map((item) => {
          const loanData = {
            bookId: item.book.id as number,
            days: borrowDuration,
          };

          console.log('Creating loan for book:', {
            bookId: item.book.id,
            title: item.book.title,
            loanData,
          });

          return createLoanMutation.mutateAsync(loanData);
        });

      // Wait for all loans to be created
      await Promise.all(loanPromises);

      console.log('All loans created successfully!');

      // Show success toast
      toast.success('Books borrowed successfully!', {
        description: `You have successfully borrowed ${items.length} book${
          items.length > 1 ? 's' : ''
        }.`,
      });

      // Clear cart after successful borrowing
      dispatch({ type: 'cart/clearCart' });

      // Navigate to success page
      const firstBookId = items[0].book.id;
      console.log('Redirecting to success page with book ID:', firstBookId);
      window.location.href = `/success-borrow?id=${firstBookId}`;
    } catch (error) {
      console.error('Error creating loans:', error);

      // Handle specific error messages
      if (error instanceof Error) {
        if (
          error.message.includes(
            'already borrowed this book and not returned yet'
          )
        ) {
          toast.error(
            'You have already borrowed this book and not returned it yet. Please return it first before borrowing again.'
          );
        } else if (error.message.includes('not available')) {
          toast.error('This book is currently not available for borrowing.');
        } else if (error.message.includes('exceeded maximum')) {
          toast.error(
            'You have exceeded the maximum number of books you can borrow.'
          );
        } else {
          toast.error(`Failed to borrow books: ${error.message}`);
        }
      } else {
        toast.error('Failed to borrow books. Please try again.');
      }
    }
  };

  // Handle date picker button click
  const handleDateButtonClick = () => {
    if (!dateButtonRef.current) return;

    // Get the button position
    const buttonRect = dateButtonRef.current.getBoundingClientRect();

    // Create a temporary input element to trigger date picker
    const tempInput = document.createElement('input');
    tempInput.type = 'date';
    tempInput.value = borrowDate;
    tempInput.min = new Date().toISOString().split('T')[0];

    // Position the input exactly where we want the calendar to appear
    tempInput.style.position = 'fixed';
    tempInput.style.left = `${buttonRect.left - 210}px`; // 200px width + 10px margin
    tempInput.style.top = `${buttonRect.top}px`;
    tempInput.style.width = '200px';
    tempInput.style.height = '40px';
    tempInput.style.zIndex = '9999';
    tempInput.style.opacity = '0.01'; // Very low opacity but not completely invisible
    tempInput.style.pointerEvents = 'auto';
    tempInput.style.border = '2px solid #1c65da';
    tempInput.style.borderRadius = '8px';
    tempInput.style.outline = 'none';
    tempInput.style.background = 'white';
    tempInput.style.padding = '8px';
    tempInput.style.fontSize = '14px';

    document.body.appendChild(tempInput);

    // Focus and click the input to trigger the picker
    tempInput.focus();
    tempInput.click();
    tempInput.showPicker();

    tempInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      setBorrowDate(target.value);
      document.body.removeChild(tempInput);
    });

    tempInput.addEventListener('cancel', () => {
      document.body.removeChild(tempInput);
    });

    // Clean up after a timeout in case events don't fire
    setTimeout(() => {
      if (document.body.contains(tempInput)) {
        document.body.removeChild(tempInput);
      }
    }, 10000);
  };
  return (
    <div className='min-h-screen bg-white overflow-x-hidden'>
      <Navbar />

      {/* Main container */}
      <div className='main-container flex w-[393px] sm:w-[1002px] flex-col gap-[32px] items-start flex-nowrap relative mx-auto my-0 mt-8 px-4 sm:px-0'>
        {/* Page title */}
        <span className="h-[44px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[24px] sm:text-[36px] font-bold leading-[44px] text-[#0a0d12] relative text-left whitespace-nowrap">
          Checkout
        </span>
        {/* Content wrapper: left (info + books), right (summary) */}
        <div className='flex flex-col sm:flex-row gap-[24px] sm:gap-[58px] justify-center items-start self-stretch shrink-0 flex-nowrap relative z-[1]'>
          {/* Left column: User Information + Book List */}
          <div className='flex flex-col gap-[32px] items-start grow shrink-0 basis-0 flex-nowrap relative z-[2]'>
            {/* User Information card */}
            <div className='flex flex-col gap-[16px] items-start self-stretch shrink-0 flex-nowrap relative z-[3]'>
              <span className="h-[36px] shrink-0 basis-auto font-['Quicksand'] text-[20px] sm:text-[24px] font-bold leading-[36px] text-[#0a0d12] relative text-left whitespace-nowrap z-[4]">
                User Information
              </span>
              {meError && (
                <div className='w-full p-3 bg-red-50 border border-red-200 rounded-lg'>
                  <span className="font-['Quicksand'] text-[14px] text-red-600">
                    Error loading user data. Please refresh the page.
                  </span>
                </div>
              )}
              <div className='flex h-[30px] justify-between items-center self-stretch shrink-0 flex-nowrap relative z-[5]'>
                <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-medium leading-[30px] text-[#0a0d12] tracking-[-0.48px] relative text-left whitespace-nowrap z-[6]">
                  Name
                </span>
                <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-bold leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap z-[7]">
                  {userName}
                </span>
              </div>
              <div className='flex h-[30px] justify-between items-center self-stretch shrink-0 flex-nowrap relative z-[8]'>
                <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-medium leading-[30px] text-[#0a0d12] tracking-[-0.48px] relative text-left whitespace-nowrap z-[9]">
                  Email
                </span>
                <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-bold leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap z-10">
                  {userEmail}
                </span>
              </div>
              <div className='flex h-[30px] justify-between items-center self-stretch shrink-0 flex-nowrap relative z-[11]'>
                <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-medium leading-[30px] text-[#0a0d12] tracking-[-0.48px] relative text-left whitespace-nowrap z-[12]">
                  Nomor Handphone
                </span>
                <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-bold leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap z-[13]">
                  {userPhone}
                </span>
              </div>
              <div className='flex h-[30px] justify-between items-center self-stretch shrink-0 flex-nowrap relative z-[14]'>
                <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-medium leading-[30px] text-[#0a0d12] tracking-[-0.48px] relative text-left whitespace-nowrap z-[15]">
                  Role
                </span>
                <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-bold leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap z-[16]">
                  {userRole}
                </span>
              </div>
            </div>
            {/* Divider */}
            <div className='h-px self-stretch shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-22/mY2ktSkXNT.png)] bg-cover bg-no-repeat relative z-[17]' />
            {/* Book List */}
            <div className='flex flex-col gap-[16px] items-start self-stretch shrink-0 flex-nowrap relative z-[18]'>
              <span className="h-[36px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[20px] sm:text-[24px] font-bold leading-[36px] text-[#0a0d12] relative text-left whitespace-nowrap z-[19]">
                Book List
              </span>
              <CartBooks />
            </div>
          </div>
          {/* Right column: Complete Your Borrow Request */}
          <div className='flex w-full sm:w-[478px] pt-[20px] pr-[20px] pb-[20px] pl-[12px] sm:pl-[20px] -ml-2 sm:ml-0 flex-col gap-[24px] items-start shrink-0 flex-nowrap bg-[#fff] rounded-[20px] relative shadow-[0_0_20px_0_rgba(202,201,201,0.25)] z-[31]'>
            <span className="h-[38px] shrink-0 basis-auto font-['Quicksand'] text-[20px] sm:text-[28px] font-bold leading-[38px] text-[#0a0d12] tracking-[-0.56px] relative text-left whitespace-nowrap z-[32]">
              Complete Your Borrow Request
            </span>
            {/* Borrow Date */}
            <div className='flex flex-col gap-[2px] items-start self-stretch shrink-0 flex-nowrap bg-[#fff] relative z-[33]'>
              <span className="h-[28px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[14px] font-bold leading-[28px] text-[#0a0d12] tracking-[-0.28px] relative text-left whitespace-nowrap z-[34]">
                Borrow Date
              </span>
              <div className='flex h-[48px] pt-[8px] pr-[16px] pb-[8px] pl-[16px] gap-[8px] items-center self-stretch shrink-0 flex-nowrap bg-[#f4f4f4] rounded-[12px] border-solid border border-[#d5d7da] relative z-[35]'>
                <span className="h-[30px] grow shrink-0 basis-auto font-['Quicksand'] text-[16px] font-semibold leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap z-[36]">
                  {new Date(borrowDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <div
                  ref={dateButtonRef}
                  className='w-[20px] h-[20px] shrink-0 bg-[url(/images/Date.svg)] bg-cover bg-no-repeat relative overflow-hidden z-[37] cursor-pointer hover:opacity-70 transition-opacity'
                  onClick={handleDateButtonClick}
                />
              </div>
            </div>
            {/* Borrow Duration */}
            <div className='flex flex-col gap-[12px] items-start self-stretch shrink-0 flex-nowrap relative z-[38]'>
              <span className="h-[30px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[16px] font-bold leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap z-[39]">
                Borrow Duration
              </span>
              <div
                className='flex w-[89px] gap-[15px] items-center shrink-0 flex-nowrap relative z-40 cursor-pointer'
                onClick={() => setBorrowDuration(3)}
              >
                <div
                  className={`w-[24px] h-[24px] shrink-0 rounded-[11998.801px] relative overflow-hidden z-[41] ${
                    borrowDuration === 3
                      ? 'bg-[#1c65da]'
                      : 'border-solid border border-[#a4a7ae]'
                  }`}
                >
                  {borrowDuration === 3 && (
                    <div className='w-[9.6px] h-[9.6px] bg-[#fff] rounded-[11998.801px] relative overflow-hidden z-[42] mt-[7.199px] mr-0 mb-0 ml-[7.2px]' />
                  )}
                </div>
                <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-semibold leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap z-[43]">
                  3 Days
                </span>
              </div>
              <div
                className='flex w-[90px] gap-[15px] items-center shrink-0 flex-nowrap relative z-[44] cursor-pointer'
                onClick={() => setBorrowDuration(5)}
              >
                <div
                  className={`w-[24px] h-[24px] shrink-0 rounded-[11998.801px] relative overflow-hidden z-[45] ${
                    borrowDuration === 5
                      ? 'bg-[#1c65da]'
                      : 'border-solid border border-[#a4a7ae]'
                  }`}
                >
                  {borrowDuration === 5 && (
                    <div className='w-[9.6px] h-[9.6px] bg-[#fff] rounded-[11998.801px] relative overflow-hidden z-[46] mt-[7.199px] mr-0 mb-0 ml-[7.2px]' />
                  )}
                </div>
                <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-semibold leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap z-[47]">
                  5 Days
                </span>
              </div>
              <div
                className='flex w-[96px] gap-[15px] items-center shrink-0 flex-nowrap relative z-[48] cursor-pointer'
                onClick={() => setBorrowDuration(10)}
              >
                <div
                  className={`w-[24px] h-[24px] shrink-0 rounded-[11998.801px] relative overflow-hidden z-[49] ${
                    borrowDuration === 10
                      ? 'bg-[#1c65da]'
                      : 'border-solid border border-[#a4a7ae]'
                  }`}
                >
                  {borrowDuration === 10 && (
                    <div className='w-[9.6px] h-[9.6px] bg-[#fff] rounded-[11998.801px] relative overflow-hidden z-50 mt-[7.199px] mr-0 mb-0 ml-[7.2px]' />
                  )}
                </div>
                <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-semibold leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap z-[51]">
                  10 Days
                </span>
              </div>
            </div>
            {/* Return Date notice */}
            <div className='flex pt-[16px] pr-[16px] pb-[16px] pl-[16px] flex-col items-start self-stretch shrink-0 flex-nowrap bg-[#f6f9fd] rounded-[12px] relative z-50'>
              <span className="h-[30px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[16px] font-bold leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap z-[51]">
                Return Date
              </span>
              <div className="w-full sm:w-[406px] self-stretch shrink-0 font-['Quicksand'] text-[16px] font-medium leading-[30px] tracking-[-0.48px] relative text-left whitespace-normal break-words z-[52]">
                <span className="font-['Quicksand'] text-[16px] font-medium leading-[30px] text-[#0a0d12] tracking-[-0.48px] relative text-left whitespace-normal break-words">
                  Please return the book no later than{' '}
                </span>
                <span className="font-['Quicksand'] text-[16px] font-bold leading-[30px] text-[#ee1d52] tracking-[-0.32px] relative text-left whitespace-normal break-words">
                  {returnDate}{' '}
                </span>
              </div>
            </div>
            {/* Agreements */}
            <div className='flex w-full sm:w-[399px] flex-col gap-[8px] items-start shrink-0 flex-nowrap relative z-[53]'>
              <div
                className='flex gap-[16px] items-start self-stretch shrink-0 flex-nowrap relative z-[54] cursor-pointer'
                onClick={() => setAgreement1(!agreement1)}
              >
                <div
                  className={`w-[20px] h-[20px] shrink-0 rounded-[6px] relative overflow-hidden z-[55] ${
                    agreement1
                      ? 'bg-[#1c65da]'
                      : 'border-solid border border-[#a4a7ae]'
                  }`}
                >
                  {agreement1 && (
                    <svg
                      className='w-[16px] h-[16px] text-white relative top-[2px] left-[2px] z-[56]'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  )}
                </div>
                <div className='flex flex-col'>
                  <span className="h-auto shrink-0 basis-auto font-['Quicksand'] text-[16px] font-semibold leading-[24px] sm:leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-normal break-words z-[57]">
                    I agree to return the book(s) before the due date.
                  </span>
                </div>
              </div>
              <div
                className='flex w-[305px] gap-[16px] items-center shrink-0 flex-nowrap relative z-[58] cursor-pointer'
                onClick={() => setAgreement2(!agreement2)}
              >
                <div
                  className={`w-[20px] h-[20px] shrink-0 rounded-[6px] relative overflow-hidden z-[59] ${
                    agreement2
                      ? 'bg-[#1c65da]'
                      : 'border-solid border border-[#a4a7ae]'
                  }`}
                >
                  {agreement2 && (
                    <svg
                      className='w-[16px] h-[16px] text-white relative top-[2px] left-[2px] z-60'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  )}
                </div>
                <span className="h-auto shrink-0 basis-auto font-['Quicksand'] text-[16px] font-semibold leading-[24px] sm:leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-normal break-words z-[61]">
                  I accept the library borrowing policy.
                </span>
              </div>
            </div>
            {/* CTA: Confirm & Borrow */}
            <div
              className={`flex h-[48px] pt-[8px] pr-[8px] pb-[8px] pl-[8px] gap-[8px] justify-center items-center self-stretch shrink-0 flex-nowrap rounded-[100px] relative z-[60] transition-all ${
                canBorrow
                  ? 'bg-[#1c65da] hover:bg-[#1557c4] cursor-pointer'
                  : 'bg-[#a4a7ae] cursor-not-allowed'
              }`}
              onClick={canBorrow ? handleBorrow : undefined}
            >
              <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-bold leading-[30px] text-[#fdfdfd] tracking-[-0.32px] relative text-left whitespace-nowrap z-[61]">
                {canBorrow
                  ? 'Confirm & Borrow'
                  : 'Please accept all agreements'}
              </span>
            </div>

            {/* Agreement Status Indicator */}
            {!canBorrow && (
              <div className='w-full p-2 bg-yellow-50 border border-yellow-200 rounded-lg'>
                <span className="font-['Quicksand'] text-[12px] text-yellow-700">
                  ⚠️ Please check both agreement boxes above to enable borrowing
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
