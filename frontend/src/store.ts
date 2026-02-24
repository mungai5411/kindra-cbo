/**
 * Redux Store Configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import blogReducer from './features/blog/blogSlice';
import donationsReducer from './features/donations/donationsSlice';
import volunteersReducer from './features/volunteers/volunteersSlice';
import reportingReducer from './features/reporting/reportingSlice';
import shelterReducer from './features/shelters/shelterSlice';
import resourcesReducer from './features/resources/resourcesSlice';
import caseManagementReducer from './features/caseManagement/caseManagementSlice';
import adminReducer from './features/admin/adminSlice';
import groupsReducer from './features/volunteers/groupsSlice';
import mediaReducer from './features/media/mediaSlice';
import impactReducer from './features/donations/impactSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        blog: blogReducer,
        donations: donationsReducer,
        volunteers: volunteersReducer,
        groups: groupsReducer,
        reporting: reportingReducer,
        shelters: shelterReducer,
        resources: resourcesReducer,
        caseManagement: caseManagementReducer,
        admin: adminReducer,
        media: mediaReducer,
        impact: impactReducer,
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
