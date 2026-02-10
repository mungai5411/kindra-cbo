import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import apiClient, { endpoints } from '../../api/client';
import {
    Box,
    Typography,
    Paper,
    Card,
    CardContent,
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    type SelectChangeEvent,
    Alert,
    Snackbar,
    Avatar,
    Tooltip,
    useTheme,
    alpha
} from '@mui/material';
import {
    Home,
    People,
    Assessment,
    Add,
    Business,
    Inventory,
    Edit,
    SwapHoriz,
    SupervisorAccount,
    Event as EventIcon,
    LocationOn,
    Schedule,
    AssignmentInd,
    PersonAdd,
    NoAccounts,
    VerifiedUser,
    Delete,
    ReportProblem,
    LocalShipping,
    Security,
    Update
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import {
    fetchShelters,
    fetchPlacements,
    fetchResources,
    fetchStaff,
    assignStaff,
    transferStaff,
    terminateDuty,
    createShelter,
    fetchPendingShelters,
    approveShelter,
    rejectShelter,
    requestShelterInfo,
    addPlacement,
    fetchStaffCredentials,
    createStaffCredential,
    verifyStaffCredential,
    deleteStaffCredential,
    updateShelter,
    fetchIncidents,
    createIncident,
    fetchResourceRequests,
    createResourceRequest
} from '../../features/shelters/shelterSlice';
import { fetchChildren } from '../../features/caseManagement/caseManagementSlice';
import { fetchEvents } from '../../features/volunteers/volunteersSlice';
import { SubTabView } from './SubTabView';
import { ConfirmationDialog } from './ConfirmationDialog';
import { motion } from 'framer-motion';
import { StatsCard } from './StatCards';
import { getRandomMessage } from '../../utils/heartwarmingMessages';
import { ShelterRegistrationDialog } from './ShelterRegistrationDialog';
import { ShelterReviewDialog } from './ShelterReviewDialog';

// Local StatusChip for consistency
// StatusChip component
const StatusChip = ({ status }: { status: string }) => {
    const theme = useTheme();

    let bgcolor = alpha(theme.palette.grey[500], 0.1);
    let textColor = theme.palette.grey[700];

    const lowerStatus = status.toLowerCase();

    if (lowerStatus === 'compliant' || lowerStatus === 'synced') {
        bgcolor = alpha(theme.palette.success.main, 0.1);
        textColor = theme.palette.success.dark;
    } else if (lowerStatus === 'warning' || lowerStatus === 'non-compliant' || lowerStatus === 'review') {
        bgcolor = alpha(theme.palette.warning.main, 0.1);
        textColor = theme.palette.warning.main;
    } else if (lowerStatus === 'critical') {
        bgcolor = alpha(theme.palette.error.main, 0.1);
        textColor = theme.palette.error.main;
    }

    return (
        <Chip
            label={status}
            size="small"
            sx={{
                bgcolor: bgcolor,
                color: textColor,
                fontWeight: 700,
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha(textColor, 0.2),
                '& .MuiChip-label': { px: 1.5 }
            }}
        />
    );
};

export function ShelterView({ activeTab }: { activeTab?: string }) {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { shelters, pendingShelters, resources, staff, placements, staffCredentials, incidents, resourceRequests } = useSelector((state: RootState) => state.shelters);
    const { children } = useSelector((state: RootState) => state.caseManagement);
    const { volunteers, events: volunteerEvents } = useSelector((state: RootState) => state.volunteers);
    const { user } = useSelector((state: RootState) => state.auth);
    const isAdmin = user?.is_superuser || user?.role === 'ADMIN' || user?.role === 'MANAGEMENT';
    const isPartner = user?.role === 'SHELTER_PARTNER';
    const canManageStaff = isAdmin || isPartner;

    // UI States
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState<'SHELTER' | 'PLACEMENT' | 'RESOURCE' | 'ASSIGN' | 'INCIDENT' | 'REQUEST'>('SHELTER');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });

    // New shelter management states
    const [showRegisterDialog, setShowRegisterDialog] = useState(false);
    const [showReviewDialog, setShowReviewDialog] = useState(false);
    const [selectedShelter, setSelectedShelter] = useState<any>(null);

    // Assignment Form State
    const [assignmentForm, setAssignmentForm] = useState({
        volunteer_id: '',
        shelter_id: '',
        role: 'COORDINATOR'
    });
    const [placementForm, setPlacementForm] = useState({
        child: '',
        shelter_home: '',
        placement_date: new Date().toISOString().split('T')[0],
        placement_reason: '',
        status: 'PENDING'
    });
    const [credentialForm, setCredentialForm] = useState({
        shelter_home: '',
        staff_name: '',
        position: '',
        id_number: '',
        phone_number: '',
        certificate_of_good_conduct: false,
    });

    const [incidentForm, setIncidentForm] = useState({
        shelter_home: '',
        title: '',
        description: '',
        severity: 'MEDIUM'
    });

    const [requestForm, setRequestForm] = useState({
        shelter_home: '',
        item_category: 'FOOD',
        items_description: '',
        priority: 'MEDIUM'
    });

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

    useEffect(() => {
        dispatch(fetchShelters());
        dispatch(fetchPlacements());
        dispatch(fetchResources());
        dispatch(fetchStaff());
        dispatch(fetchChildren());
        dispatch(fetchIncidents());
        dispatch(fetchResourceRequests());
        if (isAdmin) {
            dispatch(fetchPendingShelters());
            dispatch(fetchStaffCredentials());
        }
        dispatch(fetchEvents());
    }, [dispatch, isAdmin]);

    const handleOpenDialog = (type: 'SHELTER' | 'PLACEMENT' | 'RESOURCE' | 'ASSIGN') => {
        setDialogType(type);
        setOpenDialog(true);
    };

    const handleAction = async (type: string, id: string, data?: any) => {
        try {
            if (type === 'TERMINATE') {
                await dispatch(terminateDuty(id)).unwrap();
                setSnackbar({ open: true, message: 'Duty terminated successfully', severity: 'success' });
            } else if (type === 'TRANSFER') {
                await dispatch(transferStaff({ id, data })).unwrap();
                setSnackbar({ open: true, message: 'Personnel transferred successfully', severity: 'success' });
            }
            dispatch(fetchStaff());
        } catch (err: any) {
            setSnackbar({ open: true, message: err || 'Operation failed', severity: 'error' });
        }
    };

    const handleStaffAssignment = async () => {
        try {
            await dispatch(assignStaff(assignmentForm)).unwrap();
            setOpenDialog(false);
            setSnackbar({ open: true, message: 'Staff assigned successfully', severity: 'success' });

            // Generate heartwarming notification
            const message = getRandomMessage('VERIFICATION');
            const newNotification = {
                id: Date.now().toString(),
                type: 'success',
                title: 'Staff Assignment Confirmed',
                message: message,
                time: 'Just now',
                read: false,
                category: 'SHELTER',
                targetRoles: ['ADMIN', 'MANAGEMENT', 'SHELTER_PARTNER', 'CASE_WORKER'] // Shelter-related roles
            };
            const existing = JSON.parse(sessionStorage.getItem('notifications') || '[]');
            sessionStorage.setItem('notifications', JSON.stringify([newNotification, ...existing]));
            window.dispatchEvent(new CustomEvent('storage'));

            dispatch(fetchStaff());
        } catch (err: any) {
            setSnackbar({ open: true, message: err || 'Assignment failed', severity: 'error' });
        }
    };

    const handleRegisterPlacement = async () => {
        if (!placementForm.child || !placementForm.shelter_home) {
            setSnackbar({ open: true, message: 'Child and Shelter are required', severity: 'error' });
            return;
        }
        try {
            await dispatch(addPlacement(placementForm)).unwrap();
            setOpenDialog(false);
            setPlacementForm({
                child: '',
                shelter_home: '',
                placement_date: new Date().toISOString().split('T')[0],
                placement_reason: '',
                status: 'PENDING'
            });
            setSnackbar({ open: true, message: 'Placement registered successfully', severity: 'success' });
        } catch (error: any) {
            setSnackbar({ open: true, message: typeof error === 'string' ? error : 'Failed to register placement', severity: 'error' });
        }
    };

    const handleStaffCredentialSubmit = async () => {
        if (!credentialForm.staff_name || !credentialForm.position || !credentialForm.shelter_home) {
            setSnackbar({ open: true, message: 'Name, Position and Shelter are required', severity: 'error' });
            return;
        }
        try {
            await dispatch(createStaffCredential(credentialForm)).unwrap();
            setOpenDialog(false);
            setCredentialForm({
                shelter_home: '',
                staff_name: '',
                position: '',
                id_number: '',
                phone_number: '',
                certificate_of_good_conduct: false,
            });
            setSnackbar({ open: true, message: 'Staff credential registered successfully', severity: 'success' });
        } catch (error: any) {
            setSnackbar({ open: true, message: typeof error === 'string' ? error : 'Failed to register credential', severity: 'error' });
        }
    };

    const handleIncidentSubmit = async () => {
        if (!incidentForm.shelter_home || !incidentForm.title || !incidentForm.description) {
            setSnackbar({ open: true, message: 'Shelter, Title and Description are required', severity: 'error' });
            return;
        }
        try {
            await dispatch(createIncident(incidentForm)).unwrap();
            setOpenDialog(false);
            setIncidentForm({ shelter_home: '', title: '', description: '', severity: 'MEDIUM' });
            setSnackbar({ open: true, message: 'Incident reported successfully', severity: 'warning' });
        } catch (error: any) {
            setSnackbar({ open: true, message: typeof error === 'string' ? error : 'Failed to report incident', severity: 'error' });
        }
    };

    const handleRequestSubmit = async () => {
        if (!requestForm.shelter_home || !requestForm.items_description) {
            setSnackbar({ open: true, message: 'Shelter and Description are required', severity: 'error' });
            return;
        }
        try {
            await dispatch(createResourceRequest(requestForm)).unwrap();
            setOpenDialog(false);
            setRequestForm({ shelter_home: '', item_category: 'FOOD', items_description: '', priority: 'MEDIUM' });
            setSnackbar({ open: true, message: 'Resource request submitted', severity: 'success' });
        } catch (error: any) {
            setSnackbar({ open: true, message: typeof error === 'string' ? error : 'Failed to submit request', severity: 'error' });
        }
    };

    // Shelter CRUD Handlers
    const handleShelterSubmit = async (data: any) => {
        try {
            if (data.id) {
                // Update
                await dispatch(updateShelter({ id: data.id, data })).unwrap();
                setSnackbar({ open: true, message: 'Shelter updated successfully!', severity: 'success' });
            } else {
                // Create
                await dispatch(createShelter(data)).unwrap();
                setSnackbar({ open: true, message: 'Shelter registered successfully!', severity: 'success' });
            }
            setShowRegisterDialog(false);
            setSelectedShelter(null);
            dispatch(fetchShelters());
            if (isAdmin) {
                dispatch(fetchPendingShelters());
            }
        } catch (err: any) {
            setSnackbar({ open: true, message: err?.message || 'Failed to save shelter', severity: 'error' });
        }
    };

    const handleEditShelter = (shelter: any) => {
        setSelectedShelter(shelter);
        setShowRegisterDialog(true);
    };

    const handleDeleteShelter = (shelterId: string) => {
        setConfirmDialog({
            open: true,
            title: 'Delete Shelter Home?',
            message: 'This action cannot be undone.',
            severity: 'warning',
            onConfirm: async () => {
                try {
                    await apiClient.delete(`${endpoints.shelters.shelters}${shelterId}/`);
                    setSnackbar({ open: true, message: 'Shelter deleted successfully', severity: 'success' });
                    dispatch(fetchShelters());
                } catch (err: any) {
                    setSnackbar({ open: true, message: err?.message || 'Failed to delete shelter', severity: 'error' });
                } finally {
                    setConfirmDialog(prev => ({ ...prev, open: false }));
                }
            }
        });
    };

    const handleReviewShelter = (shelter: any) => {
        setSelectedShelter(shelter);
        setShowReviewDialog(true);
    };

    const handleApproveShelter = async (shelterId: string) => {
        try {
            await dispatch(approveShelter(shelterId)).unwrap();
            setSnackbar({ open: true, message: 'Shelter approved successfully', severity: 'success' });
        } catch (err: any) {
            setSnackbar({ open: true, message: err?.message || 'Failed to approve shelter', severity: 'error' });
        }
    };

    const handleRejectShelter = async (shelterId: string, reason: string) => {
        try {
            await dispatch(rejectShelter({ shelterId, reason })).unwrap();
            setSnackbar({ open: true, message: 'Shelter rejected', severity: 'success' });
        } catch (err: any) {
            setSnackbar({ open: true, message: err?.message || 'Failed to reject shelter', severity: 'error' });
        }
    };

    const handleRequestInfo = async (shelterId: string, reason: string) => {
        try {
            await dispatch(requestShelterInfo({ shelterId, reason })).unwrap();
            setSnackbar({ open: true, message: 'Info request sent', severity: 'success' });
        } catch (err: any) {
            setSnackbar({ open: true, message: err?.message || 'Failed to request info', severity: 'error' });
        }
    };

    const renderShelters = () => (
        <Paper sx={{ p: 0, borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold">Partner Homes</Typography>
                    <Typography variant="caption" color="text.secondary">Registered shelter homes and occupancy</Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={() => {
                        setSelectedShelter(null);
                        setShowRegisterDialog(true);
                    }}
                    sx={{ borderRadius: 3, boxShadow: theme.shadows[2], textTransform: 'none', fontWeight: 600 }}
                >
                    Register Shelter
                </Button>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Home Name</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Location</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Contact</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Occupancy</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {shelters.map((s: any) => (
                            <TableRow key={s.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{s.name}</TableCell>
                                <TableCell sx={{ color: 'text.secondary' }}>{s.county}, {s.sub_county}</TableCell>
                                <TableCell>{s.contact_person}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Typography variant="body2" fontWeight="bold">{s.current_occupancy} / {s.total_capacity}</Typography>
                                        <Box sx={{ flex: 1, minWidth: 60, height: 6, bgcolor: 'divider', borderRadius: 4 }}>
                                            <Box sx={{
                                                width: `${Math.min((s.current_occupancy / s.total_capacity) * 100, 100)}%`,
                                                height: '100%',
                                                bgcolor: (s.current_occupancy / s.total_capacity) > 0.9 ? 'error.main' : 'primary.main',
                                                borderRadius: 4
                                            }} />
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <StatusChip status={s.compliance_status} />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Edit Home"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => handleEditShelter(s)}><Edit fontSize="small" /></IconButton></Tooltip>
                                    <Tooltip title="Delete Home"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => handleDeleteShelter(s.id)}><NoAccounts fontSize="small" /></IconButton></Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {shelters.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                    No shelters registered yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    const renderStaffing = () => (
        <Paper sx={{
            p: 0,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
        }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold">Staffing & Operations</Typography>
                    <Typography variant="caption" color="text.secondary">Personnel and volunteers assigned to shelter management</Typography>
                </Box>
                {isAdmin && (
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<SupervisorAccount />}
                        onClick={() => handleOpenDialog('ASSIGN')}
                        sx={{ borderRadius: 3, boxShadow: theme.shadows[2], textTransform: 'none', fontWeight: 600 }}
                    >
                        Assign Personnel
                    </Button>
                )}
            </Box>
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.04) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Personnel</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Role</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Assigned Home</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Operational Controls</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {staff.map((p: any) => (
                            <TableRow key={p.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main', fontSize: '0.8rem', fontWeight: 'bold' }}>{p.full_name?.[0]}</Avatar>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">{p.full_name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{p.email}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip label={p.role || 'COORDINATOR'} size="small" sx={{ borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', fontWeight: 600 }} />
                                </TableCell>
                                <TableCell>{p.shelter_name || 'Central Support'}</TableCell>
                                <TableCell align="right">
                                    {isAdmin ? (
                                        <>
                                            <Tooltip title="Transfer System"><IconButton onClick={() => handleAction('TRANSFER', p.id)} size="small" color="primary"><SwapHoriz /></IconButton></Tooltip>
                                            <Tooltip title="Terminate Duty"><IconButton onClick={() => handleAction('TERMINATE', p.id)} size="small" color="error"><NoAccounts /></IconButton></Tooltip>
                                        </>
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">Contact Admin for transfers</Typography>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {staff.length === 0 && (
                            <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>No personnel assigned to specific homes yet.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    const renderResources = () => (
        <Paper sx={{
            p: 0,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
        }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">Critical Equipment & Resources</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Inventory />}
                    onClick={() => handleOpenDialog('RESOURCE')}
                    sx={{ borderRadius: 3, boxShadow: theme.shadows[2], textTransform: 'none', fontWeight: 600 }}
                >
                    Add Resource
                </Button>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.warning.main, 0.04) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Resource Item</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Available Quality</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Condition</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Sync Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {resources.map((r: any) => (
                            <TableRow key={r.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell sx={{ fontWeight: 600 }}>{r.name}</TableCell>
                                <TableCell sx={{ color: 'text.secondary' }}>{r.quantity} {r.unit}</TableCell>
                                <TableCell>{r.condition}</TableCell>
                                <TableCell align="right"><StatusChip status="Synced" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    const renderStaffCredentials = () => (
        <Paper sx={{ p: 0, borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold">Staff Credentials & Verification</Typography>
                    <Typography variant="caption" color="text.secondary">Manage background checks and identity verification for shelter staff</Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<VerifiedUser />}
                    onClick={() => handleOpenDialog('CREDENTIAL' as any)}
                    sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
                >
                    Register Credential
                </Button>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Staff Name</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Position</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>ID / Passport</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Good Conduct</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Verification</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {staffCredentials.map((cred: any) => (
                            <TableRow key={cred.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 'bold', fontSize: '0.8rem' }}>{cred.staff_name?.[0]}</Avatar>
                                        <Typography variant="body2" fontWeight="600">{cred.staff_name}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{cred.position}</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                                    {isAdmin ? cred.id_number : `****${cred.id_number?.slice(-4) || '****'}`}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={cred.certificate_of_good_conduct ? "Present" : "Missing"}
                                        size="small"
                                        color={cred.certificate_of_good_conduct ? "success" : "error"}
                                        variant="outlined"
                                        sx={{ borderRadius: 1.5, height: 24 }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <StatusChip status={cred.is_verified ? "Verified" : "Pending"} />
                                        {(!cred.is_verified && isAdmin) && (
                                            <Button
                                                size="small"
                                                onClick={() => dispatch(verifyStaffCredential({ id: cred.id, is_verified: true }))}
                                                sx={{ textTransform: 'none', py: 0 }}
                                            >
                                                Verify Now
                                            </Button>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" color="error" onClick={() => {
                                        setConfirmDialog({
                                            open: true,
                                            title: 'Remove Credential?',
                                            message: `Are you sure you want to remove the credential entry for ${cred.staff_name}?`,
                                            severity: 'error',
                                            onConfirm: async () => {
                                                await dispatch(deleteStaffCredential(cred.id));
                                                setConfirmDialog(prev => ({ ...prev, open: false }));
                                            }
                                        });
                                    }}>
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {staffCredentials.length === 0 && (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>No staff credentials registered.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    const renderPlacements = () => (
        <Paper sx={{
            p: 0,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
        }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold">Active Child Placements</Typography>
                    <Typography variant="caption" color="text.secondary">Current children residing in partner shelter homes</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    sx={{ borderRadius: 3, textTransform: 'none' }}
                    onClick={() => handleOpenDialog('PLACEMENT')}
                >
                    Register Placement
                </Button>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.success.main, 0.04) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Child Name</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Shelter Home</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Placement Date</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {placements && placements.length > 0 ? placements.map((p: any) => (
                            <TableRow key={p.id} hover>
                                <TableCell sx={{ fontWeight: 600 }}>{p.child_name || p.child?.full_name || 'N/A'}</TableCell>
                                <TableCell>{p.shelter_name || p.shelter_home?.name || 'N/A'}</TableCell>
                                <TableCell>{new Date(p.placement_date).toLocaleDateString()}</TableCell>
                                <TableCell><StatusChip status={p.status} /></TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">No active placements found</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    // Admin-only: Render pending shelters for review
    const renderPendingReview = () => (
        <Paper sx={{
            p: 0,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
        }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">Shelters Awaiting Approval</Typography>
                <Typography variant="caption" color="text.secondary">Review and approve shelter registrations</Typography>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.warning.main, 0.04) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Home Name</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Location</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Contact</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Capacity</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Photos</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pendingShelters && pendingShelters.length > 0 ? pendingShelters.map((shelter: any) => (
                            <TableRow key={shelter.id} hover>
                                <TableCell sx={{ fontWeight: 600 }}>{shelter.name}</TableCell>
                                <TableCell>{shelter.county}</TableCell>
                                <TableCell>{shelter.contact_person}</TableCell>
                                <TableCell>{shelter.total_capacity}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={`${shelter.photos?.length || 0} photos`}
                                        size="small"
                                        color={shelter.photos?.length >= 3 ? 'success' : 'error'}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => handleReviewShelter(shelter)}
                                        sx={{ mr: 1, textTransform: 'none' }}
                                    >
                                        Review
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">No pending applications</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    const renderIncidents = () => (
        <Paper sx={{ p: 0, borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold">Incident Command Center</Typography>
                    <Typography variant="caption" color="text.secondary">Real-time reporting and tracking of environmental and safety issues</Typography>
                </Box>
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<ReportProblem />}
                    onClick={() => handleOpenDialog('INCIDENT' as any)}
                    sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
                >
                    Report Incident
                </Button>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.error.main, 0.04) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Severity</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Shelter</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Reported At</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(incidents || []).map((incident: any) => (
                            <TableRow key={incident.id} hover>
                                <TableCell>
                                    <Chip
                                        label={incident.severity}
                                        size="small"
                                        color={incident.severity === 'CRITICAL' || incident.severity === 'HIGH' ? 'error' : 'warning'}
                                        sx={{ fontWeight: 800, borderRadius: 1.5 }}
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{incident.title}</TableCell>
                                <TableCell>{incident.shelter_name || 'Global'}</TableCell>
                                <TableCell><StatusChip status={incident.status} /></TableCell>
                                <TableCell color="text.secondary">{new Date(incident.created_at).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                        {(incidents || []).length === 0 && (
                            <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>No incidents reported.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    const renderResourceRequests = () => (
        <Paper sx={{ p: 0, borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold">Supply Logistics & Requests</Typography>
                    <Typography variant="caption" color="text.secondary">Request essential resources and track fulfillment status</Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<LocalShipping />}
                    onClick={() => handleOpenDialog('REQUEST' as any)}
                    sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
                >
                    New Supply Request
                </Button>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Requested On</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(resourceRequests || []).map((req: any) => (
                            <TableRow key={req.id} hover>
                                <TableCell sx={{ fontWeight: 600 }}>{req.item_category}</TableCell>
                                <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.items_description}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={req.priority}
                                        variant="outlined"
                                        size="small"
                                        color={req.priority === 'URGENT' || req.priority === 'HIGH' ? 'error' : 'info'}
                                    />
                                </TableCell>
                                <TableCell><StatusChip status={req.status} /></TableCell>
                                <TableCell color="text.secondary">{new Date(req.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                        {(resourceRequests || []).length === 0 && (
                            <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>No supply requests found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    const formatEventDateTime = (value: any) => {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return 'TBD';
        try {
            return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' } as any);
        } catch {
            return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
    };

    const renderPartnerEvents = () => {
        const shelterEvents = (volunteerEvents || []).filter((e: any) => e.post_to_shelters && (isAdmin || e.is_active));

        return (
            <Paper sx={{ p: 0, borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" fontWeight="bold">Partner Coordination Events</Typography>
                    <Typography variant="caption" color="text.secondary">Events and meetings for shelter partners</Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                        {shelterEvents.map((event: any) => (
                            <Grid item xs={12} key={event.id}>
                                <Card variant="outlined" sx={{ borderRadius: 3, borderStyle: 'dashed', bgcolor: alpha(theme.palette.info.main, 0.02) }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="bold" color="info.main">{event.title}</Typography>
                                            <Chip label={event.event_type} size="small" color="info" variant="outlined" />
                                        </Box>
                                        <Typography variant="body2" sx={{ mb: 2 }}>{event.description}</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                                <LocationOn fontSize="small" />
                                                <Typography variant="caption" fontWeight="bold">{event.location}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                                <Schedule fontSize="small" />
                                                <Typography variant="caption" fontWeight="bold">
                                                    {formatEventDateTime(event.start_datetime)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                        {shelterEvents.length === 0 && (
                            <Grid item xs={12}>
                                <Box sx={{ p: 6, textAlign: 'center' }}>
                                    <EventIcon sx={{ fontSize: 40, opacity: 0.2, mb: 1 }} />
                                    <Typography color="text.secondary">No partner events scheduled.</Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </Paper>
        );
    };

    const tabs = [
        { id: 'shelters', label: 'Partner Homes', icon: <Business />, component: renderShelters() },
        { id: 'placements', label: 'Placements', icon: <AssignmentInd />, component: renderPlacements() },
        {
            id: 'pending',
            label: 'Under Review',
            icon: <Assessment />,
            component: renderPendingReview(),
            hidden: !isAdmin,
            badge: pendingShelters?.length || 0
        },
        {
            id: 'staff',
            label: 'Staffing & Roles',
            icon: <SupervisorAccount />,
            component: renderStaffing(),
            hidden: !canManageStaff
        },
        {
            id: 'staff_creds',
            label: 'Credentials',
            icon: <VerifiedUser />,
            component: renderStaffCredentials(),
            hidden: !canManageStaff
        },
        { id: 'resources', label: 'Inventory', icon: <Inventory />, component: renderResources() },
        { id: 'incidents', label: 'Incident Command', icon: <ReportProblem />, component: renderIncidents() },
        { id: 'logistics', label: 'Supply Requests', icon: <LocalShipping />, component: renderResourceRequests() },
        { id: 'events', label: 'Partner Events', icon: <EventIcon />, component: renderPartnerEvents() },
    ].filter(t => !t.hidden);

    return (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="900" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {isPartner ? <Security sx={{ fontSize: 40, color: 'secondary.main' }} /> : <Home sx={{ fontSize: 40, color: 'primary.main' }} />}
                        {isPartner ? 'Partner Command Center' : 'Shelter Coordination Hub'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {isPartner ? 'Secured administration interface for facility management' : 'Unified interface for habitat management and personnel distribution'}
                    </Typography>
                </Box>
                {isPartner && (
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="subtitle2" fontWeight="bold">Sync Status</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
                            <Update fontSize="small" />
                            <Typography variant="caption" fontWeight="bold">LIVE SECURE CONNECTION</Typography>
                        </Box>
                    </Box>
                )}
            </Box>

            <Grid container spacing={{ xs: 1.5, sm: 3 }} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <StatsCard
                        title="Verified Homes"
                        value={String(shelters.length)}
                        icon={<Business />}
                        color={theme.palette.primary.main}
                        delay={0}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatsCard
                        title="Field Personnel"
                        value={String(staff.length)}
                        icon={<People />}
                        color={theme.palette.secondary.main}
                        delay={0.1}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatsCard
                        title="Operational Load"
                        value={`${Math.round((shelters.reduce((acc: number, curr: any) => acc + (curr.current_occupancy || 0), 0) /
                            (shelters.reduce((acc: number, curr: any) => acc + (curr.total_capacity || 1), 0) || 1)) * 100)}%`}
                        icon={<Assessment />}
                        color={theme.palette.success.main}
                        delay={0.2}
                    />
                </Grid>
            </Grid>

            <SubTabView title="Coordination Infrastructure" tabs={tabs} activeTab={activeTab} />

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    {dialogType === 'ASSIGN' ? 'Shelter Assignment' :
                        dialogType === 'INCIDENT' ? 'Report Operational Incident' :
                            dialogType === 'REQUEST' ? 'New Logistics Request' :
                                `Register New ${dialogType}`}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {dialogType === 'ASSIGN' && (
                            <>
                                <TextField
                                    fullWidth
                                    select
                                    label="Select Personnel"
                                    value={assignmentForm.volunteer_id}
                                    onChange={(e) => setAssignmentForm({ ...assignmentForm, volunteer_id: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                >
                                    {volunteers.map((v: any) => (
                                        <MenuItem key={v.id} value={v.id}>{v.full_name} ({v.email})</MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    fullWidth
                                    select
                                    label="Target Home"
                                    value={assignmentForm.shelter_id}
                                    onChange={(e) => setAssignmentForm({ ...assignmentForm, shelter_id: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                >
                                    {shelters.map((s: any) => (
                                        <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    fullWidth
                                    select
                                    label="Operational Role"
                                    value={assignmentForm.role}
                                    onChange={(e) => setAssignmentForm({ ...assignmentForm, role: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                >
                                    <MenuItem value="COORDINATOR">Care Coordinator</MenuItem>
                                    <MenuItem value="SUPERVISOR">Site Supervisor</MenuItem>
                                    <MenuItem value="LOGISTICS">Logistics Manager</MenuItem>
                                    <MenuItem value="SECURITY">Security Lead</MenuItem>
                                </TextField>
                                <Button variant="contained" onClick={handleStaffAssignment} sx={{ py: 1.5, borderRadius: 3 }}>Assign Now</Button>
                            </>
                        )}
                        {(dialogType as any) === 'CREDENTIAL' && (
                            <>
                                <TextField
                                    fullWidth
                                    select
                                    label="Assigned Home"
                                    value={credentialForm.shelter_home}
                                    onChange={(e) => setCredentialForm({ ...credentialForm, shelter_home: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                >
                                    {shelters.map((s: any) => (
                                        <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    fullWidth
                                    label="Staff Name"
                                    value={credentialForm.staff_name}
                                    onChange={(e) => setCredentialForm({ ...credentialForm, staff_name: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                                <TextField
                                    fullWidth
                                    label="Position"
                                    value={credentialForm.position}
                                    onChange={(e) => setCredentialForm({ ...credentialForm, position: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                                <TextField
                                    fullWidth
                                    label="ID / Passport Number"
                                    value={credentialForm.id_number}
                                    onChange={(e) => setCredentialForm({ ...credentialForm, id_number: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    value={credentialForm.phone_number}
                                    onChange={(e) => setCredentialForm({ ...credentialForm, phone_number: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                                <FormControl fullWidth>
                                    <InputLabel>Certificate of Good Conduct</InputLabel>
                                    <Select
                                        label="Certificate of Good Conduct"
                                        value={credentialForm.certificate_of_good_conduct ? "yes" : "no"}
                                        onChange={(e) => setCredentialForm({ ...credentialForm, certificate_of_good_conduct: e.target.value === "yes" })}
                                        sx={{ borderRadius: 3 }}
                                    >
                                        <MenuItem value="yes">Yes, verified</MenuItem>
                                        <MenuItem value="no">No / Pending</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button variant="contained" onClick={handleStaffCredentialSubmit} sx={{ py: 1.5, borderRadius: 3 }}>Register Now</Button>
                            </>
                        )}
                        {dialogType === 'INCIDENT' && (
                            <>
                                <TextField
                                    fullWidth
                                    select
                                    label="Target Shelter"
                                    value={incidentForm.shelter_home}
                                    onChange={(e) => setIncidentForm({ ...incidentForm, shelter_home: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                >
                                    {shelters.map((s: any) => (
                                        <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    fullWidth
                                    label="Incident Title"
                                    value={incidentForm.title}
                                    onChange={(e) => setIncidentForm({ ...incidentForm, title: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Detailed Description"
                                    value={incidentForm.description}
                                    onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                                <TextField
                                    fullWidth
                                    select
                                    label="Severity Level"
                                    value={incidentForm.severity}
                                    onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                >
                                    <MenuItem value="LOW">Low - Operational Note</MenuItem>
                                    <MenuItem value="MEDIUM">Medium - Attention Required</MenuItem>
                                    <MenuItem value="HIGH">High - Significant Issue</MenuItem>
                                    <MenuItem value="CRITICAL">Critical - Immediate Emergency</MenuItem>
                                </TextField>
                                <Button variant="contained" color="error" onClick={handleIncidentSubmit} sx={{ py: 1.5, borderRadius: 3 }}>Submit Report</Button>
                            </>
                        )}
                        {dialogType === 'REQUEST' && (
                            <>
                                <TextField
                                    fullWidth
                                    select
                                    label="Requesting Shelter"
                                    value={requestForm.shelter_home}
                                    onChange={(e) => setRequestForm({ ...requestForm, shelter_home: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                >
                                    {shelters.map((s: any) => (
                                        <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    fullWidth
                                    select
                                    label="Resource Category"
                                    value={requestForm.item_category}
                                    onChange={(e) => setRequestForm({ ...requestForm, item_category: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                >
                                    <MenuItem value="FOOD">Food Supplies</MenuItem>
                                    <MenuItem value="CLOTHING">Clothing & Bedding</MenuItem>
                                    <MenuItem value="MEDICAL">Medical Supplies</MenuItem>
                                    <MenuItem value="EDUCATIONAL">Educational Materials</MenuItem>
                                    <MenuItem value="OTHER">Other / Miscellaneous</MenuItem>
                                </TextField>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Items & Quantity Description"
                                    value={requestForm.items_description}
                                    onChange={(e) => setRequestForm({ ...requestForm, items_description: e.target.value })}
                                    placeholder="e.g., 50kg Maize Flour, 2 boxes of Paracetamol..."
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                                <TextField
                                    fullWidth
                                    select
                                    label="Priority"
                                    value={requestForm.priority}
                                    onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                >
                                    <MenuItem value="LOW">Low</MenuItem>
                                    <MenuItem value="MEDIUM">Medium</MenuItem>
                                    <MenuItem value="HIGH">High</MenuItem>
                                    <MenuItem value="URGENT">Urgent (Restock ASAP)</MenuItem>
                                </TextField>
                                <Button variant="contained" onClick={handleRequestSubmit} sx={{ py: 1.5, borderRadius: 3 }}>Submit Request</Button>
                            </>
                        )}
                        {dialogType === 'SHELTER' && (
                            <>
                                <TextField fullWidth label="Shelter Name" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                                <Grid container spacing={2}>
                                    <Grid item xs={6}><TextField fullWidth label="County" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} /></Grid>
                                    <Grid item xs={6}><TextField fullWidth label="Capacity" type="number" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} /></Grid>
                                </Grid>
                            </>
                        )}
                        {dialogType === 'RESOURCE' && (
                            <TextField fullWidth label="Resource Name" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                        )}
                        {dialogType === 'PLACEMENT' && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Select Child</InputLabel>
                                    <Select
                                        value={placementForm.child}
                                        label="Select Child"
                                        onChange={(e: SelectChangeEvent) => setPlacementForm({ ...placementForm, child: e.target.value as string })}
                                        sx={{ borderRadius: 3 }}
                                    >
                                        {children.map((c: any) => (
                                            <MenuItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth>
                                    <InputLabel>Target Shelter Home</InputLabel>
                                    <Select
                                        value={placementForm.shelter_home}
                                        label="Target Shelter Home"
                                        onChange={(e: SelectChangeEvent) => setPlacementForm({ ...placementForm, shelter_home: e.target.value as string })}
                                        sx={{ borderRadius: 3 }}
                                    >
                                        {shelters.map((s: any) => (
                                            <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Placement Date"
                                    value={placementForm.placement_date}
                                    onChange={(e) => setPlacementForm({ ...placementForm, placement_date: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Placement Reason"
                                    value={placementForm.placement_reason}
                                    onChange={(e) => setPlacementForm({ ...placementForm, placement_reason: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            </Box>
                        )}
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            {dialogType === 'ASSIGN' ? 'Direct role assignments trigger permission updates in the System Directory.' :
                                dialogType === 'PLACEMENT' ? 'Ensure legal guardianship status is verified before placement.' :
                                    'System sync updates real-time operational metrics.'}
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ fontWeight: 600 }}>Dismiss</Button>
                    <Button
                        variant="contained"
                        onClick={
                            dialogType === 'ASSIGN' ? handleStaffAssignment :
                                dialogType === 'PLACEMENT' ? handleRegisterPlacement :
                                    () => setOpenDialog(false)
                        }
                        sx={{ borderRadius: 3, px: 4, fontWeight: 'bold' }}
                    >
                        {dialogType === 'ASSIGN' ? 'Finalize Assignment' :
                            dialogType === 'PLACEMENT' ? 'Register Placement' :
                                'Sync Data'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* New Comprehensive Shelter Registration Dialog */}
            <ShelterRegistrationDialog
                open={showRegisterDialog}
                onClose={() => {
                    setShowRegisterDialog(false);
                    setSelectedShelter(null);
                }}
                onSubmit={handleShelterSubmit}
                initialData={selectedShelter}
            />

            {/* Admin Review Dialog */}
            <ShelterReviewDialog
                open={showReviewDialog}
                shelter={selectedShelter}
                onClose={() => {
                    setShowReviewDialog(false);
                    setSelectedShelter(null);
                }}
                onApprove={handleApproveShelter}
                onReject={handleRejectShelter}
                onRequestInfo={handleRequestInfo}
            />

            <ConfirmationDialog
                open={confirmDialog.open}
                title={confirmDialog.title}
                message={confirmDialog.message}
                severity={confirmDialog.severity}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
