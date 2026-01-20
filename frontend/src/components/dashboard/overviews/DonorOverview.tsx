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
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>


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
                        title="My Total Giving"
                        value={`KES ${stats.myTotalDonations.toLocaleString()}`}
                        color="#5D5FEF"
                        icon={<Favorite />}
                        subtitle="Lifetime contribution"
                    />
                </Box>
                <Box sx={{ minWidth: { xs: 240, sm: 'calc(50% - 8px)', md: 'calc(33.33% - 12px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Donor Status"
                        value={impactRank}
                        color="#FF708B"
                        icon={<TrendingUp />}
                        subtitle="Community impact rank"
                    />
                </Box>
                <Box sx={{ minWidth: { xs: 240, sm: 'calc(50% - 8px)', md: 'calc(33.33% - 12px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Campaigns Supported"
                        value={String(stats.supportedCampaigns)}
                        color="#4ECCA3"
                        icon={<History />}
                        subtitle="Directly aided"
                    />
                </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} lg={8}>
                    <DonationTrendsChart data={charts.personalTrends} />
                </Grid>
                <Grid item xs={12} lg={4}>
                    <Paper sx={{
                        p: { xs: 2, sm: 2.5 },
                        height: '100%',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.1),
                        boxShadow: theme.shadows[1],
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Impact Spotlight</Typography>
                        <Box sx={{ flexGrow: 1, minHeight: 300 }}>
                            {charts.impactAllocation.length > 0 ? (
                                <FundAllocationChart
                                    data={charts.impactAllocation}
                                    title=""
                                    hideCard={true}
                                />
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', color: 'text.secondary' }}>
                                    <TrendingUp sx={{ fontSize: 48, opacity: 0.2, mb: 2 }} />
                                    <Typography variant="body2">No impact allocation data available yet.</Typography>
                                </Box>
                            )}
                        </Box>
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{
                                mt: 'auto',
                                borderRadius: 2,
                                py: 1,
                                fontWeight: 'bold',
                                textTransform: 'none',
                                background: theme.palette.primary.main,
                                '&:hover': {
                                    background: theme.palette.primary.dark,
                                    boxShadow: theme.shadows[4]
                                }
                            }}
                            startIcon={<Share />}
                            onClick={() => setShareMessage(true)}
                        >
                            Share My Impact
                        </Button>
                    </Paper>
                </Grid>
            </Grid>

            {/* Notification */}
            <Snackbar open={shareMessage} autoHideDuration={3000} onClose={() => setShareMessage(false)}>
                <Alert severity="success" sx={{ width: '100%', borderRadius: 3 }}>
                    Impact story copied to clipboard! Share it with your network.
                </Alert>
            </Snackbar>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Urgent Campaigns Need Your Support</Typography>
            <Grid container spacing={2}>
                {activeCampaigns.slice(0, 3).map((c: any) => (
                    <Grid item xs={12} md={4} key={c.id}>
                        <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), boxShadow: theme.shadows[1] }}>
                            <Typography variant="subtitle1" fontWeight="bold">{c.title}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{c.description?.substring(0, 100)}...</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" fontWeight="bold">Progress: {c.target_amount > 0 ? Math.round(((c.raised_amount || 0) / c.target_amount) * 100) : 0}%</Typography>
                                <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => onDonate?.(c)}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Donate
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};
