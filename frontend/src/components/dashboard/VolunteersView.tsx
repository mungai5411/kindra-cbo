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
    CircularProgress,
    Button,
    Grid,
    Card,
    CardContent,
    Avatar,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    useTheme,
    alpha,
    IconButton,
    Tooltip,
    MenuItem,
    FormControlLabel,
    Checkbox,
    FormGroup,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Stack,
    TablePagination,
    useMediaQuery
} from '@mui/material';
import { Person, Assignment, Event as EventIcon, Schedule, School, Verified, Add, AccessTime, Email, Phone, AdminPanelSettings, OpenInNew, Delete, People, Edit, Check, Close } from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import { fetchVolunteers, fetchTasks, fetchEvents, logTimeEntry, addTask, addEvent, updateEvent, deleteEvent, registerForEvent, unregisterFromEvent, fetchTimeLogs, fetchShelters, createTaskApplication, deleteTask, fetchEventParticipants, updateTimeLogStatus } from '../../features/volunteers/volunteersSlice';
import { SubTabView } from './SubTabView';
import { motion } from 'framer-motion';
import { StatsCard } from './StatCards';
import { ImageGallery, ImageItem } from '../common/ImageGallery';

interface VolunteersViewProps {
    setOpenDialog?: (open: boolean) => void;
    activeTab?: string;
}

