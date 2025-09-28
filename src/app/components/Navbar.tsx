'use client';

import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppSelector } from '@/store/hooks';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems } = useAppSelector((state) => state.cart);
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/category?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchIconClick = () => {
    if (searchQuery.trim()) {
      router.push(`/category?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className='w-full bg-white sticky top-0 z-50'>
      {/* Desktop Navbar */}
      <div className='hidden md:block'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo */}
            <Link
              href='/'
              className='flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity'
            >
              <div className='w-10 h-10 relative'>
                <div className='w-full h-full bg-[url(/images/booky-logo.svg)] bg-[length:100%_100%] bg-no-repeat' />
              </div>
              <span className='text-2xl font-bold text-[#0a0d12] font-quicksand'>
                Booky
              </span>
            </Link>

            {/* Search Bar */}
            <div className='flex-1 max-w-lg mx-8'>
              <form onSubmit={handleSearch} className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                <input
                  type='text'
                  placeholder='Search book'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-quicksand text-sm'
                />
              </form>
            </div>

            {/* Right Section */}
            <div className='flex items-center gap-4'>
              {/* Shopping Bag */}
              <div className='relative'>
                <Link href='/cart'>
                  <div className='w-6 h-6 bg-[url(/images/black-cart-icon.png)] bg-contain bg-no-repeat cursor-pointer' />
                  {totalItems > 0 && (
                    <div className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold'>
                      {totalItems > 99 ? '99+' : totalItems}
                    </div>
                  )}
                </Link>
              </div>

              {/* User Profile or Login/Register Buttons */}
              {user && user.id ? (
                <div className='flex items-center gap-3'>
                  {/* Profile Picture */}
                  <Link
                    href='/profile'
                    className='w-8 h-8 rounded-full overflow-hidden cursor-pointer'
                  >
                    <Image
                      src='/images/foto-profile.png'
                      alt='Profile'
                      width={32}
                      height={32}
                      className='w-full h-full object-cover'
                    />
                  </Link>

                  {/* User Name with Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='ghost'
                        className='flex items-center gap-1 p-0 h-auto'
                      >
                        <span className='text-gray-900 font-quicksand font-medium'>
                          {user?.name || 'User'}
                        </span>
                        <ChevronDown className='w-4 h-4 text-gray-500' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-48'>
                      <DropdownMenuItem asChild className='font-quicksand'>
                        <Link href='/profile'>Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className='font-quicksand'>
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem className='font-quicksand'>
                        My Books
                      </DropdownMenuItem>
                      {user?.role === 'ADMIN' && (
                        <DropdownMenuItem asChild className='font-quicksand'>
                          <Link href='/admin'>Admin Panel</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className='font-quicksand text-red-600 focus:text-red-600'
                      >
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className='flex items-center gap-3'>
                  <Link
                    href='/login'
                    className='px-4 py-2 text-sm font-quicksand text-gray-700 hover:text-blue-600 transition-colors'
                  >
                    Login
                  </Link>
                  <Link
                    href='/register'
                    className='px-4 py-2 text-sm font-quicksand bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navbar - 393px */}
      <div className='block md:hidden w-full max-w-[393px] mx-auto'>
        <div className='flex items-center justify-between h-16 px-2 gap-2'>
          {/* Logo Only */}
          <Link
            href='/'
            className='flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0'
          >
            <div className='w-8 h-8 relative'>
              <div className='w-full h-full bg-[url(/images/booky-logo.svg)] bg-[length:100%_100%] bg-no-repeat' />
            </div>
          </Link>

          {/* Right Section - Search Input and Icons */}
          <div className='flex items-center gap-2 flex-1 max-w-[200px]'>
            {/* Search Input */}
            <div className='flex items-center gap-1 flex-1'>
              <input
                type='text'
                placeholder='Search...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full px-1.5 py-0.5 text-[10px] border border-gray-300 rounded text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white'
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(e);
                  }
                }}
              />
              <Search
                className='w-3.5 h-3.5 text-gray-700 cursor-pointer flex-shrink-0'
                onClick={handleSearchIconClick}
              />
            </div>
          </div>

          {/* Icons Section */}
          <div className='flex items-center gap-2'>
            {/* Shopping Bag */}
            <div className='relative'>
              <Link href='/cart'>
                <div className='w-5 h-5 bg-[url(/images/black-cart-icon.png)] bg-contain bg-no-repeat cursor-pointer' />
                {totalItems > 0 && (
                  <div className='absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold'>
                    {totalItems > 99 ? '99+' : totalItems}
                  </div>
                )}
              </Link>
            </div>

            {/* User Profile or Login/Register Buttons */}
            {user && user.id ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Link
                    href='/profile'
                    className='w-6 h-6 rounded-full cursor-pointer overflow-hidden'
                  >
                    <Image
                      src='/images/foto-profile.png'
                      alt='Profile'
                      width={24}
                      height={24}
                      className='w-full h-full object-cover'
                    />
                  </Link>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48'>
                  <DropdownMenuItem asChild className='font-quicksand'>
                    <Link href='/profile'>Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className='font-quicksand'>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className='font-quicksand'>
                    My Books
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className='font-quicksand text-red-600 focus:text-red-600'
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className='flex items-center gap-2'>
                <Link
                  href='/login'
                  className='px-3 py-1.5 text-sm font-quicksand text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap border border-gray-300 rounded'
                >
                  Login
                </Link>
                <Link
                  href='/register'
                  className='px-3 py-1.5 text-sm font-quicksand bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors whitespace-nowrap'
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
