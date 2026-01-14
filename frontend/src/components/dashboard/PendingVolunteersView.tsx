/**
 * Pending Volunteers Review Component
 * Admin interface to approve/reject volunteer applications
 * Styled with HomePage gradient aesthetic
 */

import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    alpha,
    useTheme,
    CircularProgress,
    Alert,
    Stack
} from '@mui/material';
import {
    CheckCircle,
    Cancel,
    Visibility
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient, { endpoints } from '../../api/client';

interface VolunteerTask {
    id: string;
    title: string;
    description: string;
    campaign: any;
    status: string;
    skills: string[];
    availability: string[];
    volunteer_name: string;
    volunteer_email: string;
    volunteer_phone: string;
    experience: string;
    motivation: string;
    created_at: string;
}

export default function PendingVolunteersView() {
    const theme = useTheme();

    const [tasks, setTasks] = useState<VolunteerTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<VolunteerTask | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(endpoints.volunteers.tasks, {
                params: { status: 'OPEN' } // Pending volunteer requests
            });
            setTasks(response.data.results || response.data);
        } catch (err) {
            console.error('Failed to fetch volunteer tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (taskId: string) => {
        setProcessing(true);
        setError('');
        try {
            await apiClient.post(`${endpoints.volunteers.tasks}${taskId}/approve/`);
            setSuccess('Volunteer approved and assigned!');
            fetchTasks();
            setDetailsOpen(false);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to approve volunteer');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (taskId: string) => {
        setProcessing(true);
        setError('');
        try {
            await apiClient.post(`${endpoints.volunteers.tasks}${taskId}/reject/`);
            setSuccess('Volunteer application rejected');
            fetchTasks();
            setDetailsOpen(false);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to reject volunteer');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            sx={{
                minHeight: '100vh',
                background: theme.palette.mode === 'dark'
                    ? `radial-gradient(circle at 20% 30%, ${alpha(theme.palette.success.dark, 0.3)} 0%, transparent 50%), #0f172a`
                    : `radial-gradient(circle at 20% 30%, ${alpha(theme.palette.success.light, 0.15)} 0%, transparent 50%), #f8fafc`,
                pt: 4,
                pb: 8
            }}
        >
            <Container maxWidth="xl">
                <Box sx={{ mb: 6 }}>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 900,
                            mb: 1,
                            background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.info.main})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        🤝 Pending Volunteers
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Review volunteer applications and assign to campaigns
                    </Typography>
                </Box>

                <AnimatePresence>
                    {success && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setSuccess('')}>
                                {success}
                            </Alert>
                        </motion.div>
                    )}
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setError('')}>
                                {error}
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>

                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: 6,
                        background: alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: 'blur(20px)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.5),
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                                <TableCell sx={{ fontWeight: 700 }}>Volunteer</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Campaign</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Skills</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Availability</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Applied</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : tasks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <Typography color="text.secondary">
                                            No pending volunteer applications
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tasks.map((task) => (
                                    <TableRow key={task.id} sx={{ '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.02) } }}>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {task.volunteer_name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {task.volunteer_email}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {task.campaign?.title || task.title}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {task.skills?.slice(0, 2).map((skill, i) => (
                                                    <Chip key={i} label={skill} size="small" sx={{ borderRadius: 2 }} />
                                                ))}
                                                {task.skills?.length > 2 && (
                                                    <Chip label={`+${task.skills.length - 2}`} size="small" variant="outlined" />
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption">
                                                {task.availability?.[0] || 'Flexible'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption" color="text.secondary">
                                                {(() => {
                                                    if (!task.created_at) return 'N/A';
                                                    const date = new Date(task.created_at);
                                                    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
                                                })()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setSelectedTask(task);
                                                    setDetailsOpen(true);
                                                }}
                                                sx={{ mr: 1 }}
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleApprove(task.id)}
                                                color="success"
                                                sx={{ mr: 1 }}
                                            >
                                                <CheckCircle fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleReject(task.id)}
                                                color="error"
                                            >
                                                <Cancel fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>

            {/* Details Dialog */}
            <Dialog
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                {selectedTask && (
                    <>
                        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid', borderColor: 'divider' }}>
                            Volunteer Application Details
                        </DialogTitle>
                        <DialogContent sx={{ pt: 3 }}>
                            <Stack spacing={3}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Volunteer Name</Typography>
                                    <Typography variant="h6" fontWeight={600}>{selectedTask.volunteer_name}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Email</Typography>
                                        <Typography variant="body2">{selectedTask.volunteer_email}</Typography>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Phone</Typography>
                                        <Typography variant="body2">{selectedTask.volunteer_phone || 'Not provided'}</Typography>
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Skills</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                        {selectedTask.skills?.map((skill, i) => (
                                            <Chip key={i} label={skill} color="primary" variant="outlined" />
                                        ))}
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Availability</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                        {selectedTask.availability?.map((time, i) => (
                                            <Chip key={i} label={time} color="success" variant="outlined" size="small" />
                                        ))}
                                    </Box>
                                </Box>
                                {selectedTask.experience && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Experience</Typography>
                                        <Typography variant="body2" sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, mt: 1 }}>
                                            {selectedTask.experience}
                                        </Typography>
                                    </Box>
                                )}
                                {selectedTask.motivation && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Why They Want to Volunteer</Typography>
                                        <Typography variant="body2" sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, mt: 1, fontStyle: 'italic' }}>
                                            "{selectedTask.motivation}"
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Button onClick={() => setDetailsOpen(false)}>Close</Button>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => handleReject(selectedTask.id)}
                                disabled={processing}
                                startIcon={<Cancel />}
                            >
                                Reject
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => handleApprove(selectedTask.id)}
                                disabled={processing}
                                startIcon={processing ? <CircularProgress size={20} /> : <CheckCircle />}
                            >
                                {processing ? 'Processing...' : 'Approve & Assign'}
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}
