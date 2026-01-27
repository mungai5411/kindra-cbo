import { Box, Typography, CircularProgress } from '@mui/material';

import { useSelector } from 'react-redux';
import { RootState } from '../../store';
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
    const { user } = useSelector((state: RootState) => state.auth);
    const { dashboardData, isLoading: dashboardLoading } = useSelector((state: RootState) => state.reporting);

    // Keep individual slices for specific lists if needed, but rely on dashboardData for stats
    const { volunteers, tasks, events } = useSelector((state: RootState) => state.volunteers);
    const { campaigns, donations: donationRecords } = useSelector((state: RootState) => state.donations);
    const { cases, children } = useSelector((state: RootState) => state.caseManagement);
    const { shelters, incidents } = useSelector((state: RootState) => state.shelters);

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
                            myTotalDonations: myDonations.reduce((sum, d) => {
                                if (['COMPLETED', 'VERIFIED', 'SUCCESS'].includes(d.status)) {
                                    return sum + (Number(d.amount) || 0);
                                }
                                return sum;
                            }, 0),
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


    return (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Header / Greeting Area */}
            <Box sx={{
                mb: 6,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -16,
                    left: 0,
                    width: 60,
                    height: 4,
                    borderRadius: 2,
                    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.2)})`
                }
            }}>
                <Typography variant="overline" sx={{
                    fontWeight: 800,
                    color: 'primary.main',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    opacity: 0.8
                }}>
                    Dashboard Overview
                </Typography>
                <Typography variant="h3" sx={{
                    fontWeight: 900,
                    letterSpacing: -1.5,
                    mt: 0.5,
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                    color: 'text.primary',
                    lineHeight: 1.1
                }}>
                    Welcome back, {user?.firstName || 'Friend'}!
                </Typography>
                <Typography variant="body1" sx={{
                    mt: 1.5,
                    color: 'text.secondary',
                    maxWidth: 600,
                    fontWeight: 500,
                    opacity: 0.7
                }}>
                    Here's what's happening with Kindra today. You have {activities.length} recent activities to review.
                </Typography>
            </Box>



            {/* Content Refresh (Optional floating button or integrated) */}
            {renderRoleSpecificOverview()}
        </Box >
    );
};
