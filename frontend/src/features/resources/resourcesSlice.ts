/**
 * Resources Redux Slice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient, { endpoints } from '../../api/client';

export const fetchResources = createAsyncThunk(
    'resources/fetchResources',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.shelters.resources);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch resources');
        }
    }
);

export const addResource = createAsyncThunk(
    'resources/addResource',
    async (resourceData: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.shelters.resources, resourceData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add resource');
        }
    }
);

export const updateResource = createAsyncThunk(
    'resources/updateResource',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await apiClient.patch(`${endpoints.shelters.resources}${id}/`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update resource');
        }
    }
);

export const deleteResource = createAsyncThunk(
    'resources/deleteResource',
    async (id: string, { rejectWithValue }) => {
        try {
            await apiClient.delete(`${endpoints.shelters.resources}${id}/`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete resource');
        }
    }
);

export const fetchResourceRequests = createAsyncThunk(
    'resources/fetchResourceRequests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.shelters.requests);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch resource requests');
        }
    }
);

export const addResourceRequest = createAsyncThunk(
    'resources/addResourceRequest',
    async (requestData: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.shelters.requests, requestData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to submit request');
        }
    }
);

export const updateResourceRequest = createAsyncThunk(
    'resources/updateResourceRequest',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await apiClient.patch(`${endpoints.shelters.requests}${id}/`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update request');
        }
    }
);

interface ResourcesState {
    resources: any[];
    resourceRequests: any[];
    isLoading: boolean;
    error: string | null;
}

const initialState: ResourcesState = {
    resources: [],
    resourceRequests: [],
    isLoading: false,
    error: null,
};

const resourcesSlice = createSlice({
    name: 'resources',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Fetch Resources
        builder.addCase(fetchResources.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchResources.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.isLoading = false;
            state.resources = Array.isArray(action.payload) ? action.payload : [];
        });
        builder.addCase(fetchResources.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Add Resource
        builder.addCase(addResource.fulfilled, (state, action) => {
            state.resources.unshift(action.payload);
        });

        // Update Resource
        builder.addCase(updateResource.fulfilled, (state, action) => {
            const index = state.resources.findIndex(r => r.id === action.payload.id);
            if (index !== -1) {
                state.resources[index] = action.payload;
            }
        });

        // Delete Resource
        builder.addCase(deleteResource.fulfilled, (state, action) => {
            state.resources = state.resources.filter(r => r.id !== action.payload);
        });

        // Fetch Resource Requests
        builder.addCase(fetchResourceRequests.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.resourceRequests = Array.isArray(action.payload) ? action.payload : [];
        });

        // Add Resource Request
        builder.addCase(addResourceRequest.fulfilled, (state, action) => {
            state.resourceRequests.unshift(action.payload);
        });

        // Update Resource Request
        builder.addCase(updateResourceRequest.fulfilled, (state, action) => {
            const index = state.resourceRequests.findIndex(r => r.id === action.payload.id);
            if (index !== -1) {
                state.resourceRequests[index] = action.payload;
            }
        });
    },
});

export default resourcesSlice.reducer;
