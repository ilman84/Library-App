'use client';

import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  loadCartFromStorage,
} from '@/store/slices/cartSlice';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CartPage() {
  const { items, totalItems } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Load cart from localStorage on component mount
  useEffect(() => {
    dispatch(loadCartFromStorage());
  }, [dispatch]);

  const handleRemoveItem = (bookId: number | string | undefined) => {
    if (bookId !== undefined) {
      dispatch(removeFromCart(Number(bookId)));
    }
  };

  const handleUpdateQuantity = (
    bookId: number | string | undefined,
    quantity: number
  ) => {
    if (bookId !== undefined) {
      dispatch(updateQuantity({ bookId: Number(bookId), quantity }));
    }
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleBorrowBooks = () => {
    if (items.length > 0) {
      // Navigate to checkout page
      router.push('/checkout');
    }
  };

  return (
    <div className='min-h-screen bg-white'>
      <Navbar />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 font-quicksand'>
            My Cart
          </h1>
          {totalItems > 0 && (
            <button
              onClick={handleClearCart}
              className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-quicksand'
            >
              Clear Cart
            </button>
          )}
        </div>

        {totalItems === 0 ? (
          <div className='text-center py-12'>
            <div className='w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
              <div className='w-12 h-12 bg-[url(/images/black-cart-icon.png)] bg-contain bg-no-repeat opacity-50' />
            </div>
            <h2 className='text-xl font-semibold text-gray-600 mb-2 font-quicksand'>
              Your cart is empty
            </h2>
            <p className='text-gray-500 mb-6 font-quicksand'>
              Add some books to get started!
            </p>
            <Link
              href='/'
              className='inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-quicksand'
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className='space-y-6'>
            {items.map((item) => (
              <div
                key={item.book.id}
                className='flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-gray-200 rounded-lg'
              >
                <div className='flex items-center gap-4 w-full sm:w-auto sm:flex-1'>
                  <div className='w-20 h-24 relative flex-shrink-0'>
                    {item.book.coverImage ? (
                      <Image
                        src={item.book.coverImage || '/images/education.png'}
                        alt={item.book.title || 'Book'}
                        fill
                        className='object-cover rounded'
                      />
                    ) : (
                      <div className='w-full h-full bg-gray-200 rounded flex items-center justify-center'>
                        <span className='text-gray-400 text-xs'>No Image</span>
                      </div>
                    )}
                  </div>

                  <div className='flex-1'>
                    <h3 className='font-semibold text-lg text-gray-900 font-quicksand'>
                      {item.book.title || 'Untitled'}
                    </h3>
                    <p className='text-gray-600 font-quicksand'>
                      by{' '}
                      {typeof item.book.author === 'string'
                        ? item.book.author
                        : item.book.author?.name || 'Unknown Author'}
                    </p>
                    <p className='text-sm text-gray-500 font-quicksand'>
                      Added: {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end'>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.book.id, item.quantity - 1)
                      }
                      className='w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors'
                    >
                      -
                    </button>
                    <span className='w-8 text-center font-quicksand'>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.book.id, item.quantity + 1)
                      }
                      className='w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors'
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.book.id)}
                    className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-quicksand'
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className='border-t pt-6'>
              <div className='flex justify-between items-center'>
                <span className='text-lg font-semibold text-gray-900 font-quicksand'>
                  Total Items: {totalItems}
                </span>
                <button
                  onClick={handleBorrowBooks}
                  className='px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-quicksand'
                >
                  Borrow Book
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
