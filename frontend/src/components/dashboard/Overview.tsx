import { useEffect, useCallback, useState } from 'react';
import { Box, Typography, CircularProgress, useTheme, Card, alpha, Button } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchDashboardData } from '../../features/reporting/reportingSlice';
import { fetchVolunteers, fetchTasks, fetchEvents } from '../../features/volunteers/volunteersSlice';
import { fetchCampaigns, fetchDonations } from '../../features/donations/donationsSlice';
import { fetchCases } from '../../features/cases/casesSlice';
import { fetchShelters, fetchIncidents } from '../../features/shelters/shelterSlice';
import {
    aggregateDonationsByDay,
    calculateCampaignProgress,
    getShelterCapacityData,
    getDonationMethodBreakdown
} from '../../utils/chartData';

// Role-Specific Overviews
import { AdminOverview } from './overviews/AdminOverview';
import { DonorOverview } from './overviews/DonorOverview';
import { VolunteerOverview } from './overviews/VolunteerOverview';
import { CaseWorkerOverview } from './overviews/CaseWorkerOverview';
import { ShelterPartnerOverview } from './overviews/ShelterPartnerOverview';

interface OverviewProps {
    setActiveTab: (tab: string) => void;
    setOpenDonationDialog: (campaign: any) => void;
}

