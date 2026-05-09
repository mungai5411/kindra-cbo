/**
 * Donation Dialog Component
 * Multi-payment method donation form supporting M-Pesa, PayPal, and Stripe
 */

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { checkMpesaStatus } from '../../features/donations/donationsSlice';
import { useNotification } from '../../contexts/NotificationContext';
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
    LinearProgress,
    InputAdornment,
    alpha,
    useTheme,
    Divider,
    Collapse,
    IconButton
} from '@mui/material';
import {
    AttachMoney,
    Phone,
    CreditCard,
    AccountBalance,
    CheckCircle,
    Close,
    ExpandMore,
    ExpandLess,
    Person,
    Email,
    Message as MessageIcon
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
    const dispatch = useDispatch<AppDispatch>();
    const { notify } = useNotification();
    const { user } = useSelector((state: RootState) => state.auth);
    const { donations } = useSelector((state: RootState) => state.donations);


    const [amount, setAmount] = useState('');
    const [donorName, setDonorName] = useState(user ? `${user.first_name} ${user.last_name}` : '');
    const [donorEmail, setDonorEmail] = useState(user?.email || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
    const [message, setMessage] = useState('');
    const [showOptional, setShowOptional] = useState(false);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [receiptId, setReceiptId] = useState<string | null>(null);
    const [checkoutRequestId, setCheckoutRequestId] = useState('');
    const [mpesaStatus, setMpesaStatus] = useState<'pending' | 'success' | 'failed'>('pending');
    const [timeLeft, setTimeLeft] = useState(45);

    // Poll for M-Pesa STK Push completion
    useEffect(() => {
        let interval: any;
        if (success && mpesaStatus === 'pending' && checkoutRequestId) {
            interval = setInterval(async () => {
                try {
                    const resultAction = await dispatch(checkMpesaStatus(checkoutRequestId));
                    if (checkMpesaStatus.fulfilled.match(resultAction)) {
                        const data = resultAction.payload;
                        if (data.status === 'COMPLETED') {
                            setMpesaStatus('success');
                            setTransactionId(data.transaction_id);
                            notify({ message: 'Donation received! Thank you for your support.', severity: 'success' });
                        } else if (data.status === 'FAILED') {
                            setMpesaStatus('failed');
                            const failMsg = data.message || 'Payment failed or was cancelled by user.';
                            setError(failMsg);
                            notify({ message: failMsg, severity: 'error' });
                        }
                    }
                } catch (err) {
                    console.error("Polling error", err);
                }
            }, 3000); // Poll every 3 seconds for snappy feedback
        }
        return () => clearInterval(interval);
    }, [success, mpesaStatus, checkoutRequestId, dispatch]);

    // Countdown timer for M-Pesa verification
    useEffect(() => {
        let timer: any;
        if (success && mpesaStatus === 'pending' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && mpesaStatus === 'pending') {
            setMpesaStatus('failed');
            const timeoutMsg = 'Payment verification timed out. Please check your phone or try again.';
            setError(timeoutMsg);
            notify({ message: timeoutMsg, severity: 'warning' });
        }
        return () => clearInterval(timer);
    }, [success, mpesaStatus, timeLeft]);

    const handleAmountSelect = (value: number) => {
        setAmount(value.toString());
    };

    const handleSubmit = async () => {
        if (!amount || parseFloat(amount) < 1) {
            setError('Please enter a valid amount');
            return;
        }

        if (!phoneNumber) {
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

            endpoint = endpoints.donations.mpesa;
            payload.phone_number = phoneNumber;

            const response = await apiClient.post(endpoint, payload);

            setTransactionId(response.data.transaction_id || '');
            setReceiptId(response.data.receipt_id || null);
            setCheckoutRequestId(response.data.checkout_request_id || '');
            setMpesaStatus('pending');
            setTimeLeft(45);
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
            setCheckoutRequestId('');
            setMpesaStatus('pending');
            setTimeLeft(45);
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
                                {mpesaStatus === 'pending' ? (
                                    <>
                                        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                                            <CircularProgress
                                                variant="determinate"
                                                value={100}
                                                size={140}
                                                thickness={3}
                                                sx={{ color: alpha(theme.palette.success.main, 0.1) }}
                                            />
                                            <CircularProgress
                                                variant="determinate"
                                                value={(timeLeft / 45) * 100}
                                                size={140}
                                                thickness={3}
                                                sx={{
                                                    color: 'success.main',
                                                    position: 'absolute',
                                                    left: 0,
                                                    '& .MuiCircularProgress-circle': {
                                                        strokeLinecap: 'round',
                                                        transition: 'stroke-dashoffset 1s linear'
                                                    }
                                                }}
                                            />
                                            <Box
                                                sx={{
                                                    top: 0,
                                                    left: 0,
                                                    bottom: 0,
                                                    right: 0,
                                                    position: 'absolute',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Typography variant="h3" fontWeight="900" sx={{ color: 'text.primary', lineHeight: 1 }}>
                                                    {timeLeft}
                                                </Typography>
                                                <Typography variant="caption" fontWeight="bold" sx={{ color: 'text.secondary', textTransform: 'uppercase', mt: 0.5 }}>
                                                    Sec
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Typography variant="h5" fontWeight="900" gutterBottom sx={{ color: 'success.main' }}>
                                            Check Your Phone! 📱
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 400, mx: 'auto' }}>
                                            An M-Pesa prompt has been sent to <strong>{phoneNumber}</strong>. Enter your PIN to complete the donation of <strong>{campaign.currency} {amount}</strong>.
                                        </Typography>

                                        <Box sx={{
                                            mt: 2,
                                            p: 2,
                                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                                            borderRadius: 2,
                                            border: '1px dashed',
                                            borderColor: alpha(theme.palette.primary.main, 0.3)
                                        }}>
                                            <Typography variant="body2" fontWeight="bold" color="primary">
                                                Verifying your payment...
                                            </Typography>
                                        </Box>
                                    </>
                                ) : mpesaStatus === 'failed' ? (
                                    <>
                                        <Close sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
                                        <Typography variant="h5" fontWeight="bold" color="error.main" gutterBottom>
                                            Payment Failed
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" paragraph>
                                            {error || 'The M-Pesa STK push failed or was cancelled.'}
                                        </Typography>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                                            Thank You! 🎉
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" paragraph>
                                            Your donation of <strong>{campaign.currency} {amount}</strong> has been received successfully.
                                        </Typography>
                                        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                                            Transaction ID: <strong>{transactionId}</strong>
                                        </Alert>
                                        <Typography variant="caption" color="text.secondary">
                                            Your donation will be reflected in the campaign progress. You'll receive a confirmation email shortly.
                                        </Typography>
                                    </>
                                )}
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
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Phone fontSize="small" color="primary" /> M-Pesa Details
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        required
                                        label="M-Pesa Number"
                                        placeholder="2547XXXXXXXX"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        InputProps={{ sx: { borderRadius: 2 } }}
                                        helperText="Enter the number that will receive the STK push"
                                    />
                                </Box>

                                {user ? (
                                    <Box sx={{
                                        p: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        bgcolor: alpha(theme.palette.success.main, 0.05),
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: alpha(theme.palette.success.main, 0.2)
                                    }}>
                                        <Person color="success" />
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">
                                                Donating as {user.first_name} {user.last_name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {user.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box>
                                        <Button
                                            size="small"
                                            onClick={() => setShowOptional(!showOptional)}
                                            endIcon={showOptional ? <ExpandLess /> : <ExpandMore />}
                                            sx={{ color: 'text.secondary', fontWeight: 'bold' }}
                                        >
                                            {showOptional ? 'Hide optional details' : 'Add name & email (Optional)'}
                                        </Button>
                                        <Collapse in={showOptional}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Full Name"
                                                    placeholder="Enter your name"
                                                    value={donorName}
                                                    onChange={(e) => setDonorName(e.target.value)}
                                                    InputProps={{ sx: { borderRadius: 2 } }}
                                                />
                                                <TextField
                                                    fullWidth
                                                    label="Email Address"
                                                    type="email"
                                                    placeholder="your@email.com"
                                                    value={donorEmail}
                                                    onChange={(e) => setDonorEmail(e.target.value)}
                                                    InputProps={{ sx: { borderRadius: 2 } }}
                                                />
                                            </Box>
                                        </Collapse>
                                    </Box>
                                )}

                                {/* Optional Message */}
                                <Box>
                                    {!user && !showOptional ? null : (
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={2}
                                            label="Message (Optional)"
                                            placeholder="Leave words of encouragement..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start"><MessageIcon color="disabled" sx={{ alignSelf: 'flex-start', mt: 1 }} /></InputAdornment>,
                                                sx: { borderRadius: 2 }
                                            }}
                                        />
                                    )}
                                    {user && (
                                        <Button
                                            size="small"
                                            onClick={() => setShowOptional(!showOptional)}
                                            sx={{ color: 'text.secondary', mt: 1 }}
                                        >
                                            {showOptional ? 'Hide message' : 'Add a message?'}
                                        </Button>
                                    )}
                                    {user && (
                                        <Collapse in={showOptional}>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={2}
                                                label="Message"
                                                placeholder="Leave words of encouragement..."
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                sx={{ mt: 2 }}
                                                InputProps={{ sx: { borderRadius: 2 } }}
                                            />
                                        </Collapse>
                                    )}
                                </Box>

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
