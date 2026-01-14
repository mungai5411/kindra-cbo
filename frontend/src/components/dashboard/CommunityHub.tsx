import React, { useState, useEffect, useRef } from 'react';
import {
    Send,
    Close,
    ChatBubbleOutline,
    DeleteOutline,
    Lock,
    Notifications as NotificationsIcon,
    Favorite,
    Event as EventIcon,
    Assignment,
    Campaign,
    Info,
    Warning
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import apiClient from '../../api/client';
import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    Avatar,
    Badge,
    CircularProgress,
    Switch,
    FormControlLabel,
    Autocomplete,
    useTheme,
    Tabs,
    Tab,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useMediaQuery,
    Backdrop,
    ClickAwayListener
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { glassCard, glassChatBubble, glassNotificationItem } from '../../theme/glassmorphism';

interface User {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    role: string;
    profile_picture: string | null;
}

interface ChatMessage {
    id: number;
    user: User;
    recipient_detail?: User;
    content: string;
    timestamp: string;
    is_flagged: boolean;
    is_sender: boolean;
    is_private: boolean;
}

interface Notification {
    id: string;
    type: 'donation' | 'event' | 'task' | 'campaign' | 'info' | 'success' | 'warning' | any;
    title: string;
    message: string;
    time: string;
    read: boolean;
    category?: string;
    targetRoles?: string[];
}

export const CommunityHub = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0); // 0: Notifications, 1: Chat
    const { user: currentUser } = useSelector((state: RootState) => state.auth);

    // Chat State
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);
    const [recipient, setRecipient] = useState<User | null>(null);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Notifications State
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadNotifCount, setUnreadNotifCount] = useState(0);
    const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            const response = await apiClient.get('/chat/messages/');
            let newMessages: ChatMessage[] = [];
            if (Array.isArray(response.data)) newMessages = response.data;
            else if (response.data?.results) newMessages = response.data.results;

            if (newMessages.length > messages.length) {
                const latestMsg = newMessages[newMessages.length - 1];
                if (!latestMsg.is_sender && (!isOpen || activeTab !== 1)) {
                    const isNew = messages.length > 0 && latestMsg.id > (messages[messages.length - 1]?.id || 0);
                    if (isNew) {
                        setUnreadChatCount(prev => prev + 1);
                        const chatNotif: Notification = {
                            id: `chat-${latestMsg.id}`,
                            type: 'info',
                            title: 'New Community Message',
                            message: `${latestMsg.user?.first_name || latestMsg.user?.username}: ${latestMsg.content.substring(0, 50)}...`,
                            time: 'Just now',
                            read: false,
                            category: 'chat'
                        };
                        setNotifications(prev => [chatNotif, ...prev.filter(n => n.category !== 'chat')]);
                    }
                }
            }
            setMessages(newMessages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await apiClient.get('/chat/messages/users/');
            const validUsers = (response.data || []).filter((u: User) => u.id != null);
            setAvailableUsers(validUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await apiClient.get('/accounts/notifications/');
            const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            setNotifications(data);
            setUnreadNotifCount(data.filter((n: any) => !n.read).length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        const handleOpenHub = (e: any) => {
            setIsOpen(true);
            if (e.detail?.tab !== undefined) {
                setActiveTab(e.detail.tab);
            }
        };
        window.addEventListener('open-community-hub', handleOpenHub);
        return () => window.removeEventListener('open-community-hub', handleOpenHub);
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (activeTab === 1) {
                fetchUsers();
                setUnreadChatCount(0);
                setTimeout(scrollToBottom, 50);
            } else if (activeTab === 0) {
                fetchNotifications();
                setUnreadNotifCount(0);
            }
        }
    }, [isOpen, activeTab]);

    useEffect(() => {
        let isMounted = true;
        let timeoutId: any;

        const poll = async () => {
            if (!isMounted) return;
            if (document.visibilityState === 'visible') {
                try {
                    await Promise.all([fetchMessages(), fetchNotifications()]);
                } catch (e) {
                    console.error('Polling error:', e);
                }
            }
            timeoutId = setTimeout(poll, 20000);
        };

        poll();
        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, []);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim()) return;
        try {
            setLoading(true);
            const data: any = { content: newMessage };
            if (isPrivate && recipient) {
                data.recipient = recipient.id;
                data.is_private = true;
            }
            await apiClient.post('/chat/messages/', data);
            setNewMessage('');
            setIsPrivate(false);
            setRecipient(null);
            await fetchMessages();
            setTimeout(scrollToBottom, 50);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAllRead = async () => {
        try {
            const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
            if (unreadIds.length === 0) return;
            await apiClient.post('/accounts/notifications/', { notification_ids: unreadIds });
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadNotifCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    const deleteMessage = async (id: number) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await apiClient.delete(`/chat/messages/${id}/`);
            fetchMessages();
        } catch (err) { console.error(err); }
    };

    const getNotifIcon = (type: string) => {
        switch (type) {
            case 'donation': return <Favorite sx={{ color: '#ec4899' }} />;
            case 'event': return <EventIcon color="info" />;
            case 'task': return <Assignment color="success" />;
            case 'campaign': return <Campaign color="primary" />;
            case 'warning': return <Warning color="warning" />;
            default: return <Info sx={{ color: theme.palette.grey[500] }} />;
        }
    };

    return (
        <>
            <Backdrop
                open={isOpen && isMobile}
                onClick={() => setIsOpen(false)}
                sx={{
                    zIndex: 1398,
                    bgcolor: 'rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(2px)'
                }}
            />

            <AnimatePresence>
                {isOpen && (
                    <ClickAwayListener onClickAway={() => !selectedNotif && setIsOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20, x: isMobile ? 0 : -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20, x: isMobile ? 0 : -20 }}
                            style={{
                                position: 'fixed',
                                bottom: isMobile ? 70 : 90,
                                right: isMobile ? 16 : 25,
                                zIndex: 1399,
                                width: isMobile ? 'calc(100% - 32px)' : 380,
                                maxWidth: isMobile ? 'none' : '90vw'
                            }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    ...glassCard(theme, 'elevated'),
                                    height: isMobile ? '65vh' : 550,
                                    maxHeight: '75vh',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                    borderRadius: 1.5,
                                }}
                            >
                                <Box sx={{
                                    p: 2,
                                    background: 'linear-gradient(135deg, rgba(81, 151, 85, 0.1) 0%, rgba(190, 145, 190, 0.1) 100%)',
                                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: -0.5 }}>
                                        Community Hub
                                    </Typography>
                                    <IconButton size="small" onClick={() => setIsOpen(false)}>
                                        <Close fontSize="small" />
                                    </IconButton>
                                </Box>

                                <Tabs
                                    value={activeTab}
                                    onChange={(_, v) => setActiveTab(v)}
                                    variant="fullWidth"
                                    sx={{
                                        minHeight: 48,
                                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                                        '& .MuiTab-root': {
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            transition: 'all 0.3s'
                                        }
                                    }}
                                >
                                    <Tab icon={<Badge color="error" variant="dot" invisible={unreadNotifCount === 0}><NotificationsIcon sx={{ fontSize: 18 }} /></Badge>} label="Activity" />
                                    <Tab icon={<Badge color="error" variant="dot" invisible={unreadChatCount === 0}><ChatBubbleOutline sx={{ fontSize: 18 }} /></Badge>} label="Community" />
                                </Tabs>

                                <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                    <AnimatePresence mode="wait">
                                        {activeTab === 0 ? (
                                            <motion.div
                                                key="activity"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                style={{ height: '100%', overflowY: 'auto', padding: 16 }}
                                            >
                                                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>Recent Updates</Typography>
                                                    <Button size="small" variant="text" onClick={markAllRead} sx={{ fontSize: '0.7rem', fontWeight: 700 }}>Mark all read</Button>
                                                </Box>
                                                <List sx={{ p: 0 }}>
                                                    {notifications.length > 0 ? (
                                                        notifications.slice(0, 5).map((notif, i) => (
                                                            <ListItem
                                                                key={notif.id || `notif-${i}`}
                                                                disablePadding
                                                                onClick={() => {
                                                                    if (notif.category === 'chat') {
                                                                        setActiveTab(1);
                                                                        setUnreadChatCount(0);
                                                                    } else {
                                                                        setSelectedNotif(notif);
                                                                    }
                                                                }}
                                                                sx={{ ...glassNotificationItem(theme, notif.read), animationDelay: `${i * 0.05}s` }}
                                                            >
                                                                <ListItemIcon sx={{ minWidth: 45 }}>
                                                                    <Box sx={{
                                                                        p: 1, borderRadius: 2, bgcolor: 'background.paper', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                                                    }}>
                                                                        {getNotifIcon(notif.type)}
                                                                    </Box>
                                                                </ListItemIcon>
                                                                <ListItemText
                                                                    primary={<Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{notif.title}</Typography>}
                                                                    secondary={<Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{notif.message}</Typography>}
                                                                />
                                                                {!notif.read && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'error.main', ml: 1 }} />}
                                                            </ListItem>
                                                        ))
                                                    ) : (
                                                        <Box sx={{ py: 8, textAlign: 'center', opacity: 0.5 }}>
                                                            <NotificationsIcon sx={{ fontSize: 48, mb: 2 }} />
                                                            <Typography variant="body2">No recent notifications</Typography>
                                                        </Box>
                                                    )}
                                                </List>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="community"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                                            >
                                                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: isMobile ? 1.2 : 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                    {messages.map((msg, i) => {
                                                        const prevMsg = i > 0 ? messages[i - 1] : null;
                                                        const isSameSender = prevMsg && prevMsg.user?.id === msg.user?.id && prevMsg.is_private === msg.is_private;
                                                        const isRecent = prevMsg && (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() < 300000);
                                                        const showHeader = !isSameSender || !isRecent;

                                                        return (
                                                            <Box
                                                                key={msg.id || `msg-${i}`}
                                                                sx={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: msg.is_sender ? 'flex-end' : 'flex-start',
                                                                    maxWidth: isMobile ? (msg.is_sender ? '95%' : '90%') : (msg.is_sender ? '90%' : '85%'),
                                                                    alignSelf: msg.is_sender ? 'flex-end' : 'flex-start',
                                                                    mt: showHeader ? (i === 0 ? 0 : 2) : 0.2
                                                                }}
                                                            >
                                                                {showHeader && (
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 1,
                                                                        mb: 0.5,
                                                                        flexDirection: msg.is_sender ? 'row-reverse' : 'row',
                                                                        px: 0.5
                                                                    }}>
                                                                        <Avatar
                                                                            src={msg.user?.profile_picture || undefined}
                                                                            sx={{
                                                                                width: isMobile ? 22 : 26,
                                                                                height: isMobile ? 22 : 26,
                                                                                fontSize: '0.6rem',
                                                                                border: '1px solid rgba(255,255,255,0.2)'
                                                                            }}
                                                                        >
                                                                            {msg.user?.username?.[0] || '?'}
                                                                        </Avatar>
                                                                        <Typography
                                                                            variant="caption"
                                                                            sx={{
                                                                                fontWeight: 700,
                                                                                fontSize: isMobile ? '0.7rem' : '0.75rem',
                                                                                color: 'text.primary',
                                                                                opacity: 0.8
                                                                            }}
                                                                        >
                                                                            {msg.user?.first_name || msg.user?.username || 'Unknown User'}
                                                                            {msg.is_private && <Lock sx={{ fontSize: 10, ml: 0.5, verticalAlign: 'middle' }} />}
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                                <Box sx={glassChatBubble(msg.is_sender, msg.is_private, isMobile)}>
                                                                    {msg.is_private && (
                                                                        <Typography variant="caption" sx={{ display: 'block', fontSize: isMobile ? '0.55rem' : '0.6rem', mb: 0.5, opacity: 0.7, fontStyle: 'italic' }}>
                                                                            Private to {msg.is_sender ? (msg.recipient_detail?.first_name || msg.recipient_detail?.username || 'User') : 'You'}
                                                                        </Typography>
                                                                    )}
                                                                    <Typography variant="body2" sx={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                                                                        {msg.content}
                                                                    </Typography>
                                                                    {(msg.is_sender || (currentUser?.is_superuser || currentUser?.role === 'ADMIN')) && !msg.is_private && (
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => deleteMessage(msg.id)}
                                                                            sx={{ position: 'absolute', top: -5, right: -5, bgcolor: 'background.paper', boxShadow: 1, p: 0.2 }}
                                                                        >
                                                                            <DeleteOutline sx={{ fontSize: 12 }} color="error" />
                                                                        </IconButton>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        );
                                                    })}
                                                    <div ref={messagesEndRef} />
                                                </Box>

                                                <Box component="form" onSubmit={handleSend} sx={{ p: isMobile ? 1.5 : 2, borderTop: '1px solid rgba(0,0,0,0.05)', bgcolor: 'rgba(255,255,255,0.3)' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1, flexWrap: 'wrap' }}>
                                                        <FormControlLabel
                                                            control={<Switch size="small" checked={isPrivate} onChange={(e) => { setIsPrivate(e.target.checked); if (!e.target.checked) setRecipient(null); }} color="success" />}
                                                            label={<Typography sx={{ fontSize: '0.65rem', fontWeight: 800 }}>PRIVATE</Typography>}
                                                            sx={{ m: 0 }}
                                                        />
                                                        {isPrivate && (
                                                            <Autocomplete
                                                                size="small"
                                                                options={availableUsers}
                                                                getOptionLabel={(o: User) => o.first_name || o.username}
                                                                getOptionKey={(o: User) => o.id}
                                                                value={recipient}
                                                                onChange={(_: any, v: User | null) => setRecipient(v)}
                                                                renderInput={(p: any) => <TextField {...p} placeholder="Select recipient..." variant="standard" sx={{ width: 120, '& input': { fontSize: '0.7rem' } }} />}
                                                            />
                                                        )}
                                                    </Box>
                                                    <TextField
                                                        fullWidth
                                                        placeholder={isPrivate ? "Type a private message..." : "Message community..."}
                                                        value={newMessage}
                                                        onChange={(e) => setNewMessage(e.target.value)}
                                                        disabled={loading}
                                                        variant="outlined"
                                                        size="small"
                                                        InputProps={{
                                                            sx: { borderRadius: 4, bgcolor: 'background.paper' },
                                                            endAdornment: (
                                                                <IconButton type="submit" disabled={!newMessage.trim() || loading || (isPrivate && !recipient)} sx={{ color: 'primary.main' }}>
                                                                    {loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                                                                </IconButton>
                                                            )
                                                        }}
                                                    />
                                                </Box>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Box>
                            </Paper>
                        </motion.div>
                    </ClickAwayListener>
                )}
            </AnimatePresence>

            <Dialog
                open={!!selectedNotif}
                onClose={() => setSelectedNotif(null)}
                fullScreen={false}
                maxWidth="xs"
                sx={{ zIndex: 1500 }}
                slotProps={{
                    backdrop: {
                        sx: { backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }
                    }
                }}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        overflow: 'hidden',
                        m: 2,
                        maxHeight: '80vh',
                        bgcolor: 'background.paper',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
                    }
                }}
            >
                {selectedNotif && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                    >
                        <Box sx={{ bgcolor: 'background.paper', height: '100%', border: 'none' }}>
                            <Box sx={{ p: 2, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    {getNotifIcon(selectedNotif.type)}
                                    <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem' }}>{selectedNotif.title}</Typography>
                                </Box>
                                <IconButton size="small" onClick={() => setSelectedNotif(null)}>
                                    <Close fontSize="small" />
                                </IconButton>
                            </Box>
                            <Divider sx={{ opacity: 0.5 }} />
                            <DialogContent sx={{ py: 3 }}>
                                <Typography variant="body1" sx={{
                                    lineHeight: 1.7,
                                    color: 'text.primary',
                                    fontSize: '0.95rem'
                                }}>
                                    {selectedNotif.message}
                                </Typography>
                                {selectedNotif.targetRoles && (
                                    <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                                        {selectedNotif.targetRoles.map(role => (
                                            <Typography key={role} variant="caption" sx={{ px: 1, py: 0.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1, fontWeight: 700, textTransform: 'uppercase' }}>
                                                {role}
                                            </Typography>
                                        ))}
                                    </Box>
                                )}
                            </DialogContent>
                            <Divider sx={{ opacity: 0.5 }} />
                            <DialogActions sx={{ p: 2 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => setSelectedNotif(null)}
                                    sx={{
                                        borderRadius: 2,
                                        fontWeight: 800,
                                        py: 1.2,
                                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                                    }}
                                >
                                    Done
                                </Button>
                            </DialogActions>
                        </Box>
                    </motion.div>
                )}
            </Dialog>
        </>
    );
};
