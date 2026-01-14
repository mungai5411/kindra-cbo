/**
 * Pending Material Donations Review Component
 * Admin interface to approve/schedule material donation pickups
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
    alpha,
    useTheme,
    CircularProgress,
    Alert,
    Stack
} from '@mui/material';
import {
    CheckCircle,
    Cancel,
    Visibility,
    LocalShipping
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient, { endpoints } from '../../api/client';

interface MaterialDonation {
    id: string;
    donor_name: string;
    donor_email: string;
    donor_phone: string;
    category: string;
    item_description: string;
    quantity: string;
    pickup_address: string;
    preferred_date: string;
    preferred_time: string;
    special_instructions: string;
    campaign: any;
    status: string;
    created_at: string;
}

export default function PendingMaterialDonationsView() {
    const theme = useTheme();

    const [donations, setDonations] = useState<MaterialDonation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDonation, setSelectedDonation] = useState<MaterialDonation | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchDonations();
    }, []);

    const fetchDonations = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(endpoints.donations.materialDonations, {
                params: { status: 'PENDING_PICKUP' }
            });
            setDonations(response.data.results || response.data);
        } catch (err) {
            console.error('Failed to fetch material donations:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (donationId: string) => {
        setProcessing(true);
        setError('');
        try {
            await apiClient.post(`${endpoints.donations.materialDonations}${donationId}/approve/`);
            setSuccess('Pickup approved and scheduled!');
            fetchDonations();
            setDetailsOpen(false);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to approve pickup');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (donationId: string) => {
        setProcessing(true);
        setError('');
        try {
            await apiClient.post(`${endpoints.donations.materialDonations}${donationId}/reject/`);
            setSuccess('Material donation request rejected');
            fetchDonations();
            setDetailsOpen(false);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to reject donation');
        } finally {
            setProcessing(false);
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: any = {
            'Clothes': 'info',
            'Food': 'warning',
            'Electronics': 'primary',
            'Stationery': 'secondary',
            'Other': 'default'
        };
        return colors[category] || 'default';
    };

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            sx={{
                minHeight: '100vh',
                background: theme.palette.mode === 'dark'
                    ? `radial-gradient(circle at 20% 30%, ${alpha(theme.palette.warning.dark, 0.3)} 0%, transparent 50%), #0f172a`
                    : `radial-gradient(circle at 20% 30%, ${alpha(theme.palette.warning.light, 0.15)} 0%, transparent 50%), #f8fafc`,
                pt: 4,
                pb: 8
            }}
        >
            <Container maxWidth="xl">
                <Box sx={{ mb: 6 }}>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 900,
                            mb: 1,
                            background: `linear-gradient(45deg, ${theme.palette.warning.main}, ${theme.palette.secondary.main})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        📦 Pending Material Donations
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Schedule pickups for physical goods donations
                    </Typography>
                </Box>

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
                            <TableRow sx={{ bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                                <TableCell sx={{ fontWeight: 700 }}>Donor</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Pickup Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Address</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : donations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <Typography color="text.secondary">
                                            No pending material donations
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                donations.map((donation) => (
                                    <TableRow key={donation.id} sx={{ '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.02) } }}>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {donation.donor_name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {donation.donor_phone}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={donation.category}
                                                color={getCategoryColor(donation.category)}
                                                size="small"
                                                sx={{ borderRadius: 2, fontWeight: 600 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {donation.item_description}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Qty: {donation.quantity}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {new Date(donation.preferred_date).toLocaleDateString()}
                                            </Typography>
                                            {donation.preferred_time && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {donation.preferred_time}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption" sx={{ maxWidth: 150, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {donation.pickup_address}
                                            </Typography>
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
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                {selectedDonation && (
                    <>
                        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid', borderColor: 'divider' }}>
                            Material Donation Details
                        </DialogTitle>
                        <DialogContent sx={{ pt: 3 }}>
                            <Stack spacing={3}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Donor Name</Typography>
                                        <Typography variant="h6" fontWeight={600}>{selectedDonation.donor_name}</Typography>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Category</Typography>
                                        <Chip
                                            label={selectedDonation.category}
                                            color={getCategoryColor(selectedDonation.category)}
                                            sx={{ mt: 0.5 }}
                                        />
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Email</Typography>
                                        <Typography variant="body2">{selectedDonation.donor_email}</Typography>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Phone</Typography>
                                        <Typography variant="body2">{selectedDonation.donor_phone}</Typography>
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Item Description</Typography>
                                    <Typography variant="body1" sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, mt: 1 }}>
                                        {selectedDonation.item_description}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        Quantity: {selectedDonation.quantity}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Pickup Address</Typography>
                                    <Typography variant="body2" sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, mt: 1 }}>
                                        📍 {selectedDonation.pickup_address}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Preferred Date</Typography>
                                        <Typography variant="body2">{new Date(selectedDonation.preferred_date).toLocaleDateString()}</Typography>
                                    </Box>
                                    {selectedDonation.preferred_time && (
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="caption" color="text.secondary">Preferred Time</Typography>
                                            <Typography variant="body2">{selectedDonation.preferred_time}</Typography>
                                        </Box>
                                    )}
                                </Box>
                                {selectedDonation.special_instructions && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Special Instructions</Typography>
                                        <Typography variant="body2" sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, mt: 1, fontStyle: 'italic' }}>
                                            {selectedDonation.special_instructions}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Button onClick={() => setDetailsOpen(false)}>Close</Button>
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
                                startIcon={processing ? <CircularProgress size={20} /> : <LocalShipping />}
                            >
                                {processing ? 'Processing...' : 'Approve & Schedule Pickup'}
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}
