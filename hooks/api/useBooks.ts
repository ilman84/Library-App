import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksApi } from '../../lib/api/books';
import { CreateBookRequest, UpdateBookRequest } from '../../lib/api/config';
import { toast } from 'sonner';

// Query Keys
export const bookQueryKeys = {
  all: ['books'] as const,
  lists: () => [...bookQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...bookQueryKeys.lists(), { filters }] as const,
  details: () => [...bookQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...bookQueryKeys.details(), id] as const,
  byCategory: (categoryId: number, filters?: Record<string, unknown>) =>
    [...bookQueryKeys.all, 'category', categoryId, { filters }] as const,
  byAuthor: (authorId: number, filters?: Record<string, unknown>) =>
    [...bookQueryKeys.all, 'author', authorId, { filters }] as const,
  search: (query: string, filters?: Record<string, unknown>) =>
    [...bookQueryKeys.all, 'search', query, { filters }] as const,
};

// Get all books
export const useBooks = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  authorId?: number;
}) => {
  return useQuery({
    queryKey: bookQueryKeys.list(params || {}),
    queryFn: () => booksApi.getAll(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get book by ID
export const useBook = (id: number) => {
  return useQuery({
    queryKey: bookQueryKeys.detail(id),
    queryFn: () => booksApi.getById(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get books by category
export const useBooksByCategory = (
  categoryId: number,
  params?: { page?: number; limit?: number; rating?: number }
) => {
  return useQuery({
    queryKey: bookQueryKeys.byCategory(categoryId, params),
    queryFn: () => booksApi.getByCategory(categoryId, params),
    enabled: !!categoryId && categoryId > 0,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get books by author
export const useBooksByAuthor = (
  authorId: number,
  params?: { page?: number; limit?: number }
) => {
  return useQuery({
    queryKey: bookQueryKeys.byAuthor(authorId, params),
    queryFn: () => booksApi.getByAuthor(authorId, params),
    enabled: !!authorId && authorId > 0,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Search books
export const useSearchBooks = (
  query: string,
  params?: { page?: number; limit?: number }
) => {
  return useQuery({
    queryKey: bookQueryKeys.search(query, params),
    queryFn: () => booksApi.search(query, params),
    enabled: !!query && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000,
  });
};

// Create book mutation
export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookRequest) => booksApi.create(data),
    onSuccess: (response) => {
      // Invalidate and refetch books
      queryClient.invalidateQueries({ queryKey: bookQueryKeys.lists() });

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

// Update book mutation
export const useUpdateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBookRequest }) =>
      booksApi.update(id, data),
    onSuccess: (response, { id }) => {
      // Invalidate and refetch books
      queryClient.invalidateQueries({ queryKey: bookQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookQueryKeys.detail(id) });

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

// Delete book mutation
export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => booksApi.delete(id),
    onSuccess: (response, id) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: bookQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bookQueryKeys.lists() });

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
