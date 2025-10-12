import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/AxiosInstance/Auth/Auth";
import productReducer from "@/features/Admin/Products/Product";
import categoryReducer from "./features/Admin/Categories/Category";


export const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        category: categoryReducer,
    },
});
