/**
 * Reporting Redux Slice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient, { endpoints } from '../../api/client';

export const fetchDashboardData = createAsyncThunk(
    'reporting/fetchDashboardData',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.reports.dashboard);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
        }
    }
);

export const fetchPublicStats = createAsyncThunk(
    'reporting/fetchPublicStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/reporting/public-stats/');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch public stats');
        }
    }
);

export const fetchReports = createAsyncThunk(
    'reporting/fetchReports',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.reports.reports);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch reports');
        }
    }
);

export const generateReport = createAsyncThunk(
    'reporting/generateReport',
    async (reportData: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.reports.reports, reportData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to generate report');
        }
    }
);

interface ReportingState {
    dashboardData: any | null;
    reports: any[];
    isLoading: boolean;
    error: string | null;
}

const initialState: ReportingState = {
    dashboardData: null,
    reports: [],
    isLoading: false,
    error: null,
};

const reportingSlice = createSlice({
    name: 'reporting',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Fetch Dashboard Data
        builder.addCase(fetchDashboardData.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchPublicStats.fulfilled, (state, action: PayloadAction<any>) => {
            state.dashboardData = { ...(state.dashboardData || {}), public: action.payload };
        });
        builder.addCase(fetchDashboardData.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            state.dashboardData = action.payload;
        });
        builder.addCase(fetchDashboardData.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Fetch Reports
        builder.addCase(fetchReports.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.reports = Array.isArray(action.payload) ? action.payload : [];
        });

        // Generate Report
        builder.addCase(generateReport.fulfilled, (state, action) => {
            state.reports.unshift(action.payload);
        });
    },
});

export default reportingSlice.reducer;
