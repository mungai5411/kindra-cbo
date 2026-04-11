import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Avatar,
    AvatarGroup,
    Chip,
    Grid,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    SimpleDialog,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    Checkbox,
    useTheme,
    alpha,
    Tooltip,
    Stack,
    CircularProgress,
    Snackbar,
    Alert,
} from '@mui/material';
import {
    Send,
    Delete,
    Flag,
    MoreVert,
    Group,
    PersonAdd,
    Message as MessageIcon,
    Close,
    EmojiEmotions,
    AttachFile,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { RootState, AppDispatch } from '../../store';
import {
    fetchMessages,
    fetchAvailableUsers,
    sendMessage,
    deleteMessage,
    setSelectedConversation,
} from '../../features/socialChat/socialChatSlice';
import { StatsCard } from './StatCards';

export function SocialChatView() {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { messages, publicMessages, availableUsers, isLoading, error, selectedConversation } = useSelector(
        (state: RootState) => state.socialChat
    );
    const { user: currentUser } = useSelector((state: RootState) => state.auth);

    const [messageInput, setMessageInput] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [openUserDialog, setOpenUserDialog] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dispatch(fetchMessages());
        dispatch(fetchAvailableUsers());
        // Set up auto-refresh every 3 seconds
        const interval = setInterval(() => {
            dispatch(fetchMessages());
        }, 3000);
        return () => clearInterval(interval);
    }, [dispatch]);

    useEffect(() => {
        // Scroll to bottom when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!messageInput.trim()) {
            setSnackbar({ open: true, message: 'Message cannot be empty', severity: 'warning' });
            return;
        }

        const result = await dispatch(
            sendMessage({
                content: messageInput,
                recipient: isPrivate && selectedRecipient ? selectedRecipient : undefined,
                is_private: isPrivate && !!selectedRecipient,
            })
        );

        if (result.type === sendMessage.fulfilled.type) {
            setMessageInput('');
            setSnackbar({ open: true, message: 'Message sent successfully!', severity: 'success' });
        } else {
            setSnackbar({ open: true, message: 'Failed to send message', severity: 'error' });
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        const result = await dispatch(deleteMessage(messageId));
        if (result.type === deleteMessage.fulfilled.type) {
            setSnackbar({ open: true, message: 'Message deleted', severity: 'success' });
            setAnchorEl(null);
        }
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, message: any) => {
        setAnchorEl(event.currentTarget);
        setSelectedMessage(message);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedMessage(null);
    };

    const displayMessages = isPrivate && selectedRecipient ? messages.filter(m => m.is_private) : publicMessages;

    const uniqueAuthors = Array.from(
        new Map(displayMessages.map(m => [m.user.id, m.user])).values()
    ).slice(0, 10);

    const stats = [
        {
            title: 'Total Messages',
            value: messages.length,
            icon: MessageIcon,
            color: 'primary.main',
            backColor: alpha(theme.palette.primary.main, 0.1)
        },
        {
            title: 'Active Members',
            value: uniqueAuthors.length,
            icon: Group,
            color: 'success.main',
            backColor: alpha(theme.palette.success.main, 0.1)
        },
        {
            title: 'Public Messages',
            value: publicMessages.length,
            icon: MessageIcon,
            color: 'info.main',
            backColor: alpha(theme.palette.info.main, 0.1)
        },
    ];

    return (
        <Box >
            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {stats.map((stat, i) => (
                    <Grid item xs={12} sm={6} md={4} key={i}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <StatsCard {...stat} />
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                {/* Left Panel - User List */}
                <Grid item xs={12} md={3}>
                    <Paper
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.1),
                            height: 'fit-content',
                            maxHeight: '500px',
                            overflowY: 'auto'
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                💬 Community Members
                            </Typography>
                            <Tooltip title="Direct Message">
                                <IconButton size="small" onClick={() => setOpenUserDialog(true)} color="primary">
                                    <PersonAdd fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        <Stack spacing={1}>
                            <motion.div
                                whileHover={{ x: 5 }}
                                onClick={() => {
                                    setIsPrivate(false);
                                    setSelectedRecipient(null);
                                }}
                            >
                                <Card
                                    sx={{
                                        cursor: 'pointer',
                                        bgcolor: !isPrivate ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                        borderRadius: 2,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <CardContent sx={{ p: 1.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <MessageIcon fontSize="small" color="primary" />
                                            <Typography variant="body2" fontWeight="bold">
                                                Public Chat
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {publicMessages.length} messages
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <Typography variant="caption" fontWeight="bold" sx={{ mt: 2, display: 'block' }}>
                                Active Members
                            </Typography>

                            {uniqueAuthors.map(author => (
                                <motion.div
                                    key={author.id}
                                    whileHover={{ x: 5 }}
                                    onClick={() => {
                                        setIsPrivate(true);
                                        setSelectedRecipient(author.id);
                                    }}
                                >
                                    <Card
                                        sx={{
                                            cursor: 'pointer',
                                            bgcolor: selectedRecipient === author.id ? alpha(theme.palette.info.main, 0.1) : 'transparent',
                                            borderRadius: 2,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <CardContent sx={{ p: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem' }}>
                                                    {author.first_name?.[0] || author.username?.[0]}
                                                </Avatar>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography variant="caption" noWrap fontWeight="bold">
                                                        {author.first_name || author.username}
                                                    </Typography>
                                                    <Chip label={author.role} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </Stack>

                        <AvatarGroup
                            max={5}
                            sx={{ mt: 3, justifyContent: 'center', p: 1, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}
                        >
                            {uniqueAuthors.map(author => (
                                <Tooltip key={author.id} title={author.first_name || author.username}>
                                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                                        {author.first_name?.[0] || author.username?.[0]}
                                    </Avatar>
                                </Tooltip>
                            ))}
                        </AvatarGroup>
                    </Paper>
                </Grid>

                {/* Main Chat Area */}
                <Grid item xs={12} md={9}>
                    <Paper
                        sx={{
                            p: 0,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.1),
                            display: 'flex',
                            flexDirection: 'column',
                            height: '600px'
                        }}
                    >
                        {/* Chat Header */}
                        <Box
                            sx={{
                                p: 2,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`
                            }}
                        >
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {isPrivate && selectedRecipient ? (
                                        <>
                                            💬 {availableUsers.find(u => u.id === selectedRecipient)?.first_name ||
                                                availableUsers.find(u => u.id === selectedRecipient)?.username}
                                        </>
                                    ) : (
                                        '🌍 Public Community Chat'
                                    )}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {displayMessages.length} messages
                                </Typography>
                            </Box>
                            {isPrivate && selectedRecipient && (
                                <Button
                                    size="small"
                                    onClick={() => {
                                        setIsPrivate(false);
                                        setSelectedRecipient(null);
                                    }}
                                    startIcon={<Close />}
                                >
                                    Back
                                </Button>
                            )}
                        </Box>

                        {/* Messages Container */}
                        <Box
                            sx={{
                                flex: 1,
                                overflowY: 'auto',
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5,
                                background: alpha(theme.palette.background.paper, 0.5)
                            }}
                        >
                            {isLoading && displayMessages.length === 0 ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <CircularProgress />
                                </Box>
                            ) : displayMessages.length === 0 ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <Typography color="text.secondary" align="center">
                                        {isPrivate ? 'No messages yet. Start a conversation!' : 'No public messages yet. Be the first to share!'}
                                    </Typography>
                                </Box>
                            ) : (
                                displayMessages.map((message, index) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, x: message.is_sender ? 20 : -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: message.is_sender ? 'flex-end' : 'flex-start',
                                                gap: 1,
                                                alignItems: 'flex-end'
                                            }}
                                        >
                                            {!message.is_sender && (
                                                <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                                                    {message.user.first_name?.[0] || message.user.username?.[0]}
                                                </Avatar>
                                            )}

                                            <Box
                                                sx={{
                                                    maxWidth: '70%',
                                                    position: 'relative'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.querySelector('[data-action-menu]')?.classList.add('visible')}
                                                onMouseLeave={(e) => e.currentTarget.querySelector('[data-action-menu]')?.classList.remove('visible')}
                                            >
                                                <Paper
                                                    sx={{
                                                        p: 1.5,
                                                        bgcolor: message.is_sender
                                                            ? theme.palette.primary.main
                                                            : alpha(theme.palette.primary.main, 0.1),
                                                        color: message.is_sender ? 'white' : 'text.primary',
                                                        borderRadius: 2,
                                                        wordBreak: 'break-word'
                                                    }}
                                                >
                                                    {!message.is_sender && (
                                                        <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 0.5 }}>
                                                            {message.user.first_name || message.user.username}
                                                        </Typography>
                                                    )}
                                                    <Typography variant="body2">{message.content}</Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}
                                                    >
                                                        {new Date(message.timestamp).toLocaleTimeString()}
                                                    </Typography>
                                                </Paper>

                                                {message.is_sender && (
                                                    <Box
                                                        data-action-menu
                                                        sx={{
                                                            position: 'absolute',
                                                            right: '-40px',
                                                            top: 0,
                                                            visibility: 'hidden',
                                                            display: 'flex',
                                                            gap: 0.5,
                                                            transition: 'visibility 0.2s'
                                                        }}
                                                    >
                                                        <Tooltip title="Delete">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDeleteMessage(message.id)}
                                                                sx={{ color: 'error.main' }}
                                                            >
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    </motion.div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </Box>

                        {/* Message Input */}
                        <Box
                            sx={{
                                p: 2,
                                borderTop: '1px solid',
                                borderColor: 'divider',
                                bgcolor: alpha(theme.palette.background.paper, 0.5),
                                display: 'flex',
                                gap: 1
                            }}
                        >
                            <TextField
                                fullWidth
                                multiline
                                maxRows={3}
                                placeholder="Type a message..."
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                size="small"
                                sx={{ borderRadius: 2 }}
                                disabled={isLoading}
                            />
                            <Button
                                variant="contained"
                                endIcon={<Send />}
                                onClick={handleSendMessage}
                                disabled={isLoading || !messageInput.trim()}
                                sx={{ borderRadius: 2, minWidth: '100px' }}
                            >
                                Send
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* User Selection Dialog */}
            <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Start Direct Message</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Stack spacing={1} sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {availableUsers.map(user => (
                            <Card
                                key={user.id}
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                                }}
                            >
                                <CardContent sx={{ p: 1.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar>{user.first_name?.[0] || user.username?.[0]}</Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography fontWeight="bold">{user.first_name || user.username}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {user.role}
                                            </Typography>
                                        </Box>
                                        <Button
                                            size="small"
                                            onClick={() => {
                                                setIsPrivate(true);
                                                setSelectedRecipient(user.id);
                                                setOpenUserDialog(false);
                                            }}
                                        >
                                            Message
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </DialogContent>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}
