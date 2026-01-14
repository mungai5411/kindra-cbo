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
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Shelter Operations Overview</Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                    <StatsCard
                        title="Network Occupancy"
                        value={`${Math.round((stats.currentOccupancy / stats.totalCapacity) * 100)}%`}
                        color={theme.palette.primary.main}
                        icon={<People />}
                        subtitle={`${stats.currentOccupancy} / ${stats.totalCapacity} beds`}
                        delay={0}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatsCard
                        title="Compliance Status"
                        value={`${stats.complianceRate}%`}
                        color={theme.palette.success.main}
                        icon={<CheckCircle />}
                        subtitle="Audit score"
                        delay={0.1}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatsCard
                        title="Verified Homes"
                        value={String(stats.totalShelters)}
                        color={theme.palette.info.main}
                        icon={<Home />}
                        subtitle="Operational nodes"
                        delay={0.2}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <ShelterCapacityChart shelters={shelters} />
                </Grid>
                <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), boxShadow: theme.shadows[1], height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Warning color="warning" /> Operational Alerts
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, overflowY: 'auto', maxHeight: 350 }}>
                            {alerts.length > 0 ? alerts.map((a: any, idx) => (
                                <Box key={idx} sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                                    color: theme.palette.warning.dark,
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.warning.main, 0.2)
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Typography variant="subtitle2" fontWeight="bold">{a.title}</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                            {new Date(a.created_at).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, lineHeight: 1.4 }}>{a.description}</Typography>
                                </Box>
                            )) : (
                                <Box sx={{
                                    p: 4,
                                    textAlign: 'center',
                                    bgcolor: 'action.hover',
                                    borderRadius: 3,
                                    border: '1px dashed',
                                    borderColor: 'divider'
                                }}>
                                    <Typography color="text.secondary" fontWeight="medium">All systems operational.</Typography>
                                    <Typography variant="caption" color="text.secondary">No active alerts reported.</Typography>
                                </Box>
                            )}
                        </Box>
                        <Button
                            fullWidth
                            variant="contained"
                            color="warning"
                            onClick={handleOpenModal}
                            sx={{ mt: 2, borderRadius: 2, fontWeight: 'bold', boxShadow: theme.shadows[1], py: 1 }}
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
