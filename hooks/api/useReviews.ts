import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '../../lib/api/reviews';
import { CreateReviewRequest } from '../../lib/api/reviews';
import { toast } from 'sonner';

// Query Keys
export const reviewQueryKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewQueryKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...reviewQueryKeys.lists(), params] as const,
  details: () => [...reviewQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...reviewQueryKeys.details(), id] as const,
  bookReviews: (bookId: number) =>
    [...reviewQueryKeys.all, 'book', bookId] as const,
  myReviews: (page?: number, limit?: number) =>
    [...reviewQueryKeys.all, 'my', { page, limit }] as const,
};

// Hooks
export function useReviews(params?: {
  page?: number;
  limit?: number;
  bookId?: number;
}) {
  return useQuery({
    queryKey: reviewQueryKeys.list(params || {}),
    queryFn: () => reviewsApi.getAll(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useReview(id: number) {
  return useQuery({
    queryKey: reviewQueryKeys.detail(id),
    queryFn: () => reviewsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useBookReviews(
  bookId: number,
  params?: { page?: number; limit?: number }
) {
  return useQuery({
    queryKey: reviewQueryKeys.bookReviews(bookId),
    queryFn: () => reviewsApi.getBookReviews(bookId, params),
    enabled: !!bookId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useMyReviews(
  page = 1,
  limit = 20,
  options: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: reviewQueryKeys.myReviews(page, limit),
    queryFn: () => reviewsApi.getMyReviews({ page, limit }),
    enabled: options.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewRequest) => reviewsApi.create(data),
    onSuccess: (response, variables) => {
      console.log('Review created successfully, invalidating caches...');
      // Invalidate and refetch reviews data
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: reviewQueryKeys.bookReviews(variables.bookId),
      });
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.myReviews() });
      // Also invalidate me query keys for profile page
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'reviews'] });
      console.log('Cache invalidation completed');
      toast.success('Review submitted successfully!');
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to submit review';
      toast.error(message);
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateReviewRequest>;
    }) => reviewsApi.update(id, data),
    onSuccess: (response, variables) => {
      // Invalidate and refetch reviews data
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: reviewQueryKeys.detail(variables.id),
      });
      toast.success('Review updated successfully!');
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to update review';
      toast.error(message);
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => reviewsApi.delete(id),
    onSuccess: () => {
      // Invalidate and refetch reviews data
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.all });
      toast.success('Review deleted successfully!');
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to delete review';
      toast.error(message);
    },
  });
}

// Type exports for convenience
export type {
  Review,
  CreateReviewRequest,
  CreateReviewResponse,
  ReviewsResponse,
} from '../../lib/api/reviews';
