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
    Switch,
    FormControlLabel,
    Autocomplete,
    useTheme,
    Button,
    List,
    ListItem,
    useMediaQuery,
    Backdrop,
    alpha,
    Tooltip,
    Chip,
    Dialog,
    DialogContent,
    DialogActions
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
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
}




export const CommunityHub = () => {
    const theme = useTheme();
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
            <Backdrop
                open={isOpen}
                onClick={() => setIsOpen(false)}
                sx={{ zIndex: 1398, bgcolor: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(4px)' }}
            />

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        style={{
                            position: 'fixed',
                            bottom: isMobile ? 0 : 20,
                            right: isMobile ? 0 : 20,
                            zIndex: 1399,
                            width: isMobile ? '100%' : 400,
                            height: isMobile ? '100%' : 600,
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                ...glassCard(theme, 'elevated'),
                                height: '100%',
                                display: 'flex',
                                overflow: 'hidden',
                                borderRadius: isMobile ? 0 : 4,
                                border: '1px solid rgba(0,0,0,0.05)',
                                bgcolor: 'rgba(255,255,255,0.95)'
                            }}
                        >


                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
                                <Box sx={{
                                    p: 2,
                                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            {sections.map(section => (
                                                <Button
                                                    key={section}
                                                    onClick={() => setActiveSection(section)}
                                                    startIcon={getIcon(section)}
                                                    size="small"
                                                    sx={{
                                                        textTransform: 'none',
                                                        fontWeight: activeSection === section ? 800 : 500,
                                                        color: activeSection === section ? theme.palette.primary.main : 'text.secondary',
                                                        borderBottom: activeSection === section ? `2px solid ${theme.palette.primary.main}` : 'none',
                                                        borderRadius: 0,
                                                        px: 1,
                                                        pb: 0.5,
                                                        minWidth: 'auto',
                                                        '&:hover': { bgcolor: 'transparent', opacity: 0.8 }
                                                    }}
                                                >
                                                    {section}
                                                </Button>
                                            ))}
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <Tooltip title="View Preferences">
                                                <IconButton size="small"><Tune sx={{ fontSize: 16 }} /></IconButton>
                                            </Tooltip>
                                            <IconButton size="small" onClick={() => setIsOpen(false)}><Close sx={{ fontSize: 16 }} /></IconButton>
                                        </Box>
                                    </Box>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder={`Search ${activeSection.toLowerCase()}...`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        InputProps={{
                                            startAdornment: <Search sx={{ fontSize: 16, mr: 1, color: 'text.secondary', opacity: 0.5 }} />,
                                            sx: { borderRadius: 2, bgcolor: '#f8faf9', '& fieldset': { border: 'none' }, height: 36 }
                                        }}
                                    />
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
                                                    <Avatar src={msg.user?.profile_picture || undefined} sx={{ width: 32, height: 32 }}>
                                                        {msg.user?.username?.[0] || '?'}
                                                    </Avatar>
                                                    <Box>
                                                        <Box sx={{ display: 'flex', gap: 1, mb: 0.5, flexDirection: msg.is_sender ? 'row-reverse' : 'row' }}>
                                                            <Typography variant="caption" fontWeight="bold">
                                                                {msg.user?.first_name || msg.user?.username || 'Unknown'}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={glassChatBubble(msg.is_sender, msg.is_private)}>
                                                            <Typography variant="body2">{msg.content}</Typography>
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
                                                        border: '1px solid rgba(0,0,0,0.06)',
                                                        boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
                                                        display: 'flex',
                                                        gap: 2,
                                                        cursor: 'pointer',
                                                        '&:hover': { bgcolor: '#fafafa', borderColor: theme.palette.primary.main }
                                                    }} onClick={() => setSelectedNotif(notif)}>
                                                        <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                                                            {(notif.type?.[0] || 'N').toUpperCase()}
                                                        </Avatar>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 0.5 }}>
                                                                <span style={{ color: theme.palette.primary.main }}>{(notif.title || '').split(' ')[0]}</span> {(notif.title || '').split(' ').slice(1).join(' ')}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', mb: 1.5 }}>
                                                                {notif.message}
                                                            </Typography>
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
                                    <Box component="form" onSubmit={handleSend} sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                            <FormControlLabel
                                                control={<Switch size="small" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} color="success" />}
                                                label={<Typography sx={{ fontSize: '0.6rem', fontWeight: 800 }}>PRIVATE</Typography>}
                                                sx={{ m: 0, '& .MuiFormControlLabel-label': { ml: 0.5 } }}
                                            />
                                            {isPrivate && (
                                                <Autocomplete
                                                    size="small"
                                                    options={availableUsers}
                                                    getOptionLabel={(o: User) => (o?.first_name || o?.username || 'Unknown')}
                                                    value={recipient}
                                                    onChange={(_: any, v: User | null) => setRecipient(v)}
                                                    renderInput={(p: any) => <TextField {...p} placeholder="Select user..." variant="standard" sx={{ width: 120, '& .MuiInput-input': { fontSize: '0.75rem' } }} />}
                                                />
                                            )}
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <TextField
                                                fullWidth
                                                placeholder="Ask community..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                variant="outlined"
                                                size="small"
                                                InputProps={{
                                                    sx: { borderRadius: 2, bgcolor: '#f8faf9', height: 36, fontSize: '0.875rem' }
                                                }}
                                            />
                                            <IconButton
                                                type="submit"
                                                color="primary"
                                                disabled={!newMessage.trim() || loading || (isPrivate && !recipient)}
                                                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2, p: 1 }}
                                            >
                                                <ChatBubbleOutline sx={{ fontSize: 20 }} />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </motion.div>
                )}
            </AnimatePresence>



            <Dialog open={!!selectedNotif} onClose={() => setSelectedNotif(null)} maxWidth="xs" fullWidth>
                {selectedNotif && (
                    <>
                        <Box sx={{ p: 3, pb: 0, display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6" fontWeight="bold">{selectedNotif.title}</Typography>
                            <IconButton size="small" onClick={() => setSelectedNotif(null)}><Close /></IconButton>
                        </Box>
                        <DialogContent>
                            <Typography variant="body1">{selectedNotif.message}</Typography>
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <Button fullWidth variant="contained" onClick={() => setSelectedNotif(null)}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </>
    );
};
