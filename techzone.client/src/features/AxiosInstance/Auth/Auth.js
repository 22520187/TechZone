import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../AxiosInstance";
import { jwtDecode } from "jwt-decode";
import {
    setAuthCookies,
    getAuthCookies,
    clearAuthCookies,
} from "../Cookies/CookiesHelper";

// API endpoint
const API_URL = "/api/Account";
const authCookies = getAuthCookies();

// Thunk để xử lý đăng ký
export const register = createAsyncThunk(
    "Auth/Register",
    async (credentials, thunkAPI) => {
        try {
            const response = await api.post(`${API_URL}/register`, credentials); // Gọi API register
            return response.data; // Trả về dữ liệu từ server
        } catch (error) {
            console.error("Register error:", error);
            return thunkAPI.rejectWithValue(
                error.response?.data || "Có lỗi xảy ra khi đăng ký"
            );
        }
    }
);

// Thunk để xử lý đăng nhập
export const login = createAsyncThunk(
    "Auth/Login",
    async (credentials, thunkAPI) => {
        try {
            const response = await api.post(`${API_URL}/login`, credentials); // Gọi API login
            // console.log(response.data);
            const { jwtToken } = response.data;

            // Decode token để lấy userId và userRole
            const decodedToken = jwtDecode(jwtToken);
            const userId = decodedToken.sub;
            const userRole =
                decodedToken[
                    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
                ];

            // Lưu vào cookies
            setAuthCookies(userId, jwtToken, userRole);
            // Gọi action fetchCartDetailsByCustomerId sau khi login thành công
            // thunkAPI.dispatch(fetchCartDetailsByCustomerId(userId));

            return { userId, userRole, token: jwtToken }; // Trả về dữ liệu đã xử lý
        } catch (error) {
            // Add more detailed error logging
            console.error("Login error:", error);
            return thunkAPI.rejectWithValue(
                error.response?.data || "Có lỗi xảy ra"
            );
        }
    }
);

// Slice quản lý trạng thái auth
const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: authCookies.userID || null,
        token: authCookies.token || null,
        userRole: authCookies.userRole || null,
        isAuthenticated: !!authCookies.token,
        status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.userRole = null;
            state.isAuthenticated = false;
            state.status = "idle";
            state.error = null;
            clearAuthCookies(); // Xóa cookies khi logout
        },
        resetStatus: (state) => {
            state.status = "idle";
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(register.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(register.fulfilled, (state) => {
                state.status = "succeeded";
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(login.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload.userId;
                state.token = action.payload.token;
                state.userRole = action.payload.userRole;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

// Export các action và reducer
export const { logout, resetStatus } = authSlice.actions;
export default authSlice.reducer;
