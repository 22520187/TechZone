import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/AxiosInstance/Auth/Auth";
import productReducer from "@/features/Admin/Products/Product";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
    },
});
