import { apiClient } from './client';
import {
  Category,
  CategoriesResponse,
  CreateCategoryRequest,
  CreateCategoryResponse,
  UpdateCategoryRequest,
  UpdateCategoryResponse,
  DeleteCategoryResponse,
} from './config';

// Categories API endpoints
export const categoriesApi = {
  // Get all categories
  getAll: () => apiClient.get<CategoriesResponse>('/categories'),

  // Get category by ID
  getById: (id: number) => apiClient.get<Category>(`/categories/${id}`),

  // Create new category
  create: (data: CreateCategoryRequest) =>
    apiClient.post<CreateCategoryResponse>('/categories', data),

  // Update category
  update: (id: number, data: UpdateCategoryRequest) =>
    apiClient.put<UpdateCategoryResponse>(`/categories/${id}`, data),

  // Delete category
  delete: (id: number) =>
    apiClient.delete<DeleteCategoryResponse>(`/categories/${id}`),
};
