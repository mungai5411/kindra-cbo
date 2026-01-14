import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Grid,
    Chip,
    TextField,
    Alert,
    useTheme,
    alpha,
    ImageList,
    ImageListItem,
    Snackbar
} from '@mui/material';
import {
    CheckCircle,
    Cancel,
    Info,
    Home,
    Phone,
    Email,
    LocationOn,
    AccessibleForward,
    Security
} from '@mui/icons-material';

interface ShelterReviewDialogProps {
    open: boolean;
    shelter: any;
    onClose: () => void;
    onApprove: (shelterId: string) => void;
    onReject: (shelterId: string, reason: string) => void;
    onRequestInfo: (shelterId: string, reason: string) => void;
}

export function ShelterReviewDialog({
    open,
    shelter,
    onClose,
    onApprove,
    onReject,
    onRequestInfo
}: ShelterReviewDialogProps) {
    const theme = useTheme();
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showInfoDialog, setShowInfoDialog] = useState(false);
    const [reason, setReason] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' as 'success' | 'info' | 'warning' | 'error' });

    if (!shelter) return null;

    const handleApprove = () => {
        onApprove(shelter.id);
        onClose();
    };

    const handleReject = () => {
        if (!reason.trim()) {
            setSnackbar({ open: true, message: 'Please provide a reason for rejection', severity: 'error' });
            return;
        }
        onReject(shelter.id, reason);
        onClose();
        setShowRejectDialog(false);
        setReason('');
    };

    const handleRequestInfo = () => {
        if (!reason.trim()) {
            setSnackbar({ open: true, message: 'Please specify what information is needed', severity: 'error' });
            return;
        }
        onRequestInfo(shelter.id, reason);
        onClose();
        setShowInfoDialog(false);
        setReason('');
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4, maxHeight: '90vh' } }}
            >
                <DialogTitle sx={{
                    fontWeight: 'bold',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Home color="primary" />
                        Review Shelter Application
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                        {/* Basic Info */}
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                {shelter.name}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Phone fontSize="small" color="action" />
                                        <Typography variant="body2">{shelter.phone_number}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Email fontSize="small" color="action" />
                                        <Typography variant="body2">{shelter.email}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <LocationOn fontSize="small" color="action" />
                                        <Typography variant="body2">
                                            {shelter.physical_address}, {shelter.county}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Capacity & Demographics */}
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Capacity & Demographics
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="caption" color="text.secondary">Total Capacity</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{shelter.total_capacity}</Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="caption" color="text.secondary">Age Range</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {shelter.age_range_min}-{shelter.age_range_max}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Gender Policy</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {shelter.gender_policy?.replace('_', ' ')}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Disability Support */}
                        {shelter.disability_accommodations && (
                            <Alert
                                icon={<AccessibleForward />}
                                severity="info"
                                sx={{ borderRadius: 2 }}
                            >
                                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                                    Disability Accommodations Available
                                </Typography>
                                <Typography variant="body2">
                                    Capacity: {shelter.disability_capacity} children
                                </Typography>
                                {shelter.disability_types_supported?.length > 0 && (
                                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {shelter.disability_types_supported.map((type: string) => (
                                            <Chip key={type} label={type} size="small" />
                                        ))}
                                    </Box>
                                )}
                            </Alert>
                        )}

                        {/* Facilities */}
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Facilities & Services
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {shelter.has_medical_facility && <Chip label="Medical Facility" color="success" size="small" />}
                                {shelter.has_education_facility && <Chip label="Education Facility" color="primary" size="small" />}
                                {shelter.has_counseling_services && <Chip label="Counseling Services" color="secondary" size="small" />}
                                {shelter.fire_safety_certified && <Chip label="Fire Safety Certified" color="error" size="small" />}
                            </Box>
                        </Box>

                        {/* Security */}
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Security fontSize="small" color="action" />
                                <Typography variant="subtitle2" color="text.secondary">
                                    Security Measures
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{
                                p: 2,
                                bgcolor: alpha(theme.palette.background.default, 0.5),
                                borderRadius: 2
                            }}>
                                {shelter.security_measures || 'No security information provided'}
                            </Typography>
                        </Box>

                        {/* Contact Info */}
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Contact Information
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Contact Person</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{shelter.contact_person}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Emergency Contact</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{shelter.emergency_contact}</Typography>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Photos */}
                        {shelter.photos && shelter.photos.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Facility Photos ({shelter.photos.length})
                                </Typography>
                                <ImageList cols={3} gap={8}>
                                    {shelter.photos.map((photo: any) => (
                                        <ImageListItem key={photo.id}>
                                            <img
                                                src={photo.image}
                                                alt={photo.caption || photo.photo_type}
                                                loading="lazy"
                                                style={{ borderRadius: 8, height: 150, objectFit: 'cover' }}
                                            />
                                        </ImageListItem>
                                    ))}
                                </ImageList>
                            </Box>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        variant="outlined"
                        color="info"
                        startIcon={<Info />}
                        onClick={() => setShowInfoDialog(true)}
                    >
                        Request Info
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => setShowRejectDialog(true)}
                    >
                        Reject
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={handleApprove}
                    >
                        Approve
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onClose={() => setShowRejectDialog(false)}>
                <DialogTitle>Reject Shelter Application</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        multiline
                        rows={3}
                        fullWidth
                        label="Reason for Rejection"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setShowRejectDialog(false); setReason(''); }}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleReject}>Reject Application</Button>
                </DialogActions>
            </Dialog>

            {/* Request Info Dialog */}
            <Dialog open={showInfoDialog} onClose={() => setShowInfoDialog(false)}>
                <DialogTitle>Request Additional Information</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        multiline
                        rows={3}
                        fullWidth
                        label="What information is needed?"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setShowInfoDialog(false); setReason(''); }}>Cancel</Button>
                    <Button variant="contained" color="info" onClick={handleRequestInfo}>Send Request</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}
