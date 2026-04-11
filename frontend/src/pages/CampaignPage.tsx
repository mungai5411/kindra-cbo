import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Container, Typography, Chip, Button, Skeleton, Paper, useTheme, alpha, Grid, Stack, IconButton
} from '@mui/material';
import { ArrowBack, Favorite, Share, Campaign, InfoOutlined, AccessTimeFilled, Diversity3 } from '@mui/icons-material';
import { AppDispatch, RootState } from '../store';
import { fetchCampaigns } from '../features/donations/donationsSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { TrafalgarHero } from '../components/common/TrafalgarHero';

// --- Styled Components / Design Tokens ---

const GlassPanel = ({ children, sx = {} }: any) => {
    const theme = useTheme();
    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 6,
                position: 'relative',
                overflow: 'hidden',
                ...sx
            }}
        >
            {children}
        </Paper>
    );
};

const GlassMediaCard = ({ img, idx }: any) => {
    const theme = useTheme();
    return (
        <Paper
            elevation={0}
            component={motion.div}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.8 }}
            sx={{
                p: 2,
                borderRadius: 6,
                transition: 'transform 0.4s ease',
                '&:hover': { transform: 'translateY(-8px)' }
            }}
        >
            <Box
                component="img"
                src={img.file}
                alt={img.alt_text}
                sx={{
                    width: '100%',
                    maxHeight: 600,
                    objectFit: 'cover',
                    borderRadius: 6,
                    display: 'block'
                }}
            />
            <Box sx={{ mt: 3, px: 1 }}>
                <Typography variant="h6" fontWeight="900" color="primary.dark" sx={{ mb: 0.5 }}>
                    {img.title || `Visual Insight #${idx + 1}`}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', opacity: 0.8 }}>
                    {img.alt_text || 'An integral part of the mission story.'}
                </Typography>
            </Box>
        </Paper>
    );
};

