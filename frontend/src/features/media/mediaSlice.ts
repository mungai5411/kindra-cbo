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
            .addCase(uploadMedia.fulfilled, (state, action: PayloadAction<MediaAsset>) => {
                state.assets.unshift(action.payload);
            })
            .addCase(deleteMedia.fulfilled, (state, action: PayloadAction<string>) => {
                state.assets = state.assets.filter(asset => asset.id !== action.payload);
            });
    },
});

export default mediaSlice.reducer;
