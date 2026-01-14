import { Box, Typography, Tabs, Tab, Paper, alpha, useTheme } from '@mui/material';
import React from 'react';

interface SubTab {
    id: string;
    label: string;
    component: React.ReactNode;
}

interface SubTabViewProps {
    title: string;
    tabs: SubTab[];
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
}

export const SubTabView = ({ title, tabs, activeTab, onTabChange }: SubTabViewProps) => {
    const theme = useTheme();
    const [value, setValue] = React.useState(0);

    // Sync state with activeTab prop if provided
    React.useEffect(() => {
        if (activeTab) {
            const index = tabs.findIndex(t => t.id === activeTab);
            if (index !== -1) setValue(index);
        }
    }, [activeTab, tabs]);

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        if (onTabChange) {
            onTabChange(tabs[newValue].id);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                    {title}
                </Typography>
            </Box>

            <Paper sx={{ mb: 3, borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), boxShadow: theme.shadows[1] }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {tabs.map((tab) => (
                        <Tab key={tab.id} label={tab.label} />
                    ))}
                </Tabs>
            </Paper>

            <Box>
                {tabs[value].component}
            </Box>
        </Box>
    );
};
