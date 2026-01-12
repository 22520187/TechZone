import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/AxiosInstance/Auth/Auth";
import productReducer from "@/features/Admin/Products/Product";
import categoryReducer from "@/features/Admin/Categories/Category";
import userReducer from "@/features/Admin/Users/User";
import brandReducer from "@/features/Admin/Brands/Brand";
import promotionReducer from "@/features/Admin/Promotions/Promotion";
import cartReducer from "@/features/Cart/Cart";
import chatbotReducer from "@/features/Chatbot/Chatbot";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        category: categoryReducer,
        user: userReducer,
        brand: brandReducer,
        promotion: promotionReducer,
        cart: cartReducer,
        chatbot: chatbotReducer,
    },
});
