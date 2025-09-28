import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/api/admin';
import {
  AdminCreateLoanRequest,
  AdminUpdateLoanRequest,
  Book,
} from '../../lib/api/config';
import { toast } from 'sonner';

// Admin Query Keys
export const adminQueryKeys = {
  all: ['admin'] as const,

  // Loans
  loans: () => [...adminQueryKeys.all, 'loans'] as const,
  loansList: (filters: Record<string, unknown>) =>
    [...adminQueryKeys.loans(), 'list', { filters }] as const,
  loansDetail: (id: number) =>
    [...adminQueryKeys.loans(), 'detail', id] as const,

  // Categories
  categories: () => [...adminQueryKeys.all, 'categories'] as const,
  categoriesList: (filters: Record<string, unknown>) =>
    [...adminQueryKeys.categories(), 'list', { filters }] as const,

  // Books
  books: () => [...adminQueryKeys.all, 'books'] as const,
  booksList: (filters: Record<string, unknown>) =>
    [...adminQueryKeys.books(), 'list', { filters }] as const,
  booksDetail: (id: number) =>
    [...adminQueryKeys.books(), 'detail', id] as const,

  // Users
  users: () => [...adminQueryKeys.all, 'users'] as const,
  usersList: (filters: Record<string, unknown>) =>
    [...adminQueryKeys.users(), 'list', { filters }] as const,
  usersDetail: (id: number) =>
    [...adminQueryKeys.users(), 'detail', id] as const,

  // Dashboard
  dashboard: () => [...adminQueryKeys.all, 'dashboard'] as const,
  overview: () => [...adminQueryKeys.all, 'overview'] as const,
  reports: (filters: Record<string, unknown>) =>
    [...adminQueryKeys.all, 'reports', { filters }] as const,

  // Overdue
  overdue: (filters: Record<string, unknown>) =>
    [...adminQueryKeys.all, 'overdue', { filters }] as const,
};

// ========== ADMIN LOANS HOOKS ==========

// Get all loans (admin)
export const useAdminLoans = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: adminQueryKeys.loansList(params || {}),
    queryFn: () => adminApi.loans.getAll(),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Get loan by ID (admin)
export const useAdminLoan = (id: number) => {
  return useQuery({
    queryKey: adminQueryKeys.loansDetail(id),
    queryFn: () => adminApi.loans.getById(id),
    enabled: !!id && id > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Create loan for user (admin)
export const useAdminCreateLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdminCreateLoanRequest) => adminApi.loans.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.loans() });

      if (response.success) {
        toast.success('Loan created successfully');
      } else {
        toast.error(response.message || 'Failed to create loan');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create loan');
    },
  });
};

// Update loan (admin)
export const useAdminUpdateLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminUpdateLoanRequest }) =>
      adminApi.loans.update(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.loans() });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.loansDetail(id),
      });

      if (response.success) {
        toast.success('Loan updated successfully');
      } else {
        toast.error(response.message || 'Failed to update loan');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update loan');
    },
  });
};

// Delete loan (admin)
export const useAdminDeleteLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminApi.loans.delete(id),
    onSuccess: (response, id) => {
      queryClient.removeQueries({ queryKey: adminQueryKeys.loansDetail(id) });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.loans() });

      if (response.success) {
        toast.success('Loan deleted successfully');
      } else {
        toast.error(response.message || 'Failed to delete loan');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete loan');
    },
  });
};

// Force return loan (admin)
export const useAdminForceReturnLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminApi.loans.forceReturn(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.loans() });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.loansDetail(id),
      });

      if (response.success) {
        toast.success('Loan returned successfully');
      } else {
        toast.error(response.message || 'Failed to return loan');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to return loan');
    },
  });
};

// ========== ADMIN BOOKS HOOKS ==========

// Get all books (admin)
export const useAdminBooks = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
}) => {
  const queryKey = adminQueryKeys.booksList(params || {});
  console.log('useAdminBooks called with:', { params, queryKey });

  return useQuery({
    queryKey,
    queryFn: () => {
      console.log('useAdminBooks queryFn called with params:', params);
      return adminApi.books.getAll(params);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get book by ID (admin)
export const useAdminBook = (id: number) => {
  return useQuery({
    queryKey: adminQueryKeys.booksDetail(id),
    queryFn: () => adminApi.books.getById(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Create book (admin)
export const useAdminCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Book>) => adminApi.books.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.books() });

      if (response.success) {
        toast.success('Book created successfully');
      } else {
        toast.error(response.message || 'Failed to create book');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create book');
    },
  });
};

// Update book (admin)
export const useAdminUpdateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Book> }) =>
      adminApi.books.update(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.books() });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.booksDetail(id),
      });

      if (response.success) {
        toast.success('Book updated successfully');
      } else {
        toast.error(response.message || 'Failed to update book');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update book');
    },
  });
};

// Delete book (admin)
export const useAdminDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminApi.books.delete(id),
    onSuccess: (response, id) => {
      queryClient.removeQueries({ queryKey: adminQueryKeys.booksDetail(id) });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.books() });

      if (response.success) {
        toast.success('Book deleted successfully');
      } else {
        toast.error(response.message || 'Failed to delete book');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete book');
    },
  });
};

// ========== ADMIN DASHBOARD HOOKS ==========

// Get dashboard overview (main dashboard)
// === USERS HOOKS ===
export const useAdminUsers = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: adminQueryKeys.usersList({ page, limit }),
    queryFn: () => adminApi.users.getAll(),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAdminUser = (id: number) => {
  return useQuery({
    queryKey: adminQueryKeys.usersDetail(id),
    queryFn: () => adminApi.users.getById(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAdminDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminApi.users.delete(id),
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users() });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Failed to delete user');
    },
  });
};

// === DASHBOARD HOOKS ===
export const useAdminOverview = () => {
  return useQuery({
    queryKey: adminQueryKeys.overview(),
    queryFn: () => adminApi.dashboard.getOverview(),
    staleTime: 2 * 60 * 1000, // 2 minutes - dashboard data should be fresh
    gcTime: 5 * 60 * 1000,
  });
};

// Get dashboard stats (legacy)
export const useAdminDashboard = () => {
  return useQuery({
    queryKey: adminQueryKeys.dashboard(),
    queryFn: () => adminApi.dashboard.getStats(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get reports
export const useAdminReports = (params?: {
  startDate?: string;
  endDate?: string;
  type?: string;
}) => {
  return useQuery({
    queryKey: adminQueryKeys.reports(params || {}),
    queryFn: () => adminApi.dashboard.getReports(params),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// ========== ADMIN OVERDUE LOANS HOOKS ==========

// Get overdue loans (admin)
export const useAdminOverdueLoans = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: adminQueryKeys.overdue(params || {}),
    queryFn: () => adminApi.loans.getOverdue(params),
    staleTime: 1 * 60 * 1000, // 1 minute - shorter for overdue data
    gcTime: 3 * 60 * 1000, // 3 minutes
  });
};
