import type { FC } from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assessment';

interface MobileBottomNavProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    canViewModule: (tab: string) => boolean;
}

export const MobileBottomNav: FC<MobileBottomNavProps> = ({ activeTab, setActiveTab, canViewModule }) => {
    // Map activeTab to closest BottomNav index/value
    const getValue = () => {
        if (activeTab === 'overview') return 'overview';
        if (activeTab.includes('volunteer')) return 'volunteers';
        if (activeTab.includes('donation') || activeTab.includes('campaign')) return 'donations';
        if (activeTab.includes('case') || activeTab.includes('child') || activeTab.includes('family')) return 'cases';
        return 'overview';
    };

    return (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200, display: { sm: 'none' } }} elevation={3}>
            <BottomNavigation
                showLabels
                value={getValue()}
                onChange={(_, newValue) => {
                    setActiveTab(newValue);
                }}
            >
                {canViewModule('overview') && (
                    <BottomNavigationAction label="Home" value="overview" icon={<DashboardIcon />} />
                )}
                {canViewModule('donations') && (
                    <BottomNavigationAction label="Donate" value="donations" icon={<VolunteerActivismIcon />} />
                )}
                {canViewModule('case_management') && (
                    <BottomNavigationAction label="Cases" value="case_management" icon={<DescriptionIcon />} />
                )}
                {canViewModule('volunteers') && (
                    <BottomNavigationAction label="Team" value="volunteers" icon={<PeopleIcon />} />
                )}
                {canViewModule('reporting') && (
                    <BottomNavigationAction label="Stats" value="reporting" icon={<AssessmentIcon />} />
                )}
            </BottomNavigation>
        </Paper>
    );
};
