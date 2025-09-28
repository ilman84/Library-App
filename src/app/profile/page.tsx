'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ReviewModal from '@/app/components/ReviewModal';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import {
  useMyLoans,
  useMyReviews,
  useMe,
  useUpdateProfile,
} from '../../../hooks/api/useMe';
import { apiClient } from '../../../lib/api/client';

function ProfilePageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('Profile');
  const [loanStatusFilter, setLoanStatusFilter] = useState<string>('ALL');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBookForReview, setSelectedBookForReview] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const {
    data: loansData,
    isLoading: loansLoading,
    error: loansError,
  } = useMyLoans(1, 20, {
    enabled: !!user, // Only fetch if user is logged in
  });
  const allLoans = useMemo(() => loansData?.loans || [], [loansData]);

  // Filter loans based on status
  const loans = useMemo(() => {
    if (loanStatusFilter === 'ALL') {
      return allLoans;
    }
    return allLoans.filter((loan) => loan.status === loanStatusFilter);
  }, [allLoans, loanStatusFilter]);

  // Count loans by status
  const loanCounts = useMemo(() => {
    return {
      ALL: allLoans.length,
      BORROWED: allLoans.filter((loan) => loan.status === 'BORROWED').length,
      RETURNED: allLoans.filter((loan) => loan.status === 'RETURNED').length,
      OVERDUE: allLoans.filter((loan) => loan.status === 'OVERDUE').length,
    };
  }, [allLoans]);
  const { data: reviewsData, isLoading: reviewsLoading } = useMyReviews(1, 20, {
    enabled: !!user, // Only fetch if user is logged in
  });
  const reviews = useMemo(() => reviewsData?.reviews || [], [reviewsData]);

  // Get profile data
  const { data: profileData } = useMe();
  const updateProfileMutation = useUpdateProfile();

  // Debug logging - moved to useEffect to avoid repeated logs
  useEffect(() => {
    if (loansLoading) {
      console.log('🔄 Loans are loading...');
    } else if (loansError) {
      console.log('❌ Loans error:', loansError);
    } else if (loansData) {
      console.log('✅ Loans data received:', loansData);
      console.log('📚 Loans array:', loans);
      console.log('📊 Loans length:', loans.length);
      console.log('🔍 Pagination:', loansData.pagination);
    } else {
      console.log('⏳ No loans data yet');
    }
  }, [loansData, loans, loansLoading, loansError]);

  // Debug logging for reviews
  useEffect(() => {
    if (reviewsLoading) {
      console.log('🔄 Reviews are loading...');
    } else if (reviewsData) {
      console.log('✅ Reviews data received:', reviewsData);
      console.log('⭐ Reviews array:', reviews);
      console.log('📊 Reviews length:', reviews.length);
      console.log('🔍 Reviews pagination:', reviewsData.pagination);
    } else {
      console.log('⏳ No reviews data yet');
    }
  }, [reviewsData, reviews, reviewsLoading]);

  // Handle URL parameter for tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'borrowed') {
      setActiveTab('Borrowed List');
    }
  }, [searchParams]);

  // Ensure API client has the auth token
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token ? 'Present' : 'Missing');
    if (token) {
      apiClient.setAuthToken(token);
      console.log('Token set in API client');
    }
  }, []);

  const tabs = [
    { id: 'Profile', label: 'Profile' },
    { id: 'Borrowed List', label: 'Borrowed List' },
    { id: 'Reviews', label: 'Reviews' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BORROWED':
        return 'bg-[rgba(36,165,0,0.05)] text-[#23a400]';
      case 'RETURNED':
        return 'bg-[rgba(238,29,82,0.05)] text-[#ee1d52]';
      case 'OVERDUE':
        return 'bg-[rgba(255,165,0,0.05)] text-[#ff8c00]';
      default:
        return 'bg-[rgba(128,128,128,0.05)] text-[#808080]';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDuration = (borrowedAt: string, dueAt: string) => {
    const borrowed = new Date(borrowedAt);
    const due = new Date(dueAt);
    const diffTime = due.getTime() - borrowed.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} Days`;
  };

  const formatReviewDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle edit profile
  const handleEditProfile = () => {
    setIsEditing(true);
    setEditName(profileData?.profile?.name || user?.name || '');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName('');
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({ name: editName.trim() });
      setIsEditing(false);
      setEditName('');
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleGiveReview = (bookId: number, bookTitle: string) => {
    console.log('Opening review modal for book:', bookTitle, 'ID:', bookId);
    setSelectedBookForReview({ id: bookId, title: bookTitle });
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedBookForReview(null);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className={`w-[20px] h-[20px] shrink-0 bg-cover bg-no-repeat relative overflow-hidden ${
          i < rating
            ? 'bg-[url(/images/star.svg)]'
            : 'bg-[url(/images/star.svg)] opacity-30'
        }`}
      />
    ));
  };

  const ReviewCard = ({
    review,
    isMobile = false,
  }: {
    review: {
      id: number;
      star: number;
      comment: string;
      createdAt: string;
      book?: { title: string; coverImage?: string };
    };
    isMobile?: boolean;
  }) => {
    const coverImage = review.book?.coverImage || '/images/education.png';

    if (isMobile) {
      return (
        <div className='flex flex-col gap-[16px] w-full bg-[#fff] rounded-[12px] shadow-[0_0_15px_0_rgba(202,201,201,0.25)] p-[16px]'>
          <div className='flex gap-[12px] items-start'>
            <div
              className='w-[60px] h-[90px] shrink-0 bg-cover bg-no-repeat rounded'
              style={{ backgroundImage: `url(${coverImage})` }}
            />
            <div className='flex flex-col gap-[8px] flex-1'>
              <div className='flex gap-[8px] items-center'>
                {renderStars(review.star)}
              </div>
              <span className="font-['Quicksand'] text-[16px] font-bold leading-[24px] text-[#0a0d12]">
                {review.book?.title || 'Unknown Book'}
              </span>
              <span className="font-['Quicksand'] text-[14px] font-medium leading-[20px] text-[#414651]">
                {formatReviewDate(review.createdAt)}
              </span>
              <span className="font-['Quicksand'] text-[14px] font-medium leading-[20px] text-[#0a0d12]">
                {review.comment}
              </span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className='flex pt-[20px] pr-[20px] pb-[20px] pl-[20px] flex-col gap-[16px] items-start self-stretch shrink-0 flex-nowrap bg-[#fff] rounded-[16px] relative shadow-[0_0_20px_0_rgba(202,201,201,0.25)]'>
        <div className='flex gap-[16px] items-start self-stretch shrink-0 flex-nowrap relative'>
          <div
            className='w-[80px] h-[120px] shrink-0 bg-cover bg-no-repeat rounded relative'
            style={{ backgroundImage: `url(${coverImage})` }}
          />
          <div className='flex flex-col gap-[8px] items-start grow shrink-0 basis-0 flex-nowrap relative'>
            <div className='flex gap-[4px] items-center shrink-0 flex-nowrap relative'>
              {renderStars(review.star)}
            </div>
            <span className="h-[32px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[18px] font-bold leading-[32px] text-[#0a0d12] tracking-[-0.36px] relative text-left whitespace-nowrap">
              {review.book?.title || 'Unknown Book'}
            </span>
            <span className="h-[24px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[14px] font-medium leading-[24px] text-[#414651] tracking-[-0.42px] relative text-left whitespace-nowrap">
              {formatReviewDate(review.createdAt)}
            </span>
            <span className="self-stretch shrink-0 basis-auto font-['Quicksand'] text-[16px] font-medium leading-[24px] text-[#0a0d12] tracking-[-0.32px] relative text-left">
              {review.comment}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const LoanCard = ({
    loan,
    isMobile = false,
  }: {
    loan: {
      id: number;
      status: string;
      borrowedAt: string;
      dueAt: string;
      book?: { title: string; coverImage?: string };
    };
    isMobile?: boolean;
  }) => {
    const coverImage = loan.book?.coverImage || '/images/education.png';
    const statusColor = getStatusColor(loan.status);
    const duration = getDuration(loan.borrowedAt, loan.dueAt);

    if (isMobile) {
      return (
        <div className='flex flex-col gap-[16px] w-full bg-[#fff] rounded-[12px] shadow-[0_0_15px_0_rgba(202,201,201,0.25)] p-[16px]'>
          <div className='flex justify-between items-start w-full'>
            <div className='flex gap-[12px] items-center'>
              <span className="h-[24px] font-['Quicksand'] text-[14px] font-bold leading-[24px] text-[#0a0d12]">
                Status
              </span>
              <div
                className={`flex h-[28px] px-[8px] items-center rounded-[4px] ${statusColor}`}
              >
                <span className="h-[24px] font-['Quicksand'] text-[12px] font-bold leading-[24px]">
                  {loan.status}
                </span>
              </div>
            </div>
            <div className='flex gap-[12px] items-center'>
              <span className="h-[24px] font-['Quicksand'] text-[14px] font-bold leading-[24px] text-[#0a0d12]">
                Due Date
              </span>
              <div className='flex h-[28px] px-[8px] items-center bg-[rgba(238,29,82,0.1)] rounded-[4px]'>
                <span className="font-['Quicksand'] text-[12px] font-bold leading-[24px] text-[#ee1d52]">
                  {formatDate(loan.dueAt)}
                </span>
              </div>
            </div>
          </div>
          <div className='h-px w-full bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-22/fKG1JYo6Ch.png)] bg-cover bg-no-repeat' />
          <div className='flex flex-col gap-[12px] w-full'>
            <div className='flex gap-[12px] items-center'>
              <div
                className='w-[72px] h-[108px] shrink-0 bg-cover bg-no-repeat'
                style={{ backgroundImage: `url(${coverImage})` }}
              />
              <div className='flex flex-col gap-[4px]'>
                <div className='flex w-[78px] px-[8px] justify-center items-center rounded-[6px] border border-[#d5d7da]'>
                  <span className="h-[24px] font-['Quicksand'] text-[12px] font-bold leading-[24px] text-[#0a0d12]">
                    Book
                  </span>
                </div>
                <span className="font-['Quicksand'] text-[16px] font-bold leading-[24px] text-[#0a0d12]">
                  {loan.book?.title || 'Unknown Book'}
                </span>
                <div className='flex gap-[6px] items-center'>
                  <span className="font-['Quicksand'] text-[14px] font-bold leading-[20px] text-[#0a0d12]">
                    {formatDate(loan.borrowedAt)}
                  </span>
                  <div className='w-[2px] h-[2px] rounded-[50%] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-22/qmwAmZ8Nhe.png)] bg-cover bg-no-repeat' />
                  <span className="font-['Quicksand'] text-[14px] font-bold leading-[20px] text-[#0a0d12]">
                    Duration {duration}
                  </span>
                </div>
              </div>
            </div>
            {loan.status === 'BORROWED' && (
              <button
                onClick={() => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const bookId = (loan as any).bookId || (loan.book as any)?.id;
                  const bookTitle = loan.book?.title || 'Unknown Book';

                  if (bookId) {
                    handleGiveReview(bookId, bookTitle);
                  } else {
                    console.error('No bookId found for loan:', loan);
                    alert('Error: Book ID not found');
                  }
                }}
                className='flex w-full h-[36px] px-[8px] justify-center items-center bg-[#1c65da] hover:bg-[#1557c4] rounded-[100px] cursor-pointer transition-colors'
              >
                <span className="font-['Quicksand'] text-[14px] font-bold leading-[24px] text-[#fdfdfd]">
                  Give Review
                </span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className='flex pt-[20px] pr-[20px] pb-[20px] pl-[20px] flex-col gap-[20px] items-start self-stretch shrink-0 flex-nowrap bg-[#fff] rounded-[16px] relative shadow-[0_0_20px_0_rgba(202,201,201,0.25)]'>
        <div className='flex justify-between items-start self-stretch shrink-0 flex-nowrap relative'>
          <div className='flex gap-[12px] items-center shrink-0 flex-nowrap relative'>
            <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-bold leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap">
              Status
            </span>
            <div
              className={`flex h-[32px] pt-[2px] pr-[8px] pb-[2px] pl-[8px] gap-[8px] justify-center items-center shrink-0 flex-nowrap rounded-[4px] relative ${statusColor}`}
            >
              <span className="h-[28px] shrink-0 basis-auto font-['Quicksand'] text-[14px] font-bold leading-[28px] tracking-[-0.28px] relative text-left whitespace-nowrap">
                {loan.status}
              </span>
            </div>
          </div>
          <div className='flex gap-[12px] items-center shrink-0 flex-nowrap relative'>
            <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-bold leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap">
              Due Date
            </span>
            <div className='flex pt-[2px] pr-[8px] pb-[2px] pl-[8px] gap-[8px] justify-center items-center shrink-0 flex-nowrap bg-[rgba(238,29,82,0.1)] rounded-[4px] relative'>
              <div className='w-[100px] shrink-0 text-[14px] font-normal leading-[28px] tracking-[-0.28px] relative text-left whitespace-nowrap'>
                <span className="font-['Quicksand'] text-[14px] font-bold leading-[28px] text-[#ee1d52] tracking-[-0.28px] relative text-left">
                  {formatDate(loan.dueAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className='h-px self-stretch shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-22/fKG1JYo6Ch.png)] bg-cover bg-no-repeat relative' />
        <div className='flex justify-between items-center self-stretch shrink-0 flex-nowrap relative'>
          <div className='flex grow min-w-0 gap-[16px] items-center shrink-0 flex-nowrap relative'>
            <div
              className='w-[92px] h-[138px] shrink-0 bg-cover bg-no-repeat relative'
              style={{ backgroundImage: `url(${coverImage})` }}
            />
            <div className='flex w-[196px] flex-col gap-[4px] items-start shrink-0 flex-nowrap relative'>
              <div className='flex w-[78px] pt-0 pr-[8px] pb-0 pl-[8px] gap-[8px] justify-center items-center shrink-0 flex-nowrap rounded-[6px] border-solid border border-[#d5d7da] relative'>
                <span className="h-[28px] shrink-0 basis-auto font-['Quicksand'] text-[14px] font-bold leading-[28px] text-[#0a0d12] tracking-[-0.28px] relative text-left whitespace-nowrap">
                  Book
                </span>
              </div>
              <span className="h-[34px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[20px] font-bold leading-[34px] text-[#0a0d12] tracking-[-0.4px] relative text-left whitespace-nowrap">
                {loan.book?.title || 'Unknown Book'}
              </span>
              <div className='flex w-[228px] gap-[8px] items-center shrink-0 flex-nowrap relative'>
                <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-bold leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap">
                  {formatDate(loan.borrowedAt)}
                </span>
                <div className='w-[2px] h-[2px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-22/qmwAmZ8Nhe.png)] bg-cover bg-no-repeat rounded-[50%] relative' />
                <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-bold leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap">
                  Duration {duration}
                </span>
              </div>
            </div>
          </div>
          {loan.status === 'BORROWED' && (
            <button
              onClick={() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const bookId = (loan as any).bookId || (loan.book as any)?.id;
                const bookTitle = loan.book?.title || 'Unknown Book';

                if (bookId) {
                  handleGiveReview(bookId, bookTitle);
                } else {
                  console.error('No bookId found for loan:', loan);
                  alert('Error: Book ID not found');
                }
              }}
              className='flex w-[182px] h-[40px] pt-[8px] pr-[8px] pb-[8px] pl-[8px] gap-[8px] justify-center items-center shrink-0 flex-nowrap bg-[#1c65da] hover:bg-[#1557c4] rounded-[100px] relative cursor-pointer transition-colors'
            >
              <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-bold leading-[30px] text-[#fdfdfd] tracking-[-0.32px] relative text-left whitespace-nowrap">
                Give Review
              </span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className='min-h-screen bg-white'>
      {/* Navbar */}
      <Navbar />

      {/* Desktop Main Content */}
      <div className='hidden sm:block'>
        <div
          className={`main-container flex w-[1000px] flex-col gap-[24px] items-start flex-nowrap relative mx-auto my-0`}
        >
          {/* Navigation Tabs */}
          <div className='flex w-[557px] h-[56px] pt-[8px] pr-[8px] pb-[8px] pl-[8px] gap-[8px] items-center shrink-0 flex-nowrap bg-[#f4f4f4] rounded-[16px] relative'>
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-[175px] h-[40px] pt-[8px] pr-[12px] pb-[8px] pl-[12px] gap-[8px] justify-center items-center shrink-0 flex-nowrap rounded-[12px] relative cursor-pointer transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#fff] shadow-[0_0_20px_0_rgba(202,201,201,0.25)] z-[1]'
                    : 'z-[3]'
                }`}
              >
                <span
                  className={`h-[30px] shrink-0 basis-auto font-quicksand text-[16px] leading-[30px] tracking-[-0.32px] relative text-left whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'font-bold text-[#0a0d12] z-[2]'
                      : 'font-medium text-[#535861] z-[4]'
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            ))}
          </div>

          {/* Content Section */}
          <div className='flex flex-col gap-[24px] items-start self-stretch shrink-0 flex-nowrap relative z-[7]'>
            {activeTab === 'Profile' && (
              <>
                <div className='w-[557px] self-start'>
                  {/* Section Title */}
                  <span className='h-[38px] self-stretch shrink-0 basis-auto font-quicksand text-[24px] sm:text-[28px] font-bold leading-[38px] text-[#0a0d12] tracking-[-0.84px] relative text-left whitespace-nowrap z-[8]'>
                    Profile
                  </span>

                  {/* Profile Card */}
                  <Card className='flex pt-[20px] pr-[20px] pb-[20px] pl-[20px] flex-col gap-[24px] items-start shrink-0 flex-nowrap bg-[#fff] rounded-[16px] relative shadow-[0_0_20px_0_rgba(202,201,201,0.25)] z-[9] w-full mt-[12px]'>
                    <CardContent className='p-0 w-full'>
                      <div className='flex flex-col gap-[12px] items-start self-stretch shrink-0 flex-nowrap relative z-10'>
                        {/* Profile Picture */}
                        <div className='w-[64px] h-[64px] shrink-0 relative z-[11]'>
                          <Image
                            src='/images/foto-profile.png'
                            alt='Profile'
                            width={64}
                            height={64}
                            className='w-full h-full object-cover rounded-[50%]'
                          />
                        </div>

                        {/* User Information */}
                        <div className='flex justify-between items-center self-stretch shrink-0 flex-nowrap relative z-[12]'>
                          <span className='h-[30px] shrink-0 basis-auto font-quicksand text-[16px] font-medium leading-[30px] text-[#0a0d12] tracking-[-0.48px] relative text-left whitespace-nowrap z-[13]'>
                            Name
                          </span>
                          <div className='flex items-center gap-2'>
                            {isEditing ? (
                              <input
                                type='text'
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className='h-[30px] px-2 border border-gray-300 rounded text-[16px] font-bold text-[#0a0d12]'
                                placeholder='Enter name'
                              />
                            ) : (
                              <span className='h-[30px] shrink-0 basis-auto font-quicksand text-[16px] font-bold leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap z-[14]'>
                                {profileData?.profile?.name ||
                                  user?.name ||
                                  'Loading...'}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className='flex justify-between items-center self-stretch shrink-0 flex-nowrap relative z-[15]'>
                          <span className='h-[30px] shrink-0 basis-auto font-quicksand text-[16px] font-medium leading-[30px] text-[#0a0d12] tracking-[-0.48px] relative text-left whitespace-nowrap z-[16]'>
                            Email
                          </span>
                          <span className='h-[30px] shrink-0 basis-auto font-quicksand text-[16px] font-bold leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap z-[17]'>
                            {profileData?.profile?.email ||
                              user?.email ||
                              'Loading...'}
                          </span>
                        </div>

                        <div className='flex justify-between items-center self-stretch shrink-0 flex-nowrap relative z-[18]'>
                          <span className='h-[30px] shrink-0 basis-auto font-quicksand text-[16px] font-medium leading-[30px] text-[#0a0d12] tracking-[-0.48px] relative text-left whitespace-nowrap z-[19]'>
                            Nomor Handphone
                          </span>
                          <span className='h-[30px] shrink-0 basis-auto font-quicksand text-[16px] font-bold leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap z-20'>
                            {profileData?.profile?.phone || 'Not provided'}
                          </span>
                        </div>

                        <div className='flex justify-between items-center self-stretch shrink-0 flex-nowrap relative z-[21]'>
                          <span className='h-[30px] shrink-0 basis-auto font-quicksand text-[16px] font-medium leading-[30px] text-[#0a0d12] tracking-[-0.48px] relative text-left whitespace-nowrap z-[22]'>
                            Role
                          </span>
                          <span className='h-[30px] shrink-0 basis-auto font-quicksand text-[16px] font-bold leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap z-[23]'>
                            {profileData?.profile?.role ||
                              user?.role ||
                              'Loading...'}
                          </span>
                        </div>
                      </div>

                      {/* Update Profile Button */}
                      <div className='flex gap-2 w-full'>
                        {isEditing ? (
                          <>
                            <Button
                              onClick={handleSaveProfile}
                              disabled={updateProfileMutation.isPending}
                              className='flex h-[44px] pt-[8px] pr-[8px] pb-[8px] pl-[8px] gap-[8px] justify-center items-center flex-1 shrink-0 flex-nowrap bg-[#1c65da] hover:bg-[#1557c4] rounded-[100px] relative z-[24]'
                            >
                              <span className='h-[30px] shrink-0 basis-auto font-quicksand text-[16px] font-bold leading-[30px] text-[#fdfdfd] tracking-[-0.32px] relative text-left whitespace-nowrap z-[25]'>
                                {updateProfileMutation.isPending
                                  ? 'Saving...'
                                  : 'Save'}
                              </span>
                            </Button>
                            <Button
                              onClick={handleCancelEdit}
                              className='flex h-[44px] pt-[8px] pr-[8px] pb-[8px] pl-[8px] gap-[8px] justify-center items-center flex-1 shrink-0 flex-nowrap bg-[#6b7280] hover:bg-[#4b5563] rounded-[100px] relative z-[26]'
                            >
                              <span className='h-[30px] shrink-0 basis-auto font-quicksand text-[16px] font-bold leading-[30px] text-[#fdfdfd] tracking-[-0.32px] relative text-left whitespace-nowrap z-[27]'>
                                Cancel
                              </span>
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={handleEditProfile}
                            className='flex h-[44px] pt-[8px] pr-[8px] pb-[8px] pl-[8px] gap-[8px] justify-center items-center self-stretch shrink-0 flex-nowrap bg-[#1c65da] hover:bg-[#1557c4] rounded-[100px] relative z-[24] w-full'
                          >
                            <span className='h-[30px] shrink-0 basis-auto font-quicksand text-[16px] font-bold leading-[30px] text-[#fdfdfd] tracking-[-0.32px] relative text-left whitespace-nowrap z-[25]'>
                              Edit Profile
                            </span>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {activeTab === 'Borrowed List' && (
              <>
                <span className="h-[38px] self-stretch shrink-0 basis-auto font-['Quicksand'] text-[24px] sm:text-[28px] font-bold leading-[38px] text-[#0a0d12] tracking-[-0.84px] relative text-left whitespace-nowrap z-[42]">
                  Borrowed List
                </span>
                <div className='flex w-full h-[44px] pt-[8px] pr-[16px] pb-[8px] pl-[16px] gap-[6px] items-center shrink-0 flex-nowrap bg-[#fff] rounded-full border-solid border border-[#d5d7da] relative z-[43]'>
                  <div className='w-[20px] h-[20px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-22/LSOKwMdUcH.png)] bg-cover bg-no-repeat relative overflow-hidden z-[44]' />
                  <span className="h-[28px] shrink-0 basis-auto font-['Quicksand'] text-[14px] font-medium leading-[28px] text-[#535861] tracking-[-0.42px] relative text-left whitespace-nowrap z-[45]">
                    Search book
                  </span>
                </div>
                <div className='flex w-full gap-[12px] items-center shrink-0 flex-nowrap relative z-[46]'>
                  <div
                    onClick={() => setLoanStatusFilter('ALL')}
                    className={`flex w-[51px] h-[40px] pt-[8px] pr-[16px] pb-[8px] pl-[16px] gap-[8px] justify-center items-center shrink-0 flex-nowrap rounded-[100px] border-solid border relative z-[47] cursor-pointer transition-all ${
                      loanStatusFilter === 'ALL'
                        ? 'bg-[#f6f9fe] border-[#1c65da]'
                        : 'border-[#d5d7da] hover:border-[#1c65da]'
                    }`}
                  >
                    <span
                      className={`h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] leading-[30px] tracking-[-0.32px] relative text-left whitespace-nowrap z-[48] ${
                        loanStatusFilter === 'ALL'
                          ? 'font-bold text-[#1c65da]'
                          : 'font-semibold text-[#0a0d12]'
                      }`}
                    >
                      All ({loanCounts.ALL})
                    </span>
                  </div>
                  <div
                    onClick={() => setLoanStatusFilter('BORROWED')}
                    className={`flex w-[77px] h-[40px] pt-[8px] pr-[16px] pb-[8px] pl-[16px] gap-[8px] justify-center items-center shrink-0 flex-nowrap rounded-[100px] border-solid border relative z-[49] cursor-pointer transition-all ${
                      loanStatusFilter === 'BORROWED'
                        ? 'bg-[#f6f9fe] border-[#1c65da]'
                        : 'border-[#d5d7da] hover:border-[#1c65da]'
                    }`}
                  >
                    <span
                      className={`h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] leading-[30px] tracking-[-0.32px] relative text-left whitespace-nowrap z-50 ${
                        loanStatusFilter === 'BORROWED'
                          ? 'font-bold text-[#1c65da]'
                          : 'font-semibold text-[#0a0d12]'
                      }`}
                    >
                      Active ({loanCounts.BORROWED})
                    </span>
                  </div>
                  <div
                    onClick={() => setLoanStatusFilter('RETURNED')}
                    className={`flex w-[101px] h-[40px] pt-[8px] pr-[16px] pb-[8px] pl-[16px] gap-[8px] justify-center items-center shrink-0 flex-nowrap rounded-[100px] border-solid border relative z-[51] cursor-pointer transition-all ${
                      loanStatusFilter === 'RETURNED'
                        ? 'bg-[#f6f9fe] border-[#1c65da]'
                        : 'border-[#d5d7da] hover:border-[#1c65da]'
                    }`}
                  >
                    <span
                      className={`h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] leading-[30px] tracking-[-0.32px] relative text-left whitespace-nowrap z-[52] ${
                        loanStatusFilter === 'RETURNED'
                          ? 'font-bold text-[#1c65da]'
                          : 'font-semibold text-[#0a0d12]'
                      }`}
                    >
                      Returned ({loanCounts.RETURNED})
                    </span>
                  </div>
                  <div
                    onClick={() => setLoanStatusFilter('OVERDUE')}
                    className={`flex w-[96px] h-[40px] pt-[8px] pr-[16px] pb-[8px] pl-[16px] gap-[8px] justify-center items-center shrink-0 flex-nowrap rounded-[100px] border-solid border relative z-[53] cursor-pointer transition-all ${
                      loanStatusFilter === 'OVERDUE'
                        ? 'bg-[#f6f9fe] border-[#1c65da]'
                        : 'border-[#d5d7da] hover:border-[#1c65da]'
                    }`}
                  >
                    <span
                      className={`h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] leading-[30px] tracking-[-0.32px] relative text-left whitespace-nowrap z-[54] ${
                        loanStatusFilter === 'OVERDUE'
                          ? 'font-bold text-[#1c65da]'
                          : 'font-semibold text-[#0a0d12]'
                      }`}
                    >
                      Overdue ({loanCounts.OVERDUE})
                    </span>
                  </div>
                </div>
                <div className='flex flex-col gap-[16px] justify-center items-center self-stretch shrink-0 flex-nowrap relative z-[55]'>
                  {loansLoading ? (
                    <div className='flex flex-col gap-[16px] justify-center items-center self-stretch'>
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div
                          key={`loan-skeleton-${i}`}
                          className='flex pt-[20px] pr-[20px] pb-[20px] pl-[20px] flex-col gap-[20px] items-start self-stretch shrink-0 flex-nowrap bg-[#fff] rounded-[16px] relative shadow-[0_0_20px_0_rgba(202,201,201,0.25)] animate-pulse'
                        >
                          <div className='flex justify-between items-start self-stretch'>
                            <div className='flex gap-[12px] items-center'>
                              <div className='h-[30px] w-[60px] bg-[#eef2ff] rounded' />
                              <div className='h-[32px] w-[80px] bg-[#eef2ff] rounded' />
                            </div>
                            <div className='flex gap-[12px] items-center'>
                              <div className='h-[30px] w-[80px] bg-[#eef2ff] rounded' />
                              <div className='h-[32px] w-[120px] bg-[#eef2ff] rounded' />
                            </div>
                          </div>
                          <div className='h-px w-full bg-[#eef2ff]' />
                          <div className='flex justify-between items-center self-stretch'>
                            <div className='flex gap-[16px] items-center'>
                              <div className='w-[92px] h-[138px] bg-[#eef2ff] rounded' />
                              <div className='flex flex-col gap-[8px]'>
                                <div className='h-[28px] w-[78px] bg-[#eef2ff] rounded' />
                                <div className='h-[34px] w-[160px] bg-[#eef2ff] rounded' />
                                <div className='h-[30px] w-[120px] bg-[#eef2ff] rounded' />
                              </div>
                            </div>
                            <div className='h-[40px] w-[120px] bg-[#eef2ff] rounded-[100px]' />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : loans.length > 0 ? (
                    <>
                      {loans.map((loan) => (
                        <LoanCard key={loan.id} loan={loan} />
                      ))}
                      {loansData?.pagination &&
                        loansData.pagination.totalPages > 1 && (
                          <div className='flex w-[200px] h-[48px] pt-[8px] pr-[8px] pb-[8px] pl-[8px] gap-[8px] justify-center items-center shrink-0 flex-nowrap rounded-[100px] border-solid border border-[#d5d7da] relative z-[131]'>
                            <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-bold leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap z-[132]">
                              Load More
                            </span>
                          </div>
                        )}
                    </>
                  ) : (
                    <div className='flex flex-col justify-center items-center py-8 gap-2'>
                      <div className='w-[64px] h-[64px] bg-[url(/images/empty-loans.png)] bg-contain bg-no-repeat mb-4' />
                      <span className="font-['Quicksand'] text-[16px] text-[#414651] text-center">
                        {loanStatusFilter === 'ALL'
                          ? 'No loans found.'
                          : `No ${loanStatusFilter.toLowerCase()} loans found.`}
                      </span>
                      {loanStatusFilter === 'BORROWED' && (
                        <span className="font-['Quicksand'] text-[14px] text-[#535861] text-center">
                          You don&apos;t have any active loans at the moment.
                        </span>
                      )}
                      <span className="font-['Quicksand'] text-[12px] text-[#8b949e] text-center mt-2">
                        Start borrowing books from our library to see them here!
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'Reviews' && (
              <>
                <span className='h-[38px] self-stretch shrink-0 basis-auto font-quicksand text-[28px] font-bold leading-[38px] text-[#0a0d12] tracking-[-0.84px] relative text-left whitespace-nowrap'>
                  Reviews
                </span>
                <div className='flex flex-col gap-[16px] justify-center items-center self-stretch shrink-0 flex-nowrap relative'>
                  {reviewsLoading ? (
                    <div className='flex flex-col gap-[16px] justify-center items-center self-stretch'>
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div
                          key={`review-skeleton-${i}`}
                          className='flex pt-[20px] pr-[20px] pb-[20px] pl-[20px] flex-col gap-[16px] items-start self-stretch shrink-0 flex-nowrap bg-[#fff] rounded-[16px] relative shadow-[0_0_20px_0_rgba(202,201,201,0.25)] animate-pulse'
                        >
                          <div className='flex gap-[16px] items-start self-stretch'>
                            <div className='w-[80px] h-[120px] bg-[#eef2ff] rounded' />
                            <div className='flex flex-col gap-[8px] grow'>
                              <div className='flex gap-[4px]'>
                                {Array.from({ length: 5 }).map((_, j) => (
                                  <div
                                    key={j}
                                    className='w-[20px] h-[20px] bg-[#eef2ff] rounded'
                                  />
                                ))}
                              </div>
                              <div className='h-[32px] w-[200px] bg-[#eef2ff] rounded' />
                              <div className='h-[24px] w-[150px] bg-[#eef2ff] rounded' />
                              <div className='h-[24px] w-[300px] bg-[#eef2ff] rounded' />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : reviews.length > 0 ? (
                    <>
                      {reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                      {reviewsData?.pagination &&
                        reviewsData.pagination.totalPages > 1 && (
                          <div className='flex w-[200px] h-[48px] pt-[8px] pr-[8px] pb-[8px] pl-[8px] gap-[8px] justify-center items-center shrink-0 flex-nowrap rounded-[100px] border-solid border border-[#d5d7da] relative'>
                            <span className="h-[30px] shrink-0 basis-auto font-['Quicksand'] text-[16px] font-bold leading-[30px] text-[#0a0d12] tracking-[-0.32px] relative text-left whitespace-nowrap">
                              Load More
                            </span>
                          </div>
                        )}
                    </>
                  ) : (
                    <div className='flex flex-col justify-center items-center py-8 gap-2'>
                      <div className='w-[64px] h-[64px] bg-[url(/images/empty-reviews.png)] bg-contain bg-no-repeat mb-4' />
                      <span className="font-['Quicksand'] text-[16px] text-[#414651] text-center">
                        No reviews found.
                      </span>
                      <span className="font-['Quicksand'] text-[12px] text-[#8b949e] text-center mt-2">
                        Start reviewing books you&apos;ve read to see them here!
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Main Content - 393px */}
      <div className='sm:hidden w-[393px] mx-auto px-4 py-6'>
        {/* Navigation Tabs */}
        <div className='flex w-full h-[48px] pt-[6px] pr-[6px] pb-[6px] pl-[6px] gap-[6px] items-center shrink-0 flex-nowrap bg-[#f4f4f4] rounded-[12px] relative mb-6'>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 h-[36px] pt-[6px] pr-[8px] pb-[6px] pl-[8px] gap-[6px] justify-center items-center shrink-0 flex-nowrap rounded-[8px] relative cursor-pointer transition-all ${
                activeTab === tab.id
                  ? 'bg-[#fff] shadow-[0_0_15px_0_rgba(202,201,201,0.25)] z-[1]'
                  : 'z-[3]'
              }`}
            >
              <span
                className={`h-[24px] shrink-0 basis-auto font-quicksand text-[14px] leading-[24px] tracking-[-0.28px] relative text-center whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'font-bold text-[#0a0d12] z-[2]'
                    : 'font-medium text-[#535861] z-[4]'
                }`}
              >
                {tab.label}
              </span>
            </div>
          ))}
        </div>

        {/* Content Section */}
        <div className='flex flex-col gap-[20px] items-start self-stretch shrink-0 flex-nowrap relative z-[7]'>
          {activeTab === 'Profile' && (
            <>
              {/* Section Title */}
              <span className='h-[32px] self-stretch shrink-0 basis-auto font-quicksand text-[24px] font-bold leading-[32px] text-[#0a0d12] tracking-[-0.72px] relative text-left whitespace-nowrap z-[8]'>
                Profile
              </span>

              {/* Profile Card */}
              <Card className='flex pt-[16px] pr-[16px] pb-[16px] pl-[16px] flex-col gap-[20px] items-start self-stretch shrink-0 flex-nowrap bg-[#fff] rounded-[12px] relative shadow-[0_0_15px_0_rgba(202,201,201,0.25)] z-[9] w-full'>
                <CardContent className='p-0 w-full'>
                  <div className='flex flex-col gap-[16px] items-start self-stretch shrink-0 flex-nowrap relative z-10'>
                    {/* Profile Picture */}
                    <div className='w-[56px] h-[56px] shrink-0 relative z-[11]'>
                      <Image
                        src='/images/foto-profile.png'
                        alt='Profile'
                        width={56}
                        height={56}
                        className='w-full h-full object-cover rounded-[50%]'
                      />
                    </div>

                    {/* User Information */}
                    <div className='flex flex-col gap-[12px] self-stretch shrink-0 flex-nowrap relative z-[12]'>
                      <div className='flex justify-between items-center self-stretch shrink-0 flex-nowrap relative z-[13]'>
                        <span className='h-[24px] shrink-0 basis-auto font-quicksand text-[14px] font-medium leading-[24px] text-[#0a0d12] tracking-[-0.42px] relative text-left whitespace-nowrap z-[14]'>
                          Name
                        </span>
                        <span className='h-[24px] shrink-0 basis-auto font-quicksand text-[14px] font-bold leading-[24px] text-[#0a0d12] tracking-[-0.28px] relative text-left whitespace-nowrap z-[15]'>
                          {user?.name || 'Johndoe'}
                        </span>
                      </div>

                      <div className='flex justify-between items-center self-stretch shrink-0 flex-nowrap relative z-[16]'>
                        <span className='h-[24px] shrink-0 basis-auto font-quicksand text-[14px] font-medium leading-[24px] text-[#0a0d12] tracking-[-0.42px] relative text-left whitespace-nowrap z-[17]'>
                          Email
                        </span>
                        <span className='h-[24px] shrink-0 basis-auto font-quicksand text-[14px] font-bold leading-[24px] text-[#0a0d12] tracking-[-0.28px] relative text-left whitespace-nowrap z-[18]'>
                          {user?.email || 'johndoe@email.com'}
                        </span>
                      </div>

                      <div className='flex justify-between items-center self-stretch shrink-0 flex-nowrap relative z-[19]'>
                        <span className='h-[24px] shrink-0 basis-auto font-quicksand text-[14px] font-medium leading-[24px] text-[#0a0d12] tracking-[-0.42px] relative text-left whitespace-nowrap z-20'>
                          Nomor Handphone
                        </span>
                        <span className='h-[24px] shrink-0 basis-auto font-quicksand text-[14px] font-bold leading-[24px] text-[#0a0d12] tracking-[-0.28px] relative text-left whitespace-nowrap z-[21]'>
                          081234567890
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Update Profile Button */}
                  <Button className='flex h-[40px] pt-[8px] pr-[8px] pb-[8px] pl-[8px] gap-[8px] justify-center items-center self-stretch shrink-0 flex-nowrap bg-[#1c65da] hover:bg-[#1557c4] rounded-[100px] relative z-[22] w-full'>
                    <span className='h-[24px] shrink-0 basis-auto font-quicksand text-[14px] font-bold leading-[24px] text-[#fdfdfd] tracking-[-0.28px] relative text-left whitespace-nowrap z-[23]'>
                      Update Profile
                    </span>
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'Borrowed List' && (
            <>
              <span className='h-[32px] self-stretch shrink-0 basis-auto font-quicksand text-[24px] font-bold leading-[32px] text-[#0a0d12] tracking-[-0.72px] relative text-left whitespace-nowrap'>
                Borrowed List
              </span>
              <div className='flex w-full h-[40px] pt-[8px] pr-[16px] pb-[8px] pl-[16px] gap-[6px] items-center shrink-0 flex-nowrap bg-[#fff] rounded-full border-solid border border-[#d5d7da]'>
                <div className='w-[20px] h-[20px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-22/LSOKwMdUcH.png)] bg-cover bg-no-repeat relative overflow-hidden' />
                <span className="h-[24px] shrink-0 basis-auto font-['Quicksand'] text-[12px] font-medium leading-[24px] text-[#535861] tracking-[-0.36px]">
                  Search book
                </span>
              </div>
              <div className='flex w-full gap-[8px] items-center'>
                <div
                  onClick={() => setLoanStatusFilter('ALL')}
                  className={`flex px-[16px] h-[36px] gap-[8px] justify-center items-center rounded-[100px] border cursor-pointer transition-all ${
                    loanStatusFilter === 'ALL'
                      ? 'bg-[#f6f9fe] border-[#1c65da]'
                      : 'border-[#d5d7da] hover:border-[#1c65da]'
                  }`}
                >
                  <span
                    className={`h-[24px] font-['Quicksand'] text-[14px] leading-[24px] ${
                      loanStatusFilter === 'ALL'
                        ? 'font-bold text-[#1c65da]'
                        : 'font-semibold text-[#0a0d12]'
                    }`}
                  >
                    All ({loanCounts.ALL})
                  </span>
                </div>
                <div
                  onClick={() => setLoanStatusFilter('BORROWED')}
                  className={`flex px-[16px] h-[36px] gap-[8px] justify-center items-center rounded-[100px] border cursor-pointer transition-all ${
                    loanStatusFilter === 'BORROWED'
                      ? 'bg-[#f6f9fe] border-[#1c65da]'
                      : 'border-[#d5d7da] hover:border-[#1c65da]'
                  }`}
                >
                  <span
                    className={`h-[24px] font-['Quicksand'] text-[14px] leading-[24px] ${
                      loanStatusFilter === 'BORROWED'
                        ? 'font-bold text-[#1c65da]'
                        : 'font-semibold text-[#0a0d12]'
                    }`}
                  >
                    Active ({loanCounts.BORROWED})
                  </span>
                </div>
                <div
                  onClick={() => setLoanStatusFilter('RETURNED')}
                  className={`flex px-[16px] h-[36px] gap-[8px] justify-center items-center rounded-[100px] border cursor-pointer transition-all ${
                    loanStatusFilter === 'RETURNED'
                      ? 'bg-[#f6f9fe] border-[#1c65da]'
                      : 'border-[#d5d7da] hover:border-[#1c65da]'
                  }`}
                >
                  <span
                    className={`h-[24px] font-['Quicksand'] text-[14px] leading-[24px] ${
                      loanStatusFilter === 'RETURNED'
                        ? 'font-bold text-[#1c65da]'
                        : 'font-semibold text-[#0a0d12]'
                    }`}
                  >
                    Returned ({loanCounts.RETURNED})
                  </span>
                </div>
                <div
                  onClick={() => setLoanStatusFilter('OVERDUE')}
                  className={`flex px-[16px] h-[36px] gap-[8px] justify-center items-center rounded-[100px] border cursor-pointer transition-all ${
                    loanStatusFilter === 'OVERDUE'
                      ? 'bg-[#f6f9fe] border-[#1c65da]'
                      : 'border-[#d5d7da] hover:border-[#1c65da]'
                  }`}
                >
                  <span
                    className={`h-[24px] font-['Quicksand'] text-[14px] leading-[24px] ${
                      loanStatusFilter === 'OVERDUE'
                        ? 'font-bold text-[#1c65da]'
                        : 'font-semibold text-[#0a0d12]'
                    }`}
                  >
                    Overdue ({loanCounts.OVERDUE})
                  </span>
                </div>
              </div>

              {loansLoading ? (
                <div className='flex flex-col gap-[16px] w-full'>
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={`mobile-loan-skeleton-${i}`}
                      className='flex flex-col gap-[16px] w-full bg-[#fff] rounded-[12px] shadow-[0_0_15px_0_rgba(202,201,201,0.25)] p-[16px] animate-pulse'
                    >
                      <div className='flex justify-between items-start w-full'>
                        <div className='flex gap-[12px] items-center'>
                          <div className='h-[24px] w-[60px] bg-[#eef2ff] rounded' />
                          <div className='h-[28px] w-[80px] bg-[#eef2ff] rounded' />
                        </div>
                        <div className='flex gap-[12px] items-center'>
                          <div className='h-[24px] w-[80px] bg-[#eef2ff] rounded' />
                          <div className='h-[28px] w-[120px] bg-[#eef2ff] rounded' />
                        </div>
                      </div>
                      <div className='h-px w-full bg-[#eef2ff]' />
                      <div className='flex flex-col gap-[12px] w-full'>
                        <div className='flex gap-[12px] items-center'>
                          <div className='w-[72px] h-[108px] bg-[#eef2ff] rounded' />
                          <div className='flex flex-col gap-[4px]'>
                            <div className='h-[24px] w-[78px] bg-[#eef2ff] rounded' />
                            <div className='h-[24px] w-[120px] bg-[#eef2ff] rounded' />
                            <div className='h-[20px] w-[100px] bg-[#eef2ff] rounded' />
                          </div>
                        </div>
                        <div className='h-[36px] w-full bg-[#eef2ff] rounded-[100px]' />
                      </div>
                    </div>
                  ))}
                </div>
              ) : loans.length > 0 ? (
                <>
                  {loans.map((loan) => (
                    <LoanCard key={loan.id} loan={loan} isMobile={true} />
                  ))}
                  {loansData?.pagination &&
                    loansData.pagination.totalPages > 1 && (
                      <div className='flex w-full h-[44px] px-[8px] justify-center items-center rounded-[100px] border border-[#d5d7da]'>
                        <span className="font-['Quicksand'] text-[14px] font-bold leading-[24px] text-[#0a0d12]">
                          Load More
                        </span>
                      </div>
                    )}
                </>
              ) : (
                <div className='flex flex-col justify-center items-center py-8 gap-2'>
                  <div className='w-[48px] h-[48px] bg-[url(/images/empty-loans.png)] bg-contain bg-no-repeat mb-4' />
                  <span className="font-['Quicksand'] text-[16px] text-[#414651] text-center">
                    {loanStatusFilter === 'ALL'
                      ? 'No loans found.'
                      : `No ${loanStatusFilter.toLowerCase()} loans found.`}
                  </span>
                  {loanStatusFilter === 'BORROWED' && (
                    <span className="font-['Quicksand'] text-[14px] text-[#535861] text-center">
                      You don&apos;t have any active loans at the moment.
                    </span>
                  )}
                  <span className="font-['Quicksand'] text-[12px] text-[#8b949e] text-center mt-2">
                    Start borrowing books from our library to see them here!
                  </span>
                </div>
              )}
            </>
          )}

          {activeTab === 'Reviews' && (
            <>
              <span className='h-[32px] self-stretch shrink-0 basis-auto font-quicksand text-[24px] font-bold leading-[32px] text-[#0a0d12] tracking-[-0.72px] relative text-left whitespace-nowrap'>
                Reviews
              </span>
              {reviewsLoading ? (
                <div className='flex flex-col gap-[16px] w-full'>
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={`mobile-review-skeleton-${i}`}
                      className='flex flex-col gap-[16px] w-full bg-[#fff] rounded-[12px] shadow-[0_0_15px_0_rgba(202,201,201,0.25)] p-[16px] animate-pulse'
                    >
                      <div className='flex gap-[12px] items-start'>
                        <div className='w-[60px] h-[90px] bg-[#eef2ff] rounded' />
                        <div className='flex flex-col gap-[8px] flex-1'>
                          <div className='flex gap-[8px]'>
                            {Array.from({ length: 5 }).map((_, j) => (
                              <div
                                key={j}
                                className='w-[20px] h-[20px] bg-[#eef2ff] rounded'
                              />
                            ))}
                          </div>
                          <div className='h-[24px] w-[150px] bg-[#eef2ff] rounded' />
                          <div className='h-[20px] w-[120px] bg-[#eef2ff] rounded' />
                          <div className='h-[20px] w-[200px] bg-[#eef2ff] rounded' />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <>
                  {reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      isMobile={true}
                    />
                  ))}
                  {reviewsData?.pagination &&
                    reviewsData.pagination.totalPages > 1 && (
                      <div className='flex w-full h-[44px] px-[8px] justify-center items-center rounded-[100px] border border-[#d5d7da]'>
                        <span className="font-['Quicksand'] text-[14px] font-bold leading-[24px] text-[#0a0d12]">
                          Load More
                        </span>
                      </div>
                    )}
                </>
              ) : (
                <div className='flex flex-col justify-center items-center py-8 gap-2'>
                  <div className='w-[48px] h-[48px] bg-[url(/images/empty-reviews.png)] bg-contain bg-no-repeat mb-4' />
                  <span className="font-['Quicksand'] text-[16px] text-[#414651] text-center">
                    No reviews found.
                  </span>
                  <span className="font-['Quicksand'] text-[12px] text-[#8b949e] text-center mt-2">
                    Start reviewing books you&apos;ve read to see them here!
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedBookForReview && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={handleCloseReviewModal}
          bookId={selectedBookForReview.id}
          bookTitle={selectedBookForReview.title}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
