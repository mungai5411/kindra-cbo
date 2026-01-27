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
        <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            sx={{ mt: 1 }}
        >
            <Box sx={{
                display: 'flex',
                gap: 3,
                mb: 6,
                overflowX: { xs: 'auto', sm: 'unset' },
                pb: { xs: 2, sm: 0 },
                px: { xs: 0.5, sm: 0.5 },
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
                flexWrap: { xs: 'nowrap', sm: 'wrap' }
            }}>
                <Box sx={{ minWidth: { xs: 260, sm: 'calc(50% - 12px)', md: 'calc(33.33% - 20px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Service Hours"
                        value={String(stats.totalHours)}
                        color="#519755"
                        icon={<AccessTime />}
                        subtitle="Lifetime contribution"
                        delay={0.1}
                    />
                </Box>
                <Box sx={{ minWidth: { xs: 260, sm: 'calc(50% - 12px)', md: 'calc(33.33% - 20px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Pending Tasks"
                        value={String(stats.pendingTasks)}
                        color="#FF708B"
                        icon={<Assignment />}
                        subtitle="Action required"
                        delay={0.2}
                    />
                </Box>
                <Box sx={{ minWidth: { xs: 260, sm: 'calc(50% - 12px)', md: 'calc(33.33% - 20px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Events"
                        value={String(stats.upcomingEvents)}
                        color="#5D5FEF"
                        icon={<EmojiEvents />}
                        subtitle="Upcoming sessions"
                        delay={0.3}
                    />
                </Box>
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                    <Paper elevation={0} sx={{
                        p: 3,
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.08),
                        bgcolor: 'background.paper',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, letterSpacing: -0.5 }}>Active Tasks</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
                            {tasks.length > 0 ? tasks.map((t: any) => (
                                <Paper key={t.id} elevation={0} sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.primary.main, 0.08),
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                                        transform: 'translateX(4px)'
                                    }
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{t.title}</Typography>
                                        <Chip
                                            label={t.status}
                                            size="small"
                                            variant="filled"
                                            sx={{
                                                fontWeight: 800,
                                                fontSize: '0.65rem',
                                                bgcolor: t.priority === 'HIGH' ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.primary.main, 0.1),
                                                color: t.priority === 'HIGH' ? 'error.main' : 'primary.main',
                                                borderRadius: 1.5
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                        Due: {new Date(t.due_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                                    </Typography>
                                </Paper>
                            )) : (
                                <Box sx={{ textAlign: 'center', py: 6, opacity: 0.5 }}>
                                    <EmojiEvents sx={{ fontSize: 48, mb: 2, opacity: 0.2 }} />
                                    <Typography variant="body2" fontWeight="800">All tasks completed!</Typography>
                                </Box>
                            )}
                        </Box>
                        <Button
                            fullWidth
                            variant="text"
                            sx={{
                                mt: 3,
                                fontWeight: 800,
                                textTransform: 'none',
                                color: 'primary.main',
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                            }}
                            endIcon={<ArrowForward />}
                            onClick={onNavigate}
                        >
                            Explore Tasks
                        </Button>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Paper elevation={0} sx={{
                        p: 3,
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.08),
                        bgcolor: 'primary.main',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: -50,
                            right: -50,
                            width: 200,
                            height: 200,
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                            filter: 'blur(40px)'
                        }
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 4, letterSpacing: -0.5, position: 'relative' }}>Leaderboard</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, position: 'relative' }}>
                            {[
                                { name: 'Sarah J.', hours: 120, pos: 1 },
                                { name: 'You', hours: stats.totalHours, pos: 2 },
                                { name: 'Michael K.', hours: 85, pos: 3 },
                            ].map((v, idx) => (
                                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 900, opacity: 0.5, minWidth: 24, fontStyle: 'italic' }}>{v.pos}</Typography>
                                    <Avatar sx={{
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        width: 48,
                                        height: 48,
                                        fontWeight: 800
                                    }}>{v.name[0]}</Avatar>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1 }}>{v.name}</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 700 }}>{v.hours} Hours contributed</Typography>
                                    </Box>
                                    {v.pos === 1 && <EmojiEvents sx={{ color: '#FFD700' }} />}
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};
