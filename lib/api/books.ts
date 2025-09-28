import { apiClient } from './client';
import {
  Book,
  BooksResponse,
  CreateBookRequest,
  UpdateBookRequest,
  Author,
} from './config';

// Books API endpoints
export const booksApi = {
  // Get all books
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
    authorId?: number;
    rating?: number;
  }) => apiClient.get<BooksResponse>('/books', params),

  // Get book by ID
  getById: (id: number) => apiClient.get<Book>(`/books/${id}`),

  // Create new book
  create: (data: CreateBookRequest) => apiClient.post<Book>('/books', data),

  // Update book
  update: (id: number, data: UpdateBookRequest) =>
    apiClient.put<Book>(`/books/${id}`, data),

  // Delete book
  delete: (id: number) => apiClient.delete<void>(`/books/${id}`),

  // Get books by category - fallback to getAll if server doesn't support categoryId
  getByCategory: (
    categoryId: number,
    params?: { page?: number; limit?: number; rating?: number }
  ) => {
    // Try the simpler approach first - just get all books
    // Client-side filtering will handle category filtering
    const queryParams: Record<string, unknown> = {};
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    // Don't send rating to server for now since it causes 500 error
    return apiClient.get<BooksResponse>('/books', queryParams);
  },

  // Get books by author
  getByAuthor: (authorId: number, params?: { page?: number; limit?: number }) =>
    apiClient.get<{ author: Author; books: Book[] }>(
      `/authors/${authorId}/books`,
      params
    ),

  // Search books
  search: (query: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<BooksResponse>('/books/search', { ...params, q: query }),

  // Get book recommendations
  getRecommendations: (params?: {
    by?: 'popular' | 'rating';
    limit?: number;
  }) =>
    apiClient.get<{ mode: string; books: Book[] }>('/books/recommend', params),
};
