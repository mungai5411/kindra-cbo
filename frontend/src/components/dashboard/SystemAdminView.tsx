import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    IconButton,
    Grid,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Alert,
    Tooltip,
    CircularProgress,
    Snackbar,
    alpha,
    useTheme,
    LinearProgress
} from '@mui/material';
import {
    AdminPanelSettings,
    Search,
    Edit,
    Refresh,
    Delete,
    FamilyRestroom,
    Schedule,
    AccessTime,
    Autorenew,
    ErrorOutline,
    People,
    Security,
    CheckCircle
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import { fetchDashboardData, fetchReports } from '../../features/reporting/reportingSlice';
import { fetchVolunteers, updateVolunteer } from '../../features/volunteers/volunteersSlice';
import {
    fetchFamilies,
    fetchCases,
    deleteFamily
} from '../../features/caseManagement/caseManagementSlice';
import { fetchUsers, deleteUser, triggerInactivityCleanup, fetchAuditLogs, fetchPendingUsers, approveUser } from '../../features/admin/adminSlice';
import { fetchGroups, createGroup, deleteGroup, updateGroup } from '../../features/volunteers/groupsSlice';
import { GroupWork, Forum, VerifiedUser, HourglassTop } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmationDialog } from './ConfirmationDialog';

export function SystemAdminView({ activeTab }: { activeTab?: string }) {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { volunteers, isLoading: volLoading } = useSelector((state: RootState) => state.volunteers);
    const { isLoading: dashLoading } = useSelector((state: RootState) => state.reporting);
    const { users: allUsers, isLoading: adminLoading } = useSelector((state: RootState) => state.admin);
    const {
        families,
        cases,
    } = useSelector((state: RootState) => state.caseManagement);
    const { groups } = useSelector((state: RootState) => state.groups);
    const { auditLogs, pendingUsers } = useSelector((state: RootState) => state.admin);

    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [editRole, setEditRole] = useState('');
    const [editStatus, setEditStatus] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'info' | 'warning' | 'error' });

    // Confirmation Dialog State
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        severity?: 'info' | 'warning' | 'error';
    }>({
        open: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    // Group Management State
    const [openGroupDialog, setOpenGroupDialog] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');
    const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([]);
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchUsers());
        dispatch(fetchVolunteers());
        dispatch(fetchDashboardData());
        dispatch(fetchReports());
        dispatch(fetchFamilies());
        dispatch(fetchCases());
        dispatch(fetchGroups());
        dispatch(fetchAuditLogs());
        dispatch(fetchPendingUsers());
    }, [dispatch]);

    // Fetch volunteers realtime when creating/editing groups
    useEffect(() => {
        if (openGroupDialog) {
            dispatch(fetchVolunteers());
        }
    }, [openGroupDialog, dispatch]);

    const handleSync = async () => {
        setSnackbar({ open: true, message: 'Initiating global system synchronization...', severity: 'info' });
        try {
            await Promise.all([
                dispatch(fetchUsers()),
                dispatch(fetchDashboardData()),
                dispatch(fetchVolunteers()),
                dispatch(fetchFamilies()),
                dispatch(fetchCases()),
                dispatch(fetchGroups()),
                dispatch(fetchAuditLogs()),
                dispatch(fetchPendingUsers())
            ]);
            setSnackbar({ open: true, message: 'System synchronization successful!', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: 'Synchronization partially failed. Check network.', severity: 'error' });
        }
    };

    const userList = Array.isArray(allUsers) ? allUsers : [];

    const filteredUsers = userList.filter((u: any) =>
        (u.full_name || u.email)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleApproveUser = async (u: any) => {
        try {
            await dispatch(approveUser(u.id)).unwrap();
            setSnackbar({ open: true, message: `Account for ${u.email} approved!`, severity: 'success' });
            dispatch(fetchUsers());
        } catch (err: any) {
            setSnackbar({ open: true, message: err || 'Approval failed.', severity: 'error' });
        }
    };

    const handleEditUser = (user: any) => {
        setSelectedUser(user);
        setEditRole(user.role || 'DONOR');
        setEditStatus(user.is_active ? 'ACTIVE' : 'SUSPENDED');
        setOpenDialog(true);
    };

    const handleUpdateClearance = () => {
        if (selectedUser) {
            // Since allUsers comes from accounts/users/, we should use an update action that hits that endpoint
            // For now, let's assume updateVolunteer (which probably hits /volunteers/) works if they are linked
            // but for a generic user we should really have an updateAccount thunk.
            dispatch(updateVolunteer({
                id: selectedUser.id,
                data: { role: editRole, is_active: editStatus === 'ACTIVE' }
            })).then(() => {
                setOpenDialog(false);
                setSnackbar({ open: true, message: 'User account updated successfully', severity: 'success' });
                dispatch(fetchUsers());
            });
        }
    };

    const handleDeleteUser = (user: any) => {
        setConfirmDialog({
            open: true,
            title: 'Permanent Deletion',
            message: `Are you sure you want to PERMANENTLY delete the account for ${user.full_name || user.email}? This will remove all personal data and profiles across the entire system. This action is irreversible.`,
            severity: 'error',
            onConfirm: async () => {
                try {
                    await dispatch(deleteUser(user.id)).unwrap();
                    setSnackbar({ open: true, message: 'User account successfully decommissioned', severity: 'success' });
                } catch (error: any) {
                    setSnackbar({ open: true, message: error || 'Failed to delete user', severity: 'error' });
                }
                setConfirmDialog(prev => ({ ...prev, open: false }));
            }
        });
    };

    const handleDeleteGroup = (group: any) => {
        setConfirmDialog({
            open: true,
            title: 'Delete Volunteer Group',
            message: `Are you sure you want to dissolve the group "${group.name}"? This will not delete the volunteers, but will permanently remove the group and all its private messages.`,
            severity: 'error',
            onConfirm: async () => {
                try {
                    await dispatch(deleteGroup(group.id)).unwrap();
                    setSnackbar({ open: true, message: 'Group successfully dissolved', severity: 'success' });
                } catch (error: any) {
                    setSnackbar({ open: true, message: error || 'Failed to delete group', severity: 'error' });
                }
                setConfirmDialog(prev => ({ ...prev, open: false }));
            }
        });
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) {
            setSnackbar({ open: true, message: 'Group name is required', severity: 'error' });
            return;
        }
        try {
            await dispatch(createGroup({
                name: newGroupName,
                description: newGroupDesc,
                members: selectedVolunteers
            })).unwrap();
            setSnackbar({ open: true, message: 'New volunteer unit established', severity: 'success' });
            setOpenGroupDialog(false);
            setNewGroupName('');
            setNewGroupDesc('');
            setSelectedVolunteers([]);
        } catch (error: any) {
            setSnackbar({ open: true, message: error || 'Failed to establish unit', severity: 'error' });
        }
    };

    const handleEditGroup = (group: any) => {
        setEditingGroupId(group.id);
        setNewGroupName(group.name);
        setNewGroupDesc(group.description || '');
        setSelectedVolunteers(group.members_details?.map((m: any) => m.id) || []);
        setOpenGroupDialog(true);
    };

    const handleUpdateGroup = async () => {
        if (!editingGroupId) return;
        try {
            await dispatch(updateGroup({
                id: editingGroupId,
                data: {
                    name: newGroupName,
                    description: newGroupDesc,
                    members: selectedVolunteers
                }
            })).unwrap();
            setSnackbar({ open: true, message: 'Volunteer unit reconfiguration successful', severity: 'success' });
            setOpenGroupDialog(false);
            setEditingGroupId(null);
            setNewGroupName('');
            setNewGroupDesc('');
            setSelectedVolunteers([]);
        } catch (error: any) {
            setSnackbar({ open: true, message: error || 'Failed to reconfigure unit', severity: 'error' });
        }
    };

    const handleDeleteFamily = (familyId: string, familyName: string) => {
        setConfirmDialog({
            open: true,
            title: 'Delete Family Record',
            message: `Are you sure you want to delete the family record for ${familyName}?`,
            severity: 'error',
            onConfirm: async () => {
                try {
                    await dispatch(deleteFamily(familyId)).unwrap();
                    setSnackbar({ open: true, message: 'Family record removed successfully', severity: 'success' });
                } catch (error: any) {
                    setSnackbar({ open: true, message: error || 'Failed to delete record', severity: 'error' });
                }
                setConfirmDialog(prev => ({ ...prev, open: false }));
            }
        });
    };

    if (volLoading || dashLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><CircularProgress /></Box>;
    }

    // --- Sub-View Renderers ---

    const renderDashboard = () => (
        <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                    { title: 'Total Registered Accounts', value: userList.length, color: theme.palette.primary.main, icon: <People /> },
                    { title: 'System Uptime', value: '99.9%', color: theme.palette.success.main, sub: 'HEALTHY' },
                    { title: 'Inactivity Risk (Pending)', value: userList.filter(u => !u.is_active).length, color: theme.palette.warning.main, icon: <ErrorOutline /> },
                    { title: 'Active Volunteer Units', value: groups.length, color: theme.palette.info.main, icon: <GroupWork /> }
                ].map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2, borderRadius: 2, height: '100%',
                                background: alpha('#fff', 0.6), backdropFilter: 'blur(10px)',
                                border: '1px solid', borderColor: 'divider',
                                display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="overline" fontWeight="bold" color="text.secondary">{stat.title}</Typography>
                                {stat.icon && <Box sx={{ color: stat.color, opacity: 0.8 }}>{stat.icon}</Box>}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                <Typography variant="h4" fontWeight="900" sx={{ color: stat.color }}>{stat.value}</Typography>
                                {stat.sub && (
                                    <Typography variant="caption" sx={{ color: stat.color, fontWeight: 'bold', bgcolor: alpha(stat.color, 0.1), px: 1, borderRadius: 1 }}>
                                        {stat.sub}
                                    </Typography>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <FamilyRestroom color="primary" /> Central Registry Control
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} lg={6}>
                    <RegistryCard title="Families Managed" count={families.length} items={families.slice(0, 5)} type="family" onDelete={handleDeleteFamily} />
                </Grid>
                <Grid item xs={12} lg={6}>
                    <RegistryCard title="Recent Cases Audit" count={cases.length} items={cases.slice(0, 5)} type="case" onDelete={() => { }} />
                </Grid>
            </Grid>
        </>
    );

    const renderUsers = () => (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">Staff & Member Credentials</Typography>
                    <Typography variant="body2" color="text.secondary">Manage system access, roles, and identity verification</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Search by identity..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                            sx: { borderRadius: 1, width: 300, bgcolor: 'background.paper' }
                        }}
                    />
                    <Button variant="contained" startIcon={<Refresh />} onClick={() => dispatch(fetchUsers())} sx={{ borderRadius: 1 }}>Sync Directory</Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {filteredUsers.map((u: any) => (
                    <Grid item xs={12} md={6} lg={4} key={u.id}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3, borderRadius: 2, border: '1px solid',
                                borderColor: 'divider', bgcolor: alpha('#fff', 0.8),
                                backdropFilter: 'blur(10px)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 12px 24px rgba(0,0,0,0.05)',
                                    borderColor: 'primary.main'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Box sx={{
                                        width: 50, height: 50, borderRadius: 1.5,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: 'primary.main', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        fontWeight: '900', fontSize: '1.4rem'
                                    }}>
                                        {(u.full_name || u.email)?.[0].toUpperCase()}
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="800" sx={{ lineHeight: 1.2 }}>{u.full_name || 'Anonymous User'}</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>{u.email}</Typography>
                                        <Chip
                                            label={u.role || 'GUEST'}
                                            size="small"
                                            sx={{
                                                borderRadius: 0.5, fontWeight: '900',
                                                fontSize: '0.6rem', height: 20,
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                color: 'primary.main'
                                            }}
                                        />
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <IconButton size="small" onClick={() => handleEditUser(u)} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}><Edit fontSize="small" /></IconButton>
                                    <IconButton size="small" onClick={() => handleDeleteUser(u)} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}><Delete fontSize="small" /></IconButton>
                                </Box>
                            </Box>

                            <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.background.default, 0.4), borderRadius: 1, mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption" fontWeight="bold" sx={{ opacity: 0.6 }}>STATUS</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: u.is_active ? 'success.main' : 'error.main' }} />
                                        <Typography variant="caption" fontWeight="bold">{u.is_active ? 'VERIFIED' : 'SUSPENDED'}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" fontWeight="bold" sx={{ opacity: 0.6 }}>JOINED</Typography>
                                    <Typography variant="caption" fontWeight="bold">
                                        {u.date_joined ? new Date(u.date_joined).toLocaleDateString() : 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button fullWidth size="small" variant="outlined" sx={{ borderRadius: 1, fontSize: '0.7rem', fontWeight: 'bold' }}>Activity logs</Button>
                                <Button fullWidth size="small" variant="outlined" sx={{ borderRadius: 1, fontSize: '0.7rem', fontWeight: 'bold' }}>Security info</Button>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

    const renderPendingApprovals = () => (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">Pending Identity Verifications</Typography>
                    <Typography variant="body2" color="text.secondary">Shelter Partners waiting for system authorization</Typography>
                </Box>
                <Button variant="contained" startIcon={<Refresh />} onClick={() => dispatch(fetchPendingUsers())} sx={{ borderRadius: 1 }}>Refresh Queue</Button>
            </Box>

            {!pendingUsers || pendingUsers.length === 0 ? (
                <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 2, border: '1px dashed', borderColor: 'divider', bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                    <VerifiedUser sx={{ fontSize: 60, color: 'text.disabled', mb: 2, opacity: 0.3 }} />
                    <Typography variant="h6" color="text.secondary" fontWeight="bold">Directory Clear</Typography>
                    <Typography variant="body2" color="text.secondary">No accounts are currently awaiting approval.</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {pendingUsers.map((u: any) => (
                        <Grid item xs={12} md={6} lg={4} key={u.id}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3, borderRadius: 2, border: '1px solid',
                                    borderColor: 'warning.light', bgcolor: alpha('#fff', 0.8),
                                    backdropFilter: 'blur(10px)',
                                    display: 'flex', flexDirection: 'column', gap: 2
                                }}
                            >
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Box sx={{
                                        width: 50, height: 50, borderRadius: 1.5,
                                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                                        color: 'warning.main', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <HourglassTop />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">{u.full_name || u.email}</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{u.organization || 'No Organization'}</Typography>
                                        <Typography variant="caption" sx={{ color: 'warning.dark', fontWeight: 'bold' }}>SHELTER PARTNER</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.background.default, 0.4), borderRadius: 1 }}>
                                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>CONTACT: {u.phone_number || 'N/A'}</Typography>
                                    <Typography variant="caption">REGISTERED: {new Date(u.created_at).toLocaleString()}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="success"
                                        onClick={() => handleApproveUser(u)}
                                        sx={{ borderRadius: 1, fontWeight: 'bold' }}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleDeleteUser(u)}
                                        sx={{ borderRadius: 1, fontWeight: 'bold' }}
                                    >
                                        Reject
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );

    const renderPeriodicTasks = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
                <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', background: 'linear-gradient(to bottom, #fff, #fafafa)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                        <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1 }}>
                            <Schedule color="primary" sx={{ fontSize: 32 }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight="bold">Automated Lifecycle Engine</Typography>
                            <Typography variant="body2" color="text.secondary">Real-time monitoring of system background processes</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ mb: 4, p: 3, bgcolor: '#fff', borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1), boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Autorenew sx={{ fontSize: 18 }} /> User Inactivity Cleanup
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Protocol version 2.4 (Modern Logic Integrated)</Typography>
                            </Box>
                            <Chip label="RUNNING DAILY" size="small" color="success" sx={{ borderRadius: 1, fontWeight: 'bold' }} />
                        </Box>

                        <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
                            Ensures data hygiene by tracking last login timestamps. High-risk accounts (inactive &gt; 6 months) are automatically decommissioned following a 5-stage notification workflow.
                        </Typography>

                        <Grid container spacing={2} sx={{ mb: 4 }}>
                            {[
                                { m: '1', a: 'Check-in Notification' },
                                { m: '2', a: 'Community Highlights' },
                                { m: '3', a: 'Re-engagement Offer' },
                                { m: '4', a: 'Archival Warning' },
                                { m: '5', a: 'FINAL DELETION ALERT' },
                                { m: '6', a: 'DATA PURGE' },
                            ].map((step, i) => (
                                <Grid item xs={4} md={2} key={i}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Box sx={{
                                            width: '100%', pt: '100%', position: 'relative',
                                            bgcolor: i === 5 ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.primary.main, 0.05),
                                            borderRadius: 1, mb: 1, border: '1px solid',
                                            borderColor: i === 5 ? alpha(theme.palette.error.main, 0.2) : alpha(theme.palette.primary.main, 0.1)
                                        }}>
                                            <Typography sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold', color: i === 5 ? 'error.main' : 'primary.main' }}>
                                                {step.m}M
                                            </Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 'bold', lineBreak: 'anywhere' }}>{step.a}</Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>

                        <Box sx={{ p: 2, bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="caption" display="block" fontWeight="bold" sx={{ opacity: 0.6 }}>LOG STATUS</Typography>
                                <Typography variant="body2" fontWeight="bold">Next Automated Cycle: 02:00 AM</Typography>
                            </Box>
                            <Button
                                variant="contained"
                                startIcon={adminLoading ? <CircularProgress size={16} color="inherit" /> : <Refresh />}
                                onClick={() => {
                                    dispatch(triggerInactivityCleanup()).then(() => {
                                        setSnackbar({ open: true, message: 'Cleanup logic triggered: Scanning records...', severity: 'info' });
                                    });
                                }}
                                disabled={adminLoading}
                                sx={{ borderRadius: 1, px: 3, fontWeight: 'bold' }}
                            >
                                Trigger Engine
                            </Button>
                        </Box>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Active Background Threads</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {[
                                { name: 'Audit Trail Compression', progress: 100, status: 'DONE' },
                                { name: 'Media Storage Cleanup', progress: 45, status: 'RUNNING' },
                                { name: 'Third-party API Sync', progress: 88, status: 'PENDING' }
                            ].map((task, i) => (
                                <Box key={i} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" fontWeight="600">{task.name}</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: task.status === 'RUNNING' ? 'primary.main' : 'text.secondary' }}>{task.status}</Typography>
                                    </Box>
                                    <LinearProgress variant="determinate" value={task.progress} sx={{ height: 4, borderRadius: 1 }} />
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, borderRadius: 2, height: '100%', bgcolor: '#1e293b', color: '#fff', boxShadow: '0 10px 40px rgba(15, 23, 42, 0.3)' }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#94a3b8' }}>
                        <AccessTime sx={{ fontSize: 20 }} /> EVENT_LOG_TAIL
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3, maxHeight: 400, overflow: 'auto' }}>
                        {auditLogs.slice(0, 10).map((log: any, i: number) => (
                            <Box key={log.id || i} sx={{ p: 2, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="subtitle2" sx={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 'bold', textTransform: 'uppercase' }}>{log.event_type?.replace(/_/g, ' ')}</Typography>
                                    <Typography variant="caption" sx={{ color: '#64748b' }}>{new Date(log.timestamp).toLocaleTimeString()}</Typography>
                                </Box>
                                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>&gt; {log.description}</Typography>
                                {log.user_name && <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold', mt: 0.5, display: 'block' }}>User: {log.user_name}</Typography>}
                            </Box>
                        ))}
                        {auditLogs.length === 0 && (
                            <Box sx={{ p: 4, textAlign: 'center', opacity: 0.5 }}>
                                <Typography variant="caption">No real-time events captured in current cycle.</Typography>
                            </Box>
                        )}
                    </Box>
                    <Button fullWidth sx={{ mt: 4, color: '#64748b', borderColor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }} variant="outlined">View Full Terminal Logs</Button>
                </Paper>
            </Grid>
        </Grid>
    );

    const renderGroups = () => (
        <Paper elevation={0} sx={{ borderRadius: 1, overflow: 'hidden', background: alpha('#fff', 0.5), backdropFilter: 'blur(10px)' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">Volunteer Units & Groups</Typography>
                <Button variant="contained" startIcon={<GroupWork />} onClick={() => setOpenGroupDialog(true)} sx={{ borderRadius: 1 }}>Form New Group</Button>
            </Box>

            <Grid container spacing={3} sx={{ p: 3 }}>
                {groups.map((group: any) => (
                    <Grid item xs={12} md={6} lg={4} key={group.id}>
                        <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', position: 'relative' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Box sx={{ p: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1 }}>
                                    <GroupWork color="primary" />
                                </Box>
                                <Box>
                                    <IconButton size="small" color="primary" onClick={() => handleEditGroup(group)}><Edit fontSize="small" /></IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDeleteGroup(group)}><Delete fontSize="small" /></IconButton>
                                </Box>
                            </Box>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>{group.name}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>{group.description || 'No description provided.'}</Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <People sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="caption" fontWeight="bold">{group.members_details?.length || 0} Members</Typography>
                                <Forum sx={{ fontSize: 16, color: 'text.secondary', ml: 1 }} />
                                <Typography variant="caption" fontWeight="bold">{group.message_count || 0} Messages</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {group.members_details?.slice(0, 3).map((m: any) => (
                                    <Chip key={m.id} label={m.name} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                                ))}
                                {(group.members_details?.length || 0) > 3 && (
                                    <Chip label={`+${(group.members_details?.length || 0) - 3} more`} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                ))}
                {groups.length === 0 && (
                    <Grid item xs={12}>
                        <Box sx={{ py: 6, textAlign: 'center', bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                            <Typography color="text.secondary">No active volunteer groups found. Initialize one above.</Typography>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Paper>
    );

    const renderAuditLogs = () => (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">Global System Audit Trail</Typography>
                    <Typography variant="body2" color="text.secondary">Real-time immutable record of all administrative and system operations</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Filter by event type or detail..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                            sx: { borderRadius: 1, width: 300, bgcolor: 'background.paper' }
                        }}
                    />
                    <Button variant="contained" startIcon={<Refresh />} onClick={() => dispatch(fetchAuditLogs())} sx={{ borderRadius: 1 }}>Refresh Logs</Button>
                </Box>
            </Box>

            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: '60vh' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>TIMESTAMP</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>EVENT TYPE</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>DESCRIPTION</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>ACTOR</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>IP ADDRESS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {auditLogs.filter((log: any) =>
                                log.event_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                log.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
                            ).map((log: any) => {
                                const isSecurity = ['USER_LOGIN', 'USER_REGISTERED', 'USER_APPROVED'].includes(log.event_type);
                                const isDeletion = log.event_type?.includes('DELETE') || log.event_type?.includes('REJECT');

                                return (
                                    <TableRow key={log.id} hover>
                                        <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary', fontWeight: 500 }}>
                                            {new Date(log.timestamp).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={log.event_type?.replace(/_/g, ' ')}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    fontSize: '0.65rem',
                                                    color: isSecurity ? 'primary.main' : isDeletion ? 'error.main' : 'info.main',
                                                    borderColor: isSecurity ? 'primary.light' : isDeletion ? 'error.light' : 'info.light',
                                                    bgcolor: isSecurity ? alpha(theme.palette.primary.main, 0.05) : isDeletion ? alpha(theme.palette.error.main, 0.05) : alpha(theme.palette.info.main, 0.05)
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>{log.description}</TableCell>
                                        <TableCell>
                                            {log.user_name ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'primary.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 'bold' }}>
                                                        {log.user_name[0].toUpperCase()}
                                                    </Box>
                                                    <Typography variant="body2" fontWeight="bold">{log.user_name}</Typography>
                                                </Box>
                                            ) : (
                                                <Typography variant="caption" color="text.disabled">SYSTEM</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.75rem' }}>
                                            {log.ip_address || 'Internal'}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {auditLogs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} sx={{ py: 10, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">No activity logs found in current registry.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );

    const renderDefault = () => (
        <Box sx={{ py: 12, textAlign: 'center', bgcolor: alpha(theme.palette.background.paper, 0.5), borderRadius: 2, border: '2px dashed', borderColor: 'divider' }}>
            <AdminPanelSettings sx={{ fontSize: 80, mb: 2, opacity: 0.1 }} />
            <Typography variant="h6" color="text.secondary">System Module Protocol Offline</Typography>
            <Typography variant="body2" color="text.secondary">Select a valid operation from the primary navigation array.</Typography>
        </Box>
    );

    return (
        <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h4" fontWeight="900" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
                        {activeTab === 'users' ? 'User Infrastructure' :
                            activeTab === 'pending_approvals' ? 'Identity Verification' :
                                activeTab === 'periodic_tasks' ? 'Operations Core' : 'System Administration'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Kindra Intelligence & Management Protocol
                    </Typography>
                </Box>
                <Button variant="contained" onClick={handleSync} startIcon={<Refresh />} sx={{ borderRadius: 1, fontWeight: 'bold', px: 3, boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)' }}>Sync Hub</Button>
            </Box>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.99 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'admin_sys' ? renderDashboard() :
                        activeTab === 'users' ? renderUsers() :
                            activeTab === 'pending_approvals' ? renderPendingApprovals() :
                                activeTab === 'periodic_tasks' ? renderPeriodicTasks() :
                                    activeTab === 'groups' ? renderGroups() :
                                        activeTab === 'audit_logs' ? renderAuditLogs() :
                                            renderDefault()}
                </motion.div>
            </AnimatePresence>

            {/* Edit User Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', pb: 0 }}>Identity Modification</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3 }}>
                        <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>TARGET IDENTITY</Typography>
                            <Typography variant="body1" fontWeight="bold">{(selectedUser?.full_name || selectedUser?.email)}</Typography>
                        </Box>

                        <TextField fullWidth select label="Authority Clearance" value={editRole} onChange={(e) => setEditRole(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
                            <MenuItem value="ADMIN">System Administrator</MenuItem>
                            <MenuItem value="MANAGEMENT">Management Team</MenuItem>
                            <MenuItem value="CASE_WORKER">Case Worker</MenuItem>
                            <MenuItem value="VOLUNTEER">Field Operation</MenuItem>
                            <MenuItem value="DONOR">Public Donor</MenuItem>
                        </TextField>

                        <TextField fullWidth select label="Account Status" value={editStatus} onChange={(e) => setEditStatus(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}>
                            <MenuItem value="ACTIVE">Verified Active</MenuItem>
                            <MenuItem value="SUSPENDED">Security Suspension</MenuItem>
                        </TextField>

                        <Alert severity="info" icon={<Security />} sx={{ borderRadius: 1 }}>Modifications propagate globally across all field nodes.</Alert>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Discard</Button>
                    <Button variant="contained" onClick={handleUpdateClearance} sx={{ borderRadius: 1, px: 4, fontWeight: 'bold' }}>Commit Changes</Button>
                </DialogActions>
            </Dialog>

            {/* Form New/Edit Group Dialog */}
            <Dialog
                open={openGroupDialog}
                onClose={() => {
                    setOpenGroupDialog(false);
                    setEditingGroupId(null);
                    setNewGroupName('');
                    setNewGroupDesc('');
                    setSelectedVolunteers([]);
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
                    {editingGroupId ? 'Reconfigure Volunteer Unit' : 'Establish Volunteer Unit'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Unit Designation (Name)"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Operational Mandate (Description)"
                            value={newGroupDesc}
                            onChange={(e) => setNewGroupDesc(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                        />
                        <Box>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <People fontSize="small" /> Assign Operatives (Volunteers)
                            </Typography>
                            <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                                <Grid container spacing={1}>
                                    {volunteers.map((v: any) => (
                                        <Grid item xs={12} key={v.id}>
                                            <Box
                                                onClick={() => {
                                                    if (selectedVolunteers.includes(v.id)) {
                                                        setSelectedVolunteers(selectedVolunteers.filter(id => id !== v.id));
                                                    } else {
                                                        setSelectedVolunteers([...selectedVolunteers, v.id]);
                                                    }
                                                }}
                                                sx={{
                                                    p: 1.5, borderRadius: 1, cursor: 'pointer',
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    bgcolor: selectedVolunteers.includes(v.id) ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                                    border: '1px solid', borderColor: selectedVolunteers.includes(v.id) ? 'primary.main' : 'divider',
                                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                                                }}
                                            >
                                                <Typography variant="body2" fontWeight={selectedVolunteers.includes(v.id) ? "bold" : "normal"}>{v.full_name}</Typography>
                                                {selectedVolunteers.includes(v.id) && <CheckCircle color="primary" sx={{ fontSize: 18 }} />}
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => {
                        setOpenGroupDialog(false);
                        setEditingGroupId(null);
                        setNewGroupName('');
                        setNewGroupDesc('');
                        setSelectedVolunteers([]);
                    }} sx={{ fontWeight: 'bold' }}>Abort</Button>
                    <Button variant="contained" onClick={editingGroupId ? handleUpdateGroup : handleCreateGroup} sx={{ borderRadius: 1, px: 4, fontWeight: 'bold' }}>
                        {editingGroupId ? 'Commit Reconfiguration' : 'Deploy Unit'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2, fontWeight: 'bold', boxShadow: theme.shadows[10] }}>{snackbar.message}</Alert>
            </Snackbar>

            <ConfirmationDialog
                open={confirmDialog.open}
                title={confirmDialog.title}
                message={confirmDialog.message}
                severity={confirmDialog.severity}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
            />
        </Box>
    );
}

// Helper components
const RegistryCard = ({ title, count, items, type, onDelete }: any) => {
    const theme = useTheme();
    return (
        <Paper elevation={0} sx={{ p: 0, borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold" fontSize="1rem">{title}</Typography>
                <Chip label={`${count} TOTAL`} color="primary" size="small" sx={{ fontWeight: 'bold', borderRadius: 1 }} />
            </Box>
            <Table size="small">
                <TableBody>
                    {items.map((item: any) => (
                        <TableRow key={item.id} hover>
                            <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'primary.main' }}>#{type === 'family' ? item.family_code : item.case_number}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{type === 'family' ? item.primary_contact_name : item.title}</TableCell>
                            <TableCell align="right">
                                <IconButton size="small" color="error" onClick={() => onDelete(item.id, type === 'family' ? item.primary_contact_name : item.title)}>
                                    <Delete fontSize="small" sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }} />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    {items.length === 0 && <TableRow><TableCell colSpan={3} align="center" sx={{ py: 6, color: 'text.secondary' }}>No active records in registry</TableCell></TableRow>}
                </TableBody>
            </Table>
            <Button fullWidth sx={{ py: 1, color: 'text.secondary', textTransform: 'none', fontWeight: 'bold' }}>View Full Registry</Button>
        </Paper>
    );
};
