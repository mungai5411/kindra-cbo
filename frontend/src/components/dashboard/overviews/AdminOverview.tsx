import { Box, Typography, Grid, useTheme } from '@mui/material';
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
    const theme = useTheme();
    const deviceType = useDeviceType();
    const isMobile = deviceType === 'MOBILE';

    return (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Typography
                variant={isMobile ? "h6" : "h5"}
                fontWeight="bold"
                sx={{
                    mb: isMobile ? 2 : 3,
                    color: theme.palette.text.primary,
                    textShadow: 'none'
                }}
            >
                Global System Performance
            </Typography>

            <Grid container spacing={2} sx={{ mb: isMobile ? 2 : 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Total Donations"
                        value={`KES ${stats.totalDonations.toLocaleString()}`}
                        color={theme.palette.success.main}
                        icon={<Campaign />}
                        subtitle={`${stats.donationCount} donations`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Active Volunteers"
                        value={String(stats.activeVolunteers)}
                        color={theme.palette.info.main}
                        icon={<VolunteerActivism />}
                        subtitle={`${stats.totalVolunteers} total`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Active Cases"
                        value={String(stats.activeCases)}
                        color={theme.palette.secondary.main}
                        icon={<FolderShared />}
                        subtitle={`${stats.totalChildren} children`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Shelter Network"
                        value={String(stats.shelterCount)}
                        color={theme.palette.warning.main}
                        icon={<Home />}
                        subtitle="Operational"
                    />
                </Grid>
            </Grid>

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
