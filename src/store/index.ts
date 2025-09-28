import { configureStore } from '@reduxjs/toolkit';
import categoryReducer from './slices/categorySlice';
import cartReducer from './slices/cartSlice';

export const store = configureStore({
  reducer: {
    category: categoryReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
