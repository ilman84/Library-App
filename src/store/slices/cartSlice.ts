import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Book } from '@/lib/api';

export interface CartItem {
  book: Book;
  quantity: number;
  addedAt: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  isOpen: boolean;
}

// Initial state - will be hydrated on client side
const initialState: CartState = {
  items: [],
  totalItems: 0,
  isOpen: false,
};

// Save cart to localStorage
const saveCartToStorage = (state: CartState) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('cart', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Book>) => {
      const book = action.payload;
      const existingItem = state.items.find(
        (item) => String(item.book.id) === String(book.id)
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          book,
          quantity: 1,
          addedAt: new Date().toISOString(),
        });
      }

      state.totalItems = state.items.reduce(
        (total, item) => total + item.quantity,
        0
      );
      saveCartToStorage(state);
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      const bookId = action.payload;
      state.items = state.items.filter(
        (item) => String(item.book.id) !== String(bookId)
      );
      state.totalItems = state.items.reduce(
        (total, item) => total + item.quantity,
        0
      );
      saveCartToStorage(state);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ bookId: number; quantity: number }>
    ) => {
      const { bookId, quantity } = action.payload;
      const item = state.items.find(
        (item) => String(item.book.id) === String(bookId)
      );

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(
            (item) => String(item.book.id) !== String(bookId)
          );
        } else {
          item.quantity = quantity;
        }
        state.totalItems = state.items.reduce(
          (total, item) => total + item.quantity,
          0
        );
      }
      saveCartToStorage(state);
    },

    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      saveCartToStorage(state);
    },

    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },

    loadCartFromStorage: (state) => {
      if (typeof window !== 'undefined') {
        try {
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            state.items = parsedCart.items || [];
            state.totalItems = parsedCart.totalItems || 0;
            state.isOpen = parsedCart.isOpen || false;
          }
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
    },

    openCart: (state) => {
      state.isOpen = true;
    },

    closeCart: (state) => {
      state.isOpen = false;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  loadCartFromStorage,
  openCart,
  closeCart,
} = cartSlice.actions;

export default cartSlice.reducer;
