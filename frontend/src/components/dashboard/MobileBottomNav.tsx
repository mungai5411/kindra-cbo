import type { FC } from 'react';
import { Paper, BottomNavigation, BottomNavigationAction, useTheme, alpha } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import MenuIcon from '@mui/icons-material/Menu';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import HomeIcon from '@mui/icons-material/Home';

interface MobileBottomNavProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    canViewModule: (tab: string) => boolean;
    onMenuClick: () => void;
}

export const MobileBottomNav: FC<MobileBottomNavProps> = ({ activeTab, setActiveTab, canViewModule, onMenuClick }) => {
    const theme = useTheme();

    // Map activeTab to closest BottomNav index/value
    const getValue = () => {
        if (activeTab === 'overview') return 'overview';
        // Detailed mapping for highlighting 'donations' parent even if child is active
        if (['donations', 'campaigns', 'donors'].some(t => activeTab.includes(t))) return 'donations';
        if (['case_management', 'cases', 'children'].some(t => activeTab.includes(t))) return 'case_management';
        if (['shelter', 'shelters', 'placements'].some(t => activeTab.includes(t))) return 'shelter';
        return activeTab; // Fallback
    };

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1300,
                display: { md: 'none' }, // Show on mobile and tablet (sm)
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                pb: 'env(safe-area-inset-bottom)' // Handle iPhone X notch area
            }}
            elevation={4}
        >
            <BottomNavigation
                showLabels
                value={getValue()}
                onChange={(_, newValue) => {
                    if (newValue === 'menu') {
                        onMenuClick();
                    } else {
                        setActiveTab(newValue);
                    }
                }}
                sx={{
                    height: 65, // Taller for better touch targets
                    bgcolor: alpha(theme.palette.background.paper, 0.95),
                    backdropFilter: 'blur(10px)',
                    '& .MuiBottomNavigationAction-root': {
                        minWidth: 'auto',
                        padding: '6px 0',
                        color: theme.palette.text.secondary,
                        '&.Mui-selected': {
                            color: theme.palette.primary.main,
                        },
                        '& .MuiSvgIcon-root': {
                            fontSize: '1.5rem',
                            mb: 0.5
                        }
                    }
                }}
            >
                <BottomNavigationAction label="Home" value="overview" icon={<DashboardIcon />} />

                {canViewModule('donations') && (
                    <BottomNavigationAction label="Donate" value="donations" icon={<VolunteerActivismIcon />} />
                )}

                {canViewModule('case_management') && (
                    <BottomNavigationAction label="Cases" value="case_management" icon={<FolderSharedIcon />} />
                )}

                {canViewModule('shelter') && (
                    <BottomNavigationAction label="Shelter" value="shelter" icon={<HomeIcon />} />
                )}

                <BottomNavigationAction label="Menu" value="menu" icon={<MenuIcon />} />
            </BottomNavigation>
        </Paper>
    );
};
