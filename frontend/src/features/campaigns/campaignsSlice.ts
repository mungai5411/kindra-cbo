/**
 * Campaigns Redux Slice
 * State management for fundraising campaigns
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient, { endpoints } from '../../api/client';

interface Campaign {
    id: string;
    title: string;
    slug: string;
    description: string;
    featured_image: string;
    target_amount: number;
    raised_amount: number;
    currency: string;
    start_date: string;
    end_date: string;
    status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'PAUSED';
    category: string;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    is_featured: boolean;
    progress_percentage: number;
    created_at: string;
    updated_at: string;
}

interface CampaignsState {
    campaigns: Campaign[];
    currentCampaign: Campaign | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: CampaignsState = {
    campaigns: [],
    currentCampaign: null,
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchCampaigns = createAsyncThunk(
    'campaigns/fetchCampaigns',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.donations.campaigns);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch campaigns');
        }
    }
);

export const fetchCampaignBySlug = createAsyncThunk(
    'campaigns/fetchCampaignBySlug',
    async (slug: string, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`${endpoints.donations.campaigns}${slug}/`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch campaign');
        }
    }
);

// Slice
const campaignsSlice = createSlice({
    name: 'campaigns',
    initialState,
    reducers: {
        clearCurrentCampaign: (state) => {
            state.currentCampaign = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Campaigns
        builder.addCase(fetchCampaigns.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchCampaigns.fulfilled, (state, action: PayloadAction<Campaign[]>) => {
            state.isLoading = false;
            state.campaigns = action.payload;
        });
        builder.addCase(fetchCampaigns.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Fetch Campaign by Slug
        builder.addCase(fetchCampaignBySlug.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchCampaignBySlug.fulfilled, (state, action: PayloadAction<Campaign>) => {
            state.isLoading = false;
            state.currentCampaign = action.payload;
        });
        builder.addCase(fetchCampaignBySlug.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearCurrentCampaign } = campaignsSlice.actions;
export default campaignsSlice.reducer;
