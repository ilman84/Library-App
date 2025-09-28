'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Footer from './Footer';
import BooksRecommendation from './BooksRecommendation';
import PopularAuthors from './PopularAuthors';
import PopularAuthorsDesktop from './PopularAuthorsDesktop';
import { useAppDispatch } from '@/store/hooks';
import { setSelectedCategory } from '@/store/slices/categorySlice';
import { useCategories } from '../../../hooks/api/useCategories';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);

  // Carousel data
  const carouselTexts = [
    { id: 1, text: 'Welcome to Booky' },
    { id: 2, text: 'Discover your Next Favorite Book' },
    { id: 3, text: 'Books Open Windows to The World' },
    { id: 4, text: 'Read, Learn, and Grow' },
  ];

  const handleSearch = () => {
    console.log('🔍 Search clicked! Query:', searchQuery);
    if (searchQuery.trim()) {
      console.log('🔍 Redirecting to category with search:', searchQuery);
      router.push(`/category?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      console.log('🔍 Redirecting to category without search');
      router.push('/category');
    }
  };

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselTexts.length);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [carouselTexts.length]);

  // Handle dot click
  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  // Fetch categories from API
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  // Fallback categories if API fails
  const fallbackCategories = useMemo(
    () => [
      { id: 1, name: 'Fiction' },
      { id: 2, name: 'Sci-Fi' },
      { id: 3, name: 'Business' },
      { id: 4, name: 'Self-Help' },
      { id: 5, name: 'Technology' },
      { id: 6, name: 'Education' },
      { id: 7, name: 'Self-Improvement' },
      { id: 8, name: 'Non-Fiction' },
      { id: 9, name: 'Finance' },
    ],
    []
  );

  // State for direct fetch fallback
  const [directFetchCategories, setDirectFetchCategories] = useState<
    { id: number; name: string }[]
  >([]);
  const [directFetchLoading, setDirectFetchLoading] = useState(false);
  const [directFetchError, setDirectFetchError] = useState<string | null>(null);

  // Direct fetch as fallback
  useEffect(() => {
    if (categoriesError && !categoriesData) {
      setDirectFetchLoading(true);
      fetch(
        'https://belibraryformentee-production.up.railway.app/api/categories',
        {
          headers: {
            accept: '*/*',
          },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          console.log('Direct fetch success:', data);
          setDirectFetchCategories(data.data?.categories || fallbackCategories);
          setDirectFetchError(null);
        })
        .catch((error) => {
          console.log('Direct fetch error:', error);
          setDirectFetchError(error.message);
          setDirectFetchCategories(fallbackCategories);
        })
        .finally(() => {
          setDirectFetchLoading(false);
        });
    }
  }, [categoriesError, categoriesData, fallbackCategories]);

  const categories =
    (
      categoriesData as
        | { data: { categories: Array<{ id: number; name: string }> } }
        | undefined
    )?.data?.categories ||
    directFetchCategories ||
    fallbackCategories;
  const isLoading = categoriesLoading || directFetchLoading;
  const hasError = categoriesError && directFetchError;

  // Function to get category image based on category name
  const getCategoryImage = (categoryName: string) => {
    // Debug: log the category name being processed
    console.log(
      '🔍 Processing category:',
      categoryName,
      'Type:',
      typeof categoryName
    );

    const imageMap: { [key: string]: string } = {
      // Fiction categories
      'Fiction Updated': '/images/fiction.png',
      Fiction: '/images/fiction.png',

      // Science & Technology categories
      'Sci-Fi': '/images/science.png',
      'Science Fiction': '/images/science.png',
      Science: '/images/science.png',
      Technology: '/images/science.png',

      // Business & Finance categories
      Business: '/images/finance.png',
      Finance: '/images/finance.png',
      'Personal Finance': '/images/finance.png',
      Economics: '/images/finance.png',

      // Non-Fiction categories
      'Self-Help': '/images/nonfiction.png',
      'Non-Fiction': 'bg-[url(/images/nonfiction.png)] ',
      'Non Fiction': 'bg-[url(/images/nonfiction.png)] ',
      'non-fiction': 'bg-[url(/images/nonfiction.png)] ',
      'non fiction': 'bg-[url(/images/nonfiction.png)] ',
      nonfiction: 'bg-[url(/images/nonfiction.png)] ',
      Nonfiction: 'bg-[url(/images/nonfiction.png)] ',
      'Mystery & Thriller': '/images/nonfiction.png',
      Mystery: '/images/nonfiction.png',
      Thriller: '/images/nonfiction.png',
      History: '/images/nonfiction.png',
      Biography: '/images/nonfiction.png',
      Health: '/images/nonfiction.png',
      Art: '/images/nonfiction.png',
      Philosophy: '/images/nonfiction.png',
      Religion: '/images/nonfiction.png',
      Travel: '/images/nonfiction.png',
      Cooking: '/images/nonfiction.png',
      Sports: '/images/nonfiction.png',
      Music: '/images/nonfiction.png',
      Poetry: '/images/nonfiction.png',
      Drama: '/images/nonfiction.png',
      Horror: '/images/nonfiction.png',

      // Education categories
      Education: '/images/education.png',
      'Self-Improvement': '/images/Self-Improvement.png',
      'Self Improvement': '/images/Self-Improvement.png',
      Children: '/images/education.png',

      // Other fiction categories
      Romance: '/images/fiction.png',
      Fantasy: '/images/fiction.png',
      Adventure: '/images/fiction.png',
      'Young Adult': '/images/fiction.png',

      // Invalid category name
      string: '/images/default-category.png',
    };

    const result = imageMap[categoryName] || '/images/default-category.png';
    console.log('🎯 Category mapping result:', categoryName, '→', result);
    return result;
  };

  // Debug logging
  console.log('=== CATEGORIES DEBUG ===');
  console.log('Categories data:', categoriesData);
  console.log('Categories array:', categories);
  console.log('Categories count:', categories.length);
  categories.forEach((cat: { id: number; name: string }, index: number) => {
    console.log(`Category ${index + 1}:`, {
      id: cat.id,
      name: cat.name,
      imagePath: getCategoryImage(cat.name),
    });
  });
  console.log('========================');

  // Debug logging
  console.log('Categories loading:', isLoading);
  console.log('Categories data:', categoriesData);
  console.log('Direct fetch data:', directFetchCategories);
  console.log('Categories error:', categoriesError);
  console.log('Direct fetch error:', directFetchError);
  console.log('Final categories array:', categories);

  const handleCategoryClick = (categoryId: number, categoryName: string) => {
    // Dispatch Redux action to set selected category
    dispatch(setSelectedCategory({ id: categoryId, name: categoryName }));
    // Navigate to category page
    router.push(`/category/${categoryId}`);
  };

  // Function to get display name for category
  const getCategoryDisplayName = (categoryName: string) => {
    const nameMap: { [key: string]: string } = {
      'Self-Help': 'Non-Fiction', // Map Self-Help to Non-Fiction for display
    };
    return nameMap[categoryName] || categoryName;
  };
  return (
    <>
      {/* Conditional Header - Show Navbar if logged in, otherwise show login/register buttons */}
      {user ? (
        <Navbar />
      ) : (
        <div className='hidden sm:flex w-full max-w-[1440px] h-[80px] px-[120px] justify-between items-center bg-[#fff] mx-auto relative z-[200]'>
          {/* Desktop Logo */}
          <div className='flex items-center gap-[12px]'>
            <div className='w-[40px] h-[40px] relative'>
              <div className='w-full h-full bg-[url(/images/booky-logo.svg)] bg-[length:100%_100%] bg-no-repeat' />
            </div>
            <span className='text-[32px] font-bold text-[#0a0d12] font-quicksand'>
              Booky
            </span>
          </div>

          {/* Desktop Buttons */}
          <div className='flex items-center gap-[16px]'>
            <Link href='/login'>
              <button className='px-[24px] py-[12px] bg-[#fff] border border-[#d5d7da] rounded-[8px] text-[#0a0d12] font-quicksand font-medium text-[16px] hover:bg-[#f8f9fa] transition-colors'>
                Login
              </button>
            </Link>
            <Link href='/register'>
              <button className='px-[24px] py-[12px] bg-[#3b82f6] text-[#fff] rounded-[8px] font-quicksand font-medium text-[16px] hover:bg-[#2563eb] transition-colors'>
                Register
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Desktop Main Content - 1199.57px */}
      <div className='hidden sm:block w-[1200px] mx-auto'>
        {/* Desktop Hero Section */}
        <div className='relative w-full h-[441px] bg-gradient-to-b from-[#87CEEB] to-[#E0F6FF] rounded-[24px] overflow-hidden'>
          {/* Background Clouds */}
          <motion.div
            className='absolute top-0 left-0 w-[350px] h-[310px] bg-[url(/images/left-cloudy.png)] bg-contain bg-no-repeat'
            animate={{
              y: [0, -15, 0],
              x: [0, 8, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className='absolute top-[-25px] right-0 w-[350px] h-[310px] bg-[url(/images/right-cloudy.png)] bg-right bg-contain bg-no-repeat'
            animate={{
              y: [0, -20, 0],
              x: [0, -10, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />

          {/* Left Character - Girl on Book */}
          <motion.div
            className='absolute left-0 top-[40px] z-10'
            animate={{
              y: [0, -12, 0],
              x: [0, 5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
          >
            <div className='relative'>
              {/* Girl Character */}
              <div className='w-[260px] h-[260px] bg-[url(/images/girl.png)] bg-contain bg-no-repeat' />
            </div>
          </motion.div>

          {/* Left Book - Bottom Left */}
          <motion.div
            className='absolute bottom-[8px] left-[8px] w-[140px] h-[130px] bg-[url(/images/left-book.png)] bg-left-bottom bg-no-repeat bg-contain'
            animate={{
              y: [0, -8, 0],
              x: [0, 3, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          />

          {/* Right Character - Boy on Paper Airplane */}
          <motion.div
            className='absolute right-[-100px] top-[10px] z-10'
            animate={{
              y: [0, -18, 0],
              x: [0, -8, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1.5,
            }}
          >
            <div className='relative'>
              {/* Boy Character */}
              <div className='w-[300px] h-[300px] bg-[url(/images/boy.png)] bg-contain bg-no-repeat' />
            </div>
          </motion.div>

          {/* Right Book - Bottom Right */}
          <motion.div
            className='absolute bottom-[-15px] right-[-10px] w-[200px] h-[150px] bg-[url(/images/right-book.png)] bg-contain bg-no-repeat'
            animate={{
              y: [0, -10, 0],
              x: [0, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2.5,
            }}
          />

          {/* Center Text - Carousel */}
          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20'>
            <h1
              className='text-[82.52px] font-bold text-[#3b82f6] font-quicksand transition-all duration-500 ease-in-out whitespace-pre-line'
              style={{
                textShadow:
                  '4px 4px 0 #fff, -4px -4px 0 #fff, 4px -4px 0 #fff, -4px 4px 0 #fff',
              }}
            >
              {carouselTexts[currentSlide].text}
            </h1>
          </div>
        </div>

        {/* Dots Indicator - Outside Desktop Main Content */}
        <div className='flex justify-center mt-[20px] gap-[8px] mb-[40px]'>
          {carouselTexts.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-[12px] h-[12px] rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === index
                  ? 'bg-[#3b82f6]'
                  : 'bg-[#d5d7da] hover:bg-[#9ca3af]'
              }`}
            />
          ))}
        </div>

        {/* Desktop Category Cards Section */}
        <div className='hidden sm:block w-full max-w-[1200px] mx-auto px-[40px] mb-[60px]'>
          {isLoading ? (
            <div className='flex justify-center items-center py-8'>
              <div className='text-lg font-quicksand'>
                Loading categories...
              </div>
            </div>
          ) : hasError ? (
            <div className='flex justify-center items-center py-8'>
              <div className='text-lg font-quicksand text-red-500'>
                Error loading categories. Using fallback data.
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-6 gap-[20px]'>
              {categories
                .slice(0, 6)
                .map((category: { id: number; name: string }) => (
                  <div key={category.id} className='flex flex-col'>
                    <div
                      onClick={() =>
                        handleCategoryClick(category.id, category.name)
                      }
                      className='flex items-center justify-center w-[162.7px] h-[64px] bg-[#E0ECFF] rounded-[16px] cursor-pointer hover:bg-[#D1E3FF] transition-colors'
                    >
                      <div
                        className='w-[50px] h-[50px] bg-contain bg-no-repeat bg-center'
                        style={{
                          backgroundImage: `url(${getCategoryImage(
                            category.name
                          )})`,
                        }}
                      />
                    </div>
                    <span className='text-[16px] font-semibold text-[#0a0d12] font-quicksand text-left mt-[8px]'>
                      {getCategoryDisplayName(category.name)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Desktop Recommendation Section */}
        <div className='hidden sm:block w-full max-w-[1200px] mx-auto px-[40px] mb-[60px]'>
          <h2 className='text-[32px] font-bold text-[#0a0d12] font-quicksand mb-[32px] text-left'>
            Recommendation
          </h2>
          <BooksRecommendation variant='desktop' />
        </div>

        {/* Desktop Popular Authors Section */}
        <div className='hidden sm:block w-full max-w-[1200px] mx-auto px-[40px] mb-[60px]'>
          <h2 className='text-[32px] font-bold text-[#0a0d12] font-quicksand mb-[32px] text-left'>
            Popular Authors
          </h2>
          <PopularAuthorsDesktop />
        </div>

        {/* Desktop Footer Section */}
        <Footer />
      </div>

      {/* Mobile Container - 393px */}
      <div className='sm:hidden main-container w-[393px] min-h-screen relative mx-auto my-0'>
        <div className='flex w-[393px] min-h-screen gap-[8px] items-center flex-nowrap bg-[#fff] relative'>
          <div className='flex w-[393px] flex-col gap-[16px] items-center shrink-0 flex-nowrap relative z-[1]'>
            {/* Mobile Header - Only show if user is not logged in */}
            {!user && (
              <div className='flex h-[64px] pt-0 pr-[16px] pb-0 pl-[16px] justify-between items-center self-stretch shrink-0 flex-nowrap bg-[#fff] relative shadow-[0_0_20px_0_rgba(202,201,201,0.25)] z-[2] w-full'>
                {/* Logo */}
                <div className='w-[40px] h-[40px] shrink-0 relative overflow-hidden z-[3]'>
                  <div className='w-full h-full bg-[url(/images/booky-logo.svg)] bg-[length:100%_100%] bg-no-repeat absolute top-0 left-0 z-[4]' />
                </div>
                {/* Header Icons */}
                <div className='flex gap-[8px] items-center shrink-0 flex-nowrap relative z-10'>
                  {/* Search Input */}
                  <div className='flex items-center gap-1 min-w-0 flex-1 max-w-[120px]'>
                    <input
                      type='text'
                      placeholder='Search...'
                      value={searchQuery}
                      onChange={(e) => {
                        console.log('🔍 Input changed:', e.target.value);
                        setSearchQuery(e.target.value);
                      }}
                      className='w-full px-2 py-1 text-[11px] border-2 border-blue-300 rounded text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white relative z-20 min-w-0'
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                    />
                    <button
                      type='button'
                      className='w-[20px] h-[20px] bg-[url(/images/search-icon.svg)] bg-cover bg-no-repeat relative z-20 cursor-pointer hover:opacity-70 transition-opacity border border-gray-300 rounded p-0.5 flex-shrink-0'
                      onClick={handleSearch}
                    />
                  </div>
                  {/* Cart Icon */}
                  <div className='w-[24px] h-[24px] shrink-0 relative overflow-hidden z-[7]'>
                    <div className='w-[18px] h-[18px] bg-[url(/images/black-cart-icon.png)] bg-[length:100%_100%] bg-no-repeat relative z-[8] mt-[3px] mr-0 mb-0 ml-[3px]' />
                  </div>
                  {/* Login and Register Buttons */}
                  <div className='flex items-center gap-1'>
                    <Link
                      href='/login'
                      className='px-1.5 py-1 text-[10px] font-quicksand text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap border border-gray-300 rounded'
                    >
                      Login
                    </Link>
                    <Link
                      href='/register'
                      className='px-1.5 py-1 text-[10px] font-quicksand bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors whitespace-nowrap'
                    >
                      Register
                    </Link>
                  </div>
                </div>
              </div>
            )}
            {/* Main Content Container */}
            <div className='flex w-[361px] flex-col gap-[24px] items-start shrink-0 flex-nowrap relative z-[12] mt-0'>
              {/* Hero Section */}
              <div className='flex flex-col gap-[8px] items-center self-stretch shrink-0 flex-nowrap relative z-[13]'>
                {/* Hero Background (Desktop layout scaled to mobile) */}
                <div className='relative w-full h-[150px] bg-gradient-to-b from-[#87CEEB] to-[#E0F6FF] rounded-[16px] overflow-hidden z-[14]'>
                  {/* Background Clouds */}
                  <motion.div
                    className='absolute top-0 left-0 w-[130px] h-[110px] bg-[url(/images/left-cloudy.png)] bg-contain bg-no-repeat'
                    animate={{
                      y: [0, -8, 0],
                      x: [0, 4, 0],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <motion.div
                    className='absolute top-[-12px] right-0 w-[130px] h-[110px] bg-[url(/images/right-cloudy.png)] bg-right bg-contain bg-no-repeat'
                    animate={{
                      y: [0, -10, 0],
                      x: [0, -5, 0],
                    }}
                    transition={{
                      duration: 7,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 1,
                    }}
                  />

                  {/* Left Character - Girl on Book */}
                  <motion.div
                    className='absolute left-0 top-[20px] z-10'
                    animate={{
                      y: [0, -6, 0],
                      x: [0, 3, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.5,
                    }}
                  >
                    <div className='relative'>
                      <div className='w-[90px] h-[90px] bg-[url(/images/girl.png)] bg-contain bg-no-repeat' />
                    </div>
                  </motion.div>

                  {/* Left Book - Bottom Left */}
                  <motion.div
                    className='absolute bottom-0 left-0 w-[50px] h-[40px] bg-[url(/images/left-book.png)] bg-left-bottom bg-no-repeat bg-contain'
                    animate={{
                      y: [0, -4, 0],
                      x: [0, 2, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 2,
                    }}
                  />

                  {/* Right Character - Boy on Paper Airplane */}
                  <motion.div
                    className='absolute right-[-30px] top-[6px] z-10'
                    animate={{
                      y: [0, -9, 0],
                      x: [0, -4, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 1.5,
                    }}
                  >
                    <div className='relative'>
                      <div className='w-[100px] h-[100px] bg-[url(/images/boy.png)] bg-contain bg-no-repeat' />
                    </div>
                  </motion.div>

                  {/* Right Book - Bottom Right */}
                  <motion.div
                    className='absolute bottom-0 right-[-4px] w-[70px] h-[45px] bg-[url(/images/right-book.png)] bg-contain bg-no-repeat'
                    animate={{
                      y: [0, -5, 0],
                      x: [0, -3, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 2.5,
                    }}
                  />

                  {/* Center Text - Carousel */}
                  <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20'>
                    <h1
                      className='text-[24px] font-bold text-[#3b82f6] font-quicksand transition-all duration-500 ease-in-out whitespace-pre-line'
                      style={{
                        textShadow:
                          '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff',
                      }}
                    >
                      {carouselTexts[currentSlide].text}
                    </h1>
                  </div>
                </div>
                {/* Dots Indicator */}
                <div className='flex gap-[4px] items-center shrink-0 flex-nowrap relative z-[15]'>
                  {carouselTexts.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleDotClick(index)}
                      className={`w-[6px] h-[6px] shrink-0 rounded-[50%] transition-all duration-300 cursor-pointer ${
                        currentSlide === index
                          ? 'bg-[#3b82f6]'
                          : 'bg-[#d5d7da] hover:bg-[#9ca3af]'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {/* Category Cards Section */}
              <div className='flex flex-col gap-[12px] items-start self-stretch shrink-0 flex-nowrap relative z-[19]'>
                {isLoading ? (
                  <div className='flex justify-center items-center py-8 w-full'>
                    <div className='text-lg font-quicksand'>
                      Loading categories...
                    </div>
                  </div>
                ) : hasError ? (
                  <div className='flex justify-center items-center py-8 w-full'>
                    <div className='text-lg font-quicksand text-red-500'>
                      Error loading categories. Using fallback data.
                    </div>
                  </div>
                ) : (
                  <>
                    {/* First Row of Categories */}
                    <div className='flex gap-[12px] items-center self-stretch shrink-0 flex-nowrap relative z-20'>
                      {categories
                        .slice(0, 3)
                        .map((category: { id: number; name: string }) => (
                          <div
                            key={category.id}
                            onClick={() =>
                              handleCategoryClick(category.id, category.name)
                            }
                            className='flex pt-[8px] pr-[8px] pb-[8px] pl-[8px] flex-col gap-[12px] items-start self-stretch grow shrink-0 basis-0 flex-nowrap bg-[#fff] rounded-[16px] relative shadow-[0_0_20px_0_rgba(202,201,201,0.25)] z-[21] cursor-pointer hover:shadow-lg transition-shadow'
                          >
                            <div className='flex pt-[5.6px] pr-[5.6px] pb-[5.6px] pl-[5.6px] gap-[5.6px] justify-center items-center self-stretch shrink-0 flex-nowrap bg-[#dfebff] rounded-[10.5px] relative z-[22]'>
                              <div className='w-[44.8px] h-[44.8px] shrink-0 relative z-[23]'>
                                <div
                                  className='w-full h-full bg-contain bg-no-repeat bg-center absolute top-0 left-0 z-[24]'
                                  style={{
                                    backgroundImage: `url(${getCategoryImage(
                                      category.name
                                    )})`,
                                  }}
                                />
                              </div>
                            </div>
                            <span className='h-[24px] self-stretch shrink-0 basis-auto font-quicksand text-[12px] font-semibold leading-[24px] text-[#0a0d12] relative text-left whitespace-nowrap z-[25]'>
                              {getCategoryDisplayName(category.name)}
                            </span>
                          </div>
                        ))}
                    </div>
                    {/* Second Row of Categories */}
                    <div className='flex gap-[12px] justify-center items-start self-stretch shrink-0 flex-nowrap relative z-[36]'>
                      {categories
                        .slice(3, 6)
                        .map((category: { id: number; name: string }) => (
                          <div
                            key={category.id}
                            onClick={() =>
                              handleCategoryClick(category.id, category.name)
                            }
                            className='flex pt-[8px] pr-[8px] pb-[8px] pl-[8px] flex-col gap-[12px] justify-center items-start grow shrink-0 basis-0 flex-nowrap bg-[#fff] rounded-[16px] relative shadow-[0_0_20px_0_rgba(202,201,201,0.25)] z-[37] cursor-pointer hover:shadow-lg transition-shadow'
                          >
                            <div className='flex pt-[5.6px] pr-[5.6px] pb-[5.6px] pl-[5.6px] gap-[5.6px] justify-center items-center self-stretch shrink-0 flex-nowrap bg-[#dfebff] rounded-[10.5px] relative z-[38]'>
                              <div className='w-[44.8px] h-[44.8px] shrink-0 relative z-[39]'>
                                <div
                                  className='w-full h-full bg-contain bg-no-repeat bg-center absolute top-0 left-0 z-40'
                                  style={{
                                    backgroundImage: `url(${getCategoryImage(
                                      category.name
                                    )})`,
                                  }}
                                />
                              </div>
                            </div>
                            <span className='h-[24px] self-stretch shrink-0 basis-auto font-quicksand text-[12px] font-semibold leading-[24px] text-[#0a0d12] relative text-left whitespace-nowrap z-[41]'>
                              {getCategoryDisplayName(category.name)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>
              {/* Recommendation Section */}
              <div className='flex flex-col gap-[20px] justify-center items-center self-stretch shrink-0 flex-nowrap relative z-[52]'>
                {/* Section Title */}
                <span className='h-[36px] self-stretch shrink-0 basis-auto font-quicksand text-[24px] font-bold leading-[36px] text-[#0a0d12] relative text-left whitespace-nowrap z-[53]'>
                  Recommendation
                </span>
                {/* Book Cards Grid */}
                <div className='flex flex-col gap-[16px] items-start self-stretch shrink-0 flex-nowrap relative z-[54]'>
                  <div className='flex gap-[16px] items-center self-stretch shrink-0 flex-wrap relative z-[55]'>
                    <BooksRecommendation variant='mobile' />
                  </div>
                </div>
                {/* Load More handled inside BooksRecommendation; remove static button */}
              </div>
              {/* Divider Line */}
              <div className='h-px self-stretch shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-20/xgaZDRrCyX.png)] bg-cover bg-no-repeat relative z-[138] mt-[32px]' />
              {/* Popular Authors Section */}
              <PopularAuthors />
            </div>
            {/* Footer Section */}
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}
