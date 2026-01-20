import React, { useState, useEffect, useRef } from 'react';
import {
    Close,
    ChatBubbleOutline,
    Notifications as NotificationsIcon,
    Search,
    Tune,
    MoreVert
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
import { glassCard, glassChatBubble } from '../../theme/glassmorphism';
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
    formattedTime?: string;
    read: boolean;
    category?: string;
    targetRoles?: string[];
    link?: string;
}




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
                            position: 'fixed',
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
                                        <IconButton size="small" onClick={() => setIsOpen(false)}>
                                            <Close sx={{ fontSize: 18, opacity: 0.6 }} />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Box sx={{ flex: 1, overflowY: 'auto', p: 2, position: 'relative' }}>
                                    {activeSection === 'Community' ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {messages.map((msg) => (
                                                <Box key={msg.id} sx={{
                                                    display: 'flex',
                                                    gap: 2,
                                                    flexDirection: msg.is_sender ? 'row-reverse' : 'row',
                                                    alignSelf: msg.is_sender ? 'flex-end' : 'flex-start',
                                                    maxWidth: '80%'
                                                }}>
                                                    <Avatar src={msg.user?.profile_picture || undefined} sx={{ width: 24, height: 24, mt: 0.5 }}>
                                                        {msg.user?.username?.[0] || '?'}
                                                    </Avatar>
                                                    <Box>
                                                        <Box sx={{ display: 'flex', gap: 0.8, mb: 0.2, alignItems: 'center', flexDirection: msg.is_sender ? 'row-reverse' : 'row' }}>
                                                            <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600, opacity: 0.7 }}>
                                                                {msg.user?.first_name || msg.user?.username || 'Unknown'}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: 0.4 }}>
                                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{
                                                            ...glassChatBubble(msg.is_sender, msg.is_private),
                                                            px: 1.5,
                                                            py: 0.8,
                                                            borderRadius: msg.is_sender ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                                                        }}>
                                                            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{msg.content}</Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </Box>
                                    ) : (
                                        <Box sx={{ position: 'relative', pl: 8 }}>
                                            <Box sx={{
                                                position: 'absolute',
                                                left: 51,
                                                top: 0,
                                                bottom: 0,
                                                width: 1.5,
                                                bgcolor: 'rgba(0,0,0,0.06)',
                                                zIndex: 0
                                            }} />

                                            {filteredNotifs.map((notif) => (
                                                <Box key={notif.id} sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        left: -50,
                                                        top: 4,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        width: 80,
                                                        zIndex: 1
                                                    }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', width: 40, fontSize: '0.7rem' }}>
                                                            {notif.formattedTime}
                                                        </Typography>
                                                        <Box sx={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: '50%',
                                                            bgcolor: notif.read ? 'divider' : theme.palette.primary.main,
                                                            border: '2.5px solid white',
                                                            boxShadow: '0 0 0 1px rgba(0,0,0,0.05)'
                                                        }} />
                                                    </Box>

                                                    <Paper sx={{
                                                        flex: 1,
                                                        p: 2,
                                                        borderRadius: 3,
                                                        border: selectedNotifId === notif.id ? `1px solid ${theme.palette.primary.main}` : '1px solid rgba(0,0,0,0.06)',
                                                        boxShadow: selectedNotifId === notif.id ? '0 4px 20px rgba(0,0,0,0.08)' : '0 2px 12px rgba(0,0,0,0.02)',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 1,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': { bgcolor: '#fafafa', borderColor: theme.palette.primary.main }
                                                    }} onClick={() => setSelectedNotifId(selectedNotifId === notif.id ? null : notif.id)}>
                                                        <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                                                            <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                                                                {(notif.type?.[0] || 'N').toUpperCase()}
                                                            </Avatar>
                                                            <Box sx={{ flex: 1 }}>
                                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 0.5 }}>
                                                                    <span style={{ color: theme.palette.primary.main }}>{(notif.title || '').split(' ')[0]}</span> {(notif.title || '').split(' ').slice(1).join(' ')}
                                                                </Typography>
                                                                <AnimatePresence>
                                                                    {selectedNotifId !== notif.id && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0 }}
                                                                            animate={{ opacity: 1 }}
                                                                            exit={{ opacity: 0 }}
                                                                        >
                                                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', mb: 1, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                                                {notif.message}
                                                                            </Typography>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                                <Chip
                                                                    size="small"
                                                                    label={notif.category || 'System'}
                                                                    sx={{
                                                                        height: 20,
                                                                        fontSize: '0.65rem',
                                                                        fontWeight: 800,
                                                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                                        color: theme.palette.primary.main,
                                                                        borderRadius: 1
                                                                    }}
                                                                />
                                                            </Box>
                                                            <IconButton size="small"><MoreVert sx={{ fontSize: 16 }} /></IconButton>
                                                        </Box>

                                                        <AnimatePresence>
                                                            {selectedNotifId === notif.id && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    style={{ overflow: 'hidden' }}
                                                                >
                                                                    <Box sx={{ pt: 1, borderTop: '1px solid rgba(0,0,0,0.03)', mt: 1 }}>
                                                                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                                                            {notif.message}
                                                                        </Typography>
                                                                        {notif.link && (
                                                                            <Button
                                                                                size="small"
                                                                                variant="outlined"
                                                                                sx={{ mt: 2, borderRadius: 2, textTransform: 'none', fontSize: '0.75rem' }}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    if (notif.link) {
                                                                                        navigate(notif.link);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                View Details
                                                                            </Button>
                                                                        )}
                                                                    </Box>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </Paper>
                                                </Box>
                                            ))}
                                            {filteredNotifs.length === 0 && (
                                                <Box sx={{ textAlign: 'center', py: 8, opacity: 0.5 }}>
                                                    <Typography>No messages found in this section.</Typography>
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
