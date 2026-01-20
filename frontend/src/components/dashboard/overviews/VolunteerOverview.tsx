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
            <Typography
                variant="h6"
                fontWeight="900"
                sx={{
                    mb: 2,
                    color: 'text.primary',
                    letterSpacing: -0.5
                }}
            >
                Ongoing Tasks
            </Typography>

            <Box sx={{
                display: 'flex',
                gap: 2,
                mb: 4,
                overflowX: { xs: 'auto', sm: 'unset' },
                pb: { xs: 2, sm: 0 },
                px: { xs: 0.5, sm: 0 },
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
                flexWrap: { xs: 'nowrap', sm: 'wrap' }
            }}>
                <Box sx={{ minWidth: { xs: 240, sm: 'calc(50% - 8px)', md: 'calc(33.33% - 12px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Service Hours"
                        value={String(stats.totalHours)}
                        color="#5D5FEF"
                        icon={<AccessTime />}
                        subtitle="Lifetime contribution"
                    />
                </Box>
                <Box sx={{ minWidth: { xs: 240, sm: 'calc(50% - 8px)', md: 'calc(33.33% - 12px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Pending Tasks"
                        value={String(stats.pendingTasks)}
                        color="#FF708B"
                        icon={<Assignment />}
                        subtitle="Action required"
                    />
                </Box>
                <Box sx={{ minWidth: { xs: 240, sm: 'calc(50% - 8px)', md: 'calc(33.33% - 12px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Events"
                        value={String(stats.upcomingEvents)}
                        color="#4ECCA3"
                        icon={<EmojiEvents />}
                        subtitle="Upcoming sessions"
                    />
                </Box>
            </Box>

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
