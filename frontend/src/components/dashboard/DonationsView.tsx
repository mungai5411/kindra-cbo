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

    useEffect(() => {
        dispatch(fetchCampaigns());
        dispatch(fetchDonations());
        dispatch(fetchDonors());
        dispatch(fetchReceipts());
        dispatch(fetchMaterialDonations());
        dispatch(fetchEvents());

        if (user && isDonor) {
            setDonorName(`${user.firstName} ${user.lastName}`);
            // Find donor phone if available in donors list
            const currentDonor = donors.find((d: any) => d.email === user.email || d.user === user.id);
            if (currentDonor?.phone_number) setDonorPhone(currentDonor.phone_number);
        }

        const handleOpenExternalDonation = (e: any) => {
            if (e.detail) {
                handleOpenDonationDialog(e.detail);
            }
        };

        window.addEventListener('open-donation-dialog', handleOpenExternalDonation);
        return () => window.removeEventListener('open-donation-dialog', handleOpenExternalDonation);
    }, [dispatch, donors, isDonor, user]);

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
        let bgcolor = alpha(theme.palette.info.main, 0.1);

        if (status === 'ACTIVE') {
            color = theme.palette.success.main;
            bgcolor = alpha(theme.palette.success.main, 0.1);
        } else if (status === 'COMPLETED' || status === 'SUCCESS') {
            color = theme.palette.primary.main;
            bgcolor = alpha(theme.palette.primary.main, 0.1);
        } else if (status === 'PAUSED' || status === 'CANCELLED') {
            color = theme.palette.warning.main;
            bgcolor = alpha(theme.palette.warning.main, 0.1);
        }

        return (
            <Chip
                label={status}
                size="small"
                sx={{
                    fontWeight: 600,
                    borderRadius: '6px',
                    bgcolor: bgcolor,
                    color: color
                }}
            />
        );
    };

    const renderCampaigns = () => (
        <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">{isDonor ? 'Join a Cause' : 'Active Campaigns'}</Typography>
                {isManagement && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpenDialog?.(true)}
                        sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, boxShadow: theme.shadows[2] }}
                    >
                        Create Campaign
                    </Button>
                )}
            </Box>
            <Grid container spacing={3}>
                {campaigns.filter((c: any) => isManagement || c.status !== 'DRAFT').map((camp: any) => (
                    <Grid item xs={12} md={4} key={camp.id}>
                        <Paper sx={{
                            p: 2,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.1),
                            boxShadow: theme.shadows[1],
                            transition: 'all 0.3s ease',
                            '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] }
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ maxWidth: '70%' }}>{camp.title}</Typography>
                                <StatusChip status={camp.status} />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                                {camp.description || 'No description provided.'}
                            </Typography>
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="caption" fontWeight="bold">Goal: KES {(camp.target_amount || 0).toLocaleString()}</Typography>
                                    <Typography variant="caption" fontWeight="bold" color="primary.main">
                                        {camp.target_amount > 0 ? Math.round(((camp.raised_amount || 0) / camp.target_amount) * 100) : 0}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={camp.target_amount > 0 ? Math.min(((camp.raised_amount || 0) / camp.target_amount) * 100, 100) : 0}
                                    sx={{ height: 8, borderRadius: 5, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    Raised: <Box component="span" sx={{ color: 'success.main', fontWeight: 'bold' }}>KES {(camp.raised_amount || 0).toLocaleString()}</Box>
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1.5 }}>
                                {/* Primary Actions Row */}
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
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
                                                    borderRadius: 1.5,
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    py: 0.5,
                                                    minWidth: 0
                                                }}
                                            >
                                                Complete
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteCampaign(camp.slug)}
                                                sx={{
                                                    flex: 1,
                                                    borderRadius: 1.5,
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    py: 0.5,
                                                    minWidth: 0
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </>
                                    )}
                                </Box>
                                {/* Secondary Actions Row */}
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    {isManagement && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleOpenStatusDialog(camp)}
                                            sx={{
                                                flex: 1,
                                                borderRadius: 1.5,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                fontSize: '0.75rem',
                                                py: 0.5,
                                                minWidth: 0
                                            }}
                                        >
                                            Update
                                        </Button>
                                    )}
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<Payment sx={{ fontSize: '1rem' }} />}
                                        onClick={() => handleOpenDonationDialog(camp)}
                                        sx={{
                                            flex: 1,
                                            borderRadius: 1.5,
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                            py: 0.5,
                                            minWidth: 0,
                                            boxShadow: 'none'
                                        }}
                                    >
                                        Donate
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
                {campaigns.filter((c: any) => isManagement || c.status !== 'DRAFT').length === 0 && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 2, border: '2px dashed', borderColor: alpha(theme.palette.divider, 0.1), bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                            <VolunteerActivism sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                            <Typography color="text.secondary" fontWeight="medium">No campaigns found. Start one to begin raising funds.</Typography>
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
        <Paper sx={{ p: 0, borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), boxShadow: theme.shadows[1], overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">{isDonor ? 'My Donation History' : 'Recent Donation Registry'}</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={() => dispatch(fetchDonations())}
                        sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
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
                            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, boxShadow: theme.shadows[2] }}
                        >
                            Export CSV
                        </Button>
                    )}
                </Box>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Donor</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(showAllDonations ? (displayDonations || []) : (displayDonations || []).slice(0, 4)).map((d: any) => (
                            <TableRow key={d.id} hover>
                                <TableCell sx={{ fontWeight: '600' }}>{d.donor_name || 'Anonymous Donor'}</TableCell>
                                <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>KES {(d.amount || 0).toLocaleString()}</TableCell>
                                <TableCell sx={{ textTransform: 'capitalize' }}>{d.payment_method}</TableCell>
                                <TableCell>
                                    <StatusChip status={d.status} />
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                    {(() => {
                                        const dateVal = d.donation_date || d.created_at || d.date;
                                        if (!dateVal) return 'N/A';
                                        const date = new Date(dateVal);
                                        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
                                    })()}
                                </TableCell>
                                <TableCell align="right">
                                    {isManagement && (
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleOpenDonationStatusDialog(d)}
                                            sx={{ borderRadius: 2, textTransform: 'none' }}
                                        >
                                            Update
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {(donations?.length || 0) === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                                    <MonetizationOn sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                                    <Typography>No donations recorded yet</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            {(displayDonations || []).length > 4 && (
                <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button
                        size="small"
                        onClick={() => setShowAllDonations(!showAllDonations)}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        {showAllDonations ? 'Show Less' : `View All (${(displayDonations || []).length})`}
                    </Button>
                </Box>
            )}
        </Paper>
    );

    const renderDonors = () => (
        <Paper sx={{ p: 0, borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), boxShadow: theme.shadows[1], overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">Philanthropic Partner Registry</Typography>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Email Contact</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Lifetime Contribution</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Support Count</TableCell>
                            {isManagement && <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(donors || []).map((donor: any) => (
                            <TableRow key={donor.id} hover>
                                <TableCell sx={{ fontWeight: 600 }}>{donor.full_name || donor.name}</TableCell>
                                <TableCell>{donor.email}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>KES {(donor.total_donated || 0).toLocaleString()}</TableCell>
                                <TableCell>
                                    <Chip label={`${donor.donation_count || 0} times`} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                                </TableCell>
                                {isManagement && (
                                    <TableCell align="right">
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleOpenDonorEditDialog(donor)}
                                            sx={{ borderRadius: 2, textTransform: 'none' }}
                                        >
                                            Edit
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
        <Paper sx={{ p: 0, borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), boxShadow: theme.shadows[1], overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">Official Donation Receipts</Typography>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Receipt Number</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Donor</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Issuing Date</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Documentation</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayReceipts.map((receipt: any) => (
                            <TableRow key={receipt.id} hover>
                                <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{receipt.receipt_number}</TableCell>
                                <TableCell>{receipt.donor_name}</TableCell>
                                <TableCell>{receipt.created_at ? new Date(receipt.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                                <TableCell align="right">
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<Receipt />}
                                        sx={{ borderRadius: 2, textTransform: 'none' }}
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
                                        Download PDF
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(receipts?.length || 0) === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                                    <Typography>No receipts generated in this cycle</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    const renderMaterialDonations = () => (
        <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Material Donation Requests</Typography>
                {isDonor && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpenMaterialDialog(true)}
                        sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, boxShadow: theme.shadows[2] }}
                    >
                        Request Pickup
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
                            borderColor: 'divider',
                            bgcolor: alpha(theme.palette.background.paper, 0.5),
                            transition: 'all 0.3s ease',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4] }
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold">{md.category}</Typography>
                                <Chip
                                    label={md.status.replace('_', ' ')}
                                    size="small"
                                    color={md.status === 'COLLECTED' ? 'success' : md.status === 'REJECTED' ? 'error' : 'info'}
                                    variant="outlined"
                                    sx={{ fontWeight: 600 }}
                                />
                            </Box>
                            <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>{md.description}</Typography>
                            <Box sx={{ bgcolor: alpha(theme.palette.background.default, 0.5), p: 2, borderRadius: 2, mb: 2 }}>
                                <Typography variant="caption" display="block" color="text.secondary">Quantity: <strong>{md.quantity || '0'}</strong></Typography>
                                <Typography variant="caption" display="block" color="text.secondary">
                                    Pickup: <strong>{md.preferred_pickup_date ? new Date(md.preferred_pickup_date).toLocaleDateString() : 'N/A'}</strong>
                                </Typography>
                                {md.donor_name && <Typography variant="caption" display="block" color="text.secondary">Donor: <strong>{md.donor_name}</strong></Typography>}
                            </Box>

                            {isManagement && (md.status === 'PENDING' || md.status === 'PENDING_PICKUP') && (
                                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        color="success"
                                        fullWidth
                                        onClick={() => handleApproveMaterial(md.id)}
                                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        color="error"
                                        fullWidth
                                        onClick={() => handleRejectMaterial(md.id)}
                                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
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
                                    startIcon={<Receipt />}
                                    onClick={async () => {
                                        try {
                                            const url = `/donations/material-donations/${md.id}/acknowledgment/`;
                                            await downloadFile(url, `Acknowledgment_${md.id.substring(0, 8)}.pdf`);
                                        } catch (err) {
                                            setSnackbar({ open: true, message: 'Failed to download acknowledgment.', severity: 'error' });
                                        }
                                    }}
                                    sx={{ borderRadius: 2, mt: 1, textTransform: 'none', fontWeight: 600 }}
                                >
                                    Acknowledgment
                                </Button>
                            )}
                        </Paper>
                    </Grid>
                ))}
                {materialDonations.length === 0 && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                            <Typography color="text.secondary">
                                {isManagement ? 'No pending material donation requests.' : 'No material donations recorded. Click "Request Pickup" to start.'}
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

        // Mock allocation based on proportions
        const allocationData = [
            { name: 'Education & Schools', value: totalImpact * 0.35 },
            { name: 'Healthcare & Medical', value: totalImpact * 0.25 },
            { name: 'Food & Nutrition', value: totalImpact * 0.20 },
            { name: 'Shelter & Housing', value: totalImpact * 0.15 },
            { name: 'Operational Support', value: totalImpact * 0.05 },
        ];

        return (
            <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={7}>
                        <FundAllocationChart data={allocationData} />
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Paper sx={{ p: 4, borderRadius: 4, height: '100%', bgcolor: alpha(theme.palette.success.main, 0.02), border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.1) }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom color="success.main">Impact Statement</Typography>
                            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                                Your total contribution of <strong>KES {totalImpact.toLocaleString()}</strong> has been strategically allocated to ensure maximum systemic change.
                                We prioritize direct interventions that empower families toward self-reliance.
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {[
                                    { label: 'Children Supported', count: Math.floor(totalImpact / 5000), icon: '👶' },
                                    { label: 'Meals Provided', count: Math.floor(totalImpact / 200), icon: '🍲' },
                                    { label: 'Families Stabilized', count: Math.floor(totalImpact / 15000), icon: '🏠' }
                                ].map((stat, i) => (
                                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="h4" sx={{ mr: 2 }}>{stat.icon}</Typography>
                                        <Box>
                                            <Typography variant="h6" fontWeight="bold">{stat.count.toLocaleString()}</Typography>
                                            <Typography variant="caption" color="text.secondary" fontWeight="bold">{stat.label}</Typography>
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
            <Paper sx={{ p: 0, borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), boxShadow: theme.shadows[1], overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" fontWeight="bold">Community Engagement</Typography>
                    <Typography variant="body2" color="text.secondary">Join our volunteer events and community activities</Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                        {donorEvents.map((event: any) => (
                            <Grid item xs={12} key={event.id}>
                                <Card variant="outlined" sx={{ borderRadius: 3, borderStyle: 'dashed' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="bold" color="primary">{event.title}</Typography>
                                            <Chip label={event.event_type} size="small" color="primary" variant="outlined" />
                                        </Box>
                                        <Typography variant="body2" sx={{ mb: 2 }}>{event.description}</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                                <LocationOn fontSize="small" />
                                                <Typography variant="caption" fontWeight="bold">{event.location}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                                <Schedule fontSize="small" />
                                                <Typography variant="caption" fontWeight="bold">
                                                    {formatEventDateTime(event.start_datetime)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                        {donorEvents.length === 0 && (
                            <Grid item xs={12}>
                                <Box sx={{ p: 6, textAlign: 'center' }}>
                                    <EventIcon sx={{ fontSize: 40, opacity: 0.2, mb: 1 }} />
                                    <Typography color="text.secondary">No community events posted for donors yet.</Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </Paper>
        );
    };

    const tabsSource = [
        { id: 'campaigns', label: 'Campaigns', component: renderCampaigns(), icon: <VolunteerActivism /> },
        { id: 'impact_analytics', label: 'Impact Analytics', component: renderImpactAnalytics(), icon: <DonutLarge />, hidden: !isDonor },
        { id: 'material_donations', label: 'Material', component: renderMaterialDonations(), icon: <Box sx={{ fontSize: 20 }}>📦</Box> },
        { id: 'donation_records', label: 'History', component: renderDonations(), icon: <MonetizationOn /> },
        { id: 'donors', label: 'Partners', component: renderDonors(), icon: <Box sx={{ fontSize: 20 }}>🤝</Box>, hidden: !isManagement },
        { id: 'receipts', label: 'Documentation', component: renderReceipts(), icon: <Receipt /> },
        { id: 'community_events', label: 'Events', component: renderCommunityEvents(), icon: <EventIcon /> },
        { id: 'social_media', label: 'Social Media', component: <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">Social media tracking module coming soon.</Typography></Box>, icon: <Box sx={{ fontSize: 20 }}>📱</Box>, hidden: !isManagement },
    ];

    const tabs = tabsSource.filter(tab => !tab.hidden);

    return (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <StatsCard
                        title={isDonor ? "My Lifetime Impact" : "Total Raised"}
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
                        title="Active Campaigns"
                        value={campaigns.filter((c: any) => c.status === 'ACTIVE').length}
                        icon={<VolunteerActivism />}
                        color={theme.palette.primary.main}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatsCard
                        title={isDonor ? "Personal Impact Rank" : "Total Donors"}
                        value={isDonor ? getImpactRank((displayDonations || []).reduce((acc: number, curr: any) => {
                            if (['COMPLETED', 'VERIFIED', 'SUCCESS'].includes(curr?.status)) {
                                return acc + Number(curr?.amount || 0);
                            }
                            return acc;
                        }, 0)) : (donors?.length || 0)}
                        icon={isDonor ? <Box component="span" sx={{ fontSize: 'inherit' }}>⭐</Box> : <Box component="span" sx={{ fontSize: 'inherit' }}>🤝</Box>}
                        color={theme.palette.secondary.main}
                    />
                </Grid>
            </Grid>

            <SubTabView title="Financial Operations" tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />

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
