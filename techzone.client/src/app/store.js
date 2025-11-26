import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/AxiosInstance/Auth/Auth';
import cartReducer from './slices/cartSlice';
import chatbotReducer from '../features/Chatbot/Chatbot';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    chatbot: chatbotReducer,
  },
});
