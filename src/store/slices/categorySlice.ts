import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CategoryState {
  selectedCategoryId: number | null;
  selectedCategoryName: string;
  selectedRating: number | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  selectedCategoryId: null,
  selectedCategoryName: 'All Categories',
  selectedRating: null,
  isLoading: false,
  error: null,
};

// Category mapping
export const categoryMapping: { [key: number]: string } = {
  9: 'Fiction',
  11: 'Non-Fiction',
  4: 'Self-Improvement',
  3: 'Finance',
  1: 'Science',
  14: 'Education',
};

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setSelectedCategory: (
      state,
      action: PayloadAction<{ id: number; name: string }>
    ) => {
      state.selectedCategoryId = action.payload.id;
      state.selectedCategoryName = action.payload.name;
      state.error = null;
    },
    clearSelectedCategory: (state) => {
      state.selectedCategoryId = null;
      state.selectedCategoryName = 'All Categories';
      state.selectedRating = null;
      state.error = null;
    },
    setSelectedRating: (state, action: PayloadAction<number | null>) => {
      state.selectedRating = action.payload;
      state.error = null;
    },
    clearSelectedRating: (state) => {
      state.selectedRating = null;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setSelectedCategory,
  clearSelectedCategory,
  setSelectedRating,
  clearSelectedRating,
  setLoading,
  setError,
  clearError,
} = categorySlice.actions;

export default categorySlice.reducer;
