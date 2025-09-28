import { apiClient } from './client';
import { Loan, LoansResponse, CreateLoanRequest } from './config';

// Loans API endpoints
export const loansApi = {
  // Get all loans
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get<LoansResponse>('/loans', params),

  // Get loan by ID
  getById: (id: number) => apiClient.get<Loan>(`/loans/${id}`),

  // Create new loan
  create: (data: CreateLoanRequest) => apiClient.post<Loan>('/loans', data),

  // Return a loan
  return: (id: number) => apiClient.patch<Loan>(`/loans/${id}/return`),

  // Get user's loans
  getUserLoans: (userId: number, params?: { status?: string }) =>
    apiClient.get<LoansResponse>(`/users/${userId}/loans`, params),

  // Get current user's loans
  getMyLoans: (params?: { status?: string }) =>
    apiClient.get<LoansResponse>('/me/loans', params),

  // Get loans by book
  getBookLoans: (bookId: number) =>
    apiClient.get<LoansResponse>(`/books/${bookId}/loans`),
};
