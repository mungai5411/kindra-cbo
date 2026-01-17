import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse, Typography, alpha, useTheme } from '@mui/material';
import {
    Dashboard as DashboardIcon,
    VolunteerActivism,
    Campaign,
    Article,
    Home,
    FolderShared,
    Analytics,
    Security,
    ExpandLess,
    ExpandMore
} from '@mui/icons-material';
import logo from '../../assets/logo.jpg';

export const DRAWER_WIDTH = 250;

interface SidebarProps {
    activeTab: string;
    setActiveTab: (id: string) => void;
    openSections: { [key: string]: boolean };
    handleSectionToggle: (id: string) => void;
    canViewModule: (id: string) => boolean;
}

const NAVIGATION = [
    {
        id: 'overview',
        label: 'Dashboard',
        icon: <DashboardIcon />,
    },
    {
        id: 'blog_campaigns',
        label: 'Blog & Storytelling',
        icon: <Article />,
    },
    {
        id: 'case_management',
        label: 'Case Management',
        icon: <FolderShared />,
        children: [
            { id: 'cases', label: 'Cases' },
            { id: 'assessments', label: 'Assessments' },
            { id: 'case_notes', label: 'Case Notes' },
            { id: 'children', label: 'Children' },
            { id: 'families', label: 'Families' },
            { id: 'documents', label: 'Documents' },
        ]
    },
    {
        id: 'donations',
        label: 'Donations',
        icon: <Campaign />,
        children: [
            { id: 'campaigns', label: 'Campaigns' },
            { id: 'donation_records', label: 'Donations' },
            { id: 'donors', label: 'Donors' },
            { id: 'receipts', label: 'Receipts' },
            { id: 'social_media', label: 'Social Media' },
        ]
    },
    {
        id: 'shelter',
        label: 'Shelter Coordination',
        icon: <Home />,
        children: [
            { id: 'shelters', label: 'Shelter Homes' },
            { id: 'placements', label: 'Placements' },
            { id: 'resources', label: 'Resources' },
            { id: 'staff_creds', label: 'Staff Credentials', adminOnly: true },
        ]
    },
    {
        id: 'volunteers',
        label: 'Volunteers',
        icon: <VolunteerActivism />,
        children: [
            { id: 'volunteer_list', label: 'Volunteers' },
            { id: 'volunteer_groups', label: 'Unit Hub' },
            { id: 'events', label: 'Events' },
            { id: 'tasks', label: 'Tasks' },
            { id: 'time_logs', label: 'Time Logs' },
            { id: 'trainings', label: 'Trainings' },
        ]
    },
    {
        id: 'reporting',
        label: 'Reporting',
        icon: <Analytics />,
        children: [
            { id: 'reports', label: 'Reports' },
            { id: 'kpis', label: 'KPIs' },
            { id: 'compliance', label: 'Compliance' },
        ]
    },
    {
        id: 'admin_sys',
        label: 'System Admin',
        icon: <Security />,
        adminOnly: true,
        children: [
            { id: 'users', label: 'Users' },
            { id: 'pending_approvals', label: 'Pending Approvals' },
            { id: 'groups', label: 'Groups' },
            { id: 'audit_logs', label: 'Audit Logs' },
            { id: 'periodic_tasks', label: 'Periodic Tasks' },
        ]
    },
];

interface NavigationItem {
    id: string;
    label: string;
    icon: JSX.Element;
    adminOnly?: boolean;
    children?: { id: string; label: string; adminOnly?: boolean }[];
}

