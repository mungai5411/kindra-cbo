import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDisbursements, uploadDisbursementReceipt } from '../donations/donationsSlice';
import { AppDispatch, RootState } from '../../store';
import { 
    Box, Typography, Button, Card, CardContent, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField, Chip, IconButton, 
    useTheme, alpha, Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { format } from 'date-fns';

const FundsReceived: React.FC = () => {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { disbursements, isLoading } = useSelector((state: RootState) => state.donations);
    
    const [selectedDisbursement, setSelectedDisbursement] = useState<any>(null);
    const [description, setDescription] = useState('');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        dispatch(fetchDisbursements());
    }, [dispatch]);

    const handleUploadReceipt = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDisbursement || !receiptFile) return;

        const formData = new FormData();
        formData.append('disbursement', selectedDisbursement.id);
        formData.append('description', description);
        formData.append('receipt_file', receiptFile);

        await dispatch(uploadDisbursementReceipt(formData));
        
        // Reset and refresh
        setSelectedDisbursement(null);
        setDescription('');
        setReceiptFile(null);
        dispatch(fetchDisbursements());
    };

    const getStatusChipColor = (status: string) => {
        switch (status) {
            case 'VERIFIED': return 'success';
            case 'RECEIPT_UPLOADED': return 'info';
            case 'SENT': return 'warning';
            default: return 'default';
        }
    };

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(Number(amount || 0));
    };

    return (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box>
                <Typography variant="h4" fontWeight="800" gutterBottom>
                    Funds Received
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    View funds sent to your shelter home. Please upload receipts and photos to show how the funds were utilized. This helps maintain transparency and build trust with donors.
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {disbursements.length === 0 ? (
                    <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                        <CardContent sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <HourglassEmptyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">No funds received yet</Typography>
                            <Typography variant="body2" color="text.secondary">When funds are disbursed to your shelter, they will appear here.</Typography>
                        </CardContent>
                    </Card>
                ) : (
                    disbursements.map((d: any) => (
                        <Card key={d.id} sx={{ borderRadius: 3, boxShadow: theme.shadows[1], border: `1px solid ${theme.palette.divider}` }}>
                            <CardContent sx={{ p: 3 }}>
                                <Grid container spacing={3} alignItems="center">
                                    <Grid item xs={12} md={8}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                            <Typography variant="h5" fontWeight="900" color="primary">
                                                {d.currency} {Number(d.amount).toLocaleString()}
                                            </Typography>
                                            <Chip 
                                                label={d.status.replace('_', ' ')} 
                                                size="small" 
                                                color={getStatusChipColor(d.status) as any}
                                                sx={{ fontWeight: 'bold', borderRadius: 1 }}
                                            />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            <strong>Date:</strong> {d.date_sent ? format(new Date(d.date_sent), 'MMM dd, yyyy') : 'N/A'}
                                        </Typography>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            <strong>Purpose:</strong> {d.purpose_description}
                                        </Typography>
                                        {d.transaction_reference && (
                                            <Typography variant="caption" color="text.secondary">
                                                Ref: {d.transaction_reference}
                                            </Typography>
                                        )}
                                    </Grid>
                                    <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                                        {['SENT', 'AWAITING_RECEIPT'].includes(d.status) ? (
                                            <Button 
                                                variant="contained" 
                                                color="primary" 
                                                startIcon={<CloudUploadIcon />}
                                                onClick={() => setSelectedDisbursement(d)}
                                                sx={{ borderRadius: 2, px: 3, py: 1 }}
                                            >
                                                Upload Proof of Usage
                                            </Button>
                                        ) : (
                                            <Chip 
                                                icon={d.status === 'VERIFIED' ? <CheckCircleIcon /> : <HourglassEmptyIcon />} 
                                                label={d.status === 'VERIFIED' ? 'Receipt Verified' : 'Receipt Pending Verification'}
                                                color={d.status === 'VERIFIED' ? 'success' : 'default'}
                                                variant={d.status === 'VERIFIED' ? 'filled' : 'outlined'}
                                                sx={{ borderRadius: 2, px: 1, py: 2.5, fontWeight: 'bold' }}
                                            />
                                        )}
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Box>

            {/* Upload Modal */}
            <Dialog 
                open={!!selectedDisbursement} 
                onClose={() => {
                    setSelectedDisbursement(null);
                    setReceiptFile(null);
                    setDescription('');
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h5" fontWeight="bold">Upload Proof of Usage</Typography>
                    <IconButton onClick={() => setSelectedDisbursement(null)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 4 }}>
                    {selectedDisbursement && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">Disbursement Details:</Typography>
                                <Typography variant="h5" fontWeight="900" color="primary" sx={{ mt: 1 }}>
                                    {selectedDisbursement.currency} {Number(selectedDisbursement.amount).toLocaleString()}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    {selectedDisbursement.purpose_description}
                                </Typography>
                            </Box>

                            <form id="upload-receipt-form" onSubmit={handleUploadReceipt}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Receipt Document / Invoice</Typography>
                                        <Box 
                                            sx={{ 
                                                border: `2px dashed ${receiptFile ? theme.palette.success.main : theme.palette.divider}`, 
                                                borderRadius: 2, 
                                                p: 3, 
                                                textAlign: 'center',
                                                bgcolor: receiptFile ? alpha(theme.palette.success.main, 0.05) : 'transparent',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    borderColor: theme.palette.primary.main,
                                                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                                                }
                                            }}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input 
                                                type="file" 
                                                ref={fileInputRef}
                                                required 
                                                accept="image/*,.pdf"
                                                onChange={(e) => setReceiptFile(e.target.files ? e.target.files[0] : null)}
                                                style={{ display: 'none' }}
                                            />
                                            <CloudUploadIcon sx={{ fontSize: 40, color: receiptFile ? 'success.main' : 'text.secondary', mb: 1 }} />
                                            {receiptFile ? (
                                                <Typography variant="body2" fontWeight="bold" color="success.main">
                                                    {receiptFile.name}
                                                </Typography>
                                            ) : (
                                                <>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        Click to upload a file
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Please upload a clear image or PDF of the receipt.
                                                    </Typography>
                                                </>
                                            )}
                                        </Box>
                                    </Box>
                                    
                                    <TextField
                                        required
                                        multiline
                                        rows={4}
                                        label="Impact Description"
                                        placeholder="Describe how the funds were used and the impact they created..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        fullWidth
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Box>
                            </form>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Button 
                        onClick={() => setSelectedDisbursement(null)} 
                        color="inherit" 
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        form="upload-receipt-form"
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        disabled={isLoading || !receiptFile}
                        sx={{ borderRadius: 2, px: 4 }}
                    >
                        {isLoading ? 'Uploading...' : 'Submit Report'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FundsReceived;
