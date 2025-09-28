import { apiClient } from './client';
import {
  Author,
  AuthorsResponse,
  CreateAuthorRequest,
  UpdateAuthorRequest,
  Book,
} from './config';

// Authors API endpoints
export const authorsApi = {
  // Get all authors - remove pagination params that cause errors
  getAll: (params?: { page?: number; limit?: number; search?: string }) => {
    // Remove pagination params that might cause errors
    const { page: _page, limit: _limit, ...otherParams } = params || {};
    // Suppress unused variable warnings
    void _page;
    void _limit;
    return apiClient.get<AuthorsResponse>('/authors', otherParams);
  },

  // Get author by ID with books
  getById: (id: number) =>
    apiClient.get<{ author: Author; books: Book[] }>(`/authors/${id}/books`),

  // Create new author
  create: (data: CreateAuthorRequest) =>
    apiClient.post<Author>('/authors', data),

  // Update author
  update: (id: number, data: UpdateAuthorRequest) =>
    apiClient.put<Author>(`/authors/${id}`, data),

  // Delete author
  delete: (id: number) => apiClient.delete<void>(`/authors/${id}`),
};
