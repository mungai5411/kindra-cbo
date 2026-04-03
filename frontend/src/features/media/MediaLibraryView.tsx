import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Alert,
    alpha,
    useTheme,
    Tooltip,
    Divider,
    Paper,
    Breadcrumbs,
    Link as MuiLink
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Image as ImageIcon,
    Home as HomeIcon,
    Collections as LibraryIcon,
    Info as InfoIcon,
    NavigateNext as NextIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchMedia, uploadMedia, deleteMedia, MediaAsset } from './mediaSlice';

const MediaLibraryView: React.FC = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { assets, isLoading, error } = useAppSelector((state) => state.media);
    const { user } = useAppSelector((state) => state.auth);

    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [altText, setAltText] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [currentAsset, setCurrentAsset] = useState<MediaAsset | null>(null);

    useEffect(() => {
        dispatch(fetchMedia());
    }, [dispatch]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setFilePreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', title);
        formData.append('alt_text', altText);
        formData.append('source_type', 'GENERAL'); // Default for now

        try {
            await dispatch(uploadMedia(formData)).unwrap();
            setUploadDialogOpen(false);
            resetUploadForm();
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const resetUploadForm = () => {
        setSelectedFile(null);
        setFilePreview(null);
        setTitle('');
        setAltText('');
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this asset?')) {
            try {
                await dispatch(deleteMedia(id)).unwrap();
            } catch (err) {
                console.error('Delete failed:', err);
            }
        }
    };

    const handleViewAsset = (asset: MediaAsset) => {
        setCurrentAsset(asset);
        setViewDialogOpen(true);
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Breadcrumbs separator={<NextIcon fontSize="small" />} sx={{ mb: 2 }}>
                    <MuiLink underline="hover" color="inherit" href="/dashboard" sx={{ display: 'flex', alignItems: 'center' }}>
                        <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                        Dashboard
                    </MuiLink>
                    <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <LibraryIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                        Media Library
                    </Typography>
                </Breadcrumbs>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Media Library
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage your shelter's photos, documents, and other digital assets.
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<UploadIcon />}
                        onClick={() => setUploadDialogOpen(true)}
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)'
                        }}
                    >
                        Upload Media
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

            {/* Stats/Info Bar */}
            <Paper sx={{ p: 2, mb: 4, borderRadius: 3, display: 'flex', alignItems: 'center', bgcolor: alpha(theme.palette.primary.main, 0.03), border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1) }}>
                <InfoIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="body2" color="text.secondary">
                    You have <Box component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{assets.length}</Box> assets in your library. These can be used when reporting donation impact or updating your shelter profile.
                </Typography>
            </Paper>

            {/* Media Grid */}
            {isLoading && assets.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
                    <CircularProgress />
                </Box>
            ) : assets.length === 0 ? (
                <Paper sx={{ p: 10, textAlign: 'center', borderRadius: 4, bgcolor: alpha(theme.palette.background.paper, 0.5), border: '2px dashed', borderColor: 'divider' }}>
                    <ImageIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>Your library is empty</Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>Upload photos of your shelter, activities, or donation distributions.</Typography>
                    <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => setUploadDialogOpen(true)}>
                        Start Uploading
                    </Button>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {assets.map((asset) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={asset.id}>
                            <Card sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: 3,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: theme.shadows[8]
                                }
                            }}>
                                <Box sx={{ position: 'relative', pt: '75%', overflow: 'hidden' }}>
                                    <CardMedia
                                        component="img"
                                        image={asset.file || 'https://via.placeholder.com/400x300?text=No+Image'}
                                        alt={asset.alt_text}
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        display: 'flex',
                                        gap: 1
                                    }}>
                                        <IconButton
                                            size="small"
                                            sx={{ bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: '#fff' } }}
                                            onClick={() => handleViewAsset(asset)}
                                        >
                                            <ViewIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                    <Typography variant="subtitle2" noWrap fontWeight="bold">
                                        {asset.title || asset.file_name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Uploaded: {new Date(asset.created_at).toLocaleDateString()}
                                    </Typography>
                                </CardContent>
                                <Divider />
                                <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        {(asset.file_size / 1024 / 1024).toFixed(2)} MB
                                    </Typography>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(asset.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Upload Dialog */}
            <Dialog
                open={uploadDialogOpen}
                onClose={() => !isUploading && setUploadDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>Upload New Media</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {!filePreview ? (
                            <Box
                                sx={{
                                    border: '2px dashed',
                                    borderColor: 'divider',
                                    borderRadius: 3,
                                    p: 5,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    '&:hover': { borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.02) }
                                }}
                                onClick={() => document.getElementById('media-upload-input')?.click()}
                            >
                                <UploadIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                <Typography>Click to select or drag and drop</Typography>
                                <Typography variant="caption" color="text.secondary">PNG, JPG or WEBP (Max 10MB)</Typography>
                                <input
                                    id="media-upload-input"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                            </Box>
                        ) : (
                            <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', mb: 2 }}>
                                <img src={filePreview} alt="Preview" style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }} />
                                <IconButton
                                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff' }}
                                    onClick={() => { setSelectedFile(null); setFilePreview(null); }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        )}

                        <TextField
                            fullWidth
                            label="Title"
                            placeholder="e.g. Activity distribution photo"
                            variant="outlined"
                            margin="normal"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            sx={{ borderRadius: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Alt Text"
                            placeholder="Brief description for accessibility"
                            variant="outlined"
                            margin="normal"
                            value={altText}
                            onChange={(e) => setAltText(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setUploadDialogOpen(false)} disabled={isUploading}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleUpload}
                        disabled={!selectedFile || isUploading}
                        startIcon={isUploading ? <CircularProgress size={20} /> : <UploadIcon />}
                    >
                        {isUploading ? 'Uploading...' : 'Upload Asset'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                {currentAsset && (
                    <>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" fontWeight="bold">{currentAsset.title || currentAsset.file_name}</Typography>
                            <IconButton onClick={() => setViewDialogOpen(false)} size="small"><DeleteIcon sx={{ transform: 'rotate(45deg)' }} /></IconButton>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                                <Box sx={{ flex: 2 }}>
                                    <img src={currentAsset.file} alt={currentAsset.alt_text} style={{ width: '100%', borderRadius: 8 }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary">File Details</Typography>
                                    <Grid container spacing={1} sx={{ mt: 1 }}>
                                        <Grid item xs={12}>
                                            <Typography variant="caption" fontWeight="bold" display="block">Type:</Typography>
                                            <Typography variant="body2">{currentAsset.source_type}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="caption" fontWeight="bold" display="block">Size:</Typography>
                                            <Typography variant="body2">{(currentAsset.file_size / 1024 / 1024).toFixed(2)} MB</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="caption" fontWeight="bold" display="block">Dimensions:</Typography>
                                            <Typography variant="body2">Original resolution</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="caption" fontWeight="bold" display="block">Alt Text:</Typography>
                                            <Typography variant="body2">{currentAsset.alt_text || 'None provided'}</Typography>
                                        </Grid>
                                    </Grid>
                                    <Divider sx={{ my: 2 }} />
                                    <Button variant="outlined" fullWidth onClick={() => window.open(currentAsset.file, '_blank')}>
                                        Open Full Image
                                    </Button>
                                </Box>
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default MediaLibraryView;
