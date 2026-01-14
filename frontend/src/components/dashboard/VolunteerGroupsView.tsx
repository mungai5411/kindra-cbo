import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Avatar,
    Chip,
    TextField,
    IconButton,
    CircularProgress,
    alpha,
    useTheme,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Divider,
} from '@mui/material';
import {
    GroupWork,
    Send,
    People,
    Forum,
    Info,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import { fetchGroups, fetchGroupMessages, sendGroupMessage } from '../../features/volunteers/groupsSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { glassChatBubble } from '../../theme/glassmorphism';

export function VolunteerGroupsView() {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { groups, messages, isLoading } = useSelector((state: RootState) => state.groups);
    const { user } = useSelector((state: RootState) => state.auth);

    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [messageContent, setMessageContent] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dispatch(fetchGroups());
    }, [dispatch]);

    useEffect(() => {
        if (selectedGroupId) {
            dispatch(fetchGroupMessages(selectedGroupId));
            // Poll for new messages every 10 seconds
            const interval = setInterval(() => {
                dispatch(fetchGroupMessages(selectedGroupId));
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [dispatch, selectedGroupId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedGroupId]);

    const handleSendMessage = () => {
        if (selectedGroupId && messageContent.trim()) {
            dispatch(sendGroupMessage({ groupId: selectedGroupId, content: messageContent }));
            setMessageContent('');
        }
    };

    const selectedGroup = groups.find(g => g.id === selectedGroupId);
    const groupMessages = selectedGroupId ? messages[selectedGroupId] || [] : [];

    if (isLoading && groups.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="900" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
                    Volunteer Operative Hub
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Secure divisional communication and unit coordination.
                </Typography>
            </Box>

            <Grid container spacing={4} sx={{ flexGrow: 1, minHeight: 0 }}>
                {/* Groups List */}
                <Grid item xs={12} md={4} lg={3} sx={{ height: '100%', overflow: 'auto' }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupWork fontSize="small" /> {user?.role === 'ADMIN' || user?.role === 'MANAGEMENT' ? 'ALL OPERATIONAL UNITS' : 'YOUR ASSIGNED UNITS'}
                    </Typography>
                    <AnimatePresence mode="popLayout">
                        {groups.map((group) => (
                            <Box
                                component={motion.div}
                                key={group.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => setSelectedGroupId(group.id)}
                                sx={{
                                    p: 2, mb: 2, borderRadius: 1, cursor: 'pointer',
                                    border: '1px solid',
                                    borderColor: selectedGroupId === group.id ? 'primary.main' : 'transparent',
                                    bgcolor: selectedGroupId === group.id ? alpha(theme.palette.primary.main, 0.1) : alpha('#fff', 0.5),
                                    backdropFilter: 'blur(10px)',
                                    boxShadow: selectedGroupId === group.id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight="bold">{group.name}</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden', lineBreak: 'anywhere'
                                }}>
                                    {group.description || 'Command instructions pending...'}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                                    <People sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>{group.members_details?.length || 0} Members</Typography>
                                </Box>
                            </Box>
                        ))}
                    </AnimatePresence>
                    {groups.length === 0 && (
                        <Box sx={{ p: 4, textAlign: 'center', bgcolor: alpha('#fff', 0.5), borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                            <Info sx={{ fontSize: 40, opacity: 0.1, mb: 2 }} />
                            <Typography variant="body2" color="text.secondary">
                                {user?.role === 'ADMIN' || user?.role === 'MANAGEMENT'
                                    ? 'No operational units have been established in the system yet.'
                                    : 'You are not currently assigned to any operational units.'}
                            </Typography>
                        </Box>
                    )}
                </Grid>

                {/* Group Details & Chat */}
                <Grid item xs={12} md={8} lg={9} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {selectedGroupId ? (
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Group Header Info */}
                            <Paper sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #8DA88D 0%, #BEDAAB 100%)', color: '#fff' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold">{selectedGroup?.name}</Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>{selectedGroup?.description}</Typography>
                                    </Box>
                                    <Chip label="OPERATIONAL" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.3)' }} />
                                </Box>
                            </Paper>

                            <Grid container spacing={3} sx={{ flexGrow: 1, minHeight: 0 }}>
                                {/* Shared Workspace/Members */}
                                <Grid item xs={12} lg={4}>
                                    <Paper sx={{ p: 3, height: '100%', borderRadius: 2, bgcolor: alpha('#fff', 0.8), backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.5)' }}>
                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <People fontSize="small" /> UNIT MEMBERS
                                        </Typography>
                                        <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
                                            {selectedGroup?.members_details?.map((member: any) => (
                                                <ListItem key={member.id} disablePadding sx={{ mb: 1 }}>
                                                    <ListItemAvatar>
                                                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 'bold' }}>
                                                            {member.name[0].toUpperCase()}
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={<Typography variant="body2" fontWeight="bold">{member.name}</Typography>}
                                                        secondary={<Typography variant="caption" sx={{ opacity: 0.7 }}>{member.email}</Typography>}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                        <Divider sx={{ my: 2 }} />
                                        <Box>
                                            <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" gutterBottom>UNIT CAPABILITIES</Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                <Chip label="Private Comms" size="small" color="primary" variant="outlined" />
                                                <Chip label="File Sharing" size="small" color="primary" variant="outlined" />
                                                <Chip label="Task Coordination" size="small" color="primary" variant="outlined" />
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>

                                {/* Private Chat */}
                                <Grid item xs={12} lg={8}>
                                    <Paper sx={{ p: 0, height: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column', bgcolor: '#fff', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2, bgcolor: alpha(theme.palette.background.default, 0.4) }}>
                                            <Box sx={{ p: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1 }}>
                                                <Forum color="primary" fontSize="small" />
                                            </Box>
                                            <Typography variant="subtitle2" fontWeight="bold">Private Encrypted Channel</Typography>
                                        </Box>

                                        {/* Messages Area */}
                                        <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#f8fafc' }}>
                                            {groupMessages.map((msg: any) => {
                                                const isMine = msg.sender === user?.id;
                                                return (
                                                    <Box key={msg.id} sx={{
                                                        alignSelf: isMine ? 'flex-end' : 'flex-start',
                                                        maxWidth: '80%'
                                                    }}>
                                                        {!isMine && (
                                                            <Typography variant="caption" sx={{ ml: 1, mb: 0.5, display: 'block', fontWeight: 'bold', color: 'text.secondary' }}>
                                                                {msg.sender_name}
                                                            </Typography>
                                                        )}
                                                        <Box sx={glassChatBubble(isMine, false, false)}>
                                                            <Typography variant="body2">{msg.content}</Typography>
                                                        </Box>
                                                        <Typography variant="caption" sx={{
                                                            mt: 0.5, px: 1, display: 'block',
                                                            textAlign: isMine ? 'right' : 'left',
                                                            color: 'text.secondary', fontSize: '0.6rem'
                                                        }}>
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </Typography>
                                                    </Box>
                                                );
                                            })}
                                            <div ref={chatEndRef} />
                                        </Box>

                                        {/* Input Area */}
                                        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, alignItems: 'center' }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder="Communicate with unit..."
                                                value={messageContent}
                                                onChange={(e) => setMessageContent(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: '#f1f5f9' } }}
                                            />
                                            <IconButton
                                                color="primary"
                                                onClick={handleSendMessage}
                                                disabled={!messageContent.trim()}
                                                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}
                                            >
                                                <Send fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                    ) : (
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', p: 4, bgcolor: alpha('#fff', 0.5), borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                            <GroupWork sx={{ fontSize: 80, opacity: 0.1, mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">Select an operational unit to begin coordination.</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Access secure communication and unit-specific resources.</Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
}
