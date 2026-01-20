import axios from "axios";
import {
  getAuthCookies,  // ✅ Sửa tên và path
  clearAuthCookies,
} from "./Cookies/CookiesHelper";  // ✅ Sửa path

const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
const baseURL =
  import.meta.env.MODE === "production"
    ? (envBaseUrl || "")
    : (envBaseUrl || "http://localhost:5288");

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
        const authCookies = getAuthCookies();  
        if (authCookies.token) { 
          config.headers["Authorization"] = `Bearer ${authCookies.token}`; 
        }

        // Đảm bảo signal được truyền qua nếu có
        if (config.signal) {
            config.signal.addEventListener("abort", () => {
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