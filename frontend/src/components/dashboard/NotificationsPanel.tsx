import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    alpha,
    useTheme,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Close,
    Notifications,
    Favorite,
    Event as EventIcon,
    Assignment,
    Campaign,
    Info,
    Warning
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';


interface Notification {
    id: string;
    type: 'donation' | 'event' | 'task' | 'campaign' | 'info' | 'success' | 'warning';
    title: string;
    message: string;
    time: string;
    read: boolean;
    category?: 'DONATION' | 'VERIFICATION' | 'SYSTEM' | 'SHELTER' | 'VOLUNTEER' | 'CASE';
    targetRoles?: string[]; // Roles that should see this notification
}

interface NotificationsPanelProps {
    open: boolean;
    onClose: () => void;
}

// MOCK_NOTIFICATIONS removed or commented out to satisfy linter
/* 
const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'donation',
        title: 'Donation Successful',
        message: 'Your donation of KES 5,000 to the "Back to School" campaign was processed successfully.',
        time: '2 hours ago',
        read: false
    },
    // ...
]; 
*/

export const NotificationsPanel = ({ open, onClose }: NotificationsPanelProps) => {
    const theme = useTheme();
    // const { user } = useSelector((state: RootState) => state.auth);



    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    const fetchNotifications = async () => {
        try {
            const response = await apiClient.get('/accounts/notifications/');
            // Handle both direct array and paginated results
            const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            setNotifications(data);
            // Also update session storage for cross-tab sync if needed, 
            // though API source is single source of truth now
            sessionStorage.setItem('notifications', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    // Initial fetch and polling
    useEffect(() => {
        if (open) {
            fetchNotifications();
            // Optional: poll every minute
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [open]);

    // Listen for custom events to trigger refresh
    useEffect(() => {
        const handleRefresh = () => fetchNotifications();
        window.addEventListener('refreshNotifications', handleRefresh);
        return () => window.removeEventListener('refreshNotifications', handleRefresh);
    }, []);

    const markAllAsRead = async () => {
        try {
            if (!Array.isArray(notifications)) return;
            const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
            if (unreadIds.length === 0) return;

            await apiClient.post('/accounts/notifications/', { notification_ids: unreadIds });

            // Optimistic update
            const updated = notifications.map(n => ({ ...n, read: true }));
            setNotifications(updated);
            sessionStorage.setItem('notifications', JSON.stringify(updated));
            window.dispatchEvent(new CustomEvent('refreshNotifications'));
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.read) {
            try {
                await apiClient.post('/accounts/notifications/', { notification_ids: [notification.id] });

                // Optimistic update
                const updated = Array.isArray(notifications)
                    ? notifications.map(n => n.id === notification.id ? { ...n, read: true } : n)
                    : [];
                setNotifications(updated);
                sessionStorage.setItem('notifications', JSON.stringify(updated));
                window.dispatchEvent(new CustomEvent('refreshNotifications'));
            } catch (error) {
                console.error('Failed to mark as read:', error);
            }
        }
        setSelectedNotification(notification);
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'donation':
            case 'success': return <Favorite sx={{ color: '#ec4899' }} />;
            case 'event': return <EventIcon sx={{ color: theme.palette.info.main }} />;
            case 'task': return <Assignment sx={{ color: theme.palette.success.main }} />;
            case 'campaign': return <Campaign sx={{ color: theme.palette.primary.main }} />;
            case 'warning': return <Warning sx={{ color: theme.palette.warning.main }} />;
            default: return <Info sx={{ color: theme.palette.grey[500] }} />;
        }
    };

    const getBgColor = (type: Notification['type'], read: boolean) => {
        if (read) return 'transparent';
        if (type === 'success' || type === 'donation') return alpha('#ec4899', 0.08);
        return alpha(theme.palette.primary.main, 0.05);
    };

    const unreadCount = Array.isArray(notifications) ? notifications.filter(notif => !notif.read).length : 0;

    return (
        <>
            <Drawer
                anchor="right"
                open={open}
                onClose={onClose}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', sm: 400 },
                        bgcolor: 'background.paper',
                        borderRadius: { xs: 0, sm: '24px 0 0 24px' },
                        boxShadow: theme.shadows[10],
                        backgroundImage: theme.palette.mode === 'dark'
                            ? 'linear-gradient(180deg, #242424 0%, #181818 100%)'
                            : 'none',
                    }
                }}
            >
                <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Notifications color="primary" />
                            <Typography variant="h6" fontWeight="bold">Notifications</Typography>
                            {unreadCount > 0 && (
                                <Chip
                                    label={`${unreadCount} new`}
                                    size="small"
                                    color="primary"
                                    sx={{ fontWeight: 'bold' }}
                                />
                            )}
                        </Box>
                        <IconButton onClick={onClose} sx={{ bgcolor: alpha(theme.palette.divider, 0.05) }}>
                            <Close />
                        </IconButton>
                    </Box>

                    <Divider sx={{ mb: 1 }} />

                    <List sx={{ flex: 1, overflowY: 'auto', py: 0 }}>
                        <AnimatePresence>
                            {Array.isArray(notifications) && notifications.map((notif, index) => (
                                <ListItem
                                    key={notif.id}
                                    component={motion.div}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => handleNotificationClick(notif)}
                                    sx={{
                                        py: 2,
                                        px: 2,
                                        mb: 1,
                                        borderRadius: 3,
                                        bgcolor: getBgColor(notif.type, notif.read),
                                        border: '1px solid',
                                        borderColor: !notif.read ? alpha(theme.palette.divider, 0.1) : 'transparent',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.action.hover, 0.1)
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 48 }}>
                                        <Box sx={{
                                            p: 1.2,
                                            borderRadius: 2,
                                            bgcolor: 'background.paper',
                                            boxShadow: theme.shadows[1],
                                            display: 'flex'
                                        }}>
                                            {getIcon(notif.type)}
                                        </Box>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {notif.title}
                                                </Typography>
                                                <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: 'nowrap', ml: 1 }}>
                                                    {notif.time}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mt: 0.5,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {notif.message}
                                            </Typography>
                                        }
                                    />
                                    {!notif.read && (
                                        <Box sx={{
                                            position: 'absolute',
                                            right: 12,
                                            top: 12,
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            bgcolor: 'error.main'
                                        }} />
                                    )}
                                </ListItem>
                            ))}
                        </AnimatePresence>
                        {(!Array.isArray(notifications) || notifications.length === 0) && (
                            <Box sx={{ p: 6, textAlign: 'center' }}>
                                <Typography color="text.secondary">No notifications yet.</Typography>
                            </Box>
                        )}
                    </List>

                    <Box sx={{ pt: 2, display: 'flex', gap: 2 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0}
                            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold' }}
                        >
                            Mark all as read
                        </Button>
                    </Box>
                </Box>
            </Drawer>

            {/* Notification Detail Dialog (Floating Window) */}
            <Dialog
                open={!!selectedNotification}
                onClose={() => setSelectedNotification(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        bgcolor: 'background.paper',
                        boxShadow: theme.shadows[24],
                        backgroundImage: 'none'
                    }
                }}
            >
                {selectedNotification && (
                    <>
                        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 1, pt: 3, px: 3 }}>
                            <Box sx={{
                                p: 1.5,
                                borderRadius: '50%',
                                bgcolor: alpha(theme.palette.background.default, 0.5),
                                display: 'flex'
                            }}>
                                {getIcon(selectedNotification.type)}
                            </Box>
                            <Box>
                                <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                                    {selectedNotification.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {selectedNotification.time}
                                </Typography>
                            </Box>
                        </DialogTitle>
                        <Divider sx={{ my: 1 }} />
                        <DialogContent sx={{ px: 4, py: 3 }}>
                            <Typography variant="body1" sx={{ lineHeight: 1.7, fontSize: '1.05rem', color: 'text.primary' }}>
                                {selectedNotification.message}
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, pt: 0 }}>
                            <Button
                                onClick={() => setSelectedNotification(null)}
                                variant="contained"
                                fullWidth
                                sx={{ borderRadius: 2, fontWeight: 'bold', py: 1 }}
                            >
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </>
    );
};
