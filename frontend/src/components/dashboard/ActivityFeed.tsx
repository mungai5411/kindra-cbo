import { List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Paper, Box, Button, IconButton, alpha, useTheme } from '@mui/material';
import { Campaign, VolunteerActivism, FolderShared, Payments, Refresh } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface ActivityItem {
    id: string;
    type: 'donation' | 'volunteer' | 'case' | 'campaign';
    title: string;
    description: string;
    timestamp: string;
}

interface ActivityFeedProps {
    activities: ActivityItem[];
}

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
    const theme = useTheme();

    const getIcon = (type: string) => {
        switch (type) {
            case 'donation': return <Payments color="success" />;
            case 'volunteer': return <VolunteerActivism color="info" />;
            case 'case': return <FolderShared color="secondary" />;
            case 'campaign': return <Campaign color="warning" />;
            default: return <Campaign />;
        }
    };

    return (
        <Paper sx={{ p: 2, height: '100%', borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), boxShadow: theme.shadows[1] }} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold">Recent Activity</Typography>
                <Box>
                    <IconButton
                        size="small"
                        onClick={() => window.dispatchEvent(new CustomEvent('refresh-dashboard'))}
                        sx={{ mr: 0.5 }}
                    >
                        <Refresh fontSize="small" />
                    </IconButton>
                    <Button size="small">View All</Button>
                </Box>
            </Box>
            <List dense>
                {activities.map((activity) => {
                    const date = activity.timestamp ? new Date(activity.timestamp) : null;
                    const formattedDate = !date || isNaN(date.getTime()) ? 'Just now' : date.toLocaleDateString();

                    return (
                        <ListItem key={activity.id} divider sx={{ px: 1 }}>
                            <ListItemAvatar sx={{ minWidth: 40 }}>
                                <Avatar sx={{ bgcolor: 'background.default', width: 32, height: 32 }}>
                                    {getIcon(activity.type)}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={<Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{activity.title}</Typography>}
                                secondary={
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            lineHeight: 1.2,
                                            mt: 0.25
                                        }}
                                    >
                                        {activity.description}
                                    </Typography>
                                }
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, whiteSpace: 'nowrap', fontSize: '0.65rem', opacity: 0.7 }}>
                                {formattedDate}
                            </Typography>
                        </ListItem>
                    );
                })}
                {activities.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        No recent activity found
                    </Typography>
                )}
            </List>
        </Paper>
    );
};
