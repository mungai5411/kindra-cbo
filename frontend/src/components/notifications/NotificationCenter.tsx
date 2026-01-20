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
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Chip,
    Badge,
    Divider,
    Button,
    alpha,
    useTheme,
    CircularProgress
} from '@mui/material';
import {
    Notifications,
    Close,
    VolunteerActivism,
    CheckCircle,
    Info,
    DeleteSweep
} from '@mui/icons-material';

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

    useEffect(() => {
        if (user) {
            loadNotifications();

            // Poll for new notifications every 30 seconds
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

            // Transform backend data to match frontend interface
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
            // Don't clear notifications on error, keep showing cached ones
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
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = async (id: string) => {
        try {
            await apiClient.post('/auth/notifications/', {
                notification_ids: [id]
            });

            // Optimistically update UI
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            // Reload to get correct state
            loadNotifications();
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        if (notification.link) {
            setOpen(false);
            navigate(notification.link);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
            if (unreadIds.length === 0) return;

            await apiClient.post('/auth/notifications/', {
                notification_ids: unreadIds
            });

            // Optimistically update UI
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            loadNotifications();
        }
    };

    const clearAll = () => {
        // Just clear from UI - backend keeps history
        setNotifications([]);
    };

    const getIcon = (notification: Notification) => {
        if (notification.category === 'DONATION') {
            return <VolunteerActivism sx={{ color: theme.palette.success.main }} />;
        }
        if (notification.category === 'VERIFICATION') {
            return <CheckCircle sx={{ color: theme.palette.primary.main }} />;
        }
        return <Info sx={{ color: theme.palette.info.main }} />;
    };

    return (
        <>
            <IconButton
                onClick={() => setOpen(true)}
                sx={{
                    color: 'white',
                    '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1) }
                }}
            >
                <Badge badgeContent={unreadCount} color="error">
                    <Notifications />
                </Badge>
            </IconButton>

            <Drawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', sm: 420 },
                        bgcolor: 'background.default'
                    }
                }}
            >
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{
                        p: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        bgcolor: alpha(theme.palette.primary.main, 0.03)
                    }}>
                        <Box>
                            <Typography variant="h6" fontWeight="bold">
                                Notifications
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}
                            </Typography>
                        </Box>
                        <IconButton onClick={() => setOpen(false)} size="small">
                            <Close />
                        </IconButton>
                    </Box>

                    {/* Actions */}
                    {notifications.length > 0 && (
                        <Box sx={{ p: 2, display: 'flex', gap: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Button
                                size="small"
                                onClick={markAllAsRead}
                                disabled={unreadCount === 0}
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                Mark all as read
                            </Button>
                            <Button
                                size="small"
                                startIcon={<DeleteSweep />}
                                onClick={clearAll}
                                color="error"
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                Clear all
                            </Button>
                        </Box>
                    )}

                    {/* Notifications List */}
                    <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                        {notifications.length === 0 ? (
                            <Box sx={{ p: 8, textAlign: 'center' }}>
                                <Notifications sx={{ fontSize: 60, color: 'text.disabled', opacity: 0.3, mb: 2 }} />
                                <Typography color="text.secondary" fontWeight="medium">
                                    No notifications yet
                                </Typography>
                                <Typography variant="caption" color="text.disabled">
                                    You'll be notified when donations are received
                                </Typography>
                            </Box>
                        ) : loading ? (
                            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                                <CircularProgress size={30} />
                            </Box>
                        ) : (
                            <List sx={{ p: 0 }}>
                                {notifications.map((notification, index) => (
                                    <Box key={notification.id}>
                                        <ListItem
                                            alignItems="flex-start"
                                            onClick={() => handleNotificationClick(notification)}
                                            sx={{
                                                cursor: notification.link ? 'pointer' : 'default',
                                                bgcolor: notification.read
                                                    ? 'transparent'
                                                    : alpha(theme.palette.primary.main, 0.05),
                                                '&:hover': {
                                                    bgcolor: notification.link
                                                        ? alpha(theme.palette.action.hover, 0.1)
                                                        : alpha(theme.palette.primary.main, 0.05)
                                                },
                                                transition: 'background-color 0.2s',
                                                py: 2,
                                                px: 3
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{
                                                    bgcolor: alpha(
                                                        notification.type === 'success'
                                                            ? theme.palette.success.main
                                                            : theme.palette.info.main,
                                                        0.1
                                                    )
                                                }}>
                                                    {getIcon(notification)}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ pr: 2 }}>
                                                            {notification.title}
                                                        </Typography>
                                                        {!notification.read && (
                                                            <Box sx={{
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: '50%',
                                                                bgcolor: 'primary.main',
                                                                flexShrink: 0
                                                            }} />
                                                        )}
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography
                                                            variant="body2"
                                                            color="text.primary"
                                                            sx={{
                                                                mb: 1,
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 3,
                                                                WebkitBoxOrient: 'vertical',
                                                                overflow: 'hidden'
                                                            }}
                                                        >
                                                            {notification.message}
                                                        </Typography>
                                                        {notification.donor && (
                                                            <Chip
                                                                label={`${notification.donor}${notification.amount ? ` • KES ${notification.amount.toLocaleString()}` : ''}`}
                                                                size="small"
                                                                sx={{
                                                                    mt: 0.5,
                                                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                                                    color: 'success.dark',
                                                                    fontWeight: 700,
                                                                    fontSize: '0.7rem'
                                                                }}
                                                            />
                                                        )}
                                                        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
                                                            {notification.time}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        {index < notifications.length - 1 && <Divider />}
                                    </Box>
                                ))}
                            </List>
                        )}
                    </Box>
                </Box>
            </Drawer>
        </>
    );
}
