import axios from "axios";
import {
  getAuthCookies,  // ✅ Sửa tên và path
  clearAuthCookies,
} from "./Cookies/CookiesHelper";  // ✅ Sửa path

const productURL = "https://nextgentech-73nf.onrender.com";
const developmentURL = "http://localhost:5288";

const baseURL =
    process.env.NODE_ENV === "production" ? productURL : developmentURL;

const instance = axios.create({
    baseURL: baseURL,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json; charset=utf-8",
    },
});

// Interceptor cho requests
instance.interceptors.request.use(
    (config) => {
        const authCookies = getAuthCookies();  // ✅ Sửa tên function
        if (authCookies.token) {  // ✅ Kiểm tra token
          config.headers["Authorization"] = `Bearer ${authCookies.token}`;  // ✅ Sửa property name
        }

        // Đảm bảo signal được truyền qua nếu có
        if (config.signal) {
            config.signal.addEventListener("abort", () => {
                // Có thể thêm logic cleanup nếu cần
            });
        }

        return config;
    },
    (error) => {
        console.error("Request error:", error);
        return Promise.reject(error);
    }
);

// Interceptor cho responses
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isCancel(error)) {
            const cancelError = new Error("Request was cancelled");
            cancelError.name = "AbortError";
            return Promise.reject(cancelError);
        }

        if (error.response) {
            error.customData = error.response.data;
        }
        return Promise.reject(error);
    }
);

export default instance;

export const createCancellableRequest = (requestFn) => {
    const controller = new AbortController();
    const promise = requestFn(controller.signal);
    return {
        promise,
        controller,
    };
};