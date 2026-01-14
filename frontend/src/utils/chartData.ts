/**
 * Chart Data Utilities
 * Functions to aggregate and format data for visualizations
 */

export const aggregateDonationsByDay = (donations: any[]) => {
    // Show last 14 days for a cleaner daily view
    const last14Days = Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (13 - i));
        return date.toISOString().split('T')[0];
    });

    return last14Days.map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: donations
            .filter(d => d.donation_date?.startsWith(date) || d.created_at?.startsWith(date))
            .reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
    }));
};

export const calculateCampaignProgress = (campaigns: any[]) => {
    return campaigns.map(campaign => ({
        name: campaign.title?.substring(0, 20) || 'Untitled',
        raised: Number(campaign.raised_amount) || 0,
        goal: Number(campaign.target_amount) || 1,
        percentage: Math.round(((Number(campaign.raised_amount) || 0) / (Number(campaign.target_amount) || 1)) * 100)
    }));
};

export const aggregateVolunteerHours = (timeLogs: any[]) => {
    const monthlyHours: Record<string, number> = {};

    timeLogs.forEach(log => {
        const month = new Date(log.date || log.created_at).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        });
        monthlyHours[month] = (monthlyHours[month] || 0) + (log.hours || 0);
    });

    return Object.entries(monthlyHours)
        .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
        .map(([month, hours]) => ({ month, hours }));
};

export const getChildrenDistribution = (children: any[]) => {
    const statusCounts: Record<string, number> = {};

    children.forEach(child => {
        const status = child.legal_status || 'Unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        value
    }));
};

export const getShelterCapacityData = (shelters: any[]) => {
    return shelters.map(shelter => ({
        name: shelter.name?.substring(0, 15) || 'Unnamed',
        current: shelter.current_occupancy || 0,
        total: shelter.total_capacity || 1,
        percentage: Math.round(((shelter.current_occupancy || 0) / (shelter.total_capacity || 1)) * 100)
    }));
};

export const getDonationMethodBreakdown = (donations: any[]) => {
    const methodCounts: Record<string, number> = {};

    donations.forEach(donation => {
        const method = donation.payment_method || 'Unknown';
        methodCounts[method] = (methodCounts[method] || 0) + 1;
    });

    return Object.entries(methodCounts).map(([name, value]) => ({ name, value }));
};
