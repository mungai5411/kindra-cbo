import { List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Paper, Box, Button, alpha, useTheme } from '@mui/material';
import { Campaign, VolunteerActivism, FolderShared, Payments } from '@mui/icons-material';
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
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: -0.5 }}>Past Activity</Typography>
                <Button size="small" sx={{ textTransform: 'none', fontWeight: 700, color: '#5D5FEF' }}>View All</Button>
            </Box>

            <Paper elevation={0} sx={{
                borderRadius: 4,
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.08),
                overflow: 'hidden',
                bgcolor: 'white'
            }}>
                <List disablePadding>
                    {activities.map((activity, index) => {
                        const date = activity.timestamp ? new Date(activity.timestamp) : null;
                        const formattedDate = !date || isNaN(date.getTime()) ? 'Just now' : date.toLocaleDateString();

                        return (
                            <ListItem
                                key={activity.id}
                                divider={index !== activities.length - 1}
                                sx={{
                                    py: 2,
                                    px: 2,
                                    transition: 'background 0.2s',
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.01) }
                                }}
                            >
                                <ListItemAvatar sx={{ minWidth: 52 }}>
                                    <Avatar sx={{
                                        bgcolor: alpha(
                                            activity.type === 'donation' ? '#4ECCA3' :
                                                activity.type === 'volunteer' ? '#5D5FEF' :
                                                    activity.type === 'case' ? '#FF708B' : '#FFBA69',
                                            0.1
                                        ),
                                        width: 40,
                                        height: 40,
                                        color:
                                            activity.type === 'donation' ? '#4ECCA3' :
                                                activity.type === 'volunteer' ? '#5D5FEF' :
                                                    activity.type === 'case' ? '#FF708B' : '#FFBA69'
                                    }}>
                                        {getIcon(activity.type)}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="body2" fontWeight="700" sx={{ color: 'text.primary' }}>
                                            {activity.title}
                                        </Typography>
                                    }
                                    secondary={
                                        <Box>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    display: 'block',
                                                    lineHeight: 1.3,
                                                    mt: 0.25,
                                                    fontWeight: 500
                                                }}
                                            >
                                                {activity.description}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
                                                    {formattedDate}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        );
                    })}
                    {activities.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <Typography variant="body2" color="text.secondary" fontWeight="500">
                                No recent activity found
                            </Typography>
                        </Box>
                    )}
                </List>
            </Paper>
        </Box>
    );
};
