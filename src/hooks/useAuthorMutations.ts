'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  authorsApi,
  type CreateAuthorRequest,
  type UpdateAuthorRequest,
} from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export function useCreateAuthor() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (authorData: CreateAuthorRequest) => {
      if (!token) {
        throw new Error('Authentication token is required');
      }
      return authorsApi.create(authorData);
    },
    onSuccess: () => {
      // Invalidate authors list to refetch
      queryClient.invalidateQueries({ queryKey: ['authors'] });
    },
  });
}

export function useUpdateAuthor() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      authorId,
      authorData,
    }: {
      authorId: number | string;
      authorData: UpdateAuthorRequest;
    }) => {
      if (!token) {
        throw new Error('Authentication token is required');
      }
      return authorsApi.update(Number(authorId), authorData);
    },
    onSuccess: () => {
      // Invalidate authors list to refetch
      queryClient.invalidateQueries({ queryKey: ['authors'] });
    },
  });
}

export function useDeleteAuthor() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (authorId: number | string) => {
      if (!token) {
        throw new Error('Authentication token is required');
      }
      return authorsApi.delete(Number(authorId));
    },
    onSuccess: () => {
      // Invalidate authors list to refetch
      queryClient.invalidateQueries({ queryKey: ['authors'] });
    },
  });
}

export function useAuthorBooks(authorId: number | string) {
  return {
    queryKey: ['author-books', authorId],
    queryFn: () => authorsApi.getById(Number(authorId)),
    enabled: !!authorId,
    staleTime: 60_000, // 1 minute
  };
}
