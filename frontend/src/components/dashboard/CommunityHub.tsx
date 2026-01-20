import React, { useState, useEffect, useRef } from 'react';
import {
    Close,
    ChatBubbleOutline,
    Notifications as NotificationsIcon,
    Campaign,
    Info,
    Search,
    Tune,
    People,
    Link as LinkIcon,
    Settings,
    MoreVert
} from '@mui/icons-material';
import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    Avatar,
    Badge,
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

const SIDEBAR_WIDTH = 220;

export const CommunityHub = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [isOpen, setIsOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('Team');

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
            case 'Notification Preferences': return <Tune fontSize="small" />;
            case 'Team': return <People fontSize="small" />;
            case 'Searcheye Ai': return <Info fontSize="small" />;
            case 'Campaigns': return <Campaign fontSize="small" />;
            case 'Link-building': return <LinkIcon fontSize="small" />;
            case 'System': return <Settings fontSize="small" />;
            case 'Community': return <ChatBubbleOutline fontSize="small" />;
            default: return <NotificationsIcon fontSize="small" />;
        }
    };

    const sections = [
        'Notification Preferences',
        'Team',
        'Searcheye Ai',
        'Campaigns',
        'Link-building',
        'System',
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
                            bottom: isMobile ? 0 : 40,
                            right: isMobile ? 0 : 40,
                            zIndex: 1399,
                            width: isMobile ? '100%' : 1000,
                            height: isMobile ? '100%' : 650,
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
                            {!isMobile && (
                                <Box sx={{
                                    width: SIDEBAR_WIDTH,
                                    borderRight: '1px solid rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    p: 2,
                                    bgcolor: '#f8faf9'
                                }}>
                                    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a1a1a' }}>Center</Typography>
                                    </Box>

                                    <TextField
                                        size="small"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        InputProps={{
                                            startAdornment: <Search sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />,
                                            sx: { borderRadius: 2, bgcolor: 'white', mb: 3 }
                                        }}
                                    />

                                    <List sx={{ p: 0 }}>
                                        {sections.map(section => (
                                            <ListItem
                                                key={section}
                                                disablePadding
                                                sx={{ mb: 0.5 }}
                                            >
                                                <Button
                                                    fullWidth
                                                    onClick={() => setActiveSection(section)}
                                                    startIcon={getIcon(section)}
                                                    sx={{
                                                        justifyContent: 'flex-start',
                                                        textTransform: 'none',
                                                        fontWeight: activeSection === section ? 700 : 500,
                                                        color: activeSection === section ? theme.palette.primary.main : 'text.secondary',
                                                        bgcolor: activeSection === section ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                                                        borderRadius: 2,
                                                        py: 1,
                                                        px: 2,
                                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.03) }
                                                    }}
                                                >
                                                    {section}
                                                </Button>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}

                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
                                <Box sx={{
                                    p: 3,
                                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#1a1a1a', mb: 0.5 }}>
                                            {activeSection} messages
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Manage and view all your {activeSection.toLowerCase()} interactions.
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Tooltip title="View Preferences">
                                            <IconButton size="small"><Tune fontSize="small" /></IconButton>
                                        </Tooltip>
                                        <IconButton size="small" onClick={() => setIsOpen(false)}><Close fontSize="small" /></IconButton>
                                    </Box>
                                </Box>

                                <Box sx={{ flex: 1, overflowY: 'auto', p: 4, position: 'relative' }}>
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
                                                    <Avatar src={msg.user.profile_picture || undefined} sx={{ width: 32, height: 32 }}>
                                                        {msg.user.username[0]}
                                                    </Avatar>
                                                    <Box>
                                                        <Box sx={{ display: 'flex', gap: 1, mb: 0.5, flexDirection: msg.is_sender ? 'row-reverse' : 'row' }}>
                                                            <Typography variant="caption" fontWeight="bold">
                                                                {msg.user.first_name || msg.user.username}
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
                                                left: 71,
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
                                                        left: -70,
                                                        top: 4,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1.5,
                                                        width: 100,
                                                        zIndex: 1
                                                    }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', width: 45 }}>
                                                            {notif.formattedTime}
                                                        </Typography>
                                                        <Box sx={{
                                                            width: 10,
                                                            height: 10,
                                                            borderRadius: '50%',
                                                            bgcolor: notif.read ? 'divider' : theme.palette.primary.main,
                                                            border: '3px solid white',
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
                                                            {notif.type[0].toUpperCase()}
                                                        </Avatar>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 0.5 }}>
                                                                <span style={{ color: theme.palette.primary.main }}>{notif.title.split(' ')[0]}</span> {notif.title.split(' ').slice(1).join(' ')}
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
                                    <Box component="form" onSubmit={handleSend} sx={{ p: 3, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                            <FormControlLabel
                                                control={<Switch size="small" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} color="success" />}
                                                label={<Typography sx={{ fontSize: '0.65rem', fontWeight: 800 }}>PRIVATE</Typography>}
                                                sx={{ m: 0 }}
                                            />
                                            {isPrivate && (
                                                <Autocomplete
                                                    size="small"
                                                    options={availableUsers}
                                                    getOptionLabel={(o: User) => o.first_name || o.username}
                                                    value={recipient}
                                                    onChange={(_: any, v: User | null) => setRecipient(v)}
                                                    renderInput={(p: any) => <TextField {...p} placeholder="Select recipient..." variant="standard" sx={{ width: 150 }} />}
                                                />
                                            )}
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <TextField
                                                fullWidth
                                                placeholder="Ask your community anything..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                variant="outlined"
                                                size="small"
                                                InputProps={{
                                                    sx: { borderRadius: 3, bgcolor: '#f8faf9' }
                                                }}
                                            />
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                disabled={!newMessage.trim() || loading || (isPrivate && !recipient)}
                                                sx={{ borderRadius: 3, px: 3, fontWeight: 'bold' }}
                                            >
                                                Send
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOpen && (
                <IconButton
                    onClick={() => setIsOpen(true)}
                    sx={{
                        position: 'fixed',
                        bottom: 25,
                        right: 25,
                        width: 56,
                        height: 56,
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                        zIndex: 1300,
                        '&:hover': {
                            bgcolor: theme.palette.primary.dark,
                            transform: 'scale(1.1)'
                        },
                        transition: 'all 0.3s'
                    }}
                >
                    <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            )}

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
