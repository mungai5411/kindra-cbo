import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Container, Typography, Chip, Button, Skeleton, Divider, Paper, useTheme, alpha, LinearProgress, Grid, Stack
} from '@mui/material';
import { ArrowBack, Favorite, Share, Campaign, InfoOutlined } from '@mui/icons-material';
import { AppDispatch, RootState } from '../store';
import { fetchCampaigns } from '../features/donations/donationsSlice';
import { motion, AnimatePresence } from 'framer-motion';

export default function CampaignPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const theme = useTheme();

    const { campaigns, isLoading } = useSelector((state: RootState) => state.donations);
    const campaign = campaigns.find(c => c.slug === slug || c.id === slug);

    // Hero carousel state
    const [heroIndex, setHeroIndex] = useState(0);

    useEffect(() => {
        if (!campaign && slug) {
            dispatch(fetchCampaigns());
        }
    }, [dispatch, campaign, slug]);

    // Dynamic Hero Timer
    useEffect(() => {
        if (campaign && campaign.gallery_images && campaign.gallery_images.length > 0) {
            const timer = setInterval(() => {
                setHeroIndex(prev => (prev + 1) % (campaign.gallery_images.length + 1));
            }, 6000); // Cycle every 6 seconds
            return () => clearInterval(timer);
        }
    }, [campaign]);

    if (isLoading && !campaign) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                <Skeleton variant="rectangular" height={500} animation="wave" />
                <Container sx={{ mt: 4 }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={8}>
                            <Skeleton variant="text" height={60} width="80%" />
                            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4, mt: 4 }} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4 }} />
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        );
    }

    if (!campaign && !isLoading) {
        return (
            <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
                <Paper sx={{ p: 4, borderRadius: 4, border: '1px dashed', borderColor: alpha(theme.palette.divider, 0.2), bgcolor: 'background.paper' }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom color="error">Campaign Not Found</Typography>
                    <Typography color="text.secondary" paragraph>The campaign might have ended or been moved.</Typography>
                    <Button variant="contained" onClick={() => navigate('/donate')} startIcon={<ArrowBack />} sx={{ mt: 2, borderRadius: 3 }}>View Active Campaigns</Button>
                </Paper>
            </Container>
        );
    }

    if (!campaign) return null;

    const progress = campaign.target_amount > 0 ? Math.min((campaign.raised_amount / campaign.target_amount) * 100, 100) : 0;

    // Media list for dynamic hero: [Featured, ...Gallery]
    const heroMedia = [
        { url: campaign.featured_image, title: 'Featured' },
        ...(campaign.gallery_images || []).map((img: any) => ({ url: img.file, title: img.title || img.alt_text }))
    ];

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 12 }}>

            {/* Dynamic Hero Section */}
            <Box sx={{
                position: 'relative',
                height: { xs: '60vh', md: '75vh' },
                width: '100%',
                bgcolor: 'grey.900',
                overflow: 'hidden'
            }}>
                <AnimatePresence mode="wait">
                    <Box
                        key={heroIndex}
                        component={motion.div}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `url(${heroMedia[heroIndex]?.url || "https://source.unsplash.com/random/1600x900?charity"})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                </AnimatePresence>

                {/* Visual Overlay for contrast */}
                <Box sx={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%)',
                    backdropFilter: heroIndex > 0 ? 'blur(2px)' : 'none', // Subtle blur if it's a gallery image
                    display: 'flex', alignItems: 'flex-end', pb: { xs: 8, md: 12 }
                }}>
                    <Container maxWidth="lg">
                        <Stack spacing={2}>
                            <Button
                                startIcon={<ArrowBack />}
                                onClick={() => navigate('/donate')}
                                sx={{
                                    width: 'fit-content', color: 'white',
                                    backdropFilter: 'blur(10px)',
                                    bgcolor: alpha('#fff', 0.1),
                                    '&:hover': { bgcolor: alpha('#fff', 0.2) }
                                }}
                            >
                                Back to All Campaigns
                            </Button>
                            <Box component={motion.div} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                                <Chip label={campaign.category || 'Humanitarian'} sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 800, mb: 1 }} />
                                <Typography variant="h1" fontWeight="900" sx={{
                                    fontSize: { xs: '2.5rem', md: '4.5rem' },
                                    lineHeight: 1,
                                    color: 'white',
                                    textShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                    letterSpacing: '-0.05em'
                                }}>
                                    {campaign.title}
                                </Typography>
                            </Box>
                        </Stack>
                    </Container>
                </Box>
            </Box>

            {/* Content Layout: 2-Columns */}
            <Container maxWidth="lg" sx={{ mt: -6, position: 'relative', zIndex: 10 }}>
                <Grid container spacing={5}>

                    {/* Left Column: Visual Story (Images) */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={4}>
                            {campaign.gallery_images && campaign.gallery_images.length > 0 ? (
                                campaign.gallery_images.map((img: any, idx: number) => (
                                    <Paper key={img.id} elevation={0} component={motion.div} whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} viewport={{ once: true }} sx={{ p: 2, borderRadius: 6, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
                                        <Box
                                            component="img"
                                            src={img.file}
                                            alt={img.alt_text}
                                            sx={{ width: '100%', maxHeight: 600, objectFit: 'cover', borderRadius: 4 }}
                                        />
                                        <Box sx={{ mt: 2, px: 2 }}>
                                            <Typography variant="h6" fontWeight="800" color="primary.main">
                                                {img.title || `Media Asset #${idx + 1}`}
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                {img.alt_text || 'Impact story visual captured on site.'}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                ))
                            ) : (
                                <Paper elevation={0} sx={{ p: 2, borderRadius: 6, overflow: 'hidden' }}>
                                    <Box
                                        component="img"
                                        src={campaign.featured_image}
                                        sx={{ width: '100%', borderRadius: 4 }}
                                    />
                                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>Featured Campaign Visual</Typography>
                                </Paper>
                            )}
                        </Stack>
                    </Grid>

                    {/* Right Column: Mission & Wordings (Sticky) */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ position: { md: 'sticky' }, top: 100 }}>
                            <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 6, mb: 4, bgcolor: 'background.paper', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="h4" fontWeight="900" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Campaign sx={{ fontSize: 40, color: 'primary.main' }} />
                                    The Mission
                                </Typography>

                                <Box
                                    sx={{
                                        fontSize: '1.15rem',
                                        lineHeight: 1.8,
                                        color: 'text.primary',
                                        mb: 4,
                                        '& p': { mb: 2.5 },
                                        '& blockquote': {
                                            borderLeft: '5px solid',
                                            borderColor: 'secondary.main',
                                            pl: 3, my: 4,
                                            fontStyle: 'italic',
                                            color: 'text.secondary',
                                            bgcolor: alpha(theme.palette.secondary.main, 0.05),
                                            py: 1, px: 2, borderRadius: 2
                                        },
                                        '& p.drop-cap::first-letter': {
                                            float: 'left', fontSize: '4.5rem', lineHeight: '3.5rem', paddingRight: '0.8rem', fontWeight: 900, color: 'primary.main'
                                        }
                                    }}
                                    dangerouslySetInnerHTML={{ __html: campaign.description || '' }}
                                />

                                <Divider sx={{ mb: 4 }} />

                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h6" fontWeight="900" gutterBottom color="text.secondary">FUNDRAISING STATUS</Typography>
                                    <Typography variant="h3" fontWeight="900" color="primary.main">
                                        KES {Number(campaign.raised_amount).toLocaleString()}
                                    </Typography>
                                    <Typography variant="h6" color="text.secondary" fontWeight={500} sx={{ mb: 2 }}>
                                        raised of KES {Number(campaign.target_amount).toLocaleString()}
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progress}
                                        sx={{
                                            height: 14, borderRadius: 7, mb: 3,
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            '& .MuiLinearProgress-bar': { borderRadius: 7, background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` }
                                        }}
                                    />
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="h5" fontWeight="900">2,410</Typography>
                                            <Typography variant="body2" color="text.secondary">Donors</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="h5" fontWeight="900">
                                                {Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">Days Left</Typography>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Stack spacing={2}>
                                    <Button
                                        fullWidth variant="contained" color="primary" size="large"
                                        startIcon={<Favorite />}
                                        sx={{ py: 2, borderRadius: 4, fontWeight: 900, fontSize: '1.2rem', boxShadow: theme.shadows[8] }}
                                    >
                                        Donate Now
                                    </Button>
                                    <Button
                                        fullWidth variant="outlined" size="large"
                                        startIcon={<Share />}
                                        sx={{ py: 1.5, borderRadius: 4, fontWeight: 700 }}
                                    >
                                        Share Campaign
                                    </Button>
                                </Stack>

                                <Box sx={{ mt: 4, p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 3, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                    <InfoOutlined color="info" />
                                    <Typography variant="body2" color="text.secondary">
                                        Your donation is securely processed and 100% goes to this verified mission.
                                    </Typography>
                                </Box>
                            </Paper>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
