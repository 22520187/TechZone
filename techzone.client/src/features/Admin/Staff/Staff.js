import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../AxiosInstance/AxiosInstance";

const apiBaseUrl = "/api/Staff";

export const fetchAllStaff = createAsyncThunk(
    "staff/fetchAllStaff",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`${apiBaseUrl}/GetAllStaffs`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || "Something went wrong"
            );
        }
    }
);

export const addStaff = createAsyncThunk(
    "staff/addStaff",
    async (staffData, { rejectWithValue }) => {
        try {
            const response = await api.post(`${apiBaseUrl}/AddStaff`, staffData);
            return response.data;
        } catch (error) {
            console.error("Error in addStaff thunk:", error);

            let errorMessage = "Unable to add staff member";

            if (
                error.response &&
                error.response.data &&
                error.response.data.message &&
                error.response.data.message.includes("Email already exists")
            ) {
                errorMessage = "Email already exists";
            }

            return rejectWithValue(errorMessage);
        }
    }
);

export const updateStaff = createAsyncThunk(
    "staff/updateStaff",
    async (staffData, { rejectWithValue }) => {
        try {
            const response = await api.put(
                `${apiBaseUrl}/UpdateStaff/${staffData.userId}`,
                staffData
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || "Something went wrong"
            );
        }
    }
);

export const deleteStaff = createAsyncThunk(
    "staff/deleteStaff",
    async (staffId, { rejectWithValue }) => {
        try {
            const response = await api.delete(
                `${apiBaseUrl}/DeleteStaff/${staffId}`
            );
            return response.data;
        } catch (error) {
            console.error("Error in deleteStaff thunk:", error);

            let errorMessage = "Unable to delete staff member";

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data) {
                errorMessage = typeof error.response.data === "string" 
                    ? error.response.data 
                    : "Something went wrong";
            }

            return rejectWithValue(errorMessage);
        }
    }
);

const initialState = {
    staffItems: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

const staffSlice = createSlice({
    name: "staff",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllStaff.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchAllStaff.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.staffItems = action.payload;
            })
            .addCase(fetchAllStaff.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(addStaff.pending, (state) => {
                state.status = "loading";
            })
            .addCase(addStaff.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.staffItems.push(action.payload);
            })
            .addCase(addStaff.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(updateStaff.pending, (state) => {
                state.status = "loading";
            })
            .addCase(updateStaff.fulfilled, (state, action) => {
                state.status = "succeeded";
                const index = state.staffItems.findIndex(
                    (staff) => staff.userId === action.payload.userId
                );
                if (index !== -1) {
                    state.staffItems[index] = action.payload;
                }
            })
            .addCase(updateStaff.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(deleteStaff.pending, (state) => {
                state.status = "loading";
            })
            .addCase(deleteStaff.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.staffItems = state.staffItems.filter(
                    (staff) => staff.userId !== action.payload.userId
                );
            })
            .addCase(deleteStaff.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export default staffSlice.reducer;
