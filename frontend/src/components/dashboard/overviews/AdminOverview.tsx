import { Box, Grid } from '@mui/material';
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
                <Box sx={{ minWidth: { xs: 260, sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Total Donations"
                        value={`KES ${stats.totalDonations.toLocaleString()}`}
                        color="#519755" // Primary Green
                        icon={<Campaign />}
                        subtitle={`${stats.donationCount} donations`}
                        delay={0.1}
                    />
                </Box>
                <Box sx={{ minWidth: { xs: 260, sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Active Volunteers"
                        value={String(stats.activeVolunteers)}
                        color="#5D5FEF" // Vibrant Purple/Blue
                        icon={<VolunteerActivism />}
                        subtitle={`${stats.totalVolunteers} total`}
                        delay={0.2}
                    />
                </Box>
                <Box sx={{ minWidth: { xs: 260, sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Active Cases"
                        value={String(stats.activeCases)}
                        color="#FF708B" // Vibrant Pink
                        icon={<FolderShared />}
                        subtitle={`${stats.totalChildren} children`}
                        delay={0.3}
                    />
                </Box>
                <Box sx={{ minWidth: { xs: 260, sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }, flexShrink: 0 }}>
                    <StatsCard
                        title="Shelter Network"
                        value={String(stats.shelterCount)}
                        color="#FFBA69" // Vibrant Orange
                        icon={<Home />}
                        subtitle="Operational"
                        delay={0.4}
                    />
                </Box>
            </Box>

            <Grid container spacing={4} sx={{ mb: 6 }}>
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

            <Box sx={{ mt: 2 }}>
                <ActivityFeed activities={activities} />
            </Box>
        </Box>
    );
};
