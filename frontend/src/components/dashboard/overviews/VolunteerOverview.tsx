import { Box, Typography, Grid, Paper, Button, useTheme, Avatar, Chip, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { Assignment, AccessTime, EmojiEvents, ArrowForward } from '@mui/icons-material';
import { StatsCard } from '../StatCards';

interface VolunteerOverviewProps {
    stats: {
        totalHours: number;
        pendingTasks: number;
        upcomingEvents: number;
    };
    tasks: any[];
    onNavigate?: () => void;
}

export const VolunteerOverview = ({ stats, tasks, onNavigate }: VolunteerOverviewProps) => {
    const theme = useTheme();

    return (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Your Service Summary</Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                    <StatsCard
                        title="Service Hours"
                        value={String(stats.totalHours)}
                        color={theme.palette.primary.main}
                        icon={<AccessTime />}
                        subtitle="Lifetime contribution"
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatsCard
                        title="Pending Tasks"
                        value={String(stats.pendingTasks)}
                        color={theme.palette.warning.main}
                        icon={<Assignment />}
                        subtitle="Action required"
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatsCard
                        title="Events"
                        value={String(stats.upcomingEvents)}
                        color={theme.palette.success.main}
                        icon={<EmojiEvents />}
                        subtitle="Upcoming sessions"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), boxShadow: theme.shadows[1] }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>My Active Tasks</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            {tasks.length > 0 ? tasks.map((t: any) => (
                                <Box key={t.id} sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', borderLeft: '4px solid', borderColor: t.priority === 'HIGH' ? 'error.main' : 'primary.main' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="subtitle2" fontWeight="bold">{t.title}</Typography>
                                        <Chip label={t.status} size="small" variant="outlined" />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">Due: {new Date(t.due_date).toLocaleDateString()}</Typography>
                                </Box>
                            )) : (
                                <Typography color="text.secondary">No pending tasks. Great job!</Typography>
                            )}
                        </Box>
                        <Button
                            fullWidth
                            variant="text"
                            sx={{ mt: 2 }}
                            endIcon={<ArrowForward />}
                            onClick={onNavigate}
                        >
                            View All Tasks
                        </Button>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), boxShadow: theme.shadows[2], bgcolor: 'secondary.dark', color: 'white' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Community Leaderboard</Typography>
                        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {[
                                { name: 'Sarah J.', hours: 120, pos: 1 },
                                { name: 'You', hours: stats.totalHours, pos: 2 },
                                { name: 'Michael K.', hours: 85, pos: 3 },
                            ].map((v, idx) => (
                                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="h6" fontWeight="bold" sx={{ opacity: 0.5, minWidth: 20 }}>#{v.pos}</Typography>
                                    <Avatar sx={{ bgcolor: 'secondary.light' }}>{v.name[0]}</Avatar>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="body2" fontWeight="bold">{v.name}</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.8 }}>{v.hours} Hours tracked</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};
