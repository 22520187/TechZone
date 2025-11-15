import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/AxiosInstance/Auth/Auth';
import cartReducer from './slices/cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
});
