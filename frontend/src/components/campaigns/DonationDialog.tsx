/**
 * Donation Dialog Component
 * Multi-payment method donation form supporting M-Pesa, PayPal, and Stripe
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
    ToggleButtonGroup,
    ToggleButton,
    Box,
    Typography,
    Chip,
    Alert,
    CircularProgress,
    InputAdornment,
    alpha,
    useTheme,
    Divider
} from '@mui/material';
import {
    AttachMoney,
    Phone,
    CreditCard,
    AccountBalance,
    CheckCircle,
    Close
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient, { endpoints } from '../../api/client';

interface DonationDialogProps {
    open: boolean;
    onClose: () => void;
    campaign: any;
}

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

export default function DonationDialog({ open, onClose, campaign }: DonationDialogProps) {
    const theme = useTheme();
    const { user } = useSelector((state: RootState) => state.auth);

    const [paymentMethod, setPaymentMethod] = useState<'MPESA' | 'PAYPAL' | 'STRIPE'>('MPESA');
    const [amount, setAmount] = useState('');
    const [donorName, setDonorName] = useState(user ? `${user.first_name} ${user.last_name}` : '');
    const [donorEmail, setDonorEmail] = useState(user?.email || '');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [message, setMessage] = useState('');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [receiptId, setReceiptId] = useState<string | null>(null);

    const handleAmountSelect = (value: number) => {
        setAmount(value.toString());
    };

    const handleSubmit = async () => {
        if (!amount || parseFloat(amount) < 1) {
            setError('Please enter a valid amount');
            return;
        }

        if (!donorName || !donorEmail) {
            setError('Name and email are required');
            return;
        }

        if (paymentMethod === 'MPESA' && !phoneNumber) {
            setError('Phone number is required for M-Pesa');
            return;
        }

        setLoading(true);
        setError('');

        try {
            let endpoint = '';
            const payload: any = {
                amount: parseFloat(amount),
                campaign: campaign.id,
                donor_name: donorName,
                donor_email: donorEmail,
                is_anonymous: false,
                message: message
            };

            if (paymentMethod === 'MPESA') {
                endpoint = endpoints.donations.mpesa;
                payload.phone_number = phoneNumber;
            } else if (paymentMethod === 'PAYPAL') {
                endpoint = endpoints.donations.paypal;
                payload.order_id = `PAYPAL-${Date.now()}`; // Simulated
            } else {
                endpoint = endpoints.donations.stripe;
                payload.token = `STRIPE-${Date.now()}`; // Simulated
            }

            const response = await apiClient.post(endpoint, payload);

            setTransactionId(response.data.transaction_id);
            setReceiptId(response.data.receipt_id);
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setAmount('');
            setPhoneNumber('');
            setMessage('');
            setSuccess(false);
            setError('');
            setTransactionId('');
            setReceiptId(null);
            onClose();
        }
    };

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
                    <AttachMoney color="primary" />
                    Support Campaign
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
                                    Thank You! 🎉
                                </Typography>
                                <Typography variant="body1" color="text.secondary" paragraph>
                                    Your donation of <strong>{campaign.currency} {amount}</strong> has been received and is pending approval.
                                </Typography>
                                <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                                    Transaction ID: <strong>{transactionId}</strong>
                                </Alert>
                                <Typography variant="caption" color="text.secondary">
                                    Your donation will be reflected in the campaign progress once approved by our admin team.
                                    You'll receive a confirmation email shortly.
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
                                        Supporting
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold">
                                        {campaign.title}
                                    </Typography>
                                </Box>

                                {/* Payment Method Selection */}
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                        Payment Method
                                    </Typography>
                                    <ToggleButtonGroup
                                        value={paymentMethod}
                                        exclusive
                                        onChange={(_, value) => value && setPaymentMethod(value)}
                                        fullWidth
                                        sx={{ '& .MuiToggleButton-root': { py: 1.5, borderRadius: 1.5 } }}
                                    >
                                        <ToggleButton value="MPESA">
                                            <Phone sx={{ mr: 1 }} /> M-Pesa
                                        </ToggleButton>
                                        <ToggleButton value="PAYPAL">
                                            <CreditCard sx={{ mr: 1 }} /> PayPal
                                        </ToggleButton>
                                        <ToggleButton value="STRIPE">
                                            <AccountBalance sx={{ mr: 1 }} /> Card
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>

                                {/* Amount Selection */}
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                        Donation Amount ({campaign.currency})
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                        {PRESET_AMOUNTS.map((preset) => (
                                            <Chip
                                                key={preset}
                                                label={preset.toLocaleString()}
                                                onClick={() => handleAmountSelect(preset)}
                                                color={amount === preset.toString() ? 'primary' : 'default'}
                                                variant={amount === preset.toString() ? 'filled' : 'outlined'}
                                                sx={{ fontWeight: 600, px: 1 }}
                                            />
                                        ))}
                                    </Box>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Custom Amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">{campaign.currency}</InputAdornment>,
                                            sx: { borderRadius: 2 }
                                        }}
                                    />
                                </Box>

                                <Divider />

                                {/* Donor Information */}
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                        Your Information
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <TextField
                                            fullWidth
                                            required
                                            label="Full Name"
                                            placeholder="Enter your legal name"
                                            value={donorName}
                                            onChange={(e) => setDonorName(e.target.value)}
                                            InputProps={{ sx: { borderRadius: 2 } }}
                                        />
                                        <TextField
                                            fullWidth
                                            required
                                            label="Email Address"
                                            type="email"
                                            placeholder="your@email.com"
                                            value={donorEmail}
                                            onChange={(e) => setDonorEmail(e.target.value)}
                                            InputProps={{ sx: { borderRadius: 2 } }}
                                        />
                                        {paymentMethod === 'MPESA' && (
                                            <TextField
                                                fullWidth
                                                required
                                                label="M-Pesa Phone Number"
                                                placeholder="254712345678"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                InputProps={{ sx: { borderRadius: 2 } }}
                                            />
                                        )}
                                    </Box>
                                </Box>

                                {/* Optional Message */}
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    label="Message (Optional)"
                                    placeholder="Leave words of encouragement..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    InputProps={{ sx: { borderRadius: 2 } }}
                                />

                                {error && (
                                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                                        {error}
                                    </Alert>
                                )}

                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                    Your donation will be reviewed by our admin team before being reflected in the campaign progress.
                                </Alert>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                {success ? (
                    <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                        {receiptId && (
                            <Button
                                variant="outlined"
                                color="primary"
                                fullWidth
                                onClick={() => {
                                    const downloadUrl = `${apiClient.defaults.baseURL}donations/receipts/${receiptId}/download/`;
                                    window.open(downloadUrl, '_blank');
                                }}
                                sx={{ borderRadius: 2, py: 1.5, fontWeight: 'bold' }}
                            >
                                Download Receipt
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            onClick={handleClose}
                            fullWidth
                            sx={{ borderRadius: 2, py: 1.5, fontWeight: 'bold' }}
                        >
                            Close
                        </Button>
                    </Box>
                ) : (
                    <>
                        <Button onClick={handleClose} disabled={loading} sx={{ fontWeight: 600 }}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <AttachMoney />}
                            sx={{ borderRadius: 2, px: 4, fontWeight: 'bold' }}
                        >
                            {loading ? 'Processing...' : `Donate ${amount ? campaign.currency + ' ' + amount : ''}`}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}
