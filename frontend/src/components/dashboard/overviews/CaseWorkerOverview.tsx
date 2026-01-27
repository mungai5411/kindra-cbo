import { Box, Typography, Grid, Paper, Button, useTheme, List, ListItem, ListItemText, ListItemAvatar, Avatar, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { ChildCare, Assessment, AssignmentLate, HistoryEdu } from '@mui/icons-material';
import { StatsCard } from '../StatCards';

interface CaseWorkerOverviewProps {
    stats: {
        assignedChildren: number;
        pendingAssessments: number;
        totalCases: number;
    };
    recentCases: any[];
    pendingTasks: any[];
    onNavigate?: () => void;
}

export const CaseWorkerOverview = ({ stats, recentCases, pendingTasks, onNavigate }: CaseWorkerOverviewProps) => {
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
                        title="Assigned Children"
                        value={String(stats.assignedChildren)}
                        color="#519755"
                        icon={<ChildCare />}
                        subtitle="Primary care cases"
                        delay={0.1}
                    />
                </Box>
                <Box sx={{ minWidth: { xs: 260, sm: 'calc(50% - 12px)', md: 'calc(33.33% - 20px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Assessments Due"
                        value={String(stats.pendingAssessments)}
                        color="#FF708B"
                        icon={<AssignmentLate />}
                        subtitle="Needs attention"
                        delay={0.2}
                    />
                </Box>
                <Box sx={{ minWidth: { xs: 260, sm: 'calc(50% - 12px)', md: 'calc(33.33% - 20px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Active Projects"
                        value={String(stats.totalCases)}
                        color="#5D5FEF"
                        icon={<Assessment />}
                        subtitle="Full registry"
                        delay={0.3}
                    />
                </Box>
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                    <Paper elevation={0} sx={{
                        p: 0,
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.08),
                        bgcolor: 'background.paper',
                        overflow: 'hidden',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.05) }}>
                            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>Recent Case Updates</Typography>
                        </Box>
                        <List sx={{ p: 0, flexGrow: 1 }}>
                            {recentCases.map((c: any, index) => (
                                <ListItem
                                    key={c.id}
                                    divider={index !== recentCases.length - 1}
                                    sx={{
                                        px: 3,
                                        py: 2.5,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                                            '& .MuiAvatar-root': { transform: 'scale(1.1)' }
                                        }
                                    }}
                                >
                                    <ListItemAvatar sx={{ minWidth: 60 }}>
                                        <Avatar sx={{
                                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                            color: 'secondary.main',
                                            width: 44,
                                            height: 44,
                                            transition: 'transform 0.3s ease'
                                        }}>
                                            <ChildCare fontSize="small" />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="body1" sx={{ fontWeight: 800 }}>
                                                {c.child_name || `Case #${c.case_number}`}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase' }}>
                                                    {c.status}
                                                </Typography>
                                                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                    {(() => {
                                                        if (!c.updated_at) return 'N/A';
                                                        const date = new Date(c.updated_at);
                                                        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                                    })()}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                    <Button
                                        size="small"
                                        variant="text"
                                        sx={{
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: 800,
                                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                                            px: 2,
                                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                        }}
                                    >
                                        View
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                        <Box sx={{ p: 3, mt: 'auto' }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={onNavigate}
                                sx={{
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    py: 1.5,
                                    borderStyle: 'dashed',
                                    borderWidth: 2,
                                    '&:hover': { borderWidth: 2 }
                                }}
                            >
                                Full Case Registry
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={5}>
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
                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5, letterSpacing: -0.5 }}>
                            <HistoryEdu color="primary" /> Reporting Status
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {pendingTasks.map((t: any, idx) => (
                                <Paper key={idx} elevation={0} sx={{
                                    p: 2.5,
                                    borderRadius: 3,
                                    bgcolor: alpha(theme.palette.background.default, 0.7),
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.divider, 0.05),
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        borderColor: alpha(theme.palette.primary.main, 0.2),
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.03)'
                                    }
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{t.title}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                Target: {t.target}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label="In Progress"
                                            size="small"
                                            sx={{
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                color: 'primary.main',
                                                fontWeight: 800,
                                                fontSize: '0.6rem'
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ flexGrow: 1, height: 6, bgcolor: alpha(theme.palette.divider, 0.1), borderRadius: 3, overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: '45%' }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                style={{ height: '100%', background: theme.palette.primary.main, borderRadius: 3 }}
                                            />
                                        </Box>
                                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary' }}>45%</Typography>
                                    </Box>
                                </Paper>
                            ))}
                            {pendingTasks.length === 0 && (
                                <Box sx={{ textAlign: 'center', py: 6, opacity: 0.5 }}>
                                    <CheckCircle sx={{ fontSize: 48, mb: 2, opacity: 0.1, color: 'success.main' }} />
                                    <Typography variant="body2" fontWeight="800">All reports submitted</Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};
