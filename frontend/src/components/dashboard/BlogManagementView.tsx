import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchAdminPosts, fetchCategories, createPost, updatePost, deletePost, fetchTags, createTag, updateTag, deleteTag, createCategory, updateCategory, deleteCategory, fetchAllComments, updateCommentStatus, deleteComment } from '../../features/blog/blogSlice';
import apiClient from '../../api/client';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Alert,
    CircularProgress,
    useTheme,
    alpha,
    Tooltip
} from '@mui/material';
import {
    Article,
    Add,
    Edit,
    Delete,
    Visibility,
    Category,
    Label,
    Warning,
    Forum,
    Email,
    CheckCircleOutline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SubTabView } from './SubTabView';
import { ImageUploader } from '../common/ImageUploader';

// Status Chip Component
const StatusChip = ({ status }: { status: string }) => {
    const theme = useTheme();
    let bgcolor = alpha(theme.palette.grey[500], 0.1);
    let textColor = theme.palette.grey[700];

    if (status === 'PUBLISHED') {
        bgcolor = alpha(theme.palette.success.main, 0.1);
        textColor = theme.palette.success.dark;
    } else if (status === 'DRAFT') {
        bgcolor = alpha(theme.palette.warning.main, 0.1);
        textColor = theme.palette.warning.main;
    }

    return (
        <Chip
            label={status}
            size="small"
            sx={{
                bgcolor: bgcolor,
                color: textColor,
                fontWeight: 700,
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha(textColor, 0.2),
                '& .MuiChip-label': { px: 1.5 }
            }}
        />
    );
};

