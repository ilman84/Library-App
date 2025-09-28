import { apiClient } from './client';

// Review Types
export interface Review {
  id: number;
  star: number;
  comment: string;
  userId: number;
  bookId: number;
  createdAt: string;
}

export interface CreateReviewRequest {
  bookId: number;
  star: number;
  comment: string;
}

export interface CreateReviewResponse {
  review: Review;
  bookStats: {
    rating: number;
    reviewCount: number;
  };
}

export interface ReviewsResponse {
  bookId?: number;
  reviews: Review[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Reviews API endpoints
export const reviewsApi = {
  // Get all reviews
  getAll: (params?: { page?: number; limit?: number; bookId?: number }) =>
    apiClient.get<ReviewsResponse>('/reviews', params),

  // Get review by ID
  getById: (id: number) => apiClient.get<Review>(`/reviews/${id}`),

  // Create new review
  create: (data: CreateReviewRequest) =>
    apiClient.post<CreateReviewResponse>('/reviews', data),

  // Update review
  update: (id: number, data: Partial<CreateReviewRequest>) =>
    apiClient.put<Review>(`/reviews/${id}`, data),

  // Delete review
  delete: (id: number) =>
    apiClient.delete<{
      message: string;
      data: {
        bookStats: {
          rating: number;
          reviewCount: number;
        };
      };
    }>(`/reviews/${id}`),

  // Get reviews for a specific book
  getBookReviews: (
    bookId: number,
    params?: { page?: number; limit?: number }
  ) =>
    apiClient.get<{ data: ReviewsResponse }>(`/reviews/book/${bookId}`, params),

  // Get current user's reviews
  getMyReviews: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ReviewsResponse>('/me/reviews', params),
};
