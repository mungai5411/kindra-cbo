/**
 * Donations Redux Slice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient, { endpoints } from '../../api/client';

export const fetchCampaigns = createAsyncThunk(
    'donations/fetchCampaigns',
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
    'donations/fetchCampaignBySlug',
    async (slug: string, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`${endpoints.donations.campaigns}${slug}/`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch campaign');
        }
    }
);

export const fetchDonations = createAsyncThunk(
    'donations/fetchDonations',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.donations.donations);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch donations');
        }
    }
);

export const addCampaign = createAsyncThunk(
    'donations/addCampaign',
    async (campaignData: any, { rejectWithValue }) => {
        try {
            const isFormData = campaignData instanceof FormData;
            const response = await apiClient.post(endpoints.donations.campaigns, campaignData, {
                headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create campaign');
        }
    }
);

export const updateCampaign = createAsyncThunk(
    'donations/updateCampaign',
    async ({ id, data }: { id: string | number; data: any }, { rejectWithValue }) => {
        if (!id) return rejectWithValue('Missing campaign identifier');
        try {
            const response = await apiClient.patch(`${endpoints.donations.campaigns}${id}/`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update campaign');
        }
    }
);

export const completeCampaign = createAsyncThunk(
    'donations/completeCampaign',
    async (id: string | number, { rejectWithValue }) => {
        try {
            const response = await apiClient.patch(`${endpoints.donations.campaigns}${id}/`, { status: 'COMPLETED' });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to complete campaign');
        }
    }
);

export const deleteCampaign = createAsyncThunk(
    'donations/deleteCampaign',
    async (id: string | number, { rejectWithValue }) => {
        try {
            await apiClient.delete(`${endpoints.donations.campaigns}${id}/`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete campaign');
        }
    }
);

export const fetchDonors = createAsyncThunk(
    'donations/fetchDonors',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.donations.donors);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch donors');
        }
    }
);

export const addDonor = createAsyncThunk(
    'donations/addDonor',
    async (donorData: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.donations.donors, donorData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add donor');
        }
    }
);

export const updateDonor = createAsyncThunk(
    'donations/updateDonor',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await apiClient.patch(`${endpoints.donations.donors}${id}/`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update donor');
        }
    }
);

export const updateDonation = createAsyncThunk(
    'donations/updateDonation',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await apiClient.patch(`${endpoints.donations.donations}${id}/`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update donation');
        }
    }
);

export const fetchReceipts = createAsyncThunk(
    'donations/fetchReceipts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.donations.receipts);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch receipts');
        }
    }
);

export const processPayment = createAsyncThunk(
    'donations/processPayment',
    async ({ method, data }: { method: 'mpesa'; data: any }, { dispatch, rejectWithValue }) => {
        try {
            const endpoint = endpoints.donations.mpesa;
            const response = await apiClient.post(endpoint, data);

            // Refresh data after successful payment
            dispatch(fetchCampaigns());
            dispatch(fetchDonations());
            dispatch(fetchReceipts());
            dispatch(fetchDonors());

            // Sync high-level stats (dynamic import to avoid circular dependency)
            const { fetchDashboardData } = await import('../reporting/reportingSlice');
            dispatch(fetchDashboardData());

            // Generate system-wide notification for ALL users
            const { getRandomMessage } = await import('../../utils/heartwarmingMessages');
            const message = getRandomMessage('DONOR');
            const newNotification = {
                id: Date.now().toString(),
                type: 'success',
                title: 'New Donation Received! 🎉',
                message: message,
                donor: data.donor_name || 'Anonymous Donor',
                amount: data.amount,
                time: 'Just now',
                read: false,
                category: 'DONATION',
                targetRoles: ['ADMIN', 'MANAGEMENT', 'DONOR', 'SOCIAL_MEDIA'] // Only show to these roles
            };

            // Store notification globally for all users
            const existing = JSON.parse(sessionStorage.getItem('notifications') || '[]');
            sessionStorage.setItem('notifications', JSON.stringify([newNotification, ...existing]));

            // Trigger UI update across all components
            window.dispatchEvent(new CustomEvent('storage'));
            window.dispatchEvent(new CustomEvent('newNotification'));

            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || `Failed to process ${method} payment`);
        }
    }
);

export const checkMpesaStatus = createAsyncThunk(
    'donations/checkMpesaStatus',
    async (checkoutRequestId: string, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`${endpoints.donations.mpesaStatus}?checkout_request_id=${checkoutRequestId}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to check M-Pesa status');
        }
    }
);

export const fetchMaterialDonations = createAsyncThunk(
    'donations/fetchMaterialDonations',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.donations.materialDonations);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch material donations');
        }
    }
);

export const addMaterialDonation = createAsyncThunk(
    'donations/addMaterialDonation',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.donations.materialDonations, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to submit material donation');
        }
    }
);

export const approveMaterialDonation = createAsyncThunk(
    'donations/approveMaterialDonation',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(`${endpoints.donations.materialDonations}${id}/approve/`);
            return { id, message: response.data.message };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to approve donation');
        }
    }
);

export const rejectMaterialDonation = createAsyncThunk(
    'donations/rejectMaterialDonation',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(`${endpoints.donations.materialDonations}${id}/reject/`);
            return { id, message: response.data.message };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to reject donation');
        }
    }
);

export const fetchWallet = createAsyncThunk(
    'donations/fetchWallet',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.donations.wallet);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallet');
        }
    }
);

export const fetchDisbursements = createAsyncThunk(
    'donations/fetchDisbursements',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.donations.disbursements);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch disbursements');
        }
    }
);

export const createDisbursement = createAsyncThunk(
    'donations/createDisbursement',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.donations.disbursements, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create disbursement');
        }
    }
);

export const fetchDisbursementReceipts = createAsyncThunk(
    'donations/fetchDisbursementReceipts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.donations.disbursementReceipts);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch disbursement receipts');
        }
    }
);

export const uploadDisbursementReceipt = createAsyncThunk(
    'donations/uploadDisbursementReceipt',
    async (data: any, { rejectWithValue }) => {
        try {
            const isFormData = data instanceof FormData;
            const response = await apiClient.post(endpoints.donations.disbursementReceipts, data, {
                headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to upload receipt');
        }
    }
);

export const verifyDisbursementReceipt = createAsyncThunk(
    'donations/verifyDisbursementReceipt',
    async ({ id, admin_notes }: { id: string; admin_notes?: string }, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(`${endpoints.donations.disbursementReceipts}${id}/verify/`, { admin_notes });
            return { id, message: response.data.message };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to verify receipt');
        }
    }
);

interface DonationsState {
    campaigns: any[];
    donations: any[];
    donors: any[];
    receipts: any[];
    materialDonations: any[];
    wallet: any | null;
    disbursements: any[];
    disbursementReceipts: any[];
    isLoading: boolean;
    error: string | null;
}

const initialState: DonationsState = {
    campaigns: [],
    donations: [],
    donors: [],
    receipts: [],
    materialDonations: [],
    wallet: null,
    disbursements: [],
    disbursementReceipts: [],
    isLoading: false,
    error: null,
};

const donationsSlice = createSlice({
    name: 'donations',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Fetch Campaigns
        builder.addCase(fetchCampaigns.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchCampaigns.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.isLoading = false;
            state.campaigns = Array.isArray(action.payload) ? action.payload : [];
        });
        builder.addCase(fetchCampaigns.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Fetch Donations
        builder.addCase(fetchDonations.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.donations = Array.isArray(action.payload) ? action.payload : [];
        });

        // Add Campaign
        builder.addCase(addCampaign.fulfilled, (state, action) => {
            state.campaigns.unshift(action.payload);
        });

        // Update Campaign
        builder.addCase(updateCampaign.fulfilled, (state, action) => {
            const index = state.campaigns.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.campaigns[index] = action.payload;
            }
        });

        // Complete Campaign
        builder.addCase(completeCampaign.fulfilled, (state, action) => {
            const index = state.campaigns.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.campaigns[index] = action.payload;
            }
        });

        // Delete Campaign
        builder.addCase(deleteCampaign.fulfilled, (state, action) => {
            state.campaigns = state.campaigns.filter(c => c.id !== action.payload);
        });

        // Update Donation
        builder.addCase(updateDonation.fulfilled, (state, action) => {
            const index = state.donations.findIndex(d => d.id === action.payload.id);
            if (index !== -1) {
                state.donations[index] = action.payload;
            }
        });

        // Fetch Donors
        builder.addCase(fetchDonors.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.donors = Array.isArray(action.payload) ? action.payload : [];
        });

        // Add Donor
        builder.addCase(addDonor.fulfilled, (state, action) => {
            state.donors.unshift(action.payload);
        });

        // Update Donor
        builder.addCase(updateDonor.fulfilled, (state, action) => {
            const index = state.donors.findIndex(d => d.id === action.payload.id);
            if (index !== -1) {
                state.donors[index] = action.payload;
            }
        });

        // Fetch Receipts
        builder.addCase(fetchReceipts.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.receipts = Array.isArray(action.payload) ? action.payload : [];
        });

        // Process Payment
        builder.addCase(processPayment.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(processPayment.fulfilled, (state) => {
            state.isLoading = false;
        });
        builder.addCase(processPayment.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Fetch Material Donations
        builder.addCase(fetchMaterialDonations.fulfilled, (state, action) => {
            state.materialDonations = Array.isArray(action.payload) ? action.payload : [];
        });

        // Add Material Donation
        builder.addCase(addMaterialDonation.fulfilled, (state, action) => {
            state.materialDonations.unshift(action.payload);
        });

        // Approve/Reject Material Donation
        builder.addCase(approveMaterialDonation.fulfilled, (state, action) => {
            const index = state.materialDonations.findIndex(m => m.id === action.payload.id);
            if (index !== -1) {
                state.materialDonations[index].status = 'COLLECTED';
            }
        });
        builder.addCase(rejectMaterialDonation.fulfilled, (state, action) => {
            const index = state.materialDonations.findIndex(m => m.id === action.payload.id);
            if (index !== -1) {
                state.materialDonations[index].status = 'REJECTED';
            }
        });
        
        // Wallet & Disbursements
        builder.addCase(fetchWallet.fulfilled, (state, action) => {
            state.wallet = action.payload;
        });
        builder.addCase(fetchDisbursements.fulfilled, (state, action) => {
            state.disbursements = Array.isArray(action.payload) ? action.payload : [];
        });
        builder.addCase(createDisbursement.fulfilled, (state, action) => {
            state.disbursements.unshift(action.payload);
        });
        builder.addCase(fetchDisbursementReceipts.fulfilled, (state, action) => {
            state.disbursementReceipts = Array.isArray(action.payload) ? action.payload : [];
        });
        builder.addCase(uploadDisbursementReceipt.fulfilled, (state, action) => {
            state.disbursementReceipts.unshift(action.payload);
        });
        builder.addCase(verifyDisbursementReceipt.fulfilled, (state, action) => {
            const index = state.disbursementReceipts.findIndex(r => r.id === action.payload.id);
            if (index !== -1) {
                state.disbursementReceipts[index].is_verified = true;
            }
        });
    },
});

export default donationsSlice.reducer;
