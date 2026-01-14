/**
 * Material Donation Dialog Component
 * Form for requesting pickup of physical goods donations
 */

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    MenuItem,
    Alert,
    CircularProgress,
    alpha,
    useTheme
} from '@mui/material';
import {
    Inventory,
    CheckCircle,
    Close
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient, { endpoints } from '../../api/client';

interface MaterialDonationDialogProps {
    open: boolean;
    onClose: () => void;
    campaign: any;
}

const MATERIAL_CATEGORIES = [
    { value: 'CLOTHES', label: 'Clothes' },
    { value: 'FOOD', label: 'Food/Perishables' },
    { value: 'STATIONERY', label: 'School Supplies/Stationery' },
    { value: 'ELECTRONICS', label: 'Electronics/Computers' },
    { value: 'OTHER', label: 'Other' }
];

export default function MaterialDonationDialog({ open, onClose, campaign }: MaterialDonationDialogProps) {
    const theme = useTheme();
    const { user } = useSelector((state: RootState) => state.auth);

    const [category, setCategory] = useState('CLOTHES');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState('');
    const [pickupAddress, setPickupAddress] = useState('');
    const [pickupDate, setPickupDate] = useState('');
    const [pickupTime, setPickupTime] = useState('');
    const [specialInstructions, setSpecialInstructions] = useState('');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!description || !quantity || !pickupAddress || !pickupDate) {
            setError('Please fill in all required fields');
            return;
        }

        if (!user) {
            setError('Please log in to submit a material donation request');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await apiClient.post(endpoints.donations.materialDonations, {
                category: category,
                description: description,
                quantity: quantity,
                pickup_address: pickupAddress,
                preferred_pickup_date: pickupDate,
                preferred_pickup_time: pickupTime,
                admin_notes: `Campaign: ${campaign.title}\nSpecial Instructions: ${specialInstructions}`,
                status: 'PENDING_PICKUP'
            });

            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit material donation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setCategory('CLOTHES');
            setDescription('');
            setQuantity('');
            setPickupAddress('');
            setPickupDate('');
            setPickupTime('');
            setSpecialInstructions('');
            setSuccess(false);
            setError('');
            onClose();
        }
    };

    // Get tomorrow's date as minimum pickup date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    background: alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: 'blur(20px)',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.5)
                }
            }}
        >
            <DialogTitle sx={{
                fontWeight: 'bold',
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Inventory color="primary" />
                    Donate Materials
                </Box>
                <Button onClick={handleClose} sx={{ minWidth: 'auto' }}>
                    <Close />
                </Button>
            </DialogTitle>

            <DialogContent>
                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                                <Typography variant="h5" fontWeight="bold" gutterBottom>
                                    Pickup Request Submitted! 📦
                                </Typography>
                                <Typography variant="body1" color="text.secondary" paragraph>
                                    Your material donation for <strong>{campaign.title}</strong> has been received.
                                </Typography>
                                <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                                    <strong>Pickup Details:</strong><br />
                                    Date: {new Date(pickupDate).toLocaleDateString()}<br />
                                    Time: {pickupTime || 'To be confirmed'}<br />
                                    Address: {pickupAddress}
                                </Alert>
                                <Typography variant="caption" color="text.secondary">
                                    Our team will review your request and contact you to confirm the pickup schedule.
                                    Thank you for your generous contribution!
                                </Typography>
                            </Box>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Box sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {/* Campaign Info */}
                                <Box sx={{
                                    p: 2,
                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider'
                                }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Donating materials for
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold">
                                        {campaign.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        We'll arrange pickup of your donated items at your convenience.
                                    </Typography>
                                </Box>

                                {!user && (
                                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                                        You must be logged in to submit a material donation request.
                                    </Alert>
                                )}

                                {/* Item Details */}
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                        Item Details
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="Category *"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            InputProps={{ sx: { borderRadius: 2 } }}
                                        >
                                            {MATERIAL_CATEGORIES.map((cat) => (
                                                <MenuItem key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </MenuItem>
                                            ))}
                                        </TextField>

                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            label="Item Description *"
                                            placeholder="List the items you're donating..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            helperText="Be as detailed as possible (condition, sizes, etc.)"
                                            InputProps={{ sx: { borderRadius: 2 } }}
                                        />

                                        <TextField
                                            fullWidth
                                            label="Quantity *"
                                            placeholder='e.g., "5 bags", "2 boxes", "10 shirts"'
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            InputProps={{ sx: { borderRadius: 2 } }}
                                        />
                                    </Box>
                                </Box>

                                {/* Pickup Information */}
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                        Pickup Information
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={2}
                                            label="Pickup Address *"
                                            placeholder="Street, building, landmarks..."
                                            value={pickupAddress}
                                            onChange={(e) => setPickupAddress(e.target.value)}
                                            InputProps={{ sx: { borderRadius: 2 } }}
                                        />

                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <TextField
                                                fullWidth
                                                type="date"
                                                label="Preferred Pickup Date *"
                                                value={pickupDate}
                                                onChange={(e) => setPickupDate(e.target.value)}
                                                InputLabelProps={{ shrink: true }}
                                                inputProps={{ min: minDate }}
                                                InputProps={{ sx: { borderRadius: 3 } }}
                                            />

                                            <TextField
                                                fullWidth
                                                type="time"
                                                label="Preferred Time (Optional)"
                                                value={pickupTime}
                                                onChange={(e) => setPickupTime(e.target.value)}
                                                InputLabelProps={{ shrink: true }}
                                                InputProps={{ sx: { borderRadius: 3 } }}
                                            />
                                        </Box>

                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={2}
                                            label="Special Instructions (Optional)"
                                            placeholder="Gate codes, parking info, best contact method..."
                                            value={specialInstructions}
                                            onChange={(e) => setSpecialInstructions(e.target.value)}
                                            InputProps={{ sx: { borderRadius: 2 } }}
                                        />
                                    </Box>
                                </Box>

                                {error && (
                                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                                        {error}
                                    </Alert>
                                )}

                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                    Your pickup request will be reviewed by our team. We'll contact you to confirm the schedule.
                                </Alert>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                {success ? (
                    <Button
                        variant="contained"
                        onClick={handleClose}
                        fullWidth
                        sx={{ borderRadius: 2, py: 1.5, fontWeight: 'bold' }}
                    >
                        Close
                    </Button>
                ) : (
                    <>
                        <Button onClick={handleClose} disabled={loading} sx={{ fontWeight: 600 }}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading || !user}
                            startIcon={loading ? <CircularProgress size={20} /> : <Inventory />}
                            sx={{ borderRadius: 2, px: 4, fontWeight: 'bold' }}
                        >
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}
