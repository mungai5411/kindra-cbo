import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Box,
    Typography,
    Paper,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    Grid,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Alert,
    useTheme,
    alpha,
    Snackbar
} from '@mui/material';
import {
    VolunteerActivism,
    MonetizationOn,
    Receipt,
    Add,
    Payment,
    AccountBalanceWallet,
    Refresh,
    PhoneAndroid,
    CreditCard,
    DonutLarge,
    LocationOn,
    Schedule,
    Event as EventIcon
} from '@mui/icons-material';
import { FundAllocationChart } from '../charts/DashboardCharts';
import { RootState, AppDispatch } from '../../store';
import {
    fetchCampaigns,
    fetchDonations,
    fetchDonors,
    fetchReceipts,
    fetchMaterialDonations,
    addMaterialDonation,
    updateCampaign,
    updateDonation,
    processPayment,
    completeCampaign,
    deleteCampaign,
    approveMaterialDonation,
    rejectMaterialDonation,
    updateDonor
} from '../../features/donations/donationsSlice';
import { fetchEvents } from '../../features/volunteers/volunteersSlice';
import { getRandomMessage } from '../../utils/heartwarmingMessages';
import { SubTabView } from './SubTabView';
import { motion } from 'framer-motion';
import { StatsCard } from './StatCards';
import { ConfirmationDialog } from './ConfirmationDialog';
import { downloadFile } from '../../utils/downloadHelper';

interface DonationsViewProps {
    setOpenDialog?: (open: boolean) => void;
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
}

