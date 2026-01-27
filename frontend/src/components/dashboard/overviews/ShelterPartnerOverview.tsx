import { useState } from 'react';
import {
    Box, Typography, Grid, Paper, Button, useTheme, alpha,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    MenuItem, Snackbar, Alert, CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import { Home, People, CheckCircle, Warning, Send } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
import { createResourceRequest } from '../../../features/shelters/shelterSlice';
import { StatsCard } from '../StatCards';
import { ShelterCapacityChart } from '../../charts/DashboardCharts';

interface ShelterPartnerOverviewProps {
    user: any;
    stats: {
        totalShelters: number;
        totalCapacity: number;
        currentOccupancy: number;
        complianceRate: number;
    };
    shelters: any[];
    alerts: any[];
}

const RESOURCE_TYPES = [
    { value: 'FOOD', label: 'Food' },
    { value: 'CLOTHING', label: 'Clothing' },
    { value: 'MEDICAL', label: 'Medical Supplies' },
    { value: 'EDUCATIONAL', label: 'Educational Materials' },
    { value: 'BEDDING', label: 'Bedding' },
    { value: 'OTHER', label: 'Other' },
];

const PRIORITIES = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
];

export const ShelterPartnerOverview = ({ stats, shelters, alerts }: ShelterPartnerOverviewProps) => {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const [openRequestModal, setOpenRequestModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        shelter_home: shelters[0]?.id || '',
        item_category: 'FOOD',
        items_description: '',
        priority: 'MEDIUM',
        needed_by: ''
    });

    const handleOpenModal = () => {
        if (shelters.length > 0) {
            setFormData(prev => ({ ...prev, shelter_home: shelters[0].id }));
        }
        setOpenRequestModal(true);
    };

    const handleCloseModal = () => {
        setOpenRequestModal(false);
        setFormData({
            shelter_home: shelters[0]?.id || '',
            item_category: 'FOOD',
            items_description: '',
            priority: 'MEDIUM',
            needed_by: ''
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await dispatch(createResourceRequest(formData)).unwrap();
            setShowSuccess(true);
            handleCloseModal();
        } catch (error) {
            console.error('Failed to submit request:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            sx={{ mt: 1 }}
        >
            <Box sx={{
                display: 'flex',
                gap: 3,
                mb: 6,
                overflowX: { xs: 'auto', sm: 'unset' },
                pb: { xs: 2, sm: 0 },
                px: { xs: 0.5, sm: 0.5 },
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
                flexWrap: { xs: 'nowrap', sm: 'wrap' }
            }}>
                <Box sx={{ minWidth: { xs: 260, sm: 'calc(50% - 12px)', md: 'calc(33.33% - 20px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Network Occupancy"
                        value={`${Math.round((stats.currentOccupancy / stats.totalCapacity) * 100)}%`}
                        color="#519755"
                        icon={<People />}
                        subtitle={`${stats.currentOccupancy} / ${stats.totalCapacity} beds`}
                        delay={0.1}
                    />
                </Box>
                <Box sx={{ minWidth: { xs: 260, sm: 'calc(50% - 12px)', md: 'calc(33.33% - 20px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Compliance Status"
                        value={`${stats.complianceRate}%`}
                        color="#5D5FEF"
                        icon={<CheckCircle />}
                        subtitle="Audit score"
                        delay={0.2}
                    />
                </Box>
                <Box sx={{ minWidth: { xs: 260, sm: 'calc(50% - 12px)', md: 'calc(33.33% - 20px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Verified Homes"
                        value={String(stats.totalShelters)}
                        color="#FF708B"
                        icon={<Home />}
                        subtitle="Operational nodes"
                        delay={0.3}
                    />
                </Box>
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} lg={8}>
                    <ShelterCapacityChart shelters={shelters} />
                </Grid>
                <Grid item xs={12} lg={4}>
                    <Paper elevation={0} sx={{
                        p: 3,
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.08),
                        bgcolor: 'background.paper',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1, letterSpacing: -0.5 }}>
                                <Warning sx={{ color: 'warning.main' }} /> Operational Alerts
                            </Typography>
                            {alerts.length > 0 && (
                                <Box sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: 'warning.main',
                                    animation: 'pulse 2s infinite ease-in-out',
                                    '@keyframes pulse': {
                                        '0%': { transform: 'scale(0.8)', opacity: 0.5 },
                                        '50%': { transform: 'scale(1.2)', opacity: 1 },
                                        '100%': { transform: 'scale(0.8)', opacity: 0.5 },
                                    }
                                }} />
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, overflowY: 'auto', maxHeight: 350, pr: 1 }}>
                            {alerts.length > 0 ? alerts.map((a: any, idx) => (
                                <Paper key={idx} elevation={0} sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    bgcolor: alpha(theme.palette.warning.main, 0.04),
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.warning.main, 0.1),
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.warning.main, 0.08),
                                        transform: 'translateX(4px)'
                                    }
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'warning.dark' }}>{a.title}</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.65rem' }}>
                                            {new Date(a.created_at).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.4, fontWeight: 500, color: 'text.secondary' }}>
                                        {a.description}
                                    </Typography>
                                </Paper>
                            )) : (
                                <Box sx={{
                                    p: 6,
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 2,
                                    opacity: 0.5
                                }}>
                                    <CheckCircle sx={{ fontSize: 48, color: 'success.main', opacity: 0.2 }} />
                                    <Box>
                                        <Typography variant="body2" fontWeight="800">All Clear</Typography>
                                        <Typography variant="caption">No active alerts reported.</Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            disableElevation
                            onClick={handleOpenModal}
                            sx={{
                                mt: 4,
                                borderRadius: 3,
                                fontWeight: 800,
                                py: 1.5,
                                textTransform: 'none',
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`
                                }
                            }}
                        >
                            Request Resources
                        </Button>
                    </Paper>
                </Grid>
            </Grid>

            {/* Resource Request Modal */}
            <Dialog
                open={openRequestModal}
                onClose={handleCloseModal}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 2 } }}
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>New Resource Request</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Select Shelter"
                                    value={formData.shelter_home}
                                    onChange={(e) => setFormData({ ...formData, shelter_home: e.target.value })}
                                    required
                                >
                                    {shelters.map((s) => (
                                        <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Category"
                                    value={formData.item_category}
                                    onChange={(e) => setFormData({ ...formData, item_category: e.target.value })}
                                    required
                                >
                                    {RESOURCE_TYPES.map((type) => (
                                        <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Priority"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    required
                                >
                                    {PRIORITIES.map((p) => (
                                        <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Items & Specific Details"
                                    placeholder="e.g. 50kg rice, 20 liters cooking oil, medical kits..."
                                    value={formData.items_description}
                                    onChange={(e) => setFormData({ ...formData, items_description: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Needed By"
                                    InputLabelProps={{ shrink: true }}
                                    value={formData.needed_by}
                                    onChange={(e) => setFormData({ ...formData, needed_by: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={handleCloseModal} sx={{ borderRadius: 2 }}>Cancel</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            startIcon={isSubmitting ? <CircularProgress size={20} /> : <Send />}
                            sx={{ borderRadius: 2, px: 3, fontWeight: 'bold' }}
                        >
                            Submit Request
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Snackbar
                open={showSuccess}
                autoHideDuration={6000}
                onClose={() => setShowSuccess(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%', borderRadius: 3 }}>
                    Resource request submitted successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
};
