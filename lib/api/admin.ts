import { apiClient } from './client';
import {
  LoansResponse,
  AdminCreateLoanRequest,
  AdminUpdateLoanRequest,
  LoanResponse,
  OverdueLoansResponse,
  OverviewResponse,
  Category,
  CategoriesResponse,
  Book,
  BooksResponse,
  User,
  UsersResponse,
  DashboardStats,
  ReportData,
} from './config';

// Admin API endpoints
export const adminApi = {
  // Admin Loans (mock data for now since endpoint doesn't exist)
  loans: {
    // Get all loans (admin) - return empty array for now
    getAll: () =>
      Promise.resolve({
        success: true,
        data: { loans: [] },
        message: 'No loans endpoint available',
      } as LoansResponse),

    // Create loan for user (admin)
    create: (data: AdminCreateLoanRequest) =>
      apiClient.post<LoanResponse>('/admin/loans', data),

    // Get loan by ID (admin)
    getById: (id: number) => apiClient.get<LoanResponse>(`/admin/loans/${id}`),

    // Update loan (admin)
    update: (id: number, data: AdminUpdateLoanRequest) =>
      apiClient.patch<LoanResponse>(`/admin/loans/${id}`, data),

    // Delete loan (admin)
    delete: (id: number) => apiClient.delete<void>(`/admin/loans/${id}`),

    // Force return loan (admin)
    forceReturn: (id: number) =>
      apiClient.patch<LoanResponse>(`/admin/loans/${id}/return`),

    // Get overdue loans (admin)
    getOverdue: (params?: { page?: number; limit?: number }) =>
      apiClient.get<OverdueLoansResponse>('/admin/loans/overdue', params),
  },

  // Admin Categories (if different from regular)
  categories: {
    // Get all categories (admin)
    getAll: (params?: { page?: number; limit?: number; search?: string }) =>
      apiClient.get<CategoriesResponse>('/admin/categories', params),

    // Create category (admin)
    create: (data: { name: string }) =>
      apiClient.post<Category>('/admin/categories', data),

    // Update category (admin)
    update: (id: number, data: { name: string }) =>
      apiClient.put<Category>(`/admin/categories/${id}`, data),

    // Delete category (admin)
    delete: (id: number) => apiClient.delete<void>(`/admin/categories/${id}`),
  },

  // Admin Books (using regular books endpoint with admin auth)
  books: {
    // Get all books (admin) - remove pagination params that cause 400 error
    getAll: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      categoryId?: number;
    }) => {
      // Remove pagination params that cause "Invalid value" error
      const { page: _page, limit: _limit, ...otherParams } = params || {};
      // Suppress unused variable warnings
      void _page;
      void _limit;
      return apiClient.get<BooksResponse>('/books', otherParams);
    },

    // Get book by ID (admin)
    getById: (id: number) => apiClient.get<Book>(`/books/${id}`),

    // Create book (admin)
    create: (data: Partial<Book>) => apiClient.post<Book>('/books', data),

    // Update book (admin)
    update: (id: number, data: Partial<Book>) =>
      apiClient.put<Book>(`/books/${id}`, data),

    // Delete book (admin)
    delete: (id: number) => apiClient.delete<void>(`/books/${id}`),
  },

  // Admin Users (mock data for now since endpoint doesn't exist)
  users: {
    // Get all users (admin) - return empty array for now
    getAll: () =>
      Promise.resolve({
        success: true,
        data: { users: [] },
        message: 'No users endpoint available',
      } as UsersResponse),

    // Get user by ID (admin)
    getById: (id: number) => apiClient.get<User>(`/admin/users/${id}`),

    // Update user (admin)
    update: (id: number, data: Partial<User>) =>
      apiClient.put<User>(`/admin/users/${id}`, data),

    // Delete user (admin)
    delete: (id: number) => apiClient.delete<void>(`/admin/users/${id}`),
  },

  // Admin Dashboard/Stats
  dashboard: {
    // Get dashboard overview
    getOverview: () => apiClient.get<OverviewResponse>('/admin/overview'),

    // Get dashboard stats (legacy)
    getStats: () => apiClient.get<DashboardStats>('/admin/dashboard'),

    // Get reports
    getReports: (params?: {
      startDate?: string;
      endDate?: string;
      type?: string;
    }) => apiClient.get<ReportData>('/admin/reports', params),
  },
};
