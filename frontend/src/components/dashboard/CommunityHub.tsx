import React, { useState, useEffect, useRef } from 'react';
import {
    Close,
    ChatBubbleOutline,
    Notifications as NotificationsIcon,
    Search,
    Tune,
    Favorite,
    Event,
    Assignment,
    Campaign,
    Warning,
    CheckCircle,
    Info,
    DoneAll
} from '@mui/icons-material';
import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    Avatar,
    Autocomplete,
    useTheme,
    Button,
    useMediaQuery,
    alpha,
    Tooltip,
    Chip,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { glassCard } from '../../theme/glassmorphism';
import apiClient from '../../api/client';

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
    created_at?: string;
    formattedTime?: string;
    read: boolean;
    category?: string;
    targetRoles?: string[];
    link?: string;
}

// Helper to group notifications
const groupNotifications = (notifs: Notification[]) => {
    const groups: { [key: string]: Notification[] } = {
        'Today': [],
        'Yesterday': [],
        'Earlier': []
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    notifs.forEach(n => {
        const dateStr = n.created_at || n.time;
        const d = dateStr ? new Date(dateStr) : new Date();
        d.setHours(0, 0, 0, 0);
        if (d.getTime() === today.getTime()) groups['Today'].push(n);
        else if (d.getTime() === yesterday.getTime()) groups['Yesterday'].push(n);
        else groups['Earlier'].push(n);
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
};

const getNotifIcon = (type: string) => {
    switch (type) {
        case 'donation': return <Favorite sx={{ fontSize: 18 }} />;
        case 'event': return <Event sx={{ fontSize: 18 }} />;
        case 'task': return <Assignment sx={{ fontSize: 18 }} />;
        case 'campaign': return <Campaign sx={{ fontSize: 18 }} />;
        case 'warning': return <Warning sx={{ fontSize: 18 }} />;
        case 'success': return <CheckCircle sx={{ fontSize: 18 }} />;
        default: return <Info sx={{ fontSize: 18 }} />;
    }
};

const getNotifColor = (type: string, theme: any) => {
    switch (type) {
        case 'donation': return theme.palette.error.main;
        case 'event': return theme.palette.primary.main;
        case 'task': return theme.palette.info.main;
        case 'campaign': return theme.palette.secondary.main;
        case 'warning': return theme.palette.warning.main;
        case 'success': return theme.palette.success.main;
        default: return theme.palette.primary.main;
    }
};




export const CommunityHub = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [isOpen, setIsOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('Activity');

    // Chat & Notif State
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);
    const [recipient, setRecipient] = useState<User | null>(null);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [selectedNotifId, setSelectedNotifId] = useState<string | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            const response = await apiClient.get('/chat/messages/');
            let newMessages: ChatMessage[] = [];
            if (Array.isArray(response.data)) newMessages = response.data;
            else if (response.data?.results) newMessages = response.data.results;
            setMessages(newMessages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await apiClient.get('/accounts/notifications/');
            const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);

            const formatted = data.map((n: any) => ({
                ...n,
                formattedTime: new Date(n.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setNotifications(formatted);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
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

    useEffect(() => {
        if (isOpen) {
            fetchMessages();
            fetchNotifications();
            fetchUsers();
            if (activeSection === 'Community') {
                setTimeout(scrollToBottom, 100);
            }
        }
    }, [isOpen, activeSection]);

    useEffect(() => {
        const handleOpen = (e: any) => {
            setIsOpen(true);
            if (e.detail?.tab === 1) setActiveSection('Community');
            else setActiveSection('Activity');
        };
        window.addEventListener('open-community-hub', handleOpen);
        return () => window.removeEventListener('open-community-hub', handleOpen);
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
            fetchMessages();
            setTimeout(scrollToBottom, 50);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setLoading(false);
        }
    };
    const getIcon = (section: string) => {
        switch (section) {
            case 'Community': return <ChatBubbleOutline fontSize="small" />;
            default: return <NotificationsIcon fontSize="small" />;
        }
    };

    const sections = [
        'Activity',
        'Community'
    ];

    const filteredNotifs = notifications.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groupedNotifs = groupNotifications(filteredNotifs);

    const handleMarkAllRead = async () => {
        try {
            await apiClient.post('/accounts/notifications/mark-all-read/');
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        }
    };

    return (
        <>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            position: 'fixed' as any,
                            top: isMobile ? 0 : 20,
                            bottom: isMobile ? 0 : 20,
                            right: isMobile ? 0 : 20,
                            zIndex: 1400,
                            width: isMobile ? '100%' : 350,
                            display: 'flex',
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                ...glassCard(theme, 'elevated'),
                                height: '100%',
                                display: 'flex',
                                borderRadius: isMobile ? 0 : 4,
                                border: '1px solid rgba(0,0,0,0.05)',
                                bgcolor: 'rgba(255,255,255,0.95)',
                                overflow: 'visible' // Enabled to allow Autocomplete dropdown
                            }}
                        >


                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
                                <Box sx={{
                                    p: 1.5,
                                    borderBottom: '1px solid rgba(0,0,0,0.03)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: 'rgba(255,255,255,0.5)',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        {sections.map(section => (
                                            <IconButton
                                                key={section}
                                                onClick={() => setActiveSection(section)}
                                                size="small"
                                                sx={{
                                                    color: activeSection === section ? theme.palette.primary.main : 'text.secondary',
                                                    bgcolor: activeSection === section ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                                                }}
                                            >
                                                <Tooltip title={section}>
                                                    {getIcon(section)}
                                                </Tooltip>
                                            </IconButton>
                                        ))}
                                    </Box>

                                    <TextField
                                        size="small"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        InputProps={{
                                            startAdornment: <Search sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary', opacity: 0.5 }} />,
                                            sx: {
                                                borderRadius: 2,
                                                bgcolor: 'rgba(0,0,0,0.03)',
                                                '& fieldset': { border: 'none' },
                                                height: 32,
                                                fontSize: '0.75rem',
                                                width: 120,
                                                transition: 'width 0.3s ease',
                                                '&:focus-within': { width: 160 }
                                            }
                                        }}
                                    />

                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <IconButton size="small" onClick={handleMarkAllRead}>
                                            <Tooltip title="Mark all as read">
                                                <DoneAll sx={{ fontSize: 18, opacity: 0.6 }} />
                                            </Tooltip>
                                        </IconButton>
                                        <IconButton size="small" onClick={() => setIsOpen(false)}>
                                            <Close sx={{ fontSize: 18, opacity: 0.6 }} />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Box sx={{ flex: 1, overflowY: 'auto', p: 2, position: 'relative' }}>
                                    {activeSection === 'Community' ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                            {messages.map((msg) => (
                                                <Box key={msg.id} sx={{
                                                    display: 'flex',
                                                    gap: 1.5,
                                                    flexDirection: msg.is_sender ? 'row-reverse' : 'row',
                                                    alignSelf: msg.is_sender ? 'flex-end' : 'flex-start',
                                                    maxWidth: '85%'
                                                }}>
                                                    <Avatar
                                                        src={msg.user?.profile_picture || undefined}
                                                        sx={{
                                                            width: 32,
                                                            height: 32,
                                                            mt: 0.5,
                                                            border: '1.5px solid',
                                                            borderColor: msg.is_private ? 'success.main' : 'primary.main',
                                                            p: '0.5px'
                                                        }}
                                                    >
                                                        {msg.user?.username?.[0] || '?'}
                                                    </Avatar>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: msg.is_sender ? 'flex-end' : 'flex-start' }}>
                                                        <Box sx={{ display: 'flex', gap: 1, mb: 0.5, alignItems: 'center', flexDirection: msg.is_sender ? 'row-reverse' : 'row' }}>
                                                            <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.8 }}>
                                                                {msg.user?.first_name || msg.user?.username || 'Unknown'}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: 0.5 }}>
                                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </Typography>
                                                            {msg.is_private && (
                                                                <Chip label="Private" size="small" color="success" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 800 }} />
                                                            )}
                                                        </Box>
                                                        <Paper sx={{
                                                            py: 1,
                                                            px: 1.5,
                                                            borderRadius: msg.is_sender ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                            bgcolor: msg.is_sender ? theme.palette.primary.main : alpha(theme.palette.divider, 0.05),
                                                            color: msg.is_sender ? 'white' : 'text.primary',
                                                            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                                                            border: '1px solid',
                                                            borderColor: msg.is_sender ? 'primary.main' : alpha(theme.palette.divider, 0.1)
                                                        }}>
                                                            <Typography variant="body2" sx={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                                                                {msg.content}
                                                            </Typography>
                                                        </Paper>
                                                    </Box>
                                                </Box>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </Box>
                                    ) : (
                                        <Box sx={{ position: 'relative' }}>
                                            {groupedNotifs.map(([group, items]) => (
                                                <Box key={group} sx={{ mb: 3 }}>
                                                    <Typography variant="overline" sx={{ px: 1, fontWeight: 800, color: 'text.secondary', opacity: 0.7, letterSpacing: 1.5 }}>
                                                        {group}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                                                        {items.map((notif) => (
                                                            <Paper
                                                                key={notif.id}
                                                                elevation={0}
                                                                sx={{
                                                                    p: 2,
                                                                    borderRadius: 3,
                                                                    border: '1px solid',
                                                                    borderColor: selectedNotifId === notif.id ? theme.palette.primary.main : alpha(theme.palette.divider, 0.08),
                                                                    bgcolor: notif.read ? 'transparent' : alpha(theme.palette.primary.main, 0.02),
                                                                    transition: 'all 0.2s ease',
                                                                    cursor: 'pointer',
                                                                    '&:hover': {
                                                                        borderColor: theme.palette.primary.main,
                                                                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                                                                        transform: 'translateY(-2px)'
                                                                    }
                                                                }}
                                                                onClick={() => setSelectedNotifId(selectedNotifId === notif.id ? null : notif.id)}
                                                            >
                                                                <Box sx={{ display: 'flex', gap: 2 }}>
                                                                    <Avatar sx={{
                                                                        width: 36,
                                                                        height: 36,
                                                                        bgcolor: alpha(getNotifColor(notif.type, theme), 0.1),
                                                                        color: getNotifColor(notif.type, theme),
                                                                        border: '1px solid',
                                                                        borderColor: alpha(getNotifColor(notif.type, theme), 0.2)
                                                                    }}>
                                                                        {getNotifIcon(notif.type)}
                                                                    </Avatar>
                                                                    <Box sx={{ flex: 1 }}>
                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                                                {notif.title}
                                                                            </Typography>
                                                                            <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.6, fontSize: '0.65rem' }}>
                                                                                {notif.formattedTime}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Typography variant="body2" sx={{
                                                                            color: 'text.secondary',
                                                                            fontSize: '0.8rem',
                                                                            lineHeight: 1.5,
                                                                            display: selectedNotifId === notif.id ? 'block' : '-webkit-box',
                                                                            WebkitLineClamp: 2,
                                                                            WebkitBoxOrient: 'vertical',
                                                                            overflow: 'hidden'
                                                                        }}>
                                                                            {notif.message}
                                                                        </Typography>
                                                                        <AnimatePresence>
                                                                            {selectedNotifId === notif.id && (
                                                                                <motion.div
                                                                                    initial={{ height: 0, opacity: 0 }}
                                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                                    exit={{ height: 0, opacity: 0 }}
                                                                                >
                                                                                    {notif.link && (
                                                                                        <Button
                                                                                            size="small"
                                                                                            variant="contained"
                                                                                            disableElevation
                                                                                            sx={{ mt: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '0.7rem', px: 2 }}
                                                                                            onClick={(e) => { e.stopPropagation(); navigate(notif.link!); }}
                                                                                        >
                                                                                            Take Action
                                                                                        </Button>
                                                                                    )}
                                                                                </motion.div>
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </Box>
                                                                    {!notif.read && (
                                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.primary.main, mt: 1 }} />
                                                                    )}
                                                                </Box>
                                                            </Paper>
                                                        ))}
                                                    </Box>
                                                </Box>
                                            ))}
                                            {filteredNotifs.length === 0 && (
                                                <Box sx={{ textAlign: 'center', py: 8, opacity: 0.5 }}>
                                                    <Typography variant="body2">No notifications found.</Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                </Box>

                                {activeSection === 'Community' && (
                                    <Box component="form" onSubmit={handleSend} sx={{
                                        p: 1.5,
                                        borderTop: '1px solid rgba(0,0,0,0.03)',
                                        background: 'rgba(255,255,255,0.8)',
                                        backdropFilter: 'blur(10px)'
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => setIsPrivate(!isPrivate)}
                                                sx={{
                                                    color: isPrivate ? theme.palette.success.main : 'text.disabled',
                                                    transform: 'scale(0.8)'
                                                }}
                                            >
                                                <Tune sx={{ fontSize: 16 }} />
                                            </IconButton>

                                            {isPrivate && (
                                                <Autocomplete
                                                    size="small"
                                                    options={availableUsers}
                                                    getOptionLabel={(o: User) => (o?.first_name || o?.username || 'Unknown')}
                                                    value={recipient}
                                                    onChange={(_: any, v: User | null) => setRecipient(v)}
                                                    renderInput={(p: any) => <TextField {...p} placeholder="Private to..." variant="standard" sx={{ width: 100, '& .MuiInput-input': { fontSize: '0.65rem' } }} />}
                                                />
                                            )}
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <TextField
                                                fullWidth
                                                placeholder="Say something..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                variant="outlined"
                                                size="small"
                                                InputProps={{
                                                    sx: {
                                                        borderRadius: 4,
                                                        bgcolor: 'rgba(0,0,0,0.03)',
                                                        height: 32,
                                                        fontSize: '0.8rem',
                                                        '& fieldset': { border: 'none' }
                                                    }
                                                }}
                                            />
                                            <IconButton
                                                type="submit"
                                                color="primary"
                                                disabled={!newMessage.trim() || loading || (isPrivate && !recipient)}
                                                sx={{
                                                    background: theme.palette.primary.main,
                                                    color: 'white',
                                                    '&:hover': { background: theme.palette.primary.dark },
                                                    width: 32,
                                                    height: 32,
                                                    p: 0,
                                                    opacity: newMessage.trim() ? 1 : 0.5
                                                }}
                                            >
                                                <ChatBubbleOutline sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </motion.div>
                )}
            </AnimatePresence>



        </>
    );
};
