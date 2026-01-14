/**
 * Redux Store Configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import blogReducer from './features/blog/blogSlice';
import donationsReducer from './features/donations/donationsSlice';
import volunteersReducer from './features/volunteers/volunteersSlice';
import casesReducer from './features/cases/casesSlice';
import reportingReducer from './features/reporting/reportingSlice';
import shelterReducer from './features/shelters/shelterSlice';
import campaignsReducer from './features/campaigns/campaignsSlice';
import resourcesReducer from './features/resources/resourcesSlice';
import caseManagementReducer from './features/caseManagement/caseManagementSlice';
import adminReducer from './features/admin/adminSlice';
import groupsReducer from './features/volunteers/groupsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        blog: blogReducer,
        donations: donationsReducer,
        volunteers: volunteersReducer,
        groups: groupsReducer,
        cases: casesReducer,
        reporting: reportingReducer,
        shelters: shelterReducer,
        campaigns: campaignsReducer,
        resources: resourcesReducer,
        caseManagement: caseManagementReducer,
        admin: adminReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['auth/login/fulfilled'],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
