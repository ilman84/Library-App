import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authorsApi } from '../../lib/api/authors';
import { CreateAuthorRequest, UpdateAuthorRequest } from '../../lib/api/config';
import { toast } from 'sonner';

// Query Keys
export const authorQueryKeys = {
  all: ['authors'] as const,
  lists: () => [...authorQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...authorQueryKeys.lists(), { filters }] as const,
  details: () => [...authorQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...authorQueryKeys.details(), id] as const,
};

// Get all authors
export const useAuthors = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: authorQueryKeys.list(params || {}),
    queryFn: () => authorsApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get author by ID
export const useAuthor = (id: number) => {
  return useQuery({
    queryKey: authorQueryKeys.detail(id),
    queryFn: () => authorsApi.getById(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Create author mutation
export const useCreateAuthor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAuthorRequest) => authorsApi.create(data),
    onSuccess: (response) => {
      // Invalidate and refetch authors
      queryClient.invalidateQueries({ queryKey: authorQueryKeys.lists() });

      if (response.success) {
        toast.success('Author created successfully');
      } else {
        toast.error(response.message || 'Failed to create author');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create author');
    },
  });
};

// Update author mutation
export const useUpdateAuthor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAuthorRequest }) =>
      authorsApi.update(id, data),
    onSuccess: (response, { id }) => {
      // Invalidate and refetch authors
      queryClient.invalidateQueries({ queryKey: authorQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: authorQueryKeys.detail(id) });

      if (response.success) {
        toast.success('Author updated successfully');
      } else {
        toast.error(response.message || 'Failed to update author');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update author');
    },
  });
};

// Delete author mutation
export const useDeleteAuthor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => authorsApi.delete(id),
    onSuccess: (response, id) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: authorQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: authorQueryKeys.lists() });

      if (response.success) {
        toast.success('Author deleted successfully');
      } else {
        toast.error(response.message || 'Failed to delete author');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete author');
    },
  });
};
