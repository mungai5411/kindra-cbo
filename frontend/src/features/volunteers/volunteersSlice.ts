/**
 * Volunteers Redux Slice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient, { endpoints } from '../../api/client';

export const fetchTimeLogs = createAsyncThunk(
    'volunteers/fetchTimeLogs',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.volunteers.timelogs);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch time logs');
        }
    }
);

export const fetchVolunteers = createAsyncThunk(
    'volunteers/fetchVolunteers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.volunteers.volunteers);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch volunteers');
        }
    }
);

export const fetchTasks = createAsyncThunk(
    'volunteers/fetchTasks',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.volunteers.tasks);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
        }
    }
);

export const fetchEvents = createAsyncThunk(
    'volunteers/fetchEvents',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.volunteers.events);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch events');
        }
    }
);

export const addTask = createAsyncThunk(
    'volunteers/addTask',
    async (taskData: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.volunteers.tasks, taskData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add task');
        }
    }
);

export const updateTaskStatus = createAsyncThunk(
    'volunteers/updateTaskStatus',
    async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
        try {
            const response = await apiClient.patch(`${endpoints.volunteers.tasks}${id}/`, { status });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update task status');
        }
    }
);

export const deleteTask = createAsyncThunk(
    'volunteers/deleteTask',
    async (id: string, { rejectWithValue }) => {
        try {
            await apiClient.delete(`${endpoints.volunteers.tasks}${id}/`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
        }
    }
);

export const addEvent = createAsyncThunk(
    'volunteers/addEvent',
    async (eventData: FormData, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.volunteers.events, eventData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add event');
        }
    }
);

export const updateEvent = createAsyncThunk(
    'volunteers/updateEvent',
    async ({ id, data }: { id: string; data: FormData }, { rejectWithValue }) => {
        try {
            const response = await apiClient.patch(`${endpoints.volunteers.events}${id}/`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update event');
        }
    }
);

export const deleteEvent = createAsyncThunk(
    'volunteers/deleteEvent',
    async (id: string, { rejectWithValue }) => {
        try {
            await apiClient.delete(`${endpoints.volunteers.events}${id}/`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete event');
        }
    }
);

export const registerForEvent = createAsyncThunk(
    'volunteers/registerForEvent',
    async (eventId: string, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(`${endpoints.volunteers.events}${eventId}/register/`, { action: 'register' });
            return { eventId, data: response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to register for event');
        }
    }
);

export const unregisterFromEvent = createAsyncThunk(
    'volunteers/unregisterFromEvent',
    async (eventId: string, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(`${endpoints.volunteers.events}${eventId}/register/`, { action: 'unregister' });
            return { eventId, data: response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to unregister from event');
        }
    }
);

export const fetchEventParticipants = createAsyncThunk(
    'volunteers/fetchEventParticipants',
    async (eventId: string, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`${endpoints.volunteers.events}${eventId}/participants/`);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch event participants');
        }
    }
);

export const addVolunteer = createAsyncThunk(
    'volunteers/addVolunteer',
    async (volunteerData: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.volunteers.volunteers, volunteerData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add volunteer');
        }
    }
);

export const updateVolunteer = createAsyncThunk(
    'volunteers/updateVolunteer',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await apiClient.patch(`${endpoints.volunteers.volunteers}${id}/`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update volunteer');
        }
    }
);

export const updateVolunteerStatus = createAsyncThunk(
    'volunteers/updateStatus',
    async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
        try {
            const response = await apiClient.patch(`${endpoints.volunteers.volunteers}${id}/`, { status });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

export const logTimeEntry = createAsyncThunk(
    'volunteers/logTimeEntry',
    async (timeData: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.volunteers.timelogs, timeData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to log time');
        }
    }
);

export const fetchTaskApplications = createAsyncThunk(
    'volunteers/fetchTaskApplications',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.volunteers.taskApplications);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch task applications');
        }
    }
);

export const createTaskApplication = createAsyncThunk(
    'volunteers/createTaskApplication',
    async (applicationData: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.volunteers.taskApplications, applicationData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to apply for task');
        }
    }
);

export const updateTaskApplication = createAsyncThunk(
    'volunteers/updateTaskApplication',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await apiClient.patch(`${endpoints.volunteers.taskApplications}${id}/`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update task application');
        }
    }
);

export const fetchShelters = createAsyncThunk(
    'volunteers/fetchShelters',
    async () => {
        try {
            const response = await apiClient.get(endpoints.shelters.shelters);
            return response.data.results || response.data;
        } catch (error: any) {
            console.error('Fetch shelters error:', error);
            // Return empty array instead of failing to prevent UI crash if endpoint inactive
            return [];
        }
    }
);

interface VolunteersState {
    volunteers: any[];
    tasks: any[];
    taskApplications: any[];
    events: any[];
    timeLogs: any[];
    shelters: any[]; // For dropdowns
    isLoading: boolean;
    error: string | null;
}

const initialState: VolunteersState = {
    volunteers: [],
    tasks: [],
    taskApplications: [],
    events: [],
    timeLogs: [],
    shelters: [],
    isLoading: false,
    error: null,
};

const volunteersSlice = createSlice({
    name: 'volunteers',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Fetch Volunteers
        builder.addCase(fetchVolunteers.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchVolunteers.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.isLoading = false;
            state.volunteers = Array.isArray(action.payload) ? action.payload : [];
        });
        builder.addCase(fetchVolunteers.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Add Volunteer
        builder.addCase(addVolunteer.fulfilled, (state, action) => {
            state.volunteers.unshift(action.payload);
        });

        // Log Time Entry
        builder.addCase(logTimeEntry.fulfilled, (state, action) => {
            state.timeLogs.unshift(action.payload);
        });


        // Fetch Tasks
        builder.addCase(fetchTasks.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.tasks = Array.isArray(action.payload) ? action.payload : [];
        });

        // Fetch Events
        builder.addCase(fetchEvents.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.events = Array.isArray(action.payload) ? action.payload : [];
        });

        // Fetch Time Logs
        builder.addCase(fetchTimeLogs.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.timeLogs = Array.isArray(action.payload) ? action.payload : [];
        });

        // Add Task
        builder.addCase(addTask.fulfilled, (state, action) => {
            state.tasks.unshift(action.payload);
        });

        // Update Task Status
        builder.addCase(updateTaskStatus.fulfilled, (state, action) => {
            const index = state.tasks.findIndex(t => t.id === action.payload.id);
            if (index !== -1) {
                state.tasks[index] = action.payload;
            }
        });

        // Delete Task
        builder.addCase(deleteTask.fulfilled, (state, action) => {
            state.tasks = state.tasks.filter(t => t.id !== action.payload);
        });

        // Add Event
        builder.addCase(addEvent.fulfilled, (state, action) => {
            state.events = Array.isArray(state.events) ? [action.payload, ...state.events] : [action.payload];
        });

        // Update Event
        builder.addCase(updateEvent.fulfilled, (state, action) => {
            const index = state.events.findIndex(e => e.id === action.payload.id);
            if (index !== -1) {
                state.events[index] = action.payload;
            }
        });

        // Delete Event
        builder.addCase(deleteEvent.fulfilled, (state, action) => {
            state.events = state.events.filter(e => e.id !== action.payload);
        });

        // Event Registration
        builder.addCase(registerForEvent.fulfilled, (state, action) => {
            const index = state.events.findIndex(e => e.id === action.payload.eventId);
            if (index !== -1) {
                state.events[index] = {
                    ...state.events[index],
                    is_registered: true,
                    registered_count: (state.events[index].registered_count || 0) + 1
                };
            }
        });

        builder.addCase(unregisterFromEvent.fulfilled, (state, action) => {
            const index = state.events.findIndex(e => e.id === action.payload.eventId);
            if (index !== -1) {
                state.events[index] = {
                    ...state.events[index],
                    is_registered: false,
                    registered_count: Math.max(0, (state.events[index].registered_count || 1) - 1)
                };
            }
        });

        // Fetch Task Applications
        builder.addCase(fetchTaskApplications.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.taskApplications = Array.isArray(action.payload) ? action.payload : [];
        });

        // Create Task Application
        builder.addCase(createTaskApplication.fulfilled, (state, action) => {
            state.taskApplications = Array.isArray(state.taskApplications) ? [action.payload, ...state.taskApplications] : [action.payload];
        });

        // Update Task Application
        builder.addCase(updateTaskApplication.fulfilled, (state, action) => {
            const index = state.taskApplications.findIndex(a => a.id === action.payload.id);
            if (index !== -1) {
                state.taskApplications[index] = action.payload;
            }
        });

        // Fetch Shelters
        builder.addCase(fetchShelters.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.shelters = Array.isArray(action.payload) ? action.payload : [];
        });

        // Update Volunteer & Status
        builder.addCase(updateVolunteer.fulfilled, (state, action) => {
            const index = state.volunteers.findIndex(v => v.id === action.payload.id);
            if (index !== -1) {
                state.volunteers[index] = action.payload;
            }
        });
        builder.addCase(updateVolunteerStatus.fulfilled, (state, action) => {
            const index = state.volunteers.findIndex(v => v.id === action.payload.id);
            if (index !== -1) {
                state.volunteers[index] = action.payload;
            }
        });

    },
});

export default volunteersSlice.reducer;
