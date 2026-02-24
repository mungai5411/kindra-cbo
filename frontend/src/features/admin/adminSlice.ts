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
            const response = await apiClient.get('/reporting/activity/events/');
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

export const fetchPeriodicTasks = createAsyncThunk(
    'admin/fetchPeriodicTasks',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/reporting/celery/tasks/');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch periodic tasks');
        }
    }
);

export const fetchTaskResults = createAsyncThunk(
    'admin/fetchTaskResults',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/reporting/celery/results/');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch task results');
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

export const fetchBugReports = createAsyncThunk(
    'admin/fetchBugReports',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/accounts/bug-reports/');
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch bug reports');
        }
    }
);

export const updateBugReport = createAsyncThunk(
    'admin/updateBugReport',
    async ({ id, data }: { id: string, data: any }, { rejectWithValue }) => {
        try {
            const response = await apiClient.patch(`/accounts/bug-reports/${id}/`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update bug report');
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
    bugReports: any[];
    periodicTasks: any[];
    taskResults: any[];
}

const initialState: AdminState = {
    users: [],
    pendingUsers: [],
    isLoading: false,
    error: null,
    lastCleanupResults: null,
    auditLogs: [],
    bugReports: [],
    periodicTasks: [],
    taskResults: [],
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
            })
            .addCase(fetchPeriodicTasks.fulfilled, (state, action) => {
                state.periodicTasks = action.payload;
            })
            .addCase(fetchTaskResults.fulfilled, (state, action) => {
                state.taskResults = action.payload;
            })
            .addCase(fetchBugReports.fulfilled, (state, action) => {
                state.bugReports = action.payload;
            })
            .addCase(updateBugReport.fulfilled, (state, action) => {
                const index = state.bugReports.findIndex(b => b.id === action.payload.id);
                if (index !== -1) {
                    state.bugReports[index] = action.payload;
                }
            });
    },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
