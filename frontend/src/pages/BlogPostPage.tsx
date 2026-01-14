/**
 * Public Blog Post Page
 * Displays a single blog post content
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Container,
    Typography,
    Chip,
    Avatar,
    Button,
    Skeleton,
    Divider,
    Paper,
    useTheme,
    alpha
} from '@mui/material';
import { ArrowBack, AccessTime, Person, Tag, CalendarToday, Share } from '@mui/icons-material';
import { AppDispatch, RootState } from '../store';
import { fetchPostBySlug } from '../features/blog/blogSlice';
import { motion } from 'framer-motion';

export default function BlogPostPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const theme = useTheme();

    // Access Redux state
    const { currentPost, isLoading, error } = useSelector((state: RootState) => state.blog);

    useEffect(() => {
        if (slug) {
            dispatch(fetchPostBySlug(slug));
        }
    }, [dispatch, slug]);

    if (isLoading) {
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

    if (error || !currentPost) {
        return (
            <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
                <Paper sx={{ p: 4, borderRadius: 2, border: '1px dashed', borderColor: alpha(theme.palette.divider, 0.1), boxShadow: theme.shadows[1], bgcolor: 'background.paper' }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom color="error">
                        Story Not Found
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                        The story you are looking for might have been moved or deleted.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/stories')}
                        startIcon={<ArrowBack />}
                        sx={{ mt: 2, borderRadius: 3 }}
                    >
                        Back to Stories
                    </Button>
                </Paper>
            </Container>
        );
    }

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
                height: { xs: 300, md: 500 },
                width: '100%',
                bgcolor: 'grey.900',
                color: 'white',
                overflow: 'hidden'
            }}>
                <Box
                    component="img"
                    src={currentPost.featuredImage || "https://source.unsplash.com/random/1600x900?charity"}
                    alt={currentPost.title}
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.6
                    }}
                />
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.1) 100%)',
                    display: 'flex',
                    alignItems: 'flex-end'
                }}>
                    <Container maxWidth="md" sx={{ pb: 6 }}>
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={() => navigate('/stories')}
                            sx={{ color: 'white', mb: 3, backdropFilter: 'blur(4px)', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                        >
                            Back to Stories
                        </Button>
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                            <Chip
                                label={currentPost.category || 'Update'}
                                sx={{ bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 'bold', mb: 2 }}
                            />
                            <Typography variant="h2" fontWeight="900" sx={{
                                fontSize: { xs: '2rem', md: '3.5rem' },
                                lineHeight: 1.1,
                                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                                mb: 2
                            }}>
                                {currentPost.title}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                        {currentPost.author?.[0] || <Person />}
                                    </Avatar>
                                    <Typography variant="subtitle1" fontWeight="medium">
                                        {currentPost.author || 'Anonymous'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.8 }}>
                                    <CalendarToday sx={{ fontSize: 18 }} />
                                    <Typography variant="body2">
                                        {new Date(currentPost.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.8 }}>
                                    <AccessTime sx={{ fontSize: 18 }} />
                                    <Typography variant="body2">5 min read</Typography>
                                </Box>
                            </Box>
                        </motion.div>
                    </Container>
                </Box>
            </Box>

            {/* Content Section */}
            <Container maxWidth="md" sx={{ mt: -6, position: 'relative', zIndex: 2 }}>
                <Paper component={motion.div} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} elevation={0} sx={{
                    p: { xs: 2.5, md: 5 },
                    borderRadius: 2,
                    boxShadow: theme.shadows[4],
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.1),
                    bgcolor: 'background.paper',
                    mb: 4
                }}>
                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: '1.25rem',
                            lineHeight: 1.8,
                            color: 'text.primary',
                            fontFamily: 'Georgia, "Times New Roman", Times, serif', // More editorial feel for content
                            whiteSpace: 'pre-wrap', // Preserve line breaks
                            '& p': { mb: 3 }
                        }}
                    >
                        {currentPost.content}
                    </Typography>

                    <Divider sx={{ my: 6 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {['Community', 'Impact'].map(tag => (
                                <Chip key={tag} icon={<Tag sx={{ fontSize: 16 }} />} label={tag} variant="outlined" size="small" />
                            ))}
                        </Box>
                        <Button startIcon={<Share />} color="inherit">
                            Share Story
                        </Button>
                    </Box>
                </Paper>

                {/* Navigation / Next Steps */}
                <Box sx={{ textAlign: 'center', mt: 8 }}>
                    <Typography variant="h6" gutterBottom color="text.secondary">
                        Inspired by this story?
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                        <Button variant="contained" size="large" sx={{ borderRadius: 3, px: 4 }}>
                            Donate Now
                        </Button>
                        <Button variant="outlined" size="large" onClick={() => navigate('/stories')} sx={{ borderRadius: 3, px: 4 }}>
                            Read More Stories
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