// --- Custom Progress Beam ---
const ProgressBeam = ({ value }: { value: number }) => {
    const theme = useTheme();
    return (
        <Box sx={{ width: '100%', mb: 4, mt: 1 }}>
            <Box sx={{
                height: 16,
                width: '100%',
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                borderRadius: 8,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Box
                    component={motion.div}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    sx={{
                        height: '100%',
                        borderRadius: 8,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.4)}`
                    }}
                />
            </Box>
        </Box>
    );
};

export default function CampaignPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const theme = useTheme();

    const { campaigns, isLoading } = useSelector((state: RootState) => state.donations);
    const campaign = campaigns.find(c => c.slug === slug || c.id === slug);

    const [heroIndex, setHeroIndex] = useState(0);

    useEffect(() => {
        if (!campaign && slug) {
            dispatch(fetchCampaigns());
        }
    }, [dispatch, campaign, slug]);

    useEffect(() => {
        if (campaign && campaign.gallery_images?.length > 0) {
            const timer = setInterval(() => {
                setHeroIndex(prev => (prev + 1) % (campaign.gallery_images.length + 1));
            }, 7000); // 7s for calmer feel
            return () => clearInterval(timer);
        }
    }, [campaign]);

    if (isLoading && !campaign) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                <Skeleton variant="rectangular" height="60vh" animation="wave" />
                <Container sx={{ mt: 4 }}>
                    <Grid container spacing={6}>
                        <Grid item xs={12} md={7}>
                            <Skeleton variant="text" height={80} width="60%" />
                            <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 8, mt: 4 }} />
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 8 }} />
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        );
    }

    if (!campaign && !isLoading) {
        return (
             <Container maxWidth="md" sx={{ py: 15, textAlign: 'center' }}>
                <GlassPanel sx={{ p: 8, textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="900" gutterBottom color="primary.main">Quiet Mission</Typography>
                    <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4 }}>
                        This story hasn't finished loading or has found its completion.
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => navigate('/donate')} 
                        startIcon={<ArrowBack />} 
                        sx={{ px: 4, py: 1.5, borderRadius: 1, fontWeight: 800 }}
                    >
                        Active Missions
                    </Button>
                </GlassPanel>
            </Container>
        );
    }

    if (!campaign) return null;

    const progress = campaign.target_amount > 0 ? Math.min((campaign.raised_amount / campaign.target_amount) * 100, 100) : 0;
    const heroMedia = [
        { url: campaign.featured_image, title: 'Featured' },
        ...(campaign.gallery_images || []).map((img: any) => ({ url: img.file, title: img.title }))
    ];

    const daysLeft = Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 15, position: 'relative', overflow: 'hidden' }}>
            
            {/* Trafalgar Hero Section */}
            <TrafalgarHero 
                title={campaign.title}
                description={campaign.description ? campaign.description.replace(/<[^>]+>/g, '').substring(0, 160) + '...' : 'Supporting our community.'}
                primaryActionText="Donate to Mission"
                onPrimaryAction={() => navigate('/donate')}
                imageSrc={heroMedia[heroIndex]?.url || campaign.featured_image}
                imageAlt={campaign.title}
                reverse={false}
            />

            {/* Main Content Layout */}
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
                <Grid container spacing={8}>

                    {/* Column 1: The Visual Story */}
                    <Grid item xs={12} md={7}>
                        <Stack spacing={6}>
                            {campaign.gallery_images?.length > 0 ? (
                                campaign.gallery_images.map((img: any, idx: number) => (
                                    <GlassMediaCard key={img.id} img={img} idx={idx} />
                                ))
                            ) : (
                                <Box sx={{ p: 2, borderRadius: 8, bgcolor: 'background.paper', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                                    <Box component="img" src={campaign.featured_image} sx={{ width: '100%', borderRadius: 6 }} />
                                </Box>
                            )}
                        </Stack>
                    </Grid>

                    {/* Column 2: The Heart of the Mission (Glass Sidebar) */}
                    <Grid item xs={12} md={5}>
                        <Box sx={{ position: { md: 'sticky' }, top: 100 }}>
                            <GlassPanel>
                                <Typography variant="h5" fontWeight="900" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, opacity: 0.9 }}>
                                    <Campaign sx={{ fontSize: 32, color: 'primary.main', opacity: 0.6 }} />
                                    The Narrative
                                </Typography>

                                <Box
                                    sx={{
                                        fontSize: '1.25rem',
                                        lineHeight: 1.85,
                                        color: 'text.primary',
                                        mb: 6,
                                        '& p': { mb: 3 },
                                        '& blockquote': {
                                            borderLeft: '4px solid', borderColor: 'secondary.main',
                                            pl: 4, my: 5, fontStyle: 'italic', fontWeight: 500,
                                            color: 'text.secondary', opacity: 0.9
                                        }
                                    }}
                                    dangerouslySetInnerHTML={{ __html: campaign.description || '' }}
                                />

                                <Box sx={{ mb: 6 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="900" color="text.secondary">FUNDRAISED</Typography>
                                        <Typography variant="h6" fontWeight="900" color="primary.main">
                                            {Math.round(progress)}%
                                        </Typography>
                                    </Stack>
                                    
                                    <Typography variant="h2" fontWeight="900" color="text.primary" sx={{ mb: 1 }}>
                                        KES {Number(campaign.raised_amount).toLocaleString()}
                                    </Typography>
                                    <Typography variant="h6" color="text.secondary" fontWeight={500} sx={{ mb: 3, opacity: 0.7 }}>
                                        Target: KES {Number(campaign.target_amount).toLocaleString()}
                                    </Typography>

                                    <ProgressBeam value={progress} />

                                    <Grid container spacing={3} sx={{ mt: 2 }}>
                                        <Grid item xs={6}>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Diversity3 color="primary" sx={{ opacity: 0.6 }} />
                                                <Box>
                                                    <Typography variant="h5" fontWeight="900">2,410</Typography>
                                                    <Typography variant="caption" color="text.secondary" fontWeight={700}>SUPPORTERS</Typography>
                                                </Box>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <AccessTimeFilled color="secondary" sx={{ opacity: 0.6 }} />
                                                <Box>
                                                    <Typography variant="h5" fontWeight="900">{daysLeft}</Typography>
                                                    <Typography variant="caption" color="text.secondary" fontWeight={700}>DAYS TO GO</Typography>
                                                </Box>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Stack spacing={2.5}>
                                    <Button
                                        fullWidth variant="contained" size="large"
                                        startIcon={<Favorite />}
                                        sx={{ 
                                            py: 2.5, borderRadius: 1, fontWeight: 900, fontSize: '1.25rem',
                                            bgcolor: 'primary.main',
                                            boxShadow: `0 15px 30px ${alpha(theme.palette.primary.main, 0.3)}`,
                                            '&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.02)' },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Donate to Mission
                                    </Button>
                                    <Button
                                        fullWidth variant="outlined" size="large"
                                        startIcon={<Share />}
                                        sx={{ 
                                            py: 2, borderRadius: 1, fontWeight: 900, 
                                            borderWidth: 2, borderColor: alpha(theme.palette.divider, 0.1),
                                            bgcolor: alpha('#fff', 0.05),
                                            backdropFilter: 'blur(5px)',
                                            '&:hover': { borderWidth: 2, bgcolor: alpha('#fff', 0.1) }
                                        }}
                                    >
                                        Signal Others
                                    </Button>
                                </Stack>

                                <Box sx={{ 
                                    mt: 6, p: 2.5, 
                                    bgcolor: alpha(theme.palette.primary.main, 0.04), 
                                    borderRadius: 1.5, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1),
                                    display: 'flex', gap: 2, alignItems: 'center' 
                                }}>
                                    <InfoOutlined color="primary" sx={{ opacity: 0.7 }} />
                                    <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontStyle: 'italic' }}>
                                        End-to-end transparency: Your life-changing contribution is verified & audited.
                                    </Typography>
                                </Box>
                            </GlassPanel>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
