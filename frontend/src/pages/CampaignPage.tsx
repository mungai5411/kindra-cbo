import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Container, Typography, Chip, Button, Skeleton, Divider, Paper, useTheme, alpha, LinearProgress
} from '@mui/material';
import { ArrowBack, Favorite, Event } from '@mui/icons-material';
import { AppDispatch, RootState } from '../store';
import { fetchCampaigns } from '../features/donations/donationsSlice';
import { motion } from 'framer-motion';

export default function CampaignPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const theme = useTheme();

    const { campaigns, isLoading } = useSelector((state: RootState) => state.donations);
    const campaign = campaigns.find(c => c.slug === slug || c.id === slug);

    useEffect(() => {
        if (!campaign && slug) {
            dispatch(fetchCampaigns());
        }
    }, [dispatch, campaign, slug]);

    if (isLoading && !campaign) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                <Skeleton variant="rectangular" height={400} animation="wave" />
                <Container maxWidth="md" sx={{ mt: 4 }}>
                    <Skeleton variant="text" height={60} width="80%" />
                    <Skeleton variant="text" height={30} width="40%" sx={{ mb: 4 }} />
                    <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
                </Container>
            </Box>
        );
    }

    if (!campaign && !isLoading) {
        return (
            <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
                <Paper sx={{ p: 4, borderRadius: 2, border: '1px dashed', borderColor: alpha(theme.palette.divider, 0.1), boxShadow: theme.shadows[1], bgcolor: 'background.paper' }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom color="error">
                        Campaign Not Found
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                        The campaign you are looking for might have ended or been moved.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/donate')}
                        startIcon={<ArrowBack />}
                        sx={{ mt: 2, borderRadius: 3 }}
                    >
                        View Active Campaigns
                    </Button>
                </Paper>
            </Container>
        );
    }

    if (!campaign) return null;

    const progress = campaign.target_amount > 0 ? Math.min((campaign.raised_amount / campaign.target_amount) * 100, 100) : 0;

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 12 }}
        >
            {/* Hero Section */}
            <Box sx={{
                position: 'relative',
                height: { xs: 350, md: 550 },
                width: '100%',
                bgcolor: 'grey.900',
                color: 'white',
                overflow: 'hidden'
            }}>
                <Box
                    component="img"
                    src={campaign.featured_image || "https://source.unsplash.com/random/1600x900?charity"}
                    alt={campaign.title}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }}
                />
                <Box sx={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)',
                    display: 'flex', alignItems: 'flex-end'
                }}>
                    <Container maxWidth="md" sx={{ pb: { xs: 6, md: 8 } }}>
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={() => navigate('/donate')}
                            sx={{ color: 'white', mb: 3, backdropFilter: 'blur(4px)', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                        >
                            Back to Campaigns
                        </Button>
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                            <Chip label={campaign.category || 'General'} sx={{ bgcolor: theme.palette.secondary.main, color: 'white', fontWeight: 'bold', mb: 2 }} />
                            <Typography variant="h2" fontWeight="900" sx={{
                                fontSize: { xs: '2.5rem', md: '4rem' },
                                lineHeight: 1.1,
                                textShadow: '0 4px 15px rgba(0,0,0,0.4)',
                                mb: 2,
                                letterSpacing: -1
                            }}>
                                {campaign.title}
                            </Typography>
                        </motion.div>
                    </Container>
                </Box>
            </Box>

            {/* Main Content Area */}
            <Container maxWidth="md" sx={{ mt: -6, position: 'relative', zIndex: 2 }}>
                <Paper component={motion.div} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} elevation={0} sx={{
                    p: { xs: 3, md: 6 },
                    borderRadius: 4,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.1),
                    bgcolor: 'background.paper',
                    mb: 4
                }}>

                    {/* Donation Progress Card */}
                    <Box sx={{ mb: 6, p: 4, bgcolor: alpha(theme.palette.primary.main, 0.03), borderRadius: 3, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1) }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                            <Typography variant="h4" fontWeight="900" color="primary.main">
                                KES {Number(campaign.raised_amount).toLocaleString()}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary" fontWeight="600">
                                raised of KES {Number(campaign.target_amount).toLocaleString()} goal
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{ height: 12, borderRadius: 6, bgcolor: alpha(theme.palette.primary.main, 0.1), '& .MuiLinearProgress-bar': { borderRadius: 6 } }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight="bold" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Event fontSize="small" /> Ends on {new Date(campaign.end_date).toLocaleDateString()}
                            </Typography>
                            <Button variant="contained" color="secondary" size="large" startIcon={<Favorite />} sx={{ borderRadius: 4, px: 5, py: 1.5, fontWeight: 'bold' }}>
                                Donate Now
                            </Button>
                        </Box>
                    </Box>

                    {/* Campaign Description (Rich Text) */}
                    <Typography variant="h5" fontWeight="900" gutterBottom>
                        The Mission
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Box
                        sx={{
                            fontSize: '1.15rem',
                            lineHeight: 1.8,
                            color: 'text.primary',
                            fontFamily: '"Outfit", sans-serif',
                            '& p': { mb: 3 },
                            '& img': { maxWidth: '100%', borderRadius: 2, my: 4, display: 'block' },
                            '& blockquote': { borderLeft: '4px solid', borderColor: 'primary.main', pl: 3, fontStyle: 'italic', color: 'text.secondary', bgcolor: alpha(theme.palette.primary.main, 0.05), py: 2, borderRadius: 1 }
                        }}
                        dangerouslySetInnerHTML={{ __html: campaign.description || '' }}
                    />

                    {/* Visual Media Gallery */}
                    {campaign.gallery_images && campaign.gallery_images.length > 0 && (
                        <Box sx={{ mt: 6 }}>
                            <Typography variant="h5" fontWeight="900" gutterBottom>
                                Campaign Gallery
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                            <Box sx={{
                                display: 'flex',
                                gap: 2,
                                overflowX: 'auto',
                                pb: 2,
                                pt: 1,
                                px: 1,
                                ml: -1,
                                scrollSnapType: 'x mandatory',
                                '&::-webkit-scrollbar': { height: 8 },
                                '&::-webkit-scrollbar-thumb': { bgcolor: alpha(theme.palette.secondary.main, 0.3), borderRadius: 4 },
                                '&::-webkit-scrollbar-track': { bgcolor: alpha(theme.palette.divider, 0.1), borderRadius: 4 }
                            }}>
                                {campaign.gallery_images.map((img: any) => (
                                    <Box
                                        key={img.id}
                                        component="img"
                                        src={img.file}
                                        alt={img.alt_text || 'Campaign Media'}
                                        sx={{
                                            height: { xs: 220, md: 320 },
                                            minWidth: { xs: 280, md: 400 },
                                            objectFit: 'cover',
                                            borderRadius: 3,
                                            scrollSnapAlign: 'center',
                                            boxShadow: theme.shadows[4],
                                            transition: 'transform 0.3s ease',
                                            '&:hover': { transform: 'scale(1.02)' }
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}

