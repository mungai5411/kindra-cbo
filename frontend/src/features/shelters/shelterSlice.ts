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
            const response = await apiClient.get(endpoints.volunteers.volunteers);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch shelter staff');
        }
    }
);

export const fetchStaffCredentials = createAsyncThunk(
    'shelters/fetchStaffCredentials',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.shelters.staff);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch staff credentials');
        }
    }
);

export const createStaffCredential = createAsyncThunk(
    'shelters/createStaffCredential',
    async (credentialData: any, { rejectWithValue, dispatch }) => {
        try {
            const response = await apiClient.post(endpoints.shelters.staff, credentialData);
            dispatch(fetchStaffCredentials());
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to create staff credential');
        }
    }
);

export const verifyStaffCredential = createAsyncThunk(
    'shelters/verifyStaffCredential',
    async ({ id, is_verified }: { id: string; is_verified: boolean }, { rejectWithValue, dispatch }) => {
        try {
            const response = await apiClient.patch(`${endpoints.shelters.staff}${id}/`, {
                is_verified,
                verification_date: is_verified ? new Date().toISOString().split('T')[0] : null
            });
            dispatch(fetchStaffCredentials());
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to verify staff credential');
        }
    }
);

export const deleteStaffCredential = createAsyncThunk(
    'shelters/deleteStaffCredential',
    async (id: string, { rejectWithValue, dispatch }) => {
        try {
            await apiClient.delete(`${endpoints.shelters.staff}${id}/`);
            dispatch(fetchStaffCredentials());
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete staff credential');
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

export const updateShelter = createAsyncThunk(
    'shelters/updateShelter',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue, dispatch }) => {
        try {
            // Handle FormData if needed (photos)
            let payload = data;
            const headers: any = {};

            if (data instanceof FormData) {
                payload = data;
                headers['Content-Type'] = 'multipart/form-data';
            }

            const response = await apiClient.patch(`${endpoints.shelters.shelters}${id}/`, payload, {
                headers
            });

            dispatch(fetchShelters());
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update shelter');
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

// New: Create incident report
export const createIncident = createAsyncThunk(
    'shelters/createIncident',
    async (incidentData: any, { rejectWithValue, dispatch }) => {
        try {
            const response = await apiClient.post(endpoints.shelters.incidents, incidentData);
            dispatch(fetchIncidents());
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to create incident report');
        }
    }
);

// New: Create resource request
export const createResourceRequest = createAsyncThunk(
    'shelters/createResourceRequest',
    async (requestData: any, { rejectWithValue, dispatch }) => {
        try {
            const response = await apiClient.post(endpoints.shelters.requests, requestData);
            dispatch(fetchResourceRequests());
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to create resource request');
        }
    }
);

// New: Fetch resource requests
export const fetchResourceRequests = createAsyncThunk(
    'shelters/fetchResourceRequests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.shelters.requests);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch resource requests');
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


interface Shelter {
    id: string;
    name: string;
    registration_number: string;
    contact_person: string;
    phone_number: string;
    email: string;
    county: string;
    physical_address: string;
    latitude?: number;
    longitude?: number;
    total_capacity: number;
    current_occupancy: number;
    available_beds: number;
    occupancy_percentage: number;
    is_active: boolean;
    approval_status: string;
}

interface ShelterState {
    shelters: Shelter[];
    pendingShelters: Shelter[];
    placements: any[];
    resources: any[];
    staff: any[];
    staffCredentials: any[];
    incidents: any[];
    resourceRequests: any[];
    isLoading: boolean;
    error: string | null;
}

const initialState: ShelterState = {
    shelters: [],
    pendingShelters: [],
    placements: [],
    resources: [],
    staff: [],
    staffCredentials: [],
    incidents: [],
    resourceRequests: [],
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

        // Staff Credentials
        builder.addCase(fetchStaffCredentials.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.staffCredentials = Array.isArray(action.payload) ? action.payload : [];
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

        // Create Incident
        builder.addCase(createIncident.fulfilled, (state, action) => {
            state.incidents.unshift(action.payload);
        });

        // Fetch Resource Requests
        builder.addCase(fetchResourceRequests.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.resourceRequests = Array.isArray(action.payload) ? action.payload : [];
        });

        // Create Resource Request
        builder.addCase(createResourceRequest.fulfilled, (state, action) => {
            state.resourceRequests.unshift(action.payload);
        });
    },
});

export default shelterSlice.reducer;
