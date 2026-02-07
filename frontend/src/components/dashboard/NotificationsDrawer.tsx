import React, { useState, useEffect, useRef } from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    TextField,
    Button,
    Avatar,
    useTheme,
    alpha,
    Stack,
    Paper,
    Tooltip,
    Badge,
    Autocomplete,
    Chip,
    Divider
} from '@mui/material';
import {
    Close,
    Notifications as NotificationsIcon,
    ChatBubbleOutline,
    Search,
    DoneAll,
    Favorite,
    Event,
    Assignment,
    Campaign,
    Warning,
    CheckCircle,
    Info,
    Tune,
    ArrowBack
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
    type: string;
    title: string;
    message: string;
    time: string;
    created_at?: string;
    formattedTime?: string;
    read: boolean;
    link?: string;
}

interface NotificationsDrawerProps {
    open: boolean;
    onClose: () => void;
    user: any;
}

// Grouping helper
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

export const NotificationsDrawer = ({ open, onClose, user }: NotificationsDrawerProps) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState<'Activity' | 'Community'>('Activity');

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);
    const [recipient, setRecipient] = useState<User | null>(null);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [selectedNotifId, setSelectedNotifId] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

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
        if (open) {
            fetchNotifications();
            fetchMessages();
            fetchUsers();
        }
    }, [open]);

    useEffect(() => {
        if (activeSection === 'Community') {
            setTimeout(scrollToBottom, 100);
        }
    }, [activeSection]);

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

    const handleMarkAllRead = async () => {
        try {
            await apiClient.post('/accounts/notifications/mark-all-read/');
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        }
    };

    const filteredNotifs = notifications.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groupedNotifs = groupNotifications(filteredNotifs);

    const renderNotifications = () => (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <TextField
                    placeholder="Search notifications..."
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: <Search sx={{ fontSize: 18, mr: 1, opacity: 0.5 }} />,
                        sx: { borderRadius: 3, bgcolor: alpha(theme.palette.common.black, 0.03), py: 0.5 }
                    }}
                    sx={{ flexGrow: 1, mr: 2 }}
                />
                <IconButton onClick={handleMarkAllRead} size="small" color="primary">
                    <Tooltip title="Mark all read">
                        <DoneAll />
                    </Tooltip>
                </IconButton>
            </Box>

            {groupedNotifs.map(([group, items]) => (
                <Box key={group} sx={{ mb: 3 }}>
                    <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', ml: 1, mb: 1, display: 'block', letterSpacing: '0.1em' }}>
                        {group}
                    </Typography>
                    <Stack spacing={1.5}>
                        {items.map((notif) => (
                            <Paper
                                key={notif.id}
                                elevation={0}
                                sx={{
                                    p: 2,
                                    borderRadius: 4,
                                    border: '1px solid',
                                    borderColor: selectedNotifId === notif.id ? theme.palette.primary.main : alpha(theme.palette.divider, 0.08),
                                    bgcolor: notif.read ? 'background.paper' : alpha(theme.palette.primary.main, 0.02),
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        borderColor: theme.palette.primary.main,
                                        bgcolor: alpha(theme.palette.primary.main, 0.04),
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
                                            <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.6 }}>
                                                {notif.formattedTime}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                                            {notif.message}
                                        </Typography>
                                        {notif.link && selectedNotifId === notif.id && (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                sx={{ mt: 1.5, borderRadius: 2, textTransform: 'none' }}
                                                onClick={(e) => { e.stopPropagation(); navigate(notif.link!); onClose(); }}
                                            >
                                                Take Action
                                            </Button>
                                        )}
                                    </Box>
                                    {!notif.read && (
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.primary.main, mt: 1 }} />
                                    )}
                                </Box>
                            </Paper>
                        ))}
                    </Stack>
                </Box>
            ))}

            {notifications.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8, opacity: 0.5 }}>
                    <NotificationsIcon sx={{ fontSize: 48, mb: 2, opacity: 0.2 }} />
                    <Typography variant="body2">No notifications yet.</Typography>
                </Box>
            )}
        </Box>
    );

    const renderChat = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{
                p: 2,
                flexGrow: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}>
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
                            sx={{ width: 32, height: 32, border: '1.5px solid', borderColor: msg.is_private ? 'success.main' : 'primary.main', p: '0.5px' }}
                        >
                            {msg.user?.username?.[0] || '?'}
                        </Avatar>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: msg.is_sender ? 'flex-end' : 'flex-start' }}>
                            <Box sx={{ display: 'flex', gap: 1, mb: 0.5, alignItems: 'center', flexDirection: msg.is_sender ? 'row-reverse' : 'row' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.8 }}>
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

            {/* Chat Input */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: alpha(theme.palette.divider, 0.08), bgcolor: 'background.paper' }}>
                <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                            size="small"
                            onClick={() => setIsPrivate(!isPrivate)}
                            sx={{ color: isPrivate ? theme.palette.success.main : 'text.disabled' }}
                        >
                            <Tune sx={{ fontSize: 18 }} />
                        </IconButton>
                        {isPrivate && (
                            <Autocomplete
                                size="small"
                                options={availableUsers}
                                getOptionLabel={(o: User) => (o?.first_name || o?.username || 'Unknown')}
                                value={recipient}
                                onChange={(_: any, v: User | null) => setRecipient(v)}
                                renderInput={(p: any) => (
                                    <TextField {...p} placeholder="Private to..." variant="standard" sx={{ width: 120, '& .MuiInput-input': { fontSize: '0.75rem' } }} />
                                )}
                            />
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            InputProps={{
                                sx: { borderRadius: 3, bgcolor: alpha(theme.palette.common.black, 0.03), border: 'none', '& fieldset': { border: 'none' } }
                            }}
                        />
                        <IconButton
                            color="primary"
                            disabled={!newMessage.trim() || (isPrivate && !recipient)}
                            onClick={() => handleSend()}
                            sx={{ bgcolor: theme.palette.primary.main, color: 'white', '&:hover': { bgcolor: theme.palette.primary.dark } }}
                        >
                            <ChatBubbleOutline fontSize="small" />
                        </IconButton>
                    </Box>
                </Stack>
            </Box>
        </Box>
    );

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: { xs: '100%', sm: 400 }, bgcolor: '#FBFBFB' }
            }}
        >
            {/* Header */}
            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: -0.5 }}>
                        {activeSection === 'Activity' ? 'Notifications' : 'Community Hub'}
                    </Typography>
                </Stack>
                <IconButton onClick={onClose} sx={{ bgcolor: alpha(theme.palette.divider, 0.1) }}>
                    <Close fontSize="small" />
                </IconButton>
            </Box>

            {/* Navigation Tabs */}
            <Box sx={{ px: 2, mb: 1 }}>
                <Box sx={{ display: 'flex', bgcolor: alpha(theme.palette.common.black, 0.04), p: 0.5, borderRadius: 3 }}>
                    <Button
                        fullWidth
                        size="small"
                        startIcon={<NotificationsIcon fontSize="small" />}
                        onClick={() => setActiveSection('Activity')}
                        sx={{
                            borderRadius: 2.5,
                            textTransform: 'none',
                            fontWeight: 700,
                            bgcolor: activeSection === 'Activity' ? 'white' : 'transparent',
                            color: activeSection === 'Activity' ? 'primary.main' : 'text.secondary',
                            boxShadow: activeSection === 'Activity' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                            '&:hover': { bgcolor: activeSection === 'Activity' ? 'white' : alpha(theme.palette.common.black, 0.02) }
                        }}
                    >
                        Activity
                    </Button>
                    <Button
                        fullWidth
                        size="small"
                        startIcon={<ChatBubbleOutline fontSize="small" />}
                        onClick={() => setActiveSection('Community')}
                        sx={{
                            borderRadius: 2.5,
                            textTransform: 'none',
                            fontWeight: 700,
                            bgcolor: activeSection === 'Community' ? 'white' : 'transparent',
                            color: activeSection === 'Community' ? 'primary.main' : 'text.secondary',
                            boxShadow: activeSection === 'Community' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                            '&:hover': { bgcolor: activeSection === 'Community' ? 'white' : alpha(theme.palette.common.black, 0.02) }
                        }}
                    >
                        Community
                    </Button>
                </Box>
            </Box>

            {/* Content */}
            <Box sx={{ flexGrow: 1, overflowY: 'hidden' }}>
                {activeSection === 'Activity' ? renderNotifications() : renderChat()}
            </Box>
        </Drawer>
    );
};
