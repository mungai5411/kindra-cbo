/**
 * Public Blog Post Page
 * Redesigned to match the premium editorial style and system color psychology.
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
    Grid,
    useTheme,
    alpha
} from '@mui/material';
import { ArrowBack, AccessTime, Person, CalendarToday, Share } from '@mui/icons-material';
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

    const getAuthorName = (post: any) => {
        const author = post.author;
        if (author?.role === 'ADMIN' || author?.role === 'MANAGEMENT' || post.author_role === 'ADMIN' || post.author_role === 'MANAGEMENT') {
            return 'Management';
        }
        return post.author_name || (author ? `${author.first_name} ${author.last_name}` : 'Kindra CBO');
    };

    if (isLoading) {
        return (
            <Container maxWidth={false} sx={{ px: { xs: 2, md: 8, lg: 10 }, py: 12 }}>
                <Skeleton variant="text" height={80} width="60%" sx={{ mb: 2 }} />
                <Skeleton variant="text" height={30} width="40%" sx={{ mb: 6 }} />
                <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2, mb: 6 }} />
                <Skeleton variant="text" height={30} width="100%" sx={{ mb: 1 }} />
                <Skeleton variant="text" height={30} width="100%" sx={{ mb: 1 }} />
                <Skeleton variant="text" height={30} width="80%" />
            </Container>
        );
    }

    if (error || !currentPost) {
        return (
            <Container maxWidth={false} sx={{ px: { xs: 2, md: 8, lg: 10 }, py: 12, textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, color: 'secondary.main' }}>
                    Story Not Found
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                    The story you are looking for might have been moved or deleted.
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

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 12 }}
        >
            {/* Minimalist Editorial Header */}
            <Box sx={{ pt: 10, pb: 8, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Container maxWidth={false} sx={{ px: { xs: 2, md: 8, lg: 10 } }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/stories')}
                        sx={{ color: 'text.secondary', mb: 6, fontWeight: 800, '&:hover': { color: 'secondary.main', bgcolor: 'transparent' } }}
                    >
                        Back to Stories
                    </Button>

                    <Typography variant="overline" sx={{ fontWeight: 800, color: 'secondary.main', mb: 2, display: 'block', letterSpacing: '0.1em' }}>
                        {currentPost.category_name || currentPost.category?.name || 'UPDATE'}
                    </Typography>

                    <Typography variant="h1" sx={{ 
                        fontSize: { xs: '2.5rem', md: '4.5rem' }, 
                        fontWeight: 900, 
                        color: 'text.primary', 
                        lineHeight: 1.1,
                        mb: 4,
                        letterSpacing: '-0.04em'
                    }}>
                        {currentPost.title}
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
                                <Person />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1 }}>
                                    {getAuthorName(currentPost)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Author
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                            <CalendarToday sx={{ fontSize: 20 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {new Date(currentPost.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                            <AccessTime sx={{ fontSize: 20 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                5 min read
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
                            Share Story
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Featured Image Section */}
            <Container maxWidth={false} sx={{ px: { xs: 2, md: 8, lg: 10 }, mt: 8, mb: 10 }}>
                <Box sx={{ overflow: 'hidden', borderRadius: 2 }}>
                    <Box
                        component="img"
                        src={currentPost.featured_image || "https://source.unsplash.com/random/1600x900?charity"}
                        alt={currentPost.title}
                        sx={{ 
                            width: '100%', 
                            maxHeight: 700, 
                            objectFit: 'cover',
                            display: 'block'
                        }}
                    />
                </Box>
            </Container>

            {/* Editorial Content Section */}
            <Container maxWidth={false} sx={{ px: { xs: 2, md: 8, lg: 10 } }}>
                <Box
                    sx={{
                        fontSize: '1.25rem',
                        lineHeight: 1.8,
                        color: 'text.primary',
                        fontFamily: '"Outfit", sans-serif',
                        '& p': { mb: 4 },
                        '& h2': { fontSize: '2rem', fontWeight: 800, mt: 6, mb: 3, letterSpacing: '-0.02em' },
                        '& h3': { fontSize: '1.5rem', fontWeight: 800, mt: 5, mb: 2, letterSpacing: '-0.01em' },
                        '& img': { maxWidth: '100%', borderRadius: 2, my: 6, display: 'block', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' },
                        '& blockquote': { 
                            borderLeft: '4px solid', 
                            borderColor: 'secondary.main', 
                            pl: 4, 
                            my: 6,
                            fontStyle: 'italic', 
                            color: 'secondary.main', 
                            fontSize: '1.5rem',
                            lineHeight: 1.5,
                            fontWeight: 500,
                            bgcolor: alpha(theme.palette.secondary.main, 0.03), 
                            py: 4, 
                            borderRadius: '0 8px 8px 0' 
                        }
                    }}
                    dangerouslySetInnerHTML={{ __html: currentPost.content }}
                />

                {/* Media Gallery */}
                {currentPost.gallery_images && currentPost.gallery_images.length > 0 && (
                    <Box sx={{ mt: 10, mb: 6 }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, mb: 4, letterSpacing: '-0.02em' }}>
                            Captured Moments
                        </Typography>
                        <Grid container spacing={3}>
                            {currentPost.gallery_images.map((img: any, index: number) => (
                                <Grid item xs={12} sm={index % 3 === 0 ? 12 : 6} key={img.id}>
                                    <Box
                                        component="img"
                                        src={img.file}
                                        alt={img.alt_text || 'Gallery Media'}
                                        sx={{
                                            width: '100%',
                                            height: index % 3 === 0 ? 500 : 350,
                                            objectFit: 'cover',
                                            borderRadius: 2,
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                            transition: 'transform 0.4s ease',
                                            '&:hover': { transform: 'scale(1.01)' }
                                        }}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                <Divider sx={{ my: 8 }} />

                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 6, gap: 3 }}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        {currentPost.tags?.map((tag: any) => (
                            <Chip 
                                key={tag.id} 
                                label={`#${tag.name}`} 
                                variant="outlined" 
                                sx={{ 
                                    borderRadius: 1, 
                                    fontWeight: 700,
                                    borderColor: 'divider',
                                    '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.05), borderColor: 'secondary.main' }
                                }} 
                            />
                        ))}
                    </Box>

                    {/* Likes & Share Interactions */}
                    <PostInteractions
                        slug={currentPost.slug}
                        likesCount={currentPost.likes_count || 0}
                        hasLiked={!!currentPost.has_liked}
                        commentCount={currentPost.comment_count || 0}
                        onCommentClick={scrollToComments}
                    />
                </Box>

                {/* Discussion Section */}
                <Box ref={commentSectionRef} sx={{ mt: 8 }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, mb: 4, letterSpacing: '-0.02em' }}>
                        Discussion
                    </Typography>
                    <CommentSection postSlug={currentPost.slug} postId={currentPost.id} />
                </Box>

                {/* Navigation / Footer CTA */}
                <Box sx={{ 
                    mt: 12, 
                    p: 6, 
                    borderRadius: 2, 
                    bgcolor: 'secondary.main', 
                    color: 'white',
                    textAlign: 'center'
                }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
                        Impact happens with you.
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, mb: 4, maxWidth: 500, mx: 'auto' }}>
                        Your support fuels stories like this one. Join us in making a tangible difference today.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button 
                            variant="contained" 
                            size="large" 
                            sx={{ 
                                bgcolor: 'white', 
                                color: 'secondary.main', 
                                fontWeight: 900, 
                                borderRadius: 1,
                                px: 6,
                                '&:hover': { bgcolor: alpha('#fff', 0.9) }
                            }}
                        >
                            Donate Now
                        </Button>
                        <Button 
                            variant="outlined" 
                            size="large" 
                            onClick={() => navigate('/stories')} 
                            sx={{ 
                                color: 'white', 
                                borderColor: 'white', 
                                border: '2px solid',
                                fontWeight: 900, 
                                borderRadius: 1,
                                px: 4,
                                '&:hover': { borderColor: 'white', bgcolor: alpha('#fff', 0.1) }
                            }}
                        >
                            Explore More
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