export const Sidebar = ({ activeTab, setActiveTab, openSections, handleSectionToggle, canViewModule }: SidebarProps) => {
    const theme = useTheme();

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'white',
                        borderRadius: 2,
                        p: 0.5,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    <Box
                        component="img"
                        src={logo}
                        alt="Kindra Logo"
                        sx={{
                            height: '100%',
                            width: 'auto',
                            objectFit: 'contain'
                        }}
                    />
                </Box>
                <Typography variant="h6" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>Kindra CBO</Typography>
            </Box>

            <List sx={{
                flexGrow: 1,
                px: 2,
                py: 1,
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: alpha(theme.palette.divider, 0.1), borderRadius: '4px' },
                '&:hover::-webkit-scrollbar-thumb': { background: alpha(theme.palette.divider, 0.2) }
            }}>
                {(NAVIGATION as NavigationItem[]).filter(item => canViewModule(item.id)).map((item) => {
                    const hasChildren = item.children && item.children.length > 0;
                    const visibleChildren = item.children?.filter(child => {
                        if (child.adminOnly && !canViewModule('admin_sys')) return false;
                        // Some children might need explicit per-id permission checking if logic exists
                        return canViewModule(child.id);
                    });

                    if (item.adminOnly && !canViewModule('admin_sys')) return null;

                    const isOpen = openSections[item.id];
                    const isActive = activeTab === item.id || (hasChildren && visibleChildren?.some(c => c.id === activeTab));

                    return (
                        <Box key={item.id} sx={{ mb: 0.5 }}>
                            <ListItem disablePadding>
                                <ListItemButton
                                    onClick={() => hasChildren ? handleSectionToggle(item.id) : setActiveTab(item.id)}
                                    selected={activeTab === item.id}
                                    sx={{
                                        borderRadius: 2,
                                        mb: 0.5,
                                        color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                                        bgcolor: isActive ? alpha('#8DA88D', 0.25) : 'transparent',
                                        boxShadow: isActive ? `0 4px 12px ${alpha('#8DA88D', 0.3)}` : 'none',
                                        '&:hover': {
                                            bgcolor: isActive ? alpha('#8DA88D', 0.25) : alpha(theme.palette.text.primary, 0.04),
                                            color: theme.palette.primary.main,
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{
                                            fontWeight: isActive ? 600 : 500,
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                    {hasChildren && (isOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />)}
                                </ListItemButton>
                            </ListItem>

                            {hasChildren && visibleChildren && visibleChildren.length > 0 && (
                                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding
                                        sx={{
                                            ml: 3,
                                            position: 'relative',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                bottom: 12,
                                                width: '1px',
                                                bgcolor: alpha(theme.palette.text.primary, 0.1)
                                            }
                                        }}
                                    >
                                        {visibleChildren.map((child) => (
                                            <ListItemButton
                                                key={child.id}
                                                sx={{
                                                    pl: 3,
                                                    borderRadius: '0 10px 10px 0',
                                                    mb: 0.2,
                                                    minHeight: 34,
                                                    color: activeTab === child.id ? theme.palette.primary.main : theme.palette.text.secondary,
                                                    bgcolor: activeTab === child.id ? alpha('#8DA88D', 0.1) : 'transparent',
                                                    '&:hover': {
                                                        bgcolor: alpha('#8DA88D', 0.15),
                                                        color: theme.palette.primary.main,
                                                    },
                                                    transition: 'all 0.2s ease',
                                                    '&::before': activeTab === child.id ? {
                                                        content: '""',
                                                        position: 'absolute',
                                                        left: 0,
                                                        width: 2.5,
                                                        height: '60%',
                                                        bgcolor: theme.palette.primary.main,
                                                        borderRadius: '0 4px 4px 0',
                                                        boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.4)}`
                                                    } : {}
                                                }}
                                                selected={activeTab === child.id}
                                                onClick={() => setActiveTab(child.id)}
                                            >
                                                <ListItemText
                                                    primary={child.label}
                                                    primaryTypographyProps={{
                                                        fontSize: '0.825rem',
                                                        fontWeight: activeTab === child.id ? 600 : 400,
                                                        letterSpacing: '0.01em'
                                                    }}
                                                />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </Collapse>
                            )}
                        </Box>
                    );
                })}
            </List>
        </Box>
    );
};
