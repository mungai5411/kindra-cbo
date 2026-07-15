import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWallet, fetchDisbursements, createDisbursement } from './donationsSlice';
import { AppDispatch, RootState } from '../../store';
import { fetchShelters } from '../shelters/shelterSlice';
import { 
    Box, Typography, Button, Grid, Card, CardContent, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Select, FormControl, InputLabel, Chip, IconButton,
    RadioGroup, FormControlLabel, Radio, alpha, useTheme 
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CallMadeIcon from '@mui/icons-material/CallMade';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';

const WalletDashboard: React.FC = () => {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { wallet, disbursements, isLoading } = useSelector((state: RootState) => state.donations);
    const { shelters } = useSelector((state: RootState) => state.shelters);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form state
    const [amount, setAmount] = useState('');
    const [shelterId, setShelterId] = useState('');
    const [purpose, setPurpose] = useState('');
    const [reference, setReference] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');

    useEffect(() => {
        dispatch(fetchWallet());
        dispatch(fetchDisbursements());
        dispatch(fetchShelters());
    }, [dispatch]);

    const selectedShelter = shelters.find((s: any) => s.id === shelterId);

    const handleSendFunds = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let paymentDetails = {};
        if (selectedShelter) {
            if (paymentMethod === 'BANK_TRANSFER') {
                paymentDetails = {
                    bank_name: selectedShelter.bank_name,
                    bank_account_number: selectedShelter.bank_account_number,
                    bank_branch: selectedShelter.bank_branch
                };
            } else if (paymentMethod === 'MPESA') {
                paymentDetails = {
                    mpesa_paybill_number: selectedShelter.mpesa_paybill_number,
                    mpesa_account_number: selectedShelter.mpesa_account_number,
                    mpesa_phone_number: selectedShelter.mpesa_phone_number
                };
            }
        }

        await dispatch(createDisbursement({
            amount,
            shelter_home: shelterId,
            purpose_description: purpose,
            transaction_reference: reference,
            payment_method: paymentMethod,
            payment_details: paymentDetails,
            status: 'SENT'
        }));
        
        setIsModalOpen(false);
        setAmount('');
        setShelterId('');
        setPurpose('');
        setReference('');
        setPaymentMethod('BANK_TRANSFER');
        dispatch(fetchWallet()); 
        dispatch(fetchDisbursements()); 
    };

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(Number(amount || 0));
    };

    const getStatusChipColor = (status: string) => {
        switch (status) {
            case 'VERIFIED': return 'success';
            case 'RECEIPT_UPLOADED': return 'info';
            case 'SENT': return 'warning';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight="800" gutterBottom>
                        Organization Wallet
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage funds and track disbursements seamlessly.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="large"
                    color="primary"
                    startIcon={<CallMadeIcon />}
                    onClick={() => setIsModalOpen(true)}
                    sx={{ borderRadius: 2, px: 4, py: 1.5, fontWeight: 'bold' }}
                >
                    Send Funds
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[1], border: `1px solid ${theme.palette.divider}`, position: 'relative', overflow: 'hidden' }}>
                        <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.05, color: theme.palette.primary.main }}>
                            <AccountBalanceWalletIcon sx={{ fontSize: 120 }} />
                        </Box>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold">Total Received</Typography>
                            <Typography variant="h3" fontWeight="900" sx={{ mt: 1 }}>
                                {formatCurrency(wallet?.total_received || 0)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[1], border: `1px solid ${theme.palette.divider}`, position: 'relative', overflow: 'hidden' }}>
                        <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.05, color: theme.palette.primary.main }}>
                            <CallMadeIcon sx={{ fontSize: 120 }} />
                        </Box>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold">Total Disbursed</Typography>
                            <Typography variant="h3" fontWeight="900" sx={{ mt: 1 }}>
                                {formatCurrency(wallet?.total_disbursed || 0)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ 
                        borderRadius: 3, 
                        boxShadow: 'none',
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        position: 'relative', 
                        overflow: 'hidden' 
                    }}>
                        <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.1, color: theme.palette.primary.main }}>
                            <AccountBalanceWalletIcon sx={{ fontSize: 120 }} />
                        </Box>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="overline" color="primary" fontWeight="bold">Current Balance</Typography>
                            <Typography variant="h3" fontWeight="900" sx={{ mt: 1, color: theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.dark }}>
                                {formatCurrency(wallet?.current_balance || 0)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Disbursements Table */}
            <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[1], border: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                    <Typography variant="h6" fontWeight="bold">Recent Disbursements</Typography>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Date Sent</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Shelter Home</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Method</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {disbursements.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                        <AccountBalanceWalletIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary">No disbursements yet</Typography>
                                        <Typography variant="body2" color="text.secondary">When you send funds, they will appear here.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                disbursements.map((disbursement: any) => (
                                    <TableRow key={disbursement.id} hover>
                                        <TableCell>{disbursement.date_sent ? format(new Date(disbursement.date_sent), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold">{disbursement.shelter_home_name || 'Unknown'}</Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {disbursement.purpose_description}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold">{formatCurrency(disbursement.amount)}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {disbursement.payment_method === 'MPESA' ? <PhoneAndroidIcon fontSize="small" color="success" /> : <AccountBalanceIcon fontSize="small" color="info" />}
                                                <Typography variant="body2">{disbursement.payment_method?.replace('_', ' ')}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={disbursement.status.replace('_', ' ')} 
                                                size="small" 
                                                color={getStatusChipColor(disbursement.status) as any}
                                                sx={{ fontWeight: 'bold', borderRadius: 1 }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Send Funds Modal */}
            <Dialog 
                open={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Box>
                        <Typography variant="h5" fontWeight="bold">Send Funds to Shelter</Typography>
                        <Typography variant="body2" color="text.secondary">Disburse resources directly to partner shelters.</Typography>
                    </Box>
                    <IconButton onClick={() => setIsModalOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 4 }}>
                    <form id="send-funds-form" onSubmit={handleSendFunds}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Shelter Selection */}
                            <FormControl fullWidth required>
                                <InputLabel>Select Shelter Home</InputLabel>
                                <Select
                                    value={shelterId}
                                    onChange={(e) => setShelterId(e.target.value)}
                                    label="Select Shelter Home"
                                    sx={{ borderRadius: 2 }}
                                >
                                    {shelters.map((shelter: any) => (
                                        <MenuItem key={shelter.id} value={shelter.id}>{shelter.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Amount (KES)"
                                        type="number"
                                        InputProps={{ inputProps: { min: 1 } }}
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Purpose"
                                        placeholder="e.g. Monthly Food Supply"
                                        value={purpose}
                                        onChange={(e) => setPurpose(e.target.value)}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>
                            </Grid>

                            {/* Payment Method */}
                            <Box>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Payment Method</Typography>
                                <RadioGroup 
                                    row 
                                    value={paymentMethod} 
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Paper 
                                                variant="outlined" 
                                                sx={{ 
                                                    p: 2, 
                                                    borderRadius: 2, 
                                                    cursor: 'pointer',
                                                    border: paymentMethod === 'BANK_TRANSFER' ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                                                    bgcolor: paymentMethod === 'BANK_TRANSFER' ? alpha(theme.palette.primary.main, 0.05) : 'transparent'
                                                }}
                                                onClick={() => setPaymentMethod('BANK_TRANSFER')}
                                            >
                                                <FormControlLabel 
                                                    value="BANK_TRANSFER" 
                                                    control={<Radio color="primary" sx={{ display: 'none' }} />} 
                                                    label={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <AccountBalanceIcon color={paymentMethod === 'BANK_TRANSFER' ? 'primary' : 'action'} />
                                                            <Box>
                                                                <Typography variant="body1" fontWeight="bold">Bank Transfer</Typography>
                                                                <Typography variant="caption" color="text.secondary">Direct deposit to shelter's bank</Typography>
                                                            </Box>
                                                        </Box>
                                                    } 
                                                    sx={{ m: 0, width: '100%' }}
                                                />
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Paper 
                                                variant="outlined" 
                                                sx={{ 
                                                    p: 2, 
                                                    borderRadius: 2, 
                                                    cursor: 'pointer',
                                                    border: paymentMethod === 'MPESA' ? `2px solid ${theme.palette.success.main}` : `1px solid ${theme.palette.divider}`,
                                                    bgcolor: paymentMethod === 'MPESA' ? alpha(theme.palette.success.main, 0.05) : 'transparent'
                                                }}
                                                onClick={() => setPaymentMethod('MPESA')}
                                            >
                                                <FormControlLabel 
                                                    value="MPESA" 
                                                    control={<Radio color="success" sx={{ display: 'none' }} />} 
                                                    label={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <PhoneAndroidIcon color={paymentMethod === 'MPESA' ? 'success' : 'action'} />
                                                            <Box>
                                                                <Typography variant="body1" fontWeight="bold">M-Pesa</Typography>
                                                                <Typography variant="caption" color="text.secondary">Send to shelter's Paybill/Till</Typography>
                                                            </Box>
                                                        </Box>
                                                    } 
                                                    sx={{ m: 0, width: '100%' }}
                                                />
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                </RadioGroup>
                            </Box>

                            {/* Dynamic Details */}
                            {selectedShelter && (
                                <Box sx={{ p: 3, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 2, border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
                                    <Typography variant="subtitle2" color="info.dark" fontWeight="bold" gutterBottom sx={{ textTransform: 'uppercase' }}>
                                        Registered {paymentMethod === 'MPESA' ? 'M-Pesa' : 'Bank'} Details
                                    </Typography>
                                    
                                    {paymentMethod === 'BANK_TRANSFER' ? (
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Bank Name</Typography>
                                                <Typography variant="body2" fontWeight="bold">{selectedShelter.bank_name || 'Not provided'}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Branch</Typography>
                                                <Typography variant="body2" fontWeight="bold">{selectedShelter.bank_branch || 'Not provided'}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="caption" color="text.secondary">Account Number</Typography>
                                                <Box sx={{ mt: 0.5 }}>
                                                    <Chip label={selectedShelter.bank_account_number || 'Not provided'} size="small" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }} />
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    ) : (
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Paybill / Till Number</Typography>
                                                <Box sx={{ mt: 0.5 }}>
                                                    <Chip label={selectedShelter.mpesa_paybill_number || 'Not provided'} size="small" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }} />
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Account No</Typography>
                                                <Typography variant="body2" fontWeight="bold">{selectedShelter.mpesa_account_number || 'N/A'}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="caption" color="text.secondary">Registered Phone</Typography>
                                                <Typography variant="body2" fontWeight="bold">{selectedShelter.mpesa_phone_number || 'Not provided'}</Typography>
                                            </Grid>
                                        </Grid>
                                    )}

                                    {((!selectedShelter.bank_account_number && paymentMethod === 'BANK_TRANSFER') || 
                                      (!selectedShelter.mpesa_paybill_number && !selectedShelter.mpesa_phone_number && paymentMethod === 'MPESA')) && (
                                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 2, fontWeight: 'bold' }}>
                                            Warning: This shelter has not provided {paymentMethod === 'MPESA' ? 'M-Pesa' : 'Bank'} details. You may need to contact them first.
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            <TextField
                                fullWidth
                                label="Transaction Reference"
                                placeholder="Bank Receipt No. or M-Pesa Code"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Box>
                    </form>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Button 
                        onClick={() => setIsModalOpen(false)} 
                        color="inherit" 
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        form="send-funds-form" 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        disabled={isLoading || !shelterId}
                        sx={{ borderRadius: 2, px: 4 }}
                    >
                        {isLoading ? 'Processing...' : 'Confirm Transfer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default WalletDashboard;
