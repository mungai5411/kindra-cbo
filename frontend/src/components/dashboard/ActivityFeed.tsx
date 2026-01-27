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
            case 'donation': return <Payments fontSize="small" />;
            case 'volunteer': return <VolunteerActivism fontSize="small" />;
            case 'case': return <FolderShared fontSize="small" />;
            case 'campaign': return <Campaign fontSize="small" />;
            default: return <Campaign fontSize="small" />;
        }
    };

    const getColors = (type: string) => {
        switch (type) {
            case 'donation': return { main: '#4ECCA3', light: alpha('#4ECCA3', 0.1) };
            case 'volunteer': return { main: '#5D5FEF', light: alpha('#5D5FEF', 0.1) };
            case 'case': return { main: '#FF708B', light: alpha('#FF708B', 0.1) };
            case 'campaign': return { main: '#FFBA69', light: alpha('#FFBA69', 0.1) };
            default: return { main: theme.palette.primary.main, light: alpha(theme.palette.primary.main, 0.1) };
        }
    };

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            sx={{ mt: 2 }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center', px: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5, color: 'text.primary' }}>
                    Recent Activity
                </Typography>
                <Button
                    size="small"
                    sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        color: 'primary.main',
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                    }}
                >
                    View History
                </Button>
            </Box>

            <Paper elevation={0} sx={{
                borderRadius: 4,
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.08),
                overflow: 'hidden',
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
            }}>
                <List disablePadding>
                    {activities.map((activity, index) => {
                        const date = activity.timestamp ? new Date(activity.timestamp) : null;
                        const formattedDate = !date || isNaN(date.getTime()) ? 'Just now' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                        const colors = getColors(activity.type);

                        return (
                            <ListItem
                                key={activity.id}
                                divider={index !== activities.length - 1}
                                sx={{
                                    py: 2.5,
                                    px: 3,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: alpha(colors.main, 0.03),
                                        '& .MuiAvatar-root': {
                                            transform: 'scale(1.1)',
                                            boxShadow: `0 4px 12px ${alpha(colors.main, 0.2)}`
                                        }
                                    }
                                }}
                            >
                                <ListItemAvatar sx={{ minWidth: 60 }}>
                                    <Avatar sx={{
                                        bgcolor: colors.light,
                                        width: 44,
                                        height: 44,
                                        color: colors.main,
                                        transition: 'all 0.3s ease',
                                        border: '1.5px solid',
                                        borderColor: alpha(colors.main, 0.2)
                                    }}>
                                        {getIcon(activity.type)}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.2 }}>
                                            {activity.title}
                                        </Typography>
                                    }
                                    secondary={
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: 'text.secondary',
                                                    lineHeight: 1.4,
                                                    fontWeight: 500,
                                                    opacity: 0.8
                                                }}
                                            >
                                                {activity.description}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                                <Box sx={{
                                                    px: 1,
                                                    py: 0.2,
                                                    borderRadius: 1,
                                                    bgcolor: alpha(colors.main, 0.08),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5
                                                }}>
                                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: colors.main }} />
                                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 800, color: colors.main, textTransform: 'uppercase' }}>
                                                        {activity.type}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.disabled' }}>
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
                        <Box sx={{ textAlign: 'center', py: 10, opacity: 0.5 }}>
                            <Typography variant="body1" fontWeight="600">
                                Nothing to show yet
                            </Typography>
                            <Typography variant="body2">
                                Your recent activities will appear here
                            </Typography>
                        </Box>
                    )}
                </List>
            </Paper>
        </Box>
    );
};
