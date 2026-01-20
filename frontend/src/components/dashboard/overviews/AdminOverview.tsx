import { Box, Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { Campaign, VolunteerActivism, FolderShared, Home } from '@mui/icons-material';
import { StatsCard } from '../StatCards';
import { ActivityFeed } from '../ActivityFeed';
import {
    DonationTrendsChart,
    CampaignProgressChart,
    DonationMethodsChart,
    ShelterCapacityChart
} from '../../charts/DashboardCharts';
import { useDeviceType } from '../../../hooks/useDeviceType';

interface AdminOverviewProps {
    stats: {
        totalDonations: number;
        donationCount: number;
        activeVolunteers: number;
        totalVolunteers: number;
        activeCases: number;
        totalChildren: number;
        shelterCount: number;
    };
    charts: {
        donationTrends: any[];
        campaignProgress: any[];
        donationMethods: any[];
        shelterCapacity: any[];
    };
    activities: any[];
}

export const AdminOverview = ({ stats, charts, activities }: AdminOverviewProps) => {
    const deviceType = useDeviceType();
    const isMobile = deviceType === 'MOBILE';

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
                <Box sx={{ minWidth: { xs: 240, sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Total Donations"
                        value={`KES ${stats.totalDonations.toLocaleString()}`}
                        color="#5D5FEF" // Vibrant Purple from insight
                        icon={<Campaign />}
                        subtitle={`${stats.donationCount} donations`}
                    />
                </Box>
                <Box sx={{ minWidth: { xs: 240, sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Active Volunteers"
                        value={String(stats.activeVolunteers)}
                        color="#FF708B" // Vibrant Pink
                        icon={<VolunteerActivism />}
                        subtitle={`${stats.totalVolunteers} total`}
                    />
                </Box>
                <Box sx={{ minWidth: { xs: 240, sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Active Cases"
                        value={String(stats.activeCases)}
                        color="#FFBA69" // Vibrant Orange
                        icon={<FolderShared />}
                        subtitle={`${stats.totalChildren} children`}
                    />
                </Box>
                <Box sx={{ minWidth: { xs: 240, sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Shelter Network"
                        value={String(stats.shelterCount)}
                        color="#4ECCA3" // Vibrant Green
                        icon={<Home />}
                        subtitle="Operational"
                    />
                </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: isMobile ? 2 : 3 }}>
                <Grid item xs={12} lg={8}>
                    <DonationTrendsChart data={charts.donationTrends} />
                </Grid>
                <Grid item xs={12} lg={4}>
                    <DonationMethodsChart data={charts.donationMethods} />
                </Grid>
                <Grid item xs={12} lg={6}>
                    <CampaignProgressChart campaigns={charts.campaignProgress} />
                </Grid>
                <Grid item xs={12} lg={6}>
                    <ShelterCapacityChart shelters={charts.shelterCapacity} />
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <ActivityFeed activities={activities} />
                </Grid>
            </Grid>
        </Box>
    );
};
