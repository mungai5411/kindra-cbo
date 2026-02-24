import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
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
    Divider,
    Paper,
    Breadcrumbs,
    Link as MuiLink,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    OutlinedInput,
    InputAdornment
} from '@mui/material';
import {
    Home as HomeIcon,
    VolunteerActivism as ImpactIcon,
    Add as AddIcon,
    NavigateNext as NextIcon,
    CheckCircle as CheckCircleIcon,
    Pending as PendingIcon,
    AttachMoney as MoneyIcon,
    Category as CategoryIcon,
    Collections as MediaIcon,
    Send as SendIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchImpacts, createImpact, submitImpactSummary, DonationImpact } from './impactSlice';
import { fetchMedia } from '../media/mediaSlice';

const ImpactTrackingView: React.FC = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { impacts, isLoading, error } = useAppSelector((state) => state.impact);
    const { assets } = useAppSelector((state) => state.media);
    const { user } = useAppSelector((state) => state.auth);
    const { shelters } = useAppSelector((state) => state.shelters);

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        impact_date: new Date().toISOString().split('T')[0],
        monetary_value: 0,
        shelter_home: '',
        media_ids: [] as string[]
    });

    useEffect(() => {
        dispatch(fetchImpacts());
        dispatch(fetchMedia());

        // Auto-select shelter if user is a partner
        if (shelters && shelters.length > 0) {
            setFormData(prev => ({ ...prev, shelter_home: shelters[0].id }));
        }
    }, [dispatch, shelters]);

    const handleFormChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMediaChange = (event: any) => {
        const { value } = event.target;
        setFormData(prev => ({
            ...prev,
            media_ids: typeof value === 'string' ? value.split(',') : value,
        }));
    };

    const handleCreateImpact = async () => {
        setIsSubmitting(true);
        try {
            await dispatch(createImpact(formData)).unwrap();
            setCreateDialogOpen(false);
            setFormData(prev => ({
                ...prev,
                title: '',
                description: '',
                monetary_value: 0,
                media_ids: []
            }));
        } catch (err) {
            console.error('Failed to create impact:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitSummary = async () => {
        const pendingImpacts = impacts.filter(i => !i.is_reported).map(i => i.id);
        if (pendingImpacts.length === 0) return;

        if (window.confirm(`Submit summary of ${pendingImpacts.length} impact records to admin?`)) {
            try {
                await dispatch(submitImpactSummary(pendingImpacts)).unwrap();
                dispatch(fetchImpacts());
            } catch (err) {
                console.error('Failed to submit summary:', err);
            }
        }
    };

    const getStatusChip = (isReported: boolean) => {
        if (isReported) {
            return (
                <Chip
                    icon={<CheckCircleIcon />}
                    label="Reported"
                    color="success"
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 1.5, fontWeight: 'bold' }}
                />
            );
        }
        return (
            <Chip
                icon={<PendingIcon />}
                label="Draft"
                color="warning"
                size="small"
                variant="outlined"
                sx={{ borderRadius: 1.5, fontWeight: 'bold' }}
            />
        );
    };

    const pendingCount = impacts.filter(i => !i.is_reported).length;

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
                        <ImpactIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                        Donation Impact
                    </Typography>
                </Breadcrumbs>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Impact Records
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Document how donations are making a difference in your shelter.
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {pendingCount > 0 && (
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<SendIcon />}
                                onClick={handleSubmitSummary}
                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                            >
                                Submit Summary ({pendingCount})
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setCreateDialogOpen(true)}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                textTransform: 'none',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)'
                            }}
                        >
                            Record New Impact
                        </Button>
                    </Box>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

            {/* Impact Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Impact Title</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Value (Est.)</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Media</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading && impacts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                    <CircularProgress size={24} sx={{ mr: 2 }} />
                                    <Typography variant="body2" color="text.secondary" display="inline">Loading impacts...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : impacts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                    <ImpactIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1, opacity: 0.5 }} />
                                    <Typography variant="body1" color="text.secondary">No impact records yet.</Typography>
                                    <Typography variant="body2" color="text.disabled">Start by recording the outcome of a recent donation.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            impacts.map((impact) => (
                                <TableRow key={impact.id} hover>
                                    <TableCell>{new Date(impact.impact_date).toLocaleDateString()}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{impact.title}</TableCell>
                                    <TableCell sx={{ maxWidth: 300 }}>
                                        <Typography variant="body2" noWrap title={impact.description}>
                                            {impact.description}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold">
                                            KES {Number(impact.monetary_value).toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            {impact.media_assets && impact.media_assets.length > 0 ? (
                                                impact.media_assets.slice(0, 3).map((asset: any) => (
                                                    <Box
                                                        key={asset.id}
                                                        component="img"
                                                        src={asset.file}
                                                        sx={{ width: 32, height: 32, borderRadius: 1, objectFit: 'cover' }}
                                                    />
                                                ))
                                            ) : (
                                                <Typography variant="caption" color="text.disabled">No media</Typography>
                                            )}
                                            {impact.media_assets && impact.media_assets.length > 1 && (
                                                <Typography variant="caption" sx={{ ml: 0.5, display: 'flex', alignItems: 'center' }}>
                                                    +{impact.media_assets.length}
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{getStatusChip(impact.is_reported)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create Dialog */}
            <Dialog
                open={createDialogOpen}
                onClose={() => !isSubmitting && setCreateDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>Record Donation Impact</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Impact Title"
                                name="title"
                                placeholder="e.g. Distributed school uniforms to 20 children"
                                value={formData.title}
                                onChange={handleFormChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Full Description"
                                name="description"
                                placeholder="Describe exactly what was achieved with the donation..."
                                value={formData.description}
                                onChange={handleFormChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Impact Date"
                                name="impact_date"
                                value={formData.impact_date}
                                onChange={handleFormChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Estimated Monetary Value"
                                name="monetary_value"
                                type="number"
                                value={formData.monetary_value}
                                onChange={handleFormChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">KES</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Attach Proof (from Library)</InputLabel>
                                <Select
                                    multiple
                                    value={formData.media_ids}
                                    onChange={handleMediaChange}
                                    input={<OutlinedInput label="Attach Proof (from Library)" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value: any) => {
                                                const asset = assets.find(a => a.id === value);
                                                return <Chip key={value} label={asset?.title || 'Photo'} size="small" />;
                                            })}
                                        </Box>
                                    )}
                                >
                                    {assets.map((asset) => (
                                        <MenuItem key={asset.id} value={asset.id}>
                                            <Checkbox checked={formData.media_ids.indexOf(asset.id) > -1} />
                                            <Box
                                                component="img"
                                                src={asset.file}
                                                sx={{ width: 30, height: 30, mr: 2, borderRadius: 0.5, objectFit: 'cover' }}
                                            />
                                            <ListItemText primary={asset.title || asset.file_name} />
                                        </MenuItem>
                                    ))}
                                    {assets.length === 0 && (
                                        <MenuItem disabled>No media in library. Upload some first.</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setCreateDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateImpact}
                        disabled={isSubmitting || !formData.title || !formData.description}
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : <ImpactIcon />}
                    >
                        {isSubmitting ? 'Recording...' : 'Save Impact Record'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ImpactTrackingView;
