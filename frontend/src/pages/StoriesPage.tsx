/**
 * Public Stories & Campaigns Page
 * Premium editorial magazine layout — cinematic, minimal, high-industry-level.
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchPosts } from '../features/blog/blogSlice';
import { fetchCampaigns } from '../features/donations/donationsSlice';
import {
    Box,
    Container,
    Typography,
    Chip,
    Button,
    InputAdornment,
    TextField,
    CircularProgress,
    alpha,
    useTheme,
    LinearProgress,
    Avatar,
    Skeleton,
    Grid
} from '@mui/material';
import {
    Search,
    ArrowForward,
    Article,
    TrendingUp,
    CalendarToday,
    Person,
    AccessTime
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DonationDialog from '../components/campaigns/DonationDialog';
import VolunteerDialog from '../components/campaigns/VolunteerDialog';
import MaterialDonationDialog from '../components/campaigns/MaterialDonationDialog';

export default function StoriesPage() {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { posts, isLoading: blogLoading } = useSelector((state: RootState) => state.blog);
    const { campaigns, isLoading: campaignsLoading } = useSelector((state: RootState) => state.donations);

    const [currentTab, setCurrentTab] = useState<'stories' | 'campaigns'>('stories');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const [donationDialogOpen, setDonationDialogOpen] = useState(false);
    const [volunteerDialogOpen, setVolunteerDialogOpen] = useState(false);
    const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

    useEffect(() => {
        dispatch(fetchPosts());
        dispatch(fetchCampaigns());
    }, [dispatch]);

    const allPublishedStories = [...posts]
        .filter((post: any) => post.status === 'PUBLISHED')
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    const allActiveCampaigns = [...campaigns]
        .filter((campaign: any) => campaign.status === 'ACTIVE')
        .sort((a, b) => new Date(b.published_at || b.created_at || 0).getTime() - new Date(a.published_at || a.created_at || 0).getTime());

    const storyCategories = ['All', ...Array.from(new Set(allPublishedStories.map((p: any) => p.category_name || p.category?.name || 'Uncategorized')))];
    const campaignCategories = ['All', ...Array.from(new Set(allActiveCampaigns.map((c: any) => c.category?.replace(/_/g, ' ') || 'Uncategorized')))];
    const categories = currentTab === 'stories' ? storyCategories : campaignCategories;

    const filteredStories = allPublishedStories.filter((p: any) => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || (p.category_name || p.category?.name || 'Uncategorized') === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const filteredCampaigns = allActiveCampaigns.filter((c: any) => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || (c.category?.replace(/_/g, ' ') || 'Uncategorized') === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const items = currentTab === 'stories' ? filteredStories : filteredCampaigns;
    const isLoading = blogLoading || campaignsLoading;

    const handleTabChange = (tab: 'stories' | 'campaigns') => {
        setCurrentTab(tab);
        setSearchQuery('');
        setSelectedCategory('All');
    };

    const getAuthorName = (item: any) => {
        if (currentTab === 'campaigns') return 'Kindra CBO';
        const author = item.author;
        if (author?.role === 'ADMIN' || author?.role === 'MANAGEMENT' || item.author_role === 'ADMIN') return 'Management';
        return item.author_name || (author ? `${author.first_name} ${author.last_name}` : 'Kindra CBO');
    };

    const formatCurrency = (amount: number, currency: string) =>
        new Intl.NumberFormat('en-KE', { style: 'currency', currency: currency || 'KES', minimumFractionDigits: 0 }).format(amount);

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'CRITICAL': return theme.palette.error.main;
            case 'HIGH': return theme.palette.warning.main;
            case 'MEDIUM': return theme.palette.info.main;
            default: return theme.palette.success.main;
        }
    };

    const featuredItem = items.length > 0 ? items[0] : null;
    const gridItems = items.length > 1 ? items.slice(1) : [];

    // --- Skeleton Card ---
    const SkeletonCard = () => (
        <Box sx={{ mb: 4 }}>
            <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 3, mb: 2 }} />
            <Skeleton variant="text" width="40%" height={16} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={28} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="90%" height={16} />
            <Skeleton variant="text" width="60%" height={16} />
        </Box>
    );

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            sx={{ bgcolor: 'background.default', minHeight: '100vh' }}
        >
            {/* ─── CONTENT NAVIGATION ─── */}
            <Box sx={{
                borderBottom: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.6),
                bgcolor: 'background.paper'
            }}>
                <Container maxWidth={false} sx={{ px: { xs: 2, md: 6, lg: 10 } }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 2,
                        gap: 3,
                        flexWrap: 'wrap'
                    }}>
                        {/* Tab Switcher — Pill Style */}
                        <Box sx={{
                            display: 'inline-flex',
                            bgcolor: alpha(theme.palette.divider, 0.06),
                            borderRadius: 1,
                            p: 0.5,
                            gap: 0.5
                        }}>
                            {(['stories', 'campaigns'] as const).map((tab) => (
                                <Box
                                    key={tab}
                                    component={motion.button}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => handleTabChange(tab)}
                                    sx={{
                                        cursor: 'pointer',
                                        border: 'none',
                                        outline: 'none',
                                        px: 3,
                                        py: 1,
                                        borderRadius: 0.75,
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        fontFamily: 'inherit',
                                        transition: 'all 0.25s ease',
                                        bgcolor: currentTab === tab ? 'text.primary' : 'transparent',
                                        color: currentTab === tab ? 'background.paper' : 'text.secondary',
                                        '&:hover': {
                                            color: currentTab === tab ? 'background.paper' : 'text.primary'
                                        }
                                    }}
                                >
                                    {tab === 'stories' ? 'Impact Stories' : 'Active Campaigns'}
                                </Box>
                            ))}
                        </Box>

                        {/* Search */}
                        <TextField
                            placeholder={`Search ${currentTab}...`}
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ color: 'text.disabled', fontSize: 18 }} />
                                    </InputAdornment>
                                ),
                                sx: {
                                    borderRadius: 100,
                                    fontSize: '0.875rem',
                                    bgcolor: alpha(theme.palette.divider, 0.05),
                                    width: { xs: '100%', sm: 260 }
                                }
                            }}
                            sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.divider, 0.3) } }}
                        />
                    </Box>

                    {/* Category Pills */}
                    <Box sx={{
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'nowrap',
                        overflowX: 'auto',
                        pb: 2,
                        '&::-webkit-scrollbar': { display: 'none' },
                        scrollbarWidth: 'none'
                    }}>
                        {categories.map((cat) => (
                            <Chip
                                key={cat}
                                label={cat}
                                size="small"
                                onClick={() => setSelectedCategory(cat)}
                                sx={{
                                    borderRadius: 100,
                                    fontWeight: 600,
                                    fontSize: '0.78rem',
                                    px: 0.5,
                                    transition: 'all 0.2s',
                                    bgcolor: selectedCategory === cat
                                        ? 'text.primary'
                                        : alpha(theme.palette.divider, 0.08),
                                    color: selectedCategory === cat ? 'background.paper' : 'text.secondary',
                                    border: 'none',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: selectedCategory === cat ? 'text.primary' : alpha(theme.palette.divider, 0.16)
                                    }
                                }}
                            />
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* ─── EDITORIAL INTRO ─── */}
            <Container maxWidth={false} sx={{ px: { xs: 2, md: 6, lg: 10 }, pt: { xs: 6, md: 10 }, pb: { xs: 5, md: 8 } }}>
                <Box sx={{ maxWidth: 820 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                        <Box sx={{ width: 36, height: 2, bgcolor: 'secondary.main' }} />
                        <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '0.16em' }}>
                            Kindra Journal
                        </Typography>
                    </Box>
                    <Typography
                        component={motion.h1}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        sx={{
                            fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
                            fontWeight: 900,
                            letterSpacing: '-0.045em',
                            lineHeight: 1.02,
                            color: 'text.primary',
                            mb: 2
                        }}
                    >
                        {currentTab === 'stories' ? 'Impact Stories' : 'Active Campaigns'}
                    </Typography>
                    <Typography
                        component={motion.p}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        sx={{
                            fontSize: { xs: '1rem', md: '1.15rem' },
                            color: 'text.secondary',
                            fontWeight: 500,
                            lineHeight: 1.6,
                            maxWidth: 600
                        }}
                    >
                        {currentTab === 'stories'
                            ? `${allPublishedStories.length} stories documenting the lives changed by your support.`
                            : `${allActiveCampaigns.length} campaigns running now. Every contribution moves the needle.`
                        }
                    </Typography>
                </Box>
            </Container>

            {/* ─── CONTENT ─── */}
            <Container maxWidth={false} sx={{ px: { xs: 2, md: 6, lg: 10 }, pb: 12 }}>
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={7}>
                                    <Skeleton variant="rectangular" height={520} sx={{ borderRadius: 4, mb: 3 }} />
                                    <Skeleton variant="text" width="30%" height={16} sx={{ mb: 1 }} />
                                    <Skeleton variant="text" width="75%" height={40} sx={{ mb: 1 }} />
                                    <Skeleton variant="text" width="90%" height={20} />
                                </Grid>
                                <Grid item xs={12} md={5}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
                                    </Box>
                                </Grid>
                            </Grid>
                        </motion.div>
                    ) : items.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <Box sx={{ textAlign: 'center', py: 16 }}>
                                <Article sx={{ fontSize: 64, color: 'text.disabled', mb: 3 }} />
                                <Typography variant="h5" fontWeight={800} color="text.secondary" sx={{ mb: 1 }}>
                                    No results found
                                </Typography>
                                <Typography color="text.disabled" sx={{ mb: 4 }}>
                                    Try adjusting your search or filters.
                                </Typography>
                                <Button
                                    onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                                    variant="outlined"
                                    sx={{ borderRadius: 100, px: 4, fontWeight: 700, textTransform: 'none' }}
                                >
                                    Clear filters
                                </Button>
                            </Box>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={`${currentTab}-${selectedCategory}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.35 }}
                        >
                            {/* ─── FEATURED ITEM ─── */}
                            {featuredItem && (
                                <Box
                                    sx={{
                                        mb: 10,
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                                        gap: 6,
                                        alignItems: 'center'
                                    }}
                                >
                                    {/* Featured Image */}
                                    <Box
                                        onClick={() => currentTab === 'stories'
                                            ? navigate(`/stories/${featuredItem.slug}`)
                                            : navigate(`/campaigns/${featuredItem.slug || featuredItem.id}`)
                                        }
                                        sx={{
                                            position: 'relative',
                                            borderRadius: 1.5,
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            aspectRatio: '16/10',
                                            '&:hover img': { transform: 'scale(1.04)' },
                                            '&:hover .featured-overlay': { opacity: 1 },
                                            boxShadow: `0 24px 60px ${alpha(theme.palette.text.primary, 0.14)}`
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={featuredItem.featured_image || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=2070'}
                                            alt={featuredItem.title}
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                        />
                                        {/* Dark scrim overlay */}
                                        <Box sx={{
                                            position: 'absolute', inset: 0,
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)'
                                        }} />
                                        {/* Play/read CTA overlay */}
                                        <Box
                                            className="featured-overlay"
                                            sx={{
                                                position: 'absolute', inset: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                bgcolor: 'rgba(0,0,0,0.25)',
                                                opacity: 0, transition: 'opacity 0.3s ease'
                                            }}
                                        >
                                            <Box sx={{
                                                bgcolor: 'white', color: 'black',
                                                px: 3, py: 1.5, borderRadius: 100,
                                                fontWeight: 800, fontSize: '0.9rem',
                                                display: 'flex', alignItems: 'center', gap: 1
                                            }}>
                                                {currentTab === 'stories' ? 'Read Story' : 'View Campaign'}
                                                <ArrowForward sx={{ fontSize: 16 }} />
                                            </Box>
                                        </Box>
                                        {/* Category pill on image */}
                                        <Chip
                                            label={featuredItem.category_name || featuredItem.category?.name || (currentTab === 'campaigns' ? featuredItem.category?.replace(/_/g, ' ') : 'FEATURED')}
                                            size="small"
                                            sx={{
                                                position: 'absolute', top: 20, left: 20,
                                                bgcolor: 'rgba(255,255,255,0.95)',
                                                color: 'text.primary',
                                                fontWeight: 800, fontSize: '0.7rem',
                                                letterSpacing: '0.08em',
                                                textTransform: 'uppercase',
                                                backdropFilter: 'blur(10px)'
                                            }}
                                        />
                                    </Box>

                                    {/* Featured Text */}
                                    <Box
                                        component={motion.div}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.15 }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main' }}>
                                                <Person sx={{ fontSize: 16 }} />
                                            </Avatar>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                                {getAuthorName(featuredItem)}
                                            </Typography>
                                            <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                                {new Date(featuredItem.published_at || featuredItem.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </Typography>
                                        </Box>

                                        <Typography
                                            variant="h3"
                                            sx={{
                                                fontWeight: 900,
                                                letterSpacing: '-0.035em',
                                                lineHeight: 1.12,
                                                mb: 2.5,
                                                fontSize: { xs: '1.8rem', md: '2.4rem' },
                                                color: 'text.primary'
                                            }}
                                        >
                                            {featuredItem.title}
                                        </Typography>

                                        <Typography
                                            sx={{
                                                color: 'text.secondary',
                                                lineHeight: 1.7,
                                                fontSize: '1rem',
                                                mb: 4,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 4,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {featuredItem.excerpt || (featuredItem.description || featuredItem.content || '').substring(0, 220) + '...'}
                                        </Typography>

                                        {/* Campaign Progress */}
                                        {currentTab === 'campaigns' && (
                                            <Box sx={{ mb: 4 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                                                    <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: 'primary.main' }}>
                                                        {formatCurrency(featuredItem.raised_amount || 0, featuredItem.currency)}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                                        {Math.round((featuredItem.raised_amount / featuredItem.target_amount) * 100 || 0)}% of {formatCurrency(featuredItem.target_amount || 0, featuredItem.currency)}
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={Math.min(((featuredItem.raised_amount || 0) / (featuredItem.target_amount || 1)) * 100, 100)}
                                                    sx={{
                                                        height: 6, borderRadius: 100,
                                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                        '& .MuiLinearProgress-bar': { borderRadius: 100, bgcolor: 'primary.main' }
                                                    }}
                                                />
                                                <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>SUPPORTERS</Typography>
                                                        <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>{(featuredItem.donation_count || featuredItem.donors_count || 0).toLocaleString()}</Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>DAYS LEFT</Typography>
                                                        <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>
                                                            {Math.max(0, Math.ceil((new Date(featuredItem.end_date).getTime() - Date.now()) / 86400000))}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )}

                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Button
                                                variant="contained"
                                                onClick={() => {
                                                    if (currentTab === 'campaigns') {
                                                        setSelectedCampaign(featuredItem);
                                                        setDonationDialogOpen(true);
                                                    } else {
                                                        navigate(`/stories/${featuredItem.slug}`);
                                                    }
                                                }}
                                                endIcon={<ArrowForward />}
                                                sx={{
                                                    borderRadius: 100, px: 4, py: 1.5,
                                                    fontWeight: 700, textTransform: 'none',
                                                    bgcolor: 'text.primary', color: 'background.paper',
                                                    boxShadow: 'none',
                                                    '&:hover': { bgcolor: 'text.secondary', boxShadow: 'none' }
                                                }}
                                            >
                                                {currentTab === 'campaigns' ? 'Donate Now' : 'Read Story'}
                                            </Button>
                                            {currentTab === 'campaigns' && (
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => navigate(`/campaigns/${featuredItem.slug || featuredItem.id}`)}
                                                    sx={{
                                                        borderRadius: 100, px: 3, py: 1.5,
                                                        fontWeight: 700, textTransform: 'none',
                                                        borderColor: alpha(theme.palette.divider, 0.4),
                                                        color: 'text.secondary',
                                                        '&:hover': { borderColor: 'text.primary', color: 'text.primary', bgcolor: 'transparent' }
                                                    }}
                                                >
                                                    Learn More
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            )}

                            {/* ─── DIVIDER ─── */}
                            {featuredItem && gridItems.length > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 8 }}>
                                    <Box sx={{ flex: 1, height: '1px', bgcolor: alpha(theme.palette.divider, 0.5) }} />
                                    <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.disabled', letterSpacing: 2, whiteSpace: 'nowrap' }}>
                                        {currentTab === 'stories' ? 'More Stories' : 'More Campaigns'}
                                    </Typography>
                                    <Box sx={{ flex: 1, height: '1px', bgcolor: alpha(theme.palette.divider, 0.5) }} />
                                </Box>
                            )}

                            {/* ─── GRID ─── */}
                            {gridItems.length > 0 && (
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: {
                                            xs: '1fr',
                                            sm: 'repeat(2, 1fr)',
                                            lg: 'repeat(3, 1fr)'
                                        },
                                        gap: { xs: 4, md: 5 }
                                    }}
                                >
                                    {gridItems.map((item: any, index: number) => {
                                        const progress = currentTab === 'campaigns'
                                            ? Math.min(((item.raised_amount || 0) / (item.target_amount || 1)) * 100, 100)
                                            : 0;

                                        return (
                                            <Box
                                                key={item.id || index}
                                                component={motion.div}
                                                initial={{ opacity: 0, y: 24 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.4, delay: index * 0.07 }}
                                                onClick={() => currentTab === 'stories'
                                                    ? navigate(`/stories/${item.slug}`)
                                                    : navigate(`/campaigns/${item.slug || item.id}`)
                                                }
                                                sx={{ cursor: 'pointer', '&:hover .story-img': { transform: 'scale(1.05)' } }}
                                            >
                                                {/* Image */}
                                                <Box sx={{
                                                    position: 'relative',
                                                    borderRadius: 1.5,
                                                    overflow: 'hidden',
                                                    mb: 3,
                                                    aspectRatio: '16/10'
                                                }}>
                                                    <Box
                                                        className="story-img"
                                                        component="img"
                                                        src={item.featured_image || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800'}
                                                        alt={item.title}
                                                        sx={{
                                                            width: '100%', height: '100%',
                                                            objectFit: 'cover',
                                                            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                                                        }}
                                                    />
                                                    {/* Urgency badge for campaigns */}
                                                    {currentTab === 'campaigns' && item.urgency && item.urgency !== 'LOW' && (
                                                        <Chip
                                                            label={item.urgency}
                                                            size="small"
                                                            sx={{
                                                                position: 'absolute', top: 14, right: 14,
                                                                bgcolor: alpha(getUrgencyColor(item.urgency), 0.9),
                                                                color: '#fff', fontWeight: 800,
                                                                fontSize: '0.65rem', letterSpacing: '0.06em'
                                                            }}
                                                        />
                                                    )}
                                                </Box>

                                                {/* Meta */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                                    <Typography variant="caption" sx={{
                                                        fontWeight: 800, color: 'primary.main',
                                                        textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem'
                                                    }}>
                                                        {item.category_name || item.category?.name || (currentTab === 'campaigns' ? item.category?.replace(/_/g, ' ') : 'Story')}
                                                    </Typography>
                                                    <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                                                    <Typography variant="caption" sx={{ color: 'text.disabled', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <AccessTime sx={{ fontSize: 11 }} />
                                                        {new Date(item.published_at || item.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                    </Typography>
                                                </Box>

                                                <Typography sx={{
                                                    fontWeight: 800, fontSize: '1.05rem',
                                                    letterSpacing: '-0.02em', lineHeight: 1.3,
                                                    mb: 1.5, color: 'text.primary',
                                                    display: '-webkit-box', WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                                }}>
                                                    {item.title}
                                                </Typography>

                                                <Typography sx={{
                                                    color: 'text.secondary', fontSize: '0.875rem',
                                                    lineHeight: 1.6, mb: 2.5,
                                                    display: '-webkit-box', WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                                }}>
                                                    {item.excerpt || (item.description || item.content || '').substring(0, 120) + '...'}
                                                </Typography>

                                                {/* Campaign Progress Bar */}
                                                {currentTab === 'campaigns' && (
                                                    <Box sx={{ mb: 3 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                                                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                                                {formatCurrency(item.raised_amount || 0, item.currency)}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                                                {Math.round(progress)}%
                                                            </Typography>
                                                        </Box>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={progress}
                                                            sx={{
                                                                height: 4, borderRadius: 100,
                                                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                                '& .MuiLinearProgress-bar': { borderRadius: 100 }
                                                            }}
                                                        />
                                                    </Box>
                                                )}

                                                {/* Footer */}
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    pt: 2.5,
                                                    borderTop: '1px solid',
                                                    borderColor: alpha(theme.palette.divider, 0.4)
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                                                            {getAuthorName(item).charAt(0)}
                                                        </Avatar>
                                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                                            {getAuthorName(item)}
                                                        </Typography>
                                                    </Box>
                                                    <Button
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (currentTab === 'campaigns') {
                                                                setSelectedCampaign(item);
                                                                setDonationDialogOpen(true);
                                                            } else {
                                                                navigate(`/stories/${item.slug}`);
                                                            }
                                                        }}
                                                        sx={{
                                                            borderRadius: 1, px: 1.5,
                                                            fontWeight: 700, textTransform: 'none',
                                                            fontSize: '0.78rem',
                                                            color: 'text.primary',
                                                            bgcolor: alpha(theme.palette.divider, 0.08),
                                                            '&:hover': { bgcolor: alpha(theme.palette.divider, 0.16) }
                                                        }}
                                                    >
                                                        {currentTab === 'campaigns' ? 'Donate' : 'Read →'}
                                                    </Button>
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            )}

                            {/* ─── BOTTOM CTA ─── */}
                            <Box sx={{
                                mt: 16, pt: 10,
                                borderTop: '1px solid', borderColor: alpha(theme.palette.divider, 0.4),
                                textAlign: 'center'
                            }}>
                                <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.disabled', letterSpacing: 2 }}>
                                    Be part of the story
                                </Typography>
                                <Typography variant="h4" sx={{
                                    fontWeight: 900, letterSpacing: '-0.03em',
                                    mt: 1, mb: 3,
                                    fontSize: { xs: '1.8rem', md: '2.5rem' }
                                }}>
                                    Ready to make an impact?
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => navigate('/dashboard')}
                                    endIcon={<ArrowForward />}
                                    sx={{
                                        borderRadius: 100, px: 6, py: 1.75,
                                        fontWeight: 800, textTransform: 'none', fontSize: '1rem',
                                        bgcolor: 'text.primary', color: 'background.paper', boxShadow: 'none',
                                        '&:hover': { bgcolor: 'text.secondary', boxShadow: 'none' }
                                    }}
                                >
                                    Visit Dashboard
                                </Button>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Container>

            {/* Participation Dialogs */}
            {selectedCampaign && (
                <>
                    <DonationDialog
                        open={donationDialogOpen}
                        onClose={() => {
                            setDonationDialogOpen(false);
                            dispatch(fetchCampaigns());
                        }}
                        campaign={selectedCampaign}
                    />
                    <VolunteerDialog
                        open={volunteerDialogOpen}
                        onClose={() => setVolunteerDialogOpen(false)}
                        campaign={selectedCampaign}
                    />
                    <MaterialDonationDialog
                        open={materialDialogOpen}
                        onClose={() => setMaterialDialogOpen(false)}
                        campaign={selectedCampaign}
                    />
                </>
            )}
        </Box>
    );
}