export function DonationsView({ setOpenDialog, activeTab, onTabChange }: DonationsViewProps) {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { campaigns, donations, donors, receipts, materialDonations } = useSelector((state: RootState) => state.donations);
    const { events: volunteerEvents } = useSelector((state: RootState) => state.volunteers);
    const user = useSelector((state: RootState) => state.auth.user);
    const userRole = user?.role;
    const isManagement = ['ADMIN', 'MANAGEMENT', 'SOCIAL_MEDIA'].includes(userRole || '');
    const isDonor = userRole === 'DONOR';

    // Update Status Dialog State
    const [openStatusDialog, setOpenStatusDialog] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
    const [newStatus, setNewStatus] = useState('');
    const [impactData, setImpactData] = useState('');

    // Donation Simulation State
    const [openDonationDialog, setOpenDonationDialog] = useState(false);
    const [donationAmount, setDonationAmount] = useState(1000);
    const [donationMethod, setDonationMethod] = useState<'mpesa' | 'paypal' | 'stripe'>('mpesa');
    const [donorPhone, setDonorPhone] = useState('254700000000');
    const [donorName, setDonorName] = useState('Test Donor');

    // Donation Status Update State
    const [openDonationStatusDialog, setOpenDonationStatusDialog] = useState(false);
    const [selectedDonation, setSelectedDonation] = useState<any>(null);
    const [donationStatus, setDonationStatus] = useState('');

    // Material Donation State
    const [openMaterialDialog, setOpenMaterialDialog] = useState(false);
    const [materialForm, setMaterialForm] = useState({
        category: 'CLOTHES',
        description: '',
        quantity: '',
        pickup_address: '',
        preferred_pickup_date: new Date().toISOString().split('T')[0],
        preferred_pickup_time: 'Morning (9 AM - 12 PM)'
    });

    // Donor Edit State
    const [openDonorEditDialog, setOpenDonorEditDialog] = useState(false);
    const [selectedDonor, setSelectedDonor] = useState<any>(null);
    const [donorEditForm, setDonorEditForm] = useState({
        full_name: '',
        email: '',
        donor_type: 'INDIVIDUAL',
        country: '',
        city: '',
        address: '',
        organization_name: ''
    });

    const [showAllDonations, setShowAllDonations] = useState(false);

    // Confirmation & Notification State
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        severity?: 'info' | 'warning' | 'error';
    }>({
        open: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'info' | 'warning' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'info'
    });

    const getImpactRank = (total: number) => {
        if (total >= 250000) return 'Platinum Partner';
        if (total >= 50000) return 'Gold Partner';
        if (total >= 10000) return 'Silver Partner';
        return 'Bronze Partner';
    };

    // Initial mounting fetch
    useEffect(() => {
        dispatch(fetchCampaigns());
        dispatch(fetchDonations());
        dispatch(fetchDonors());
        dispatch(fetchReceipts());
        dispatch(fetchMaterialDonations());
        dispatch(fetchEvents());

        const handleOpenExternalDonation = (e: any) => {
            if (e.detail) {
                handleOpenDonationDialog(e.detail);
            }
        };

        window.addEventListener('open-donation-dialog', handleOpenExternalDonation);
        return () => window.removeEventListener('open-donation-dialog', handleOpenExternalDonation);
    }, [dispatch]);

    // Update local donor state when user or donors list changes
    useEffect(() => {
        if (user && isDonor) {
            setDonorName(`${user.firstName} ${user.lastName}`);
            // Find donor phone if available in donors list
            const currentDonor = donors.find((d: any) => d.email === user.email || d.user === user.id);
            if (currentDonor?.phone_number) setDonorPhone(currentDonor.phone_number);
        }
    }, [user, isDonor, donors]);

    const handleOpenStatusDialog = (campaign: any) => {
        setSelectedCampaign(campaign);
        setNewStatus(campaign.status);
        setImpactData(campaign.success_story || '');
        setOpenStatusDialog(true);
    };

    const handleUpdateStatus = () => {
        if (!selectedCampaign) return;

        dispatch(updateCampaign({
            id: selectedCampaign.slug,
            data: {
                status: newStatus,
                success_story: impactData,
                is_completed: newStatus === 'SUCCESS' || newStatus === 'COMPLETED'
            }
        }));

        setOpenStatusDialog(false);
    };

    const handleCompleteCampaign = (id: string | number) => {
        setConfirmDialog({
            open: true,
            title: 'Complete Campaign',
            message: 'Are you sure you want to mark this campaign as COMPLETED?',
            severity: 'info',
            onConfirm: () => {
                dispatch(completeCampaign(id));
                setConfirmDialog(prev => ({ ...prev, open: false }));
                setSnackbar({ open: true, message: 'Campaign marked as completed', severity: 'success' });
            }
        });
    };

    const handleDeleteCampaign = (id: string | number) => {
        setConfirmDialog({
            open: true,
            title: 'Delete Campaign',
            message: 'Are you sure you want to DELETE this campaign? This action cannot be undone.',
            severity: 'error',
            onConfirm: () => {
                dispatch(deleteCampaign(id));
                setConfirmDialog(prev => ({ ...prev, open: false }));
                setSnackbar({ open: true, message: 'Campaign deleted successfully', severity: 'success' });
            }
        });
    };

    const handleOpenDonationStatusDialog = (donation: any) => {
        setSelectedDonation(donation);
        setDonationStatus(donation.status);
        setOpenDonationStatusDialog(true);
    };

    const handleUpdateDonationStatus = () => {
        if (!selectedDonation) return;

        dispatch(updateDonation({
            id: selectedDonation.id,
            data: { status: donationStatus }
        })).then(() => {
            // Generate heartwarming notification if verified/completed
            if (donationStatus === 'COMPLETED' || donationStatus === 'VERIFIED') {
                const message = getRandomMessage('VERIFICATION');
                const newNotification = {
                    id: Date.now().toString(),
                    type: 'success',
                    title: 'Collection Verified',
                    message: message,
                    time: 'Just now',
                    read: false,
                    category: 'DONATION',
                    targetRoles: ['ADMIN', 'MANAGEMENT', 'DONOR', 'SOCIAL_MEDIA'] // Donation-related roles
                };

                const existing = JSON.parse(sessionStorage.getItem('notifications') || '[]');
                sessionStorage.setItem('notifications', JSON.stringify([newNotification, ...existing]));
                window.dispatchEvent(new CustomEvent('storage'));
            }
        });

        setOpenDonationStatusDialog(false);
    };

    const handleOpenDonationDialog = (campaign: any) => {
        setSelectedCampaign(campaign);
        setOpenDonationDialog(true);
    };

    const handleSimulateDonation = () => {
        if (!selectedCampaign) return;

        const data: any = {
            amount: donationAmount,
            campaign: selectedCampaign.id,
            donor_name: donorName,
            donor_email: user?.email,
            donor: user?.donorId
        };

        if (donationMethod === 'mpesa') {
            data.phone_number = donorPhone;
        } else if (donationMethod === 'paypal') {
            data.order_id = `PAYPAL-${Math.random().toString(36).substring(7).toUpperCase()}`;
        } else {
            data.token = `STRIPE-${Math.random().toString(36).substring(7).toUpperCase()}`;
        }

        dispatch(processPayment({ method: donationMethod, data }));
        setOpenDonationDialog(false);
    };

    const handleApproveMaterial = (id: string) => {
        setConfirmDialog({
            open: true,
            title: 'Approve Pickup',
            message: 'Are you sure you want to approve this material pickup?',
            severity: 'info',
            onConfirm: () => {
                dispatch(approveMaterialDonation(id));
                setConfirmDialog(prev => ({ ...prev, open: false }));
                setSnackbar({ open: true, message: 'Material donation approved', severity: 'success' });
            }
        });
    };

    const handleRejectMaterial = (id: string) => {
        setConfirmDialog({
            open: true,
            title: 'Reject Donation',
            message: 'Are you sure you want to reject this material donation request?',
            severity: 'warning',
            onConfirm: () => {
                dispatch(rejectMaterialDonation(id));
                setConfirmDialog(prev => ({ ...prev, open: false }));
                setSnackbar({ open: true, message: 'Material donation rejected', severity: 'warning' });
            }
        });
    };

    const handleSubmitMaterial = () => {
        dispatch(addMaterialDonation(materialForm));
        setOpenMaterialDialog(false);
        setMaterialForm({
            category: 'CLOTHES',
            description: '',
            quantity: '',
            pickup_address: '',
            preferred_pickup_date: new Date().toISOString().split('T')[0],
            preferred_pickup_time: 'Morning (9 AM - 12 PM)'
        });
    };

    const handleOpenDonorEditDialog = (donor: any) => {
        setSelectedDonor(donor);
        setDonorEditForm({
            full_name: donor.full_name || donor.name || '',
            email: donor.email || '',
            donor_type: donor.donor_type || 'INDIVIDUAL',
            country: donor.country || '',
            city: donor.city || '',
            address: donor.address || '',
            organization_name: donor.organization_name || ''
        });
        setOpenDonorEditDialog(true);
    };

    const handleUpdateDonorProfile = () => {
        if (!selectedDonor) return;
        dispatch(updateDonor({ id: selectedDonor.id, data: donorEditForm }));
        setOpenDonorEditDialog(false);
    };

    const StatusChip = ({ status }: { status: string }) => {
        let color = theme.palette.info.main;
        let bgcolor = alpha(theme.palette.info.main, 0.08);

        if (status === 'ACTIVE') {
            color = theme.palette.success.main;
            bgcolor = alpha(theme.palette.success.main, 0.08);
        } else if (status === 'COMPLETED' || status === 'SUCCESS') {
            color = theme.palette.primary.main;
            bgcolor = alpha(theme.palette.primary.main, 0.08);
        } else if (status === 'PAUSED' || status === 'CANCELLED') {
            color = theme.palette.warning.main;
            bgcolor = alpha(theme.palette.warning.main, 0.08);
        }

        return (
            <Chip
                label={status}
                size="small"
                sx={{
                    fontWeight: 900,
                    fontSize: '0.65rem',
                    letterSpacing: 0.5,
                    borderRadius: 1.5,
                    bgcolor: bgcolor,
                    color: color,
                    border: 'none'
                }}
            />
        );
    };

    const renderCampaigns = () => (
        <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                    {isDonor ? 'Join a Cause' : 'Active Campaigns'}
                </Typography>
                {isManagement && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpenDialog?.(true)}
                        sx={{
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 800,
                            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
                            px: 3,
                            py: 1
                        }}
                    >
                        Create Campaign
                    </Button>
                )}
            </Box>
            <Grid container spacing={3}>
                {campaigns.filter((c: any) => isManagement || c.status !== 'DRAFT').map((camp: any) => (
                    <Grid item xs={12} md={4} key={camp.id}>
                        <Paper sx={{
                            p: 3,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 4,
                            border: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.08),
                            bgcolor: alpha(theme.palette.background.paper, 0.6),
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                borderColor: alpha(theme.palette.primary.main, 0.2),
                                boxShadow: '0 12px 40px rgba(0,0,0,0.08)'
                            }
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5, lineHeight: 1.2 }}>
                                    {camp.title}
                                </Typography>
                                <StatusChip status={camp.status} />
                            </Box>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, flexGrow: 1, fontWeight: 500, lineHeight: 1.6 }}>
                                {camp.description || 'System initialization pending for campaign narrative.'}
                            </Typography>

                            <Box sx={{ mb: 3, bgcolor: alpha(theme.palette.background.default, 0.3), p: 2, borderRadius: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 0.5 }}>
                                        TARGET: KES {(camp.target_amount || 0).toLocaleString()}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1), px: 1, py: 0.25, borderRadius: 1 }}>
                                        {camp.target_amount > 0 ? Math.round(((camp.raised_amount || 0) / camp.target_amount) * 100) : 0}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={camp.target_amount > 0 ? Math.min(((camp.raised_amount || 0) / camp.target_amount) * 100, 100) : 0}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                        '& .MuiLinearProgress-bar': { borderRadius: 3 }
                                    }}
                                />
                                <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>SECURED FUNDING</Typography>
                                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 900 }}>KES {(camp.raised_amount || 0).toLocaleString()}</Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 'auto' }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {isManagement && (
                                        <>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                color="success"
                                                disabled={camp.status === 'COMPLETED'}
                                                onClick={() => handleCompleteCampaign(camp.slug)}
                                                sx={{
                                                    flex: 1,
                                                    borderRadius: 2,
                                                    textTransform: 'none',
                                                    fontWeight: 800,
                                                    fontSize: '0.7rem',
                                                    py: 0.75,
                                                    borderColor: alpha(theme.palette.success.main, 0.3),
                                                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.05), borderColor: 'success.main' }
                                                }}
                                            >
                                                Finalize
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteCampaign(camp.slug)}
                                                sx={{
                                                    flex: 1,
                                                    borderRadius: 2,
                                                    textTransform: 'none',
                                                    fontWeight: 800,
                                                    fontSize: '0.7rem',
                                                    py: 0.75,
                                                    borderColor: alpha(theme.palette.error.main, 0.3),
                                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.05), borderColor: 'error.main' }
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </>
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {isManagement && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleOpenStatusDialog(camp)}
                                            sx={{
                                                flex: 1,
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 800,
                                                fontSize: '0.7rem',
                                                py: 0.75,
                                                borderColor: 'divider',
                                                color: 'text.secondary',
                                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), borderColor: 'primary.main', color: 'primary.main' }
                                            }}
                                        >
                                            Metadata
                                        </Button>
                                    )}
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<Payment sx={{ fontSize: '0.9rem' }} />}
                                        onClick={() => handleOpenDonationDialog(camp)}
                                        sx={{
                                            flex: 1,
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: 900,
                                            fontSize: '0.75rem',
                                            py: 0.75,
                                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                                            '&:hover': {
                                                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                                                transform: 'translateY(-1px)'
                                            }
                                        }}
                                    >
                                        Initiate Contribution
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
                {campaigns.filter((c: any) => isManagement || c.status !== 'DRAFT').length === 0 && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, border: '2px dashed', borderColor: alpha(theme.palette.divider, 0.1), bgcolor: alpha(theme.palette.background.paper, 0.3) }}>
                            <VolunteerActivism sx={{ fontSize: 60, color: 'primary.main', opacity: 0.2, mb: 2 }} />
                            <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 900 }}>No Active Protocols Found</Typography>
                            <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 600 }}>Start a new campaign mission to initialize the donation engine.</Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>

            {/* Status Update Dialog */}
            <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 4, boxShadow: theme.shadows[10] } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Update Campaign Progress</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            Managing status for: <strong>{selectedCampaign?.title}</strong>
                        </Typography>
                        <TextField
                            fullWidth
                            select
                            label="New Status"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        >
                            <MenuItem value="ACTIVE">Active (Ongoing)</MenuItem>
                            <MenuItem value="SUCCESS">Success (Goal Met)</MenuItem>
                            <MenuItem value="COMPLETED">Completed (Finished)</MenuItem>
                            <MenuItem value="PAUSED">Paused</MenuItem>
                            <MenuItem value="CANCELLED">Cancelled</MenuItem>
                        </TextField>

                        {(newStatus === 'SUCCESS' || newStatus === 'COMPLETED') && (
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Campaign Impact / Success Details"
                                placeholder="Describe what this campaign achieved..."
                                value={impactData}
                                onChange={(e) => setImpactData(e.target.value)}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                        )}

                        {newStatus === 'SUCCESS' && (
                            <Alert severity="success" sx={{ borderRadius: 2 }}>
                                Marking as success will notify donors and update the impact dashboard.
                            </Alert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setOpenStatusDialog(false)} sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Dismiss</Button>
                    <Button variant="contained" onClick={handleUpdateStatus} sx={{ borderRadius: 3, px: 4, fontWeight: 'bold' }}>
                        Save Updates
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Donation Simulation Dialog */}
            <Dialog open={openDonationDialog} onClose={() => setOpenDonationDialog(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 4, boxShadow: theme.shadows[10] } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Simulate Gateway Payment</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            Testing payment for: <strong>{selectedCampaign?.title}</strong>
                        </Typography>

                        <TextField
                            fullWidth
                            label="Amount (KES)"
                            type="number"
                            value={donationAmount}
                            onChange={(e) => setDonationAmount(Number(e.target.value))}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            InputProps={{
                                startAdornment: <Typography color="text.secondary" sx={{ mr: 1 }}>KES</Typography>
                            }}
                        />

                        <TextField
                            fullWidth
                            select
                            label="Payment Provider"
                            value={donationMethod}
                            onChange={(e) => setDonationMethod(e.target.value as any)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        >
                            <MenuItem value="mpesa">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PhoneAndroid fontSize="small" /> M-Pesa (Kenya)</Box>
                            </MenuItem>
                            <MenuItem value="paypal">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><AccountBalanceWallet fontSize="small" /> PayPal Global</Box>
                            </MenuItem>
                            <MenuItem value="stripe">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CreditCard fontSize="small" /> Stripe Infrastructure</Box>
                            </MenuItem>
                        </TextField>

                        <TextField
                            fullWidth
                            label="Donor Name"
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />

                        {donationMethod === 'mpesa' && (
                            <TextField
                                fullWidth
                                label="M-Pesa Number"
                                value={donorPhone}
                                onChange={(e) => setDonorPhone(e.target.value)}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                        )}

                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            This will trigger the backend simulation loop, updating campaign totals and generating a receipt.
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setOpenDonationDialog(false)} sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Cancel</Button>
                    <Button variant="contained" color="secondary" onClick={handleSimulateDonation} sx={{ borderRadius: 3, px: 4, fontWeight: 'bold' }}>
                        Confirm Payment
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );

    const displayDonations = isDonor
        ? (donations || []).filter((d: any) =>
            (user?.email && d.donor_email === user.email) ||
            (user?.donorId && d.donor === user.donorId)
        )
        : (donations || []);

    const displayReceipts = isDonor
        ? (receipts || []).filter((r: any) =>
            (user?.email && r.donor_email === user.email) ||
            (user?.donorId && r.donor === user.donorId)
        )
        : (receipts || []);

    const renderDonations = () => (
        <Paper sx={{
            p: 0,
            borderRadius: 4,
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.08),
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
            overflow: 'hidden'
        }}>
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.05) }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
                        {isDonor ? 'My Donation History' : 'Recent Donation Registry'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Immutable ledger of financial contributions</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={() => dispatch(fetchDonations())}
                        sx={{
                            borderRadius: 2.5,
                            textTransform: 'none',
                            fontWeight: 800,
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), borderColor: 'primary.main' }
                        }}
                    >
                        Sync Records
                    </Button>
                    {isManagement && (
                        <Button
                            variant="contained"
                            startIcon={<Receipt />}
                            onClick={async () => {
                                try {
                                    setSnackbar({ open: true, message: 'Preparing your export, please wait...', severity: 'info' });
                                    const url = `/reporting/reports/?instant_export=true&report_type=DONATION&format=CSV`;
                                    await downloadFile(url, 'Donations_Export.csv');
                                    setSnackbar({ open: true, message: 'Export completed successfully.', severity: 'success' });
                                } catch (err) {
                                    setSnackbar({ open: true, message: 'Export failed. Please try again.', severity: 'error' });
                                }
                            }}
                            sx={{
                                borderRadius: 2.5,
                                textTransform: 'none',
                                fontWeight: 800,
                                boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                                px: 3
                            }}
                        >
                            Export CSV
                        </Button>
                    )}
                </Box>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Donor</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Method</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Date</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(showAllDonations ? (displayDonations || []) : (displayDonations || []).slice(0, 4)).map((d: any) => (
                            <TableRow key={d.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                <TableCell sx={{ py: 2.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{d.donor_name || 'Anonymous Donor'}</Typography>
                                </TableCell>
                                <TableCell sx={{ py: 2.5 }}>
                                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 900 }}>KES {(d.amount || 0).toLocaleString()}</Typography>
                                </TableCell>
                                <TableCell sx={{ py: 2.5 }}>
                                    <Chip
                                        label={d.payment_method}
                                        size="small"
                                        sx={{
                                            fontWeight: 800,
                                            fontSize: '0.65rem',
                                            textTransform: 'uppercase',
                                            bgcolor: alpha(theme.palette.divider, 0.05),
                                            borderRadius: 1
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={{ py: 2.5 }}>
                                    <StatusChip status={d.status} />
                                </TableCell>
                                <TableCell sx={{ py: 2.5, color: 'text.secondary', fontWeight: 600, fontSize: '0.85rem' }}>
                                    {(() => {
                                        const dateVal = d.donation_date || d.created_at || d.date;
                                        if (!dateVal) return 'N/A';
                                        const date = new Date(dateVal);
                                        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
                                    })()}
                                </TableCell>
                                <TableCell align="right" sx={{ py: 2.5 }}>
                                    {isManagement && (
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleOpenDonationStatusDialog(d)}
                                            sx={{
                                                borderRadius: 1.5,
                                                textTransform: 'none',
                                                fontWeight: 800,
                                                fontSize: '0.7rem',
                                                borderColor: 'divider',
                                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), borderColor: 'primary.main' }
                                            }}
                                        >
                                            Metadata
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {(donations?.length || 0) === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 12 }}>
                                    <MonetizationOn sx={{ fontSize: 48, opacity: 0.1, mb: 1, color: 'primary.main' }} />
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>System registry is currently idle.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            {(displayDonations || []).length > 4 && (
                <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid', borderColor: alpha(theme.palette.divider, 0.05) }}>
                    <Button
                        size="small"
                        onClick={() => setShowAllDonations(!showAllDonations)}
                        sx={{ textTransform: 'none', fontWeight: 900, color: 'primary.main', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
                    >
                        {showAllDonations ? 'Collapse Records' : `Expand Registry (${(displayDonations || []).length} items)`}
                    </Button>
                </Box>
            )}
        </Paper>
    );

    const renderDonors = () => (
        <Paper sx={{
            p: 0,
            borderRadius: 4,
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.08),
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
            overflow: 'hidden'
        }}>
            <Box sx={{ p: 4, borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.05) }}>
                <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>Philanthropic Partner Registry</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Active network of systemic change agents</Typography>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Partner Identity</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Contact Array</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Lifetime Impact</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Frequency</TableCell>
                            {isManagement && <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Protocol</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(donors || []).map((donor: any) => (
                            <TableRow key={donor.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                <TableCell sx={{ py: 2.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{donor.full_name || donor.name}</Typography>
                                </TableCell>
                                <TableCell sx={{ py: 2.5 }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{donor.email}</Typography>
                                </TableCell>
                                <TableCell sx={{ py: 2.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main' }}>KES {(donor.total_donated || 0).toLocaleString()}</Typography>
                                </TableCell>
                                <TableCell sx={{ py: 2.5 }}>
                                    <Chip
                                        label={`${donor.donation_count || 0} EVENTS`}
                                        size="small"
                                        sx={{
                                            fontWeight: 900,
                                            fontSize: '0.6rem',
                                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                                            color: 'primary.main',
                                            borderRadius: 1,
                                            border: 'none'
                                        }}
                                    />
                                </TableCell>
                                {isManagement && (
                                    <TableCell align="right" sx={{ py: 2.5 }}>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleOpenDonorEditDialog(donor)}
                                            sx={{
                                                borderRadius: 1.5,
                                                textTransform: 'none',
                                                fontWeight: 800,
                                                fontSize: '0.7rem',
                                                borderColor: 'divider',
                                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), borderColor: 'primary.main' }
                                            }}
                                        >
                                            Override
                                        </Button>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    const renderReceipts = () => (
        <Paper sx={{
            p: 0,
            borderRadius: 4,
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.08),
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
            overflow: 'hidden'
        }}>
            <Box sx={{ p: 4, borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.05) }}>
                <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>Official Donation Records</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Verified financial documentation array</Typography>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Record Hash</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Partner</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Timestamp</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayReceipts.map((receipt: any) => (
                            <TableRow key={receipt.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                <TableCell sx={{ py: 2.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 900, fontFamily: 'monospace', color: 'primary.main' }}>{receipt.receipt_number}</Typography>
                                </TableCell>
                                <TableCell sx={{ py: 2.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{receipt.donor_name}</Typography>
                                </TableCell>
                                <TableCell sx={{ py: 2.5 }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{receipt.created_at ? new Date(receipt.created_at).toLocaleDateString() : 'N/A'}</Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ py: 2.5 }}>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        startIcon={<Receipt sx={{ fontSize: '0.9rem' }} />}
                                        sx={{
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: 900,
                                            fontSize: '0.7rem',
                                            boxShadow: 'none',
                                            '&:hover': { boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}` }
                                        }}
                                        onClick={async () => {
                                            try {
                                                setSnackbar({ open: true, message: 'Starting download...', severity: 'info' });
                                                const url = `/donations/receipts/${receipt.id}/download/`;
                                                await downloadFile(url, `Receipt_${receipt.receipt_number}.pdf`);
                                                setSnackbar({ open: true, message: 'Download complete.', severity: 'success' });
                                            } catch (err: any) {
                                                const msg = err.response?.data?.error || 'Failed to download receipt.';
                                                setSnackbar({ open: true, message: msg, severity: 'error' });
                                            }
                                        }}
                                    >
                                        Extract PDF
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(receipts?.length || 0) === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 12 }}>
                                    <Receipt sx={{ fontSize: 48, opacity: 0.1, mb: 1, color: 'primary.main' }} />
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>No record hashes available in this cycle.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    const renderMaterialDonations = () => (
        <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>Material Donation Requests</Typography>
                {isDonor && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpenMaterialDialog(true)}
                        sx={{
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 800,
                            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
                            px: 3,
                            py: 1
                        }}
                    >
                        Schedule Pickup
                    </Button>
                )}
            </Box>
            <Grid container spacing={3}>
                {materialDonations.map((md: any) => (
                    <Grid item xs={12} md={4} key={md.id}>
                        <Paper sx={{
                            p: 3,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 4,
                            border: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.08),
                            bgcolor: alpha(theme.palette.background.paper, 0.6),
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                borderColor: alpha(theme.palette.primary.main, 0.2),
                                boxShadow: '0 12px 40px rgba(0,0,0,0.08)'
                            }
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>{md.category}</Typography>
                                <Chip
                                    label={md.status.replace(/_/g, ' ')}
                                    size="small"
                                    sx={{
                                        fontWeight: 900,
                                        fontSize: '0.65rem',
                                        borderRadius: 1.5,
                                        color: md.status === 'COLLECTED' ? 'success.main' : md.status === 'REJECTED' ? 'error.main' : 'info.main',
                                        bgcolor: md.status === 'COLLECTED' ? alpha(theme.palette.success.main, 0.08) : md.status === 'REJECTED' ? alpha(theme.palette.error.main, 0.08) : alpha(theme.palette.info.main, 0.08),
                                        border: 'none'
                                    }}
                                />
                            </Box>
                            <Typography variant="body2" sx={{ mb: 3, flexGrow: 1, color: 'text.secondary', fontWeight: 500, lineHeight: 1.6 }}>{md.description}</Typography>

                            <Box sx={{ bgcolor: alpha(theme.palette.background.default, 0.3), p: 2, borderRadius: 3, mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled' }}>QUANTITY</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main' }}>{md.quantity || '0'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled' }}>PICKUP</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main' }}>
                                        {md.preferred_pickup_date ? new Date(md.preferred_pickup_date).toLocaleDateString() : 'N/A'}
                                    </Typography>
                                </Box>
                                {md.donor_name && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled' }}>DONOR</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main' }}>{md.donor_name}</Typography>
                                    </Box>
                                )}
                            </Box>

                            {isManagement && (md.status === 'PENDING' || md.status === 'PENDING_PICKUP') && (
                                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        color="success"
                                        fullWidth
                                        onClick={() => handleApproveMaterial(md.id)}
                                        sx={{
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: 800,
                                            borderColor: alpha(theme.palette.success.main, 0.3),
                                            '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.05), borderColor: 'success.main' }
                                        }}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        color="error"
                                        fullWidth
                                        onClick={() => handleRejectMaterial(md.id)}
                                        sx={{
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: 800,
                                            borderColor: alpha(theme.palette.error.main, 0.3),
                                            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.05), borderColor: 'error.main' }
                                        }}
                                    >
                                        Reject
                                    </Button>
                                </Box>
                            )}

                            {md.status === 'COLLECTED' && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    color="primary"
                                    startIcon={<Receipt sx={{ fontSize: '1rem' }} />}
                                    onClick={async () => {
                                        try {
                                            const url = `/donations/material-donations/${md.id}/acknowledgment/`;
                                            await downloadFile(url, `Acknowledgment_${md.id.substring(0, 8)}.pdf`);
                                        } catch (err) {
                                            setSnackbar({ open: true, message: 'Failed to download acknowledgment.', severity: 'error' });
                                        }
                                    }}
                                    sx={{
                                        borderRadius: 2,
                                        mt: 1,
                                        textTransform: 'none',
                                        fontWeight: 800,
                                        borderColor: 'divider',
                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), borderColor: 'primary.main' }
                                    }}
                                >
                                    Acknowledgment
                                </Button>
                            )}
                        </Paper>
                    </Grid>
                ))}
                {materialDonations.length === 0 && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, border: '2px dashed', borderColor: alpha(theme.palette.divider, 0.1), bgcolor: alpha(theme.palette.background.paper, 0.3) }}>
                            <Box sx={{ fontSize: 60, opacity: 0.2, mb: 2 }}>📦</Box>
                            <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 900 }}>No Material Protocols</Typography>
                            <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                                {isManagement ? 'System registry of physical contributions is empty.' : 'Initialize your first material contribution by scheduling a pickup.'}
                            </Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );


    const renderImpactAnalytics = () => {
        const totalImpact = (displayDonations || []).reduce((acc: number, curr: any) => {
            if (['COMPLETED', 'VERIFIED', 'SUCCESS'].includes(curr?.status)) {
                return acc + Number(curr?.amount || 0);
            }
            return acc;
        }, 0);

        const allocationData = [
            { name: 'Education Systems', value: totalImpact * 0.35 },
            { name: 'Healthcare Infrastructure', value: totalImpact * 0.25 },
            { name: 'Nutrition Programs', value: totalImpact * 0.20 },
            { name: 'Shelter Initiatives', value: totalImpact * 0.15 },
            { name: 'Operational Logistics', value: totalImpact * 0.05 },
        ];

        return (
            <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={7}>
                        <Paper sx={{
                            p: 4,
                            borderRadius: 4,
                            border: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.08),
                            bgcolor: alpha(theme.palette.background.paper, 0.6),
                            backdropFilter: 'blur(10px)',
                            height: '100%'
                        }}>
                            <Typography variant="h6" sx={{ fontWeight: 900, mb: 4, letterSpacing: -0.5 }}>Strategic Fund Allocation</Typography>
                            <FundAllocationChart data={allocationData} />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Paper sx={{
                            p: 4,
                            borderRadius: 4,
                            height: '100%',
                            bgcolor: alpha(theme.palette.success.main, 0.03),
                            border: '1px solid',
                            borderColor: alpha(theme.palette.success.main, 0.1),
                            backdropFilter: 'blur(10px)'
                        }}>
                            <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, color: 'success.main', letterSpacing: -0.5 }}>Impact Statement</Typography>
                            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, color: 'text.secondary', fontWeight: 500 }}>
                                Your systemic contribution of <Box component="span" sx={{ color: 'success.main', fontWeight: 900 }}>KES {totalImpact.toLocaleString()}</Box> has been strategically distributed across our core operational nodes to maximize humanitarian output.
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                {[
                                    { label: 'CHILDREN EMPOWERED', count: Math.floor(totalImpact / 5000), icon: '👶' },
                                    { label: 'NUTRITIONAL CYCLES', count: Math.floor(totalImpact / 200), icon: '🍲' },
                                    { label: 'FAMILIES STABILIZED', count: Math.floor(totalImpact / 15000), icon: '🏠' }
                                ].map((stat, i) => (
                                    <Box key={i} sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        p: 2.5,
                                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                                        borderRadius: 4,
                                        border: '1px solid',
                                        borderColor: alpha(theme.palette.divider, 0.05),
                                        transition: 'transform 0.2s ease',
                                        '&:hover': { transform: 'scale(1.02)' }
                                    }}>
                                        <Typography variant="h4" sx={{ mr: 2.5, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}>{stat.icon}</Typography>
                                        <Box>
                                            <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: -1 }}>{stat.count.toLocaleString()}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, letterSpacing: 1 }}>{stat.label}</Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    const formatEventDateTime = (value: any) => {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return 'TBD';
        try {
            return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' } as any);
        } catch {
            return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
    };

    const renderCommunityEvents = () => {
        const donorEvents = (volunteerEvents || []).filter((e: any) => e.post_to_donors && (isManagement || e.is_active));

        return (
            <Box component={motion.div} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                <Box sx={{ p: 4, mb: 4, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.03), border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1) }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, letterSpacing: -0.5 }}>Community Impact Hub</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Synchronized network of localized humanitarian activations.</Typography>
                </Box>
                <Grid container spacing={3}>
                    {donorEvents.map((event: any) => (
                        <Grid item xs={12} key={event.id}>
                            <Paper sx={{
                                p: 4,
                                borderRadius: 4,
                                border: '1px solid',
                                borderColor: alpha(theme.palette.divider, 0.08),
                                bgcolor: alpha(theme.palette.background.paper, 0.6),
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    borderColor: alpha(theme.palette.primary.main, 0.2),
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
                                }
                            }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5, color: 'primary.main' }}>{event.title}</Typography>
                                    <Chip
                                        label={event.event_type}
                                        size="small"
                                        sx={{
                                            fontWeight: 900,
                                            fontSize: '0.65rem',
                                            borderRadius: 1.5,
                                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                                            color: 'primary.main',
                                            border: 'none'
                                        }}
                                    />
                                </Box>
                                <Typography variant="body2" sx={{ mb: 3, fontWeight: 500, color: 'text.secondary', lineHeight: 1.6 }}>{event.description}</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LocationOn sx={{ fontSize: '1rem', color: 'primary.main' }} />
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled', letterSpacing: 0.5 }}>{event.location.toUpperCase()}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Schedule sx={{ fontSize: '1rem', color: 'primary.main' }} />
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled', letterSpacing: 0.5 }}>
                                            {formatEventDateTime(event.start_datetime)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                    {donorEvents.length === 0 && (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, border: '2px dashed', borderColor: alpha(theme.palette.divider, 0.1), bgcolor: alpha(theme.palette.background.paper, 0.3) }}>
                                <EventIcon sx={{ fontSize: 48, opacity: 0.1, mb: 1, color: 'primary.main' }} />
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>No community protocols found in current cycle.</Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Box>
        );
    };

    const SubTabView = ({ title, tabs, activeTab, onTabChange }: any) => {
        const activeItem = tabs.find((t: any) => t.id === activeTab) || tabs[0];

        return (
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', display: 'flex' }}>
                        <BusinessCenter sx={{ fontSize: '1.2rem' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>{title}</Typography>
                </Box>
                <Box sx={{
                    display: 'flex',
                    gap: 1,
                    mb: 5,
                    p: 0.75,
                    bgcolor: alpha(theme.palette.background.paper, 0.4),
                    borderRadius: 3.5,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.05),
                    width: 'fit-content',
                    overflowX: 'auto',
                    pb: { xs: 1.5, md: 0.75 }
                }}>
                    {tabs.map((tab: any) => (
                        <Button
                            key={tab.id}
                            variant={activeTab === tab.id ? 'contained' : 'text'}
                            onClick={() => onTabChange(tab.id)}
                            startIcon={tab.icon}
                            sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: activeTab === tab.id ? 900 : 700,
                                px: 3,
                                py: 1,
                                minWidth: 'fit-content',
                                bgcolor: activeTab === tab.id ? 'primary.main' : 'transparent',
                                color: activeTab === tab.id ? 'white' : 'text.secondary',
                                boxShadow: activeTab === tab.id ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}` : 'none',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    bgcolor: activeTab === tab.id ? 'primary.dark' : alpha(theme.palette.primary.main, 0.05),
                                    transform: activeTab === tab.id ? 'none' : 'translateY(-1px)'
                                },
                                '& .MuiButton-startIcon': { mr: 1, color: activeTab === tab.id ? 'white' : 'primary.main' }
                            }}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </Box>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeItem.component}
                    </motion.div>
                </AnimatePresence>
            </Box>
        );
    };

    const tabsSource = [
        { id: 'campaigns', label: 'Campaigns', component: renderCampaigns(), icon: <VolunteerActivism /> },
        { id: 'impact_analytics', label: 'Analytics', component: renderImpactAnalytics(), icon: <DonutLarge />, hidden: !isDonor },
        { id: 'material_donations', label: 'Material', component: renderMaterialDonations(), icon: <Box sx={{ fontSize: 20 }}>📦</Box> },
        { id: 'donation_records', label: 'History', component: renderDonations(), icon: <MonetizationOn /> },
        { id: 'donors', label: 'Partners', component: renderDonors(), icon: <Box sx={{ fontSize: 20 }}>🤝</Box>, hidden: !isManagement },
        { id: 'receipts', label: 'Receipts', component: renderReceipts(), icon: <Receipt /> },
        { id: 'community_events', label: 'Hub', component: renderCommunityEvents(), icon: <EventIcon /> },
        { id: 'social_media', label: 'Social', component: <Box sx={{ p: 8, textAlign: 'center', borderRadius: 4, border: '2px dashed', borderColor: alpha(theme.palette.divider, 0.1), bgcolor: alpha(theme.palette.background.paper, 0.3) }}><Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 900 }}>Social Nexus Protocol</Typography><Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 600 }}>Integrated social media tracking module pending initialization.</Typography></Box>, icon: <Box sx={{ fontSize: 20 }}>📱</Box>, hidden: !isManagement },
    ];

    const tabs = tabsSource.filter(tab => !tab.hidden);

    return (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid item xs={12} md={4}>
                    <StatsCard
                        title={isDonor ? "PERSONAL IMPACT SCORE" : "TOTAL CAPITAL SECURED"}
                        value={`KES ${((displayDonations || []).reduce((acc: number, curr: any) => {
                            if (['COMPLETED', 'VERIFIED', 'SUCCESS'].includes(curr?.status)) {
                                return acc + Number(curr?.amount || 0);
                            }
                            return acc;
                        }, 0)).toLocaleString()}`}
                        icon={<MonetizationOn />}
                        color={theme.palette.success.main}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatsCard
                        title="ACTIVE PROTOCOLS"
                        value={campaigns.filter((c: any) => c.status === 'ACTIVE').length}
                        icon={<VolunteerActivism />}
                        color={theme.palette.primary.main}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatsCard
                        title={isDonor ? "PHILANTHROPIC RANK" : "ACTIVE PARTNERS"}
                        value={isDonor ? getImpactRank((displayDonations || []).reduce((acc: number, curr: any) => {
                            if (['COMPLETED', 'VERIFIED', 'SUCCESS'].includes(curr?.status)) {
                                return acc + Number(curr?.amount || 0);
                            }
                            return acc;
                        }, 0)) : (donors?.length || 0)}
                        icon={isDonor ? <Box component="span" sx={{ fontSize: 'inherit', display: 'flex' }}>⭐</Box> : <Box component="span" sx={{ fontSize: 'inherit', display: 'flex' }}>🤝</Box>}
                        color={theme.palette.secondary.main}
                    />
                </Grid>
            </Grid>

            <SubTabView title="Philanthropic Operations Hub" tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />

            {/* Donation Status Update Dialog */}
            <Dialog open={openDonationStatusDialog} onClose={() => setOpenDonationStatusDialog(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 4, boxShadow: theme.shadows[10] } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Update Donation Status</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            Managing status for donation from: <strong>{selectedDonation?.donor_name || 'Anonymous Donor'}</strong>
                            <br />
                            Amount: <strong>KES {(selectedDonation?.amount || 0).toLocaleString()}</strong>
                        </Typography>
                        <TextField
                            fullWidth
                            select
                            label="New Status"
                            value={donationStatus}
                            onChange={(e) => setDonationStatus(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        >
                            <MenuItem value="PENDING">Pending</MenuItem>
                            <MenuItem value="COMPLETED">Completed</MenuItem>
                            <MenuItem value="FAILED">Failed</MenuItem>
                            <MenuItem value="REFUNDED">Refunded</MenuItem>
                        </TextField>

                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            Updating donation status will update the donor's lifetime contribution and campaign totals.
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setOpenDonationStatusDialog(false)} sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Dismiss</Button>
                    <Button variant="contained" onClick={handleUpdateDonationStatus} sx={{ borderRadius: 3, px: 4, fontWeight: 'bold' }}>
                        Save Updates
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Material Donation Dialog */}
            <Dialog open={openMaterialDialog} onClose={() => setOpenMaterialDialog(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Schedule Material Pickup</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            select
                            label="Item Category"
                            value={materialForm.category}
                            onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        >
                            <MenuItem value="CLOTHES">Clothes</MenuItem>
                            <MenuItem value="FOOD">Food/Perishables</MenuItem>
                            <MenuItem value="STATIONERY">School Supplies/Stationery</MenuItem>
                            <MenuItem value="ELECTRONICS">Electronics/Computers</MenuItem>
                            <MenuItem value="OTHER">Other</MenuItem>
                        </TextField>

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="What are you donating?"
                            placeholder="Describe the items..."
                            value={materialForm.description}
                            onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />

                        <TextField
                            fullWidth
                            label="Quantity (Estimate)"
                            placeholder='e.g., "5 bags", "2 boxes"'
                            value={materialForm.quantity}
                            onChange={(e) => setMaterialForm({ ...materialForm, quantity: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />

                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Pickup Address"
                            value={materialForm.pickup_address}
                            onChange={(e) => setMaterialForm({ ...materialForm, pickup_address: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Preferred Date"
                                    InputLabelProps={{ shrink: true }}
                                    value={materialForm.preferred_pickup_date}
                                    onChange={(e) => setMaterialForm({ ...materialForm, preferred_pickup_date: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Preferred Time"
                                    value={materialForm.preferred_pickup_time}
                                    onChange={(e) => setMaterialForm({ ...materialForm, preferred_pickup_time: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                >
                                    <MenuItem value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</MenuItem>
                                    <MenuItem value="Afternoon (2 PM - 5 PM)">Afternoon (2 PM - 5 PM)</MenuItem>
                                    <MenuItem value="Evening (5 PM - 7 PM)">Evening (5 PM - 7 PM)</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setOpenMaterialDialog(false)} sx={{ fontWeight: 'bold' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmitMaterial} sx={{ px: 4, borderRadius: 3, fontWeight: 'bold' }}>
                        Submit Request
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Donor Edit Dialog */}
            <Dialog open={openDonorEditDialog} onClose={() => setOpenDonorEditDialog(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, boxShadow: theme.shadows[10] } }}>
                <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid', borderColor: 'divider' }}>Edit Philanthropic Partner</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <TextField
                            fullWidth
                            label="Full name"
                            value={donorEditForm.full_name}
                            onChange={(e) => setDonorEditForm({ ...donorEditForm, full_name: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <TextField
                            fullWidth
                            label="Email Address"
                            value={donorEditForm.email}
                            onChange={(e) => setDonorEditForm({ ...donorEditForm, email: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Donor Type"
                                    value={donorEditForm.donor_type}
                                    onChange={(e) => setDonorEditForm({ ...donorEditForm, donor_type: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                >
                                    <MenuItem value="INDIVIDUAL">Individual</MenuItem>
                                    <MenuItem value="ORGANIZATION">Organization</MenuItem>
                                    <MenuItem value="CORPORATE">Corporate</MenuItem>
                                    <MenuItem value="FOUNDATION">Foundation</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Organization (Optional)"
                                    value={donorEditForm.organization_name}
                                    onChange={(e) => setDonorEditForm({ ...donorEditForm, organization_name: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            </Grid>
                        </Grid>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="Country"
                                value={donorEditForm.country}
                                onChange={(e) => setDonorEditForm({ ...donorEditForm, country: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                            <TextField
                                fullWidth
                                label="City"
                                value={donorEditForm.city}
                                onChange={(e) => setDonorEditForm({ ...donorEditForm, city: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                        </Box>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Physical Address"
                            value={donorEditForm.address}
                            onChange={(e) => setDonorEditForm({ ...donorEditForm, address: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setOpenDonorEditDialog(false)} sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleUpdateDonorProfile} sx={{ borderRadius: 3, px: 4, fontWeight: 'bold' }}>
                        Update Registry
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmationDialog
                open={confirmDialog.open}
                title={confirmDialog.title}
                message={confirmDialog.message}
                severity={confirmDialog.severity}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
