'use client';

import React from 'react';
import { useCategories } from '@/hooks/api/useCategories';

interface CategoriesProps {
  onCategorySelect?: (categoryId: number, categoryName: string) => void;
  selectedCategoryId?: number;
  className?: string;
}

export default function Categories({
  onCategorySelect,
  selectedCategoryId,
  className = '',
}: CategoriesProps) {
  const { data: categoriesData, isLoading, isError, error } = useCategories();

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className='animate-pulse'>
          <div className='h-4 bg-gray-200 rounded mb-2'></div>
          <div className='space-y-2'>
            {[...Array(6)].map((_, i) => (
              <div key={i} className='h-8 bg-gray-200 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`text-red-500 ${className}`}>
        <p>Error loading categories: {error?.message}</p>
      </div>
    );
  }

  interface Category {
    id: number;
    name: string;
  }
  const categories =
    (categoriesData?.data as { categories?: Category[] })?.categories || [];

  // Filter out categories with generic names
  const filteredCategories = categories.filter(
    (category: Category) =>
      category.name !== 'string' &&
      !category.name.toLowerCase().includes('admin') &&
      category.name.length > 2
  );

  return (
    <div className={className}>
      <h3 className='text-lg font-semibold mb-4 text-gray-800'>Categories</h3>
      <div className='space-y-2'>
        {filteredCategories.map((category: Category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect?.(category.id, category.name)}
            className={`
              w-full text-left px-4 py-2 rounded-lg transition-colors duration-200
              ${
                selectedCategoryId === category.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }
            `}
          >
            <span className='capitalize'>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Simple display component for showing categories as tags/chips
export function CategoryTags({ className = '' }: { className?: string }) {
  const { data: categoriesData, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className='h-6 w-16 bg-gray-200 rounded-full animate-pulse'
          ></div>
        ))}
      </div>
    );
  }

  interface Category {
    id: number;
    name: string;
  }
  const categories =
    (categoriesData?.data as { categories?: Category[] })?.categories || [];
  const filteredCategories = categories
    .filter(
      (category: Category) =>
        category.name !== 'string' &&
        !category.name.toLowerCase().includes('admin') &&
        category.name.length > 2
    )
    .slice(0, 6); // Show only first 6 categories

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {filteredCategories.map((category: Category) => (
        <span
          key={category.id}
          className='px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium'
        >
          {category.name}
        </span>
      ))}
    </div>
  );
}
