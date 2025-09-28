const API_BASE_URL = 'https://belibraryformentee-production.up.railway.app/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export const authAPI = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('Login request:', credentials);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log('Login response status:', response.status);
    console.log('Login response statusText:', response.statusText);
    console.log(
      'Login response headers:',
      Object.fromEntries(response.headers.entries())
    );
    console.log('Login response URL:', response.url);

    if (!response.ok) {
      let errorMessage = 'Login failed';
      try {
        // Try to get response text first
        const responseText = await response.text();
        console.error('Login error response text:', responseText);

        // Try to parse as JSON
        const errorData = JSON.parse(responseText);
        console.error('Login error data:', errorData);
        errorMessage =
          errorData.message ||
          `HTTP ${response.status}: ${response.statusText}`;
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Login success:', data);
    return data;
  },

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    console.log('Register request:', userData);

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: '*/*',
      },
      body: JSON.stringify(userData),
    });

    console.log('Register response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Registration failed';
      try {
        const errorData = await response.json();
        console.error('Register error data:', errorData);
        errorMessage =
          errorData.message ||
          `HTTP ${response.status}: ${response.statusText}`;
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Register success:', data);
    return data;
  },
};

// Books API
export interface BookItem {
  id?: number | string;
  title?: string;
  name?: string;
  author?: string | { name?: string };
  writer?: string;
  image?: string;
  cover?: string;
  coverImage?: string;
  coverImageUrl?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  averageRating?: number;
  rating?: number;
}

export interface AuthorItem {
  id: number;
  name: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthorsResponse {
  success: boolean;
  message: string;
  data: {
    authors: AuthorItem[];
  };
}

export interface CreateAuthorRequest {
  name: string;
  bio: string;
}

export interface CreateAuthorResponse {
  success: boolean;
  message: string;
  data: AuthorItem;
}

export interface UpdateAuthorRequest {
  name: string;
  bio: string;
}

export interface UpdateAuthorResponse {
  success: boolean;
  message: string;
  data: AuthorItem;
}

export interface DeleteAuthorResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
  };
}

export interface AuthorBooksResponse {
  success: boolean;
  message: string;
  data: {
    author: {
      id: number;
      name: string;
      bio?: string;
      createdAt?: string;
      updatedAt?: string;
    };
    books: {
      id: number;
      title: string;
      description?: string;
      isbn?: string;
      publishedYear?: number;
      coverImage?: string;
      rating?: number;
      reviewCount?: number;
      totalCopies?: number;
      availableCopies?: number;
      borrowCount?: number;
      authorId?: number;
      categoryId?: number;
      createdAt?: string;
      updatedAt?: string;
    }[];
  };
}

export interface CategoryItem {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: {
    categories: CategoryItem[];
  };
}

export interface ReviewItem {
  id: number;
  star: number;
  comment: string;
  userId: number;
  bookId: number;
  createdAt: string;
  user: { id: number; name: string };
}

export interface BookDetail extends BookItem {
  id: number;
  description?: string;
  isbn?: string;
  publishedYear?: number;
  reviewCount?: number;
  totalCopies?: number;
  availableCopies?: number;
  borrowCount?: number;
  authorId?: number;
  categoryId?: number;
  createdAt?: string;
  updatedAt?: string;
  author?: AuthorItem;
  category?: CategoryItem;
  reviews?: ReviewItem[];
}

export interface BookListResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
  items?: BookItem[];
  books?: BookItem[];
}

