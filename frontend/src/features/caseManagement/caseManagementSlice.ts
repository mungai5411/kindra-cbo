import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

// Types
interface Family {
    id: string;
    family_code: string;
    primary_contact_name: string;
    vulnerability_level: string;
    county: string;
    children_count: number;
    assigned_case_worker: string;
    is_active: boolean;
    registration_date: string;
    latitude?: number;
    longitude?: number;
}

interface Child {
    id: string;
    family: string;
    full_name: string;
    date_of_birth: string;
    gender: string;
}

interface Case {
    id: string;
    case_number: string;
    title: string;
    family: string;
    status: string;
    priority: string;
    assigned_to: string;
    opened_date: string;
}

interface Assessment {
    id: string;
    family: string;
    assessment_type: string;
    assessment_date: string;
    overall_score: number;
    conducted_by: string;
}

interface CaseNote {
    id: string;
    case: string;
    note: string;
    is_milestone: boolean;
    created_by: string;
    created_at: string;
}

interface CaseManagementState {
    families: Family[];
    children: Child[];
    cases: Case[];
    assessments: Assessment[];
    caseNotes: CaseNote[];
    isLoading: boolean;
    error: string | null;
}

const initialState: CaseManagementState = {
    families: [],
    children: [],
    cases: [],
    assessments: [],
    caseNotes: [],
    isLoading: false,
    error: null,
};

// Async Thunks for Deletion
export const deleteFamily = createAsyncThunk(
    'caseManagement/deleteFamily',
    async (familyId: string, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/cases/families/${familyId}/`);
            return familyId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete family');
        }
    }
);

export const deleteCase = createAsyncThunk(
    'caseManagement/deleteCase',
    async (caseId: string, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/cases/cases/${caseId}/`);
            return caseId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete case');
        }
    }
);

export const deleteAssessment = createAsyncThunk(
    'caseManagement/deleteAssessment',
    async (assessmentId: string, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/cases/assessments/${assessmentId}/`);
            return assessmentId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete assessment');
        }
    }
);

export const deleteCaseNote = createAsyncThunk(
    'caseManagement/deleteCaseNote',
    async (noteId: string, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/cases/notes/${noteId}/`);
            return noteId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete case note');
        }
    }
);

// Fetch thunks for data loading
export const fetchFamilies = createAsyncThunk(
    'caseManagement/fetchFamilies',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/cases/families/');
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch families');
        }
    }
);

export const fetchCases = createAsyncThunk(
    'caseManagement/fetchCases',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/cases/cases/');
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch cases');
        }
    }
);

export const fetchAssessments = createAsyncThunk(
    'caseManagement/fetchAssessments',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/cases/assessments/');
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch assessments');
        }
    }
);

export const fetchCaseNotes = createAsyncThunk(
    'caseManagement/fetchCaseNotes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/cases/notes/');
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch case notes');
        }
    }
);

export const fetchChildren = createAsyncThunk(
    'caseManagement/fetchChildren',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/cases/children/');
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch children');
        }
    }
);

// Create Actions
export const addFamily = createAsyncThunk(
    'caseManagement/addFamily',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/cases/families/', data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add family');
        }
    }
);

export const addChild = createAsyncThunk(
    'caseManagement/addChild',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/cases/children/', data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to register child');
        }
    }
);

export const addCase = createAsyncThunk(
    'caseManagement/addCase',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/cases/cases/', data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create case');
        }
    }
);

export const addAssessment = createAsyncThunk(
    'caseManagement/addAssessment',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/cases/assessments/', data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to save assessment');
        }
    }
);

export const addCaseNote = createAsyncThunk(
    'caseManagement/addCaseNote',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/cases/notes/', data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add case note');
        }
    }
);

// Slice
const caseManagementSlice = createSlice({
    name: 'caseManagement',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Families
        builder
            .addCase(fetchFamilies.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchFamilies.fulfilled, (state, action: PayloadAction<Family[]>) => {
                state.isLoading = false;
                state.families = action.payload;
            })
            .addCase(fetchFamilies.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch Children
        builder.addCase(fetchChildren.fulfilled, (state, action: PayloadAction<Child[]>) => {
            state.children = action.payload;
        });

        // Fetch Cases
        builder
            .addCase(fetchCases.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCases.fulfilled, (state, action: PayloadAction<Case[]>) => {
                state.isLoading = false;
                state.cases = action.payload;
            })
            .addCase(fetchCases.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch Assessments
        builder
            .addCase(fetchAssessments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAssessments.fulfilled, (state, action: PayloadAction<Assessment[]>) => {
                state.isLoading = false;
                state.assessments = action.payload;
            })
            .addCase(fetchAssessments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch Case Notes
        builder
            .addCase(fetchCaseNotes.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCaseNotes.fulfilled, (state, action: PayloadAction<CaseNote[]>) => {
                state.isLoading = false;
                state.caseNotes = action.payload;
            })
            .addCase(fetchCaseNotes.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Delete Family
        builder
            .addCase(deleteFamily.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteFamily.fulfilled, (state, action: PayloadAction<string>) => {
                state.isLoading = false;
                state.families = state.families.filter(family => family.id !== action.payload);
            })
            .addCase(deleteFamily.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Delete Case
        builder
            .addCase(deleteCase.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteCase.fulfilled, (state, action: PayloadAction<string>) => {
                state.isLoading = false;
                state.cases = state.cases.filter(case_ => case_.id !== action.payload);
            })
            .addCase(deleteCase.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Delete Assessment
        builder
            .addCase(deleteAssessment.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteAssessment.fulfilled, (state, action: PayloadAction<string>) => {
                state.isLoading = false;
                state.assessments = state.assessments.filter(assessment => assessment.id !== action.payload);
            })
            .addCase(deleteAssessment.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Delete Case Note
        builder
            .addCase(deleteCaseNote.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteCaseNote.fulfilled, (state, action: PayloadAction<string>) => {
                state.isLoading = false;
                state.caseNotes = state.caseNotes.filter(note => note.id !== action.payload);
            })
            .addCase(deleteCaseNote.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Add Actions
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
            state.caseNotes.unshift(action.payload);
        });
    },
});

export const { clearError } = caseManagementSlice.actions;
export default caseManagementSlice.reducer;
