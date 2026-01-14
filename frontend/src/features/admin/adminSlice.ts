import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

export const fetchUsers = createAsyncThunk(
    'admin/fetchUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/accounts/users/');
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'admin/deleteUser',
    async (userId: string, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/accounts/users/${userId}/`);
            return userId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || error.response?.data?.message || 'Failed to delete user');
        }
    }
);

export const triggerInactivityCleanup = createAsyncThunk(
    'admin/triggerInactivityCleanup',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/accounts/admin/cleanup-inactivity/');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to trigger cleanup');
        }
    }
);

export const fetchAuditLogs = createAsyncThunk(
    'admin/fetchAuditLogs',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/reporting/analytics/events/');
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch audit logs');
        }
    }
);

export const fetchPendingUsers = createAsyncThunk(
    'admin/fetchPendingUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/accounts/admin/pending-approvals/');
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending users');
        }
    }
);

export const approveUser = createAsyncThunk(
    'admin/approveUser',
    async (userId: string, { rejectWithValue }) => {
        try {
            await apiClient.post(`/accounts/admin/approve-user/${userId}/`);
            return userId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to approve user');
        }
    }
);

interface AdminState {
    users: any[];
    pendingUsers: any[];
    isLoading: boolean;
    error: string | null;
    lastCleanupResults: any | null;
    auditLogs: any[];
}

const initialState: AdminState = {
    users: [],
    pendingUsers: [],
    isLoading: false,
    error: null,
    lastCleanupResults: null,
    auditLogs: [],
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        clearAdminError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = state.users.filter(u => u.id !== action.payload);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(triggerInactivityCleanup.fulfilled, (state, action) => {
                state.lastCleanupResults = action.payload;
            })
            .addCase(fetchAuditLogs.fulfilled, (state, action) => {
                state.auditLogs = action.payload;
            })
            .addCase(fetchPendingUsers.fulfilled, (state, action) => {
                state.pendingUsers = action.payload;
            })
            .addCase(approveUser.fulfilled, (state, action) => {
                state.pendingUsers = state.pendingUsers.filter(u => u.id !== action.payload);
            });
    },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
