/**
 * Public Blog Post Page
 * Displays a single blog post content
 */

import { useEffect, useRef } from 'react';
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
import { ArrowBack, AccessTime, Person, CalendarToday } from '@mui/icons-material';
import { AppDispatch, RootState } from '../store';
import { fetchPostBySlug, clearCurrentPost } from '../features/blog/blogSlice';
import { motion } from 'framer-motion';
import { PostInteractions } from '../components/blog/PostInteractions';
import { CommentSection } from '../components/blog/CommentSection';

export default function BlogPostPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const theme = useTheme();
    const commentSectionRef = useRef<HTMLDivElement>(null);

    // Access Redux state
    const { currentPost, isLoading, error } = useSelector((state: RootState) => state.blog);

    useEffect(() => {
        if (slug) {
            dispatch(fetchPostBySlug(slug));
        }
        return () => {
            dispatch(clearCurrentPost());
        };
    }, [dispatch, slug]);

    const scrollToComments = () => {
        commentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

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
                    src={currentPost.featured_image || "https://source.unsplash.com/random/1600x900?charity"}
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
                                label={currentPost.category_name || 'Update'}
                                sx={{ bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 'bold', mb: 2 }}
                            />
                            <Typography variant="h2" fontWeight="900" sx={{
                                fontSize: { xs: '2.5rem', md: '3.5rem' },
                                lineHeight: 1.1,
                                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                                mb: 2,
                                letterSpacing: -1
                            }}>
                                {currentPost.title}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '1rem' }}>
                                        {currentPost.author_name?.[0] || <Person />}
                                    </Avatar>
                                    <Typography variant="subtitle1" fontWeight="medium">
                                        {currentPost.author_name || 'Anonymous'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.8 }}>
                                    <CalendarToday sx={{ fontSize: 18 }} />
                                    <Typography variant="body2">
                                        {new Date(currentPost.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
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
                    p: { xs: 2.5, md: 6 },
                    borderRadius: 4,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.1),
                    bgcolor: 'background.paper',
                    mb: 4
                }}>
                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: '1.2rem',
                            lineHeight: 1.8,
                            color: 'text.primary',
                            fontFamily: '"Outfit", sans-serif',
                            whiteSpace: 'pre-wrap',
                            '& p': { mb: 3 }
                        }}
                    >
                        {currentPost.content}
                    </Typography>

                    <Divider sx={{ my: 4 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {currentPost.tags?.map((tag: any) => (
                                <Chip key={tag.id} label={tag.name} variant="outlined" size="small" sx={{ borderRadius: 1 }} />
                            )) || (
                                    <>
                                        <Chip label="Community" variant="outlined" size="small" sx={{ borderRadius: 1 }} />
                                        <Chip label="Impact" variant="outlined" size="small" sx={{ borderRadius: 1 }} />
                                    </>
                                )}
                        </Box>
                    </Box>

                    {/* Likes & Share Interactions */}
                    <PostInteractions
                        slug={currentPost.slug}
                        likesCount={currentPost.likes_count || 0}
                        hasLiked={!!currentPost.has_liked}
                        commentCount={currentPost.comment_count || 0}
                        onCommentClick={scrollToComments}
                    />

                    {/* Discussion Section */}
                    <Box ref={commentSectionRef}>
                        <CommentSection postSlug={currentPost.slug} postId={currentPost.id} />
                    </Box>
                </Paper>

                {/* Navigation / Next Steps */}
                <Box sx={{ textAlign: 'center', mt: 8 }}>
                    <Typography variant="h6" gutterBottom color="text.secondary">
                        Inspired by this story?
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                        <Button variant="contained" size="large" sx={{ borderRadius: 3, px: 4, fontWeight: 'bold' }}>
                            Donate Now
                        </Button>
                        <Button variant="outlined" size="large" onClick={() => navigate('/stories')} sx={{ borderRadius: 3, px: 4, fontWeight: 'bold' }}>
                            Read More Stories
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
