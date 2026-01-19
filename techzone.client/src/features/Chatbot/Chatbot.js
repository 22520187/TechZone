import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../AxiosInstance/AxiosInstance";
import { getAuthCookies } from "../AxiosInstance/Cookies/CookiesHelper";

const apiBaseUrl = "/api/Chatbot";

// Save chat message
export const saveChatMessage = createAsyncThunk(
    "chatbot/saveMessage",
    async ({ message, response, messageType = "user" }, { rejectWithValue }) => {
        try {
            const authCookies = getAuthCookies();
            const userId = authCookies.userID ? parseInt(authCookies.userID) : null;

            const response_data = await api.post(`${apiBaseUrl}/SaveMessage`, {
                userId: userId,
                message: message,
                response: response,
                messageType: messageType
            });
            return response_data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || "Error saving chat message"
            );
        }
    }
);

// Get chat history
export const getChatHistory = createAsyncThunk(
    "chatbot/getChatHistory",
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.get(`${apiBaseUrl}/GetChatHistory/${userId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || "Error fetching chat history"
            );
        }
    }
);

// Get recent chat history
export const getRecentChatHistory = createAsyncThunk(
    "chatbot/getRecentChatHistory",
    async ({ userId, limit = 50 }, { rejectWithValue }) => {
        try {
            const response = await api.get(`${apiBaseUrl}/GetRecentChatHistory/${userId}?limit=${limit}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || "Error fetching recent chat history"
            );
        }
    }
);

// Delete chat history
export const deleteChatHistory = createAsyncThunk(
    "chatbot/deleteChatHistory",
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.delete(`${apiBaseUrl}/DeleteChatHistory/${userId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || "Error deleting chat history"
            );
        }
    }
);

// Chat with Gemini AI
export const chatWithGemini = createAsyncThunk(
    "chatbot/chatWithGemini",
    async ({ message, userId = null, historyLimit = 5 }, { rejectWithValue }) => {
        try {
            const response = await api.post(`${apiBaseUrl}/Chat`, {
                message: message,
                userId: userId,
                historyLimit: historyLimit
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || "Error communicating with AI"
            );
        }
    }
);

const initialState = {
    chatHistory: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

const chatbotSlice = createSlice({
    name: "chatbot",
    initialState,
    reducers: {
        clearChatHistory: (state) => {
            state.chatHistory = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Save message
            .addCase(saveChatMessage.pending, (state) => {
                state.status = "loading";
            })
            .addCase(saveChatMessage.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.chatHistory.push(action.payload);
            })
            .addCase(saveChatMessage.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Get chat history
            .addCase(getChatHistory.pending, (state) => {
                state.status = "loading";
            })
            .addCase(getChatHistory.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.chatHistory = action.payload;
            })
            .addCase(getChatHistory.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Get recent chat history
            .addCase(getRecentChatHistory.pending, (state) => {
                state.status = "loading";
            })
            .addCase(getRecentChatHistory.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.chatHistory = action.payload;
            })
            .addCase(getRecentChatHistory.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Delete chat history
            .addCase(deleteChatHistory.pending, (state) => {
                state.status = "loading";
            })
            .addCase(deleteChatHistory.fulfilled, (state) => {
                state.status = "succeeded";
                state.chatHistory = [];
            })
            .addCase(deleteChatHistory.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Chat with Gemini
            .addCase(chatWithGemini.pending, (state) => {
                state.status = "loading";
            })
            .addCase(chatWithGemini.fulfilled, (state, action) => {
                state.status = "succeeded";
            })
            .addCase(chatWithGemini.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export const { clearChatHistory } = chatbotSlice.actions;
export default chatbotSlice.reducer;
