import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loansApi } from '../../lib/api/loans';
import { CreateLoanRequest } from '../../lib/api/config';

// Hook for creating a loan
export const useCreateLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLoanRequest) => loansApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch loans data
      queryClient.invalidateQueries({ queryKey: ['me', 'loans'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      // Don't show success toast here - let the calling component handle it
    },
    onError: (error) => {
      // Don't show error toast here - let the calling component handle it
      console.error('Loan creation error:', error);
    },
  });
};
