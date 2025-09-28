'use client';

import { useState } from 'react';
import {
  useAdminLoans,
  useAdminUsers,
  useAdminBooks,
  useAdminCreateBook,
  useAdminUpdateBook,
  useAdminDeleteBook,
  useAdminDeleteLoan,
  useAdminForceReturnLoan,
  useAdminCreateLoan,
  useAdminUpdateLoan,
  useAdminOverdueLoans,
  useAdminOverview,
} from '../../../hooks/api/useAdmin';
import {
  useAuthors,
  useCreateAuthor,
  useUpdateAuthor,
  useDeleteAuthor,
} from '../../../hooks/api/useAuthors';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../../hooks/api/useCategories';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';

interface Book {
  id: number;
  title: string;
  description?: string;
  isbn?: string;
  publishedYear?: number;
  coverImage?: string;
  authorId?: number;
  categoryId?: number;
  totalCopies?: number;
  availableCopies?: number;
  category?: { name: string };
  author?: string | { name: string };
  rating?: number;
}

interface Loan {
  id: number;
  book?: Book;
  user?: { name: string };
  borrowedAt: string;
  dueDate: string;
  status: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Author {
  id: number;
  name: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Category {
  id: number;
  name: string;
}

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showAuthorForm, setShowAuthorForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const router = useRouter();

  // Use admin-specific hooks for better data management
  const {
    data: booksData,
    isLoading: booksLoading,
    error: booksError,
  } = useAdminBooks({
    page: 1,
    limit: 100,
    search: searchTerm || undefined,
  });

  const { data: loansData, isLoading: loansLoading } = useAdminLoans({
    page: 1,
    limit: 50,
  });

  const { data: usersData, isLoading: usersLoading } = useAdminUsers(1, 50);

  // Get overdue loans data
  const { data: overdueLoansData, isLoading: overdueLoansLoading } =
    useAdminOverdueLoans({
      page: 1,
      limit: 20,
    });

  // Get admin overview data
  const { data: overviewData, isLoading: overviewLoading } = useAdminOverview();

  // Mutation hooks
  const createBookMutation = useAdminCreateBook();
  const updateBookMutation = useAdminUpdateBook();
  const deleteBookMutation = useAdminDeleteBook();
  const deleteLoanMutation = useAdminDeleteLoan();
  const forceReturnLoanMutation = useAdminForceReturnLoan();

  // Author mutation hooks
  const createAuthorMutation = useCreateAuthor();
  const updateAuthorMutation = useUpdateAuthor();
  const deleteAuthorMutation = useDeleteAuthor();

  // Category mutation hooks
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Loan mutation hooks
  const createLoanMutation = useAdminCreateLoan();
  const updateLoanMutation = useAdminUpdateLoan();

  // Get authors data
  const { data: authorsData, isLoading: authorsLoading } = useAuthors();

  // Get categories data
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();

  // Handle books data structure - API returns {success: true, data: {books: [...]}}
  const books = (booksData?.data as unknown as { books?: Book[] })?.books || [];

  // Debug logging for books data
  console.log('Books Debug Info:', {
    booksData,
    booksLoading,
    booksError,
    booksCount: books.length,
    booksDataStructure: booksData?.data
      ? Object.keys(booksData.data)
      : 'no data',
    books: books.slice(0, 2), // First 2 books for debugging
    searchTerm,
  });
  // Handle loans data - use overdue loans as main loans data since regular loans endpoint doesn't exist
  const apiLoans = (loansData?.data as unknown as Loan[]) || [];
  const apiUsers = (usersData?.data as unknown as User[]) || [];
  const overdueLoans =
    ((overdueLoansData?.data as { overdue?: Loan[] })
      ?.overdue as unknown as Loan[]) || [];

  // Use overdue loans as available server loans; also derive active loans from books inventory
  const finalUsers = apiUsers.length > 0 ? apiUsers : [];
  const serverLoans = overdueLoans.length > 0 ? overdueLoans : [];
  // Derive pseudo-loans from books where copies are currently borrowed
  const derivedLoansFromBooks: Loan[] = books
    .filter((b) => (b.totalCopies || 0) > (b.availableCopies || 0))
    .map(
      (b, idx) =>
        ({
          id: 100000 + idx,
          userId: 0,
          bookId: b.id,
          status: 'BORROWED',
          borrowedAt: new Date().toISOString(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          returnedAt: null,
          user: {
            id: 0,
            name: 'Unknown Borrower',
            email: 'unknown@example.com',
            role: 'USER',
            createdAt: new Date().toISOString(),
          } as unknown as User,
          book: b,
        } as unknown as Loan)
    );

  const finalLoans = [...serverLoans, ...derivedLoansFromBooks];
  // Handle authors data structure - API returns {success: true, data: {authors: [...]}}
  const allAuthors =
    (authorsData?.data as unknown as { authors?: Author[] })?.authors || [];

  // Handle categories data structure - API returns {success: true, data: {categories: [...]}}
  const allCategories =
    (categoriesData?.data as unknown as { categories?: Category[] })
      ?.categories || [];

  // Debug logging for authors and categories data
  console.log('Authors Debug Info:', {
    authorsData,
    authorsLoading,
    authorsCount: allAuthors.length,
    authorsDataStructure: authorsData?.data
      ? Object.keys(authorsData.data)
      : 'no data',
    authors: allAuthors.slice(0, 2), // First 2 authors for debugging
  });

  console.log('Categories Debug Info:', {
    categoriesData,
    categoriesLoading,
    categoriesCount: allCategories.length,
    categoriesDataStructure: categoriesData?.data
      ? Object.keys(categoriesData.data)
      : 'no data',
    categories: allCategories.slice(0, 2), // First 2 categories for debugging
  });

  const overview =
    (overviewData?.data as {
      totals?: { users?: number; books?: number };
      loans?: { active?: number; overdue?: number };
      topBorrowed?: Array<{
        id: number;
        title: string;
        borrowCount: number;
        rating: number;
        availableCopies: number;
        totalCopies: number;
        author?: { id: number; name: string };
        category?: { id: number; name: string };
      }>;
      generatedAt?: string;
    }) || null;

  // Create mock users data based on overview data
  const mockUsers: User[] = overview?.totals?.users
    ? Array.from({ length: overview.totals.users }, (_, index) => ({
        id: index + 1,
        name: `User ${index + 1}`,
        email: `user${index + 1}@example.com`,
        role: index === 0 ? 'ADMIN' : 'USER',
        createdAt: new Date().toISOString(),
      }))
    : [];

  // Update final data with mock data if API data is not available
  const updatedFinalUsers = finalUsers.length > 0 ? finalUsers : mockUsers;
  const updatedFinalLoans = finalLoans.length > 0 ? finalLoans : [];

  // Debug logging for users and loans data
  console.log('Users Debug Info:', {
    usersData,
    usersLoading,
    apiUsersCount: apiUsers.length,
    finalUsersCount: finalUsers.length,
    mockUsersCount: mockUsers.length,
    updatedFinalUsersCount: updatedFinalUsers.length,
    users: updatedFinalUsers.slice(0, 2), // First 2 users for debugging
  });

  console.log('Loans Debug Info:', {
    loansData,
    loansLoading,
    overdueLoansData,
    overdueLoansLoading,
    apiLoansCount: apiLoans.length,
    overdueLoansCount: overdueLoans.length,
    finalLoansCount: finalLoans.length,
    updatedFinalLoansCount: updatedFinalLoans.length,
    loans: updatedFinalLoans.slice(0, 2), // First 2 loans for debugging
  });

  // Filter authors based on search term
  const authors = allAuthors.filter(
    (author) =>
      author?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (author?.bio &&
        author.bio.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter categories based on search term
  const categories = allCategories.filter((category) =>
    category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter users based on search term
  const users = updatedFinalUsers.filter(
    (user) =>
      user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // (Optional) Apply filtering to updatedFinalLoans here if needed

  // Helper function to get books count for an author
  const getBooksCountForAuthor = (authorId: number) => {
    return books.filter((book) => book?.authorId === authorId).length;
  };

  // Helper function to get books count for a category
  const getBooksCountForCategory = (categoryId: number) => {
    return books.filter((book) => book?.categoryId === categoryId).length;
  };

  const filterTabs = ['All', 'Available', 'Borrowed', 'Returned', 'Damaged'];

  const handleAddBook = () => {
    router.push('/admin/books/add');
  };

  const handlePreview = (bookId: number) => {
    router.push(`/detail?id=${bookId}`);
  };

  const handleEdit = (bookId: number) => {
    const book = books.find((b) => b.id === bookId);
    if (book) {
      setEditingBook(book);
      setShowBookForm(true);
    }
  };

  const handleDelete = async (bookId: number) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteBookMutation.mutateAsync(bookId);
        toast.success('Book deleted successfully');
      } catch (error: unknown) {
        // Handle specific error messages from API
        const errorMessage =
          (
            error as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (error as { message?: string })?.message ||
          'Failed to delete book';

        if (errorMessage.includes('active loans')) {
          toast.error(
            'Cannot delete book: It has active loans. Please return all loans first.'
          );
        } else if (errorMessage.includes('Cannot delete')) {
          toast.error('Cannot delete book: ' + errorMessage);
        } else {
          toast.error('Failed to delete book: ' + errorMessage);
        }
      }
    }
  };

  const handleReturnLoan = async (loanId: number) => {
    if (
      window.confirm('Are you sure you want to mark this loan as returned?')
    ) {
      try {
        await forceReturnLoanMutation.mutateAsync(loanId);
        toast.success('Loan marked as returned');
      } catch {
        toast.error('Failed to return loan');
      }
    }
  };

  const handleDeleteLoan = async (loanId: number) => {
    if (window.confirm('Are you sure you want to delete this loan?')) {
      try {
        await deleteLoanMutation.mutateAsync(loanId);
        toast.success('Loan deleted successfully');
      } catch {
        toast.error('Failed to delete loan');
      }
    }
  };

  // Author handlers
  const handleAddAuthor = () => {
    setEditingAuthor(null);
    setShowAuthorForm(true);
  };

  const handleEditAuthor = (authorId: number) => {
    const author = allAuthors.find((a) => a?.id === authorId);
    if (author) {
      setEditingAuthor(author);
      setShowAuthorForm(true);
    }
  };

  const handleDeleteAuthor = async (authorId: number) => {
    if (window.confirm('Are you sure you want to delete this author?')) {
      try {
        await deleteAuthorMutation.mutateAsync(authorId);
        toast.success('Author deleted successfully');
      } catch (error: unknown) {
        const errorMessage =
          (
            error as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (error as { message?: string })?.message ||
          'Failed to delete author';

        if (errorMessage.includes('books by this author')) {
          toast.error(
            'Cannot delete author: There are books by this author. Please reassign or delete the books first.'
          );
        } else if (errorMessage.includes('Cannot delete author')) {
          toast.error('Cannot delete author: ' + errorMessage);
        } else {
          toast.error('Failed to delete author: ' + errorMessage);
        }
      }
    }
  };

  // Category handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowCategoryForm(true);
  };

  const handleEditCategory = (categoryId: number) => {
    const category = allCategories.find((c) => c?.id === categoryId);
    if (category) {
      setEditingCategory(category);
      setShowCategoryForm(true);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategoryMutation.mutateAsync(categoryId);
        toast.success('Category deleted successfully');
      } catch (error: unknown) {
        const errorMessage =
          (
            error as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (error as { message?: string })?.message ||
          'Failed to delete category';

        if (errorMessage.includes('books in this category')) {
          toast.error(
            'Cannot delete category: There are books in this category. Please reassign or delete the books first.'
          );
        } else if (errorMessage.includes('Category name already exists')) {
          toast.error(
            'Category name already exists. Please choose a different name.'
          );
        } else if (errorMessage.includes('Cannot delete category')) {
          toast.error('Cannot delete category: ' + errorMessage);
        } else {
          toast.error('Failed to delete category: ' + errorMessage);
        }
      }
    }
  };

  // Loan handlers
  const handleAddLoan = () => {
    setEditingLoan(null);
    setShowLoanForm(true);
  };

  const handleEditLoan = (loan: Loan) => {
    setEditingLoan(loan);
    setShowLoanForm(true);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Top Navigation */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Mobile Navigation - 2 Rows */}
          <div className='block sm:hidden'>
            <div className='py-4 space-y-2'>
              {/* First Row - 3 buttons */}
              <div className='flex space-x-1'>
                <button
                  onClick={() => setActiveTab('Dashboard')}
                  className={`flex-1 px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
                    activeTab === 'Dashboard'
                      ? 'text-gray-900 bg-white shadow-sm border border-gray-200'
                      : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('Borrowed List')}
                  className={`flex-1 px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
                    activeTab === 'Borrowed List'
                      ? 'text-gray-900 bg-white shadow-sm border border-gray-200'
                      : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Borrowed List
                </button>
                <button
                  onClick={() => setActiveTab('User')}
                  className={`flex-1 px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
                    activeTab === 'User'
                      ? 'text-gray-900 bg-white shadow-sm border border-gray-200'
                      : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  User
                </button>
              </div>

              {/* Second Row - 3 buttons */}
              <div className='flex space-x-1'>
                <button
                  onClick={() => setActiveTab('Authors')}
                  className={`flex-1 px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
                    activeTab === 'Authors'
                      ? 'text-gray-900 bg-white shadow-sm border border-gray-200'
                      : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Authors
                </button>
                <button
                  onClick={() => setActiveTab('Categories')}
                  className={`flex-1 px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
                    activeTab === 'Categories'
                      ? 'text-gray-900 bg-white shadow-sm border border-gray-200'
                      : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Categories
                </button>
                <button
                  onClick={() => setActiveTab('Book List')}
                  className={`flex-1 px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
                    activeTab === 'Book List'
                      ? 'text-gray-900 bg-white shadow-sm border border-gray-200'
                      : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Book List
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className='hidden sm:block'>
            <div className='flex space-x-1 py-4'>
              <button
                onClick={() => setActiveTab('Dashboard')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'Dashboard'
                    ? 'text-gray-900 bg-white shadow-sm border border-gray-200'
                    : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('Borrowed List')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'Borrowed List'
                    ? 'text-gray-900 bg-white shadow-sm border border-gray-200'
                    : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Borrowed List
              </button>
              <button
                onClick={() => setActiveTab('User')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'User'
                    ? 'text-gray-900 bg-white shadow-sm border border-gray-200'
                    : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                User
              </button>
              <button
                onClick={() => setActiveTab('Authors')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'Authors'
                    ? 'text-gray-900 bg-white shadow-sm border border-gray-200'
                    : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Authors
              </button>
              <button
                onClick={() => setActiveTab('Categories')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'Categories'
                    ? 'text-gray-900 bg-white shadow-sm border border-gray-200'
                    : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Categories
              </button>
              <button
                onClick={() => setActiveTab('Book List')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'Book List'
                    ? 'text-gray-900 bg-white shadow-sm border border-gray-200'
                    : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Book List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Page Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 font-quicksand'>
            {activeTab}
          </h1>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'Dashboard' && (
          <div className='space-y-6'>
            {/* Stats Overview */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {/* Total Users */}
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <div className='flex items-center'>
                  <div className='flex-shrink-0'>
                    <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                      <svg
                        className='w-5 h-5 text-blue-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                        />
                      </svg>
                    </div>
                  </div>
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600'>
                      Total Users
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {overviewLoading ? '...' : overview?.totals?.users || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Books */}
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <div className='flex items-center'>
                  <div className='flex-shrink-0'>
                    <div className='w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center'>
                      <svg
                        className='w-5 h-5 text-green-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z'
                        />
                      </svg>
                    </div>
                  </div>
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600'>
                      Total Books
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {overviewLoading ? '...' : overview?.totals?.books || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Loans */}
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <div className='flex items-center'>
                  <div className='flex-shrink-0'>
                    <div className='w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center'>
                      <svg
                        className='w-5 h-5 text-yellow-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z'
                        />
                      </svg>
                    </div>
                  </div>
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600'>
                      Active Loans
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {overviewLoading ? '...' : overview?.loans?.active || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Overdue Loans */}
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <div className='flex items-center'>
                  <div className='flex-shrink-0'>
                    <div className='w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center'>
                      <svg
                        className='w-5 h-5 text-red-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                        />
                      </svg>
                    </div>
                  </div>
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600'>
                      Overdue Loans
                    </p>
                    <p className='text-2xl font-bold text-red-600'>
                      {overviewLoading ? '...' : overview?.loans?.overdue || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Borrowed Books */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Top Borrowed Books
                </h3>
                <p className='text-sm text-gray-600'>
                  Most popular books in the library
                </p>
              </div>
              <div className='p-6'>
                {overviewLoading ? (
                  <div className='text-center py-8'>
                    <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                    <p className='mt-2 text-gray-500'>
                      Loading top borrowed books...
                    </p>
                  </div>
                ) : overview?.topBorrowed && overview.topBorrowed.length > 0 ? (
                  <div className='space-y-4'>
                    {overview.topBorrowed.map((book, index: number) => (
                      <div
                        key={book.id}
                        className='flex items-center space-x-4 p-4 bg-gray-50 rounded-lg'
                      >
                        <div className='flex-shrink-0'>
                          <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                            <span className='text-lg font-bold text-blue-600'>
                              #{index + 1}
                            </span>
                          </div>
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h4 className='text-lg font-semibold text-gray-900 truncate'>
                            {book.title}
                          </h4>
                          <p className='text-sm text-gray-600'>
                            by {book.author?.name || 'Unknown Author'}
                          </p>
                          <div className='flex items-center space-x-4 mt-2'>
                            <span className='text-sm text-gray-500'>
                              <span className='font-medium'>
                                {book.borrowCount}
                              </span>{' '}
                              borrows
                            </span>
                            <span className='text-sm text-gray-500'>
                              Rating:{' '}
                              <span className='font-medium'>
                                {book.rating?.toFixed(1) || 'N/A'}
                              </span>
                            </span>
                            <span className='text-sm text-gray-500'>
                              Available:{' '}
                              <span className='font-medium'>
                                {book.availableCopies}/{book.totalCopies}
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className='flex-shrink-0'>
                          <span className='inline-block px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded'>
                            {book.category?.name || 'Uncategorized'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    <div className='text-gray-400 mb-4'>
                      <svg
                        className='mx-auto h-12 w-12'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z'
                        />
                      </svg>
                    </div>
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>
                      No Data Available
                    </h3>
                    <p className='text-gray-500'>
                      No borrowed books data found.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <button
                onClick={() => setActiveTab('Book List')}
                className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left'
              >
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                    <svg
                      className='w-6 h-6 text-blue-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z'
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Manage Books
                    </h3>
                    <p className='text-sm text-gray-600'>
                      Add, edit, or delete books
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('Borrowed List')}
                className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left'
              >
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
                    <svg
                      className='w-6 h-6 text-green-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z'
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Manage Loans
                    </h3>
                    <p className='text-sm text-gray-600'>
                      View and manage book loans
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('Overdue Loans')}
                className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left'
              >
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center'>
                    <svg
                      className='w-6 h-6 text-red-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Overdue Loans
                    </h3>
                    <p className='text-sm text-gray-600'>Check overdue books</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Book List' && (
          <>
            {/* Add Book Button */}
            <div className='mb-6'>
              <button
                onClick={handleAddBook}
                className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors'
              >
                Add Book
              </button>
            </div>

            {/* Search Bar */}
            <div className='mb-6'>
              <div className='relative max-w-md'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <svg
                    className='h-5 w-5 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                </div>
                <input
                  type='text'
                  placeholder='Search book'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className='mb-6'>
              <div className='flex space-x-2'>
                {filterTabs.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeFilter === filter
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Books List */}
            <div className='space-y-4'>
              {/* Books Count Info */}
              {!booksLoading && (
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <svg
                        className='h-5 w-5 text-blue-400'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </div>
                    <div className='ml-3'>
                      <h3 className='text-sm font-medium text-blue-800'>
                        Books Available
                      </h3>
                      <div className='mt-2 text-sm text-blue-700'>
                        <p>
                          Showing {books.length} books from the library.
                          {searchTerm && ` Filtered by: "${searchTerm}"`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {booksLoading ? (
                <div className='text-center py-8'>
                  <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                  <p className='mt-2 text-gray-500'>Loading books...</p>
                </div>
              ) : booksError ? (
                <div className='text-center py-8'>
                  <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
                    <div className='flex items-center justify-center mb-4'>
                      <svg
                        className='h-12 w-12 text-red-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                        />
                      </svg>
                    </div>
                    <h3 className='text-lg font-medium text-red-800 mb-2'>
                      Error Loading Books
                    </h3>
                    <p className='text-red-600 mb-4'>
                      {booksError instanceof Error
                        ? booksError.message
                        : 'Failed to load books'}
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : books.length > 0 ? (
                books.map((book: Book) => (
                  <div
                    key={book.id}
                    className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'
                  >
                    <div className='flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4'>
                      {/* Book Cover */}
                      <div className='flex-shrink-0'>
                        <Image
                          src={book.coverImage || '/images/education.png'}
                          alt={book.title}
                          width={80}
                          height={120}
                          className='rounded-lg object-cover'
                        />
                      </div>

                      {/* Book Details */}
                      <div className='flex-1 min-w-0'>
                        <div className='mb-2 flex gap-2'>
                          <span className='inline-block px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded border'>
                            {book.category?.name || 'Uncategorized'}
                          </span>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                              (book.availableCopies || 0) === 0
                                ? 'bg-red-100 text-red-800'
                                : (book.availableCopies || 0) <
                                  (book.totalCopies || 1)
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {(book.availableCopies || 0) === 0
                              ? 'All Borrowed'
                              : `${book.availableCopies || 0}/${
                                  book.totalCopies || 1
                                } Available`}
                          </span>
                        </div>
                        <h3 className='text-lg font-bold text-gray-900 mb-1'>
                          {book.title}
                        </h3>
                        <p className='text-sm text-gray-600 mb-2'>
                          {typeof book.author === 'string'
                            ? book.author
                            : book.author?.name || 'Unknown Author'}
                        </p>
                        <div className='flex items-center space-x-1'>
                          <svg
                            className='w-4 h-4 text-yellow-400'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                          </svg>
                          <span className='text-sm font-semibold text-gray-900'>
                            {book.rating?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons - Desktop */}
                      <div className='hidden sm:flex flex-shrink-0 space-x-2'>
                        <button
                          onClick={() => handlePreview(book.id)}
                          className='px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleEdit(book.id)}
                          className='px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                        >
                          Edit
                        </button>
                        {(book.availableCopies || 0) <
                          (book.totalCopies || 1) && (
                          <button
                            onClick={() => {
                              // Switch to Borrowed List tab and filter by this book
                              setActiveTab('Borrowed List');
                              // You could add filtering logic here
                            }}
                            className='px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors'
                            title='View active loans for this book'
                          >
                            View Loans
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(book.id)}
                          className={`px-3 py-1 text-sm font-medium border border-gray-300 rounded-lg transition-colors ${
                            book.availableCopies === 0
                              ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                              : 'text-red-600 bg-white hover:bg-red-50'
                          }`}
                          disabled={book.availableCopies === 0}
                          title={
                            book.availableCopies === 0
                              ? 'Cannot delete: All copies are borrowed'
                              : 'Delete book'
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons - Mobile */}
                    <div className='flex sm:hidden flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200'>
                      <button
                        onClick={() => handlePreview(book.id)}
                        className='flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleEdit(book.id)}
                        className='flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                      >
                        Edit
                      </button>
                      {(book.availableCopies || 0) <
                        (book.totalCopies || 1) && (
                        <button
                          onClick={() => {
                            // Switch to Borrowed List tab and filter by this book
                            setActiveTab('Borrowed List');
                            // You could add filtering logic here
                          }}
                          className='flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors'
                          title='View active loans for this book'
                        >
                          View Loans
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(book.id)}
                        className={`flex-1 px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg transition-colors ${
                          book.availableCopies === 0
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-red-600 bg-white hover:bg-red-50'
                        }`}
                        disabled={book.availableCopies === 0}
                        title={
                          book.availableCopies === 0
                            ? 'Cannot delete: All copies are borrowed'
                            : 'Delete book'
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-center py-12'>
                  <div className='text-gray-400 mb-4'>
                    <svg
                      className='mx-auto h-12 w-12'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z'
                      />
                    </svg>
                  </div>
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    No books found
                  </h3>
                  <p className='text-gray-500 mb-4'>
                    {searchTerm
                      ? 'Try adjusting your search terms.'
                      : 'Get started by adding a new book.'}
                  </p>
                  <button
                    onClick={handleAddBook}
                    className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors'
                  >
                    Add Book
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Borrowed List Tab */}
        {activeTab === 'Borrowed List' && (
          <div className='space-y-4'>
            {/* Header with Add Loan Button */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
              <button
                onClick={handleAddLoan}
                className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors'
              >
                Add New Loan
              </button>
            </div>

            {/* Info Banner */}
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <svg
                    className='h-5 w-5 text-blue-400'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div className='ml-3'>
                  <h3 className='text-sm font-medium text-blue-800'>
                    Loan Management
                  </h3>
                  <div className='mt-2 text-sm text-blue-700'>
                    <p>
                      Manage book loans, track returns, and monitor overdue
                      books. Use &quot;Mark Returned&quot; to return books and
                      &quot;Add New Loan&quot; to create new loans.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {loansLoading ? (
              <div className='text-center py-8'>
                <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                <p className='mt-2 text-gray-500'>Loading borrowed books...</p>
              </div>
            ) : finalLoans.length > 0 ? (
              finalLoans.map((loan: Loan) => (
                <div
                  key={loan.id}
                  className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'
                >
                  <div className='flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4'>
                    {/* Book Cover */}
                    <div className='flex-shrink-0'>
                      <Image
                        src={loan.book?.coverImage || '/images/education.png'}
                        alt={loan.book?.title || 'Book'}
                        width={80}
                        height={120}
                        className='rounded-lg object-cover'
                      />
                    </div>

                    {/* Loan Details */}
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-lg font-bold text-gray-900 mb-1'>
                        {loan.book?.title || 'Unknown Book'}
                      </h3>
                      <p className='text-sm text-gray-600 mb-2'>
                        Borrowed by: {loan.user?.name || 'Unknown User'}
                      </p>
                      <p className='text-sm text-gray-600 mb-2'>
                        Borrowed on:{' '}
                        {new Date(loan.borrowedAt).toLocaleDateString()}
                      </p>
                      <p className='text-sm text-gray-600 mb-2'>
                        Due date: {new Date(loan.dueDate).toLocaleDateString()}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          loan.status === 'BORROWED'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {loan.status}
                      </span>
                    </div>

                    {/* Action Buttons - Desktop */}
                    <div className='hidden sm:flex flex-shrink-0 space-x-2'>
                      <button
                        onClick={() => handleEditLoan(loan)}
                        className='px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                        title='Edit loan details'
                      >
                        Edit
                      </button>
                      {loan.status === 'BORROWED' && (
                        <button
                          onClick={() => handleReturnLoan(loan.id)}
                          className='px-3 py-1 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors'
                          title='Mark this loan as returned to make the book available again'
                        >
                          Mark Returned
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteLoan(loan.id)}
                        className='px-3 py-1 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors'
                        title='Delete this loan record'
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons - Mobile */}
                  <div className='flex sm:hidden flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200'>
                    <button
                      onClick={() => handleEditLoan(loan)}
                      className='flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                      title='Edit loan details'
                    >
                      Edit
                    </button>
                    {loan.status === 'BORROWED' && (
                      <button
                        onClick={() => handleReturnLoan(loan.id)}
                        className='flex-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors'
                        title='Mark this loan as returned to make the book available again'
                      >
                        Mark Returned
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteLoan(loan.id)}
                      className='flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors'
                      title='Delete this loan record'
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center py-12'>
                <div className='text-gray-400 mb-4'>
                  <svg
                    className='mx-auto h-12 w-12'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  No borrowed books found
                </h3>
                <p className='text-gray-500'>
                  There are currently no books borrowed by users.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Overdue Loans Tab removed */}

        {/* User Tab */}
        {activeTab === 'User' && (
          <div className='space-y-4'>
            {usersLoading ? (
              <div className='text-center py-8'>
                <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                <p className='mt-2 text-gray-500'>Loading users...</p>
              </div>
            ) : users.length > 0 ? (
              users.map((user: User) => (
                <div
                  key={user.id}
                  className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'
                >
                  <div className='flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4'>
                    {/* User Avatar */}
                    <div className='flex-shrink-0'>
                      <div className='w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center'>
                        <span className='text-lg font-semibold text-gray-600'>
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>

                    {/* User Details */}
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-lg font-bold text-gray-900 mb-1'>
                        {user.name || 'Unknown User'}
                      </h3>
                      <p className='text-sm text-gray-600 mb-2'>
                        Email: {user.email || 'No email'}
                      </p>
                      <p className='text-sm text-gray-600 mb-2'>
                        Role: {user.role || 'USER'}
                      </p>
                      <p className='text-sm text-gray-600 mb-2'>
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>

                    {/* Action Buttons - Desktop */}
                    <div className='hidden sm:flex flex-shrink-0 space-x-2'>
                      <button className='px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
                        View Profile
                      </button>
                      <button className='px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors'>
                        Edit User
                      </button>
                      {user.role !== 'ADMIN' && (
                        <button className='px-3 py-1 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors'>
                          Delete User
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons - Mobile */}
                  <div className='flex sm:hidden flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200'>
                    <button className='flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
                      View Profile
                    </button>
                    <button className='flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors'>
                      Edit User
                    </button>
                    {user.role !== 'ADMIN' && (
                      <button className='flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors'>
                        Delete User
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center py-12'>
                <div className='text-gray-400 mb-4'>
                  <svg
                    className='mx-auto h-12 w-12'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  No users found
                </h3>
                <p className='text-gray-500'>
                  There are currently no users in the system.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Authors Tab */}
        {activeTab === 'Authors' && (
          <div className='space-y-4'>
            {/* Header with Add Button and Search */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
              <div className='flex items-center gap-4'>
                <button
                  onClick={handleAddAuthor}
                  className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors'
                >
                  Add Author
                </button>
                <div className='text-sm text-gray-600'>
                  {searchTerm
                    ? `${authors.length} of ${allAuthors.length} authors`
                    : `${allAuthors.length} authors`}
                </div>
              </div>

              {/* Search Authors */}
              <div className='flex-1 max-w-md'>
                <div className='relative'>
                  <input
                    type='text'
                    placeholder='Search authors...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <svg
                      className='h-5 w-5 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <svg
                    className='h-5 w-5 text-yellow-400'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div className='ml-3'>
                  <h3 className='text-sm font-medium text-yellow-800'>
                    Author Deletion Notice
                  </h3>
                  <div className='mt-2 text-sm text-yellow-700'>
                    <p>
                      Authors with books cannot be deleted. To delete an author,
                      first reassign or delete all their books using the
                      &quot;View Books&quot; button.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {authorsLoading ? (
              <div className='text-center py-8'>
                <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                <p className='mt-2 text-gray-500'>Loading authors...</p>
              </div>
            ) : searchTerm && authors.length === 0 ? (
              <div className='text-center py-12'>
                <div className='text-gray-400 mb-4'>
                  <svg
                    className='mx-auto h-12 w-12'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  No authors found
                </h3>
                <p className='text-gray-500 mb-4'>
                  No authors match your search for &quot;{searchTerm}&quot;
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className='text-blue-600 hover:text-blue-700 font-medium'
                >
                  Clear search
                </button>
              </div>
            ) : authors.length > 0 ? (
              authors.map((author: Author) => (
                <div
                  key={author.id}
                  className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'
                >
                  <div className='flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4'>
                    {/* Author Avatar */}
                    <div className='flex-shrink-0'>
                      <div className='w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center'>
                        <span className='text-lg font-semibold text-gray-600'>
                          {author.name?.charAt(0)?.toUpperCase() || 'A'}
                        </span>
                      </div>
                    </div>

                    {/* Author Details */}
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-lg font-bold text-gray-900 mb-1'>
                        {author.name}
                      </h3>
                      <p className='text-sm text-gray-600 mb-2'>
                        {author.bio || 'No bio available'}
                      </p>
                      <div className='flex items-center space-x-4 text-sm text-gray-500'>
                        <span>ID: {author.id}</span>
                        <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                          {getBooksCountForAuthor(author.id)} books
                        </span>
                        {author.createdAt && (
                          <span>
                            Created:{' '}
                            {new Date(author.createdAt).toLocaleDateString()}
                          </span>
                        )}
                        {author.updatedAt &&
                          author.updatedAt !== author.createdAt && (
                            <span>
                              Updated:{' '}
                              {new Date(author.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                      </div>
                    </div>

                    {/* Action Buttons - Desktop */}
                    <div className='hidden sm:flex flex-shrink-0 space-x-2'>
                      <button
                        onClick={() => handleEditAuthor(author.id)}
                        className='px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                      >
                        Edit
                      </button>
                      {getBooksCountForAuthor(author.id) > 0 && (
                        <button
                          onClick={() => {
                            // Switch to Book List tab and filter by this author
                            setActiveTab('Book List');
                            // You could add filtering logic here
                          }}
                          className='px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors'
                          title={`View ${getBooksCountForAuthor(
                            author.id
                          )} books by this author`}
                        >
                          View Books
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAuthor(author.id)}
                        className={`px-3 py-1 text-sm font-medium border border-gray-300 rounded-lg transition-colors ${
                          getBooksCountForAuthor(author.id) > 0
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100'
                        }`}
                        disabled={getBooksCountForAuthor(author.id) > 0}
                        title={
                          getBooksCountForAuthor(author.id) > 0
                            ? 'Cannot delete: Author has books. Please reassign or delete books first.'
                            : 'Delete author'
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons - Mobile */}
                  <div className='flex sm:hidden flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200'>
                    <button
                      onClick={() => handleEditAuthor(author.id)}
                      className='flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                    >
                      Edit
                    </button>
                    {getBooksCountForAuthor(author.id) > 0 && (
                      <button
                        onClick={() => {
                          // Switch to Book List tab and filter by this author
                          setActiveTab('Book List');
                          // You could add filtering logic here
                        }}
                        className='flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors'
                        title={`View ${getBooksCountForAuthor(
                          author.id
                        )} books by this author`}
                      >
                        View Books
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAuthor(author.id)}
                      className={`flex-1 px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg transition-colors ${
                        getBooksCountForAuthor(author.id) > 0
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                          : 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100'
                      }`}
                      disabled={getBooksCountForAuthor(author.id) > 0}
                      title={
                        getBooksCountForAuthor(author.id) > 0
                          ? 'Cannot delete: Author has books. Please reassign or delete books first.'
                          : 'Delete author'
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center py-12'>
                <div className='text-gray-400 mb-4'>
                  <svg
                    className='mx-auto h-12 w-12'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  No authors found
                </h3>
                <p className='text-gray-500 mb-4'>
                  Get started by adding a new author.
                </p>
                <button
                  onClick={handleAddAuthor}
                  className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors'
                >
                  Add Author
                </button>
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'Categories' && (
          <div className='space-y-4'>
            {/* Header with Add Button and Search */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
              <div className='flex items-center gap-4'>
                <button
                  onClick={handleAddCategory}
                  className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors'
                >
                  Add Category
                </button>
                <div className='text-sm text-gray-600'>
                  {searchTerm
                    ? `${categories.length} of ${allCategories.length} categories`
                    : `${allCategories.length} categories`}
                </div>
              </div>

              {/* Search Categories */}
              <div className='flex-1 max-w-md'>
                <div className='relative'>
                  <input
                    type='text'
                    placeholder='Search categories...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <svg
                      className='h-5 w-5 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <svg
                    className='h-5 w-5 text-yellow-400'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div className='ml-3'>
                  <h3 className='text-sm font-medium text-yellow-800'>
                    Category Deletion Notice
                  </h3>
                  <div className='mt-2 text-sm text-yellow-700'>
                    <p>
                      Categories with books cannot be deleted. To delete a
                      category, first reassign or delete all books in this
                      category using the &quot;View Books&quot; button.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {categoriesLoading ? (
              <div className='text-center py-8'>
                <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                <p className='mt-2 text-gray-500'>Loading categories...</p>
              </div>
            ) : searchTerm && categories.length === 0 ? (
              <div className='text-center py-12'>
                <div className='text-gray-400 mb-4'>
                  <svg
                    className='mx-auto h-12 w-12'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  No categories found
                </h3>
                <p className='text-gray-500 mb-4'>
                  No categories match your search for &quot;{searchTerm}&quot;
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className='text-blue-600 hover:text-blue-700 font-medium'
                >
                  Clear search
                </button>
              </div>
            ) : categories.length > 0 ? (
              categories.map((category: Category) => (
                <div
                  key={category.id}
                  className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'
                >
                  <div className='flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4'>
                    {/* Category Icon */}
                    <div className='flex-shrink-0'>
                      <div className='w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center'>
                        <span className='text-lg font-semibold text-gray-600'>
                          {category.name?.charAt(0)?.toUpperCase() || 'C'}
                        </span>
                      </div>
                    </div>

                    {/* Category Details */}
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-lg font-bold text-gray-900 mb-1'>
                        {category.name}
                      </h3>
                      <div className='flex items-center space-x-4 text-sm text-gray-500'>
                        <span>ID: {category.id}</span>
                        <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                          {getBooksCountForCategory(category.id)} books
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons - Desktop */}
                    <div className='hidden sm:flex flex-shrink-0 space-x-2'>
                      <button
                        onClick={() => handleEditCategory(category.id)}
                        className='px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                      >
                        Edit
                      </button>
                      {getBooksCountForCategory(category.id) > 0 && (
                        <button
                          onClick={() => {
                            // Switch to Book List tab and filter by this category
                            setActiveTab('Book List');
                            // You could add filtering logic here
                          }}
                          className='px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors'
                          title={`View ${getBooksCountForCategory(
                            category.id
                          )} books in this category`}
                        >
                          View Books
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className={`px-3 py-1 text-sm font-medium border border-gray-300 rounded-lg transition-colors ${
                          getBooksCountForCategory(category.id) > 0
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100'
                        }`}
                        disabled={getBooksCountForCategory(category.id) > 0}
                        title={
                          getBooksCountForCategory(category.id) > 0
                            ? 'Cannot delete: Category has books. Please reassign or delete books first.'
                            : 'Delete category'
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons - Mobile */}
                  <div className='flex sm:hidden flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200'>
                    <button
                      onClick={() => handleEditCategory(category.id)}
                      className='flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                    >
                      Edit
                    </button>
                    {getBooksCountForCategory(category.id) > 0 && (
                      <button
                        onClick={() => {
                          // Switch to Book List tab and filter by this category
                          setActiveTab('Book List');
                          // You could add filtering logic here
                        }}
                        className='flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors'
                        title={`View ${getBooksCountForCategory(
                          category.id
                        )} books in this category`}
                      >
                        View Books
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className={`flex-1 px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg transition-colors ${
                        getBooksCountForCategory(category.id) > 0
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                          : 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100'
                      }`}
                      disabled={getBooksCountForCategory(category.id) > 0}
                      title={
                        getBooksCountForCategory(category.id) > 0
                          ? 'Cannot delete: Category has books. Please reassign or delete books first.'
                          : 'Delete category'
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center py-12'>
                <div className='text-gray-400 mb-4'>
                  <svg
                    className='mx-auto h-12 w-12'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  No categories found
                </h3>
                <p className='text-gray-500 mb-4'>
                  Get started by adding a new category.
                </p>
                <button
                  onClick={handleAddCategory}
                  className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors'
                >
                  Add Category
                </button>
              </div>
            )}
          </div>
        )}

        {/* Author Form Modal */}
        {showAuthorForm && (
          <AuthorFormModal
            author={editingAuthor}
            onClose={() => {
              setShowAuthorForm(false);
              setEditingAuthor(null);
            }}
            onSave={async (authorData: Partial<Author>) => {
              try {
                if (editingAuthor) {
                  await updateAuthorMutation.mutateAsync({
                    id: editingAuthor.id,
                    data: authorData,
                  });
                  toast.success('Author updated successfully');
                } else {
                  await createAuthorMutation.mutateAsync({
                    name: authorData.name || '',
                    bio: authorData.bio || '',
                  });
                  toast.success('Author created successfully');
                }
                setShowAuthorForm(false);
                setEditingAuthor(null);
              } catch {
                toast.error('Failed to save author');
              }
            }}
            isLoading={
              createAuthorMutation.isPending || updateAuthorMutation.isPending
            }
          />
        )}

        {/* Category Form Modal */}
        {showCategoryForm && (
          <CategoryFormModal
            category={editingCategory}
            onClose={() => {
              setShowCategoryForm(false);
              setEditingCategory(null);
            }}
            onSave={async (categoryData: Partial<Category>) => {
              try {
                if (editingCategory) {
                  await updateCategoryMutation.mutateAsync({
                    id: editingCategory.id,
                    data: {
                      name: categoryData.name || '',
                    },
                  });
                  toast.success('Category updated successfully');
                } else {
                  await createCategoryMutation.mutateAsync({
                    name: categoryData.name || '',
                  });
                  toast.success('Category created successfully');
                }
                setShowCategoryForm(false);
                setEditingCategory(null);
              } catch (error: unknown) {
                const errorMessage =
                  (
                    error as {
                      response?: { data?: { message?: string } };
                      message?: string;
                    }
                  )?.response?.data?.message ||
                  (error as { message?: string })?.message ||
                  'Failed to save category';

                if (errorMessage.includes('Category name already exists')) {
                  toast.error(
                    'Category name already exists. Please choose a different name.'
                  );
                } else {
                  toast.error('Failed to save category: ' + errorMessage);
                }
              }
            }}
            isLoading={
              createCategoryMutation.isPending ||
              updateCategoryMutation.isPending
            }
          />
        )}

        {/* Loan Form Modal */}
        {showLoanForm && (
          <LoanFormModal
            loan={editingLoan}
            onClose={() => {
              setShowLoanForm(false);
              setEditingLoan(null);
            }}
            onSave={async (loanData: {
              userId: number;
              bookId: number;
              dueAt: string;
              status?: string;
            }) => {
              try {
                if (editingLoan) {
                  // Update existing loan
                  await updateLoanMutation.mutateAsync({
                    id: editingLoan.id,
                    data: {
                      dueAt: loanData.dueAt,
                      status:
                        (loanData.status as
                          | 'BORROWED'
                          | 'ACTIVE'
                          | 'RETURNED'
                          | 'OVERDUE') || 'BORROWED',
                    },
                  });
                  toast.success('Loan updated successfully');
                } else {
                  // Create new loan
                  await createLoanMutation.mutateAsync({
                    userId: loanData.userId,
                    bookId: loanData.bookId,
                    dueAt: loanData.dueAt,
                  });
                  toast.success('Loan created successfully');
                }
                setShowLoanForm(false);
                setEditingLoan(null);
              } catch (error: unknown) {
                const errorMessage =
                  (
                    error as {
                      response?: { data?: { message?: string } };
                      message?: string;
                    }
                  )?.response?.data?.message ||
                  (error as { message?: string })?.message ||
                  `Failed to ${editingLoan ? 'update' : 'create'} loan`;

                if (
                  errorMessage.includes(
                    'User already has an active loan for this book'
                  )
                ) {
                  toast.error(
                    'User already has an active loan for this book. Please return the existing loan first.'
                  );
                } else if (errorMessage.includes('Book is not available')) {
                  toast.error(
                    'Book is not available for loan. Please check book availability.'
                  );
                } else {
                  toast.error(
                    'Failed to ' +
                      (editingLoan ? 'update' : 'create') +
                      ' loan: ' +
                      errorMessage
                  );
                }
              }
            }}
            isLoading={
              createLoanMutation.isPending || updateLoanMutation.isPending
            }
          />
        )}

        {/* Book Form Modal */}
        {showBookForm && (
          <BookFormModal
            book={editingBook}
            onClose={() => {
              setShowBookForm(false);
              setEditingBook(null);
            }}
            onSave={async (bookData) => {
              try {
                if (editingBook) {
                  await updateBookMutation.mutateAsync({
                    id: editingBook.id,
                    data: bookData as unknown as import('../../../lib/api/config').Book,
                  });
                  toast.success('Book updated successfully');
                } else {
                  await createBookMutation.mutateAsync(
                    bookData as unknown as import('../../../lib/api/config').Book
                  );
                  toast.success('Book created successfully');
                }
                setShowBookForm(false);
                setEditingBook(null);
              } catch {
                toast.error('Failed to save book');
              }
            }}
            isLoading={
              createBookMutation.isPending || updateBookMutation.isPending
            }
          />
        )}
      </div>
    </div>
  );
}

// Loan Form Modal Component
interface LoanFormModalProps {
  loan: Loan | null;
  onClose: () => void;
  onSave: (data: {
    userId: number;
    bookId: number;
    dueAt: string;
    status?: string;
  }) => void;
  isLoading: boolean;
}

function LoanFormModal({
  loan,
  onClose,
  onSave,
  isLoading,
}: LoanFormModalProps) {
  const [formData, setFormData] = useState({
    userId: (loan as { userId?: number })?.userId || 0,
    bookId: (loan as { bookId?: number })?.bookId || 0,
    dueAt: loan?.dueDate
      ? new Date(loan.dueDate).toISOString().slice(0, 16)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 16),
    status: loan?.status || 'BORROWED',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields (only for new loans)
    if (!loan) {
      if (!formData.userId || formData.userId <= 0) {
        toast.error('Please select a user');
        return;
      }

      if (!formData.bookId || formData.bookId <= 0) {
        toast.error('Please select a book');
        return;
      }
    }

    if (!formData.dueAt) {
      toast.error('Please select a due date');
      return;
    }

    onSave(formData);
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
        <h2 className='text-xl font-bold mb-4'>
          {loan ? 'Edit Loan' : 'Create New Loan'}
        </h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {!loan && (
            <>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  User ID *
                </label>
                <input
                  type='number'
                  value={formData.userId || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      userId: parseInt(e.target.value) || 0,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                  placeholder='Enter user ID...'
                  min='1'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Book ID *
                </label>
                <input
                  type='number'
                  value={formData.bookId || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bookId: parseInt(e.target.value) || 0,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                  placeholder='Enter book ID...'
                  min='1'
                />
              </div>
            </>
          )}

          {loan && (
            <div className='bg-gray-50 p-4 rounded-lg'>
              <h3 className='text-sm font-medium text-gray-700 mb-2'>
                Loan Information
              </h3>
              <div className='space-y-2 text-sm'>
                <div>
                  <span className='font-medium'>User ID:</span>{' '}
                  {(loan as { userId?: number })?.userId || 'N/A'}
                </div>
                <div>
                  <span className='font-medium'>Book ID:</span>{' '}
                  {(loan as { bookId?: number })?.bookId || 'N/A'}
                </div>
                <div>
                  <span className='font-medium'>Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 text-xs font-medium rounded ${
                      loan.status === 'BORROWED'
                        ? 'bg-blue-100 text-blue-800'
                        : loan.status === 'RETURNED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {loan.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Due Date *
            </label>
            <input
              type='datetime-local'
              value={formData.dueAt}
              onChange={(e) =>
                setFormData({ ...formData, dueAt: e.target.value })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
          </div>

          {loan && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='BORROWED'>Borrowed</option>
                <option value='RETURNED'>Returned</option>
                <option value='OVERDUE'>Overdue</option>
                <option value='LATE'>Late</option>
              </select>
            </div>
          )}

          <div className='flex justify-end space-x-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {isLoading
                ? loan
                  ? 'Updating...'
                  : 'Creating...'
                : loan
                ? 'Update Loan'
                : 'Create Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Book Form Modal Component
interface BookFormModalProps {
  book: Book | null;
  onClose: () => void;
  onSave: (data: Partial<Book>) => void;
  isLoading: boolean;
}

function BookFormModal({
  book,
  onClose,
  onSave,
  isLoading,
}: BookFormModalProps) {
  // Get authors and categories data
  const { data: authorsData } = useAuthors();
  const { data: categoriesData } = useCategories();

  const authors = (authorsData?.data as unknown as Author[]) || [];
  const categories = (categoriesData?.data as unknown as Category[]) || [];

  const [formData, setFormData] = useState({
    title: book?.title || '',
    description: book?.description || '',
    isbn: book?.isbn || '',
    publishedYear: book?.publishedYear || new Date().getFullYear(),
    coverImage: book?.coverImage || '',
    authorId: book?.authorId || (authors.length > 0 ? authors[0].id : 1),
    categoryId:
      book?.categoryId || (categories.length > 0 ? categories[0].id : 1),
    totalCopies: book?.totalCopies || 1,
    availableCopies: book?.availableCopies || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.authorId || formData.authorId <= 0) {
      toast.error('Please select an author');
      return;
    }

    if (!formData.categoryId || formData.categoryId <= 0) {
      toast.error('Please select a category');
      return;
    }

    if (formData.totalCopies < 1) {
      toast.error('Total copies must be at least 1');
      return;
    }

    if (
      formData.availableCopies < 0 ||
      formData.availableCopies > formData.totalCopies
    ) {
      toast.error('Available copies must be between 0 and total copies');
      return;
    }

    // Ensure publishedYear is valid
    const currentYear = new Date().getFullYear();
    if (
      formData.publishedYear < 1000 ||
      formData.publishedYear > currentYear + 1
    ) {
      toast.error(
        'Published year must be between 1000 and ' + (currentYear + 1)
      );
      return;
    }

    onSave(formData);
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
        <h2 className='text-xl font-bold mb-4'>
          {book ? 'Edit Book' : 'Add New Book'}
        </h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Title *
            </label>
            <input
              type='text'
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              rows={3}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              ISBN
            </label>
            <input
              type='text'
              value={formData.isbn}
              onChange={(e) =>
                setFormData({ ...formData, isbn: e.target.value })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Published Year
              </label>
              <input
                type='number'
                value={formData.publishedYear}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    publishedYear: parseInt(e.target.value),
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Total Copies
              </label>
              <input
                type='number'
                value={formData.totalCopies}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalCopies: parseInt(e.target.value),
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                min='1'
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Available Copies
            </label>
            <input
              type='number'
              value={formData.availableCopies}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  availableCopies: parseInt(e.target.value),
                })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              min='0'
              max={formData.totalCopies}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Cover Image URL
            </label>
            <input
              type='url'
              value={formData.coverImage}
              onChange={(e) =>
                setFormData({ ...formData, coverImage: e.target.value })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Author *
              </label>
              <select
                value={formData.authorId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    authorId: parseInt(e.target.value),
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              >
                {authors.map((author: Author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    categoryId: parseInt(e.target.value),
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              >
                {categories.map((category: Category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {isLoading ? 'Saving...' : book ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Author Form Modal Component
interface AuthorFormModalProps {
  author: Author | null;
  onClose: () => void;
  onSave: (data: Partial<Author>) => void;
  isLoading: boolean;
}

function AuthorFormModal({
  author,
  onClose,
  onSave,
  isLoading,
}: AuthorFormModalProps) {
  const [formData, setFormData] = useState({
    name: author?.name || '',
    bio: author?.bio || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    onSave(formData);
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
        <h2 className='text-xl font-bold mb-4'>
          {author ? 'Edit Author' : 'Add New Author'}
        </h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Name *
            </label>
            <input
              type='text'
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              rows={4}
              placeholder='Enter author biography...'
            />
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {isLoading ? 'Saving...' : author ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Category Form Modal Component
interface CategoryFormModalProps {
  category: Category | null;
  onClose: () => void;
  onSave: (data: Partial<Category>) => void;
  isLoading: boolean;
}

function CategoryFormModal({
  category,
  onClose,
  onSave,
  isLoading,
}: CategoryFormModalProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    onSave(formData);
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
        <h2 className='text-xl font-bold mb-4'>
          {category ? 'Edit Category' : 'Add New Category'}
        </h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Category Name *
            </label>
            <input
              type='text'
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
              placeholder='Enter category name...'
            />
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {isLoading ? 'Saving...' : category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
