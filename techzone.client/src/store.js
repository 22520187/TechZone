import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/AxiosInstance/Auth/Auth";
import productReducer from "@/features/Admin/Products/Product";
import categoryReducer from "@/features/Admin/Categories/Category";
import userReducer from "@/features/Admin/Users/User";
import staffReducer from "@/features/Admin/Staff/Staff";
import brandReducer from "@/features/Admin/Brands/Brand";
import promotionReducer from "@/features/Admin/Promotions/Promotion";
import cartReducer from "@/features/Cart/Cart";
import chatbotReducer from "@/features/Chatbot/Chatbot";
import dashboardReducer from "@/features/Admin/Dashboard/Dashboard";
import blogReducer from "@/features/Admin/Blog/Blog";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        category: categoryReducer,
        user: userReducer,
        staff: staffReducer,
        brand: brandReducer,
        promotion: promotionReducer,
        cart: cartReducer,
        chatbot: chatbotReducer,
        dashboard: dashboardReducer,
        blog: blogReducer,
    },
});