export function VolunteersView({ setOpenDialog, activeTab }: VolunteersViewProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const dispatch = useDispatch<AppDispatch>();
    const { volunteers, tasks, events, timeLogs, shelters, isLoading, error } = useSelector((state: RootState) => state.volunteers);
    const user = useSelector((state: RootState) => state.auth.user);
    const userRole = user?.role;
    const isManagement = ['ADMIN', 'MANAGEMENT'].includes(userRole || '');
    const isVolunteer = userRole === 'VOLUNTEER';
    const isShelter = userRole === 'SHELTER_PARTNER';
    const isAdmin = user?.is_superuser || userRole === 'ADMIN' || userRole === 'MANAGEMENT';

    const trainings = events.filter((e: any) => e.event_type === 'TRAINING');

    const [timeLogOpen, setTimeLogOpen] = useState(false);
    const [selectedVolunteer, setSelectedVolunteer] = useState<any>(null);
    const [timeHours, setTimeHours] = useState(1);
    const [timeDesc, setTimeDesc] = useState('');

    // Profile Dialog State
    const [profileDialogOpen, setProfileDialogOpen] = useState(false);
    const [viewingVolunteer, setViewingVolunteer] = useState<any>(null);

    // New Task Dialog State
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        task_type: 'OTHER',
        location: '',
        shelter: '',
        assigned_to: '', // For Log Time
        assignees: [] as string[],
        due_date: new Date().toISOString().split('T')[0]
    });

    // New Event Dialog State
    const [eventDialogOpen, setEventDialogOpen] = useState(false);
    const [eventForm, setEventForm] = useState({
        title: '',
        description: '',
        event_type: 'COMMUNITY',
        location: '',
        start_datetime: new Date().toISOString().slice(0, 16),
        end_datetime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
        post_to_volunteers: true,
        post_to_donors: false,
        post_to_shelters: false,
        event_gallery: [] as any[]
    });
    const [eventPhotos, setEventPhotos] = useState<File[]>([]);
    const [eventPhotoPreviews, setEventPhotoPreviews] = useState<ImageItem[]>([]);
    const [isEditingEvent, setIsEditingEvent] = useState(false);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);

    // Participants Dialog
    const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]);
    const [participantsLoading, setParticipantsLoading] = useState(false);
    const [activeEventForParticipants, setActiveEventForParticipants] = useState<any>(null);

    const handleEventGalleryAdd = async (files: File[]) => {
        const updatedPhotos = [...eventPhotos, ...files];
        setEventPhotos(updatedPhotos);

        const newPreviews: ImageItem[] = files.map(file => ({
            id: URL.createObjectURL(file), // Temporary ID
            url: URL.createObjectURL(file),
            isPrimary: false
        }));
        setEventPhotoPreviews([...eventPhotoPreviews, ...newPreviews]);
    };

    const handleEventGalleryDelete = async (id: string) => {
        const idx = eventPhotoPreviews.findIndex(p => p.id === id);
        if (idx !== -1) {
            const updatedFiles = [...eventPhotos];
            updatedFiles.splice(idx, 1);
            setEventPhotos(updatedFiles);

            const updatedPreviews = [...eventPhotoPreviews];
            updatedPreviews.splice(idx, 1);
            setEventPhotoPreviews(updatedPreviews);
        }
    };

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'info' | 'warning' | 'error' });

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [eventPage, setEventPage] = useState(0);
    const [eventRowsPerPage, setEventRowsPerPage] = useState(10);
    const [logPage, setLogPage] = useState(0);
    const [logRowsPerPage, setLogRowsPerPage] = useState(10);

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };



    const handleChangeEventPage = (_event: unknown, newPage: number) => {
        setEventPage(newPage);
    };

    const handleChangeEventRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEventRowsPerPage(parseInt(event.target.value, 10));
        setEventPage(0);
    };

    const handleChangeLogPage = (_event: unknown, newPage: number) => {
        setLogPage(newPage);
    };

    const handleChangeLogRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLogRowsPerPage(parseInt(event.target.value, 10));
        setLogPage(0);
    };

    useEffect(() => {
        dispatch(fetchVolunteers());
        dispatch(fetchTasks());
        dispatch(fetchEvents());
        dispatch(fetchTimeLogs());
        dispatch(fetchShelters());
    }, [dispatch]);

    const handleOpenTimeLog = (volunteer: any) => {
        setSelectedVolunteer(volunteer);
        setTimeLogOpen(true);
    };

    const handleLogTime = () => {
        if (!timeDesc) {
            setSnackbar({ open: true, message: 'Please describe the activity', severity: 'warning' });
            return;
        }
        const volunteerId = selectedVolunteer?.id || taskForm.assigned_to;
        if (volunteerId) {
            dispatch(logTimeEntry({
                volunteer: volunteerId,
                hours: timeHours,
                description: timeDesc,
                date: new Date().toISOString().split('T')[0]
            })).unwrap().then(() => {
                setTimeLogOpen(false);
                setTimeDesc('');
                setTaskForm({ ...taskForm, assigned_to: '' });
                setSnackbar({ open: true, message: 'Time log submitted successfully', severity: 'success' });
            });
        } else {
            setSnackbar({ open: true, message: 'Please select a volunteer', severity: 'warning' });
        }
    };

    const handleAddTask = () => {
        // Validate required fields
        if (!taskForm.title || !taskForm.description) {
            setSnackbar({ open: true, message: 'Please fill in Title and Description', severity: 'warning' });
            return;
        }

        const payload: any = {
            ...taskForm,
            // Convert empty strings to null for optional FKs
            shelter: taskForm.shelter || null,
            assignees: taskForm.assignees,
            is_request: isShelter,
            approval_status: isShelter ? 'PENDING' : 'APPROVED',
            task_type: isShelter ? 'SHELTER' : taskForm.task_type
        };

        // Remove location if empty to use backend default
        if (!payload.location) {
            delete payload.location;
        }

        dispatch(addTask(payload)).unwrap().then(() => {
            setTaskDialogOpen(false);
            setTaskForm({
                title: '',
                description: '',
                priority: 'MEDIUM',
                task_type: 'OTHER',
                location: '',
                shelter: '',
                assigned_to: '',
                assignees: [],
                due_date: new Date().toISOString().split('T')[0]
            });
            setSnackbar({ open: true, message: 'Task assigned successfully', severity: 'success' });
        }).catch((err) => {
            console.error(err);
            setSnackbar({ open: true, message: 'Failed to assign task. Please fill all required fields.', severity: 'error' });
        });
    };

    const handleAddEvent = async () => {
        if (!eventForm.title || !eventForm.start_datetime) {
            setSnackbar({ open: true, message: 'Required fields missing', severity: 'error' });
            return;
        }

        const formData = new FormData();
        Object.entries(eventForm).forEach(([key, value]) => {
            if (key === 'event_gallery') {
                (value as any[]).forEach(img => formData.append('event_gallery', img));
            } else {
                formData.append(key, String(value));
            }
        });

        if (isEditingEvent && editingEventId) {
            dispatch(updateEvent({ id: editingEventId, data: formData })).unwrap().then(() => {
                setEventDialogOpen(false);
                setIsEditingEvent(false);
                setEditingEventId(null);
                setEventForm({ title: '', description: '', event_type: 'COMMUNITY', location: '', start_datetime: '', end_datetime: '', post_to_volunteers: true, post_to_donors: false, post_to_shelters: false, event_gallery: [] });
                setEventPhotoPreviews([]);
                setSnackbar({ open: true, message: 'Event updated successfully', severity: 'success' });
            }).catch(() => {
                setSnackbar({ open: true, message: 'Failed to update event.', severity: 'error' });
            });
        } else {
            dispatch(addEvent(formData)).unwrap().then(() => {
                setEventDialogOpen(false);
                setEventForm({ title: '', description: '', event_type: 'COMMUNITY', location: '', start_datetime: '', end_datetime: '', post_to_volunteers: true, post_to_donors: false, post_to_shelters: false, event_gallery: [] });
                setEventPhotoPreviews([]);
                setSnackbar({ open: true, message: 'Event created and posted successfully', severity: 'success' });
            }).catch(() => {
                setSnackbar({ open: true, message: 'Failed to create event.', severity: 'error' });
            });
        }
    };

    const handleViewParticipants = (event: any) => {
        setActiveEventForParticipants(event);
        setParticipantsLoading(true);
        setParticipantsDialogOpen(true);
        dispatch(fetchEventParticipants(event.id)).unwrap()
            .then((data) => {
                setParticipants(data);
                setParticipantsLoading(false);
            })
            .catch(() => {
                setParticipantsLoading(false);
                setSnackbar({ open: true, message: 'Failed to fetch participants', severity: 'error' });
            });
    };

    const handleRegister = (eventId: string) => {
        dispatch(registerForEvent(eventId)).unwrap()
            .then(() => setSnackbar({ open: true, message: 'Successfully registered!', severity: 'success' }))
            .catch(() => setSnackbar({ open: true, message: 'Registration failed', severity: 'error' }));
    };

    const handleUnregister = (eventId: string) => {
        dispatch(unregisterFromEvent(eventId)).unwrap()
            .then(() => setSnackbar({ open: true, message: 'Successfully unregistered', severity: 'success' }))
            .catch(() => setSnackbar({ open: true, message: 'Failed to unregister', severity: 'error' }));
    };

    const handleEditEvent = (event: any) => {
        setIsEditingEvent(true);
        setEditingEventId(event.id);
        setEventForm({
            title: event.title,
            description: event.description,
            event_type: event.event_type,
            location: event.location,
            start_datetime: event.start_datetime.slice(0, 16),
            end_datetime: (event.end_datetime || '').slice(0, 16),
            post_to_volunteers: event.post_to_volunteers,
            post_to_donors: event.post_to_donors,
            post_to_shelters: event.post_to_shelters,
            event_gallery: []
        });
        setEventDialogOpen(true);
    };

    const handleDeleteEvent = (eventId: string) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            dispatch(deleteEvent(eventId)).unwrap()
                .then(() => setSnackbar({ open: true, message: 'Event deleted', severity: 'success' }))
                .catch(() => setSnackbar({ open: true, message: 'Failed to delete event', severity: 'error' }));
        }
    };

    const handleViewProfile = (volunteer: any) => {
        setViewingVolunteer(volunteer);
        setProfileDialogOpen(true);
    };

    const StatusChip = ({ status }: { status: string }) => {
        const getStatusColor = () => {
            switch (status) {
                case 'ACTIVE':
                case 'COMPLETED':
                case 'VERIFIED':
                case 'APPROVED':
                    return theme.palette.success.main;
                case 'PENDING':
                case 'OPEN':
                case 'IN_PROGRESS':
                    return theme.palette.warning.main;
                case 'CANCELLED':
                case 'REJECTED':
                    return theme.palette.error.main;
                default:
                    return theme.palette.info.main;
            }
        };

        const color = getStatusColor();

        return (
            <Chip
                label={status}
                size="small"
                sx={{
                    fontWeight: 900,
                    fontSize: '0.65rem',
                    borderRadius: 1.5,
                    bgcolor: alpha(color, 0.08),
                    color: color,
                    border: '1px solid',
                    borderColor: alpha(color, 0.15),
                    letterSpacing: 0.5,
                    px: 0.5
                }}
            />
        );
    };

    const renderVolunteerList = () => (
        <Paper sx={{
            p: 0,
            borderRadius: 4,
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.08),
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
                borderColor: alpha(theme.palette.primary.main, 0.15),
                boxShadow: '0 8px 32px rgba(0,0,0,0.04)'
            }
        }}>
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.05) }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>Human Capital Registry</Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, letterSpacing: 1 }}>ACTIVE FIELD OPERATIVES</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenDialog?.(true)}
                    sx={{
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 900,
                        px: 3,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                        '&:hover': { boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.3)}` }
                    }}
                >
                    Provision Operative
                </Button>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 900, fontSize: '0.75rem', color: 'text.disabled', letterSpacing: 1, textTransform: 'uppercase' }}>Operative</TableCell>
                            <TableCell sx={{ fontWeight: 900, fontSize: '0.75rem', color: 'text.disabled', letterSpacing: 1, textTransform: 'uppercase' }}>Nexus Node</TableCell>
                            <TableCell sx={{ fontWeight: 900, fontSize: '0.75rem', color: 'text.disabled', letterSpacing: 1, textTransform: 'uppercase' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 900, fontSize: '0.75rem', color: 'text.disabled', letterSpacing: 1, textTransform: 'uppercase' }}>Activation</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 900, fontSize: '0.75rem', color: 'text.disabled', letterSpacing: 1, textTransform: 'uppercase' }}>Control</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {volunteers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((v: any) => (
                            <TableRow key={v.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                        <Avatar sx={{
                                            width: 40,
                                            height: 40,
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: 'primary.main',
                                            fontWeight: 900,
                                            fontSize: '1rem',
                                            border: '2px solid',
                                            borderColor: 'background.paper'
                                        }}>
                                            {v.full_name?.[0]}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>{v.full_name}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>{v.email}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>{v.county || 'GLOBAL'}</TableCell>
                                <TableCell>
                                    <StatusChip status={v.status} />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>{v.total_hours} <Box component="span" sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>HRS</Box></TableCell>
                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                        <Tooltip title="View System Profile">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleViewProfile(v)}
                                                sx={{
                                                    color: 'primary.main',
                                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                                }}
                                            >
                                                <OpenInNew sx={{ fontSize: '1.2rem' }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Button
                                            size="small"
                                            startIcon={<AccessTime />}
                                            onClick={() => handleOpenTimeLog(v)}
                                            sx={{
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 800,
                                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                color: 'primary.main',
                                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                            }}
                                        >
                                            Log Delta
                                        </Button>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {volunteers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                                    <People sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.2 }} />
                                    <Typography variant="body1" sx={{ color: 'text.disabled', fontWeight: 700 }}>No operative data synchronized.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={volunteers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ borderTop: '1px solid', borderColor: alpha(theme.palette.divider, 0.05) }}
            />
        </Paper>
    );

    const renderTasks = () => {
        const currentVolunteerId = volunteers.find((v: any) => v.email === user?.email)?.id;

        // Filter tasks
        const myTasks = tasks.filter((t: any) => t.assignees_details?.some((a: any) => a.id === currentVolunteerId));
        const openTasks = tasks.filter((t: any) => t.status === 'OPEN' && (!t.assignees_details || t.assignees_details.length === 0));

        const handleApply = (id: string) => {
            if (!currentVolunteerId) {
                setSnackbar({ open: true, message: 'Profile not linked. Please contact admin.', severity: 'error' });
                return;
            }
            dispatch(createTaskApplication({ task: id, volunteer: currentVolunteerId })).unwrap()
                .then(() => setSnackbar({ open: true, message: 'Application submitted!', severity: 'success' }))
                .catch(() => setSnackbar({ open: true, message: 'Failed to apply.', severity: 'error' }));
        };

        const handleDeleteTask = (id: string) => {
            if (window.confirm('Are you sure you want to delete this task?')) {
                dispatch(deleteTask(id)).unwrap()
                    .then(() => setSnackbar({ open: true, message: 'Task deleted successfully', severity: 'success' }))
                    .catch(() => setSnackbar({ open: true, message: 'Failed to delete task', severity: 'error' }));
            }
        };

        if (isMobile) {
            const displayedTasks = (isVolunteer ? myTasks : tasks).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
                            {isVolunteer ? 'My Assignments' : 'Operations Ledger'}
                        </Typography>
                        {(isManagement || isShelter) && (
                            <Button variant="outlined" size="small" onClick={() => setTaskDialogOpen(true)} startIcon={<Add />} sx={{ borderRadius: 2, fontWeight: 800 }}>New Hub</Button>
                        )}
                    </Box>
                    {displayedTasks.map((task: any) => (
                        <Paper key={task.id} sx={{
                            p: 3,
                            borderRadius: 4,
                            border: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.08),
                            bgcolor: alpha(theme.palette.background.paper, 0.6),
                            backdropFilter: 'blur(10px)'
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>{task.title}</Typography>
                                <StatusChip status={task.status} />
                            </Box>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 2 }}>
                                {task.location || task.shelter_name || 'COORDINATED RESPONSE'}
                            </Typography>
                            <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
                                <Chip
                                    label={task.priority}
                                    size="small"
                                    sx={{
                                        fontWeight: 900,
                                        fontSize: '0.6rem',
                                        borderRadius: 1.5,
                                        bgcolor: alpha((task.priority === 'HIGH' || task.priority === 'URGENT') ? theme.palette.error.main : theme.palette.info.main, 0.08),
                                        color: (task.priority === 'HIGH' || task.priority === 'URGENT') ? 'error.main' : 'info.main',
                                        border: 'none'
                                    }}
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Schedule sx={{ fontSize: '0.8rem', color: 'text.disabled' }} />
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled' }}>{task.due_date || 'TBD'}</Typography>
                                </Box>
                            </Stack>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled' }}>
                                    {task.assignees_details?.length > 0 ? `TEAM: ${task.assignees_details.map((a: any) => a.name.split(' ')[0].toUpperCase()).join(', ')}` : 'RESOURCES PENDING'}
                                </Typography>
                                {isManagement && (
                                    <IconButton size="small" color="error" onClick={() => handleDeleteTask(task.id)} sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                                        <Delete sx={{ fontSize: '1.2rem' }} />
                                    </IconButton>
                                )}
                            </Box>
                        </Paper>
                    ))}
                    {displayedTasks.length === 0 && (
                        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '2px dashed', borderColor: alpha(theme.palette.divider, 0.1), bgcolor: 'transparent' }}>
                            <Assignment sx={{ fontSize: 40, color: 'text.disabled', opacity: 0.2, mb: 1 }} />
                            <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 600 }}>No operations identified.</Typography>
                        </Paper>
                    )}

                    {isVolunteer && openTasks.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 2, letterSpacing: -0.5 }}>Open Opportunities</Typography>
                            {openTasks.map((task: any) => (
                                <Paper key={task.id} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.08), bgcolor: alpha(theme.palette.primary.main, 0.03), mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>{task.title}</Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 2 }}>{task.location || 'LOGISTICS COORDINATION'}</Typography>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        fullWidth
                                        onClick={() => handleApply(task.id)}
                                        disabled={task.has_applied}
                                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 900, py: 1 }}
                                    >
                                        {task.has_applied ? "APPLICATION FILED" : "SECURE ASSIGNMENT"}
                                    </Button>
                                </Paper>
                            ))}
                        </Box>
                    )}

                    <TablePagination
                        component="div"
                        count={(isVolunteer ? myTasks : tasks).length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Box>
            );
        }

        return (
            <Paper sx={{
                p: 0,
                borderRadius: 4,
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.08),
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                backdropFilter: 'blur(10px)',
                overflow: 'hidden'
            }}>
                <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.05) }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
                            {isVolunteer ? 'Mission Control' : 'Operations Management'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, letterSpacing: 1 }}>{isVolunteer ? 'MY ACTIVE DEPLOYMENTS' : 'SYSTEM-WIDE TASK ARCHITECTURE'}</Typography>
                    </Box>
                    {(isManagement || isShelter) && (
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setTaskDialogOpen(true)}
                            sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 900,
                                px: 3,
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                            }}
                        >
                            {isShelter ? 'Request Deployment' : 'New Deployment'}
                        </Button>
                    )}
                </Box>

                <Box>
                    {isVolunteer && openTasks.length > 0 && (
                        <Box sx={{ borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.05) }}>
                            <Box sx={{ px: 4, py: 2, bgcolor: alpha(theme.palette.secondary.main, 0.03) }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'secondary.main', letterSpacing: 1 }}>AVAILABLE OPPORTUNITIES</Typography>
                            </Box>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 900, fontSize: '0.7rem', color: 'text.disabled', letterSpacing: 1, pl: 4 }}>TASK PROTOCOL</TableCell>
                                            <TableCell sx={{ fontWeight: 900, fontSize: '0.7rem', color: 'text.disabled', letterSpacing: 1 }}>LOCATION</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 900, fontSize: '0.7rem', color: 'text.disabled', letterSpacing: 1, pr: 4 }}>ACTION</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {openTasks.map((task: any) => (
                                            <TableRow key={task.id}>
                                                <TableCell sx={{ pl: 4 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{task.title}</Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500 }}>{task.description?.substring(0, 70)}...</Typography>
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>{task.location || task.shelter_name || 'REMOTE'}</TableCell>
                                                <TableCell align="right" sx={{ pr: 4 }}>
                                                    <Button
                                                        size="small"
                                                        variant={task.has_applied ? "text" : "outlined"}
                                                        disabled={task.has_applied}
                                                        onClick={() => handleApply(task.id)}
                                                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800 }}
                                                    >
                                                        {task.has_applied ? "FILED" : "ENLIST"}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}

                    <Box sx={{ px: 4, py: 2, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: 1 }}>{isVolunteer ? 'MY ASSIGNMENTS' : 'FULL OPERATIONS LEDGER'}</Typography>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 900, fontSize: '0.7rem', color: 'text.disabled', letterSpacing: 1, pl: 4 }}>PROTOCOL</TableCell>
                                    <TableCell sx={{ fontWeight: 900, fontSize: '0.7rem', color: 'text.disabled', letterSpacing: 1 }}>TEAM</TableCell>
                                    <TableCell sx={{ fontWeight: 900, fontSize: '0.7rem', color: 'text.disabled', letterSpacing: 1 }}>DEADLINE</TableCell>
                                    <TableCell sx={{ fontWeight: 900, fontSize: '0.7rem', color: 'text.disabled', letterSpacing: 1 }}>PRIORITY</TableCell>
                                    <TableCell sx={{ fontWeight: 900, fontSize: '0.7rem', color: 'text.disabled', letterSpacing: 1 }}>STATUS</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 900, fontSize: '0.7rem', color: 'text.disabled', letterSpacing: 1, pr: 4 }}>{isManagement ? 'CONTROL' : 'LOCATION'}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(isVolunteer ? myTasks : tasks).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((task: any) => (
                                    <TableRow key={task.id} hover>
                                        <TableCell sx={{ pl: 4 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{task.title}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8rem' }}>
                                            {task.assignees_details?.length > 0 ? task.assignees_details.map((a: any) => a.name.split(' ')[0]).join(', ') : '-'}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{task.due_date || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={task.priority}
                                                size="small"
                                                sx={{
                                                    fontWeight: 900,
                                                    fontSize: '0.65rem',
                                                    borderRadius: 1.5,
                                                    bgcolor: alpha((task.priority === 'HIGH' || task.priority === 'URGENT') ? theme.palette.error.main : theme.palette.info.main, 0.08),
                                                    color: (task.priority === 'HIGH' || task.priority === 'URGENT') ? 'error.main' : 'info.main'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell><StatusChip status={task.status} /></TableCell>
                                        <TableCell align="right" sx={{ pr: 4 }}>
                                            {isManagement ? (
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}
                                                >
                                                    <Delete sx={{ fontSize: '1rem' }} />
                                                </IconButton>
                                            ) : (
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{task.location || task.shelter_name || '-'}</Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(isVolunteer ? myTasks : tasks).length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                            <Assignment sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.2 }} />
                                            <Typography variant="body1" sx={{ color: 'text.disabled', fontWeight: 700 }}>No active operations logs found.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={(isVolunteer ? myTasks : tasks).length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{ borderTop: '1px solid', borderColor: alpha(theme.palette.divider, 0.05) }}
                    />
                </Box>
            </Paper>
        );
    };

    const renderEvents = () => (
        <Paper sx={{
            p: 0,
            borderRadius: 4,
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.08),
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: 'blur(10px)',
            overflow: 'hidden'
        }}>
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.05) }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>Community Hub</Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, letterSpacing: 1 }}>ENGAGEMENT & OUTREACH EVENTS</Typography>
                </Box>
                {isManagement && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setEventDialogOpen(true)}
                        sx={{
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 900,
                            px: 3,
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                        }}
                    >
                        Provision Event
                    </Button>
                )}
            </Box>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 900, fontSize: '0.75rem', color: 'text.disabled', letterSpacing: 1, textTransform: 'uppercase', pl: 4 }}>Engagement Protocol</TableCell>
                            <TableCell sx={{ fontWeight: 900, fontSize: '0.75rem', color: 'text.disabled', letterSpacing: 1, textTransform: 'uppercase' }}>Classification</TableCell>
                            <TableCell sx={{ fontWeight: 900, fontSize: '0.75rem', color: 'text.disabled', letterSpacing: 1, textTransform: 'uppercase' }}>Nexus Point</TableCell>
                            <TableCell sx={{ fontWeight: 900, fontSize: '0.75rem', color: 'text.disabled', letterSpacing: 1, textTransform: 'uppercase' }}>Activation</TableCell>
                            <TableCell sx={{ fontWeight: 900, fontSize: '0.75rem', color: 'text.disabled', letterSpacing: 1, textTransform: 'uppercase' }}>Personnel</TableCell>
                            <TableCell sx={{ fontWeight: 900, fontSize: '0.75rem', color: 'text.disabled', letterSpacing: 1, textTransform: 'uppercase', pr: 4 }} align="right">Control</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {events.filter((e: any) => isManagement || e.is_active).slice(eventPage * eventRowsPerPage, eventPage * eventRowsPerPage + eventRowsPerPage).map((event: any) => (
                            <TableRow key={event.id} hover>
                                <TableCell sx={{ pl: 4 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{event.title}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={event.event_type}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                            fontWeight: 900,
                                            fontSize: '0.6rem',
                                            borderRadius: 1.5,
                                            borderColor: alpha(theme.palette.primary.main, 0.15),
                                            color: 'primary.main',
                                            letterSpacing: 0.5
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>{event.location}</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{new Date(event.start_datetime).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Box
                                        onClick={isManagement ? () => handleViewParticipants(event) : undefined}
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.success.main, 0.05),
                                            color: 'success.main',
                                            cursor: isManagement ? 'pointer' : 'default',
                                            transition: 'all 0.2s ease',
                                            '&:hover': isManagement ? { bgcolor: alpha(theme.palette.success.main, 0.1) } : {}
                                        }}
                                    >
                                        <People sx={{ fontSize: '0.9rem' }} />
                                        <Typography variant="caption" sx={{ fontWeight: 900 }}>{event.registered_count || 0}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="right" sx={{ pr: 4 }}>
                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                        {isVolunteer && (
                                            event.is_registered ? (
                                                <Button
                                                    size="small"
                                                    variant="text"
                                                    color="error"
                                                    onClick={() => handleUnregister(event.id)}
                                                    sx={{ textTransform: 'none', fontWeight: 900, fontSize: '0.75rem' }}
                                                >
                                                    ABORT
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => handleRegister(event.id)}
                                                    disabled={event.is_full}
                                                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 900, fontSize: '0.75rem' }}
                                                >
                                                    ENLIST
                                                </Button>
                                            )
                                        )}
                                        {isManagement && (
                                            <>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleViewParticipants(event)}
                                                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), color: 'primary.main' }}
                                                >
                                                    <People sx={{ fontSize: '1rem' }} />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEditEvent(event)}
                                                    sx={{ bgcolor: alpha(theme.palette.info.main, 0.05), color: 'info.main' }}
                                                >
                                                    <Edit sx={{ fontSize: '1rem' }} />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteEvent(event.id)}
                                                    sx={{ bgcolor: alpha(theme.palette.error.main, 0.05), color: 'error.main' }}
                                                >
                                                    <Delete sx={{ fontSize: '1rem' }} />
                                                </IconButton>
                                            </>
                                        )}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {events.filter((e: any) => isManagement || e.is_active).length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                    <EventIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.2 }} />
                                    <Typography variant="body1" sx={{ color: 'text.disabled', fontWeight: 700 }}>No community operations scheduled.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={events.filter((e: any) => isManagement || e.is_active).length}
                rowsPerPage={eventRowsPerPage}
                page={eventPage}
                onPageChange={handleChangeEventPage}
                onRowsPerPageChange={handleChangeEventRowsPerPage}
                sx={{ borderTop: '1px solid', borderColor: alpha(theme.palette.divider, 0.05) }}
            />
        </Paper>
    );

    const renderTimeLogs = () => {
        const currentVolunteerId = volunteers.find((v: any) => v.email === user?.email)?.id;
        const displayedLogs = isVolunteer && currentVolunteerId
            ? timeLogs.filter((log: any) => log.volunteer === currentVolunteerId)
            : timeLogs;

        const handleUpdateLogStatus = (id: string, status: string) => {
            dispatch(updateTimeLogStatus({ id, status })).unwrap()
                .then(() => setSnackbar({ open: true, message: `Log ${status.toLowerCase()} successfully`, severity: 'success' }))
                .catch(() => setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' }));
        };

        return (
            <Paper sx={{
                p: 0,
                borderRadius: 4,
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.08),
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                backdropFilter: 'blur(10px)',
                overflow: 'hidden'
            }}>
                <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.05) }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>Service Chronometry</Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, letterSpacing: 1 }}>{isVolunteer ? 'MY PERSONAL SERVICE LOGS' : 'SYSTEM-WIDE ACTIVITY AUDIT'}</Typography>
                    </Box>
                    {isManagement && (
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => {
                                setSelectedVolunteer(null);
                                setTimeLogOpen(true);
                            }}
                            sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 900,
                                px: 3,
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                            }}
                        >
                            Log Instance
                        </Button>
                    )}
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {!isVolunteer && <TableCell sx={{ fontWeight: 900, fontSize: '0.75rem', color: 'text.disabled', letterSpacing: 1, textTransform: 'uppercase', pl: 4 }}>Operative</TableCell>}
                                <TableCell sx={{ fontWeight: 900, fontSize: '0.75rem', color: 'text.disabled', letterSpacing: 1, textTransform: 'uppercase', pl: isVolunteer ? 4 : 2 }}>Timestamp</TableCell>
                                <TableCell sx={{ fontWeight: 900, fontSize: '0.75rem', color: 'text.disabled', letterSpacing: 1, textTransform: 'uppercase' }}>Magnitude</TableCell>
                                <TableCell sx={{ fontWeight: 900, fontSize: '0.75rem', color: 'text.disabled', letterSpacing: 1, textTransform: 'uppercase' }}>Mission Log</TableCell>
                                <TableCell sx={{ fontWeight: 900, fontSize: '0.75rem', color: 'text.disabled', letterSpacing: 1, textTransform: 'uppercase', pr: 4 }}>Verification</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayedLogs.slice(logPage * logRowsPerPage, logPage * logRowsPerPage + logRowsPerPage).map((log: any, i: number) => (
                                <TableRow key={log.id || i} hover>
                                    {!isVolunteer && <TableCell sx={{ fontWeight: 700, color: 'text.primary', pl: 4 }}>{log.volunteer_name}</TableCell>}
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', pl: isVolunteer ? 4 : 2 }}>{log.date}</TableCell>
                                    <TableCell sx={{ fontWeight: 900, color: 'primary.main' }}>{log.hours} <Box component="span" sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>HRS</Box></TableCell>
                                    <TableCell sx={{ fontWeight: 500, color: 'text.secondary' }}>{log.description}</TableCell>
                                    <TableCell sx={{ pr: 4 }}>
                                        {isManagement && log.status === 'PENDING' ? (
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Tooltip title="Verify & Approve">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleUpdateLogStatus(log.id, 'VERIFIED')}
                                                        sx={{
                                                            color: 'success.main',
                                                            bgcolor: alpha(theme.palette.success.main, 0.05),
                                                            '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.1) }
                                                        }}
                                                    >
                                                        <Check fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Reject">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleUpdateLogStatus(log.id, 'REJECTED')}
                                                        sx={{
                                                            color: 'error.main',
                                                            bgcolor: alpha(theme.palette.error.main, 0.05),
                                                            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                                                        }}
                                                    >
                                                        <Close fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        ) : (
                                            <StatusChip status={log.status} />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {displayedLogs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={isVolunteer ? 4 : 5} align="center" sx={{ py: 10 }}>
                                        <AccessTime sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.2 }} />
                                        <Typography variant="body1" sx={{ color: 'text.disabled', fontWeight: 700 }}>No chronometric data recorded.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={displayedLogs.length}
                    rowsPerPage={logRowsPerPage}
                    page={logPage}
                    onPageChange={handleChangeLogPage}
                    onRowsPerPageChange={handleChangeLogRowsPerPage}
                    sx={{ borderTop: '1px solid', borderColor: alpha(theme.palette.divider, 0.05) }}
                />
            </Paper>
        );
    };

    const renderTrainings = () => (
        <Paper sx={{
            p: 4,
            borderRadius: 4,
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.08),
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: 'blur(10px)',
            overflow: 'hidden'
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>Training Academy</Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, letterSpacing: 1 }}>OPERATIVE READINESS & CERTIFICATION</Typography>
                </Box>
                {isManagement && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => {
                            setEventForm({ ...eventForm, event_type: 'TRAINING' });
                            setEventDialogOpen(true);
                        }}
                        sx={{
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 900,
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                        }}
                    >
                        Provision Module
                    </Button>
                )}
            </Box>
            <Grid container spacing={3}>
                {trainings && trainings.map((t: any, i: number) => (
                    <Grid item xs={12} md={4} key={i}>
                        <Card variant="outlined" sx={{
                            borderRadius: 4,
                            bgcolor: alpha(theme.palette.background.paper, 0.4),
                            border: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.08),
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                transform: 'translateY(-6px)',
                                boxShadow: `0 12px 24px ${alpha(theme.palette.common.black, 0.05)}`,
                                borderColor: alpha(theme.palette.primary.main, 0.2)
                            }
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>{t.title}</Typography>
                                    <Verified sx={{ color: t.is_active ? 'primary.main' : 'text.disabled', fontSize: '1.2rem' }} />
                                </Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 3 }}>
                                    {new Date(t.start_datetime).toLocaleDateString()} • {t.registered_count || 0} Recruits
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <StatusChip status={t.is_active ? 'ACTIVE' : 'INACTIVE'} />

                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {isVolunteer && t.is_active && (
                                            t.is_registered ? (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleUnregister(t.id)}
                                                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800, fontSize: '0.7rem' }}
                                                >
                                                    ABORT
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    onClick={() => handleRegister(t.id)}
                                                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800, fontSize: '0.7rem' }}
                                                >
                                                    ENLIST
                                                </Button>
                                            )
                                        )}

                                        {isManagement && (
                                            <>
                                                <Tooltip title="View Recruits">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleViewParticipants(t)}
                                                        sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}
                                                    >
                                                        <People fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit Module">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEditEvent(t)}
                                                        sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main' }}
                                                    >
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                {trainings.length === 0 && (
                    <Grid item xs={12}>
                        <Box sx={{ p: 6, textAlign: 'center', opacity: 0.5 }}>
                            <School sx={{ fontSize: 48, mb: 2 }} />
                            <Typography variant="body1" fontWeight="bold">No training modules active.</Typography>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Paper>
    );

    if (isLoading && volunteers.length === 0) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Typography color="error">Error: {error}</Typography>;
    }


    const tabsSource = [
        { id: 'volunteers', label: 'Registry', icon: <Person sx={{ fontSize: '1.2rem' }} />, component: renderVolunteerList(), hidden: !isManagement },
        { id: 'tasks', label: 'Tasks', icon: <Assignment sx={{ fontSize: '1.2rem' }} />, component: renderTasks() },
        { id: 'events', label: 'Events', icon: <EventIcon sx={{ fontSize: '1.2rem' }} />, component: renderEvents() },
        { id: 'time_logs', label: 'Time Logs', icon: <Schedule sx={{ fontSize: '1.2rem' }} />, component: renderTimeLogs() },
        { id: 'trainings', label: 'Trainings', icon: <School sx={{ fontSize: '1.2rem' }} />, component: renderTrainings() },
    ];

    const tabs = tabsSource.filter(tab => !tab.hidden);

    return (
        <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Grid container spacing={4} sx={{ mb: 6 }}>
                <Grid item xs={12} md={4}>
                    <StatsCard
                        title="Active Operatives"
                        value={volunteers.length}
                        description="Synchronized Human Capital"
                        icon={<Person sx={{ fontSize: '1.8rem' }} />}
                        color={theme.palette.primary.main}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatsCard
                        title="Pending Missions"
                        value={tasks.filter((t: any) => t.status === 'PENDING').length}
                        description="Deployment Requests Active"
                        icon={<Assignment sx={{ fontSize: '1.8rem' }} />}
                        color={theme.palette.secondary.main}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatsCard
                        title="Strategic Events"
                        value={events.length}
                        description="Upcoming Community Ops"
                        icon={<EventIcon sx={{ fontSize: '1.8rem' }} />}
                        color="#6366f1"
                    />
                </Grid>
            </Grid>

            <SubTabView title="Personnel Management" tabs={tabs} activeTab={activeTab} />

            {/* Time Log Dialog */}
            <Dialog
                open={timeLogOpen}
                onClose={() => setTimeLogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 6,
                        bgcolor: alpha(theme.palette.background.paper, 0.9),
                        backdropFilter: 'blur(20px)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.1),
                        boxShadow: '0 24px 48px rgba(0,0,0,0.1)'
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: -0.5, textAlign: 'center', pt: 4 }}>Log Mission Hours</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 700, textAlign: 'center', letterSpacing: 0.5 }}>
                            {selectedVolunteer ? (
                                <>SYNCING ACTIVITY FOR: <Box component="span" sx={{ color: 'primary.main' }}>{selectedVolunteer?.full_name.toUpperCase()}</Box></>
                            ) : (
                                "RECORD OPERATIVE SERVICE DATA"
                            )}
                        </Typography>
                        {!selectedVolunteer && (
                            <TextField
                                fullWidth
                                select
                                label="Operative Identification"
                                value={taskForm.assigned_to}
                                onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            >
                                {volunteers.map((v: any) => (
                                    <MenuItem key={v.id} value={v.id}>{v.full_name}</MenuItem>
                                ))}
                            </TextField>
                        )}
                        <TextField
                            fullWidth
                            type="number"
                            label="Service Magnitude (HRS)"
                            value={timeHours}
                            onChange={(e) => setTimeHours(Number(e.target.value))}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Mission Operational Brief"
                            placeholder="Detail the tactical objectives achieved..."
                            value={timeDesc}
                            onChange={(e) => setTimeDesc(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 0, justifyContent: 'center', gap: 2 }}>
                    <Button onClick={() => setTimeLogOpen(false)} sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'none' }}>Abort</Button>
                    <Button
                        variant="contained"
                        onClick={handleLogTime}
                        sx={{
                            borderRadius: 3,
                            px: 4,
                            py: 1.2,
                            fontWeight: 900,
                            textTransform: 'none',
                            boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                        }}
                    >
                        Synchronize Log
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Task Assignment Dialog */}
            <Dialog
                open={taskDialogOpen}
                onClose={() => setTaskDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 6,
                        bgcolor: alpha(theme.palette.background.paper, 0.9),
                        backdropFilter: 'blur(20px)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.1)
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: -0.5 }}>Task Deployment Protocol</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Protocol Title"
                            value={taskForm.title}
                            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Operational Parameters"
                            value={taskForm.description}
                            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />

                        <Grid container spacing={2}>
                            {!isShelter && (
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Mission Type"
                                        value={taskForm.task_type}
                                        onChange={(e) => setTaskForm({ ...taskForm, task_type: e.target.value })}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    >
                                        <MenuItem value="OTHER">Other</MenuItem>
                                        <MenuItem value="SHELTER">Shelter Support</MenuItem>
                                        <MenuItem value="COMMUNITY">Community Ops</MenuItem>
                                        <MenuItem value="EVENT">Tactical Support</MenuItem>
                                    </TextField>
                                </Grid>
                            )}
                            {(taskForm.task_type === 'SHELTER' || isShelter) && (
                                <Grid item xs={isShelter ? 12 : 6}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Nexus Point (Shelter)"
                                        value={taskForm.shelter}
                                        onChange={(e) => setTaskForm({ ...taskForm, shelter: e.target.value })}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    >
                                        <MenuItem value=""><em>Select Shelter</em></MenuItem>
                                        {shelters.map((s: any) => (
                                            <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            )}
                        </Grid>

                        <TextField
                            fullWidth
                            label="Target Location"
                            value={taskForm.location}
                            onChange={(e) => setTaskForm({ ...taskForm, location: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Priority Magnitude"
                                    value={taskForm.priority}
                                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                >
                                    <MenuItem value="LOW">Low</MenuItem>
                                    <MenuItem value="MEDIUM">Medium</MenuItem>
                                    <MenuItem value="HIGH">High</MenuItem>
                                    <MenuItem value="URGENT">Urgent</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Deadline"
                                    InputLabelProps={{ shrink: true }}
                                    value={taskForm.due_date}
                                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            </Grid>
                        </Grid>

                        {isManagement && (
                            <TextField
                                fullWidth
                                select
                                label="Operative Deployment"
                                SelectProps={{
                                    multiple: true,
                                    renderValue: (selected: any) => (selected as string[]).map(id => volunteers.find((v: any) => v.id === id)?.full_name).join(', ')
                                }}
                                value={taskForm.assignees}
                                onChange={(e) => setTaskForm({ ...taskForm, assignees: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            >
                                {volunteers.map((v: any) => (
                                    <MenuItem key={v.id} value={v.id}>{v.full_name}</MenuItem>
                                ))}
                            </TextField>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 0 }}>
                    <Button onClick={() => setTaskDialogOpen(false)} sx={{ fontWeight: 900, color: 'text.disabled' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleAddTask}
                        sx={{
                            borderRadius: 3,
                            px: 4,
                            fontWeight: 900,
                            boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                        }}
                    >
                        Deploy Mission
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Event Creation Dialog */}
            <Dialog
                open={eventDialogOpen}
                onClose={() => setEventDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 6,
                        bgcolor: alpha(theme.palette.background.paper, 0.9),
                        backdropFilter: 'blur(20px)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.1)
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: -0.5 }}>Strategic Event Hub</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Event Designation"
                            value={eventForm.title}
                            onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Briefing Overview"
                            value={eventForm.description}
                            onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Classification"
                                    value={eventForm.event_type}
                                    onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                >
                                    <MenuItem value="TRAINING">Training</MenuItem>
                                    <MenuItem value="FUNDRAISER">Fundraiser</MenuItem>
                                    <MenuItem value="COMMUNITY">Community Service</MenuItem>
                                    <MenuItem value="MEETING">Tactical Meeting</MenuItem>
                                    <MenuItem value="OTHER">Classified</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Nexus Point (Location)"
                                    value={eventForm.location}
                                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    type="datetime-local"
                                    label="Commencement"
                                    InputLabelProps={{ shrink: true }}
                                    value={eventForm.start_datetime}
                                    onChange={(e) => setEventForm({ ...eventForm, start_datetime: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    type="datetime-local"
                                    label="Conclusion"
                                    InputLabelProps={{ shrink: true }}
                                    value={eventForm.end_datetime}
                                    onChange={(e) => setEventForm({ ...eventForm, end_datetime: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 1, opacity: 0.1 }} />
                        <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.disabled', letterSpacing: 1 }}>Broadcast Range</Typography>
                        <FormGroup row sx={{ gap: 2 }}>
                            <FormControlLabel
                                control={<Checkbox checked={eventForm.post_to_volunteers} onChange={(e) => setEventForm({ ...eventForm, post_to_volunteers: e.target.checked })} color="primary" />}
                                label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Operatives</Typography>}
                            />
                            <FormControlLabel
                                control={<Checkbox checked={eventForm.post_to_donors} onChange={(e) => setEventForm({ ...eventForm, post_to_donors: e.target.checked })} color="primary" />}
                                label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Benefactors</Typography>}
                            />
                            <FormControlLabel
                                control={<Checkbox checked={eventForm.post_to_shelters} onChange={(e) => setEventForm({ ...eventForm, post_to_shelters: e.target.checked })} color="primary" />}
                                label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Nexus Nodes</Typography>}
                            />
                        </FormGroup>

                        <Box sx={{ mt: 1 }}>
                            <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.disabled', letterSpacing: 1, mb: 1, display: 'block' }}>Visual Intelligence (Photos)</Typography>
                            <ImageGallery
                                images={eventPhotoPreviews}
                                onAdd={handleEventGalleryAdd}
                                onDelete={handleEventGalleryDelete}
                                maxImages={10}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 0 }}>
                    <Button onClick={() => {
                        setEventDialogOpen(false);
                        setIsEditingEvent(false);
                        setEditingEventId(null);
                    }} sx={{ fontWeight: 900, color: 'text.disabled' }}>Abort</Button>
                    <Button
                        variant="contained"
                        onClick={handleAddEvent}
                        sx={{
                            borderRadius: 3,
                            px: 4,
                            fontWeight: 900,
                            boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                        }}
                    >
                        {isEditingEvent ? 'Update Engagement' : 'Launch Event'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Participants Dialog */}
            <Dialog
                open={participantsDialogOpen}
                onClose={() => setParticipantsDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 6,
                        bgcolor: alpha(theme.palette.background.paper, 0.9),
                        backdropFilter: 'blur(20px)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.1)
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: -0.5 }}>
                    Missions Personnel: {activeEventForParticipants?.title}
                </DialogTitle>
                <DialogContent>
                    {participantsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                    ) : (
                        <List sx={{ pt: 2 }}>
                            {participants.map((p: any) => (
                                <ListItem
                                    key={p.id}
                                    sx={{
                                        mb: 1,
                                        borderRadius: 3,
                                        bgcolor: alpha(theme.palette.background.paper, 0.4),
                                        border: '1px solid',
                                        borderColor: alpha(theme.palette.divider, 0.05)
                                    }}
                                >
                                    <ListItemIcon>
                                        <Avatar
                                            src={p.account_details?.profile_picture}
                                            sx={{ width: 45, height: 45, border: '2px solid', borderColor: 'primary.main' }}
                                        >
                                            {p.full_name[0]}
                                        </Avatar>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={<Typography sx={{ fontWeight: 800 }}>{p.full_name}</Typography>}
                                        secondary={<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.disabled' }}>{p.email}</Typography>}
                                        sx={{ ml: 2 }}
                                    />
                                </ListItem>
                            ))}
                            {participants.length === 0 && (
                                <Box sx={{ py: 6, textAlign: 'center', opacity: 0.5 }}>
                                    <People sx={{ fontSize: 48, mb: 2 }} />
                                    <Typography sx={{ fontWeight: 700 }}>No operative data synchronized.</Typography>
                                </Box>
                            )}
                        </List>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 0 }}>
                    <Button onClick={() => setParticipantsDialogOpen(false)} sx={{ fontWeight: 900, color: 'text.disabled' }}>Dismiss</Button>
                </DialogActions>
            </Dialog>

            {/* Volunteer Profile Dialog (Admin View) */}
            <Dialog
                open={profileDialogOpen}
                onClose={() => setProfileDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 8,
                        bgcolor: alpha(theme.palette.background.paper, 0.95),
                        backdropFilter: 'blur(30px)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.1),
                        overflow: 'hidden'
                    }
                }}
            >
                {viewingVolunteer && (
                    <>
                        <Box sx={{
                            p: 3,
                            px: 4,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Decorative elements */}
                            <Box sx={{
                                position: 'absolute',
                                top: -50,
                                right: -50,
                                width: 200,
                                height: 200,
                                borderRadius: '50%',
                                bgcolor: 'rgba(255,255,255,0.05)',
                                zIndex: 0
                            }} />

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative', zIndex: 1 }}>
                                <Avatar
                                    src={viewingVolunteer.account_details?.profile_picture}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        border: '4px solid rgba(255,255,255,0.2)',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    <Typography variant="h3">{viewingVolunteer.full_name[0]}</Typography>
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>{viewingVolunteer.full_name}</Typography>
                                    <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                                        <Chip
                                            label={viewingVolunteer.account_details?.role?.toUpperCase() || 'OPERATIVE'}
                                            size="small"
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.15)',
                                                backdropFilter: 'blur(10px)',
                                                color: 'white',
                                                fontWeight: 900,
                                                letterSpacing: 1,
                                                fontSize: '0.65rem'
                                            }}
                                        />
                                        {viewingVolunteer.account_details?.is_verified && (
                                            <Chip
                                                icon={<Verified sx={{ color: 'white !important', fontSize: '1rem' }} />}
                                                label="AUTHENTICATED"
                                                size="small"
                                                sx={{
                                                    bgcolor: 'rgba(255,255,255,0.15)',
                                                    backdropFilter: 'blur(10px)',
                                                    color: 'white',
                                                    fontWeight: 900,
                                                    letterSpacing: 1,
                                                    fontSize: '0.65rem'
                                                }}
                                            />
                                        )}
                                    </Stack>
                                </Box>
                            </Box>
                        </Box>
                        <DialogContent sx={{ p: 4 }}>
                            <Grid container spacing={6}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 900, letterSpacing: 2 }}>System Credentials</Typography>
                                    <List sx={{ mt: 1 }}>
                                        <ListItem disablePadding sx={{ mb: 2 }}>
                                            <ListItemIcon sx={{ minWidth: 40 }}><Email sx={{ color: 'primary.main' }} /></ListItemIcon>
                                            <ListItemText
                                                primary={<Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800 }}>COMMUNICATION NODE</Typography>}
                                                secondary={<Typography sx={{ fontWeight: 700 }}>{viewingVolunteer.email}</Typography>}
                                            />
                                        </ListItem>
                                        <ListItem disablePadding sx={{ mb: 2 }}>
                                            <ListItemIcon sx={{ minWidth: 40 }}><Phone sx={{ color: 'primary.main' }} /></ListItemIcon>
                                            <ListItemText
                                                primary={<Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800 }}>SECURE TELEPHONY</Typography>}
                                                secondary={<Typography sx={{ fontWeight: 700 }}>{viewingVolunteer.phone_number || 'UNLISTED'}</Typography>}
                                            />
                                        </ListItem>
                                        <ListItem disablePadding>
                                            <ListItemIcon sx={{ minWidth: 40 }}><Schedule sx={{ color: 'primary.main' }} /></ListItemIcon>
                                            <ListItemText
                                                primary={<Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800 }}>ENLISTMENT DATE</Typography>}
                                                secondary={<Typography sx={{ fontWeight: 700 }}>{new Date(viewingVolunteer.account_details?.date_joined || viewingVolunteer.join_date).toLocaleDateString(undefined, { dateStyle: 'long' }).toUpperCase()}</Typography>}
                                            />
                                        </ListItem>
                                    </List>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 900, letterSpacing: 2 }}>Operational Metrics</Typography>
                                    <Box sx={{ mt: 2, display: 'flex', gap: 3 }}>
                                        <Paper sx={{
                                            p: 3,
                                            flex: 1,
                                            textAlign: 'center',
                                            borderRadius: 5,
                                            bgcolor: alpha(theme.palette.primary.main, 0.03),
                                            border: '1px solid',
                                            borderColor: alpha(theme.palette.primary.main, 0.1)
                                        }}>
                                            <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main' }}>{viewingVolunteer.total_hours}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, letterSpacing: 1 }}>SERVICE HRS</Typography>
                                        </Paper>
                                        <Paper sx={{
                                            p: 3,
                                            flex: 1,
                                            textAlign: 'center',
                                            borderRadius: 5,
                                            bgcolor: alpha(theme.palette.secondary.main, 0.03),
                                            border: '1px solid',
                                            borderColor: alpha(theme.palette.secondary.main, 0.1)
                                        }}>
                                            <Typography variant="h3" sx={{ fontWeight: 900, color: 'secondary.main' }}>{viewingVolunteer.tasks_completed}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, letterSpacing: 1 }}>MISSIONS OPS</Typography>
                                        </Paper>
                                    </Box>
                                    <Box sx={{ mt: 4 }}>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, letterSpacing: 1, mb: 1.5, display: 'block' }}>SPECIALIZED SKILLSET</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {viewingVolunteer.skills?.split(',').map((skill: string, idx: number) => (
                                                <Chip
                                                    key={idx}
                                                    label={skill.trim().toUpperCase()}
                                                    size="small"
                                                    sx={{
                                                        borderRadius: 1.5,
                                                        fontWeight: 900,
                                                        fontSize: '0.6rem',
                                                        bgcolor: alpha(theme.palette.divider, 0.05),
                                                        borderColor: alpha(theme.palette.divider, 0.1)
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 1, opacity: 0.1 }} />
                                    <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 900, letterSpacing: 2 }}>Deployment Status</Typography>
                                    <Stack direction="row" spacing={4} sx={{ mt: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: viewingVolunteer.account_details?.is_active ? 'success.main' : 'error.main' }} />
                                            <Typography sx={{ fontWeight: 800, fontSize: '0.85rem' }}>{viewingVolunteer.account_details?.is_active ? 'ACTIVE DUTY' : 'SUSPENDED'}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <AdminPanelSettings sx={{ color: 'info.main', fontSize: '1.2rem' }} />
                                            <Typography sx={{ fontWeight: 800, fontSize: '0.85rem' }}>BASE: {viewingVolunteer.county?.toUpperCase()}, {viewingVolunteer.city?.toUpperCase() || 'NAIROBI'}</Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 4, px: 6, bgcolor: alpha(theme.palette.divider, 0.02), borderTop: '1px solid', borderColor: alpha(theme.palette.divider, 0.05) }}>
                            <Button onClick={() => setProfileDialogOpen(false)} sx={{ fontWeight: 900, color: 'text.disabled' }}>Dismiss</Button>
                            {isAdmin && (
                                <Button
                                    variant="contained"
                                    color="warning"
                                    sx={{
                                        borderRadius: 3,
                                        fontWeight: 900,
                                        boxShadow: `0 8px 16px ${alpha(theme.palette.warning.main, 0.2)}`
                                    }}
                                >
                                    Modify Clearances
                                </Button>
                            )}
                        </DialogActions>
                    </>
                )}
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
                        borderRadius: 4,
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        backdropFilter: 'blur(10px)',
                        bgcolor: alpha(
                            snackbar.severity === 'success' ? theme.palette.success.main :
                                snackbar.severity === 'error' ? theme.palette.error.main :
                                    theme.palette.info.main,
                            0.9
                        )
                    }}
                >
                    {snackbar.message.toUpperCase()}
                </Alert>
            </Snackbar>
        </Box>
    );
}
