/**
 * Public Campaign Detail Page
 * Premium editorial layout — full-bleed hero, real data, glass morphism sidebar.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Container,
    Typography,
    Button,
    Skeleton,
    Divider,
    Grid,
    LinearProgress,
    useTheme,
    alpha,
    Snackbar,
    Alert,
    Chip
} from '@mui/material';
import {
    ArrowBack,
    Favorite,
    Share,
    CalendarToday,
    TrendingUp,
    Groups,
    CheckCircle
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
    const [shareSnackbar, setShareSnackbar] = useState(false);

    useEffect(() => {
        if (!campaign) {
            dispatch(fetchCampaigns());
        }
    }, [dispatch, campaign, slug]);

    if (isLoading && !campaign) {
        return (
            <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
                {/* Skeleton Hero */}
                <Skeleton variant="rectangular" height={520} sx={{ width: '100%' }} />
                <Container maxWidth="lg" sx={{ py: 8 }}>
                    <Grid container spacing={6}>
                        <Grid item xs={12} md={7}>
                            <Skeleton variant="text" height={20} width="20%" sx={{ mb: 2 }} />
                            <Skeleton variant="text" height={60} width="90%" sx={{ mb: 1 }} />
                            <Skeleton variant="text" height={60} width="70%" sx={{ mb: 4 }} />
                            <Skeleton variant="text" height={20} width="100%" sx={{ mb: 1 }} />
                            <Skeleton variant="text" height={20} width="100%" sx={{ mb: 1 }} />
                            <Skeleton variant="text" height={20} width="80%" />
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <Skeleton variant="rectangular" height={380} sx={{ borderRadius: 3 }} />
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        );
    }

    if (!campaign) {
        return (
            <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textCol: 'center', p: 6, textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>Campaign Not Found</Typography>
                    <Typography color="text.secondary" sx={{ mb: 4 }}>This campaign may have ended or been removed.</Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/stories')}
                        startIcon={<ArrowBack />}
                        sx={{ borderRadius: 100, px: 4, py: 1.5, fontWeight: 700, textTransform: 'none', bgcolor: 'text.primary', color: 'background.paper', boxShadow: 'none' }}
                    >
                        Back to Stories
                    </Button>
                </Box>
            </Box>
        );
    }

    const progress = Math.min(((campaign.raised_amount || 0) / (campaign.target_amount || 1)) * 100, 100);
    const daysLeft = Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / 86400000));
    // Use real supporter count from API — no hardcoded values
    const supporterCount = campaign.donation_count || campaign.donors_count || 0;

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setShareSnackbar(true);
    };

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 16 }}
        >
            {/* ─── FULL-BLEED HERO ─── */}
            <Box sx={{ position: 'relative', height: { xs: 340, md: 520, lg: 620 }, overflow: 'hidden' }}>
                <Box
                    component="img"
                    src={campaign.featured_image || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=2070'}
                    alt={campaign.title}
                    sx={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        filter: 'brightness(0.65)'
                    }}
                />
                {/* Gradient overlay */}
                <Box sx={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.7) 100%)'
                }} />

                {/* Back button */}
                <Container maxWidth="lg" sx={{ position: 'absolute', top: 0, left: 0, right: 0, pt: 4 }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/stories')}
                        sx={{
                            color: 'rgba(255,255,255,0.85)', fontWeight: 700,
                            textTransform: 'none', fontSize: '0.9rem',
                            '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' }
                        }}
                    >
                        Back to Stories
                    </Button>
                </Container>

                {/* Hero Text */}
                <Container maxWidth="lg" sx={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, pb: { xs: 5, md: 7 }
                }}>
                    <Box>
                        <Chip
                            label={campaign.status || 'ACTIVE'}
                            size="small"
                            sx={{
                                mb: 2,
                                bgcolor: campaign.status === 'ACTIVE' ? alpha(theme.palette.success.main, 0.9) : alpha(theme.palette.warning.main, 0.9),
                                color: '#fff', fontWeight: 800, fontSize: '0.7rem',
                                letterSpacing: '0.08em'
                            }}
                        />
                        <Typography
                            variant="h1"
                            component={motion.h1}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            sx={{
                                color: '#fff',
                                fontSize: { xs: '2rem', md: '3.2rem', lg: '4rem' },
                                fontWeight: 900,
                                letterSpacing: '-0.04em',
                                lineHeight: 1.1,
                                mb: 3,
                                maxWidth: 760
                            }}
                        >
                            {campaign.title}
                        </Typography>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 4 }, alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255,255,255,0.8)' }}>
                                <CalendarToday sx={{ fontSize: 16 }} />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {daysLeft > 0 ? `${daysLeft} days remaining` : 'Campaign ended'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255,255,255,0.8)' }}>
                                <Groups sx={{ fontSize: 18 }} />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {supporterCount.toLocaleString()} supporter{supporterCount !== 1 ? 's' : ''}
                                </Typography>
                            </Box>
                            <Button
                                startIcon={<Share sx={{ fontSize: 16 }} />}
                                onClick={handleShare}
                                sx={{
                                    color: 'rgba(255,255,255,0.8)', fontWeight: 700,
                                    textTransform: 'none', fontSize: '0.875rem',
                                    ml: 'auto',
                                    '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                            >
                                Share
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* ─── CONTENT ─── */}
            <Container maxWidth="lg" sx={{ mt: { xs: -4, md: -6 }, position: 'relative', zIndex: 1 }}>
                <Grid container spacing={4}>
                    {/* Main Content */}
                    <Grid item xs={12} md={7} lg={8}>
                        {/* Description */}
                        <Box
                            sx={{
                                bgcolor: 'background.paper',
                                borderRadius: 3,
                                p: { xs: 3, md: 5 },
                                mb: 4,
                                border: '1px solid',
                                borderColor: alpha(theme.palette.divider, 0.6),
                                fontSize: '1.1rem',
                                lineHeight: 1.8,
                                color: 'text.primary',
                                '& p': { mb: 3 },
                                '& h2': {
                                    fontSize: '1.6rem', fontWeight: 800,
                                    mt: 5, mb: 2.5, letterSpacing: '-0.02em'
                                },
                                '& h3': { fontSize: '1.2rem', fontWeight: 700, mt: 4, mb: 2 },
                                '& blockquote': {
                                    borderLeft: '4px solid',
                                    borderColor: 'primary.main',
                                    pl: 4, my: 5,
                                    fontStyle: 'italic',
                                    color: 'text.secondary',
                                    fontSize: '1.2rem',
                                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                                    py: 3, borderRadius: '0 12px 12px 0'
                                },
                                '& ul, & ol': { pl: 3, mb: 3 },
                                '& li': { mb: 1 }
                            }}
                            dangerouslySetInnerHTML={{ __html: campaign.description || '<p>No description available.</p>' }}
                        />

                        {/* Gallery */}
                        {campaign.gallery_images && campaign.gallery_images.length > 0 && (
                            <Box sx={{
                                bgcolor: 'background.paper',
                                borderRadius: 3,
                                p: { xs: 3, md: 5 },
                                border: '1px solid', borderColor: alpha(theme.palette.divider, 0.6)
                            }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, letterSpacing: '-0.02em' }}>
                                    Visual Progress
                                </Typography>
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: 2
                                }}>
                                    {campaign.gallery_images.map((img: any, i: number) => (
                                        <Box
                                            key={img.id || i}
                                            component="img"
                                            src={img.file}
                                            alt={img.alt_text || `Gallery image ${i + 1}`}
                                            sx={{
                                                width: '100%', aspectRatio: '4/3',
                                                objectFit: 'cover', borderRadius: 2,
                                                transition: 'transform 0.3s ease',
                                                '&:hover': { transform: 'scale(1.02)' }
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Grid>

                    {/* Sticky Sidebar */}
                    <Grid item xs={12} md={5} lg={4}>
                        <Box sx={{ position: { md: 'sticky' }, top: 24 }}>
                            {/* Donation Card */}
                            <Box
                                component={motion.div}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                sx={{
                                    bgcolor: 'background.paper',
                                    borderRadius: 3,
                                    p: 4,
                                    mb: 3,
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.divider, 0.6),
                                    boxShadow: '0 8px 40px rgba(0,0,0,0.08)'
                                }}
                            >
                                {/* Raised Amount */}
                                <Typography sx={{
                                    fontWeight: 900, fontSize: '2rem',
                                    letterSpacing: '-0.03em', color: 'text.primary', mb: 0.5
                                }}>
                                    {new Intl.NumberFormat('en-KE', { style: 'currency', currency: campaign.currency || 'KES', minimumFractionDigits: 0 }).format(campaign.raised_amount || 0)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                                    raised of {new Intl.NumberFormat('en-KE', { style: 'currency', currency: campaign.currency || 'KES', minimumFractionDigits: 0 }).format(campaign.target_amount || 0)} goal
                                </Typography>

                                {/* Progress Bar */}
                                <LinearProgress
                                    variant="determinate"
                                    value={progress}
                                    sx={{
                                        height: 8, borderRadius: 100, mb: 3,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 100,
                                            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                                        }
                                    }}
                                />

                                {/* Stats Row */}
                                <Box sx={{
                                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                                    gap: 2, mb: 4,
                                    pb: 4, borderBottom: '1px solid',
                                    borderColor: alpha(theme.palette.divider, 0.5)
                                }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography sx={{ fontWeight: 900, fontSize: '1.3rem', letterSpacing: '-0.02em' }}>
                                            {Math.round(progress)}%
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem' }}>
                                            Funded
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center', borderLeft: '1px solid', borderRight: '1px solid', borderColor: alpha(theme.palette.divider, 0.5) }}>
                                        {/* Real supporter count from API */}
                                        <Typography sx={{ fontWeight: 900, fontSize: '1.3rem', letterSpacing: '-0.02em' }}>
                                            {supporterCount.toLocaleString()}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem' }}>
                                            Supporters
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography sx={{ fontWeight: 900, fontSize: '1.3rem', letterSpacing: '-0.02em' }}>
                                            {daysLeft}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem' }}>
                                            Days Left
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* CTA */}
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    startIcon={<Favorite />}
                                    onClick={() => setDonationDialogOpen(true)}
                                    sx={{
                                        py: 2, fontWeight: 900, borderRadius: 2,
                                        textTransform: 'none', fontSize: '1rem',
                                        bgcolor: 'text.primary', color: 'background.paper', boxShadow: 'none',
                                        '&:hover': { bgcolor: 'text.secondary', boxShadow: 'none' }
                                    }}
                                >
                                    Donate to This Campaign
                                </Button>
                            </Box>

                            {/* Impact Metrics Card */}
                            <Box sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.04),
                                borderRadius: 3, p: 4,
                                border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.12)
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                    <TrendingUp sx={{ color: 'primary.main', fontSize: 20 }} />
                                    <Typography sx={{ fontWeight: 800, fontSize: '0.95rem' }}>Impact Metrics</Typography>
                                </Box>

                                {[
                                    {
                                        label: 'Campaign Progress',
                                        value: `${Math.round(progress)}% funded`,
                                        sub: `${new Intl.NumberFormat('en-KE', { style: 'currency', currency: campaign.currency || 'KES', minimumFractionDigits: 0 }).format((campaign.target_amount || 0) - (campaign.raised_amount || 0))} remaining`
                                    },
                                    {
                                        label: 'Total Supporters',
                                        value: `${supporterCount.toLocaleString()} people`,
                                        sub: 'Have contributed to this cause'
                                    },
                                    {
                                        label: 'Time Remaining',
                                        value: daysLeft > 0 ? `${daysLeft} days` : 'Ended',
                                        sub: `Deadline: ${new Date(campaign.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`
                                    }
                                ].map((metric, i) => (
                                    <Box key={i} sx={{ mb: i < 2 ? 3 : 0 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 0.5 }}>
                                            {metric.label}
                                        </Typography>
                                        <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                                            {metric.value}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                            {metric.sub}
                                        </Typography>
                                        {i < 2 && <Divider sx={{ mt: 3 }} />}
                                    </Box>
                                ))}
                            </Box>

                            {/* Trust Signal */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 3, px: 1 }}>
                                <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, lineHeight: 1.4 }}>
                                    Every shilling goes directly to beneficiaries. Full transparency guaranteed.
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            <DonationDialog
                open={donationDialogOpen}
                onClose={() => setDonationDialogOpen(false)}
                campaign={campaign}
            />

            <Snackbar
                open={shareSnackbar}
                autoHideDuration={3000}
                onClose={() => setShareSnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" sx={{ borderRadius: 2, fontWeight: 700 }}>
                    Campaign link copied to clipboard!
                </Alert>
            </Snackbar>
        </Box>
    );
}
