import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    Divider,
    Paper,
    Alert,
    CircularProgress,
    alpha,
    useTheme
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchComments, submitComment } from '../../features/blog/blogSlice';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentSectionProps {
    postSlug: string;
    postId: string;
}

export const CommentSection = ({ postSlug, postId }: CommentSectionProps) => {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { comments } = useSelector((state: RootState) => state.blog);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        content: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (postSlug) {
            dispatch(fetchComments(postSlug));
        }
    }, [dispatch, postSlug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.content) return;

        setIsSubmitting(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            await dispatch(submitComment({
                post: postId,
                ...formData
            })).unwrap();

            setSuccessMsg('Thank you! Your comment is awaiting moderation.');
            setFormData({ name: '', email: '', content: '' });

            // Clear success message after 5 seconds
            setTimeout(() => setSuccessMsg(null), 5000);
        } catch (err: any) {
            setErrorMsg(err || 'Failed to post comment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box sx={{ mt: 6 }}>
            <Typography variant="h5" fontWeight="900" sx={{ mb: 4, letterSpacing: -0.5 }}>
                Discussion ({comments.length})
            </Typography>

            {/* Comment Form */}
            <Paper elevation={0} sx={{
                p: { xs: 2, sm: 4 },
                borderRadius: 4,
                bgcolor: alpha(theme.palette.background.default, 0.5),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                mb: 6
            }}>
                <Typography variant="subtitle1" fontWeight="700" gutterBottom>
                    Leave a response
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
                        <TextField
                            fullWidth
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            variant="outlined"
                            size="small"
                        />
                        <TextField
                            fullWidth
                            placeholder="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            variant="outlined"
                            size="small"
                        />
                    </Box>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="What are your thoughts?"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        sx={{ mb: 2 }}
                    />

                    <AnimatePresence>
                        {successMsg && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{successMsg}</Alert>
                            </motion.div>
                        )}
                        {errorMsg && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{errorMsg}</Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : <Send />}
                        sx={{ borderRadius: 2, px: 3, fontWeight: 'bold' }}
                    >
                        {isSubmitting ? 'Posting...' : 'Post Comment'}
                    </Button>
                </form>
            </Paper>

            {/* Comment List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {comments.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4, opacity: 0.5 }}>
                        <Typography variant="body2">No comments yet. Be the first to start the conversation!</Typography>
                    </Box>
                ) : (
                    comments.map((comment, index) => (
                        <Box key={comment.id} component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 'bold' }}>
                                    {comment.name[0].toUpperCase()}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                        <Typography variant="subtitle2" fontWeight="700">
                                            {comment.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
                                        {comment.content}
                                    </Typography>
                                </Box>
                            </Box>
                            {index < comments.length - 1 && <Divider sx={{ mt: 3, opacity: 0.5 }} />}
                        </Box>
                    ))
                )}
            </Box>
        </Box>
    );
};
