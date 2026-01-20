import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../AxiosInstance/AxiosInstance";

const apiBaseUrl = "/api/BlogPost";

// Fetch all blog posts (Admin/Staff)
export const fetchAllBlogPosts = createAsyncThunk(
    "blog/fetchAllBlogPosts",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`${apiBaseUrl}/GetAllBlogPosts`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || "Something went wrong"
            );
        }
    }
);

// Fetch published blog posts (Public)
export const fetchPublishedBlogPosts = createAsyncThunk(
    "blog/fetchPublishedBlogPosts",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`${apiBaseUrl}/GetPublishedBlogPosts`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || "Something went wrong"
            );
        }
    }
);

// Fetch blog post by ID
export const fetchBlogPostById = createAsyncThunk(
    "blog/fetchBlogPostById",
    async (blogPostId, { rejectWithValue }) => {
        try {
            const response = await api.get(`${apiBaseUrl}/GetBlogPostById/${blogPostId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || "Something went wrong"
            );
        }
    }
);

// Add new blog post
export const addBlogPost = createAsyncThunk(
    "blog/addBlogPost",
    async (blogPostData, { rejectWithValue }) => {
        try {
            const response = await api.post(`${apiBaseUrl}/AddBlogPost`, blogPostData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || "Something went wrong"
            );
        }
    }
);

// Update blog post
export const updateBlogPost = createAsyncThunk(
    "blog/updateBlogPost",
    async ({ blogPostId, blogPostData }, { rejectWithValue }) => {
        try {
            const response = await api.put(
                `${apiBaseUrl}/UpdateBlogPost/${blogPostId}`,
                blogPostData
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || "Something went wrong"
            );
        }
    }
);

// Delete blog post
export const deleteBlogPost = createAsyncThunk(
    "blog/deleteBlogPost",
    async (blogPostId, { rejectWithValue }) => {
        try {
            await api.delete(`${apiBaseUrl}/DeleteBlogPost/${blogPostId}`);
            return blogPostId;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || "Something went wrong"
            );
        }
    }
);

const initialState = {
    blogPosts: [],
    currentBlogPost: null,
    status: "idle",
    error: null,
};

const blogSlice = createSlice({
    name: "blog",
    initialState,
    reducers: {
        clearCurrentBlogPost: (state) => {
            state.currentBlogPost = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all blog posts
            .addCase(fetchAllBlogPosts.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchAllBlogPosts.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.blogPosts = action.payload;
            })
            .addCase(fetchAllBlogPosts.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Fetch published blog posts
            .addCase(fetchPublishedBlogPosts.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchPublishedBlogPosts.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.blogPosts = action.payload;
            })
            .addCase(fetchPublishedBlogPosts.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Fetch blog post by ID
            .addCase(fetchBlogPostById.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchBlogPostById.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.currentBlogPost = action.payload;
            })
            .addCase(fetchBlogPostById.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Add blog post
            .addCase(addBlogPost.pending, (state) => {
                state.status = "loading";
            })
            .addCase(addBlogPost.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.blogPosts.unshift(action.payload);
            })
            .addCase(addBlogPost.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Update blog post
            .addCase(updateBlogPost.pending, (state) => {
                state.status = "loading";
            })
            .addCase(updateBlogPost.fulfilled, (state, action) => {
                state.status = "succeeded";
                const index = state.blogPosts.findIndex(
                    (post) => post.blogPostId === action.payload.blogPostId
                );
                if (index !== -1) {
                    state.blogPosts[index] = action.payload;
                }
            })
            .addCase(updateBlogPost.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Delete blog post
            .addCase(deleteBlogPost.pending, (state) => {
                state.status = "loading";
            })
            .addCase(deleteBlogPost.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.blogPosts = state.blogPosts.filter(
                    (post) => post.blogPostId !== action.payload
                );
            })
            .addCase(deleteBlogPost.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export const { clearCurrentBlogPost } = blogSlice.actions;
export default blogSlice.reducer;
