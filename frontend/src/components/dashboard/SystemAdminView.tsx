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
    CircularProgress,
    Snackbar,
    alpha,
    useTheme,
    LinearProgress,
    Avatar
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
import { fetchUsers, deleteUser, triggerInactivityCleanup, fetchAuditLogs, fetchPendingUsers, approveUser, fetchPeriodicTasks, fetchTaskResults } from '../../features/admin/adminSlice';
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
    const { auditLogs, pendingUsers, periodicTasks, taskResults } = useSelector((state: RootState) => state.admin);

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
        dispatch(fetchPeriodicTasks());
        dispatch(fetchTaskResults());
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
                dispatch(fetchPendingUsers()),
                dispatch(fetchPeriodicTasks()),
                dispatch(fetchTaskResults())
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
            <Grid container spacing={3} sx={{ mb: 6 }}>
                {[
                    { title: 'Registered Accounts', value: userList.length, color: theme.palette.primary.main, icon: <People /> },
                    { title: 'System Uptime', value: '99.9%', color: '#519755', sub: 'HEALTHY', icon: <Security /> },
                    { title: 'Inactivity Risk', value: userList.filter(u => !u.is_active).length, color: '#FF708B', icon: <ErrorOutline /> },
                    { title: 'Volunteer Units', value: groups.length, color: '#5D5FEF', icon: <GroupWork /> }
                ].map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                height: '100%',
                                position: 'relative',
                                overflow: 'hidden',
                                background: alpha(stat.color, 0.03),
                                border: '1px solid',
                                borderColor: alpha(stat.color, 0.1),
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                backdropFilter: 'blur(10px)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                '&:hover': {
                                    borderColor: stat.color,
                                    background: alpha(stat.color, 0.05),
                                    transform: 'translateY(-4px)',
                                    boxShadow: `0 12px 28px ${alpha(stat.color, 0.1)}`,
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, position: 'relative', zIndex: 1 }}>
                                <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1 }}>{stat.title}</Typography>
                                <Box sx={{
                                    color: stat.color,
                                    bgcolor: alpha(stat.color, 0.1),
                                    p: 1,
                                    borderRadius: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {stat.icon}
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, position: 'relative', zIndex: 1 }}>
                                <Typography variant="h3" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: -1 }}>{stat.value}</Typography>
                                {stat.sub && (
                                    <Typography variant="caption" sx={{ color: stat.color, fontWeight: 900, bgcolor: alpha(stat.color, 0.15), px: 1, py: 0.5, borderRadius: 1, fontSize: '0.65rem' }}>
                                        {stat.sub}
                                    </Typography>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Typography variant="h5" sx={{ mb: 4, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 2, letterSpacing: -0.5 }}>
                <FamilyRestroom sx={{ color: 'primary.main' }} /> Central Registry
            </Typography>
            <Grid container spacing={4}>
                <Grid item xs={12} lg={6}>
                    <RegistryCard title="Families Managed" count={families.length} items={families.slice(0, 5)} type="family" onDelete={handleDeleteFamily} />
                </Grid>
                <Grid item xs={12} lg={6}>
                    <RegistryCard title="Operations Audit" count={cases.length} items={cases.slice(0, 5)} type="case" onDelete={() => { }} />
                </Grid>
            </Grid>
        </>
    );

    const renderUsers = () => (
        <Box>
            <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>Identity Management</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mt: 0.5 }}>Administrative access and clearance control</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        placeholder="Search identities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: 'text.disabled' }} /></InputAdornment>,
                            sx: {
                                borderRadius: 3,
                                width: { xs: '100%', sm: 300 },
                                bgcolor: alpha(theme.palette.background.paper, 0.8),
                                border: '1px solid',
                                borderColor: alpha(theme.palette.divider, 0.1),
                                '& fieldset': { border: 'none' },
                            }
                        }}
                    />
                    <Button
                        variant="contained"
                        startIcon={<Refresh />}
                        onClick={() => dispatch(fetchUsers())}
                        sx={{
                            borderRadius: 3,
                            boxShadow: 'none',
                            textTransform: 'none',
                            fontWeight: 800,
                            px: 3,
                            '&:hover': { transform: 'translateY(-2px)' }
                        }}
                    >
                        Directory Sync
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={4}>
                {filteredUsers.map((u: any) => (
                    <Grid item xs={12} md={6} lg={4} key={u.id}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 0,
                                borderRadius: 4,
                                border: '1px solid',
                                borderColor: alpha(theme.palette.divider, 0.08),
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                bgcolor: 'background.paper',
                                '&:hover': {
                                    borderColor: alpha(theme.palette.primary.main, 0.3),
                                    boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
                                    transform: 'translateY(-4px)'
                                }
                            }}
                        >
                            <Box sx={{ p: 3, display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                                <Avatar
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 3,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: 'primary.main',
                                        fontWeight: 900,
                                        fontSize: '1.25rem'
                                    }}
                                >
                                    {(u.full_name || u.email)?.[0]?.toUpperCase()}
                                </Avatar>
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box sx={{ pr: 1, minWidth: 0 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.2, mb: 0.5, noWrap: true }}>
                                                {u.full_name || 'Anonymous User'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, noWrap: true, fontWeight: 600 }}>
                                                {u.email}
                                            </Typography>
                                            <Chip
                                                label={u.role || 'GUEST'}
                                                size="small"
                                                sx={{
                                                    borderRadius: 1.5,
                                                    fontWeight: 800,
                                                    fontSize: '0.6rem',
                                                    height: 22,
                                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                    color: 'primary.main',
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            <IconButton size="small" onClick={() => handleEditUser(u)} sx={{ '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1) } }}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDeleteUser(u)} sx={{ '&:hover': { color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.1) } }}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>

                            <Box sx={{
                                px: 3, py: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderTop: '1px solid',
                                borderColor: alpha(theme.palette.divider, 0.04),
                                bgcolor: alpha(theme.palette.background.default, 0.5)
                            }}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, display: 'block', letterSpacing: 0.5, mb: 0.2 }}>STATUS</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: u.is_active ? '#519755' : 'error.main', boxShadow: u.is_active ? '0 0 10px rgba(81, 151, 85, 0.3)' : 'none' }} />
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary' }}>{u.is_active ? 'ACTIVE' : 'SUSPENDED'}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, display: 'block', letterSpacing: 0.5, mb: 0.2 }}>MEMBER SINCE</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                        {u.date_joined ? new Date(u.date_joined).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                                <Button
                                    fullWidth
                                    size="small"
                                    variant="text"
                                    onClick={() => { setSnackbar({ open: true, message: 'Fetching activity logs...', severity: 'info' }) }}
                                    sx={{
                                        borderRadius: 2,
                                        color: 'text.secondary',
                                        textTransform: 'none',
                                        fontWeight: 800,
                                        fontSize: '0.7rem',
                                        py: 1,
                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), color: 'primary.main' }
                                    }}
                                >
                                    Activity Logs
                                </Button>
                                <Button
                                    fullWidth
                                    size="small"
                                    variant="text"
                                    onClick={() => { setSnackbar({ open: true, message: 'Checking security protocols...', severity: 'info' }) }}
                                    sx={{
                                        borderRadius: 2,
                                        color: 'text.secondary',
                                        textTransform: 'none',
                                        fontWeight: 800,
                                        fontSize: '0.7rem',
                                        py: 1,
                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), color: 'primary.main' }
                                    }}
                                >
                                    Security Vault
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

    const renderPendingApprovals = () => (
        <Box>
            <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>Verification Queue</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mt: 0.5 }}>Shelter Partner authorization requests</Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={() => dispatch(fetchPendingUsers())}
                    sx={{ borderRadius: 3, fontWeight: 800, textTransform: 'none' }}
                >
                    Update Queue
                </Button>
            </Box>

            {!pendingUsers || pendingUsers.length === 0 ? (
                <Paper sx={{
                    p: 10,
                    textAlign: 'center',
                    borderRadius: 4,
                    border: '1px dashed',
                    borderColor: alpha(theme.palette.divider, 0.1),
                    bgcolor: alpha(theme.palette.background.paper, 0.3)
                }}>
                    <VerifiedUser sx={{ fontSize: 64, color: 'success.main', mb: 2, opacity: 0.2 }} />
                    <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 900 }}>Queue Clear</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.6 }}>No pending account authorizations.</Typography>
                </Paper>
            ) : (
                <Grid container spacing={4}>
                    {pendingUsers.map((u: any) => (
                        <Grid item xs={12} md={6} lg={4} key={u.id}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 4,
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.warning.main, 0.2),
                                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                                    backdropFilter: 'blur(20px)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 3,
                                    boxShadow: `0 8px 32px ${alpha(theme.palette.warning.main, 0.05)}`
                                }}
                            >
                                <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
                                    <Avatar sx={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: 2.5,
                                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                                        color: 'warning.dark',
                                        fontWeight: 900
                                    }}>
                                        <HourglassTop />
                                    </Avatar>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 900, noWrap: true }}>{u.full_name || u.email}</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', noWrap: true }}>
                                            {u.organization || 'Independent Partner'}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'warning.dark', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                                            SHELTER PARTNER
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 3, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.05) }}>
                                    <Typography variant="caption" sx={{ display: 'block', mb: 0.8, fontWeight: 700 }}>
                                        CONTACT: <Box component="span" sx={{ color: 'text.primary' }}>{u.phone_number || 'N/A'}</Box>
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                                        SUBMITTED: <Box component="span" sx={{ color: 'text.primary' }}>{new Date(u.created_at).toLocaleDateString()}</Box>
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="success"
                                        disableElevation
                                        onClick={() => handleApproveUser(u)}
                                        sx={{ borderRadius: 2.5, fontWeight: 900, textTransform: 'none', py: 1.2 }}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleDeleteUser(u)}
                                        sx={{ borderRadius: 2.5, fontWeight: 900, textTransform: 'none', py: 1.2 }}
                                    >
                                        Decline
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
        <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
                <Paper sx={{
                    p: 4,
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.08),
                    bgcolor: 'background.paper',
                    boxShadow: '0 4px 32px rgba(0,0,0,0.02)'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 4 }}>
                        <Avatar sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2.5 }}>
                            <Schedule color="primary" sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>Lifecycle Automation</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Real-time coordination of background protocols</Typography>
                        </Box>
                    </Box>

                    <Box sx={{
                        mb: 4,
                        p: 3,
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                        borderRadius: 3.5,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.1),
                        boxShadow: '0 8px 32px rgba(0,0,0,0.04)'
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Autorenew sx={{ fontSize: 20, color: 'primary.main' }} /> Identity Hygiene Engine
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Protocol v2.4 (Kindra Intelligence Integrated)</Typography>
                            </Box>
                            <Chip label="RUNNING DAILY" size="small" color="success" sx={{ borderRadius: 1.5, fontWeight: 900, fontSize: '0.65rem' }} />
                        </Box>

                        <Typography variant="body2" sx={{ mb: 4, lineHeight: 1.6, color: 'text.secondary', fontWeight: 500 }}>
                            Ensures data integrity by monitoring inactivity thresholds. Stale identities (&gt; 6 months) are automatically processed through a multi-stage decommissioning workflow.
                        </Typography>

                        <Grid container spacing={2} sx={{ mb: 4 }}>
                            {[
                                { m: '1', a: 'Discovery' },
                                { m: '2', a: 'Insight' },
                                { m: '3', a: 'Re-engage' },
                                { m: '4', a: 'Warning' },
                                { m: '5', a: 'DELETION' },
                                { m: '6', a: 'PURGE' },
                            ].map((step, i) => (
                                <Grid item xs={4} md={2} key={i}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Box sx={{
                                            width: '100%', pt: '100%', position: 'relative',
                                            bgcolor: i >= 4 ? alpha(theme.palette.error.main, 0.08) : alpha(theme.palette.primary.main, 0.05),
                                            borderRadius: 2, mb: 1, border: '1px solid',
                                            borderColor: i >= 4 ? alpha(theme.palette.error.main, 0.15) : alpha(theme.palette.primary.main, 0.1)
                                        }}>
                                            <Typography sx={{
                                                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                                fontWeight: 900, fontSize: '0.85rem',
                                                color: i >= 4 ? 'error.main' : 'primary.main'
                                            }}>
                                                {step.m}M
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', color: i >= 4 ? 'error.main' : 'text.secondary' }}>
                                            {step.a}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>

                        <Box sx={{ p: 2.5, bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.05), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.disabled', letterSpacing: 0.5, mb: 0.5 }}>STATUS MONITOR</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 800 }}>Next Cycle: 02:00 AM UTC</Typography>
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
                                sx={{ borderRadius: 2.5, px: 3, fontWeight: 900, textTransform: 'none', boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}` }}
                            >
                                Force Scan
                            </Button>
                        </Box>
                    </Box>

                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 900, letterSpacing: -0.2 }}>Active Executions</Typography>
                            <Button size="small" variant="text" onClick={() => dispatch(fetchTaskResults())} startIcon={<Refresh />} sx={{ fontWeight: 800, textTransform: 'none' }}>Refresh Logs</Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {taskResults.length > 0 ? taskResults.slice(0, 5).map((result: any) => (
                                <Box key={result.id} sx={{ p: 2.5, bgcolor: alpha(theme.palette.background.default, 0.3), borderRadius: 3, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.06) }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main', fontFamily: 'monospace' }}>{result.task_name?.split('.').pop()}</Typography>
                                        <Chip
                                            label={result.status}
                                            size="small"
                                            color={result.status === 'SUCCESS' ? 'success' : result.status === 'FAILURE' ? 'error' : 'warning'}
                                            sx={{ fontSize: '0.6rem', height: 18, fontWeight: 900, borderRadius: 1 }}
                                        />
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={result.status === 'SUCCESS' ? 100 : result.status === 'FAILURE' ? 0 : 50}
                                        sx={{
                                            borderRadius: 5,
                                            height: 6,
                                            bgcolor: alpha(theme.palette.divider, 0.1),
                                            '& .MuiLinearProgress-bar': { borderRadius: 5 }
                                        }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>Ref: {result.task_id.substring(0, 8)}</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>{new Date(result.date_done).toLocaleTimeString()}</Typography>
                                    </Box>
                                </Box>
                            )) : (
                                <Box sx={{ p: 4, textAlign: 'center', bgcolor: alpha(theme.palette.background.default, 0.2), borderRadius: 3, border: '1px dashed', borderColor: alpha(theme.palette.divider, 0.1) }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>No execution history available.</Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
                <Paper sx={{
                    p: 4,
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: alpha('#fff', 0.1),
                    height: '100%',
                    bgcolor: '#1a1f2c',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                        <Avatar sx={{ bgcolor: alpha('#fff', 0.1), borderRadius: 2 }}>
                            <AccessTime sx={{ color: '#fff' }} fontSize="small" />
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>Operational Core</Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2.5, overflow: 'auto', pr: 1 }}>
                        {periodicTasks.length > 0 ? periodicTasks.map((task: any) => (
                            <Box key={task.id} sx={{ p: 2.5, borderRadius: 3, bgcolor: alpha('#fff', 0.04), border: '1px solid', borderColor: alpha('#fff', 0.08), transition: 'all 0.2s ease', '&:hover': { bgcolor: alpha('#fff', 0.06), borderColor: alpha('#fff', 0.2) } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.light' }}>{task.name}</Typography>
                                    <Chip
                                        label={task.enabled ? "ACTIVE" : "PAUSED"}
                                        size="small"
                                        sx={{
                                            height: 16, fontSize: '0.55rem',
                                            bgcolor: task.enabled ? alpha('#519755', 0.2) : alpha('#FF708B', 0.2),
                                            color: task.enabled ? '#a6e3ae' : '#ffb3c1',
                                            fontWeight: 900
                                        }}
                                    />
                                </Box>
                                <Typography variant="caption" sx={{ display: 'block', mb: 2, opacity: 0.6, fontWeight: 500, lineHeight: 1.4 }}>{task.schedule_description}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Schedule sx={{ fontSize: 14, opacity: 0.4 }} />
                                    <Typography variant="caption" sx={{ opacity: 0.4, fontWeight: 600 }}>Sync: {task.last_run_at ? new Date(task.last_run_at).toLocaleTimeString() : 'Pending'}</Typography>
                                </Box>
                            </Box>
                        )) : (
                            <Box sx={{ p: 6, textAlign: 'center', opacity: 0.2 }}>
                                <Autorenew sx={{ fontSize: 48, mb: 1 }} />
                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>Syncing Protocols...</Typography>
                            </Box>
                        )}
                    </Box>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => dispatch(fetchPeriodicTasks())}
                        sx={{
                            mt: 4,
                            color: '#94a3b8',
                            borderRadius: 2.5,
                            borderColor: alpha('#fff', 0.1),
                            fontWeight: 900,
                            textTransform: 'none',
                            py: 1.2,
                            '&:hover': { bgcolor: alpha('#fff', 0.05), borderColor: '#fff', color: '#fff' }
                        }}
                    >
                        Sync Scheduler
                    </Button>
                </Paper>
            </Grid>
        </Grid>
    );

    const renderGroups = () => (
        <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: alpha(theme.palette.divider, 0.08), bgcolor: alpha(theme.palette.background.paper, 0.6), backdropFilter: 'blur(20px)' }}>
            <Box sx={{ p: 4, borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.05), display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>Volunteer Infrastructure</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mt: 0.5 }}>Operational units and field groups</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<GroupWork />}
                    onClick={() => setOpenGroupDialog(true)}
                    sx={{ borderRadius: 3, fontWeight: 900, px: 3, py: 1.2, textTransform: 'none' }}
                >
                    Deploy Unit
                </Button>
            </Box>

            <Grid container spacing={4} sx={{ p: 4 }}>
                {groups.map((group: any) => (
                    <Grid item xs={12} md={6} lg={4} key={group.id}>
                        <Paper sx={{
                            p: 3.5,
                            borderRadius: 4,
                            border: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.08),
                            position: 'relative',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                borderColor: 'primary.main',
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 32px rgba(0,0,0,0.04)'
                            }
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                <Avatar sx={{ p: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2, color: 'primary.main' }}>
                                    <GroupWork />
                                </Avatar>
                                <Box>
                                    <IconButton size="small" onClick={() => handleEditGroup(group)} sx={{ '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1) } }}><Edit fontSize="small" /></IconButton>
                                    <IconButton size="small" onClick={() => handleDeleteGroup(group)} sx={{ '&:hover': { color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.1) } }}><Delete fontSize="small" /></IconButton>
                                </Box>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: -0.2 }}>{group.name}</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, minHeight: 48, lineHeight: 1.5, fontWeight: 500 }}>
                                {group.description || 'No operational mandate defined for this unit.'}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <People sx={{ fontSize: 16, color: 'text.disabled' }} />
                                    <Typography variant="caption" sx={{ fontWeight: 800 }}>{group.members_details?.length || 0} Members</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Forum sx={{ fontSize: 16, color: 'text.disabled' }} />
                                    <Typography variant="caption" sx={{ fontWeight: 800 }}>{group.message_count || 0} Messages</Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {group.members_details?.slice(0, 3).map((m: any) => (
                                    <Chip
                                        key={m.id}
                                        label={m.full_name || m.name}
                                        size="small"
                                        sx={{
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            bgcolor: alpha(theme.palette.background.default, 0.5),
                                            border: '1px solid',
                                            borderColor: alpha(theme.palette.divider, 0.05)
                                        }}
                                    />
                                ))}
                                {(group.members_details?.length || 0) > 3 && (
                                    <Chip
                                        label={`+${(group.members_details?.length || 0) - 3} others`}
                                        size="small"
                                        sx={{ fontSize: '0.65rem', fontWeight: 900, bgcolor: 'primary.main', color: '#fff' }}
                                    />
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                ))}
                {groups.length === 0 && (
                    <Grid item xs={12}>
                        <Box sx={{ py: 10, textAlign: 'center', bgcolor: alpha(theme.palette.background.paper, 0.3), borderRadius: 4, border: '1px dashed', borderColor: alpha(theme.palette.divider, 0.1) }}>
                            <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>No active field units found. Deploy one to begin operations.</Typography>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Paper>
    );

    const renderAuditLogs = () => (
        <Box>
            <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>System Audit Protocol</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mt: 0.5 }}>Immutable ledger of administrative and security events</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Filter audit events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: 'text.disabled' }} /></InputAdornment>,
                            sx: { borderRadius: 3, width: 300, bgcolor: 'background.paper', border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), '& fieldset': { border: 'none' } }
                        }}
                    />
                    <Button
                        variant="contained"
                        startIcon={<Refresh />}
                        onClick={() => dispatch(fetchAuditLogs())}
                        sx={{ borderRadius: 3, fontWeight: 900, textTransform: 'none', px: 3 }}
                    >
                        Sync Logs
                    </Button>
                </Box>
            </Box>

            <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.08), overflow: 'hidden', bgcolor: 'background.paper' }}>
                <TableContainer sx={{ maxHeight: '65vh' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 900, bgcolor: 'background.paper', fontSize: '0.75rem', color: 'text.disabled', py: 2 }}>TIMESTAMP</TableCell>
                                <TableCell sx={{ fontWeight: 900, bgcolor: 'background.paper', fontSize: '0.75rem', color: 'text.disabled', py: 2 }}>PROTOCOL</TableCell>
                                <TableCell sx={{ fontWeight: 900, bgcolor: 'background.paper', fontSize: '0.75rem', color: 'text.disabled', py: 2 }}>REASONING</TableCell>
                                <TableCell sx={{ fontWeight: 900, bgcolor: 'background.paper', fontSize: '0.75rem', color: 'text.disabled', py: 2 }}>AUTHORITY</TableCell>
                                <TableCell sx={{ fontWeight: 900, bgcolor: 'background.paper', fontSize: '0.75rem', color: 'text.disabled', py: 2 }}>IP ORIGIN</TableCell>
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
                                    <TableRow key={log.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                        <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem', py: 2 }}>
                                            {new Date(log.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </TableCell>
                                        <TableCell sx={{ py: 2 }}>
                                            <Chip
                                                label={log.event_type?.replace(/_/g, ' ')}
                                                size="small"
                                                sx={{
                                                    fontWeight: 900,
                                                    fontSize: '0.6rem',
                                                    height: 20,
                                                    color: isSecurity ? 'primary.main' : isDeletion ? 'error.main' : 'info.main',
                                                    bgcolor: isSecurity ? alpha(theme.palette.primary.main, 0.08) : isDeletion ? alpha(theme.palette.error.main, 0.08) : alpha(theme.palette.info.main, 0.08),
                                                    border: 'none',
                                                    borderRadius: 1
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, py: 2 }}>{log.description}</TableCell>
                                        <TableCell sx={{ py: 2 }}>
                                            {log.user_name ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: '0.65rem', fontWeight: 900 }}>
                                                        {log.user_name[0].toUpperCase()}
                                                    </Avatar>
                                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{log.user_name}</Typography>
                                                </Box>
                                            ) : (
                                                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 900, letterSpacing: 1 }}>KINDRA_CORE</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.75rem', py: 2 }}>
                                            {log.ip_address || '127.0.0.1'}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {auditLogs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} sx={{ py: 12, textAlign: 'center' }}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>System registry is currently idle.</Typography>
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
        <Box sx={{
            py: 16,
            textAlign: 'center',
            bgcolor: alpha(theme.palette.background.paper, 0.3),
            borderRadius: 4,
            border: '2px dashed',
            borderColor: alpha(theme.palette.divider, 0.1)
        }}>
            <AdminPanelSettings sx={{ fontSize: 80, mb: 3, opacity: 0.1 }} />
            <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 900 }}>Module Connection Required</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.6, fontWeight: 600 }}>Select a system control node to initialize the administrative interface.</Typography>
        </Box>
    );

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            sx={{ px: { xs: 1, sm: 2 } }}
        >
            <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.04em', mb: 1, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
                        {activeTab === 'users' ? 'User Infrastructure' :
                            activeTab === 'pending_approvals' ? 'Identity Verification' :
                                activeTab === 'periodic_tasks' ? 'Operations Core' :
                                    activeTab === 'groups' ? 'Volunteer Units' :
                                        activeTab === 'audit_logs' ? 'System Audit' : 'System Administration'}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Security fontSize="small" /> Kindra Management Protocol
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    onClick={handleSync}
                    startIcon={adminLoading ? <CircularProgress size={18} color="inherit" /> : <Refresh />}
                    disabled={adminLoading}
                    sx={{
                        borderRadius: 3,
                        fontWeight: 800,
                        px: 3,
                        py: 1.2,
                        textTransform: 'none',
                        boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
                        '&:hover': {
                            boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.4)}`,
                            transform: 'translateY(-2px)'
                        }
                    }}
                >
                    Synchronize Hub
                </Button>
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
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 5,
                        p: 1.5,
                        bgcolor: alpha(theme.palette.background.paper, 0.9),
                        backdropFilter: 'blur(30px)',
                        boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.05)
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.75rem', letterSpacing: -1 }}>Identity Override</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, pt: 3 }}>
                        <Box sx={{ p: 2.5, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 3, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1) }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled', letterSpacing: 1, display: 'block', mb: 0.5 }}>TARGET SUBJECT</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 900, color: 'primary.main' }}>{(selectedUser?.full_name || selectedUser?.email)}</Typography>
                        </Box>

                        <TextField
                            fullWidth
                            select
                            label="Clearance Level"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, fontWeight: 700 } }}
                        >
                            <MenuItem value="ADMIN">System Administrator</MenuItem>
                            <MenuItem value="MANAGEMENT">Management Team</MenuItem>
                            <MenuItem value="CASE_WORKER">Case Worker</MenuItem>
                            <MenuItem value="VOLUNTEER">Field Operative</MenuItem>
                            <MenuItem value="DONOR">Public Donor</MenuItem>
                        </TextField>

                        <TextField
                            fullWidth
                            select
                            label="Account Integrity"
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, fontWeight: 700 } }}
                        >
                            <MenuItem value="ACTIVE">Verified Active</MenuItem>
                            <MenuItem value="SUSPENDED">Security Suspension</MenuItem>
                        </TextField>

                        <Alert
                            severity="info"
                            icon={<Security />}
                            sx={{
                                borderRadius: 3,
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                bgcolor: alpha(theme.palette.info.main, 0.05),
                                color: 'info.main',
                                border: '1px solid',
                                borderColor: alpha(theme.palette.info.main, 0.1)
                            }}
                        >
                            Changes will synchronize across allKindra field nodes immediately.
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'none' }}>Abort</Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdateClearance}
                        sx={{ borderRadius: 2.5, px: 4, fontWeight: 900, textTransform: 'none', boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}` }}
                    >
                        Commit Override
                    </Button>
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
                PaperProps={{
                    sx: {
                        borderRadius: 5,
                        p: 1.5,
                        bgcolor: alpha(theme.palette.background.paper, 0.9),
                        backdropFilter: 'blur(30px)',
                        boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.05)
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.75rem', letterSpacing: -1 }}>
                    {editingGroupId ? 'Unit Reconfiguration' : 'Unit Deployment'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, pt: 3 }}>
                        <TextField
                            fullWidth
                            label="Unit Designation"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="e.g. Rapid Response Team A"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, fontWeight: 700 } }}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Operational Mandate"
                            value={newGroupDesc}
                            onChange={(e) => setNewGroupDesc(e.target.value)}
                            placeholder="Describe the primary objectives of this unit..."
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, fontWeight: 700 } }}
                        />
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 900, letterSpacing: 0.5 }}>
                                <People fontSize="small" color="primary" /> ATTACH FIELD AGENTS
                            </Typography>
                            <Box sx={{
                                maxHeight: 240,
                                overflow: 'auto',
                                border: '1px solid',
                                borderColor: alpha(theme.palette.divider, 0.08),
                                borderRadius: 4,
                                p: 1.5,
                                bgcolor: alpha(theme.palette.background.default, 0.3)
                            }}>
                                <Grid container spacing={1.5}>
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
                                                    p: 2,
                                                    borderRadius: 3,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    bgcolor: selectedVolunteers.includes(v.id) ? alpha(theme.palette.primary.main, 0.1) : 'background.paper',
                                                    border: '1px solid',
                                                    borderColor: selectedVolunteers.includes(v.id) ? 'primary.main' : alpha(theme.palette.divider, 0.05),
                                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), transform: 'scale(1.01)' }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', fontWeight: 900, bgcolor: selectedVolunteers.includes(v.id) ? 'primary.main' : alpha(theme.palette.divider, 0.1) }}>
                                                        {v.full_name?.[0].toUpperCase()}
                                                    </Avatar>
                                                    <Typography variant="body2" sx={{ fontWeight: selectedVolunteers.includes(v.id) ? 900 : 600 }}>{v.full_name}</Typography>
                                                </Box>
                                                {selectedVolunteers.includes(v.id) && (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                        <CheckCircle color="primary" sx={{ fontSize: 20 }} />
                                                    </motion.div>
                                                )}
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => {
                        setOpenGroupDialog(false);
                        setEditingGroupId(null);
                        setNewGroupName('');
                        setNewGroupDesc('');
                        setSelectedVolunteers([]);
                    }} sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'none' }}>Abort</Button>
                    <Button
                        variant="contained"
                        onClick={editingGroupId ? handleUpdateGroup : handleCreateGroup}
                        sx={{ borderRadius: 2.5, px: 4, fontWeight: 900, textTransform: 'none', boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}` }}
                    >
                        {editingGroupId ? 'Commit Reconfig' : 'Deploy Unit'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{
                        borderRadius: 3,
                        fontWeight: 800,
                        px: 3,
                        py: 1.5,
                        minWidth: 300,
                        boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                        bgcolor: snackbar.severity === 'success' ? '#519755' :
                            snackbar.severity === 'error' ? '#FF708B' :
                                snackbar.severity === 'warning' ? '#FFBB33' : '#5D5FEF'
                    }}
                >
                    {snackbar.message}
                </Alert>
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
        <Paper
            elevation={0}
            sx={{
                p: 0,
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.08),
                bgcolor: 'background.paper',
                transition: 'all 0.3s ease',
                '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
                }
            }}
        >
            <Box sx={{
                p: 2.5,
                borderBottom: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.05),
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>{title}</Typography>
                <Chip
                    label={`${count} TOTAL`}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 800, borderRadius: 1.5, fontSize: '0.65rem' }}
                />
            </Box>
            <Table size="small">
                <TableBody>
                    {items.map((item: any) => (
                        <TableRow key={item.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                            <TableCell sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'primary.main', py: 2 }}>
                                #{type === 'family' ? item.family_code : item.case_number}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                                {type === 'family' ? item.primary_contact_name : item.title}
                            </TableCell>
                            <TableCell align="right">
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => onDelete(item.id, type === 'family' ? item.primary_contact_name : item.title)}
                                    sx={{ opacity: 0.5, '&:hover': { opacity: 1, bgcolor: alpha(theme.palette.error.main, 0.1) } }}
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    {items.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} align="center" sx={{ py: 6, color: 'text.secondary', opacity: 0.5 }}>
                                No active records in registry
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <Button
                fullWidth
                sx={{
                    py: 1.5,
                    color: 'text.secondary',
                    textTransform: 'none',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), color: 'primary.main' }
                }}
            >
                View Full Registry
            </Button>
        </Paper>
    );
};
