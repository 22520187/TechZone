import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../AxiosInstance/AxiosInstance";

const apiBaseUrl = "/api/Dashboard";

// Fetch dashboard statistics
export const fetchDashboardStatistics = createAsyncThunk(
    "dashboard/fetchStatistics",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`${apiBaseUrl}/statistics`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to fetch statistics");
        }
    }
);

// Fetch sales chart data
export const fetchSalesChart = createAsyncThunk(
    "dashboard/fetchSalesChart",
    async (days = 30, { rejectWithValue }) => {
        try {
            const response = await api.get(`${apiBaseUrl}/sales-chart?days=${days}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to fetch sales chart");
        }
    }
);

// Fetch recent orders
export const fetchRecentOrders = createAsyncThunk(
    "dashboard/fetchRecentOrders",
    async (limit = 10, { rejectWithValue }) => {
        try {
            const response = await api.get(`${apiBaseUrl}/recent-orders?limit=${limit}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to fetch recent orders");
        }
    }
);

// Fetch inventory report
export const fetchInventoryReport = createAsyncThunk(
    "dashboard/fetchInventoryReport",
    async ({ category = null, search = null } = {}, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (category) params.append('category', category);
            if (search) params.append('search', search);
            
            const response = await api.get(`${apiBaseUrl}/inventory-report?${params.toString()}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to fetch inventory report");
        }
    }
);

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState: {
        statistics: null,
        salesChart: null,
        recentOrders: [],
        inventoryReport: null,
        loading: {
            statistics: false,
            salesChart: false,
            recentOrders: false,
            inventoryReport: false,
        },
        error: {
            statistics: null,
            salesChart: null,
            recentOrders: null,
            inventoryReport: null,
        },
    },
    reducers: {
        clearDashboardErrors: (state) => {
            state.error = {
                statistics: null,
                salesChart: null,
                recentOrders: null,
                inventoryReport: null,
            };
        },
    },
    extraReducers: (builder) => {
        // Fetch Statistics
        builder
            .addCase(fetchDashboardStatistics.pending, (state) => {
                state.loading.statistics = true;
                state.error.statistics = null;
            })
            .addCase(fetchDashboardStatistics.fulfilled, (state, action) => {
                state.loading.statistics = false;
                state.statistics = action.payload;
            })
            .addCase(fetchDashboardStatistics.rejected, (state, action) => {
                state.loading.statistics = false;
                state.error.statistics = action.payload;
            });

        // Fetch Sales Chart
        builder
            .addCase(fetchSalesChart.pending, (state) => {
                state.loading.salesChart = true;
                state.error.salesChart = null;
            })
            .addCase(fetchSalesChart.fulfilled, (state, action) => {
                state.loading.salesChart = false;
                state.salesChart = action.payload;
            })
            .addCase(fetchSalesChart.rejected, (state, action) => {
                state.loading.salesChart = false;
                state.error.salesChart = action.payload;
            });

        // Fetch Recent Orders
        builder
            .addCase(fetchRecentOrders.pending, (state) => {
                state.loading.recentOrders = true;
                state.error.recentOrders = null;
            })
            .addCase(fetchRecentOrders.fulfilled, (state, action) => {
                state.loading.recentOrders = false;
                state.recentOrders = action.payload;
            })
            .addCase(fetchRecentOrders.rejected, (state, action) => {
                state.loading.recentOrders = false;
                state.error.recentOrders = action.payload;
            });

        // Fetch Inventory Report
        builder
            .addCase(fetchInventoryReport.pending, (state) => {
                state.loading.inventoryReport = true;
                state.error.inventoryReport = null;
            })
            .addCase(fetchInventoryReport.fulfilled, (state, action) => {
                state.loading.inventoryReport = false;
                state.inventoryReport = action.payload;
            })
            .addCase(fetchInventoryReport.rejected, (state, action) => {
                state.loading.inventoryReport = false;
                state.error.inventoryReport = action.payload;
            });
    },
});

export const { clearDashboardErrors } = dashboardSlice.actions;
export default dashboardSlice.reducer;
