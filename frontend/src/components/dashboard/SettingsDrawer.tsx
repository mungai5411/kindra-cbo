import { useState, useEffect } from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    TextField,
    Button,
    Avatar,
    Switch,
    useTheme,
    alpha,
    Snackbar,
    Alert,
    Tabs,
    Tab,
    Divider,
    Stack,
    Paper
} from '@mui/material';
import {
    Close,
    Person,
    Lock,
    Notifications,
    Check
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../../features/auth/authSlice';
import { updateDonor } from '../../features/donations/donationsSlice';
import { RootState, AppDispatch } from '../../store';
import { fetchDonors } from '../../features/donations/donationsSlice';
import { ImageUploader } from '../common/ImageUploader';
import axios from 'axios';

interface SettingsDrawerProps {
    open: boolean;
    onClose: () => void;
    user: any;
}

export const SettingsDrawer = ({ open, onClose, user }: SettingsDrawerProps) => {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { donors } = useSelector((state: RootState) => state.donations);
    const donorProfile = donors.find(d => d.user === user?.id || d.email === user?.email);

    const [activeTab, setActiveTab] = useState(0);
    const [editMode, setEditMode] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone_number || '',
        profile_picture: user?.profile_picture || '',
        country: donorProfile?.country || '',
        city: donorProfile?.city || '',
        address: donorProfile?.address || '',
        organization_name: donorProfile?.organization_name || '',
    });

    useEffect(() => {
        if (open && donors.length === 0) {
            dispatch(fetchDonors());
        }
    }, [open, donors.length, dispatch]);

    useEffect(() => {
        if (open && user) {
            setFormData({
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
                email: user?.email || '',
                phone: user?.phone_number || '',
                profile_picture: user?.profile_picture || '',
                country: donorProfile?.country || '',
                city: donorProfile?.city || '',
                address: donorProfile?.address || '',
                organization_name: donorProfile?.organization_name || '',
            });
            setEditMode(false);
        }
    }, [open, user, donorProfile]);

    const handleSave = async () => {
        try {
            const hasNewPhoto = formData.profile_picture instanceof File;
            const updatedProfile: any = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone_number: formData.phone,
            };

            if (hasNewPhoto) {
                updatedProfile.profile_picture = formData.profile_picture;
            }

            await dispatch(updateProfile(updatedProfile)).unwrap();

            if (user?.role === 'DONOR' && donorProfile) {
                const updatedDonorData = {
                    country: formData.country,
                    city: formData.city,
                    address: formData.address,
                    organization_name: formData.organization_name,
                    full_name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                };
                await dispatch(updateDonor({ id: donorProfile.id, data: updatedDonorData })).unwrap();
            }

            setEditMode(false);
            setSaveSuccess(true);
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    };

    const renderProfileSection = () => (
        <Box>
            {/* Profile Header */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                mb: 4,
                p: 3,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.1)
            }}>
                {editMode ? (
                    <Box sx={{ width: '100%', maxWidth: 400 }}>
                        <ImageUploader
                            value={formData.profile_picture}
                            onChange={(file) => setFormData({ ...formData, profile_picture: file || '' })}
                            onDelete={async () => {
                                try {
                                    await axios.delete('/api/v1/accounts/profile/picture/');
                                    setFormData({ ...formData, profile_picture: '' });
                                } catch (error) {
                                    console.error('Failed to delete profile picture:', error);
                                    throw error;
                                }
                            }}
                            maxSizeMB={5}
                            label="Profile Picture"
                            helperText="Upload a profile photo (max 5MB, JPG/PNG/GIF)"
                            showPreview={true}
                        />
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
                        <Avatar
                            src={typeof formData.profile_picture === 'string' ? formData.profile_picture : undefined}
                            sx={{
                                width: 80,
                                height: 80,
                                border: '3px solid',
                                borderColor: 'primary.main',
                                fontSize: '2rem',
                                fontWeight: 600
                            }}
                        >
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                                {user?.firstName} {user?.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {user?.email}
                            </Typography>
                            <Box sx={{
                                display: 'inline-flex',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                border: '1px solid',
                                borderColor: alpha(theme.palette.primary.main, 0.2)
                            }}>
                                <Typography variant="caption" fontWeight="600" color="primary.main">
                                    {user?.role || 'User'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                )}

                {!editMode ? (
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setEditMode(true)}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        Edit Profile
                    </Button>
                ) : (
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<Check />}
                            onClick={handleSave}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600
                            }}
                        >
                            Save
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setEditMode(false)}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600
                            }}
                        >
                            Cancel
                        </Button>
                    </Stack>
                )}
            </Box>

            {/* Personal Information */}
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, color: 'text.secondary' }}>
                Personal Information
            </Typography>
            <Stack spacing={2.5} sx={{ mb: 4 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField
                        label="First Name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        disabled={!editMode}
                        fullWidth
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: editMode ? 'background.paper' : alpha(theme.palette.action.hover, 0.02)
                            }
                        }}
                    />
                    <TextField
                        label="Last Name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        disabled={!editMode}
                        fullWidth
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: editMode ? 'background.paper' : alpha(theme.palette.action.hover, 0.02)
                            }
                        }}
                    />
                </Box>
                <TextField
                    label="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!editMode}
                    fullWidth
                    variant="outlined"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: editMode ? 'background.paper' : alpha(theme.palette.action.hover, 0.02)
                        }
                    }}
                />
                <TextField
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!editMode}
                    fullWidth
                    variant="outlined"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: editMode ? 'background.paper' : alpha(theme.palette.action.hover, 0.02)
                        }
                    }}
                />
            </Stack>

            {/* Donor Details */}
            {user?.role === 'DONOR' && (
                <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, color: 'text.secondary' }}>
                        Organization Details
                    </Typography>
                    <Stack spacing={2.5}>
                        <TextField
                            label="Organization Name"
                            value={formData.organization_name}
                            onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                            disabled={!editMode}
                            fullWidth
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: editMode ? 'background.paper' : alpha(theme.palette.action.hover, 0.02)
                                }
                            }}
                        />
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField
                                label="Country"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                disabled={!editMode}
                                fullWidth
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: editMode ? 'background.paper' : alpha(theme.palette.action.hover, 0.02)
                                    }
                                }}
                            />
                            <TextField
                                label="City"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                disabled={!editMode}
                                fullWidth
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: editMode ? 'background.paper' : alpha(theme.palette.action.hover, 0.02)
                                    }
                                }}
                            />
                        </Box>
                        <TextField
                            label="Address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            disabled={!editMode}
                            fullWidth
                            multiline
                            rows={2}
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: editMode ? 'background.paper' : alpha(theme.palette.action.hover, 0.02)
                                }
                            }}
                        />
                    </Stack>
                </>
            )}
        </Box>
    );

    const renderSecuritySection = () => (
        <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 3, color: 'text.secondary' }}>
                Change Password
            </Typography>
            <Stack spacing={2.5}>
                <TextField
                    label="Current Password"
                    type="password"
                    fullWidth
                    variant="outlined"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                        }
                    }}
                />
                <TextField
                    label="New Password"
                    type="password"
                    fullWidth
                    variant="outlined"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                        }
                    }}
                />
                <TextField
                    label="Confirm New Password"
                    type="password"
                    fullWidth
                    variant="outlined"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                        }
                    }}
                />
                <Button
                    variant="contained"
                    sx={{
                        mt: 2,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1.25
                    }}
                >
                    Update Password
                </Button>
            </Stack>
        </Box>
    );

    const renderNotificationsSection = () => (
        <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 3, color: 'text.secondary' }}>
                Notification Preferences
            </Typography>
            <Stack spacing={0}>
                {[
                    { label: 'Email Notifications', description: 'Receive updates via email', checked: true },
                    { label: 'Push Notifications', description: 'Browser push notifications', checked: true },
                    { label: 'SMS Alerts', description: 'Important alerts via SMS', checked: false },
                    { label: 'Campaign Updates', description: 'Updates about campaigns', checked: false },
                ].map((item, index) => (
                    <Paper
                        key={index}
                        elevation={0}
                        sx={{
                            p: 2.5,
                            mb: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            transition: 'all 0.2s',
                            '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: alpha(theme.palette.primary.main, 0.02)
                            }
                        }}
                    >
                        <Box>
                            <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5 }}>
                                {item.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {item.description}
                            </Typography>
                        </Box>
                        <Switch defaultChecked={item.checked} />
                    </Paper>
                ))}
            </Stack>
        </Box>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 0: return renderProfileSection();
            case 1: return renderSecuritySection();
            case 2: return renderNotificationsSection();
            default: return renderProfileSection();
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 520 },
                    bgcolor: 'background.default',
                }
            }}
        >
            {/* Header */}
            <Box sx={{
                p: 3,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'background.paper'
            }}>
                <Typography variant="h5" fontWeight="bold">
                    Settings
                </Typography>
                <IconButton
                    onClick={onClose}
                    sx={{
                        '&:hover': {
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            color: 'error.main'
                        }
                    }}
                >
                    <Close />
                </IconButton>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    sx={{
                        px: 3,
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            minHeight: 56
                        }
                    }}
                >
                    <Tab icon={<Person sx={{ fontSize: 20 }} />} iconPosition="start" label="Profile" />
                    <Tab icon={<Lock sx={{ fontSize: 20 }} />} iconPosition="start" label="Security" />
                    <Tab icon={<Notifications sx={{ fontSize: 20 }} />} iconPosition="start" label="Notifications" />
                </Tabs>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3, overflowY: 'auto', height: 'calc(100vh - 140px)' }}>
                {renderContent()}
            </Box>

            <Snackbar
                open={saveSuccess}
                autoHideDuration={3000}
                onClose={() => setSaveSuccess(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSaveSuccess(false)}
                    severity="success"
                    sx={{
                        width: '100%',
                        borderRadius: 2,
                        fontWeight: 600
                    }}
                >
                    Profile updated successfully!
                </Alert>
            </Snackbar>
        </Drawer>
    );
};
