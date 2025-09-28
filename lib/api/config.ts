// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://belibraryformentee-production.up.railway.app/api',
  TIMEOUT: 10000,
} as const;

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiError {
  success: false;
  message: string;
}

// Auth Types
export interface AuthToken {
  token: string;
  expiresAt?: Date;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: {
    categories: Category[];
  };
}

export interface CreateCategoryRequest {
  name: string;
}

export interface CreateCategoryResponse {
  success: boolean;
  message: string;
  data: Category;
}

export interface UpdateCategoryRequest {
  name: string;
}

export interface UpdateCategoryResponse {
  success: boolean;
  message: string;
  data: Category;
}

export interface DeleteCategoryResponse {
  success: boolean;
  message: string;
}

// Book Types
export interface Book {
  id: number;
  title: string;
  coverImage?: string;
  author?: string | Author;
  description?: string;
  categoryId?: number;
  category?: { name?: string };
  isbn?: string;
  publishedYear?: number;
  totalCopies?: number;
  availableCopies?: number;
  rating?: number;
  reviewCount?: number;
  borrowCount?: number;
  authorId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Loan Types
export interface Loan {
  id: number;
  userId: number;
  bookId: number;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'BORROWED';
  borrowedAt: string;
  dueAt: string;
  returnedAt?: string | null;
  book?: Book;
  user?: User;
}

export interface CreateLoanRequest {
  bookId: number;
  days: number;
}

export interface AdminCreateLoanRequest {
  userId: number;
  bookId: number;
  dueAt: string;
}

export interface AdminUpdateLoanRequest {
  dueAt?: string;
  status?: 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'BORROWED';
}

export interface LoanResponse {
  loan: Loan;
}

export interface LoansResponse {
  data: {
    loans: Loan[];
    pagination?: Pagination;
  };
}

// Author Types
export interface Author {
  id: number;
  name: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAuthorRequest {
  name: string;
  bio?: string;
}

export interface UpdateAuthorRequest {
  name?: string;
  bio?: string;
}

export interface AuthorsResponse {
  authors: Author[];
}

// User Types
export interface User {
  id: number;
  email: string;
  name: string;
  role?: 'USER' | 'ADMIN';
  createdAt?: string;
  updatedAt?: string;
}

export interface UsersResponse {
  data: {
    users: User[];
    pagination?: Pagination;
  };
}

export interface CreateBookRequest {
  title: string;
  author?: string;
  authorId?: number;
  categoryId?: number;
  isbn?: string;
  description?: string;
  publishedYear?: number;
  totalCopies?: number;
  coverImage?: string;
}

export interface UpdateBookRequest {
  title?: string;
  author?: string;
  authorId?: number;
  categoryId?: number;
  isbn?: string;
  description?: string;
  publishedYear?: number;
  totalCopies?: number;
  coverImage?: string;
}

export interface BooksResponse {
  data: {
    books: Book[];
    pagination?: Pagination;
  };
}

// Me/Profile interfaces
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  phone?: string;
}

export interface LoanStats {
  borrowed: number;
  late: number;
  returned: number;
  total: number;
}

export interface MeResponse {
  profile: UserProfile;
  loanStats: LoanStats;
  reviewsCount: number;
}

export interface UpdateProfileRequest {
  name?: string;
  // Note: Backend only supports updating name field
  // Phone number updates are not supported by current API
}

export interface UpdateProfileResponse {
  profile: UserProfile;
}

export interface MyLoansResponse {
  loans: Loan[];
  pagination?: Pagination;
}

export interface MyReviewsResponse {
  reviews: unknown[];
  pagination?: Pagination;
}

export interface ReviewWithUser {
  id: number;
  star: number;
  comment: string;
  userId: number;
  bookId: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
}

export interface BookReviewsResponse {
  bookId: number;
  reviews: ReviewWithUser[];
  pagination: Pagination;
}

// Dashboard/Overview Types
export interface OverviewTotals {
  users: number;
  books: number;
}

export interface OverviewLoans {
  active: number;
  overdue: number;
}

export interface TopBorrowedBook {
  id: number;
  title: string;
  borrowCount: number;
  rating: number;
  availableCopies: number;
  totalCopies: number;
  author: Author;
  category: Category;
}

export interface OverviewResponse {
  data: {
    totals: OverviewTotals;
    loans: OverviewLoans;
    topBooks: TopBorrowedBook[];
  };
  generatedAt: string;
}

export interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  totalLoans: number;
  activeLoans: number;
}

export interface ReportData {
  period: string;
  data: Record<string, unknown>;
}

// Pagination Types
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Overdue Loans Response
export interface OverdueLoansResponse {
  data: {
    loans: Loan[];
    pagination: Pagination;
  };
}
