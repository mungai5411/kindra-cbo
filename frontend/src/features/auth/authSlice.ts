/**
 * Authentication Redux Slice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient, { endpoints } from '../../api/client';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    is_staff: boolean;
    is_superuser: boolean;
    is_approved: boolean;
    profile_picture?: string;
    donorId?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: !!localStorage.getItem('accessToken'),
    isLoading: false,
    error: null,
};

// Async thunks
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.auth.login, credentials);
            const { tokens, user } = response.data;
            const { access, refresh } = tokens;

            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);

            // Normalize user data
            const normalizedUser = {
                ...user,
                firstName: user.first_name || user.firstName,
                lastName: user.last_name || user.lastName,
                role: (user.role || 'DONOR').toUpperCase(),
            };

            return { access, refresh, user: normalizedUser };
        } catch (error: any) {
            const data = error.response?.data;
            let message = 'Login failed';
            if (data) {
                if (typeof data === 'string') message = data;
                else if (data.error) message = data.error;
                else if (data.message) message = data.message;
                else if (data.detail) message = data.detail;
                // Handle field-specific validation errors deeply
                else {
                    const errors = Object.values(data).flat();
                    message = errors.map(err => typeof err === 'string' ? err : JSON.stringify(err)).join(' ');
                }
            }
            return rejectWithValue(message);
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (userData: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.auth.register, userData);
            const { tokens, user } = response.data;
            const { access, refresh } = tokens;

            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);

            // Normalize user data
            const normalizedUser = {
                ...user,
                firstName: user.first_name || user.firstName,
                lastName: user.last_name || user.lastName,
                role: (user.role || 'DONOR').toUpperCase(),
            };

            return { access, refresh, user: normalizedUser };
        } catch (error: any) {
            const data = error.response?.data;
            let message = 'Registration failed';
            if (data) {
                if (typeof data === 'string') message = data;
                else if (data.error) message = data.error;
                else if (data.message) message = data.message;
                else if (data.detail) message = data.detail;
                else {
                    const errors = Object.values(data).flat();
                    message = errors.map(err => typeof err === 'string' ? err : JSON.stringify(err)).join(' ');
                }
            }
            return rejectWithValue(message);
        }
    }
);

export const logout = createAsyncThunk('auth/logout', async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
});

export const fetchProfile = createAsyncThunk(
    'auth/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.auth.profile);
            const user = response.data;
            // Normalize user data
            return {
                ...user,
                firstName: user.first_name || user.firstName,
                lastName: user.last_name || user.lastName,
                role: (user.role || 'DONOR').toUpperCase(),
            };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
        }
    }
);

export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (data: any, { rejectWithValue, getState, dispatch }) => {
        try {
            const { auth } = getState() as any;
            const currentUser = auth.user;

            // Check if we have a file upload
            const hasFileUpload = data.profile_picture instanceof File;

            let response;

            if (hasFileUpload) {
                // Use FormData for file upload
                const formData = new FormData();
                if (data.firstName) formData.append('first_name', data.firstName);
                if (data.lastName) formData.append('last_name', data.lastName);
                if (data.email) formData.append('email', data.email);
                if (data.phone_number) formData.append('phone_number', data.phone_number);
                if (data.profile_picture) formData.append('profile_picture', data.profile_picture);

                response = await apiClient.patch(endpoints.auth.profile, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                // Regular JSON update (no file)
                const backendData: any = { ...data };
                if (data.firstName) {
                    backendData.first_name = data.firstName;
                    delete backendData.firstName;
                }
                if (data.lastName) {
                    backendData.last_name = data.lastName;
                    delete backendData.lastName;
                }
                if (data.phone) {
                    backendData.phone_number = data.phone;
                    delete backendData.phone;
                }
                // Remove profile_picture if it's not a file (to avoid sending old URL)
                delete backendData.profile_picture;

                response = await apiClient.patch(endpoints.auth.profile, backendData);
            }

            const user = response.data;

            // Normalize user data
            const normalizedUser = {
                ...user,
                firstName: user.first_name || user.firstName,
                lastName: user.last_name || user.lastName,
                // Preserve existing role if backend doesn't return it, otherwise default to DONOR
                role: (user.role || currentUser?.role || 'DONOR').toUpperCase(),
                // Preserve profile_picture from response
                profile_picture: user.profile_picture,
                phone_number: user.phone_number,
            };

            // Sync localStorage
            localStorage.setItem('user', JSON.stringify(normalizedUser));

            // Force refresh to get latest data from server
            setTimeout(() => {
                (dispatch as any)(fetchProfile());
            }, 500);

            return normalizedUser;
        } catch (error: any) {
            let message = 'Failed to update profile';
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    message = error.response.data;
                } else if (error.response.data.message) {
                    message = error.response.data.message;
                } else if (error.response.data.detail) {
                    message = error.response.data.detail;
                } else {
                    // Extract first error message from field-specific errors
                    const firstKey = Object.keys(error.response.data)[0];
                    if (firstKey) {
                        const errorVal = error.response.data[firstKey];
                        message = Array.isArray(errorVal) ? `${firstKey}: ${errorVal[0]}` : `${firstKey}: ${errorVal}`;
                    }
                }
            }
            return rejectWithValue(message);
        }
    }
);

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = {
                    ...state.user,
                    ...action.payload
                };
                // Persist to localStorage
                localStorage.setItem('user', JSON.stringify(state.user));
            }
        },
    },
    extraReducers: (builder) => {
        // Login
        builder.addCase(login.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.accessToken = action.payload.access;
            state.refreshToken = action.payload.refresh;
            state.user = normalizeUser(action.payload.user);
            // Persist user to localStorage
            localStorage.setItem('user', JSON.stringify(state.user));
        });
        builder.addCase(login.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Register
        builder.addCase(register.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(register.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.accessToken = action.payload.access;
            state.refreshToken = action.payload.refresh;
            state.user = normalizeUser(action.payload.user);
            localStorage.setItem('user', JSON.stringify(state.user));
        });
        builder.addCase(register.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Logout
        builder.addCase(logout.fulfilled, (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
        });

        // Fetch Profile
        builder.addCase(fetchProfile.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchProfile.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            state.user = normalizeUser(action.payload);
            localStorage.setItem('user', JSON.stringify(state.user));
        });
        builder.addCase(fetchProfile.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Update Profile
        builder.addCase(updateProfile.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(updateProfile.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            state.user = normalizeUser(action.payload);
            sessionStorage.setItem('user', JSON.stringify(state.user));
        });
        builder.addCase(updateProfile.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });
    },
});

const normalizeUser = (user: any): User => {
    if (!user) return user;
    const normalized = { ...user };
    if (user.first_name) normalized.firstName = user.first_name;
    if (user.last_name) normalized.lastName = user.last_name;
    if ((!normalized.firstName || !normalized.lastName) && user.full_name && typeof user.full_name === 'string') {
        const parts = user.full_name.trim().split(/\s+/).filter(Boolean);
        if (!normalized.firstName && parts.length > 0) normalized.firstName = parts[0];
        if (!normalized.lastName && parts.length > 1) normalized.lastName = parts.slice(1).join(' ');
    }
    if (user.donor_id) normalized.donorId = user.donor_id;
    // Preserve profile_picture (critical for cross-browser sync)
    if (user.profile_picture !== undefined) normalized.profile_picture = user.profile_picture;
    // Preserve phone_number
    if (user.phone_number !== undefined) normalized.phone_number = user.phone_number;
    // Set is_approved (default to true if not present, though backend should provide it)
    normalized.is_approved = user.is_approved !== undefined ? user.is_approved : true;
    return normalized;
};

export const { clearError, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;
