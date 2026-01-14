import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient, { endpoints } from '../../api/client';

export const fetchGroups = createAsyncThunk(
    'groups/fetchGroups',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.volunteers.groups);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch groups');
        }
    }
);

export const createGroup = createAsyncThunk(
    'groups/createGroup',
    async (groupData: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.volunteers.groups, groupData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create group');
        }
    }
);

export const updateGroup = createAsyncThunk(
    'groups/updateGroup',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await apiClient.patch(`${endpoints.volunteers.groups}${id}/`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update group');
        }
    }
);

export const deleteGroup = createAsyncThunk(
    'groups/deleteGroup',
    async (id: string, { rejectWithValue }) => {
        try {
            await apiClient.delete(`${endpoints.volunteers.groups}${id}/`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete group');
        }
    }
);

export const fetchGroupMessages = createAsyncThunk(
    'groups/fetchGroupMessages',
    async (groupId: string, { rejectWithValue }) => {
        try {
            if (typeof endpoints.volunteers.groupMessages !== 'function') {
                throw new Error('Endpoint configuration error');
            }
            const response = await apiClient.get(endpoints.volunteers.groupMessages(groupId));
            return { groupId, messages: response.data.results || response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
        }
    }
);

export const sendGroupMessage = createAsyncThunk(
    'groups/sendGroupMessage',
    async ({ groupId, content }: { groupId: string; content: string }, { rejectWithValue }) => {
        try {
            if (typeof endpoints.volunteers.groupMessages !== 'function') {
                throw new Error('Endpoint configuration error');
            }
            const response = await apiClient.post(endpoints.volunteers.groupMessages(groupId), { content });
            return { groupId, message: response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send message');
        }
    }
);

interface GroupsState {
    groups: any[];
    messages: Record<string, any[]>;
    isLoading: boolean;
    error: string | null;
}

const initialState: GroupsState = {
    groups: [],
    messages: {},
    isLoading: false,
    error: null,
};

const groupsSlice = createSlice({
    name: 'groups',
    initialState,
    reducers: {
        clearGroupError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGroups.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchGroups.fulfilled, (state, action: PayloadAction<any[]>) => {
                state.isLoading = false;
                state.groups = action.payload;
            })
            .addCase(fetchGroups.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(createGroup.fulfilled, (state, action) => {
                state.groups.unshift(action.payload);
            })
            .addCase(updateGroup.fulfilled, (state, action) => {
                const index = state.groups.findIndex(g => g.id === action.payload.id);
                if (index !== -1) {
                    state.groups[index] = action.payload;
                }
            })
            .addCase(deleteGroup.fulfilled, (state, action) => {
                state.groups = state.groups.filter(g => g.id !== action.payload);
            })
            .addCase(fetchGroupMessages.fulfilled, (state, action) => {
                state.messages[action.payload.groupId] = action.payload.messages;
            })
            .addCase(sendGroupMessage.fulfilled, (state, action) => {
                if (!state.messages[action.payload.groupId]) {
                    state.messages[action.payload.groupId] = [];
                }
                state.messages[action.payload.groupId].push(action.payload.message);
            });
    },
});

export const { clearGroupError } = groupsSlice.actions;
export default groupsSlice.reducer;
