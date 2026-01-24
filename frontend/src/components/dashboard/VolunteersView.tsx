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
import { Person, Assignment, Event as EventIcon, Schedule, School, Verified, Add, AccessTime, Email, Phone, AdminPanelSettings, OpenInNew, Delete, People, Edit } from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import { fetchVolunteers, fetchTasks, fetchEvents, logTimeEntry, addTask, addEvent, updateEvent, deleteEvent, registerForEvent, unregisterFromEvent, fetchTimeLogs, fetchShelters, createTaskApplication, deleteTask, fetchEventParticipants } from '../../features/volunteers/volunteersSlice';
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

    const trainings: any[] = [];

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

    const StatusChip = ({ status }: { status: string }) => (
        <Chip
            label={status}
            size="small"
            sx={{
                fontWeight: 600,
                borderRadius: '6px',
                bgcolor: status === 'ACTIVE' || status === 'COMPLETED' || status === 'VERIFIED' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.warning.main, 0.1),
                color: status === 'ACTIVE' || status === 'COMPLETED' || status === 'VERIFIED' ? 'success.dark' : 'warning.dark'
            }}
        />
    );

    const renderVolunteerList = () => (
        <Paper sx={{ p: 0, borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), boxShadow: theme.shadows[1], overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">Volunteer Registry</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenDialog?.(true)}
                    sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, boxShadow: theme.shadows[2] }}
                >
                    Add Volunteer
                </Button>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Volunteer</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Service</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {volunteers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((v: any) => (
                            <TableRow key={v.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 'bold' }}>
                                            {v.full_name?.[0]}
                                        </Avatar>
                                        <Typography variant="body2" fontWeight="600">{v.full_name}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{v.email}</TableCell>
                                <TableCell>
                                    <StatusChip status={v.status} />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 500 }}>{v.total_hours} hrs</TableCell>
                                <TableCell align="right">
                                    <Tooltip title="View Full Profile">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleViewProfile(v)}
                                            color="primary"
                                        >
                                            <OpenInNew fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Button
                                        size="small"
                                        startIcon={<AccessTime />}
                                        sx={{ ml: 1, borderRadius: 2, textTransform: 'none' }}
                                        onClick={() => handleOpenTimeLog(v)}
                                    >
                                        Log Time
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {volunteers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    No volunteers found
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" fontWeight="bold">
                            {isVolunteer ? 'My Assignments' : 'All Tasks'}
                        </Typography>
                        {(isManagement || isShelter) && (
                            <Button variant="outlined" size="small" onClick={() => setTaskDialogOpen(true)} startIcon={<Add />}>New Task</Button>
                        )}
                    </Box>
                    {displayedTasks.map((task: any) => (
                        <Card key={task.id} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{task.title}</Typography>
                                    <StatusChip status={task.status} />
                                </Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {task.location || task.shelter_name || 'No location'}
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1 }}>
                                    <Chip
                                        label={task.priority}
                                        size="small"
                                        sx={{
                                            bgcolor: task.priority === 'HIGH' || task.priority === 'URGENT' ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.info.main, 0.1),
                                            color: task.priority === 'HIGH' || task.priority === 'URGENT' ? 'error.dark' : 'info.dark',
                                            fontWeight: 600,
                                            height: 20,
                                            fontSize: '0.65rem'
                                        }}
                                    />
                                    <Chip label={`Due: ${task.due_date || 'N/A'}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                                </Stack>
                                <Typography variant="caption" display="block" color="text.secondary">
                                    Assignee: {task.assignees_details?.map((a: any) => a.name).join(', ') || 'Unassigned'}
                                </Typography>
                                {isManagement && (
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => handleDeleteTask(task.id)}
                                            startIcon={<Delete fontSize="small" />}
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                    {displayedTasks.length === 0 && (
                        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>No tasks found.</Typography>
                    )}

                    {/* Available Opportunities for Volunteers on Mobile */}
                    {isVolunteer && openTasks.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Opportunities</Typography>
                            {openTasks.map((task: any) => (
                                <Card key={task.id} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 2 }}>
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Typography variant="subtitle2" fontWeight="bold">{task.title}</Typography>
                                        <Typography variant="caption" color="text.secondary" gutterBottom>{task.location || 'General'}</Typography>
                                        <Box sx={{ mt: 1 }}>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                fullWidth
                                                onClick={() => handleApply(task.id)}
                                                disabled={task.has_applied}
                                            >
                                                {task.has_applied ? "Applied" : "Get Involved"}
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
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
            <Paper sx={{ p: 0, borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), boxShadow: theme.shadows[1], overflow: 'hidden' }}>
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" fontWeight="bold">
                        {isVolunteer ? 'My Tasks & Opportunities' : 'Task Management'}
                    </Typography>
                    {(isManagement || isShelter) && (
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setTaskDialogOpen(true)}
                            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, boxShadow: theme.shadows[2] }}
                        >
                            {isShelter ? 'Request Help' : 'New Task'}
                        </Button>
                    )}
                </Box>

                <Box sx={{ p: 0 }}>
                    {/* Volunteer View: Available Opportunities */}
                    {isVolunteer && (
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle1" sx={{ px: 3, py: 2, bgcolor: alpha(theme.palette.secondary.main, 0.05), borderBottom: '1px solid', borderColor: 'divider', fontWeight: 700 }}>
                                Available Opportunities
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Task</TableCell>
                                            <TableCell>Location</TableCell>
                                            <TableCell>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {openTasks.map((task: any) => (
                                            <TableRow key={task.id}>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="bold">{task.title}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{task.description?.substring(0, 50)}...</Typography>
                                                </TableCell>
                                                <TableCell>{task.location || task.shelter_name || 'General'}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="small"
                                                        variant={task.has_applied ? "text" : "outlined"}
                                                        disabled={task.has_applied}
                                                        onClick={() => handleApply(task.id)}
                                                        color={task.has_applied ? "info" : "primary"}
                                                    >
                                                        {task.has_applied ? "Applied" : "Get Involved"}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {openTasks.length === 0 && <TableRow><TableCell colSpan={3} align="center">No open tasks available.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}

                    {/* Main Task List (My Tasks or All Tasks) */}
                    <Typography variant="subtitle1" sx={{ px: 3, py: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderBottom: '1px solid', borderColor: 'divider', fontWeight: 700 }}>
                        {isVolunteer ? 'My Assignments' : 'All Tasks'}
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Assignee</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                                    {isManagement && <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(isVolunteer ? myTasks : tasks).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((task: any) => (
                                    <TableRow key={task.id} hover>
                                        <TableCell sx={{ fontWeight: 600 }}>{task.title}</TableCell>
                                        <TableCell>{task.assignees_details?.map((a: any) => a.name).join(', ') || 'Unassigned'}</TableCell>
                                        <TableCell>{task.due_date || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={task.priority}
                                                size="small"
                                                sx={{
                                                    fontWeight: 600,
                                                    bgcolor: task.priority === 'HIGH' || task.priority === 'URGENT' ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.info.main, 0.1),
                                                    color: task.priority === 'HIGH' || task.priority === 'URGENT' ? 'error.dark' : 'info.dark',
                                                    borderRadius: '6px'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell><StatusChip status={task.status} /></TableCell>
                                        <TableCell>{task.location || task.shelter_name || '-'}</TableCell>
                                        {isManagement && (
                                            <TableCell align="right">
                                                <Tooltip title="Delete Task">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteTask(task.id)}
                                                    >
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                                {(isVolunteer ? myTasks : tasks).length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={isManagement ? 7 : 6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                            No tasks found.
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
                    />
                </Box>
            </Paper>
        );
    };

    const renderEvents = () => (
        <Paper sx={{ p: 0, borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), boxShadow: theme.shadows[1], overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">Community Events</Typography>
                {isManagement && (
                    <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => setEventDialogOpen(true)}
                        sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
                    >
                        Create Event
                    </Button>
                )}
            </Box>
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Event Title</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Venue</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Participants</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {events.filter((e: any) => isManagement || e.is_active).slice(eventPage * eventRowsPerPage, eventPage * eventRowsPerPage + eventRowsPerPage).map((event: any) => (
                            <TableRow key={event.id} hover>
                                <TableCell sx={{ fontWeight: 600 }}>{event.title}</TableCell>
                                <TableCell>
                                    <Chip label={event.event_type} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                                </TableCell>
                                <TableCell>{event.location}</TableCell>
                                <TableCell>{new Date(event.start_datetime).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={`${event.registered_count || 0} Joined`}
                                        size="small"
                                        onClick={isManagement ? () => handleViewParticipants(event) : undefined}
                                        sx={{ cursor: isManagement ? 'pointer' : 'default', bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.dark', fontWeight: 'bold' }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    {isVolunteer && (
                                        event.is_registered ? (
                                            <Button size="small" variant="outlined" color="error" onClick={() => handleUnregister(event.id)}>Leave</Button>
                                        ) : (
                                            <Button size="small" variant="contained" color="primary" onClick={() => handleRegister(event.id)} disabled={event.is_full}>Join</Button>
                                        )
                                    )}
                                    {isManagement && (
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                            <Tooltip title="Participants"><IconButton size="small" onClick={() => handleViewParticipants(event)}><People fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEditEvent(event)} color="primary"><Edit fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDeleteEvent(event.id)} color="error"><Delete fontSize="small" /></IconButton></Tooltip>
                                        </Box>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {events.filter((e: any) => isManagement || e.is_active).length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                    No upcoming community events.
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
            />
        </Paper>
    );

    const renderTimeLogs = () => {
        // Get current volunteer's ID
        const currentVolunteerId = volunteers.find((v: any) => v.email === user?.email)?.id;

        // Filter time logs to show only volunteer's own logs if they're a volunteer
        const displayedLogs = isVolunteer && currentVolunteerId
            ? timeLogs.filter((log: any) => log.volunteer === currentVolunteerId)
            : timeLogs;

        return (
            <Paper sx={{ p: 0, borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), boxShadow: theme.shadows[1], overflow: 'hidden' }}>
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" fontWeight="bold">
                        {isVolunteer ? 'My Time Logs' : 'Time Track Logs'}
                    </Typography>
                    {isManagement && (
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => {
                                setSelectedVolunteer(null);
                                setTimeLogOpen(true);
                            }}
                            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
                        >
                            New Entry
                        </Button>
                    )}
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                            <TableRow>
                                {!isVolunteer && <TableCell sx={{ fontWeight: 600 }}>Volunteer</TableCell>}
                                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Activity</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayedLogs.slice(logPage * logRowsPerPage, logPage * logRowsPerPage + logRowsPerPage).map((log: any, i: number) => (
                                <TableRow key={log.id || i} hover>
                                    {!isVolunteer && <TableCell sx={{ fontWeight: 600 }}>{log.volunteer_name}</TableCell>}
                                    <TableCell>{log.date}</TableCell>
                                    <TableCell>{log.hours} hrs</TableCell>
                                    <TableCell>{log.description}</TableCell>
                                    <TableCell><StatusChip status={log.status} /></TableCell>
                                </TableRow>
                            ))}
                            {displayedLogs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={isVolunteer ? 4 : 5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                        No time entries recorded.
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
                />
            </Paper>
        );
    };

    const renderTrainings = () => (
        <Paper sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), boxShadow: theme.shadows[1] }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Training Academy</Typography>
                {isManagement && (
                    <Button
                        variant="outlined"
                        startIcon={<School />}
                        onClick={() => setSnackbar({ open: true, message: 'Synchronizing with Training Academy servers...', severity: 'info' })}
                        sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
                    >
                        Program Schedule
                    </Button>
                )}
            </Box>
            <Grid container spacing={3}>
                {trainings && trainings.map((t: any, i: number) => (
                    <Grid item xs={12} md={4} key={i}>
                        <Card variant="outlined" sx={{
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            transition: 'all 0.2s',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4] }
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2" fontWeight="bold">{t.title}</Typography>
                                    <Verified sx={{ color: t.is_active ? 'success.main' : 'action.disabled' }} fontSize="small" />
                                </Box>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                                    {new Date(t.created_at).toLocaleDateString()} • {t.completion_count || 0} Completions
                                </Typography>
                                <StatusChip status={t.is_active ? 'ACTIVE' : 'INACTIVE'} />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
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
        { id: 'volunteers', label: 'Registry', icon: <Person />, component: renderVolunteerList(), hidden: !isManagement },
        { id: 'tasks', label: 'Tasks', icon: <Assignment />, component: renderTasks() },
        { id: 'events', label: 'Events', icon: <EventIcon />, component: renderEvents() },
        { id: 'time_logs', label: 'Time Logs', icon: <Schedule />, component: renderTimeLogs() },
        { id: 'trainings', label: 'Trainings', icon: <School />, component: renderTrainings() },
    ];

    const tabs = tabsSource.filter(tab => !tab.hidden);

    return (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <StatsCard
                        title="Active Volunteers"
                        value={volunteers.length}
                        icon={<Person />}
                        color={theme.palette.primary.main}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatsCard
                        title="Pending Tasks"
                        value={tasks.filter((t: any) => t.status === 'PENDING').length}
                        icon={<Assignment />}
                        color={theme.palette.secondary.main}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatsCard
                        title="Upcoming Events"
                        value={events.length}
                        icon={<EventIcon />}
                        color={theme.palette.success.main} // Or a specific event color
                    />
                </Grid>
            </Grid>

            <SubTabView title="Volunteer Engagement" tabs={tabs} activeTab={activeTab} />

            {/* Time Log Dialog */}
            <Dialog
                open={timeLogOpen}
                onClose={() => setTimeLogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        p: 0.5,
                        boxShadow: theme.shadows[8]
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, textAlign: 'center' }}>Log Service Hours</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <Typography variant="body2" color="text.secondary" align="center">
                            {selectedVolunteer ? (
                                <>Logging activity for <strong>{selectedVolunteer?.full_name}</strong></>
                            ) : (
                                "Record service hours for a volunteer"
                            )}
                        </Typography>
                        {!selectedVolunteer && (
                            <TextField
                                fullWidth
                                select
                                label="Select Volunteer"
                                value={taskForm.assigned_to} // We can reuse the state or add a new one, taskForm.assigned_to is empty here
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
                            label="Hours Completed"
                            value={timeHours}
                            onChange={(e) => setTimeHours(Number(e.target.value))}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Activity Description"
                            placeholder="Describe the task performed..."
                            value={timeDesc}
                            onChange={(e) => setTimeDesc(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center', gap: 2 }}>
                    <Button onClick={() => setTimeLogOpen(false)} sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleLogTime} sx={{ borderRadius: 2, px: 4, py: 1, fontWeight: 'bold' }}>Submit Log</Button>
                </DialogActions>
            </Dialog>

            {/* Task Assignment Dialog */}
            <Dialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Assign Volunteer Task</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Task Title"
                            value={taskForm.title}
                            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Description"
                            value={taskForm.description}
                            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />

                        {!isShelter && (
                            <TextField
                                fullWidth
                                select
                                label="Task Type"
                                value={taskForm.task_type}
                                onChange={(e) => setTaskForm({ ...taskForm, task_type: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            >
                                <MenuItem value="OTHER">Other</MenuItem>
                                <MenuItem value="SHELTER">Shelter Assistance</MenuItem>
                                <MenuItem value="COMMUNITY">Community Service</MenuItem>
                                <MenuItem value="EVENT">Event Support</MenuItem>
                            </TextField>
                        )}

                        {(taskForm.task_type === 'SHELTER' || isShelter) && (
                            <TextField
                                fullWidth
                                select
                                label="Shelter Home"
                                value={taskForm.shelter}
                                onChange={(e) => setTaskForm({ ...taskForm, shelter: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            >
                                <MenuItem value=""><em>Select Shelter</em></MenuItem>
                                {shelters.map((s: any) => (
                                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                ))}
                            </TextField>
                        )}

                        <TextField
                            fullWidth
                            label="Location/Address"
                            value={taskForm.location}
                            onChange={(e) => setTaskForm({ ...taskForm, location: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Priority"
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
                                    label="Due Date"
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
                                label="Assign To"
                                SelectProps={{
                                    multiple: true,
                                    renderValue: (selected: any) => {
                                        return (selected as string[]).map(id => volunteers.find((v: any) => v.id === id)?.full_name).join(', ');
                                    }
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
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddTask} sx={{ borderRadius: 2, px: 3 }}>Deploy Task</Button>
                </DialogActions>
            </Dialog>

            {/* Event Creation Dialog */}
            <Dialog open={eventDialogOpen} onClose={() => setEventDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Organize Community Event</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Event Title"
                            value={eventForm.title}
                            onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Description"
                            value={eventForm.description}
                            onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <TextField
                            fullWidth
                            select
                            label="Event Type"
                            value={eventForm.event_type}
                            onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        >
                            <MenuItem value="TRAINING">Training</MenuItem>
                            <MenuItem value="FUNDRAISER">Fundraiser</MenuItem>
                            <MenuItem value="COMMUNITY">Community Service</MenuItem>
                            <MenuItem value="MEETING">Meeting</MenuItem>
                            <MenuItem value="OTHER">Other</MenuItem>
                        </TextField>
                        <TextField
                            fullWidth
                            label="Location"
                            value={eventForm.location}
                            onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    type="datetime-local"
                                    label="Start Time"
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
                                    label="End Time"
                                    InputLabelProps={{ shrink: true }}
                                    value={eventForm.end_datetime}
                                    onChange={(e) => setEventForm({ ...eventForm, end_datetime: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle2" fontWeight="bold">Post to Dashboards</Typography>
                        <FormGroup row>
                            <FormControlLabel
                                control={<Checkbox checked={eventForm.post_to_volunteers} onChange={(e) => setEventForm({ ...eventForm, post_to_volunteers: e.target.checked })} />}
                                label="Volunteers"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={eventForm.post_to_donors} onChange={(e) => setEventForm({ ...eventForm, post_to_donors: e.target.checked })} />}
                                label="Donors"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={eventForm.post_to_shelters} onChange={(e) => setEventForm({ ...eventForm, post_to_shelters: e.target.checked })} />}
                                label="Shelter Partners"
                            />
                        </FormGroup>

                        <Box sx={{ mt: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Event Photos</Typography>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Event Photos</Typography>
                            <ImageGallery
                                images={eventPhotoPreviews}
                                onAdd={handleEventGalleryAdd}
                                onDelete={handleEventGalleryDelete}
                                maxImages={10}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => {
                        setEventDialogOpen(false);
                        setIsEditingEvent(false);
                        setEditingEventId(null);
                    }}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddEvent} sx={{ borderRadius: 2, px: 3 }}>
                        {isEditingEvent ? 'Update Event' : 'Create Event'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Participants Dialog */}
            <Dialog open={participantsDialogOpen} onClose={() => setParticipantsDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    Event Participants: {activeEventForParticipants?.title}
                </DialogTitle>
                <DialogContent>
                    {participantsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                    ) : (
                        <List>
                            {participants.map((p: any) => (
                                <ListItem key={p.id}>
                                    <ListItemIcon>
                                        <Avatar src={p.account_details?.profile_picture}>{p.full_name[0]}</Avatar>
                                    </ListItemIcon>
                                    <ListItemText primary={p.full_name} secondary={p.email} />
                                </ListItem>
                            ))}
                            {participants.length === 0 && (
                                <Typography align="center" color="text.secondary" sx={{ py: 2 }}>No participants yet.</Typography>
                            )}
                        </List>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setParticipantsDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Volunteer Profile Dialog (Admin View) */}
            <Dialog
                open={profileDialogOpen}
                onClose={() => setProfileDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
            >
                {viewingVolunteer && (
                    <>
                        <Box sx={{
                            p: 4,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            color: 'white',
                            position: 'relative'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Avatar
                                    src={viewingVolunteer.account_details?.profile_picture}
                                    sx={{ width: 100, height: 100, border: '4px solid white', boxShadow: theme.shadows[4] }}
                                >
                                    {viewingVolunteer.full_name[0]}
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">{viewingVolunteer.full_name}</Typography>
                                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                        <Chip
                                            label={viewingVolunteer.account_details?.role || 'VOLUNTEER'}
                                            size="small"
                                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
                                        />
                                        {viewingVolunteer.account_details?.is_verified && (
                                            <Chip
                                                icon={<Verified sx={{ color: 'white !important' }} />}
                                                label="Verified Account"
                                                size="small"
                                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                            />
                                        )}
                                    </Stack>
                                </Box>
                            </Box>
                        </Box>
                        <DialogContent sx={{ p: 4 }}>
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="overline" color="text.secondary" fontWeight="bold">Account Credentials</Typography>
                                    <List>
                                        <ListItem disablePadding sx={{ mb: 1 }}>
                                            <ListItemIcon><Email color="primary" /></ListItemIcon>
                                            <ListItemText
                                                primary="Email Address"
                                                secondary={viewingVolunteer.email}
                                            />
                                        </ListItem>
                                        <ListItem disablePadding sx={{ mb: 1 }}>
                                            <ListItemIcon><Phone color="primary" /></ListItemIcon>
                                            <ListItemText
                                                primary="Phone Number"
                                                secondary={viewingVolunteer.phone_number || 'Not provided'}
                                            />
                                        </ListItem>
                                        <ListItem disablePadding sx={{ mb: 1 }}>
                                            <ListItemIcon><Schedule color="primary" /></ListItemIcon>
                                            <ListItemText
                                                primary="Member Since"
                                                secondary={new Date(viewingVolunteer.account_details?.date_joined || viewingVolunteer.join_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                            />
                                        </ListItem>
                                    </List>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="overline" color="text.secondary" fontWeight="bold">Service & Metrics</Typography>
                                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                        <Paper variant="outlined" sx={{ p: 2, flex: 1, textAlign: 'center', borderRadius: 3 }}>
                                            <Typography variant="h4" fontWeight="bold" color="primary">{viewingVolunteer.total_hours}</Typography>
                                            <Typography variant="caption" color="text.secondary">Total Hours</Typography>
                                        </Paper>
                                        <Paper variant="outlined" sx={{ p: 2, flex: 1, textAlign: 'center', borderRadius: 3 }}>
                                            <Typography variant="h4" fontWeight="bold" color="secondary">{viewingVolunteer.tasks_completed}</Typography>
                                            <Typography variant="caption" color="text.secondary">Tasks Completed</Typography>
                                        </Paper>
                                    </Box>
                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Skills & Interests</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {viewingVolunteer.skills?.split(',').map((skill: string, idx: number) => (
                                                <Chip key={idx} label={skill.trim()} size="small" variant="outlined" />
                                            ))}
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="overline" color="text.secondary" fontWeight="bold">System Status</Typography>
                                    <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Verified sx={{ color: viewingVolunteer.account_details?.is_active ? 'success.main' : 'error.main' }} />
                                            <Typography variant="body2">{viewingVolunteer.account_details?.is_active ? 'Account Active' : 'Account Suspended'}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AdminPanelSettings color="info" />
                                            <Typography variant="body2">Origin: {viewingVolunteer.county}, {viewingVolunteer.city || 'Nairobi'}</Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, bgcolor: alpha(theme.palette.grey[500], 0.05) }}>
                            <Button onClick={() => setProfileDialogOpen(false)} sx={{ fontWeight: 'bold' }}>Close Profile</Button>
                            {isAdmin && (
                                <Button variant="contained" color="warning" sx={{ borderRadius: 2, fontWeight: 'bold' }}>
                                    Manage Permissions
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
                <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 3, fontWeight: 600 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
