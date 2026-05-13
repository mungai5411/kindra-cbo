/**
 * Public Stories & Campaigns Page
 * Redesigned with a premium editorial look, featured latest item, and 3-column grid.
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchPosts } from '../features/blog/blogSlice';
import { fetchCampaigns } from '../features/donations/donationsSlice';
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
    useTheme,
    Tabs,
    Tab,
    LinearProgress,
    Avatar
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
    Forum,
    Person
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

    const [currentTab, setCurrentTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Participation dialogs state
    const [donationDialogOpen, setDonationDialogOpen] = useState(false);
    const [volunteerDialogOpen, setVolunteerDialogOpen] = useState(false);
    const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedItems(newExpanded);
    };

    useEffect(() => {
        dispatch(fetchPosts());
        dispatch(fetchCampaigns());
    }, [dispatch]);

    // Filter published blog posts and sort by date (latest first)
    const allPublishedStories = [...posts]
        .filter((post: any) => post.status === 'PUBLISHED')
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    // Filter active campaigns and sort by date
    const allActiveCampaigns = [...campaigns]
        .filter((campaign: any) => campaign.status === 'ACTIVE')
        .sort((a, b) => new Date(b.published_at || b.created_at || 0).getTime() - new Date(a.published_at || a.created_at || 0).getTime());

    // Extract categories
    const storyCategories = ['All', ...Array.from(new Set(allPublishedStories.map((p: any) => p.category_name || p.category?.name || 'Uncategorized')))];
    const campaignCategories = ['All', ...Array.from(new Set(allActiveCampaigns.map((c: any) => c.category?.replace('_', ' ') || 'Uncategorized')))];

    // Apply filters
    const filteredStories = allPublishedStories.filter((p: any) => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (p.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || (p.category?.name || 'Uncategorized') === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const filteredCampaigns = allActiveCampaigns.filter((c: any) => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (c.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || (c.category?.replace('_', ' ') || 'Uncategorized') === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Determine items for display based on tab
    const items = currentTab === 0 ? filteredStories : filteredCampaigns;
    const featuredItem = items.length > 0 ? items[0] : null;
    const remainingItems = items.length > 1 ? items.slice(1) : [];

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
        setSearchQuery('');
        setSelectedCategory('All');
    };

    const getAuthorName = (item: any) => {
        if (currentTab === 1) return 'Kindra CBO'; // Campaigns usually from org
        const author = item.author;
        if (author?.role === 'ADMIN' || author?.role === 'MANAGEMENT' || item.author_role === 'ADMIN' || item.author_role === 'MANAGEMENT') {
            return 'Management';
        }
        return item.author_name || (author ? `${author.first_name} ${author.last_name}` : 'Kindra CBO');
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
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
            {/* Header Section */}
            <Box sx={{ pt: 8, pb: 4, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Container maxWidth="lg">
                    <Typography variant="h1" sx={{ 
                        fontSize: { xs: '2rem', md: '2.5rem' }, 
                        fontWeight: 900, 
                        color: 'secondary.main', 
                        mb: 1,
                        letterSpacing: '-0.03em'
                    }}>
                        Stories & Campaigns
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: 'text.secondary', maxWidth: 600, mb: 4, fontWeight: 500 }}>
                        Impact stories and active campaigns.
                    </Typography>

                    {/* Filter Bar */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'center', justifyContent: 'space-between' }}>
                        <Tabs
                            value={currentTab}
                            onChange={handleTabChange}
                            sx={{
                                '& .MuiTabs-indicator': { bgcolor: 'secondary.main', height: 3 },
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    color: 'text.disabled',
                                    px: 0,
                                    mr: 3,
                                    minWidth: 0,
                                    '&.Mui-selected': { color: 'secondary.main' }
                                }
                            }}
                        >
                            <Tab label="Impact Stories" />
                            <Tab label="Active Campaigns" />
                        </Tabs>

                        <TextField
                            placeholder="Search..."
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ color: 'text.disabled' }} />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.03), border: 'none', width: { xs: '100%', md: 300 } }
                            }}
                            sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                        />
                    </Box>

                    <Box sx={{ mt: 4, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {(currentTab === 0 ? storyCategories : campaignCategories).map((category) => (
                            <Chip
                                key={category}
                                label={category}
                                onClick={() => setSelectedCategory(category)}
                                sx={{ 
                                    borderRadius: 1, 
                                    fontWeight: 700, 
                                    height: 32, 
                                    px: 0.5,
                                    fontSize: '0.85rem',
                                    bgcolor: selectedCategory === category ? 'secondary.main' : 'transparent',
                                    color: selectedCategory === category ? 'white' : 'text.primary',
                                    border: '1px solid',
                                    borderColor: selectedCategory === category ? 'secondary.main' : 'divider',
                                    '&:hover': {
                                        bgcolor: selectedCategory === category ? 'secondary.main' : alpha(theme.palette.secondary.main, 0.05),
                                    }
                                }}
                            />
                        ))}
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: 6 }}>
                <AnimatePresence mode="wait">
                    {items.length === 0 ? (
                        <Box key="empty" sx={{ textAlign: 'center', py: 12 }}>
                            {blogLoading || campaignsLoading ? (
                                <CircularProgress color="secondary" />
                            ) : (
                                <>
                                    <Article sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                    <Typography variant="h5" fontWeight="bold" color="text.secondary">
                                        No results found
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Try adjusting your search or filters.
                                    </Typography>
                                </>
                            )}
                        </Box>
                    ) : (
                        <motion.div
                            key={currentTab === 0 ? "stories" : "campaigns"}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            {/* Featured Section */}
                            {featuredItem && (
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        flexDirection: { xs: 'column', md: 'row' }, 
                                        gap: 6, 
                                        mb: 12, 
                                        '&:hover img': { transform: 'scale(1.02)' }
                                    }}
                                >
                                    <Box sx={{ flex: 1.5, overflow: 'hidden', borderRadius: 2 }}>
                                        <Box
                                            component="img"
                                            src={featuredItem.featured_image || `https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=2070`}
                                            alt={featuredItem.title}
                                            sx={{ 
                                                width: '100%', 
                                                height: { xs: 250, md: 350 }, 
                                                objectFit: 'cover',
                                                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <Typography variant="overline" sx={{ fontWeight: 800, color: 'secondary.main', mb: 2, letterSpacing: '0.1em' }}>
                                            {featuredItem.category_name || featuredItem.category?.name || (currentTab === 1 ? 'CAMPAIGN' : 'FEATURED')}
                                        </Typography>
                                        <Typography variant="h3" sx={{ 
                                            fontWeight: 800, 
                                            lineHeight: 1.2, 
                                            mb: 2, 
                                            fontSize: { xs: '1.75rem', md: '2.5rem' },
                                            letterSpacing: '-0.02em'
                                        }}>
                                            {featuredItem.title}
                                        </Typography>
                                        <Box sx={{ mb: 4 }}>
                                            {expandedItems.has(featuredItem.id) ? (
                                                <Box 
                                                    sx={{ 
                                                        fontSize: '1.15rem', 
                                                        lineHeight: 1.8, 
                                                        color: 'text.primary',
                                                        '& p': { mb: 3 },
                                                        '& blockquote': { borderLeft: '4px solid', borderColor: 'secondary.main', pl: 3, my: 4, fontStyle: 'italic', color: 'secondary.main' },
                                                        '& img': { maxWidth: '100%', borderRadius: 2, my: 4 }
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: featuredItem.content || featuredItem.description }} 
                                                />
                                            ) : (
                                                <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem', lineHeight: 1.8 }}>
                                                    {featuredItem.excerpt || (featuredItem.description ? featuredItem.description.substring(0, 180) + '...' : featuredItem.content?.substring(0, 180) + '...')}
                                                </Typography>
                                            )}
                                        </Box>

                                        {currentTab === 1 && (
                                            <Box sx={{ mb: 4 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                                    <Typography variant="h6" color="secondary.main" fontWeight="900">
                                                        {formatCurrency(featuredItem.raised_amount, featuredItem.currency)}
                                                    </Typography>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        {Math.round(featuredItem.progress_percentage || (featuredItem.raised_amount / featuredItem.target_amount * 100))}% Goal
                                                    </Typography>
                                                </Box>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={Math.min(featuredItem.progress_percentage || (featuredItem.raised_amount / featuredItem.target_amount * 100), 100)}
                                                    sx={{ height: 10, borderRadius: 5, bgcolor: alpha(theme.palette.secondary.main, 0.1), '& .MuiLinearProgress-bar': { bgcolor: 'secondary.main' } }}
                                                />
                                            </Box>
                                        )}

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                                            <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                                                <Person fontSize="small" />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
                                                    {getAuthorName(featuredItem)}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    {new Date(featuredItem.published_at || featuredItem.created_at || Date.now()).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {currentTab === 1 ? (
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Button 
                                                    variant="contained" 
                                                    color="secondary" 
                                                    size="medium"
                                                    onClick={() => { setSelectedCampaign(featuredItem); setDonationDialogOpen(true); }}
                                                    sx={{ px: 4, fontWeight: 900, borderRadius: 1 }}
                                                >
                                                    Donate Now
                                                </Button>
                                                <Button 
                                                    variant="outlined" 
                                                    color="secondary"
                                                    onClick={() => { setSelectedCampaign(featuredItem); setVolunteerDialogOpen(true); }}
                                                    sx={{ borderRadius: 1, border: '2px solid' }}
                                                >
                                                    <Handshake />
                                                </Button>
                                            </Box>
                                        ) : (
                                            <Button 
                                                variant="contained" 
                                                color="secondary" 
                                                size="medium" 
                                                endIcon={<ArrowForward sx={{ transform: expandedItems.has(featuredItem.id) ? 'rotate(-90deg)' : 'none', transition: '0.3s' }} />}
                                                onClick={() => toggleExpand(featuredItem.id)}
                                                sx={{ alignSelf: 'flex-start', px: 4, fontWeight: 900, borderRadius: 1 }}
                                            >
                                                {expandedItems.has(featuredItem.id) ? 'Read less' : 'Read more'}
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            )}

                            {/* 3-Column Grid Section */}
                            <Grid container spacing={4}>
                                {remainingItems.map((item: any, index: number) => {
                                    const progress = item.progress_percentage || ((item.raised_amount / item.target_amount) * 100);
                                    
                                    return (
                                        <Grid item xs={12} sm={6} md={4} key={item.id || index}>
                                            <Card 
                                                elevation={0}
                                                sx={{ 
                                                    height: '100%', 
                                                    display: 'flex', 
                                                    flexDirection: 'column', 
                                                    bgcolor: 'transparent',
                                                    '&:hover img': { transform: 'scale(1.05)' }
                                                }}
                                            >
                                                <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2, mb: 3 }}>
                                                    <CardMedia
                                                        component="img"
                                                        height="200"
                                                        image={item.featured_image || `https://source.unsplash.com/random/800x600?charity&sig=${index}`}
                                                        alt={item.title}
                                                        sx={{ transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
                                                    />
                                                    {currentTab === 1 && (
                                                        <Chip 
                                                            label={item.urgency} 
                                                            size="small" 
                                                            sx={{ 
                                                                position: 'absolute', 
                                                                top: 16, 
                                                                right: 16, 
                                                                fontWeight: 900, 
                                                                bgcolor: getUrgencyColor(item.urgency).bg,
                                                                color: getUrgencyColor(item.urgency).color,
                                                                backdropFilter: 'blur(4px)',
                                                                borderRadius: 1
                                                            }} 
                                                        />
                                                    )}
                                                </Box>
                                                <CardContent sx={{ p: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'secondary.main', mb: 1, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                        {item.category_name || item.category?.name || (currentTab === 1 ? item.category?.replace('_', ' ') : 'STORY')}
                                                    </Typography>
                                                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.3, letterSpacing: '-0.02em' }}>
                                                        {item.title}
                                                    </Typography>
                                                    <Box sx={{ mb: 3 }}>
                                                        {expandedItems.has(item.id) ? (
                                                            <Box 
                                                                sx={{ 
                                                                    fontSize: '1rem', 
                                                                    lineHeight: 1.7, 
                                                                    color: 'text.primary',
                                                                    '& p': { mb: 2 }
                                                                }}
                                                                dangerouslySetInnerHTML={{ __html: item.content || item.description }} 
                                                            />
                                                        ) : (
                                                            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                                                {item.excerpt || (item.description ? item.description.substring(0, 100) + '...' : item.content?.substring(0, 100) + '...')}
                                                            </Typography>
                                                        )}
                                                    </Box>

                                                    {currentTab === 1 && (
                                                        <Box sx={{ mb: 3 }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                                <Typography variant="caption" fontWeight="900" color="secondary.main">
                                                                    {formatCurrency(item.raised_amount, item.currency)}
                                                                </Typography>
                                                                <Typography variant="caption" fontWeight="bold">
                                                                    {Math.round(progress)}%
                                                                </Typography>
                                                            </Box>
                                                            <LinearProgress 
                                                                variant="determinate" 
                                                                value={Math.min(progress, 100)} 
                                                                sx={{ height: 6, borderRadius: 3, bgcolor: alpha(theme.palette.secondary.main, 0.1), '& .MuiLinearProgress-bar': { bgcolor: 'secondary.main' } }}
                                                            />
                                                        </Box>
                                                    )}

                                                    <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                                            {getAuthorName(item)}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>•</Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                            {new Date(item.published_at || item.created_at || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                                                        <Button 
                                                            variant={expandedItems.has(item.id) ? "outlined" : "contained"}
                                                            color="secondary" 
                                                            fullWidth
                                                            onClick={() => toggleExpand(item.id)}
                                                            sx={{ fontWeight: 800, borderRadius: 1 }}
                                                        >
                                                            {expandedItems.has(item.id) ? 'Read less' : 'Read more'}
                                                        </Button>
                                                        {currentTab === 1 && (
                                                            <>
                                                                <Button 
                                                                    variant="contained"
                                                                    color="secondary"
                                                                    fullWidth
                                                                    onClick={() => { setSelectedCampaign(item); setDonationDialogOpen(true); }}
                                                                    sx={{ fontWeight: 800, borderRadius: 1 }}
                                                                >
                                                                    Donate
                                                                </Button>
                                                                <Button 
                                                                    variant="outlined" 
                                                                    color="secondary"
                                                                    onClick={() => { setSelectedCampaign(item); setVolunteerDialogOpen(true); }}
                                                                    sx={{ minWidth: 48, borderRadius: 1 }}
                                                                >
                                                                    <Handshake fontSize="small" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Box sx={{ mt: 12, pt: 8, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>
                        Want to share your story or start a campaign?
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        size="large"
                        onClick={() => navigate('/dashboard')}
                        sx={{ px: 6, py: 2, fontWeight: 900, borderRadius: 1 }}
                    >
                        Visit Dashboard
                    </Button>
                </Box>
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
