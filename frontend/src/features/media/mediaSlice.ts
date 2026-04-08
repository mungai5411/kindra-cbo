import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient, { endpoints } from '../../api/client';

export interface MediaAsset {
    id: string;
    title: string;
    file: string;
    alt_text: string;
    shelter_name: string;
    source_type: string;
    source_id: string | null;
    uploaded_by: string;
    uploaded_by_name: string;
    file_name: string;
    file_size: number;
    created_at: string;
    updated_at: string;
}

interface MediaState {
    assets: MediaAsset[];
    isLoading: boolean;
    error: string | null;
    authChecked: boolean; // Prevent infinite retries on public pages
}

const initialState: MediaState = {
    assets: [],
    isLoading: false,
    error: null,
    authChecked: false,
};

export const fetchMedia = createAsyncThunk(
    'media/fetchMedia',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.blog.media);
            return response.data.results || response.data;
        } catch (error: any) {
            // If unauthorized (401), return empty array instead of error
            // This allows public pages to work without requiring login
            if (error.response?.status === 401) {
                return [];
            }
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch media');
        }
    }
);

// Separate thunk for public media (landing page gallery) - doesn't require auth
export const fetchPublicLandingPageMedia = createAsyncThunk(
    'media/fetchPublicLandingPageMedia',
    async (_, { rejectWithValue }) => {
        try {
            // Try to fetch media without Authorization header
            // The backend may allow public access to gallery images
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/blog/media/?source_type=SHELTER`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'omit' // Don't send credentials for public fetch
            });
            
            if (!response.ok) {
                // If fails, return empty array to avoid infinite loops
                return [];
            }
            
            const data = await response.json();
            return data.results || data;
        } catch (error) {
            // Network error, return empty array
            return [];
        }
    }
);

export const uploadMedia = createAsyncThunk(
    'media/uploadMedia',
    async (formData: FormData, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.blog.media, formData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to upload media');
        }
    }
);

export const deleteMedia = createAsyncThunk(
    'media/deleteMedia',
    async (id: string, { rejectWithValue }) => {
        try {
            await apiClient.delete(`${endpoints.blog.media}${id}/`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete media');
        }
    }
);

const mediaSlice = createSlice({
    name: 'media',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMedia.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMedia.fulfilled, (state, action: PayloadAction<MediaAsset[]>) => {
                state.isLoading = false;
                state.assets = action.payload;
                state.authChecked = true; // Mark that we've completed auth check
            })
            .addCase(fetchMedia.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.authChecked = true; // Mark that we've completed auth check (even if failed)
            })
            .addCase(fetchPublicLandingPageMedia.fulfilled, (state, action: PayloadAction<MediaAsset[]>) => {
                // For public pages, merge or replace with public media
                state.assets = action.payload;
                state.authChecked = true;
            })
            .addCase(fetchPublicLandingPageMedia.rejected, (state) => {
                // Public fetch failed, keep empty array
                state.authChecked = true;
            })
            .addCase(uploadMedia.fulfilled, (state, action: PayloadAction<MediaAsset>) => {
                state.assets.unshift(action.payload);
            })
            .addCase(deleteMedia.fulfilled, (state, action: PayloadAction<string>) => {
                state.assets = state.assets.filter(asset => asset.id !== action.payload);
            });
    },
});

export default mediaSlice.reducer;
