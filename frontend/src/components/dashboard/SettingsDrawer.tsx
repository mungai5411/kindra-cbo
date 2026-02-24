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
    Stack,
    Paper,
    CircularProgress
} from '@mui/material';
import {
    Close,
    Person,
    Lock,
    Notifications,
    Check,
    ChevronRight,
    ArrowBack,
    Settings,
    HelpOutline,
    InfoOutlined,
    BugReportOutlined
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

    const [activeTab, setActiveTab] = useState<number | string>(0); // 0 is main list, strings are sub-view IDs
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
            setTimeout(() => setActiveTab(0), 1000); // Return to main list after success
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    };

    const SettingGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <Box sx={{ mb: 3 }}>
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', ml: 1, mb: 1, display: 'block', letterSpacing: '0.1em' }}>
                {title}
            </Typography>
            <Paper elevation={0} sx={{
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.08),
                bgcolor: 'background.paper'
            }}>
                {children}
            </Paper>
        </Box>
    );

    const SettingItem = ({ icon, label, subtitle, onClick, rightElement, color }: any) => (
        <Button
            fullWidth
            onClick={onClick}
            sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                py: 2,
                px: 2.5,
                borderRadius: 0,
                color: color || 'text.primary',
                borderBottom: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.05),
                '&:last-child': { borderBottom: 'none' },
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                display: 'flex',
                alignItems: 'center',
                gap: 2
            }}
        >
            <Box sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(color || theme.palette.primary.main, 0.1),
                color: color || theme.palette.primary.main,
                flexShrink: 0
            }}>
                {icon}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1" fontWeight="600" sx={{ lineHeight: 1.2 }}>{label}</Typography>
                {subtitle && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>{subtitle}</Typography>}
            </Box>
            {rightElement || <ChevronRight sx={{ opacity: 0.3 }} />}
        </Button>
    );

    const renderMainList = () => (
        <Box sx={{ p: 2 }}>
            {/* Profile Summary Card */}
            <Paper elevation={0} sx={{
                p: 2.5,
                mb: 4,
                borderRadius: 5,
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                gap: 2.5,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Avatar
                    src={user?.profile_picture}
                    sx={{
                        width: 64,
                        height: 64,
                        border: '3px solid white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                />
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="800" sx={{ lineHeight: 1.2 }}>{user?.firstName} {user?.lastName}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>{user?.email}</Typography>
                </Box>
                <IconButton
                    onClick={() => setActiveTab('profile')}
                    sx={{ bgcolor: 'white', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
                >
                    <Settings fontSize="small" />
                </IconButton>
            </Paper>

            <SettingGroup title="Account settings">
                <SettingItem
                    icon={<Person fontSize="small" />}
                    label="Personal Information"
                    subtitle="Name, Email, Phone number"
                    onClick={() => { setEditMode(true); setActiveTab('profile'); }}
                />
                <SettingItem
                    icon={<Lock fontSize="small" />}
                    label="Security"
                    subtitle="Password & Two-factor"
                    onClick={() => setActiveTab('security')}
                />
                <SettingItem
                    icon={<Notifications fontSize="small" />}
                    label="Notifications"
                    subtitle="Email & Push preferences"
                    onClick={() => setActiveTab('notifications')}
                />
            </SettingGroup>

            <SettingGroup title="Support & About">
                <SettingItem icon={<HelpOutline fontSize="small" />} label="Help Center" onClick={() => setActiveTab('help')} />
                <SettingItem icon={<InfoOutlined fontSize="small" />} label="Legal Information" onClick={() => setActiveTab('legal')} />
                <SettingItem icon={<BugReportOutlined fontSize="small" />} label="Report a Bug" onClick={() => setActiveTab('bug')} />
            </SettingGroup>

            <Box sx={{ mt: 2 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    onClick={() => window.dispatchEvent(new CustomEvent('confirm-logout'))}
                    sx={{
                        py: 1.5,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.error.main, 0.05),
                        color: 'error.main',
                        fontWeight: 'bold',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.error.main, 0.2),
                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1), borderColor: 'error.main' }
                    }}
                >
                    Log out
                </Button>
            </Box>

            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 4, opacity: 0.3, letterSpacing: 1, fontWeight: 'bold' }}>
                KINDRA CBO v2.5.0
            </Typography>
        </Box>
    );

    const renderProfileSection = () => (
        <Box>
            {/* Header / Image Uploader Contextual to Edit Mode */}
            {editMode ? (
                <Box sx={{ mb: 4 }}>
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
                        helperText="Max 5MB (JPG/PNG)"
                        showPreview={true}
                    />
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => setEditMode(false)}
                            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<Check />}
                            onClick={handleSave}
                            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
                        >
                            Save
                        </Button>
                    </Stack>
                </Box>
            ) : (
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        src={typeof formData.profile_picture === 'string' ? formData.profile_picture : undefined}
                        sx={{ width: 80, height: 80, border: '4px solid white', boxShadow: theme.shadows[2] }}
                    />
                    <Box>
                        <Typography variant="h6" fontWeight="800">{user?.firstName} {user?.lastName}</Typography>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setEditMode(true)}
                            sx={{ mt: 0.5, borderRadius: 2, textTransform: 'none', py: 0 }}
                        >
                            Change Photo
                        </Button>
                    </Box>
                </Box>
            )}

            <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2, color: 'text.primary', fontSize: '0.9rem' }}>
                Personal Information
            </Typography>
            <Stack spacing={2} sx={{ mb: 4 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField
                        label="First Name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        disabled={!editMode}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label="Last Name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        disabled={!editMode}
                        fullWidth
                        size="small"
                    />
                </Box>
                <TextField
                    label="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!editMode}
                    fullWidth
                    size="small"
                />
                <TextField
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!editMode}
                    fullWidth
                    size="small"
                />
            </Stack>

            {user?.role === 'DONOR' && (
                <>
                    <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2, color: 'text.primary', fontSize: '0.9rem' }}>
                        Organization Details
                    </Typography>
                    <Stack spacing={2}>
                        <TextField
                            label="Organization Name"
                            value={formData.organization_name}
                            onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                            disabled={!editMode}
                            fullWidth
                            size="small"
                        />
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField label="Country" value={formData.country} size="small" disabled={!editMode} fullWidth />
                            <TextField label="City" value={formData.city} size="small" disabled={!editMode} fullWidth />
                        </Box>
                    </Stack>
                </>
            )}

            {editMode && !formData.profile_picture && (
                <Box sx={{ mt: 4 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSave}
                        sx={{ borderRadius: 3, py: 1.5, fontWeight: 'bold' }}
                    >
                        Save All Changes
                    </Button>
                </Box>
            )}
        </Box>
    );

    const renderSecuritySection = () => (
        <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 3, color: 'text.secondary' }}>
                Change Password
            </Typography>
            <Stack spacing={2.5}>
                <TextField label="Current Password" type="password" fullWidth size="small" />
                <TextField label="New Password" type="password" fullWidth size="small" />
                <TextField label="Confirm New Password" type="password" fullWidth size="small" />
                <Button
                    variant="contained"
                    sx={{ mt: 2, borderRadius: 3, fontWeight: 600, py: 1.25 }}
                >
                    Update Password
                </Button>
            </Stack>
        </Box>
    );

    const renderHelpSection = () => (
        <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, color: 'text.secondary' }}>
                Frequently Asked Questions
            </Typography>
            <Stack spacing={2}>
                {[
                    { q: "How do I donate?", a: "You can donate by clicking 'Donate' on the home page or dashboard. We accept M-Pesa, Card payments, and Direct Bank Transfers. All donations are secure and encrypted." },
                    { q: "How do I become a volunteer?", a: "Register as a volunteer via the 'Register' link. Once your application is submitted, our management team will review your skills and availability. You'll receive an email notification within 48 hours." },
                    { q: "Can I get a tax-deductible receipt?", a: "Yes, Kindra CBO is a registered non-profit. Once your donation is verified, a PDF receipt is automatically generated and can be downloaded from your 'Giving History' section." },
                    { q: "How is my data protected?", a: "We use industry-standard encryption and follow strict data protection regulations. Your personal information is only used for communication and service delivery purposes. See our Privacy Policy for more." },
                    { q: "Contact Support", a: "Need more help? Email us at support@kindra.org, call +254 700 000000, or visit our headquarters at Westlands Office Park, Nairobi." }
                ].map((item, idx) => (
                    <Paper key={idx} elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.03), border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
                        <Typography variant="body2" fontWeight="700" color="primary.main" gutterBottom>{item.q}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>{item.a}</Typography>
                    </Paper>
                ))}
            </Stack>
        </Box>
    );

    const renderPolicySubView = (title: string, content: string) => (
        <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, color: 'text.secondary' }}>
                {title}
            </Typography>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                    {content}
                </Typography>
            </Paper>
        </Box>
    );

    const renderLegalSection = () => {
        const policies = {
            privacy: {
                title: "Privacy Policy",
                content: `At Kindra CBO, we take your privacy seriously. 
                
                1. Data Collection: We collect information necessary for donation processing and volunteer management.
                2. Data Sharing: We NEVER sell your data to third parties.
                3. Security: Your data is encrypted using SSL (Secure Sockets Layer) technology.
                4. Rights: You have the right to request access to or deletion of your personal data at any time.`
            },
            terms: {
                title: "Terms of Service",
                content: `By using the Kindra platform, you agree to:
                
                1. Provide accurate information during registration.
                2. Use the platform solely for charitable and non-profit purposes.
                3. Respect the privacy of other community members.
                4. Abide by our financial transparency guidelines when processing donations.`
            },
            donation: {
                title: "Donation Policy",
                content: `Kindra CBO ensures 100% transparency in funds management:
                
                1. Fund Allocation: Donations are channeled directly to the selected campaigns.
                2. Administrative Costs: No more than 10% of any donation is used for operational overhead.
                3. Refunds: Donations are generally non-refundable unless a processing error occurred.
                4. Reporting: Donors receive quarterly impact reports detailing how their funds were used.`
            }
        };

        if (activeTab === 'legal-privacy') return renderPolicySubView(policies.privacy.title, policies.privacy.content);
        if (activeTab === 'legal-terms') return renderPolicySubView(policies.terms.title, policies.terms.content);
        if (activeTab === 'legal-donation') return renderPolicySubView(policies.donation.title, policies.donation.content);

        return (
            <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, color: 'text.secondary' }}>
                    Policies & Transparency
                </Typography>
                <Stack spacing={2}>
                    <Button
                        fullWidth
                        onClick={() => setActiveTab('legal-privacy')}
                        sx={{ justifyContent: 'space-between', textTransform: 'none', py: 1.5, px: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
                    >
                        <Typography variant="body2" fontWeight="600">Privacy Policy</Typography>
                        <ChevronRight fontSize="small" />
                    </Button>
                    <Button
                        fullWidth
                        onClick={() => setActiveTab('legal-terms')}
                        sx={{ justifyContent: 'space-between', textTransform: 'none', py: 1.5, px: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
                    >
                        <Typography variant="body2" fontWeight="600">Terms of Service</Typography>
                        <ChevronRight fontSize="small" />
                    </Button>
                    <Button
                        fullWidth
                        onClick={() => setActiveTab('legal-donation')}
                        sx={{ justifyContent: 'space-between', textTransform: 'none', py: 1.5, px: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
                    >
                        <Typography variant="body2" fontWeight="600">Donation Policy</Typography>
                        <ChevronRight fontSize="small" />
                    </Button>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 4, px: 1 }}>
                    Kindra CBO (Reg No. CBO/NRB/4721) is a registered community-based organization. All data is processed according to Kenya's Data Protection Act 2019.
                </Typography>
            </Box>
        );
    };

    const renderBugReportSection = () => {
        const [bugType, setBugType] = useState('UI');
        const [isSubmitting, setIsSubmitting] = useState(false);

        const handleSubmitBug = () => {
            setIsSubmitting(true);
            setTimeout(() => {
                setIsSubmitting(false);
                setSaveSuccess(true);
                setActiveTab(0);
            }, 1500);
        };

        return (
            <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: 'text.secondary' }}>
                    Describe the issue
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
                    Help us improve Kindra by reporting any bugs or glitches you find.
                </Typography>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="caption" fontWeight="bold" sx={{ mb: 1, display: 'block' }}>ISSUE TYPE</Typography>
                        <Stack direction="row" spacing={1}>
                            {['UI', 'Functional', 'Security', 'Other'].map(type => (
                                <Button
                                    key={type}
                                    size="small"
                                    variant={bugType === type ? "contained" : "outlined"}
                                    onClick={() => setBugType(type)}
                                    sx={{ borderRadius: 2, textTransform: 'none', px: 2 }}
                                >
                                    {type}
                                </Button>
                            ))}
                        </Stack>
                    </Box>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="What happened? Tell us the steps to reproduce..."
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                    <Button
                        variant="contained"
                        fullWidth
                        disabled={isSubmitting}
                        onClick={handleSubmitBug}
                        sx={{ borderRadius: 3, py: 1.5, fontWeight: 'bold' }}
                    >
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Report'}
                    </Button>
                </Stack>
            </Box>
        );
    };

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
        if (activeTab === 0) return renderMainList();

        return (
            <Box>
                <Box sx={{ px: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                        size="small"
                        onClick={() => {
                            if (String(activeTab).startsWith('legal-')) setActiveTab('legal');
                            else setActiveTab(0);
                        }}
                        sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                    >
                        <ArrowBack fontSize="small" />
                    </IconButton>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                        {String(activeTab).replace('legal-', '').replace('-', ' ')}
                    </Typography>
                </Box>
                <Box sx={{ px: 2 }}>
                    {activeTab === 'profile' && renderProfileSection()}
                    {activeTab === 'security' && renderSecuritySection()}
                    {activeTab === 'notifications' && renderNotificationsSection()}
                    {activeTab === 'help' && renderHelpSection()}
                    {activeTab === 'legal' && renderLegalSection()}
                    {String(activeTab).startsWith('legal-') && renderLegalSection()}
                    {activeTab === 'bug' && renderBugReportSection()}
                </Box>
            </Box>
        );
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 480 },
                    bgcolor: '#FBFBFB', // Slightly off-white background for modern feel
                }
            }}
        >
            {/* Header */}
            <Box sx={{
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'transparent'
            }}>
                <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: -0.5 }}>
                    {activeTab === 0 ? 'Settings' : ''}
                </Typography>
                <IconButton
                    onClick={onClose}
                    sx={{
                        bgcolor: alpha(theme.palette.divider, 0.1),
                        '&:hover': {
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            color: 'error.main'
                        }
                    }}
                >
                    <Close fontSize="small" />
                </IconButton>
            </Box>

            {/* Content */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
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
