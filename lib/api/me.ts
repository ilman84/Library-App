import { apiClient } from './client';
import {
  ApiResponse,
  MeResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  MyLoansResponse,
  MyReviewsResponse,
} from './config';

export const meApi = {
  // Get current user profile with stats
  async getProfile(): Promise<ApiResponse<MeResponse>> {
    return apiClient.get<MeResponse>('/me');
  },

  // Update current user profile
  async updateProfile(
    data: UpdateProfileRequest
  ): Promise<ApiResponse<UpdateProfileResponse>> {
    return apiClient.patch<UpdateProfileResponse>('/me', data);
  },

  // Get current user's loans with pagination
  async getMyLoans(
    page = 1,
    limit = 20
  ): Promise<ApiResponse<MyLoansResponse>> {
    return apiClient.get<MyLoansResponse>(
      `/me/loans?page=${page}&limit=${limit}`
    );
  },

  // Get current user's reviews with pagination
  async getMyReviews(
    page = 1,
    limit = 20
  ): Promise<ApiResponse<MyReviewsResponse>> {
    return apiClient.get<MyReviewsResponse>(
      `/me/reviews?page=${page}&limit=${limit}`
    );
  },
};
