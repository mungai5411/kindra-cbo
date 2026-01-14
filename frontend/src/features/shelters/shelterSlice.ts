/**
 * Shelter Redux Slice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient, { endpoints } from '../../api/client';

export const fetchShelters = createAsyncThunk(
    'shelters/fetchShelters',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.shelters.shelters);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch shelters');
        }
    }
);

export const fetchPlacements = createAsyncThunk(
    'shelters/fetchPlacements',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.shelters.placements);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch placements');
        }
    }
);

export const fetchResources = createAsyncThunk(
    'shelters/fetchResources',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.shelters.resources);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch resources');
        }
    }
);

export const fetchStaff = createAsyncThunk(
    'shelters/fetchStaff',
    async (_, { rejectWithValue }) => {
        try {
            // Reusing volunteers endpoint or a specific staff endpoint if available
            const response = await apiClient.get(endpoints.volunteers.volunteers);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch shelter staff');
        }
    }
);

export const assignStaff = createAsyncThunk(
    'shelters/assignStaff',
    async (assignmentData: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.shelters.staff, assignmentData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to assign staff');
        }
    }
);

export const addPlacement = createAsyncThunk(
    'shelters/addPlacement',
    async (placementData: any, { rejectWithValue, dispatch }) => {
        try {
            const response = await apiClient.post(endpoints.shelters.placements, placementData);
            dispatch(fetchPlacements());
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to create placement');
        }
    }
);

export const transferStaff = createAsyncThunk(
    'shelters/transferStaff',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await apiClient.patch(`${endpoints.shelters.placements}${id}/transfer/`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to transfer staff');
        }
    }
);

export const terminateDuty = createAsyncThunk(
    'shelters/terminateDuty',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(`${endpoints.shelters.shelters}${id}/terminate-duty/`);
            return { id, message: response.data.message };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to terminate duty');
        }
    }
);

// New: Create shelter with photos
export const createShelter = createAsyncThunk(
    'shelters/createShelter',
    async (shelterData: any, { rejectWithValue, dispatch }) => {
        try {
            const formData = new FormData();

            // Add all text fields
            Object.keys(shelterData).forEach(key => {
                if (key !== 'photos' && shelterData[key] !== null && shelterData[key] !== undefined) {
                    if (key === 'disability_types_supported' && Array.isArray(shelterData[key])) {
                        formData.append(key, JSON.stringify(shelterData[key]));
                    } else {
                        formData.append(key, shelterData[key]);
                    }
                }
            });

            // Add photos
            if (shelterData.photos && Array.isArray(shelterData.photos)) {
                shelterData.photos.forEach((photo: File) => {
                    formData.append('uploaded_photos', photo);
                });
            }

            const response = await apiClient.post(endpoints.shelters.shelters, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Refresh shelter list
            dispatch(fetchShelters());

            return response.data;
        } catch (error: any) {
            console.error('Shelter creation failed:', error.response?.data);
            // DRF returns validation errors as an object: { field: [error1, ...], ... }
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue(error.message || 'Failed to create shelter');
        }
    }
);

// New: Fetch incident reports
export const fetchIncidents = createAsyncThunk(
    'shelters/fetchIncidents',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.shelters.incidents);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch incident reports');
        }
    }
);

// New: Create resource request
export const createResourceRequest = createAsyncThunk(
    'shelters/createResourceRequest',
    async (requestData: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.shelters.requests, requestData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to create resource request');
        }
    }
);

// New: Fetch pending shelters (admin only)
export const fetchPendingShelters = createAsyncThunk(
    'shelters/fetchPending',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`${endpoints.shelters.shelters}pending/`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending shelters');
        }
    }
);

// New: Approve shelter
export const approveShelter = createAsyncThunk(
    'shelters/approve',
    async (shelterId: string, { rejectWithValue, dispatch }) => {
        try {
            const response = await apiClient.post(
                `${endpoints.shelters.shelters}${shelterId}/approve/`,
                { action: 'approve' }
            );

            // Refresh lists
            dispatch(fetchShelters());
            dispatch(fetchPendingShelters());

            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to approve shelter');
        }
    }
);

// New: Reject shelter
export const rejectShelter = createAsyncThunk(
    'shelters/reject',
    async ({ shelterId, reason }: { shelterId: string; reason: string }, { rejectWithValue, dispatch }) => {
        try {
            const response = await apiClient.post(
                `${endpoints.shelters.shelters}${shelterId}/approve/`,
                { action: 'reject', reason }
            );

            // Refresh lists
            dispatch(fetchShelters());
            dispatch(fetchPendingShelters());

            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to reject shelter');
        }
    }
);

// New: Request more info
export const requestShelterInfo = createAsyncThunk(
    'shelters/requestInfo',
    async ({ shelterId, reason }: { shelterId: string; reason: string }, { rejectWithValue, dispatch }) => {
        try {
            const response = await apiClient.post(
                `${endpoints.shelters.shelters}${shelterId}/approve/`,
                { action: 'request_info', reason }
            );

            // Refresh lists
            dispatch(fetchShelters());
            dispatch(fetchPendingShelters());

            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to request information');
        }
    }
);


interface ShelterState {
    shelters: any[];
    pendingShelters: any[];
    placements: any[];
    resources: any[];
    staff: any[];
    incidents: any[];
    isLoading: boolean;
    error: string | null;
}

const initialState: ShelterState = {
    shelters: [],
    pendingShelters: [],
    placements: [],
    resources: [],
    staff: [],
    incidents: [],
    isLoading: false,
    error: null,
};

const shelterSlice = createSlice({
    name: 'shelters',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Fetch Shelters
        builder.addCase(fetchShelters.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchShelters.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.isLoading = false;
            state.shelters = Array.isArray(action.payload) ? action.payload : [];
        });
        builder.addCase(fetchShelters.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Fetch Placements
        builder.addCase(fetchPlacements.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.placements = Array.isArray(action.payload) ? action.payload : [];
        });

        // Fetch Resources
        builder.addCase(fetchResources.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.resources = Array.isArray(action.payload) ? action.payload : [];
        });

        // Fetch Staff
        builder.addCase(fetchStaff.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.staff = Array.isArray(action.payload) ? action.payload : [];
        });

        // Assign Staff
        builder.addCase(assignStaff.fulfilled, (state, action) => {
            state.staff.push(action.payload);
        });

        // Terminate Duty
        builder.addCase(terminateDuty.fulfilled, (state, action) => {
            state.staff = state.staff.filter(s => s.id !== action.payload.id);
        });

        // Add Placement
        builder.addCase(addPlacement.fulfilled, (state, action) => {
            state.placements.unshift(action.payload);
        });

        // Fetch Pending Shelters
        builder.addCase(fetchPendingShelters.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.pendingShelters = Array.isArray(action.payload) ? action.payload : [];
        });

        // Fetch Incidents
        builder.addCase(fetchIncidents.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.incidents = Array.isArray(action.payload) ? action.payload : [];
        });

        // Create Resource Request
        builder.addCase(createResourceRequest.fulfilled, () => {
            // You might want to add this to a requests list if you had one in state
        });
    },
});

export default shelterSlice.reducer;
