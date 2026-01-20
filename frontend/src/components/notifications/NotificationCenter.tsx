import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import apiClient from '../../api/client';
import {
    Box,
    Drawer,
    Typography,
    IconButton,
    List,
    Avatar,
    Chip,
    Badge,
    Divider,
    Button,
    alpha,
    useTheme,
    CircularProgress,
    TextField,
    InputAdornment,
    Paper,
    Tooltip
} from '@mui/material';
import {
    Notifications,
    Close,
    VolunteerActivism,
    CheckCircle,
    Info,
    DeleteSweep,
    Search,
    Tune,
    MoreHoriz,
    DoneAll
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
    id: string;
    type: 'success' | 'info' | 'warning' | 'error';
    title: string;
    message: string;
    donor?: string;
    amount?: number;
    time: string;
    read: boolean;
    category?: 'DONATION' | 'VERIFICATION' | 'SYSTEM';
    link?: string;
    metadata?: any;
    created_at?: string;
}

export function NotificationCenter() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        if (user) {
            loadNotifications();
            const interval = setInterval(loadNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const loadNotifications = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const response = await apiClient.get('/auth/notifications/');
            const data = response.data || [];
            const transformed = data.map((n: any) => ({
                id: n.id,
                type: n.type || 'info',
                title: n.title,
                message: n.message,
                read: n.read,
                category: n.category,
                link: n.link,
                metadata: n.metadata,
                time: formatTime(n.created_at),
                created_at: n.created_at
            }));
            setNotifications(transformed);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timestamp: string) => {
        if (!timestamp) return 'Just now';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMs / 3600000);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = async (id: string) => {
        try {
            await apiClient.post('/auth/notifications/', { notification_ids: [id] });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
            if (unreadIds.length === 0) return;
            await apiClient.post('/auth/notifications/', { notification_ids: unreadIds });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        if (notification.link) {
            setOpen(false);
            navigate(notification.link);
        }
    };

    const getIcon = (notification: Notification) => {
        if (notification.category === 'DONATION') return <VolunteerActivism sx={{ color: theme.palette.success.main }} />;
        if (notification.category === 'VERIFICATION') return <CheckCircle sx={{ color: theme.palette.primary.main }} />;
        return <Info sx={{ color: theme.palette.info.main }} />;
    };

    const filteredNotifications = notifications.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || !n.read;
        return matchesSearch && matchesFilter;
    });

    return (
        <>
            <IconButton
                onClick={() => setOpen(true)}
                sx={{
                    color: 'white',
                    p: 1.5,
                    bgcolor: alpha(theme.palette.common.white, 0.05),
                    '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.15), transform: 'scale(1.05)' },
                    transition: 'all 0.2s'
                }}
            >
                <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { fontWeight: 800 } }}>
                    <Notifications />
                </Badge>
            </IconButton>

            <Drawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', sm: 440 },
                        bgcolor: '#f8faf9',
                        boxShadow: '-10px 0 40px rgba(0,0,0,0.1)',
                        borderLeft: '1px solid rgba(0,0,0,0.05)'
                    }
                }}
            >
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ p: 3, pb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: '#1a1a1a' }}>
                                Notifications
                            </Typography>
                            <Box>
                                <Tooltip title="Notification Preferences">
                                    <IconButton size="small"><Tune fontSize="small" /></IconButton>
                                </Tooltip>
                                <IconButton onClick={() => setOpen(false)} size="small" sx={{ ml: 1 }}>
                                    <Close fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>

                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search notifications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 3, bgcolor: 'white' }
                            }}
                            sx={{ mb: 2 }}
                        />

                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <Chip
                                label={`All ${notifications.length}`}
                                onClick={() => setFilter('all')}
                                color={filter === 'all' ? 'primary' : 'default'}
                                sx={{ fontWeight: 700, borderRadius: 2 }}
                            />
                            <Chip
                                label={`Unread ${unreadCount}`}
                                onClick={() => setFilter('unread')}
                                color={filter === 'unread' ? 'primary' : 'default'}
                                sx={{ fontWeight: 700, borderRadius: 2 }}
                            />
                            <Box sx={{ flexGrow: 1 }} />
                            {unreadCount > 0 && (
                                <Button
                                    size="small"
                                    startIcon={<DoneAll />}
                                    onClick={markAllAsRead}
                                    sx={{ fontWeight: 700, textTransform: 'none' }}
                                >
                                    Mark all read
                                </Button>
                            )}
                        </Box>
                    </Box>

                    <Divider sx={{ opacity: 0.5 }} />

                    {/* Notifications List */}
                    <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                        {loading && notifications.length === 0 ? (
                            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                                <CircularProgress size={30} />
                            </Box>
                        ) : filteredNotifications.length === 0 ? (
                            <Box sx={{ p: 8, textAlign: 'center', opacity: 0.5 }}>
                                <Notifications sx={{ fontSize: 60, mb: 2 }} />
                                <Typography fontWeight="bold">No notifications found</Typography>
                                <Typography variant="caption">Try adjusting your search or filters</Typography>
                            </Box>
                        ) : (
                            <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <AnimatePresence>
                                    {filteredNotifications.map((n, index) => (
                                        <motion.div
                                            key={n.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Paper
                                                elevation={0}
                                                onClick={() => handleNotificationClick(n)}
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 4,
                                                    border: '1px solid',
                                                    borderColor: n.read ? 'rgba(0,0,0,0.04)' : alpha(theme.palette.primary.main, 0.1),
                                                    bgcolor: n.read ? 'white' : alpha(theme.palette.primary.main, 0.02),
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        borderColor: theme.palette.primary.main,
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                                    }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', gap: 2 }}>
                                                    <Avatar sx={{
                                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                        width: 40, height: 40
                                                    }}>
                                                        {getIcon(n)}
                                                    </Avatar>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1a1a1a', pr: 4 }}>
                                                                {n.title}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                                                                {n.time}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem', mb: 1, lineHeight: 1.5 }}>
                                                            {n.message}
                                                        </Typography>
                                                        {n.category && (
                                                            <Chip
                                                                label={n.category}
                                                                size="small"
                                                                sx={{
                                                                    height: 20,
                                                                    fontSize: '0.65rem',
                                                                    fontWeight: 800,
                                                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                                    color: theme.palette.primary.main,
                                                                    borderRadius: 1
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                    <IconButton size="small" sx={{ position: 'absolute', top: 10, right: 10 }}>
                                                        <MoreHoriz sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                </Box>
                                                {!n.read && (
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        left: 8,
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        width: 4,
                                                        height: 20,
                                                        borderRadius: 2,
                                                        bgcolor: theme.palette.primary.main
                                                    }} />
                                                )}
                                            </Paper>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </List>
                        )}
                    </Box>

                    {/* Footer Actions */}
                    {notifications.length > 0 && (
                        <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                            <Button
                                fullWidth
                                startIcon={<DeleteSweep />}
                                color="error"
                                onClick={() => setNotifications([])}
                                sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 3, py: 1 }}
                            >
                                Clear All Notifications
                            </Button>
                        </Box>
                    )}
                </Box>
            </Drawer>
        </>
    );
}