export function BlogManagementView({ initialTab = 'blog_posts' }: { initialTab?: string }) {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { posts, categories, tags, comments, isLoading } = useSelector((state: RootState) => state.blog);

    // Dialog States
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>(null);

    // Tag & Category Management States
    const [tagDialogOpen, setTagDialogOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState<any>(null);
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [metaDeleteConfirmOpen, setMetaDeleteConfirmOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'tag' | 'category', id: string, name: string } | null>(null);

    // Form States
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        excerpt: '',
        status: 'DRAFT',
        category: '',
        tag_ids: [] as string[],
        featured_image: null as File | null
    });

    const [metaFormData, setMetaFormData] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        dispatch(fetchAdminPosts());
        dispatch(fetchCategories());
        dispatch(fetchTags());
        dispatch(fetchAllComments());
    }, [dispatch]);

    // Handlers
    const handleOpenCreate = () => {
        setSelectedPost(null);
        setFormData({ title: '', content: '', excerpt: '', status: 'DRAFT', category: '', tag_ids: [], featured_image: null });
        setOpenDialog(true);
    };

    const handleOpenEdit = (post: any) => {
        setSelectedPost(post);
        setFormData({
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            status: post.status,
            category: post.category?.id || '',
            tag_ids: post.tags?.map((t: any) => t.id) || [],
            featured_image: null
        });
        setOpenDialog(true);
    };

    // Tag Handlers
    const handleOpenTagCreate = () => {
        setSelectedTag(null);
        setMetaFormData({ name: '', description: '' });
        setTagDialogOpen(true);
    };

    const handleOpenTagEdit = (tag: any) => {
        setSelectedTag(tag);
        setMetaFormData({ name: tag.name, description: '' });
        setTagDialogOpen(true);
    };

    const handleTagSubmit = async () => {
        try {
            if (selectedTag) {
                await dispatch(updateTag({ id: selectedTag.id, data: metaFormData })).unwrap();
            } else {
                await dispatch(createTag(metaFormData)).unwrap();
            }
            setTagDialogOpen(false);
        } catch (error) {
            console.error('Failed to save tag:', error);
        }
    };

    // Category Handlers
    const handleOpenCategoryCreate = () => {
        setSelectedCategory(null);
        setMetaFormData({ name: '', description: '' });
        setCategoryDialogOpen(true);
    };

    const handleOpenCategoryEdit = (cat: any) => {
        setSelectedCategory(cat);
        setMetaFormData({ name: cat.name, description: cat.description || '' });
        setCategoryDialogOpen(true);
    };

    const handleCategorySubmit = async () => {
        try {
            if (selectedCategory) {
                await dispatch(updateCategory({ id: selectedCategory.id, data: metaFormData })).unwrap();
            } else {
                await dispatch(createCategory(metaFormData)).unwrap();
            }
            setCategoryDialogOpen(false);
        } catch (error) {
            console.error('Failed to save category:', error);
        }
    };

    const handleMetaDeleteClick = (type: 'tag' | 'category', item: any) => {
        setDeleteTarget({ type, id: item.id, name: item.name });
        setMetaDeleteConfirmOpen(true);
    };

    const confirmMetaDelete = async () => {
        if (deleteTarget) {
            if (deleteTarget.type === 'tag') {
                await dispatch(deleteTag(deleteTarget.id));
            } else {
                await dispatch(deleteCategory(deleteTarget.id));
            }
            setMetaDeleteConfirmOpen(false);
            setDeleteTarget(null);
        }
    };

    const handleSubmit = async () => {
        try {
            const formDataToSubmit = new FormData();
            formDataToSubmit.append('title', formData.title);
            formDataToSubmit.append('content', formData.content);
            formDataToSubmit.append('excerpt', formData.excerpt);
            formDataToSubmit.append('status', formData.status);
            if (formData.category) {
                formDataToSubmit.append('category', formData.category);
            }

            // Append tags
            formData.tag_ids.forEach(tagId => {
                formDataToSubmit.append('tag_ids', tagId);
            });

            if (formData.featured_image) {
                formDataToSubmit.append('featured_image', formData.featured_image);
            }

            if (selectedPost) {
                await dispatch(updatePost({ id: selectedPost.id, data: formDataToSubmit })).unwrap();
            } else {
                await dispatch(createPost(formDataToSubmit)).unwrap();
            }
            setOpenDialog(false);
            dispatch(fetchAdminPosts()); // Refresh list
        } catch (error) {
            console.error('Failed to save story details:', error);
        }
    };

    const handleDeleteClick = (post: any) => {
        setSelectedPost(post);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedPost) {
            await dispatch(deletePost(selectedPost.id));
            setDeleteConfirmOpen(false);
            setSelectedPost(null);
            dispatch(fetchAdminPosts());
        }
    };

    if (isLoading && posts.length === 0) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>;
    }

    const renderPosts = () => (
        <Paper
            elevation={0}
            sx={{
                p: 0,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                background: alpha(theme.palette.background.paper, 0.6),
                backdropFilter: 'blur(20px)'
            }}
        >
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">Active Stories & Updates</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={handleOpenCreate}
                    sx={{ borderRadius: 3, boxShadow: theme.shadows[2], textTransform: 'none', fontWeight: 600 }}
                >
                    New Story
                </Button>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 'none' }}>Title</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 'none' }}>Author</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 'none' }}>Category</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 'none' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 'none' }}>Date</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: 'none' }}>Controls</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {posts.map((post: any) => (
                            <TableRow key={post.id} hover sx={{ '& td': { borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` } }}>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{post.title}</TableCell>
                                <TableCell>{post.author?.full_name || 'System Admin'}</TableCell>
                                <TableCell><Chip label={post.category?.name || 'General'} size="small" variant="outlined" sx={{ borderRadius: 2 }} /></TableCell>
                                <TableCell>
                                    <StatusChip status={post.status} />
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary' }}>
                                    {(() => {
                                        const dateVal = post.published_at || post.created_at;
                                        if (!dateVal) return 'Draft';
                                        const date = new Date(dateVal);
                                        return isNaN(date.getTime()) ? 'Draft' : date.toLocaleDateString();
                                    })()}
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="View Public Page">
                                        <IconButton
                                            size="small"
                                            sx={{ color: 'info.main' }}
                                            onClick={() => navigate(`/stories/${post.slug}`)}
                                        >
                                            <Visibility fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit Story">
                                        <IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => handleOpenEdit(post)}>
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Story">
                                        <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => handleDeleteClick(post)}>
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {posts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                    <Typography color="text.secondary">No stories found. Create one to get started.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    const renderCategories = () => (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={handleOpenCategoryCreate}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                    Add Category
                </Button>
            </Box>
            <Grid container spacing={3}>
                {(categories.length > 0 ? categories : []).map((cat: any, idx) => (
                    <Grid item xs={12} sm={6} md={3} key={idx}>
                        <Paper sx={{
                            p: 3,
                            textAlign: 'center',
                            borderRadius: 4,
                            border: '1px solid',
                            borderColor: 'divider',
                            background: alpha(theme.palette.background.paper, 0.6),
                            backdropFilter: 'blur(10px)',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            position: 'relative',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: theme.shadows[4],
                                '& .cat-actions': { opacity: 1 }
                            }
                        }}>
                            <Box className="cat-actions" sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                opacity: 0,
                                transition: 'opacity 0.2s',
                                display: 'flex',
                                gap: 0.5
                            }}>
                                <IconButton size="small" onClick={() => handleOpenCategoryEdit(cat)} sx={{ color: 'primary.main' }}>
                                    <Edit fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={() => handleMetaDeleteClick('category', cat)} sx={{ color: 'error.main' }}>
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Box>
                            <Category color="primary" sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                            <Typography variant="h6" fontWeight="bold" gutterBottom>{cat.name}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, minHeight: 40 }}>
                                {cat.description || 'No description provided.'}
                            </Typography>
                            <Chip
                                label={`${cat.post_count || 0} Stories`}
                                size="small"
                                sx={{ borderRadius: 2, fontWeight: 'bold', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}
                            />
                        </Paper>
                    </Grid>
                ))}
                {categories.length === 0 && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', bgcolor: 'transparent' }}>
                            <Typography color="text.secondary">No categories defined yet.</Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );

    const renderTags = () => (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={handleOpenTagCreate}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                    Add Tag
                </Button>
            </Box>
            <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', background: alpha(theme.palette.background.paper, 0.6) }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {tags.map((tag: any) => (
                        <Chip
                            key={tag.id}
                            label={`${tag.name} (${tag.post_count || 0})`}
                            onClick={() => handleOpenTagEdit(tag)}
                            onDelete={() => handleMetaDeleteClick('tag', tag)}
                            icon={<Label />}
                            sx={{
                                p: 1,
                                height: 40,
                                borderRadius: 3,
                                fontWeight: 600,
                                bgcolor: alpha(theme.palette.secondary.main, 0.05),
                                '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.1) }
                            }}
                        />
                    ))}
                    {tags.length === 0 && (
                        <Box sx={{ py: 4, textAlign: 'center', width: '100%' }}>
                            <Typography color="text.secondary">No metadata tags found. Add tags to organize your stories.</Typography>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    );

    const renderComments = () => {
        // We fetch comments when this tab renders if not already loaded or explicit refresh
        // This is handled by a useEffect in the main component if activeTab triggers it, 
        // or we can add a refresh button here.

        return (
            <Paper sx={{ p: 0, borderRadius: 4, border: '1px solid', borderColor: 'divider', background: alpha(theme.palette.background.paper, 0.6), overflow: 'hidden' }}>
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" fontWeight="bold">Comment Moderation</Typography>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => dispatch(fetchAllComments())}
                        startIcon={<Forum />}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                        Refresh
                    </Button>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Author</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Comment</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Post</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(comments || []).map((comment: any) => (
                                <TableRow key={comment.id} hover>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight="bold">{comment.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{comment.email}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 300 }}>
                                        <Typography variant="body2" noWrap>{comment.content}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{comment.post_title || 'Unknown Post'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={comment.status}
                                            size="small"
                                            color={
                                                comment.status === 'APPROVED' ? 'success' :
                                                    comment.status === 'REJECTED' ? 'error' :
                                                        comment.status === 'SPAM' ? 'warning' : 'default'
                                            }
                                            variant="outlined"
                                            sx={{ fontWeight: 600, borderRadius: 1 }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                            {comment.status === 'PENDING' && (
                                                <>
                                                    <Tooltip title="Approve">
                                                        <IconButton
                                                            size="small"
                                                            color="success"
                                                            onClick={async () => {
                                                                await dispatch(updateCommentStatus({ id: comment.id, status: 'APPROVED' }));
                                                            }}
                                                        >
                                                            <CheckCircleOutline sx={{ fontSize: 20 }} />
                                                            {/* Note: Icon used below is standard Check/Close */}
                                                            <Box component="span" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>✓</Box>
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Reject">
                                                        <IconButton
                                                            size="small"
                                                            color="warning"
                                                            onClick={async () => {
                                                                await dispatch(updateCommentStatus({ id: comment.id, status: 'REJECTED' }));
                                                            }}
                                                        >
                                                            <Box component="span" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>✕</Box>
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={async () => {
                                                        if (window.confirm('Are you sure you want to delete this comment?')) {
                                                            await dispatch(deleteComment(comment.id));
                                                        }
                                                    }}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(comments || []).length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                        <Forum sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                                        <Typography>No comments found.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        );
    };

    const renderNewsletter = () => (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, border: '1px solid', borderColor: 'divider', background: alpha(theme.palette.background.paper, 0.6) }}>
            <Email sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">Newsletter Management</Typography>
            <Typography variant="body2" color="text.secondary">Soon you'll be able to manage your subscriber list and send impact updates directly from here.</Typography>
        </Paper>
    );

    const tabs = [
        { id: 'blog_posts', label: 'Stories & Updates', icon: <Article />, component: renderPosts() },
        { id: 'categories', label: 'Categories', icon: <Category />, component: renderCategories() },
        { id: 'tags', label: 'Meta Tags', icon: <Label />, component: renderTags() },
        { id: 'comments', label: 'Comments', icon: <Forum />, component: renderComments() },
        { id: 'newsletter', label: 'Newsletter', icon: <Email />, component: renderNewsletter() },
    ];

    const normalizedTab = initialTab === 'blog_campaigns' ? 'blog_posts' : initialTab;

    return (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="900" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Article sx={{ fontSize: 40, color: 'primary.main' }} />
                    Blog & Storytelling
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage narrative impact and stakeholder communications
                </Typography>
            </Box>

            <SubTabView title="Content Management System" tabs={tabs} activeTab={normalizedTab} />

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid', borderColor: 'divider' }}>
                    {selectedPost ? 'Edit Story' : 'Compose New Story'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Grid container spacing={2.5}>
                            <Grid item xs={12} md={8}>
                                <TextField
                                    fullWidth
                                    label="Post Title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    size="small"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    size="small"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                >
                                    <MenuItem value="DRAFT">Draft</MenuItem>
                                    <MenuItem value="PUBLISHED">Published</MenuItem>
                                    <MenuItem value="ARCHIVED">Archived</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Category"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    size="small"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                >
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {categories.map((cat: any) => (
                                        <MenuItem key={cat.id || cat} value={cat.id || cat}>{cat.name || cat}</MenuItem>
                                    ))}
                                    {categories.length === 0 && (
                                        <MenuItem value="">
                                            <em>No categories found - Create one first</em>
                                        </MenuItem>
                                    )}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Tags"
                                    SelectProps={{
                                        multiple: true,
                                        renderValue: (selected: any) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value: string) => (
                                                    <Chip
                                                        key={value}
                                                        label={tags.find(t => t.id === value)?.name || value}
                                                        size="small"
                                                        sx={{ height: 20, fontSize: '0.75rem' }}
                                                    />
                                                ))}
                                            </Box>
                                        ),
                                    }}
                                    value={formData.tag_ids}
                                    onChange={(e) => setFormData({ ...formData, tag_ids: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value })}
                                    size="small"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                >
                                    {tags.map((tag: any) => (
                                        <MenuItem key={tag.id} value={tag.id}>{tag.name}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Excerpt (Short Summary)"
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    size="small"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            </Grid>
                        </Grid>

                        <TextField
                            fullWidth
                            multiline
                            rows={6}
                            label="Story Content"
                            placeholder="Write the impact story here..."
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />

                        <Box sx={{ mt: 0 }}>
                            <ImageUploader
                                label="Featured Image"
                                helperText="High-impact visual (Max 5MB)"
                                value={formData.featured_image || selectedPost?.featured_image}
                                onChange={(file) => setFormData({ ...formData, featured_image: file })}
                                onDelete={async () => {
                                    if (selectedPost?.id) {
                                        try {
                                            await apiClient.delete(`/blog/admin/posts/${selectedPost.id}/featured-image/`);
                                            setSelectedPost({ ...selectedPost, featured_image: null });
                                            setFormData({ ...formData, featured_image: null });
                                            dispatch(fetchAdminPosts());
                                        } catch (error) {
                                            console.error('Failed to delete image:', error);
                                            throw error;
                                        }
                                    } else {
                                        setFormData({ ...formData, featured_image: null });
                                    }
                                }}
                                maxSizeMB={5}
                                showPreview={true}
                            />
                        </Box>

                        <Alert severity="info" sx={{ borderRadius: 2, py: 0, '& .MuiAlert-message': { py: 1 } }}>
                            Stories are immediately optimized for SEO and cross-platform sharing.
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{ borderRadius: 3, px: 4, fontWeight: 'bold', boxShadow: theme.shadows[2] }}
                    >
                        {selectedPost ? 'Update Story' : 'Publish Story'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Tag Dialog */}
            <Dialog open={tagDialogOpen} onClose={() => setTagDialogOpen(false)} PaperProps={{ sx: { borderRadius: 4, width: 400 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>{selectedTag ? 'Edit Tag' : 'Create New Tag'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Tag Name"
                            value={metaFormData.name}
                            onChange={(e) => setMetaFormData({ ...metaFormData, name: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setTagDialogOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
                    <Button variant="contained" onClick={handleTagSubmit} sx={{ borderRadius: 2, fontWeight: 'bold' }}>
                        {selectedTag ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Category Dialog */}
            <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} PaperProps={{ sx: { borderRadius: 4, width: 450 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>{selectedCategory ? 'Edit Category' : 'Create New Category'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            fullWidth
                            label="Category Name"
                            value={metaFormData.name}
                            onChange={(e) => setMetaFormData({ ...metaFormData, name: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Description"
                            value={metaFormData.description}
                            onChange={(e) => setMetaFormData({ ...metaFormData, description: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setCategoryDialogOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
                    <Button variant="contained" onClick={handleCategorySubmit} sx={{ borderRadius: 2, fontWeight: 'bold' }}>
                        {selectedCategory ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Story Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Warning color="warning" /> Confirm Story Deletion
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>{selectedPost?.title}</strong>? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={confirmDelete} sx={{ borderRadius: 2, fontWeight: 'bold' }}>
                        Delete Permanently
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Meta Delete Confirmation */}
            <Dialog open={metaDeleteConfirmOpen} onClose={() => setMetaDeleteConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Warning color="warning" /> Delete {deleteTarget?.type === 'tag' ? 'Tag' : 'Category'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the {deleteTarget?.type} <strong>{deleteTarget?.name}</strong>?
                        This might affect how stories are categorized.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setMetaDeleteConfirmOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={confirmMetaDelete} sx={{ borderRadius: 2, fontWeight: 'bold' }}>
                        Confirm Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
