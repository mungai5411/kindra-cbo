/**
 * Blog Redux Slice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient, { endpoints } from '../../api/client';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    category: any;
    tags: any[];
    author: any;
    publishedAt: string;
    viewCount: number;
    status: string;
}

interface BlogState {
    posts: BlogPost[];
    currentPost: BlogPost | null;
    categories: any[];
    tags: any[];
    isLoading: boolean;
    error: string | null;
}

const initialState: BlogState = {
    posts: [],
    currentPost: null,
    categories: [],
    tags: [],
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchPosts = createAsyncThunk(
    'blog/fetchPosts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.blog.posts);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
        }
    }
);

export const fetchAdminPosts = createAsyncThunk(
    'blog/fetchAdminPosts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.blog.adminPosts);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
        }
    }
);

export const fetchPostBySlug = createAsyncThunk(
    'blog/fetchPostBySlug',
    async (slug: string, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`${endpoints.blog.posts}${slug}/`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch post');
        }
    }
);

export const fetchCategories = createAsyncThunk(
    'blog/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.blog.categories);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
        }
    }
);

export const createCategory = createAsyncThunk(
    'blog/createCategory',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.blog.adminCategories, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create category');
        }
    }
);

export const updateCategory = createAsyncThunk(
    'blog/updateCategory',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await apiClient.patch(`${endpoints.blog.adminCategories}${id}/`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update category');
        }
    }
);

export const deleteCategory = createAsyncThunk(
    'blog/deleteCategory',
    async (id: string, { rejectWithValue }) => {
        try {
            await apiClient.delete(`${endpoints.blog.adminCategories}${id}/`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
        }
    }
);

export const fetchTags = createAsyncThunk(
    'blog/fetchTags',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(endpoints.blog.tags);
            return response.data.results || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch tags');
        }
    }
);

export const createTag = createAsyncThunk(
    'blog/createTag',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.blog.adminTags, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create tag');
        }
    }
);

export const updateTag = createAsyncThunk(
    'blog/updateTag',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await apiClient.patch(`${endpoints.blog.adminTags}${id}/`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update tag');
        }
    }
);

export const deleteTag = createAsyncThunk(
    'blog/deleteTag',
    async (id: string, { rejectWithValue }) => {
        try {
            await apiClient.delete(`${endpoints.blog.adminTags}${id}/`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete tag');
        }
    }
);

export const createPost = createAsyncThunk(
    'blog/createPost',
    async (postData: any, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.blog.adminPosts, postData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create post');
        }
    }
);

export const updatePost = createAsyncThunk(
    'blog/updatePost',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await apiClient.patch(`${endpoints.blog.adminPosts}${id}/`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update post');
        }
    }
);

export const deletePost = createAsyncThunk(
    'blog/deletePost',
    async (id: string, { rejectWithValue }) => {
        try {
            await apiClient.delete(`${endpoints.blog.adminPosts}${id}/`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
        }
    }
);

// Slice
const blogSlice = createSlice({
    name: 'blog',
    initialState,
    reducers: {
        clearCurrentPost: (state) => {
            state.currentPost = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Posts
        builder.addCase(fetchPosts.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchPosts.fulfilled, (state, action: PayloadAction<BlogPost[]>) => {
            state.isLoading = false;
            state.posts = action.payload;
        });
        builder.addCase(fetchPosts.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Fetch Admin Posts
        builder.addCase(fetchAdminPosts.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchAdminPosts.fulfilled, (state, action: PayloadAction<BlogPost[]>) => {
            state.isLoading = false;
            state.posts = action.payload;
        });
        builder.addCase(fetchAdminPosts.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Fetch Post by Slug
        builder.addCase(fetchPostBySlug.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchPostBySlug.fulfilled, (state, action: PayloadAction<BlogPost>) => {
            state.isLoading = false;
            state.currentPost = action.payload;
        });
        builder.addCase(fetchPostBySlug.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Fetch Categories
        builder.addCase(fetchCategories.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.categories = action.payload;
        });

        // Category Management
        builder.addCase(createCategory.fulfilled, (state, action) => {
            state.categories.unshift(action.payload);
        });
        builder.addCase(updateCategory.fulfilled, (state, action) => {
            const index = state.categories.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.categories[index] = action.payload;
            }
        });
        builder.addCase(deleteCategory.fulfilled, (state, action) => {
            state.categories = state.categories.filter(c => c.id !== action.payload);
        });

        // Fetch Tags
        builder.addCase(fetchTags.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.tags = action.payload;
        });

        // Tag Management
        builder.addCase(createTag.fulfilled, (state, action) => {
            state.tags.unshift(action.payload);
        });
        builder.addCase(updateTag.fulfilled, (state, action) => {
            const index = state.tags.findIndex(t => t.id === action.payload.id);
            if (index !== -1) {
                state.tags[index] = action.payload;
            }
        });
        builder.addCase(deleteTag.fulfilled, (state, action) => {
            state.tags = state.tags.filter(t => t.id !== action.payload);
        });

        // Create Post
        builder.addCase(createPost.fulfilled, (state, action) => {
            state.posts.unshift(action.payload as BlogPost);
        });

        // Update Post
        builder.addCase(updatePost.fulfilled, (state, action) => {
            const index = state.posts.findIndex(p => p.id === action.payload.id);
            if (index !== -1) {
                state.posts[index] = action.payload as BlogPost;
            }
        });

        // Delete Post
        builder.addCase(deletePost.fulfilled, (state, action) => {
            state.posts = state.posts.filter(p => p.id !== action.payload);
        });
    },
});

export const { clearCurrentPost } = blogSlice.actions;
export default blogSlice.reducer;
