/**
 * Public Stories & Campaigns Page
 * Displays published blog posts and active campaigns with tabbed interface
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchPosts } from '../features/blog/blogSlice';
import { fetchCampaigns } from '../features/campaigns/campaignsSlice';
import {
    Box,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Chip,
    Container,
    Button,
    InputAdornment,
    TextField,
    CircularProgress,
    alpha,
    Paper,
    useTheme,
    Tabs,
    Tab,
    LinearProgress
} from '@mui/material';
import {
    Search,
    ArrowForward,
    AccessTime,
    Article,
    Campaign as CampaignIcon,

    CalendarMonth,
    Favorite,
    AttachMoney,
    Handshake,
    Inventory,
    Forum
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
    const { campaigns, isLoading: campaignsLoading } = useSelector((state: RootState) => state.campaigns);

    const [currentTab, setCurrentTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Participation dialogs state
    const [donationDialogOpen, setDonationDialogOpen] = useState(false);
    const [volunteerDialogOpen, setVolunteerDialogOpen] = useState(false);
    const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

    useEffect(() => {
        dispatch(fetchPosts());
        dispatch(fetchCampaigns());
    }, [dispatch]);

    // Filter published blog posts
    const allPublishedStories = posts.filter((post: any) => post.status === 'PUBLISHED');

    // Filter active campaigns
    const allActiveCampaigns = campaigns.filter((campaign: any) => campaign.status === 'ACTIVE');

    // Extract categories
    const storyCategories = ['All', ...Array.from(new Set(allPublishedStories.map((p: any) => p.category?.name || 'Uncategorized')))];
    const campaignCategories = ['All', ...Array.from(new Set(allActiveCampaigns.map((c: any) => c.category?.replace('_', ' ') || 'Uncategorized')))];

    // Apply category filter
    const publishedStories = selectedCategory === 'All'
        ? allPublishedStories
        : allPublishedStories.filter((p: any) => (p.category?.name || 'Uncategorized') === selectedCategory);

    const activeCampaigns = selectedCategory === 'All'
        ? allActiveCampaigns
        : allActiveCampaigns.filter((c: any) => (c.category?.replace('_', ' ') || 'Uncategorized') === selectedCategory);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
        setSearchQuery('');
        setSelectedCategory('All');
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'CRITICAL':
                return { bg: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main };
            case 'HIGH':
                return { bg: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main };
            case 'MEDIUM':
                return { bg: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main };
            default:
                return { bg: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main };
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: currency || 'KES',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 12 }}>
            {/* Hero Section */}
            <Box sx={{
                py: 8,
                mb: 4,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`
            }}>
                <Container maxWidth="lg">
                    <Typography
                        component={motion.h2}
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        variant="h3"
                        fontWeight="800"
                        gutterBottom
                        color="text.primary"
                    >
                        Stories & Campaigns
                    </Typography>
                    <Typography
                        component={motion.p}
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        variant="body1"
                        color="text.secondary"
                        sx={{ maxWidth: 700 }}
                    >
                        Discover our impact stories and support active campaigns making a difference.
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg">
                {/* Tabs Navigation */}
                <Paper
                    component={motion.div}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    elevation={0}
                    sx={{
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.1),
                        boxShadow: theme.shadows[1],
                        mb: 4,
                        background: alpha(theme.palette.background.paper, 0.7),
                        backdropFilter: 'blur(10px)',
                        overflow: 'hidden'
                    }}
                >
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        sx={{
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            px: 2,
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 600,
                                py: 2.5
                            }
                        }}
                    >
                        <Tab
                            icon={<Article />}
                            iconPosition="start"
                            label={`Impact Stories (${publishedStories.length})`}
                        />
                        <Tab
                            icon={<CampaignIcon />}
                            iconPosition="start"
                            label={`Active Campaigns (${activeCampaigns.length})`}
                        />
                    </Tabs>

                    {/* Search & Filter Bar */}
                    <Box sx={{
                        p: 3,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 3,
                        alignItems: 'center',
                        bgcolor: alpha(theme.palette.primary.main, 0.02)
                    }}>
                        <TextField
                            placeholder={currentTab === 0 ? "Search stories..." : "Search campaigns..."}
                            variant="outlined"
                            size="medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search color="action" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 3, bgcolor: 'background.paper', fontWeight: 500 }
                            }}
                            sx={{ flexGrow: 1, minWidth: 280 }}
                        />
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {(currentTab === 0 ? storyCategories : campaignCategories).map((category) => (
                                <Chip
                                    key={category}
                                    label={category}
                                    onClick={() => setSelectedCategory(category)}
                                    variant={selectedCategory === category ? "filled" : "outlined"}
                                    color={selectedCategory === category ? "primary" : "default"}
                                    sx={{ borderRadius: 2, fontWeight: 600, height: 40, px: 1 }}
                                />
                            ))}
                        </Box>
                    </Box>
                </Paper>

                {/* Tab Panels */}
                <AnimatePresence mode="wait">
                    {currentTab === 0 ? (
                        <motion.div
                            key="stories-tab"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {blogLoading && publishedStories.length === 0 ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                    <CircularProgress />
                                </Box>
                            ) : publishedStories.length > 0 ? (
                                <Grid container spacing={4} sx={{ py: 4 }}>
                                    {publishedStories.map((story: any, index: number) => (
                                        <Grid
                                            item
                                            xs={12}
                                            md={6}
                                            lg={4}
                                            key={story.id || `story-${story.slug}-${index}`}
                                            component={motion.div}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.05 * index }}
                                        >
                                            <Card
                                                onClick={() => navigate(`/stories/${story.slug}`)}
                                                sx={{
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    borderRadius: 2,
                                                    border: '1px solid',
                                                    borderColor: alpha(theme.palette.divider, 0.1),
                                                    boxShadow: theme.shadows[1],
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                                    '&:hover': {
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: theme.shadows[4],
                                                        borderColor: alpha(theme.palette.primary.main, 0.2)
                                                    }
                                                }}
                                            >
                                                <Box sx={{ position: 'relative' }}>
                                                    <CardMedia
                                                        component="img"
                                                        height="240"
                                                        image={story.featured_image || `https://source.unsplash.com/random/800x600?charity,community&sig=${index}`}
                                                        alt={story.title}
                                                        sx={{ objectFit: 'cover' }}
                                                    />
                                                    <Chip
                                                        label={story.category_name || story.category?.name || 'Update'}
                                                        size="small"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 16,
                                                            right: 16,
                                                            bgcolor: 'background.paper',
                                                            fontWeight: 'bold',
                                                            boxShadow: theme.shadows[2]
                                                        }}
                                                    />
                                                </Box>
                                                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'text.secondary', fontSize: '0.875rem' }}>
                                                        <AccessTime sx={{ fontSize: 16 }} />
                                                        <Typography variant="caption" fontWeight="medium">
                                                            {new Date(story.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </Typography>
                                                        <Typography variant="caption">•</Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <Favorite sx={{ fontSize: 14, color: theme.palette.error.main }} />
                                                            <Typography variant="caption" fontWeight="bold">{story.likes_count || 0}</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <Forum sx={{ fontSize: 14, color: theme.palette.primary.main }} />
                                                            <Typography variant="caption" fontWeight="bold">{story.comment_count || 0}</Typography>
                                                        </Box>
                                                    </Box>
                                                    <Typography variant="h5" fontWeight="800" gutterBottom sx={{ lineHeight: 1.3 }}>
                                                        {story.title}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3, lineHeight: 1.6 }}>
                                                        {story.excerpt || story.content?.substring(0, 120) + '...'}
                                                    </Typography>
                                                    <Button
                                                        endIcon={<ArrowForward />}
                                                        sx={{
                                                            mt: 'auto',
                                                            textTransform: 'none',
                                                            fontWeight: 'bold',
                                                            color: 'primary.main',
                                                            p: 0,
                                                            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                                                        }}
                                                        disableRipple
                                                    >
                                                        Read Full Story
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 12, bgcolor: 'background.paper', borderRadius: 4, border: '1px dashed', borderColor: 'divider' }}>
                                    <Article sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                    <Typography variant="h5" fontWeight="bold" gutterBottom color="text.secondary">
                                        No stories published yet
                                    </Typography>
                                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                                        Check back soon for inspiring impact stories from our community.
                                    </Typography>
                                </Box>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="campaigns-tab"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {campaignsLoading && activeCampaigns.length === 0 ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                    <CircularProgress />
                                </Box>
                            ) : activeCampaigns.length > 0 ? (
                                <Grid container spacing={4} sx={{ py: 4 }}>
                                    {activeCampaigns.map((campaign: any, index: number) => {
                                        const urgencyStyle = getUrgencyColor(campaign.urgency);
                                        const progress = campaign.progress_percentage || ((campaign.raised_amount / campaign.target_amount) * 100);

                                        return (
                                            <Grid
                                                item
                                                xs={12}
                                                md={6}
                                                lg={4}
                                                key={campaign.id || `campaign-${campaign.slug}-${index}`}
                                                component={motion.div}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.05 * index }}
                                            >
                                                <Card
                                                    sx={{
                                                        height: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        borderRadius: 2,
                                                        border: '1px solid',
                                                        borderColor: alpha(theme.palette.divider, 0.1),
                                                        boxShadow: theme.shadows[1],
                                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                                        '&:hover': {
                                                            transform: 'translateY(-4px)',
                                                            boxShadow: theme.shadows[4],
                                                            borderColor: alpha(theme.palette.primary.main, 0.2)
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{ position: 'relative' }}>
                                                        <CardMedia
                                                            component="img"
                                                            height="240"
                                                            image={campaign.featured_image || `https://source.unsplash.com/random/800x600?charity,fundraising&sig=${index}`}
                                                            alt={campaign.title}
                                                            sx={{ objectFit: 'cover' }}
                                                        />
                                                        <Chip
                                                            label={campaign.urgency}
                                                            size="small"
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 16,
                                                                right: 16,
                                                                bgcolor: urgencyStyle.bg,
                                                                color: urgencyStyle.color,
                                                                fontWeight: 'bold',
                                                                border: '1px solid',
                                                                borderColor: urgencyStyle.color
                                                            }}
                                                        />
                                                        {campaign.is_featured && (
                                                            <Chip
                                                                icon={<Favorite sx={{ fontSize: 16 }} />}
                                                                label="Featured"
                                                                size="small"
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: 16,
                                                                    left: 16,
                                                                    bgcolor: 'background.paper',
                                                                    fontWeight: 'bold',
                                                                    boxShadow: theme.shadows[2]
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                                        <Box sx={{ mb: 2 }}>
                                                            <Chip
                                                                label={campaign.category?.replace('_', ' ')}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ borderRadius: 2, fontWeight: 600 }}
                                                            />
                                                        </Box>

                                                        <Typography variant="h5" fontWeight="800" gutterBottom sx={{ lineHeight: 1.3 }}>
                                                            {campaign.title}
                                                        </Typography>

                                                        <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3, lineHeight: 1.6 }}>
                                                            {campaign.description?.substring(0, 120) + '...'}
                                                        </Typography>

                                                        {/* Progress Bar */}
                                                        <Box sx={{ mb: 2 }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                                <Typography variant="body2" fontWeight="bold" color="primary.main">
                                                                    {formatCurrency(campaign.raised_amount, campaign.currency)}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary" fontWeight="medium">
                                                                    {Math.round(progress)}% funded
                                                                </Typography>
                                                            </Box>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={Math.min(progress, 100)}
                                                                sx={{
                                                                    height: 8,
                                                                    borderRadius: 4,
                                                                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                                                                }}
                                                            />
                                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                                Goal: {formatCurrency(campaign.target_amount, campaign.currency)}
                                                            </Typography>
                                                        </Box>

                                                        {/* Campaign Timeline */}
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, color: 'text.secondary' }}>
                                                            <CalendarMonth sx={{ fontSize: 16 }} />
                                                            <Typography variant="caption" fontWeight="medium">
                                                                Ends {new Date(campaign.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                                                            <Button
                                                                variant="contained"
                                                                fullWidth
                                                                startIcon={<AttachMoney />}
                                                                onClick={() => {
                                                                    setSelectedCampaign(campaign);
                                                                    setDonationDialogOpen(true);
                                                                }}
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    fontWeight: 'bold',
                                                                    borderRadius: 3,
                                                                    py: 1.2,
                                                                    boxShadow: theme.shadows[2]
                                                                }}
                                                            >
                                                                Donate
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
                                                                startIcon={<Handshake />}
                                                                onClick={() => {
                                                                    setSelectedCampaign(campaign);
                                                                    setVolunteerDialogOpen(true);
                                                                }}
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    fontWeight: 'bold',
                                                                    borderRadius: 3,
                                                                    py: 1.2,
                                                                    minWidth: 48
                                                                }}
                                                            >
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
                                                                startIcon={<Inventory />}
                                                                onClick={() => {
                                                                    setSelectedCampaign(campaign);
                                                                    setMaterialDialogOpen(true);
                                                                }}
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    fontWeight: 'bold',
                                                                    borderRadius: 3,
                                                                    py: 1.2,
                                                                    minWidth: 48
                                                                }}
                                                            >
                                                            </Button>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 12, bgcolor: 'background.paper', borderRadius: 4, border: '1px dashed', borderColor: 'divider' }}>
                                    <CampaignIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                    <Typography variant="h5" fontWeight="bold" gutterBottom color="text.secondary">
                                        No active campaigns
                                    </Typography>
                                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                                        Check back soon for new fundraising campaigns.
                                    </Typography>
                                </Box>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <Box sx={{ mt: 8, textAlign: 'center' }}>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/')}
                        sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, border: '2px solid' }}
                    >
                        Back to Home
                    </Button>
                </Box>
            </Container>

            {/* Participation Dialogs */}
            {
                selectedCampaign && (
                    <>
                        <DonationDialog
                            open={donationDialogOpen}
                            onClose={() => {
                                setDonationDialogOpen(false);
                                // Refetch campaigns to update progress after admin approval
                                dispatch(fetchCampaigns());
                            }}
                            campaign={selectedCampaign}
                        />
                        <VolunteerDialog
                            open={volunteerDialogOpen}
                            onClose={() => {
                                setVolunteerDialogOpen(false);
                            }}
                            campaign={selectedCampaign}
                        />
                        <MaterialDonationDialog
                            open={materialDialogOpen}
                            onClose={() => {
                                setMaterialDialogOpen(false);
                            }}
                            campaign={selectedCampaign}
                        />
                    </>
                )
            }
        </Box >
    );
}