export const Overview = ({ setActiveTab, setOpenDonationDialog }: OverviewProps) => {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const { dashboardData, isLoading: dashboardLoading } = useSelector((state: RootState) => state.reporting);

    // Keep individual slices for specific lists if needed, but rely on dashboardData for stats
    const { volunteers, tasks, events } = useSelector((state: RootState) => state.volunteers);
    const { campaigns, donations: donationRecords } = useSelector((state: RootState) => state.donations);
    const { cases, children } = useSelector((state: RootState) => state.cases);
    const { shelters, incidents } = useSelector((state: RootState) => state.shelters);

    const [showGreeting, setShowGreeting] = useState(false);

    // Check for daily greeting logic
    useEffect(() => {
        const today = new Date().toLocaleDateString();
        const lastSeen = localStorage.getItem('last_welcome_date');

        if (lastSeen !== today) {
            setShowGreeting(true);
            localStorage.setItem('last_welcome_date', today);
        }
    }, []);

    const handleRefresh = useCallback(() => {
        dispatch(fetchDashboardData());
        dispatch(fetchCampaigns());
        dispatch(fetchDonations());
        dispatch(fetchVolunteers());
        dispatch(fetchCases());
        dispatch(fetchTasks());
        dispatch(fetchEvents());
        dispatch(fetchShelters());
        dispatch(fetchIncidents());
    }, [dispatch]);

    useEffect(() => {
        window.addEventListener('refresh-dashboard', handleRefresh);

        // Initial sync
        handleRefresh();

        return () => window.removeEventListener('refresh-dashboard', handleRefresh);
    }, [handleRefresh]);

    const isLoading = dashboardLoading;

    if (isLoading && !dashboardData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    // Shared Data Preparation
    const donationTrends = aggregateDonationsByDay(donationRecords);
    const campaignProgress = calculateCampaignProgress(campaigns);
    const donationMethods = getDonationMethodBreakdown(donationRecords);
    const shelterCapacity = getShelterCapacityData(shelters);

    // Activity aggregation (Enhanced for all roles)
    const activities: any[] = [
        ...donationRecords.map((d: any) => ({
            id: `don-${d.id}`,
            type: 'donation' as const,
            title: 'New Donation Received',
            description: `${d.donor_name || 'Anonymous'} donated KES ${(d.amount || 0).toLocaleString()} to ${d.campaign_title || 'General Fund'}`,
            timestamp: d.donation_date
        })),
        ...volunteers.slice(0, 5).map((v: any) => ({
            id: `vol-${v.id}`,
            type: 'volunteer' as const,
            title: 'Volunteer Update',
            description: `${v.full_name} status: ${v.status}`,
            timestamp: v.created_at || new Date().toISOString()
        })),
        ...cases.slice(0, 5).map((c: any) => ({
            id: `case-${c.id}`,
            type: 'case' as const,
            title: 'New Case Added',
            description: `Case ${c.case_number} for ${c.child_name}`,
            timestamp: c.created_at || new Date().toISOString()
        }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 6);

    const renderRoleSpecificOverview = () => {
        const role = user?.role;
        const isAdmin = user?.is_superuser || role === 'ADMIN';

        if (isAdmin) {
            return (
                <AdminOverview
                    stats={{
                        totalDonations: dashboardData?.donations?.total_this_year || 0,
                        donationCount: donationRecords.length,
                        activeVolunteers: dashboardData?.overview?.active_volunteers || 0,
                        totalVolunteers: volunteers.length,
                        activeCases: dashboardData?.overview?.active_cases || 0,
                        totalChildren: dashboardData?.overview?.total_children || 0,
                        shelterCount: dashboardData?.shelter_homes?.total_homes || 0
                    }}
                    charts={{ donationTrends, campaignProgress, donationMethods, shelterCapacity }}
                    activities={activities}
                />
            );
        }

        switch (role) {
            case 'DONOR': {
                const myDonations = donationRecords.filter(d =>
                    (user?.email && d.donor_email === user.email) ||
                    (user?.donorId && d.donor === user.donorId)
                );

                const calculateImpactAllocation = (donations: any[]) => {
                    const allocation: Record<string, number> = {};
                    donations.forEach(d => {
                        const campaign = campaigns.find(c => c.id === d.campaign || c.slug === d.campaign);
                        const category = campaign?.category || 'OTHER';
                        const amount = Number(d.amount) || 0;
                        allocation[category] = (allocation[category] || 0) + amount;
                    });

                    return Object.entries(allocation).map(([name, value]) => ({
                        name: name.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
                        value
                    }));
                };

                return (
                    <DonorOverview
                        stats={{
                            myTotalDonations: myDonations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0),
                            impactRank: 'Silver Partner', // Will be dynamic inside DonorOverview
                            supportedCampaigns: new Set(myDonations.map(d => d.campaign)).size
                        }}
                        charts={{
                            personalTrends: aggregateDonationsByDay(myDonations),
                            impactAllocation: calculateImpactAllocation(myDonations)
                        }}
                        activeCampaigns={campaigns.filter(c => c.status === 'ACTIVE')}
                        onDonate={setOpenDonationDialog}
                    />
                );
            }
            case 'VOLUNTEER':
                return (
                    <VolunteerOverview
                        stats={{
                            totalHours: dashboardData?.volunteers?.total_hours_this_year || 0,
                            pendingTasks: tasks.filter(t => t.status === 'PENDING').length,
                            upcomingEvents: events.filter((e: any) => e.is_active).length
                        }}
                        tasks={tasks.slice(0, 3)}
                        onNavigate={() => setActiveTab('tasks')}
                    />
                );
            case 'CASE_WORKER':
                return (
                    <CaseWorkerOverview
                        stats={{
                            assignedChildren: children.length,
                            pendingAssessments: 3,
                            totalCases: cases.length
                        }}
                        recentCases={cases.slice(0, 5)}
                        pendingTasks={[
                            { title: 'Follow-up Assessment', target: 'John Doe' },
                            { title: 'Home Visit Update', target: 'Smith Family' }
                        ]}
                        onNavigate={() => setActiveTab('cases')}
                    />
                );
            case 'SHELTER_PARTNER':
                return (
                    <ShelterPartnerOverview
                        user={user}
                        stats={{
                            totalShelters: dashboardData?.shelter_homes?.total_homes || 0,
                            totalCapacity: dashboardData?.shelter_homes?.total_capacity || 0,
                            currentOccupancy: dashboardData?.shelter_homes?.current_occupancy || 0,
                            complianceRate: 98
                        }}
                        shelters={shelters}
                        alerts={incidents}
                    />
                );
            default:
                return (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6">Welcome to Kindra Dashboard</Typography>
                        <Typography color="text.secondary">Your specialized dashboard is being configured. Please check back shortly.</Typography>
                    </Box>
                );
        }
    };



    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const greeting = getGreeting();

    return (
        <Box>
            {/* Simple Greeting - Once a day only */}
            {showGreeting && (
                <Card
                    sx={{
                        mb: 4,
                        p: 3,
                        background: theme.palette.mode === 'dark'
                            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: { xs: 2, sm: 0 }
                    }}>
                        <Box>
                            <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem', md: '2.5rem' } }}>
                                {greeting}, {user?.firstName || 'User'}!
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5, fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => setShowGreeting(false)}
                                sx={{
                                    borderRadius: 3,
                                    px: 2,
                                    bgcolor: alpha('#fff', 0.2),
                                    backdropFilter: 'blur(10px)',
                                    '&:hover': { bgcolor: alpha('#fff', 0.3) },
                                    boxShadow: 'none',
                                    textTransform: 'none'
                                }}
                            >
                                Dismiss
                            </Button>
                            <Button
                                variant="contained"
                                fullWidth={false}
                                startIcon={<Refresh />}
                                onClick={() => {
                                    dispatch(fetchDashboardData());
                                    dispatch(fetchCampaigns());
                                    // ... other fetches
                                }}
                                sx={{
                                    borderRadius: 3,
                                    px: 3,
                                    py: 1,
                                    bgcolor: alpha('#fff', 0.2),
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid',
                                    borderColor: alpha('#fff', 0.3),
                                    '&:hover': { bgcolor: alpha('#fff', 0.3) },
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    boxShadow: 'none',
                                    width: { xs: '100%', sm: 'auto' }
                                }}
                            >
                                Refresh
                            </Button>
                        </Box>
                    </Box>
                </Card>
            )}

            {renderRoleSpecificOverview()}
        </Box >
    );
};
