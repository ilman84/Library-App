import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { meApi } from '../../lib/api/me';
import { reviewsApi } from '../../lib/api/reviews';
import { toast } from 'sonner';

// Query Keys
export const meQueryKeys = {
  all: ['me'] as const,
  profile: () => [...meQueryKeys.all, 'profile'] as const,
  loans: (page?: number, limit?: number) =>
    [...meQueryKeys.all, 'loans', { page, limit }] as const,
  reviews: (page?: number, limit?: number) =>
    [...meQueryKeys.all, 'reviews', { page, limit }] as const,
};

// Hooks
export function useMe() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return useQuery({
    queryKey: meQueryKeys.profile(),
    queryFn: async () => {
      try {
        console.log('🔄 Fetching user profile...');
        const response = await meApi.getProfile();
        console.log('✅ User profile fetched successfully:', response);
        return response.data;
      } catch (error) {
        console.error('❌ Error fetching user profile:', error);
        // Don't show toast for unauthorized errors on checkout page
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled:
      isClient &&
      typeof window !== 'undefined' &&
      !!localStorage.getItem('token'), // Only run on client with token
    retry: (failureCount, error) => {
      console.log(`🔄 Retry attempt ${failureCount} for user profile:`, error);
      // Don't retry on 401 errors (unauthorized) or user not found
      if (
        error instanceof Error &&
        (error.message.includes('401') ||
          error.message.includes('User not found'))
      ) {
        console.log('❌ Not retrying due to authentication error');
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useMyLoans(
  page = 1,
  limit = 20,
  options: { enabled?: boolean } = {}
) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return useQuery({
    queryKey: meQueryKeys.loans(page, limit),
    queryFn: async () => {
      try {
        const response = await meApi.getMyLoans(page, limit);
        return response.data;
      } catch (error) {
        // Don't show toast for 401 errors to avoid spam
        if (error instanceof Error && error.message.includes('401')) {
          console.warn('Unauthorized access to loans API');
          throw error;
        }
        const message =
          error instanceof Error ? error.message : 'Failed to fetch loans';
        toast.error(message);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: isClient && options.enabled !== false,
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useMyReviews(
  page = 1,
  limit = 20,
  options: { enabled?: boolean } = {}
) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return useQuery({
    queryKey: meQueryKeys.reviews(page, limit),
    queryFn: async () => {
      try {
        const response = await reviewsApi.getMyReviews({ page, limit });
        return response.data;
      } catch (error) {
        // Don't show toast for 401 errors to avoid spam
        if (error instanceof Error && error.message.includes('401')) {
          console.warn('Unauthorized access to reviews API');
          throw error;
        }
        const message =
          error instanceof Error ? error.message : 'Failed to fetch reviews';
        toast.error(message);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: isClient && options.enabled !== false,
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: meApi.updateProfile,
    onSuccess: () => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: meQueryKeys.all });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(message);
    },
  });
}

// Type exports for convenience
export type {
  MeResponse,
  UserProfile,
  LoanStats,
  UpdateProfileRequest,
  UpdateProfileResponse,
  MyLoansResponse,
  MyReviewsResponse,
} from '../../lib/api/config';
