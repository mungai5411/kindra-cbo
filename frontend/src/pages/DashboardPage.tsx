/**
 * Dashboard Page
 * Refactored modular version
 */

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Drawer,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    useTheme,
    Divider,
    Toolbar,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    CircularProgress,
    Grid,
    alpha
} from '@mui/material';

import { logout, fetchProfile } from '../features/auth/authSlice';
import { addVolunteer } from '../features/volunteers/volunteersSlice';
import { addCampaign } from '../features/donations/donationsSlice';
import type { RootState, AppDispatch } from '../store';

// Modular Components
import { Header } from '../components/dashboard/Header';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Overview } from '../components/dashboard/Overview';
import { PlaceholderView } from '../components/dashboard/PlaceholderView';
import { VolunteersView } from '../components/dashboard/VolunteersView';
import { DonationsView } from '../components/dashboard/DonationsView';
import { CasesView } from '../components/dashboard/CasesView';
import { ShelterView } from '../components/dashboard/ShelterView';
import { ResourcesView } from '../components/dashboard/ResourcesView';
import { ReportingView } from '../components/dashboard/ReportingView';
import { SystemAdminView } from '../components/dashboard/SystemAdminView';
import { BlogManagementView } from '../components/dashboard/BlogManagementView';
import { LogoutDialog } from '../components/common/LogoutDialog';
import { MobileBottomNav } from '../components/dashboard/MobileBottomNav';
import { CommunityHub } from '../components/dashboard/CommunityHub';
import { VolunteerGroupsView } from '../components/dashboard/VolunteerGroupsView';
import { useDeviceType } from '../hooks/useDeviceType';

const DRAWER_WIDTH = 280;

const USER_ROLES = [
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'MANAGEMENT', label: 'Management' },
    { value: 'SOCIAL_MEDIA', label: 'Social Media' },
    { value: 'CASE_WORKER', label: 'Case Worker' },
    { value: 'VOLUNTEER', label: 'Volunteer' },
    { value: 'DONOR', label: 'Donor' },
    { value: 'SHELTER_PARTNER', label: 'Shelter Partner' },
];

