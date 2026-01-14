/**
 * Pending Donations Review Component
 * Admin interface to approve/reject monetary donations
 * Styled with HomePage gradient aesthetic
 */

import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    alpha,
    useTheme,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    CheckCircle,
    Cancel,
    Visibility,
    FilterList
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient, { endpoints } from '../../api/client';

interface Donation {
    id: string;
    donor_name: string;
    donor_email: string;
    amount: number;
    currency: string;
    payment_method: string;
    transaction_id: string;
    campaign: any;
    status: string;
    is_anonymous: boolean;
    message: string;
    donation_date: string;
}

export default function PendingDonationsView() {
    const theme = useTheme();

    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');
    const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchDonations();
    }, [filter]);

    const fetchDonations = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(endpoints.donations.donations, {
                params: { status: filter }
            });
            setDonations(response.data.results || response.data);
        } catch (err) {
            console.error('Failed to fetch donations:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (donationId: string) => {
        setProcessing(true);
        setError('');
        try {
            // Call finalize endpoint (to be created)
            await apiClient.post(`${endpoints.donations.donations}${donationId}/approve/`);
            setSuccess('Donation approved successfully!');
            fetchDonations();
            setDetailsOpen(false);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to approve donation');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (donationId: string) => {
        setProcessing(true);
        setError('');
        try {
            await apiClient.post(`${endpoints.donations.donations}${donationId}/reject/`);
            setSuccess('Donation rejected');
            fetchDonations();
            setDetailsOpen(false);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to reject donation');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'COMPLETED': return 'success';
            case 'FAILED': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            sx={{
                minHeight: '100vh',
                background: theme.palette.mode === 'dark'
                    ? `radial-gradient(circle at 20% 30%, ${alpha(theme.palette.primary.dark, 0.3)} 0%, transparent 50%), #0f172a`
                    : `radial-gradient(circle at 20% 30%, ${alpha(theme.palette.primary.light, 0.15)} 0%, transparent 50%), #f8fafc`,
                pt: 4,
                pb: 8
            }}
        >
            <Container maxWidth="xl">
                {/* Header with gradient */}
                <Box sx={{ mb: 6 }}>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 900,
                            mb: 1,
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        💰 Pending Donations
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Review and approve monetary contributions to campaigns
                    </Typography>
                </Box>

                {/* Alerts */}
                <AnimatePresence>
                    {success && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setSuccess('')}>
                                {success}
                            </Alert>
                        </motion.div>
                    )}
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setError('')}>
                                {error}
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Filter */}
                <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FilterList color="action" />
                    <TextField
                        select
                        size="small"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        sx={{
                            minWidth: 200,
                            '& .MuiOutlinedInput-root': { borderRadius: 3 }
                        }}
                    >
                        <MenuItem value="PENDING">Pending Only</MenuItem>
                        <MenuItem value="COMPLETED">Approved</MenuItem>
                        <MenuItem value="FAILED">Rejected</MenuItem>
                        <MenuItem value="">All Donations</MenuItem>
                    </TextField>
                </Box>

                {/* Table with glassmorphism */}
                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: 6,
                        background: alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: 'blur(20px)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.5),
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                <TableCell sx={{ fontWeight: 700 }}>Donor</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Campaign</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Method</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : donations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <Typography color="text.secondary">
                                            No {filter.toLowerCase()} donations found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                donations.map((donation) => (
                                    <TableRow
                                        key={donation.id}
                                        component={motion.tr}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        sx={{
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.primary.main, 0.02)
                                            }
                                        }}
                                    >
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {donation.is_anonymous ? '🎭 Anonymous' : donation.donor_name}
                                            </Typography>
                                            {!donation.is_anonymous && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {donation.donor_email}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {donation.campaign?.title || 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={700} color="primary.main">
                                                {donation.currency} {donation.amount.toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={donation.payment_method}
                                                size="small"
                                                sx={{ borderRadius: 2 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption">
                                                {new Date(donation.donation_date).toLocaleDateString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={donation.status}
                                                color={getStatusColor(donation.status)}
                                                size="small"
                                                sx={{ borderRadius: 2, fontWeight: 600 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setSelectedDonation(donation);
                                                    setDetailsOpen(true);
                                                }}
                                                sx={{ mr: 1 }}
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                            {donation.status === 'PENDING' && (
                                                <>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleApprove(donation.id)}
                                                        color="success"
                                                        sx={{ mr: 1 }}
                                                    >
                                                        <CheckCircle fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleReject(donation.id)}
                                                        color="error"
                                                    >
                                                        <Cancel fontSize="small" />
                                                    </IconButton>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>

            {/* Details Dialog */}
            <Dialog
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                {selectedDonation && (
                    <>
                        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid', borderColor: 'divider' }}>
                            Donation Details
                        </DialogTitle>
                        <DialogContent sx={{ pt: 3 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Transaction ID</Typography>
                                    <Typography variant="body1" fontWeight={600}>{selectedDonation.transaction_id}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Donor</Typography>
                                    <Typography variant="body1">{selectedDonation.is_anonymous ? 'Anonymous' : selectedDonation.donor_name}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Amount</Typography>
                                    <Typography variant="h5" color="primary.main" fontWeight={700}>
                                        {selectedDonation.currency} {selectedDonation.amount.toLocaleString()}
                                    </Typography>
                                </Box>
                                {selectedDonation.message && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Message</Typography>
                                        <Typography variant="body2" sx={{ fontStyle: 'italic', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                                            "{selectedDonation.message}"
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Button onClick={() => setDetailsOpen(false)}>Close</Button>
                            {selectedDonation.status === 'PENDING' && (
                                <>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleReject(selectedDonation.id)}
                                        disabled={processing}
                                        startIcon={<Cancel />}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={() => handleApprove(selectedDonation.id)}
                                        disabled={processing}
                                        startIcon={processing ? <CircularProgress size={20} /> : <CheckCircle />}
                                    >
                                        {processing ? 'Processing...' : 'Approve & Finalize'}
                                    </Button>
                                </>
                            )}
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}
