import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loansApi } from '../../lib/api/loans';
import { CreateLoanRequest } from '../../lib/api/config';
import { toast } from 'sonner';

// Hook for creating a loan
export const useCreateLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLoanRequest) => loansApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch loans data
      queryClient.invalidateQueries({ queryKey: ['me', 'loans'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Book borrowed successfully!');
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to borrow book';
      toast.error(message);
    },
  });
};
