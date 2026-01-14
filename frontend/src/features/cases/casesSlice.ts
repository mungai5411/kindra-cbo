/**
 * Cases Redux Slice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient, { endpoints } from '../../api/client';

// Fetch Actions
export const fetchFamilies = createAsyncThunk(
    'cases/fetchFamilies',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.cases.families);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch families');
        }
    }
);

export const fetchChildren = createAsyncThunk(
    'cases/fetchChildren',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.cases.children);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch children');
        }
    }
);

export const fetchCases = createAsyncThunk(
    'cases/fetchCases',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.cases.cases);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch cases');
        }
    }
);

export const fetchAssessments = createAsyncThunk(
    'cases/fetchAssessments',
    async (familyId: string, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`${endpoints.cases.assessments}?family=${familyId}`);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch assessments');
        }
    }
);

export const fetchCaseNotes = createAsyncThunk(
    'cases/fetchCaseNotes',
    async (caseId: string, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`${endpoints.cases.notes}?case=${caseId}`);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch case notes');
        }
    }
);

// Create Actions
export const addFamily = createAsyncThunk(
    'cases/addFamily',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.cases.families, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add family');
        }
    }
);

export const addChild = createAsyncThunk(
    'cases/addChild',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.cases.children, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to register child');
        }
    }
);

export const addCase = createAsyncThunk(
    'cases/addCase',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.cases.cases, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create case');
        }
    }
);

export const addAssessment = createAsyncThunk(
    'cases/addAssessment',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.cases.assessments, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to save assessment');
        }
    }
);

export const addCaseNote = createAsyncThunk(
    'cases/addCaseNote',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.cases.notes, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add case note');
        }
    }
);

interface CasesState {
    families: any[];
    children: any[];
    cases: any[];
    assessments: any[];
    notes: any[];
    isLoading: boolean;
    error: string | null;
}

const initialState: CasesState = {
    families: [],
    children: [],
    cases: [],
    assessments: [],
    notes: [],
    isLoading: false,
    error: null,
};

const casesSlice = createSlice({
    name: 'cases',
    initialState,
    reducers: {
        clearCurrentCaseData: (state) => {
            state.assessments = [];
            state.notes = [];
        }
    },
    extraReducers: (builder) => {
        // Fetch Cases
        builder.addCase(fetchFamilies.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchFamilies.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.isLoading = false;
            state.families = Array.isArray(action.payload) ? action.payload : [];
        });
        builder.addCase(fetchChildren.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.children = Array.isArray(action.payload) ? action.payload : [];
        });
        builder.addCase(fetchCases.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.cases = Array.isArray(action.payload) ? action.payload : [];
        });
        builder.addCase(fetchAssessments.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.assessments = Array.isArray(action.payload) ? action.payload : [];
        });
        builder.addCase(fetchCaseNotes.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.notes = Array.isArray(action.payload) ? action.payload : [];
        });

        // Add Cases
        builder.addCase(addFamily.fulfilled, (state, action) => {
            state.families.unshift(action.payload);
        });
        builder.addCase(addChild.fulfilled, (state, action) => {
            state.children.unshift(action.payload);
        });
        builder.addCase(addCase.fulfilled, (state, action) => {
            state.cases.unshift(action.payload);
        });
        builder.addCase(addAssessment.fulfilled, (state, action) => {
            state.assessments.unshift(action.payload);
        });
        builder.addCase(addCaseNote.fulfilled, (state, action) => {
            state.notes.unshift(action.payload);
        });
    },
});

export const { clearCurrentCaseData } = casesSlice.actions;
export default casesSlice.reducer;