export const booksAPI = {
  async list(page = 1, limit = 20): Promise<BookListResponse> {
    const url = `${API_BASE_URL}/books?page=${page}&limit=${limit}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: '*/*',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorMessage = `Failed to fetch books (HTTP ${response.status})`;
      try {
        const text = await response.text();
        try {
          const err = JSON.parse(text);
          errorMessage = err.message || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
      } catch {}
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as BookListResponse;
    return data;
  },
  async recommend(
    by: 'popular' | 'rating',
    limit = 10
  ): Promise<BookListResponse> {
    const url = `${API_BASE_URL}/books/recommend?by=${encodeURIComponent(
      by
    )}&limit=${limit}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { accept: '*/*' },
      cache: 'no-store',
    });
    if (!response.ok) {
      let errorMessage = `Failed to fetch recommendations (HTTP ${response.status})`;
      try {
        const text = await response.text();
        try {
          const err = JSON.parse(text);
          errorMessage = err.message || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
      } catch {}
      throw new Error(errorMessage);
    }
    const data = (await response.json()) as BookListResponse;
    return data;
  },
  async detail(
    id: number | string
  ): Promise<{ success: boolean; message: string; data: BookDetail }> {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'GET',
      headers: { accept: '*/*' },
      cache: 'no-store',
    });
    if (!response.ok) {
      let msg = `HTTP ${response.status}`;
      try {
        const err = await response.json();
        msg = err.message || msg;
      } catch {}
      throw new Error(msg);
    }
    return (await response.json()) as {
      success: boolean;
      message: string;
      data: BookDetail;
    };
  },
  async create(
    token: string,
    body: {
      title: string;
      description: string;
      isbn: string;
      publishedYear: number;
      coverImage: string;
      authorId: number;
      categoryId: number;
      totalCopies: number;
      availableCopies: number;
    }
  ): Promise<{ success: boolean; message: string; data?: BookItem }> {
    const response = await fetch(`${API_BASE_URL}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let msg = `HTTP ${response.status}`;
      try {
        const err = await response.json();
        msg = err.message || msg;
      } catch {}
      throw new Error(msg);
    }
    return (await response.json()) as {
      success: boolean;
      message: string;
      data?: BookItem;
    };
  },
  async update(
    id: number | string,
    token: string,
    body: {
      title?: string;
      description?: string;
      isbn?: string;
      publishedYear?: number;
      coverImage?: string;
      authorId?: number;
      categoryId?: number;
      totalCopies?: number;
      availableCopies?: number;
    }
  ): Promise<{ success: boolean; message: string; data?: BookDetail }> {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      let msg = `HTTP ${response.status}`;
      try {
        const err = await response.json();
        msg = err.message || msg;
      } catch {}
      throw new Error(msg);
    }
    return (await response.json()) as {
      success: boolean;
      message: string;
      data?: BookDetail;
    };
  },
  async remove(
    id: number | string,
    token: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'DELETE',
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      let msg = `HTTP ${response.status}`;
      try {
        const err = await response.json();
        msg = err.message || msg;
      } catch {}
      throw new Error(msg);
    }
    return (await response.json()) as {
      success: boolean;
      message: string;
    };
  },
};

// Authors API
export const authorsAPI = {
  async list(): Promise<AuthorsResponse> {
    const response = await fetch(`${API_BASE_URL}/authors`, {
      method: 'GET',
      headers: {
        accept: '*/*',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorMessage = `Failed to fetch authors (HTTP ${response.status})`;
      try {
        const text = await response.text();
        try {
          const err = JSON.parse(text);
          errorMessage = err.message || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
      } catch {}
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as AuthorsResponse;
    return data;
  },

  async create(
    token: string,
    authorData: CreateAuthorRequest
  ): Promise<CreateAuthorResponse> {
    const response = await fetch(`${API_BASE_URL}/authors`, {
      method: 'POST',
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authorData),
    });

    if (!response.ok) {
      let errorMessage = `Failed to create author (HTTP ${response.status})`;
      try {
        const text = await response.text();
        try {
          const err = JSON.parse(text);
          errorMessage = err.message || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
      } catch {}
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as CreateAuthorResponse;
    return data;
  },

  async getAuthorBooks(
    authorId: number | string
  ): Promise<AuthorBooksResponse> {
    const response = await fetch(`${API_BASE_URL}/authors/${authorId}/books`, {
      method: 'GET',
      headers: {
        accept: '*/*',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorMessage = `Failed to fetch author books (HTTP ${response.status})`;
      try {
        const text = await response.text();
        try {
          const err = JSON.parse(text);
          errorMessage = err.message || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
      } catch {}
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as AuthorBooksResponse;
    return data;
  },

  async update(
    token: string,
    authorId: number | string,
    authorData: UpdateAuthorRequest
  ): Promise<UpdateAuthorResponse> {
    const response = await fetch(`${API_BASE_URL}/authors/${authorId}`, {
      method: 'PUT',
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authorData),
    });

    if (!response.ok) {
      let errorMessage = `Failed to update author (HTTP ${response.status})`;
      try {
        const text = await response.text();
        try {
          const err = JSON.parse(text);
          errorMessage = err.message || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
      } catch {}
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as UpdateAuthorResponse;
    return data;
  },

  async remove(
    token: string,
    authorId: number | string
  ): Promise<DeleteAuthorResponse> {
    const response = await fetch(`${API_BASE_URL}/authors/${authorId}`, {
      method: 'DELETE',
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = `Failed to delete author (HTTP ${response.status})`;
      try {
        const text = await response.text();
        try {
          const err = JSON.parse(text);
          errorMessage = err.message || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
      } catch {}
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as DeleteAuthorResponse;
    return data;
  },
};

// Categories API
export const categoriesAPI = {
  async getAll(): Promise<CategoriesResponse> {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        accept: '*/*',
      },
    });

    if (!response.ok) {
      let errorMessage = `Failed to fetch categories (HTTP ${response.status})`;
      try {
        const text = await response.text();
        try {
          const err = JSON.parse(text);
          errorMessage = err.message || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
      } catch {}
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as CategoriesResponse;
    return data;
  },
};

// Categories Hooks
import { useQuery } from '@tanstack/react-query';

export function useCategories() {
  return useQuery<CategoriesResponse>({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
