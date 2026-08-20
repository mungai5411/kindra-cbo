import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWallet, fetchDisbursements, createDisbursement } from './donationsSlice';
import { AppDispatch, RootState } from '../../store';
import { fetchShelters } from '../shelters/shelterSlice';
import {
    Box, Typography, Button, Grid, Card, CardContent,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Select, FormControl, InputLabel, Chip, IconButton,
    RadioGroup, FormControlLabel, Radio, alpha, useTheme, Paper, Skeleton, Divider
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CallMadeIcon from '@mui/icons-material/CallMade';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

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

    const formatCurrency = (amount: number | string) =>
        new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(Number(amount || 0));

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'VERIFIED': return { color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.1) };
            case 'RECEIPT_UPLOADED': return { color: theme.palette.info.main, bg: alpha(theme.palette.info.main, 0.1) };
            case 'SENT': return { color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.1) };
            default: return { color: theme.palette.text.secondary, bg: alpha(theme.palette.divider, 0.1) };
        }
    };

    const balanceUtilization = wallet?.total_received
        ? Math.round(((wallet.total_disbursed || 0) / wallet.total_received) * 100)
        : 0;

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 2, opacity: 0.8 }}>
                        Financial Dashboard
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em', mt: 0.5 }}>
                        Organization Wallet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                        All figures are real-time from your verified donation records.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<CallMadeIcon />}
                    onClick={() => setIsModalOpen(true)}
                    sx={{
                        borderRadius: 2, px: 4, py: 1.5, fontWeight: 800,
                        textTransform: 'none', boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                        '&:hover': { boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.35)}`, transform: 'translateY(-1px)' },
                        transition: 'all 0.25s'
                    }}
                >
                    Send Funds
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3}>
                {/* Balance Card — Hero */}
                <Grid item xs={12} md={5}>
                    {isLoading ? (
                        <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3 }} />
                    ) : (
                        <Box
                            component={motion.div}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            sx={{
                                borderRadius: 3,
                                p: 4,
                                height: '100%',
                                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 60%, ${theme.palette.secondary.main} 100%)`,
                                color: '#fff',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: `0 16px 48px ${alpha(theme.palette.primary.main, 0.35)}`
                            }}
                        >
                            {/* Decorative blob */}
                            <Box sx={{
                                position: 'absolute', right: -30, top: -30,
                                width: 180, height: 180, borderRadius: '50%',
                                bgcolor: 'rgba(255,255,255,0.06)'
                            }} />
                            <Box sx={{
                                position: 'absolute', right: 40, bottom: -60,
                                width: 220, height: 220, borderRadius: '50%',
                                bgcolor: 'rgba(255,255,255,0.04)'
                            }} />

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, position: 'relative' }}>
                                <AccountBalanceWalletIcon sx={{ opacity: 0.7, fontSize: 20 }} />
                                <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.8 }}>
                                    Current Balance
                                </Typography>
                            </Box>
                            <Typography sx={{ fontWeight: 900, fontSize: '2.4rem', letterSpacing: '-0.04em', position: 'relative', lineHeight: 1.1 }}>
                                {formatCurrency(wallet?.current_balance || 0)}
                            </Typography>
                            <Typography sx={{ mt: 1, opacity: 0.75, fontWeight: 500, fontSize: '0.9rem', position: 'relative' }}>
                                Available for disbursement
                            </Typography>

                            {/* Utilization bar */}
                            <Box sx={{ mt: 3, position: 'relative' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                                    <Typography sx={{ fontSize: '0.75rem', opacity: 0.75, fontWeight: 600 }}>Utilization rate</Typography>
                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800 }}>{balanceUtilization}%</Typography>
                                </Box>
                                <Box sx={{ height: 4, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 100, overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${balanceUtilization}%` }}
                                        transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                                        style={{ height: '100%', background: 'rgba(255,255,255,0.85)', borderRadius: 100 }}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Grid>

                {/* Received + Disbursed */}
                <Grid item xs={12} md={7}>
                    <Grid container spacing={3} sx={{ height: '100%' }}>
                        {[
                            {
                                label: 'Total Received',
                                value: formatCurrency(wallet?.total_received || 0),
                                icon: <TrendingUpIcon />,
                                color: theme.palette.success.main,
                                sub: 'From all verified donations'
                            },
                            {
                                label: 'Total Disbursed',
                                value: formatCurrency(wallet?.total_disbursed || 0),
                                icon: <CallMadeIcon />,
                                color: theme.palette.warning.main,
                                sub: `${disbursements.length} disbursement${disbursements.length !== 1 ? 's' : ''} made`
                            }
                        ].map((stat, i) => (
                            <Grid item xs={12} sm={6} key={i} sx={{ display: 'flex' }}>
                                {isLoading ? (
                                    <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3, width: '100%' }} />
                                ) : (
                                    <Box
                                        component={motion.div}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 + i * 0.1 }}
                                        sx={{
                                            flex: 1,
                                            p: 3.5,
                                            borderRadius: 3,
                                            border: '1px solid',
                                            borderColor: alpha(theme.palette.divider, 0.6),
                                            bgcolor: 'background.paper',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Box sx={{
                                            position: 'absolute', right: -12, bottom: -12,
                                            color: stat.color, opacity: 0.06, fontSize: 100
                                        }}>
                                            {stat.icon}
                                        </Box>
                                        <Box sx={{
                                            width: 40, height: 40, borderRadius: 2,
                                            bgcolor: alpha(stat.color, 0.1), color: stat.color,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2
                                        }}>
                                            {stat.icon}
                                        </Box>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                                            {stat.label}
                                        </Typography>
                                        <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.03em', color: stat.color }}>
                                            {stat.value}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500 }}>
                                            {stat.sub}
                                        </Typography>
                                    </Box>
                                )}
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>

            {/* Disbursements Table */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: '1px solid', borderColor: alpha(theme.palette.divider, 0.6),
                    overflow: 'hidden'
                }}
            >
                <Box sx={{
                    px: 4, py: 3,
                    borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.5),
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>Disbursement History</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Complete record of funds sent to partner shelter homes
                        </Typography>
                    </Box>
                    <Chip
                        label={`${disbursements.length} record${disbursements.length !== 1 ? 's' : ''}`}
                        size="small"
                        sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' }}
                    />
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: alpha(theme.palette.background.default, 0.6) }}>
                                {['Date Sent', 'Shelter Home', 'Amount', 'Method', 'Status'].map((h) => (
                                    <TableCell key={h} sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', py: 2 }}>
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 5 }).map((_, j) => (
                                            <TableCell key={j}><Skeleton variant="text" height={20} /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : disbursements.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                                        <AccountBalanceWalletIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, display: 'block', mx: 'auto' }} />
                                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 800, mb: 0.5 }}>
                                            No disbursements yet
                                        </Typography>
                                        <Typography variant="body2" color="text.disabled">
                                            Send funds to a shelter home to see records here.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                disbursements.map((d: any) => {
                                    const statusStyle = getStatusColor(d.status);
                                    return (
                                        <TableRow key={d.id} hover sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}>
                                            <TableCell sx={{ py: 2.5 }}>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {d.date_sent ? format(new Date(d.date_sent), 'MMM dd, yyyy') : 'N/A'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={800}>{d.shelter_home_name || 'Unknown'}</Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {d.purpose_description}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={900} color="primary.main">
                                                    {formatCurrency(d.amount)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {d.payment_method === 'MPESA'
                                                        ? <PhoneAndroidIcon fontSize="small" sx={{ color: 'success.main' }} />
                                                        : <AccountBalanceIcon fontSize="small" sx={{ color: 'info.main' }} />
                                                    }
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {d.payment_method?.replace(/_/g, ' ')}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={d.status.replace(/_/g, ' ')}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 800, fontSize: '0.65rem', borderRadius: 1.5,
                                                        bgcolor: statusStyle.bg, color: statusStyle.color, border: 'none'
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Send Funds Modal */}
            <Dialog
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                    <Box>
                        <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: '-0.02em' }}>Send Funds to Shelter</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Disburse resources directly to partner shelter homes.</Typography>
                    </Box>
                    <IconButton onClick={() => setIsModalOpen(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 4 }}>
                    <form id="send-funds-form" onSubmit={handleSendFunds}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                                        fullWidth required
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
                                        fullWidth required
                                        label="Purpose"
                                        placeholder="e.g. Monthly Food Supply"
                                        value={purpose}
                                        onChange={(e) => setPurpose(e.target.value)}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>
                            </Grid>

                            <Box>
                                <Typography variant="subtitle2" fontWeight={800} gutterBottom>Payment Method</Typography>
                                <RadioGroup row value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                    <Grid container spacing={2}>
                                        {[
                                            { value: 'BANK_TRANSFER', icon: <AccountBalanceIcon />, label: 'Bank Transfer', sub: 'Direct deposit to shelter bank', color: theme.palette.primary.main },
                                            { value: 'MPESA', icon: <PhoneAndroidIcon />, label: 'M-Pesa', sub: "Send to shelter's Paybill/Till", color: theme.palette.success.main }
                                        ].map((method) => (
                                            <Grid item xs={12} sm={6} key={method.value}>
                                                <Paper
                                                    variant="outlined"
                                                    onClick={() => setPaymentMethod(method.value)}
                                                    sx={{
                                                        p: 2.5, borderRadius: 2, cursor: 'pointer',
                                                        border: `2px solid ${paymentMethod === method.value ? method.color : alpha(theme.palette.divider, 0.5)}`,
                                                        bgcolor: paymentMethod === method.value ? alpha(method.color, 0.04) : 'transparent',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <FormControlLabel
                                                        value={method.value}
                                                        control={<Radio sx={{ display: 'none' }} />}
                                                        label={
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                <Box sx={{ color: paymentMethod === method.value ? method.color : 'text.secondary' }}>
                                                                    {method.icon}
                                                                </Box>
                                                                <Box>
                                                                    <Typography variant="body2" fontWeight={800}>{method.label}</Typography>
                                                                    <Typography variant="caption" color="text.secondary">{method.sub}</Typography>
                                                                </Box>
                                                            </Box>
                                                        }
                                                        sx={{ m: 0, width: '100%' }}
                                                    />
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </RadioGroup>
                            </Box>

                            {selectedShelter && (
                                <Box sx={{ p: 3, bgcolor: alpha(theme.palette.info.main, 0.06), borderRadius: 2, border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'info.dark', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 2 }}>
                                        Registered {paymentMethod === 'MPESA' ? 'M-Pesa' : 'Bank'} Details for {selectedShelter.name}
                                    </Typography>
                                    {paymentMethod === 'BANK_TRANSFER' ? (
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Bank Name</Typography>
                                                <Typography variant="body2" fontWeight={800}>{selectedShelter.bank_name || 'Not provided'}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Branch</Typography>
                                                <Typography variant="body2" fontWeight={800}>{selectedShelter.bank_branch || 'Not provided'}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="caption" color="text.secondary">Account Number</Typography>
                                                <Chip label={selectedShelter.bank_account_number || 'Not provided'} size="small" sx={{ display: 'flex', fontFamily: 'monospace', fontWeight: 800, mt: 0.5 }} />
                                            </Grid>
                                        </Grid>
                                    ) : (
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Paybill / Till Number</Typography>
                                                <Chip label={selectedShelter.mpesa_paybill_number || 'Not provided'} size="small" sx={{ display: 'flex', fontFamily: 'monospace', fontWeight: 800, mt: 0.5 }} />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Registered Phone</Typography>
                                                <Typography variant="body2" fontWeight={800}>{selectedShelter.mpesa_phone_number || 'Not provided'}</Typography>
                                            </Grid>
                                        </Grid>
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
                <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                    <Button onClick={() => setIsModalOpen(false)} color="inherit" sx={{ borderRadius: 2, px: 3, fontWeight: 700, textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        form="send-funds-form"
                        type="submit"
                        variant="contained"
                        disabled={isLoading || !shelterId}
                        sx={{
                            borderRadius: 2, px: 4, fontWeight: 800, textTransform: 'none',
                            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.25)}`
                        }}
                    >
                        {isLoading ? 'Processing...' : 'Confirm Transfer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default WalletDashboard;
