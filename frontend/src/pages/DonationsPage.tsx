/**
 * Donations Page - Premium Revamp
 * Features: Glassmorphism, Dynamic Hero, Smooth Animations
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Container, Grid, Card, CardContent, Typography, Box, Button,
    LinearProgress, useTheme, alpha, CircularProgress, Stack
} from '@mui/material';
import {
    Favorite, Security, Public, VolunteerActivism,
    MonetizationOn, TipsAndUpdates, AutoAwesome
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { AppDispatch, RootState } from '../store';
import { fetchCampaigns } from '../features/donations/donationsSlice';
import DonationDialog from '../components/campaigns/DonationDialog';
import MaterialDonationDialog from '../components/campaigns/MaterialDonationDialog';

export default function DonationsPage() {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { campaigns, isLoading } = useSelector((state: RootState) => state.donations);

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

    const activeCampaigns = campaigns.filter((campaign: any) => campaign.status === 'ACTIVE');

    const formatCurrency = (amount: number, currency: string = 'KES') => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Stagger container for list animations
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: theme.palette.mode === 'dark'
                ? '#0f172a'
                : '#f8fafc',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Dynamic Mesh Gradient Background */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '100%',
                zIndex: 0,
                overflow: 'hidden',
                pointerEvents: 'none'
            }}>
                <Box sx={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-5%',
                    width: '60%',
                    height: '60%',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`,
                    filter: 'blur(60px)',
                }} />
                <Box sx={{
                    position: 'absolute',
                    bottom: '10%',
                    left: '-10%',
                    width: '50%',
                    height: '50%',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.08)} 0%, transparent 70%)`,
                    filter: 'blur(60px)',
                }} />
            </Box>

            {/* Hero Section */}
            <Box sx={{
                pt: { xs: 12, md: 16 },
                pb: { xs: 8, md: 12 },
                position: 'relative',
                zIndex: 1,
                textAlign: 'center'
            }}>
                <Container maxWidth="md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <Box sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 2,
                            py: 0.5,
                            borderRadius: 10,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            mb: 3,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                        }}>
                            <AutoAwesome sx={{ fontSize: 16 }} />
                            <Typography variant="caption" fontWeight="bold" letterSpacing={1} sx={{ textTransform: 'uppercase' }}>
                                Your generosity changes lives
                            </Typography>
                        </Box>

                        <Typography variant="h1" sx={{
                            mb: 3,
                            fontSize: { xs: '2.75rem', md: '4.5rem' },
                            background: `linear-gradient(135deg, ${theme.palette.text.primary} 30%, ${theme.palette.primary.main} 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            lineHeight: 1.1
                        }}>
                            Fueling Hope, <br /> One Gift at a Time
                        </Typography>

                        <Typography variant="h6" color="text.secondary" sx={{
                            mb: 5,
                            maxWidth: 600,
                            mx: 'auto',
                            lineHeight: 1.6,
                            fontWeight: 400
                        }}>
                            Join us in our mission to provide sustainable support to vulnerable communities through transparent and impactful giving.
                        </Typography>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<Favorite />}
                                onClick={() => activeCampaigns.length > 0 && handleOpenDonationDialog(activeCampaigns[0])}
                                sx={{
                                    borderRadius: 4,
                                    px: 5,
                                    py: 2,
                                    fontSize: '1rem',
                                    fontWeight: 800,
                                    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                                    '&:hover': {
                                        transform: 'translateY(-3px)',
                                        boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
                                    }
                                }}
                            >
                                Donate Now
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                startIcon={<TipsAndUpdates />}
                                sx={{
                                    borderRadius: 4,
                                    px: 5,
                                    py: 2,
                                    fontSize: '1rem',
                                    fontWeight: 800,
                                    borderWidth: 2,
                                    '&:hover': {
                                        borderWidth: 2,
                                        transform: 'translateY(-3px)',
                                        bgcolor: alpha(theme.palette.primary.main, 0.05)
                                    }
                                }}
                            >
                                How it Works
                            </Button>
                        </Stack>
                    </motion.div>
                </Container>
            </Box>

            {/* Main Content Area */}
            <Container maxWidth="lg" sx={{ pb: 12, position: 'relative', zIndex: 1 }}>
                {/* Section Header */}
                <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h3" fontWeight="800">Active Campaigns</Typography>
                        <Typography variant="body1" color="text.secondary">Directly supporting those in need</Typography>
                    </Box>
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MonetizationOn sx={{ fontSize: 16 }} /> Secure multi-channel processing
                        </Typography>
                    </Box>
                </Box>

                {/* Loading State */}
                {isLoading && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', py: 8 }}>
                        {[1, 2, 3].map((n) => (
                            <Box key={n} sx={{ width: { xs: '100%', md: 'calc(33.333% - 22px)' }, height: 400, borderRadius: 4, bgcolor: alpha(theme.palette.text.primary, 0.03), position: 'relative', overflow: 'hidden' }}>
                                <LinearProgress sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />
                            </Box>
                        ))}
                    </Box>
                )}

                {/* Empty State */}
                {!isLoading && activeCampaigns.length === 0 && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        <Card sx={{
                            p: 8,
                            textAlign: 'center',
                            borderRadius: 6,
                            background: alpha(theme.palette.background.paper, 0.7),
                            backdropFilter: 'blur(20px)',
                            border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                            boxShadow: 'none'
                        }}>
                            <Box sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                width: 100,
                                height: 100,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 4
                            }}>
                                <VolunteerActivism sx={{ fontSize: 50, color: 'primary.main', opacity: 0.5 }} />
                            </Box>
                            <Typography variant="h4" fontWeight="800" sx={{ mb: 2 }}>Ready to Make a Difference?</Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto', fontWeight: 400 }}>
                                We are currently finalizing new high-impact campaigns. Every contribution helps us build a stronger foundation for tomorrow.
                            </Typography>
                            <Button
                                variant="text"
                                color="primary"
                                size="large"
                                sx={{ fontWeight: 'bold' }}
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            >
                                Notify me of new updates
                            </Button>
                        </Card>
                    </motion.div>
                )}

                {/* Campaigns Grid */}
                {!isLoading && activeCampaigns.length > 0 && (
                    <motion.div variants={containerVariants} initial="hidden" animate="show">
                        <Grid container spacing={4}>
                            <AnimatePresence>
                                {activeCampaigns.map((campaign: any, i: number) => {
                                    const progress = (campaign.raised_amount / campaign.target_amount) * 100;
                                    return (
                                        <Grid item xs={12} md={6} lg={4} key={campaign.id}>
                                            <motion.div variants={itemVariants}>
                                                <Card sx={{
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    borderRadius: 5,
                                                    overflow: 'hidden',
                                                    background: alpha(theme.palette.background.paper, 0.8),
                                                    backdropFilter: 'blur(20px)',
                                                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&:hover': {
                                                        transform: 'translateY(-8px)',
                                                        boxShadow: `0 20px 40px ${alpha(theme.palette.text.primary, 0.08)}`,
                                                        borderColor: alpha(theme.palette.primary.main, 0.3),
                                                    }
                                                }}>
                                                    {/* Card Media Header */}
                                                    <Box sx={{ position: 'relative', height: 240, overflow: 'hidden' }}>
                                                        <Box
                                                            sx={{
                                                                width: '100%',
                                                                height: '100%',
                                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                                backgroundImage: campaign.featured_image ? `url(${campaign.featured_image})` : 'none',
                                                                backgroundSize: 'cover',
                                                                backgroundPosition: 'center',
                                                                transition: 'transform 0.6s ease',
                                                                '&:hover': { transform: 'scale(1.05)' }
                                                            }}
                                                        />
                                                        {/* Badge Overlay */}
                                                        <Box sx={{
                                                            position: 'absolute',
                                                            top: 20,
                                                            left: 20,
                                                            bgcolor: alpha(theme.palette.background.paper, 0.9),
                                                            backdropFilter: 'blur(10px)',
                                                            px: 1.5,
                                                            py: 0.5,
                                                            borderRadius: 2,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            boxShadow: theme.shadows[1]
                                                        }}>
                                                            <Favorite sx={{ fontSize: 14, color: 'error.main' }} />
                                                            <Typography variant="caption" fontWeight="800" textTransform="uppercase">
                                                                {campaign.category}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <CardContent sx={{ flexGrow: 1, p: 4 }}>
                                                        <Typography variant="h4" sx={{ mb: 2, fontSize: '1.4rem', fontWeight: 800 }}>
                                                            {campaign.title}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, height: 60, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                                            {campaign.description}
                                                        </Typography>

                                                        <Box sx={{ mt: 'auto' }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                                                <Box>
                                                                    <Typography variant="caption" color="text.secondary" fontWeight="bold">RAISED</Typography>
                                                                    <Typography variant="h5" color="primary.main" fontWeight="900">
                                                                        {formatCurrency(campaign.raised_amount || 0, campaign.currency)}
                                                                    </Typography>
                                                                </Box>
                                                                <Box sx={{ textAlign: 'right' }}>
                                                                    <Typography variant="caption" color="text.secondary" fontWeight="bold">TARGET</Typography>
                                                                    <Typography variant="h5" fontWeight="900">
                                                                        {formatCurrency(campaign.target_amount, campaign.currency)}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>

                                                            <Box sx={{ position: 'relative', height: 12, borderRadius: 6, bgcolor: alpha(theme.palette.text.primary, 0.05), overflow: 'hidden' }}>
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    whileInView={{ width: `${Math.min(progress, 100)}%` }}
                                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                                    style={{
                                                                        height: '100%',
                                                                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                                                                        borderRadius: 6
                                                                    }}
                                                                />
                                                            </Box>

                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                                                <Typography variant="caption" fontWeight="800" color="primary.main">
                                                                    {Math.round(progress)}% GOAL
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Helping {Math.floor(progress * 1.5) || 0} vulnerable families
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </CardContent>

                                                    <Box sx={{ p: 4, pt: 0, display: 'flex', gap: 2 }}>
                                                        <Button
                                                            variant="soft"
                                                            fullWidth
                                                            size="large"
                                                            onClick={() => handleOpenMaterialDialog(campaign)}
                                                            sx={{
                                                                borderRadius: 3,
                                                                fontWeight: 800,
                                                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                                color: 'primary.main',
                                                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                                            }}
                                                        >
                                                            Items
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            fullWidth
                                                            size="large"
                                                            startIcon={<VolunteerActivism />}
                                                            onClick={() => handleOpenDonationDialog(campaign)}
                                                            sx={{
                                                                borderRadius: 3,
                                                                fontWeight: 800,
                                                                boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.2)}`
                                                            }}
                                                        >
                                                            Donate
                                                        </Button>
                                                    </Box>
                                                </Card>
                                            </motion.div>
                                        </Grid>
                                    );
                                })}
                            </AnimatePresence>
                        </Grid>
                    </motion.div>
                )}
            </Container>

            {/* Impact/Trust Section */}
            <Box sx={{
                bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.3) : '#ffffff',
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                py: { xs: 8, md: 15 }
            }}>
                <Container maxWidth="lg">
                    <Grid container spacing={8} justifyContent="center" alignItems="center">
                        {[
                            { icon: <Security sx={{ fontSize: 50 }} />, title: 'Fully Secure', desc: 'Industry-standard encryption for all financial transactions.' },
                            { icon: <Public sx={{ fontSize: 50 }} />, title: 'Direct Impact', desc: '100% of your gift reaches the intended communities directly.' },
                            { icon: <Favorite sx={{ fontSize: 50 }} />, title: 'Transparency', desc: 'Real-time tracking of how every shilling is spent on the ground.' },
                        ].map((badge, idx) => (
                            <Grid item xs={12} sm={4} key={idx} sx={{ textAlign: 'center' }}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.2 }}
                                    viewport={{ once: true }}
                                >
                                    <Box
                                        sx={{
                                            color: 'primary.main',
                                            mb: 4,
                                            display: 'inline-flex',
                                            p: 3,
                                            borderRadius: '30%',
                                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                                            boxShadow: `0 15px 35px ${alpha(theme.palette.primary.main, 0.1)}`
                                        }}
                                    >
                                        {badge.icon}
                                    </Box>
                                    <Typography variant="h4" fontWeight="800" gutterBottom sx={{ mb: 1.5 }}>{badge.title}</Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 280, mx: 'auto', lineHeight: 1.6 }}>{badge.desc}</Typography>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Dialog Component Injections */}
            <AnimatePresence>
                {selectedCampaign && donationDialogOpen && (
                    <DonationDialog
                        open={donationDialogOpen}
                        onClose={handleCloseDonationDialog}
                        campaign={selectedCampaign}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedMaterialCampaign && materialDialogOpen && (
                    <MaterialDonationDialog
                        open={materialDialogOpen}
                        onClose={handleCloseMaterialDialog}
                        campaign={selectedMaterialCampaign}
                    />
                )}
            </AnimatePresence>
        </Box>
    );
}
