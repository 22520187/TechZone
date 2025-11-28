import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/AxiosInstance/Auth/Auth";
import productReducer from "@/features/Admin/Products/Product";
import categoryReducer from "@/features/Admin/Categories/Category";
import userReducer from "@/features/Admin/Users/User";
import cartReducer from "@/features/Cart/Cart";
import chatbotReducer from "@/features/Chatbot/Chatbot";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        category: categoryReducer,
        user: userReducer,
        cart: cartReducer,
        chatbot: chatbotReducer,
    },
});
