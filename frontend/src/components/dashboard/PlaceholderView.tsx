import { Box, Typography, Button } from '@mui/material';
import { Assignment } from '@mui/icons-material';

interface PlaceholderViewProps {
    title: string;
    setActiveTab: (tab: string) => void;
}

export const PlaceholderView = ({ title, setActiveTab }: PlaceholderViewProps) => (
    <Box sx={{
        p: 6,
        textAlign: 'center',
        bgcolor: 'background.paper',
        borderRadius: 4,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        m: 2
    }}>
        <Box sx={{ mb: 3, color: 'text.secondary' }}>
            <Assignment sx={{ fontSize: 60, opacity: 0.3 }} />
        </Box>
        <Typography variant="h4" gutterBottom fontWeight="bold">{title}</Typography>
        <Typography color="text.secondary" maxWidth="md" mx="auto">
            This module is part of the comprehensive Kindra backend system.
            The front-end interface for this specific module is currently under development.
        </Typography>
        <Button variant="outlined" sx={{ mt: 3 }} onClick={() => setActiveTab('overview')}>
            Return to Dashboard
        </Button>
    </Box>
);