export default function DashboardPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const theme = useTheme();
    const deviceType = useDeviceType();
    // const { toggleColorMode } = useColorMode(); // Removed
    const { user, isAuthenticated, isLoading: authLoading } = useSelector((state: RootState) => state.auth);

    // UI State
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
        blog_campaigns: true,
        case_management: false,
        donations: false,
        volunteers: false,
    });

    // Form/Dialog State
    const [openVolunteerDialog, setOpenVolunteerDialog] = useState(false);
    const [openCampaignDialog, setOpenCampaignDialog] = useState(false);

    const [volunteerForm, setVolunteerForm] = useState({ full_name: '', email: '', phone: '', role: 'VOLUNTEER' });
    const [campaignForm, setCampaignForm] = useState({
        title: '',
        target_amount: '',
        description: '',
        category: 'OTHER',
        urgency: 'MEDIUM',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        image: null as File | null
    });

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleSectionToggle = (id: string) => {
        setOpenSections(prev => {
            const newState: { [key: string]: boolean } = {};
            // If the section is already open, close it. Otherwise, open it and close everything else.
            const isCurrentlyOpen = !!prev[id];

            // Just reset the whole state with all keys false, then flip the one we want
            Object.keys(prev).forEach(key => {
                newState[key] = false;
            });

            newState[id] = !isCurrentlyOpen;
            return newState;
        });
    };

    const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

    const handleLogoutClick = () => {
        setOpenLogoutDialog(true);
    };

    const handleConfirmLogout = () => {
        setOpenLogoutDialog(false);
        dispatch(logout());
        navigate('/');
    };

    const canViewModule = (itemId: string) => {
        if (!user) return false;

        // Admins and Management see everything EXCEPT specific views they manage elsewhere
        if (user.is_superuser || user.role === 'ADMIN' || user.role === 'MANAGEMENT') {
            if (itemId === 'volunteer_groups') return false;
            return true;
        }

        // Volunteers ONLY see volunteer-related content
        if (user.role === 'VOLUNTEER') {
            return ['overview', 'volunteers', 'events', 'tasks', 'time_logs', 'trainings', 'volunteer_groups'].includes(itemId);
        }

        // Donors ONLY see donation-related content
        if (user.role === 'DONOR') {
            return ['overview', 'donations', 'campaigns', 'my_giving', 'receipts', 'material_donations'].includes(itemId);
        }

        // Shelter Partners ONLY see shelter-related content
        if (user.role === 'SHELTER_PARTNER') {
            return ['overview', 'shelter', 'shelters', 'placements', 'resources'].includes(itemId);
        }

        // Case Workers see case management and shelter content
        if (user.role === 'CASE_WORKER') {
            return ['overview', 'case_management', 'cases', 'assessments', 'case_notes', 'children', 'families', 'documents', 'shelter', 'shelters', 'placements'].includes(itemId);
        }

        // Social Media see blog and donation content
        if (user.role === 'SOCIAL_MEDIA') {
            return ['overview', 'blog_campaigns', 'blog_posts', 'categories', 'comments', 'newsletter', 'tags', 'donations', 'campaigns', 'donation_records', 'donors', 'social_media'].includes(itemId);
        }

        // Default: deny access
        return false;
    };

    useEffect(() => {
        if (!isAuthenticated && !authLoading) {
            navigate('/login');
        } else if (isAuthenticated && !user) {
            dispatch(fetchProfile());
        } else if (user && !canViewModule(activeTab)) {
            // Redirect to overview if user tries to access restricted tab
            setActiveTab('overview');
        }
    }, [isAuthenticated, user, dispatch, navigate, authLoading, activeTab]);

    // Handle form submissions
    const handleAddVolunteer = async () => {
        try {
            await dispatch(addVolunteer(volunteerForm)).unwrap();
            setOpenVolunteerDialog(false);
            setVolunteerForm({ full_name: '', email: '', phone: '', role: 'VOLUNTEER' });
        } catch (error) {
            console.error('Failed to add volunteer:', error);
        }
    };

    const handleCreateCampaign = async () => {
        try {
            const formData = new FormData();
            formData.append('title', campaignForm.title);
            formData.append('target_amount', String(Number(campaignForm.target_amount) || 0));
            formData.append('description', campaignForm.description);
            formData.append('category', campaignForm.category);
            formData.append('urgency', campaignForm.urgency);
            formData.append('start_date', campaignForm.start_date);
            formData.append('end_date', campaignForm.end_date);

            if (campaignForm.image) {
                formData.append('featured_image', campaignForm.image);
            }

            await dispatch(addCampaign(formData)).unwrap();
            setOpenCampaignDialog(false);
            setCampaignForm({
                title: '',
                target_amount: '',
                description: '',
                category: 'OTHER',
                urgency: 'MEDIUM',
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                image: null
            });
        } catch (error) {
            console.error('Failed to create campaign:', error);
        }
    };

    const renderContent = () => {
        // Map tabs to views
        const viewMap: { [key: string]: React.ReactNode } = {
            'overview': (
                <Overview
                    setActiveTab={setActiveTab}
                    setOpenDonationDialog={(campaign) => {
                        setActiveTab('donations');
                        // We'll use a window event to trigger the donation dialog in DonationsView
                        setTimeout(() => {
                            window.dispatchEvent(new CustomEvent('open-donation-dialog', { detail: campaign }));
                        }, 100);
                    }}
                />
            ),
            'volunteers': <VolunteersView setOpenDialog={setOpenVolunteerDialog} activeTab={activeTab} />,
            'volunteer_list': <VolunteersView setOpenDialog={setOpenVolunteerDialog} activeTab={activeTab} />,
            'tasks': <VolunteersView setOpenDialog={setOpenVolunteerDialog} activeTab={activeTab} />,
            'events': <VolunteersView setOpenDialog={setOpenVolunteerDialog} activeTab={activeTab} />,
            'time_logs': <VolunteersView setOpenDialog={setOpenVolunteerDialog} activeTab={activeTab} />,
            'trainings': <VolunteersView setOpenDialog={setOpenVolunteerDialog} activeTab={activeTab} />,
            'volunteer_groups': <VolunteerGroupsView />,

            'donations': <DonationsView setOpenDialog={setOpenCampaignDialog} activeTab={activeTab} onTabChange={setActiveTab} />,
            'campaigns': <DonationsView setOpenDialog={setOpenCampaignDialog} activeTab={activeTab} onTabChange={setActiveTab} />,
            'donation_records': <DonationsView setOpenDialog={setOpenCampaignDialog} activeTab={activeTab} onTabChange={setActiveTab} />,
            'donors': <DonationsView setOpenDialog={setOpenCampaignDialog} activeTab={activeTab} onTabChange={setActiveTab} />,
            'receipts': <DonationsView setOpenDialog={setOpenCampaignDialog} activeTab={activeTab} onTabChange={setActiveTab} />,
            'social_media': <DonationsView setOpenDialog={setOpenCampaignDialog} activeTab={activeTab} onTabChange={setActiveTab} />,
            'material_donations': <DonationsView setOpenDialog={setOpenCampaignDialog} activeTab={activeTab} onTabChange={setActiveTab} />,

            'case_management': <CasesView activeTab={activeTab} />,
            'cases': <CasesView activeTab={activeTab} />,
            'children': <CasesView activeTab={activeTab} />,
            'families': <CasesView activeTab={activeTab} />,
            'assessments': <CasesView activeTab={activeTab} />,
            'case_notes': <CasesView activeTab={activeTab} />,
            'documents': <CasesView activeTab={activeTab} />,

            'shelter': <ShelterView activeTab={activeTab} />,
            'shelters': <ShelterView activeTab={activeTab} />,
            'placements': <ShelterView activeTab={activeTab} />,
            'resources': <ResourcesView />,

            'reporting': <ReportingView activeTab={activeTab} />,
            'reports': <ReportingView activeTab={activeTab} />,
            'kpis': <ReportingView activeTab={activeTab} />,
            'compliance': <ReportingView activeTab={activeTab} />,

            'admin_sys': <SystemAdminView activeTab={activeTab} />,
            'users': <SystemAdminView activeTab={activeTab} />,
            'pending_approvals': <SystemAdminView activeTab={activeTab} />,
            'groups': <SystemAdminView activeTab={activeTab} />,
            'audit_logs': <SystemAdminView activeTab={activeTab} />,
            'periodic_tasks': <SystemAdminView activeTab={activeTab} />,

            'blog_campaigns': <BlogManagementView initialTab={activeTab} />,
            'blog_posts': <BlogManagementView initialTab={activeTab} />,
            'categories': <BlogManagementView initialTab={activeTab} />,
            'comments': <BlogManagementView initialTab={activeTab} />,
            'newsletter': <BlogManagementView initialTab={activeTab} />,
            'tags': <BlogManagementView initialTab={activeTab} />,

            'system_admin': <SystemAdminView />,
            'settings': <SystemAdminView />,
        };

        return viewMap[activeTab] || <PlaceholderView title={activeTab.replace('_', ' ').toUpperCase()} setActiveTab={setActiveTab} />;
    };

    if (authLoading || (isAuthenticated && !user)) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    const isMobile = deviceType === 'MOBILE';
    const isTablet = deviceType === 'TABLET';
    const isDesktop = deviceType === 'DESKTOP';

    return (
        <Box sx={{
            display: 'flex',
            minHeight: '100vh',
            background: `radial-gradient(circle at 20% 30%, ${alpha(theme.palette.primary.light, 0.12)} 0%, transparent 50%), #f4f9f4`
        }}>
            <Header
                user={user}
                handleDrawerToggle={handleDrawerToggle}
                handleLogout={handleLogoutClick}
            />

            <Box
                component="nav"
                sx={{ width: { sm: isMobile ? 0 : DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
            >
                {/* Mobile Temporary Drawer */}
                {!isDesktop && (
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{ keepMounted: true }}
                        sx={{
                            display: { xs: 'block', sm: isTablet ? 'block' : 'none' },
                            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
                        }}
                    >
                        <Sidebar
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            openSections={openSections}
                            handleSectionToggle={handleSectionToggle}
                            canViewModule={canViewModule}
                        />
                        <Divider />
                        <Box sx={{ p: 2 }}>
                            <Button fullWidth variant="outlined" color="error" onClick={handleLogoutClick}>Logout</Button>
                        </Box>
                    </Drawer>
                )}

                {/* Desktop Permanent Drawer */}
                {isDesktop && (
                    <Drawer
                        variant="permanent"
                        sx={{
                            display: { xs: 'none', sm: 'block' },
                            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: '1px solid rgba(0,0,0,0.08)' },
                        }}
                        open
                    >
                        <Toolbar />
                        <Sidebar
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            openSections={openSections}
                            handleSectionToggle={handleSectionToggle}
                            canViewModule={canViewModule}
                        />
                    </Drawer>
                )}
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: isMobile ? 1.5 : (isTablet ? 2 : 3),
                    width: isDesktop ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
                    pb: isMobile ? 10 : 3, // Space for bottom nav on mobile
                }}
            >
                <Toolbar />
                {renderContent()}
            </Box>

            {isMobile && (
                <MobileBottomNav
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    canViewModule={canViewModule}
                />
            )}

            {/* Dialogs */}
            <Dialog
                open={openVolunteerDialog}
                onClose={() => setOpenVolunteerDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        background: alpha(theme.palette.background.paper, 0.9),
                        backdropFilter: 'blur(20px)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.5),
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid', borderColor: 'divider' }}>Add New Volunteer</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            value={volunteerForm.full_name}
                            onChange={(e) => setVolunteerForm({ ...volunteerForm, full_name: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            value={volunteerForm.email}
                            onChange={(e) => setVolunteerForm({ ...volunteerForm, email: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Phone"
                            value={volunteerForm.phone}
                            onChange={(e) => setVolunteerForm({ ...volunteerForm, phone: e.target.value })}
                        />
                        <FormControl fullWidth>
                            <InputLabel>System Role</InputLabel>
                            <Select
                                value={volunteerForm.role}
                                label="System Role"
                                onChange={(e) => setVolunteerForm({ ...volunteerForm, role: e.target.value })}
                            >
                                {USER_ROLES.map(role => (
                                    <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenVolunteerDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddVolunteer}>Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openCampaignDialog}
                onClose={() => setOpenCampaignDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        background: alpha(theme.palette.background.paper, 0.9),
                        backdropFilter: 'blur(20px)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.5),
                    }
                }}
            >
                <DialogTitle sx={{
                    fontWeight: 'bold',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`
                }}>Create New Campaign</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Campaign Title"
                            value={campaignForm.title}
                            onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        label="Category"
                                        value={campaignForm.category}
                                        onChange={(e) => setCampaignForm({ ...campaignForm, category: e.target.value })}
                                    >
                                        <MenuItem value="EDUCATION">Education</MenuItem>
                                        <MenuItem value="HEALTHCARE">Healthcare</MenuItem>
                                        <MenuItem value="SHELTER">Shelter/Housing</MenuItem>
                                        <MenuItem value="FOOD_SECURITY">Food Security</MenuItem>
                                        <MenuItem value="DISASTER_RELIEF">Disaster Relief</MenuItem>
                                        <MenuItem value="ENVIRONMENT">Environment</MenuItem>
                                        <MenuItem value="OTHER">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Urgency</InputLabel>
                                    <Select
                                        label="Urgency"
                                        value={campaignForm.urgency}
                                        onChange={(e) => setCampaignForm({ ...campaignForm, urgency: e.target.value })}
                                    >
                                        <MenuItem value="LOW">Low</MenuItem>
                                        <MenuItem value="MEDIUM">Medium</MenuItem>
                                        <MenuItem value="HIGH">High</MenuItem>
                                        <MenuItem value="CRITICAL">Critical</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <TextField
                            fullWidth
                            label="Goal Amount (KES)"
                            type="number"
                            value={campaignForm.target_amount}
                            onChange={(e) => setCampaignForm({ ...campaignForm, target_amount: e.target.value })}
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Start Date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={campaignForm.start_date}
                                    onChange={(e) => setCampaignForm({ ...campaignForm, start_date: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="End Date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={campaignForm.end_date}
                                    onChange={(e) => setCampaignForm({ ...campaignForm, end_date: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={3}
                            value={campaignForm.description}
                            onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                        />
                        <Box sx={{ mt: 1 }}>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    py: 1.5,
                                    borderStyle: 'dashed'
                                }}
                            >
                                {campaignForm.image ? `📷 ${campaignForm.image.name}` : '📷 Upload Campaign Image (Optional)'}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setCampaignForm({ ...campaignForm, image: file });
                                        }
                                    }}
                                />
                            </Button>
                            {campaignForm.image && (
                                <Button
                                    size="small"
                                    onClick={() => setCampaignForm({ ...campaignForm, image: null })}
                                    sx={{ mt: 1, textTransform: 'none' }}
                                >
                                    Remove Image
                                </Button>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setOpenCampaignDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateCampaign}>Create Campaign</Button>
                </DialogActions>
            </Dialog>

            <LogoutDialog
                open={openLogoutDialog}
                onClose={() => setOpenLogoutDialog(false)}
                onConfirm={handleConfirmLogout}
            />

            {/* Unified Community Hub */}
            <CommunityHub />
        </Box>
    );
}
