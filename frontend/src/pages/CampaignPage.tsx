/**
 * Public Campaign Detail Page
 * Redesigned to match the premium editorial style and system color psychology.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Container,
    Typography,
    Chip,
    Button,
    Skeleton,
    Divider,
    Grid,
    LinearProgress,
    useTheme,
    alpha,
    Avatar,
    Stack
} from '@mui/material';
import { 
    ArrowBack, 
    AccessTime, 
    Favorite, 
    Share, 
    CalendarToday, 
    TrendingUp,
    Groups
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../store';
import { fetchCampaigns } from '../features/donations/donationsSlice';
import { motion } from 'framer-motion';
import DonationDialog from '../components/campaigns/DonationDialog';

export default function CampaignPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const theme = useTheme();

    const { campaigns, isLoading } = useSelector((state: RootState) => state.donations);
    const campaign = campaigns.find(c => c.slug === slug || c.id?.toString() === slug);

    const [donationDialogOpen, setDonationDialogOpen] = useState(false);

    useEffect(() => {
        if (!campaign) {
            dispatch(fetchCampaigns());
        }
    }, [dispatch, campaign, slug]);

    if (isLoading && !campaign) {
        return (
            <Container maxWidth={false} sx={{ px: { xs: 2, md: 8, lg: 10 }, py: 12 }}>
                <Skeleton variant="text" height={80} width="60%" sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2, mb: 6 }} />
                <Grid container spacing={6}>
                    <Grid item xs={12} md={8}>
                        <Skeleton variant="text" height={30} width="100%" sx={{ mb: 1 }} />
                        <Skeleton variant="text" height={30} width="100%" sx={{ mb: 1 }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
                    </Grid>
                </Grid>
            </Container>
        );
    }

    if (!campaign) {
        return (
            <Container maxWidth={false} sx={{ px: { xs: 2, md: 8, lg: 10 }, py: 12, textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, color: 'secondary.main' }}>
                    Campaign Not Found
                </Typography>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => navigate('/stories')}
                    startIcon={<ArrowBack />}
                    sx={{ borderRadius: 1, px: 4, py: 1.5, fontWeight: 900 }}
                >
                    Back to Stories
                </Button>
            </Container>
        );
    }

    const progress = Math.min((campaign.raised_amount / campaign.target_amount) * 100, 100);
    const daysLeft = Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 12 }}
        >
            {/* Full-Width Header */}
            <Box sx={{ pt: 10, pb: 6, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Container maxWidth={false} sx={{ px: { xs: 2, md: 8, lg: 10 } }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/stories')}
                        sx={{ color: 'text.secondary', mb: 4, fontWeight: 800, '&:hover': { color: 'secondary.main', bgcolor: 'transparent' } }}
                    >
                        Back to Stories
                    </Button>

                    <Grid container spacing={6}>
                        <Grid item xs={12} md={8}>
                            <Typography variant="overline" sx={{ fontWeight: 800, color: 'secondary.main', mb: 2, display: 'block', letterSpacing: '0.1em' }}>
                                ACTIVE CAMPAIGN
                            </Typography>
                            <Typography variant="h1" sx={{ 
                                fontSize: { xs: '2.5rem', md: '4rem' }, 
                                fontWeight: 900, 
                                color: 'text.primary', 
                                lineHeight: 1.1,
                                mb: 4,
                                letterSpacing: '-0.04em'
                            }}>
                                {campaign.title}
                            </Typography>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                                    <CalendarToday sx={{ fontSize: 20 }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                        Ends in {daysLeft} days
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                                    <Groups sx={{ fontSize: 24 }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                        2,410 Supporters
                                    </Typography>
                                </Box>
                                <Button 
                                    startIcon={<Share />} 
                                    sx={{ ml: 'auto', fontWeight: 800, color: 'secondary.main' }}
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert('Link copied to clipboard!');
                                    }}
                                >
                                    Share Campaign
                                </Button>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <Box sx={{ p: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.secondary.main, 0.02) }}>
                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 900, color: 'secondary.main' }}>
                                            KES {Number(campaign.raised_amount).toLocaleString()}
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                            {Math.round(progress)}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={progress} 
                                        sx={{ height: 10, borderRadius: 5, bgcolor: alpha(theme.palette.secondary.main, 0.1), '& .MuiLinearProgress-bar': { bgcolor: 'secondary.main' } }}
                                    />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
                                    Target: KES {Number(campaign.target_amount).toLocaleString()}
                                </Typography>
                                <Button 
                                    fullWidth 
                                    variant="contained" 
                                    color="secondary" 
                                    size="large"
                                    startIcon={<Favorite />}
                                    onClick={() => setDonationDialogOpen(true)}
                                    sx={{ py: 2, fontWeight: 900, borderRadius: 1 }}
                                >
                                    Donate to Mission
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Expansive Imagery & Content */}
            <Container maxWidth={false} sx={{ px: { xs: 2, md: 8, lg: 10 }, mt: 8 }}>
                <Grid container spacing={8}>
                    <Grid item xs={12} md={7}>
                        <Box sx={{ overflow: 'hidden', borderRadius: 2, mb: 6 }}>
                            <Box
                                component="img"
                                src={campaign.featured_image || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=2070"}
                                alt={campaign.title}
                                sx={{ width: '100%', maxHeight: 600, objectFit: 'cover' }}
                            />
                        </Box>

                        <Box
                            sx={{
                                fontSize: '1.25rem',
                                lineHeight: 1.8,
                                color: 'text.primary',
                                fontFamily: '"Outfit", sans-serif',
                                '& p': { mb: 4 },
                                '& h2': { fontSize: '2rem', fontWeight: 800, mt: 6, mb: 3, letterSpacing: '-0.02em' },
                                '& blockquote': { 
                                    borderLeft: '4px solid', 
                                    borderColor: 'secondary.main', 
                                    pl: 4, my: 6, fontStyle: 'italic', color: 'secondary.main', fontSize: '1.5rem', bgcolor: alpha(theme.palette.secondary.main, 0.03), py: 4, borderRadius: '0 8px 8px 0' 
                                }
                            }}
                            dangerouslySetInnerHTML={{ __html: campaign.description || '' }}
                        />

                        {/* Gallery Section */}
                        {campaign.gallery_images && campaign.gallery_images.length > 0 && (
                            <Box sx={{ mt: 8 }}>
                                <Typography variant="h4" sx={{ fontWeight: 900, mb: 4 }}>Visual Progress</Typography>
                                <Grid container spacing={3}>
                                    {campaign.gallery_images.map((img: any) => (
                                        <Grid item xs={12} sm={6} key={img.id}>
                                            <Box
                                                component="img"
                                                src={img.file}
                                                alt={img.alt_text}
                                                sx={{ width: '100%', height: 350, objectFit: 'cover', borderRadius: 2 }}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <Box sx={{ position: { md: 'sticky' }, top: 100 }}>
                            <Box sx={{ p: 4, borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.02), border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <TrendingUp color="secondary" />
                                    Impact Metrics
                                </Typography>
                                
                                <Stack spacing={4}>
                                    <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1 }}>SUPPORTERS</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 900 }}>2,410</Typography>
                                        <Typography variant="body2" color="text.secondary">Passionate individuals contributing.</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1 }}>TIME REMAINING</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 900 }}>{daysLeft} Days</Typography>
                                        <Typography variant="body2" color="text.secondary">Until the mission target is reviewed.</Typography>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ pt: 2 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                            "Every shilling contributed directly supports the beneficiaries listed in this campaign. We maintain end-to-end transparency."
                                        </Typography>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 900, mt: 2 }}>— Kindra Management</Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            {/* Donation Dialog */}
            <DonationDialog
                open={donationDialogOpen}
                onClose={() => setDonationDialogOpen(false)}
                campaign={campaign}
            />
        </Box>
    );
}
