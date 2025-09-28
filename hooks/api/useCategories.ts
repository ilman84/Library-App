import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../../lib/api/categories';
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../../lib/api/config';
import { toast } from 'sonner';

// Query Keys
export const categoryQueryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryQueryKeys.all, 'list'] as const,
  details: () => [...categoryQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...categoryQueryKeys.details(), id] as const,
};

// Get all categories
export const useCategories = () => {
  return useQuery({
    queryKey: categoryQueryKeys.lists(),
    queryFn: () => categoriesApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3, // Retry 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: true, // Refetch on component mount
  });
};

// Get category by ID
export const useCategory = (id: number) => {
  return useQuery({
    queryKey: categoryQueryKeys.detail(id),
    queryFn: () => categoriesApi.getById(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Create category mutation
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoriesApi.create(data),
    onSuccess: (response) => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.lists() });

      if (response.success) {
        toast.success('Category created successfully');
      } else {
        toast.error(response.message || 'Failed to create category');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create category');
    },
  });
};

// Update category mutation
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryRequest }) =>
      categoriesApi.update(id, data),
    onSuccess: (response, { id }) => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.detail(id) });

      if (response.success) {
        toast.success('Category updated successfully');
      } else {
        toast.error(response.message || 'Failed to update category');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update category');
    },
  });
};

// Delete category mutation
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: (response, id) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: categoryQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.lists() });

      if (response.success) {
        toast.success('Category deleted successfully');
      } else {
        toast.error(response.message || 'Failed to delete category');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete category');
    },
  });
};
