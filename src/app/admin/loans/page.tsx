'use client';

import { useState } from 'react';
import {
  useAdminLoans,
  useAdminForceReturnLoan,
} from '../../../../hooks/api/useAdmin';
import { Loan } from '../../../../lib/api/config';
import Image from 'next/image';

export default function AdminLoans() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [returnConfirm, setReturnConfirm] = useState<number | null>(null);

  const {
    data: loansData,
    isLoading,
    refetch,
  } = useAdminLoans({ page: currentPage, limit: 10 });
  const forceReturnMutation = useAdminForceReturnLoan();

  interface LoanData {
    loans: Loan[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
  const loans = (loansData?.data as LoanData)?.loans || [];
  const pagination = (loansData?.data as LoanData)?.pagination;

  const filteredLoans = loans.filter((loan: Loan) => {
    const matchesSearch =
      loan.book?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.user?.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || loan.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleForceReturn = async (loanId: number) => {
    try {
      await forceReturnMutation.mutateAsync(loanId);
      setReturnConfirm(null);
      refetch();
    } catch (error) {
      console.error('Failed to return book:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800';
      case 'RETURNED':
        return 'bg-green-100 text-green-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div>
      {/* Page Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 font-quicksand'>
          Loan Management
        </h1>
        <p className='text-gray-600 font-quicksand'>
          Manage all book loans and returns
        </p>
      </div>

      {/* Search and Filters */}
      <div className='bg-white rounded-lg shadow p-6 mb-6'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1'>
            <input
              type='text'
              placeholder='Search by book title, user name, or email...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
          <div className='sm:w-48'>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value=''>All Status</option>
              <option value='ACTIVE'>Active</option>
              <option value='OVERDUE'>Overdue</option>
              <option value='RETURNED'>Returned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loans Table */}
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900 font-quicksand'>
            Loans ({filteredLoans.length})
          </h3>
        </div>

        {isLoading ? (
          <div className='p-8 text-center'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            <p className='mt-2 text-gray-600'>Loading loans...</p>
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className='p-8 text-center text-gray-500'>No loans found</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Book
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Borrower
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Borrowed Date
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Due Date
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredLoans.map((loan: Loan) => (
                  <tr key={loan.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='w-12 h-16 bg-gray-200 rounded flex-shrink-0 relative'>
                          {loan.book?.coverImage ? (
                            <Image
                              src={loan.book.coverImage}
                              alt={loan.book.title || 'Book cover'}
                              fill
                              className='object-cover rounded'
                              sizes='48px'
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center text-gray-400'>
                              <svg
                                className='w-6 h-6'
                                fill='currentColor'
                                viewBox='0 0 20 20'
                              >
                                <path
                                  fillRule='evenodd'
                                  d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z'
                                  clipRule='evenodd'
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900 max-w-xs truncate'>
                            {loan.book?.title}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {typeof loan.book?.author === 'string'
                              ? loan.book.author
                              : loan.book?.author?.name || 'Unknown Author'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div>
                        <div className='text-sm font-medium text-gray-900'>
                          {loan.user?.name}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {loan.user?.email}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {new Date(loan.borrowedAt).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>
                        {new Date(loan.dueAt).toLocaleDateString()}
                      </div>
                      {loan.status === 'OVERDUE' && (
                        <div className='text-sm text-red-600'>
                          {getDaysOverdue(loan.dueAt)} days overdue
                        </div>
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          loan.status
                        )}`}
                      >
                        {loan.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex justify-end gap-2'>
                        {loan.status === 'ACTIVE' ||
                        loan.status === 'OVERDUE' ? (
                          <button
                            onClick={() => setReturnConfirm(loan.id)}
                            className='text-blue-600 hover:text-blue-900'
                          >
                            Force Return
                          </button>
                        ) : (
                          <span className='text-gray-400'>Returned</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
            <div className='text-sm text-gray-700'>
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
              of {pagination.total} loans
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={pagination.page === 1}
                className='px-3 py-2 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, pagination.totalPages)
                  )
                }
                disabled={pagination.page === pagination.totalPages}
                className='px-3 py-2 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Force Return Confirmation Modal */}
      {returnConfirm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Confirm Force Return
            </h3>
            <p className='text-gray-600 mb-6'>
              Are you sure you want to force return this book? This will mark
              the loan as returned immediately.
            </p>
            <div className='flex gap-4 justify-end'>
              <button
                onClick={() => setReturnConfirm(null)}
                className='px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                onClick={() => handleForceReturn(returnConfirm)}
                disabled={forceReturnMutation.isPending}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
              >
                {forceReturnMutation.isPending
                  ? 'Processing...'
                  : 'Force Return'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
