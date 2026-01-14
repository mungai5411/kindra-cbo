/**
 * Donations Page
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Grid, Card, CardContent, Typography, Box, Button, LinearProgress, useTheme, alpha, CircularProgress } from '@mui/material';
import { Favorite, Security, Public, VolunteerActivism } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AppDispatch, RootState } from '../store';
import { fetchCampaigns } from '../features/campaigns/campaignsSlice';
import DonationDialog from '../components/campaigns/DonationDialog';
import MaterialDonationDialog from '../components/campaigns/MaterialDonationDialog';

export default function DonationsPage() {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { campaigns, isLoading } = useSelector((state: RootState) => state.campaigns);

    const [donationDialogOpen, setDonationDialogOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
    const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
    const [selectedMaterialCampaign, setSelectedMaterialCampaign] = useState<any>(null);

    const handleOpenDonationDialog = (campaign: any) => {
        setSelectedCampaign(campaign);
        setDonationDialogOpen(true);
    };

    const handleCloseDonationDialog = () => {
        setDonationDialogOpen(false);
        setSelectedCampaign(null);
    };

    const handleOpenMaterialDialog = (campaign: any) => {
        setSelectedMaterialCampaign(campaign);
        setMaterialDialogOpen(true);
    };

    const handleCloseMaterialDialog = () => {
        setMaterialDialogOpen(false);
        setSelectedMaterialCampaign(null);
    };

    useEffect(() => {
        dispatch(fetchCampaigns());
    }, [dispatch]);

    // Filter for active campaigns only
    const activeCampaigns = campaigns.filter((campaign: any) => campaign.status === 'ACTIVE');

    const formatCurrency = (amount: number, currency: string = 'KES') => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: theme.palette.mode === 'dark'
                ? `radial-gradient(circle at 70% 40%, ${alpha(theme.palette.secondary.dark, 0.25)} 0%, transparent 50%), #0f172a`
                : `radial-gradient(circle at 70% 40%, ${alpha(theme.palette.secondary.light, 0.12)} 0%, transparent 50%), #f8fafc`
        }}>
            {/* Hero */}
            <Box sx={{
                py: 10,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)}, ${alpha(theme.palette.secondary.main, 0.12)})`
            }}>
                <Container maxWidth="md">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <Typography variant="h2" fontWeight="800" gutterBottom color="text.primary" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                            Make a Difference
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 400, maxWidth: 600, mx: 'auto' }}>
                            Support active campaigns and transform lives in our community.
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<Favorite />}
                            sx={{
                                borderRadius: 3,
                                px: 4,
                                py: 1.5,
                                fontWeight: 'bold',
                                boxShadow: theme.shadows[4]
                            }}
                            onClick={() => activeCampaigns.length > 0 && handleOpenDonationDialog(activeCampaigns[0])}
                        >
                            Donate Now
                        </Button>
                    </motion.div>
                </Container>
            </Box>

            {/* Campaigns */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography variant="h4" fontWeight="700" align="center" gutterBottom color="text.primary" sx={{ mb: 6 }}>
                    Active Campaigns
                </Typography>

                {/* Loading State */}
                {isLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress size={60} />
                    </Box>
                )}

                {/* Empty State */}
                {!isLoading && activeCampaigns.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No active campaigns at the moment
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Check back later for new campaigns to support.
                        </Typography>
                    </Box>
                )}

                {/* Campaigns Grid */}
                {!isLoading && activeCampaigns.length > 0 && (
                    <Grid container spacing={4}>
                        {activeCampaigns.map((campaign: any, i: number) => {
                            const progress = (campaign.current_amount / campaign.target_amount) * 100;
                            return (
                                <Grid item xs={12} md={4} key={campaign.id}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <Card sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: 2,
                                            background: alpha(theme.palette.background.paper, 0.7),
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid',
                                            borderColor: alpha(theme.palette.divider, 0.1),
                                            transition: 'all 0.3s ease',
                                            boxShadow: theme.shadows[1],
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                background: alpha(theme.palette.background.paper, 0.9),
                                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                                boxShadow: theme.shadows[4]
                                            }
                                        }}>
                                            <Box
                                                sx={{
                                                    height: 240,
                                                    bgcolor: 'grey.300',
                                                    backgroundImage: campaign.image ? `url(${campaign.image})` : 'none',
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center'
                                                }}
                                            />
                                            <CardContent sx={{ flexGrow: 1, p: 4 }}>
                                                <Typography variant="h5" fontWeight="800" gutterBottom>
                                                    {campaign.title}
                                                </Typography>
                                                <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
                                                    {campaign.description}
                                                </Typography>

                                                <Box sx={{ mt: 'auto' }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'flex-end' }}>
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block">RAISED</Typography>
                                                            <Typography variant="h6" color="primary.main" fontWeight="800">
                                                                {formatCurrency(campaign.current_amount || 0, campaign.currency)}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ textAlign: 'right' }}>
                                                            <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block">GOAL</Typography>
                                                            <Typography variant="h6" color="text.primary" fontWeight="800">
                                                                {formatCurrency(campaign.target_amount, campaign.currency)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={Math.min(progress, 100)}
                                                        sx={{
                                                            height: 12,
                                                            borderRadius: 6,
                                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                            '& .MuiLinearProgress-bar': { borderRadius: 6 }
                                                        }}
                                                    />
                                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'right' }}>
                                                        {Math.round(progress)}% Funded
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                            <Box sx={{ p: 4, pt: 0 }}>
                                                <Button
                                                    variant="outlined"
                                                    fullWidth
                                                    size="large"
                                                    color="primary"
                                                    onClick={() => handleOpenMaterialDialog(campaign)}
                                                    sx={{ borderRadius: 3, borderWidth: 2, fontWeight: 'bold', '&:hover': { borderWidth: 2 } }}
                                                >
                                                    Donate Materials
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    size="large"
                                                    startIcon={<VolunteerActivism />}
                                                    onClick={() => handleOpenDonationDialog(campaign)}
                                                    sx={{ mt: 2, borderRadius: 3, fontWeight: 'bold', boxShadow: theme.shadows[4] }}
                                                >
                                                    Donate
                                                </Button>
                                            </Box>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Container>

            {/* Trust Badges */}
            <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04), py: 12 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={6} justifyContent="center" alignItems="center">
                        {[
                            { icon: <Security sx={{ fontSize: 48 }} />, title: 'Secure Payment', desc: '256-bit SSL Encrypted transactions for your peace of mind.' },
                            { icon: <Public sx={{ fontSize: 48 }} />, title: 'Global Impact', desc: 'Reaching 5 regions across the country with direct support.' },
                            { icon: <Favorite sx={{ fontSize: 48 }} />, title: 'Transparent', desc: '100% of public donations go directly to the cause.' },
                        ].map((badge, idx) => (
                            <Grid item xs={12} sm={4} key={idx} sx={{ textAlign: 'center' }}>
                                <Box
                                    sx={{
                                        color: 'primary.main',
                                        mb: 3,
                                        display: 'inline-flex',
                                        p: 3,
                                        borderRadius: '50%',
                                        bgcolor: alpha(theme.palette.primary.main, 0.1)
                                    }}
                                >
                                    {badge.icon}
                                </Box>
                                <Typography variant="h5" fontWeight="800" gutterBottom>{badge.title}</Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 300, mx: 'auto' }}>{badge.desc}</Typography>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Donation Dialog */}
            {selectedCampaign && (
                <DonationDialog
                    open={donationDialogOpen}
                    onClose={handleCloseDonationDialog}
                    campaign={selectedCampaign}
                />
            )}

            {/* Material Donation Dialog */}
            {selectedMaterialCampaign && (
                <MaterialDonationDialog
                    open={materialDialogOpen}
                    onClose={handleCloseMaterialDialog}
                    campaign={selectedMaterialCampaign}
                />
            )}
        </Box>
    );
}
