import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient, { endpoints } from '../../api/client';

export interface DonationImpact {
    id: string;
    shelter_home: string;
    shelter_name?: string;
    donation: string | null;
    material_donation: string | null;
    title: string;
    description: string;
    impact_date: string;
    monetary_value: number;
    media: string[];
    media_assets?: any[];
    is_reported: boolean;
    admin_feedback: string;
    created_at: string;
    updated_at: string;
}

interface ImpactState {
    impacts: DonationImpact[];
    isLoading: boolean;
    error: string | null;
}

const initialState: ImpactState = {
    impacts: [],
    isLoading: false,
    error: null,
};

export const fetchImpacts = createAsyncThunk(
    'impact/fetchImpacts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.donations.impact);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch impacts');
        }
    }
);

export const createImpact = createAsyncThunk(
    'impact/createImpact',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.donations.impact, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to record impact');
        }
    }
);

export const submitImpactSummary = createAsyncThunk(
    'impact/submitSummary',
    async (impactIds: string[], { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.donations.impactSummary, { impact_ids: impactIds });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to submit summary');
        }
    }
);

const impactSlice = createSlice({
    name: 'impact',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchImpacts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchImpacts.fulfilled, (state, action: PayloadAction<DonationImpact[]>) => {
                state.isLoading = false;
                state.impacts = action.payload;
            })
            .addCase(fetchImpacts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(createImpact.fulfilled, (state, action: PayloadAction<DonationImpact>) => {
                state.impacts.unshift(action.payload);
            });
    },
});

export default impactSlice.reducer;
