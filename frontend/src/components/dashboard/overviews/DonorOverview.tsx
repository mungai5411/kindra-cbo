import { Box, Typography, Grid, Paper, Button, useTheme, Snackbar, Alert, alpha } from '@mui/material';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Favorite, TrendingUp, History, Share } from '@mui/icons-material';
import { StatsCard } from '../StatCards';
import {
    DonationTrendsChart,
    FundAllocationChart
} from '../../charts/DashboardCharts';

interface DonorOverviewProps {
    stats: {
        myTotalDonations: number;
        impactRank: string;
        supportedCampaigns: number;
    };
    charts: {
        personalTrends: any[];
        impactAllocation: any[];
    };
    activeCampaigns: any[];
    onDonate?: (campaign: any) => void;
}

export const DonorOverview = ({ stats, charts, activeCampaigns, onDonate }: DonorOverviewProps) => {
    const theme = useTheme();
    const [shareMessage, setShareMessage] = useState(false);

    const getImpactRank = (total: number) => {
        if (total >= 250000) return 'Platinum Partner';
        if (total >= 50000) return 'Gold Partner';
        if (total >= 10000) return 'Silver Partner';
        return 'Bronze Partner';
    };

    const impactRank = getImpactRank(stats.myTotalDonations);

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
                        title="My Total Giving"
                        value={`KES ${stats.myTotalDonations.toLocaleString()}`}
                        color="#519755"
                        icon={<Favorite />}
                        subtitle="Lifetime contribution"
                        delay={0.1}
                    />
                </Box>
                <Box sx={{ minWidth: { xs: 260, sm: 'calc(50% - 12px)', md: 'calc(33.33% - 20px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Donor Status"
                        value={impactRank}
                        color="#5D5FEF"
                        icon={<TrendingUp />}
                        subtitle="Community impact rank"
                        delay={0.2}
                    />
                </Box>
                <Box sx={{ minWidth: { xs: 260, sm: 'calc(50% - 12px)', md: 'calc(33.33% - 20px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Campaigns Supported"
                        value={String(stats.supportedCampaigns)}
                        color="#FF708B"
                        icon={<History />}
                        subtitle="Directly aided"
                        delay={0.3}
                    />
                </Box>
            </Box>

            <Grid container spacing={4} sx={{ mb: 6 }}>
                <Grid item xs={12} lg={8}>
                    <DonationTrendsChart data={charts.personalTrends} />
                </Grid>
                <Grid item xs={12} lg={4}>
                    <Paper elevation={0} sx={{
                        p: 3,
                        height: '100%',
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.08),
                        bgcolor: 'background.paper',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, letterSpacing: -0.5 }}>Impact Spotlight</Typography>
                        <Box sx={{ flexGrow: 1, minHeight: 300 }}>
                            {charts.impactAllocation.length > 0 ? (
                                <FundAllocationChart
                                    data={charts.impactAllocation}
                                    title=""
                                    hideCard={true}
                                />
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', color: 'text.secondary', opacity: 0.5 }}>
                                    <TrendingUp sx={{ fontSize: 48, mb: 2 }} />
                                    <Typography variant="body2" fontWeight="600">No impact data yet</Typography>
                                </Box>
                            )}
                        </Box>
                        <Button
                            fullWidth
                            variant="contained"
                            disableElevation
                            sx={{
                                mt: 4,
                                borderRadius: 3,
                                py: 1.5,
                                fontWeight: 800,
                                textTransform: 'none',
                                background: theme.palette.primary.main,
                                '&:hover': {
                                    background: theme.palette.primary.dark,
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`
                                },
                                transition: 'all 0.3s'
                            }}
                            startIcon={<Share />}
                            onClick={() => {
                                navigator.clipboard.writeText(`I've achieved ${impactRank} status on Kindra CBO! Proud to support ${stats.supportedCampaigns} campaigns. Join me in making a difference!`);
                                setShareMessage(true);
                            }}
                        >
                            Share My Impact
                        </Button>
                    </Paper>
                </Grid>
            </Grid>

            {/* Notification */}
            <Snackbar open={shareMessage} autoHideDuration={3000} onClose={() => setShareMessage(false)}>
                <Alert severity="success" sx={{ width: '100%', borderRadius: 3, fontWeight: 700 }}>
                    Impact story copied to clipboard!
                </Alert>
            </Snackbar>

            <Box sx={{ mb: 3, px: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>Urgent Opportunities</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.7, fontWeight: 500 }}>Support these critical missions today</Typography>
            </Box>

            <Grid container spacing={3}>
                {activeCampaigns.slice(0, 3).map((c: any) => {
                    const progress = c.target_amount > 0 ? Math.round(((c.raised_amount || 0) / c.target_amount) * 100) : 0;
                    return (
                        <Grid item xs={12} md={4} key={c.id}>
                            <Paper elevation={0} sx={{
                                p: 3,
                                borderRadius: 4,
                                border: '1px solid',
                                borderColor: alpha(theme.palette.divider, 0.08),
                                bgcolor: 'background.paper',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    borderColor: theme.palette.primary.main,
                                    boxShadow: '0 12px 30px rgba(0,0,0,0.04)'
                                }
                            }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, color: progress >= 90 ? 'error.main' : 'text.primary' }}>
                                    {c.title}
                                </Typography>
                                <Typography variant="body2" sx={{
                                    color: 'text.secondary',
                                    mb: 3,
                                    lineHeight: 1.5,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    height: '3em'
                                }}>
                                    {c.description}
                                </Typography>
                                <Box sx={{ mb: 2.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>Progress</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main' }}>{progress}%</Typography>
                                    </Box>
                                    <Box sx={{ width: '100%', height: 6, bgcolor: alpha(theme.palette.divider, 0.1), borderRadius: 3, overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            style={{ height: '100%', background: theme.palette.primary.main, borderRadius: 3 }}
                                        />
                                    </Box>
                                </Box>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={() => onDonate?.(c)}
                                    sx={{
                                        borderRadius: 2.5,
                                        textTransform: 'none',
                                        fontWeight: 800,
                                        borderWidth: 2,
                                        '&:hover': { borderWidth: 2 }
                                    }}
                                >
                                    Contribute Now
                                </Button>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};
