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
                Case Load Overview
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
                        title="Assigned Children"
                        value={String(stats.assignedChildren)}
                        color="#5D5FEF"
                        icon={<ChildCare />}
                        subtitle="Primary care cases"
                        delay={0}
                    />
                </Box>
                <Box sx={{ minWidth: { xs: 240, sm: 'calc(50% - 8px)', md: 'calc(33.33% - 12px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Assessments Due"
                        value={String(stats.pendingAssessments)}
                        color="#FF708B"
                        icon={<AssignmentLate />}
                        subtitle="Needs attention"
                        delay={0.1}
                    />
                </Box>
                <Box sx={{ minWidth: { xs: 240, sm: 'calc(50% - 8px)', md: 'calc(33.33% - 12px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Total Active cases"
                        value={String(stats.totalCases)}
                        color="#4ECCA3"
                        icon={<Assessment />}
                        subtitle="Full registry"
                        delay={0.2}
                    />
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <Paper sx={{
                        p: 0,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.1),
                        boxShadow: theme.shadows[1],
                        overflow: 'hidden'
                    }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h6" fontWeight="bold">Recent Case Updates</Typography>
                        </Box>
                        <List sx={{ p: 0 }}>
                            {recentCases.map((c: any) => (
                                <ListItem key={c.id} divider sx={{ px: 3, py: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                                    <ListItemAvatar>
                                        <Avatar sx={{
                                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                            color: 'secondary.main'
                                        }}>
                                            <ChildCare />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={c.child_name || `Case #${c.case_number}`}
                                        secondary={
                                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                                    {c.status}
                                                </Typography>
                                                <Typography variant="caption" color="text.disabled">•</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {(() => {
                                                        if (!c.updated_at) return 'N/A';
                                                        const date = new Date(c.updated_at);
                                                        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
                                                    })()}
                                                </Typography>
                                            </Box>
                                        }
                                        primaryTypographyProps={{ fontWeight: 600 }}
                                    />
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                                    >
                                        Detail
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                        <Box sx={{ p: 2 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={onNavigate}
                                sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, borderStyle: 'dashed' }}
                            >
                                View Case Registry
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Paper sx={{
                        p: { xs: 2, sm: 2.5 },
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.1),
                        boxShadow: theme.shadows[1],
                        bgcolor: 'background.paper',
                        height: '100%'
                    }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <HistoryEdu color="primary" /> Reporting Status
                        </Typography>
                        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {pendingTasks.map((t: any, idx) => (
                                <Box key={idx} sx={{
                                    p: 2.5,
                                    borderRadius: 3,
                                    bgcolor: alpha(theme.palette.background.default, 0.5),
                                    border: '1px solid',
                                    borderColor: 'divider'
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="subtitle2" fontWeight="bold">{t.title}</Typography>
                                        <Typography variant="caption" fontWeight="bold" color="primary.main">In Progress</Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                                        Required for: {t.target}
                                    </Typography>
                                    <Box sx={{ mt: 1, width: '100%', height: 6, bgcolor: 'divider', borderRadius: 4, overflow: 'hidden' }}>
                                        <Box sx={{ width: '40%', height: '100%', bgcolor: 'primary.main', borderRadius: 4 }} />
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
