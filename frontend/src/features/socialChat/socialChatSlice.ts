import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient, { endpoints } from '../../api/client';

export interface ChatMessage {
    id: string;
    user: {
        id: string;
        username: string;
        first_name: string;
        last_name: string;
        role: string;
        profile_picture?: string;
    };
    recipient?: {
        id: string;
        username: string;
        first_name: string;
        last_name: string;
    };
    content: string;
    timestamp: string;
    is_flagged: boolean;
    is_private: boolean;
    is_sender?: boolean;
}

export interface ChatUser {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    role: string;
}

interface SocialChatState {
    messages: ChatMessage[];
    publicMessages: ChatMessage[];
    privateMessages: ChatMessage[];
    availableUsers: ChatUser[];
    isLoading: boolean;
    error: string | null;
    selectedConversation?: string;
}

export const fetchMessages = createAsyncThunk(
    'socialChat/fetchMessages',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.socialChat.messages);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
        }
    }
);

export const fetchAvailableUsers = createAsyncThunk(
    'socialChat/fetchAvailableUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.socialChat.users);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

export const sendMessage = createAsyncThunk(
    'socialChat/sendMessage',
    async (data: { content: string; recipient?: string; is_private: boolean }, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.socialChat.messages, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send message');
        }
    }
);

export const deleteMessage = createAsyncThunk(
    'socialChat/deleteMessage',
    async (messageId: string, { rejectWithValue }) => {
        try {
            await apiClient.delete(`${endpoints.socialChat.messages}${messageId}/`);
            return messageId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete message');
        }
    }
);

const initialState: SocialChatState = {
    messages: [],
    publicMessages: [],
    privateMessages: [],
    availableUsers: [],
    isLoading: false,
    error: null,
    selectedConversation: undefined,
};

const socialChatSlice = createSlice({
    name: 'socialChat',
    initialState,
    reducers: {
        setSelectedConversation(state, action: PayloadAction<string | undefined>) {
            state.selectedConversation = action.payload;
        },
        addMessageOptimistic(state, action: PayloadAction<ChatMessage>) {
            state.messages.unshift(action.payload);
            if (!action.payload.is_private) {
                state.publicMessages.unshift(action.payload);
            }
        },
    },
    extraReducers: (builder) => {
        // Fetch Messages
        builder.addCase(fetchMessages.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchMessages.fulfilled, (state, action) => {
            state.isLoading = false;
            state.messages = Array.isArray(action.payload) ? action.payload : [];
            state.publicMessages = state.messages.filter(m => !m.is_private);
            state.privateMessages = state.messages.filter(m => m.is_private);
        });
        builder.addCase(fetchMessages.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Fetch Users
        builder.addCase(fetchAvailableUsers.fulfilled, (state, action) => {
            state.availableUsers = Array.isArray(action.payload) ? action.payload : [];
        });
        builder.addCase(fetchAvailableUsers.rejected, (state, action) => {
            state.error = action.payload as string;
        });

        // Send Message
        builder.addCase(sendMessage.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(sendMessage.fulfilled, (state, action) => {
            state.isLoading = false;
            state.messages.unshift(action.payload);
            if (!action.payload.is_private) {
                state.publicMessages.unshift(action.payload);
            } else {
                state.privateMessages.unshift(action.payload);
            }
        });
        builder.addCase(sendMessage.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Delete Message
        builder.addCase(deleteMessage.fulfilled, (state, action) => {
            state.messages = state.messages.filter(m => m.id !== action.payload);
            state.publicMessages = state.publicMessages.filter(m => m.id !== action.payload);
            state.privateMessages = state.privateMessages.filter(m => m.id !== action.payload);
        });
        builder.addCase(deleteMessage.rejected, (state, action) => {
            state.error = action.payload as string;
        });
    },
});

export const { setSelectedConversation, addMessageOptimistic } = socialChatSlice.actions;
export default socialChatSlice.reducer;
