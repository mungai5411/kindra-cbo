/**
 * Volunteer Dialog Component
 * Sign up form for volunteers to offer physical assistance to campaigns
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
    Chip,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    alpha,
    useTheme
} from '@mui/material';
import {
    Handshake,
    CheckCircle,
    Close
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';

interface VolunteerDialogProps {
    open: boolean;
    onClose: () => void;
    campaign: any;
}

const SKILL_OPTIONS = [
    'Event Planning',
    'Manual Labor',
    'Teaching/Training',
    'Fundraising',
    'Social Media',
    'Photography',
    'Cooking',
    'Childcare',
    'Healthcare',
    'Counseling',
    'Transportation',
    'Other'
];

const AVAILABILITY_OPTIONS = [
    'Weekday Mornings',
    'Weekday Afternoons',
    'Weekday Evenings',
    'Weekend Mornings',
    'Weekend Afternoons',
    'Weekend Evenings',
    'Flexible/Any Time'
];

export default function VolunteerDialog({ open, onClose, campaign }: VolunteerDialogProps) {
    const theme = useTheme();
    const { user } = useSelector((state: RootState) => state.auth);

    const [fullName, setFullName] = useState(user ? `${user.firstName} ${user.lastName}` : '');
    const [email, setEmail] = useState(user?.email || '');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [availability, setAvailability] = useState<string[]>([]);
    const [experience, setExperience] = useState('');
    const [motivation, setMotivation] = useState('');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!fullName || !email || !phoneNumber) {
            setError('Name, email, and phone number are required');
            return;
        }

        if (selectedSkills.length === 0) {
            setError('Please select at least one skill');
            return;
        }

        if (availability.length === 0) {
            setError('Please select your availability');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Create volunteer task for this campaign
            await apiClient.post('/volunteers/tasks/', {
                title: `Volunteer for ${campaign.title}`,
                description: `Volunteer request from ${fullName}\n\nSkills: ${selectedSkills.join(', ')}\nAvailability: ${availability.join(', ')}\n\nExperience: ${experience}\n\nMotivation: ${motivation}`,
                priority: 'MEDIUM',
                status: 'OPEN', // Admin will assign it
                // Store volunteer info in description for now
                // In production, you'd create a Volunteer profile first
                metadata: {
                    campaign_id: campaign.id,
                    volunteer_name: fullName,
                    volunteer_email: email,
                    volunteer_phone: phoneNumber,
                    skills: selectedSkills,
                    availability: availability,
                    experience: experience,
                    motivation: motivation
                }
            });

            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit volunteer request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setPhoneNumber('');
            setSelectedSkills([]);
            setAvailability([]);
            setExperience('');
            setMotivation('');
            setSuccess(false);
            setError('');
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
                    borderRadius: 4,
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
                    <Handshake color="primary" />
                    Volunteer for Campaign
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
                                    Thank You for Volunteering! 🤝
                                </Typography>
                                <Typography variant="body1" color="text.secondary" paragraph>
                                    Your volunteer request for <strong>{campaign.title}</strong> has been received.
                                </Typography>
                                <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                                    Our admin team will review your application and contact you shortly via email at <strong>{email}</strong> or phone at <strong>{phoneNumber}</strong>.
                                </Alert>
                                <Typography variant="caption" color="text.secondary">
                                    We appreciate your willingness to help make a difference in our community!
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
                                    borderRadius: 3,
                                    border: '1px solid',
                                    borderColor: 'divider'
                                }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Volunteering for
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold">
                                        {campaign.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        Help us make a difference through your time and skills!
                                    </Typography>
                                </Box>

                                {/* Personal Information */}
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                        Your Information
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <TextField
                                            fullWidth
                                            label="Full Name *"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            InputProps={{ sx: { borderRadius: 3 } }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Email *"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            InputProps={{ sx: { borderRadius: 3 } }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Phone Number *"
                                            placeholder="254712345678"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            InputProps={{ sx: { borderRadius: 3 } }}
                                        />
                                    </Box>
                                </Box>

                                {/* Skills */}
                                <FormControl fullWidth>
                                    <InputLabel>Skills *</InputLabel>
                                    <Select
                                        multiple
                                        value={selectedSkills}
                                        onChange={(e) => setSelectedSkills(e.target.value as string[])}
                                        input={<OutlinedInput label="Skills *" />}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => (
                                                    <Chip key={value} label={value} size="small" />
                                                ))}
                                            </Box>
                                        )}
                                        sx={{ borderRadius: 3 }}
                                    >
                                        {SKILL_OPTIONS.map((skill) => (
                                            <MenuItem key={skill} value={skill}>
                                                {skill}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {/* Availability */}
                                <FormControl fullWidth>
                                    <InputLabel>Availability *</InputLabel>
                                    <Select
                                        multiple
                                        value={availability}
                                        onChange={(e) => setAvailability(e.target.value as string[])}
                                        input={<OutlinedInput label="Availability *" />}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => (
                                                    <Chip key={value} label={value} size="small" color="primary" variant="outlined" />
                                                ))}
                                            </Box>
                                        )}
                                        sx={{ borderRadius: 3 }}
                                    >
                                        {AVAILABILITY_OPTIONS.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {/* Experience */}
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    label="Relevant Experience (Optional)"
                                    placeholder="Tell us about your experience..."
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    InputProps={{ sx: { borderRadius: 3 } }}
                                />

                                {/* Motivation */}
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Why do you want to volunteer? *"
                                    placeholder="Share your motivation..."
                                    value={motivation}
                                    onChange={(e) => setMotivation(e.target.value)}
                                    InputProps={{ sx: { borderRadius: 3 } }}
                                />

                                {error && (
                                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                                        {error}
                                    </Alert>
                                )}

                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                    Your volunteer request will be reviewed by our admin team. You'll be contacted once approved.
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
                        sx={{ borderRadius: 3, py: 1.5, fontWeight: 'bold' }}
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
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <Handshake />}
                            sx={{ borderRadius: 3, px: 4, fontWeight: 'bold' }}
                        >
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}
