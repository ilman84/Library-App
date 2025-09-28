'use client';

import { useMutation } from '@tanstack/react-query';
import { booksApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type UpdateBody = {
  title?: string;
  description?: string;
  isbn?: string;
  publishedYear?: number;
  coverImage?: string;
  authorId?: number;
  categoryId?: number;
  totalCopies?: number;
  availableCopies?: number;
};

export function useUpdateBook() {
  const { token } = useAuth();
  return useMutation({
    mutationKey: ['books', 'update'],
    mutationFn: async ({
      id,
      body,
    }: {
      id: number | string;
      body: UpdateBody;
    }) => {
      if (!token) throw new Error('Missing token');
      return booksApi.update(Number(id), body);
    },
  });
}

export function useDeleteBook() {
  const { token } = useAuth();
  return useMutation({
    mutationKey: ['books', 'delete'],
    mutationFn: async ({ id }: { id: number | string }) => {
      if (!token) throw new Error('Missing token');
      return booksApi.delete(Number(id));
    },
  });
}
