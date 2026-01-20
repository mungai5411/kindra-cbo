import { useState } from 'react';
import { Box, IconButton, Typography, Button, alpha, useTheme } from '@mui/material';
import { Favorite, FavoriteBorder, Share, Forum } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { likePost } from '../../features/blog/blogSlice';
import { motion, AnimatePresence } from 'framer-motion';

interface PostInteractionsProps {
    slug: string;
    likesCount: number;
    hasLiked: boolean;
    commentCount: number;
    onCommentClick?: () => void;
}

export const PostInteractions = ({ slug, likesCount, hasLiked, commentCount, onCommentClick }: PostInteractionsProps) => {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const [isLiking, setIsLiking] = useState(false);

    const handleLike = async () => {
        if (isLiking) return;

        setIsLiking(true);
        await dispatch(likePost(slug));

        // Cooldown to prevent spam clicks in UI
        setTimeout(() => setIsLiking(false), 1000);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: document.title,
                url: window.location.href,
            }).catch(() => { });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            // You might want to show a toast here
        }
    };

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 3 },
            py: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            mb: 4
        }}>
            {/* Like Button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton
                    onClick={handleLike}
                    disabled={isLiking}
                    sx={{
                        color: hasLiked ? theme.palette.error.main : 'inherit',
                        '&:hover': {
                            bgcolor: alpha(theme.palette.error.main, 0.05)
                        },
                        transition: 'all 0.2s ease'
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={hasLiked ? 'liked' : 'unliked'}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {hasLiked ? <Favorite /> : <FavoriteBorder />}
                        </motion.div>
                    </AnimatePresence>
                </IconButton>
                <Typography variant="body2" fontWeight="700" sx={{ minWidth: 20 }}>
                    {likesCount}
                </Typography>
            </Box>

            {/* Comment Count */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton onClick={onCommentClick} sx={{ color: 'inherit' }}>
                    <Forum />
                </IconButton>
                <Typography variant="body2" fontWeight="700">
                    {commentCount}
                </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Share Button */}
            <Button
                variant="text"
                startIcon={<Share />}
                onClick={handleShare}
                sx={{
                    borderRadius: 2,
                    color: 'text.secondary',
                    fontWeight: 600,
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                }}
            >
                Share Story
            </Button>
        </Box>
    );
};
