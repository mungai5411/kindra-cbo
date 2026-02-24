/**
 * Forgot Password Page
 * Allows users to request a password reset link
 */

import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Container,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Paper,
    Link,
    alpha,
    useTheme,
    InputAdornment,
    Grid
} from '@mui/material';
import { Key, ArrowBack, Email } from '@mui/icons-material';
import { motion } from 'framer-motion';
import apiClient from '../api/client';

export default function ForgotPasswordPage() {
    const theme = useTheme();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await apiClient.post('/auth/password-reset/', { email });
            setMessage(response.data.message || 'If an account exists with this email, a reset link has been sent.');
            // Clear email field on success
            setEmail('');
        } catch (err: any) {
            setError(err.response?.data?.error || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#050505' }}>
            <Grid container>
                {/* Left Column - Visual/Mission */}
                <Grid item xs={12} md={7} sx={{
                    display: { xs: 'none', md: 'flex' },
                    position: 'relative',
                    overflow: 'hidden',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    p: 8,
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'url("https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=2070")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'brightness(0.4) saturate(1.2)',
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(45deg, ${alpha('#050505', 0.9)} 0%, ${alpha('#050505', 0.2)} 100%)`,
                    }
                }}>
                    <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Typography variant="h1" sx={{ color: 'white', mb: 3, fontSize: '3.5rem', fontWeight: 900 }}>
                                Build on <span style={{ color: theme.palette.primary.main }}>Purpose</span>.
                            </Typography>
                            <Typography variant="h3" sx={{ color: alpha('#fff', 0.7), mb: 4, fontWeight: 400, lineHeight: 1.4 }}>
                                Kindra CBO empowers community resilience and optimizes family support at scale.
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 4, mt: 6 }}>
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', mb: 1 }}>94%</Typography>
                                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.5) }}>Resource Optimization</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', mb: 1 }}>24/7</Typography>
                                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.5) }}>Crisis Monitoring</Typography>
                                </Box>
                            </Box>
                        </motion.div>
                    </Box>
                </Grid>

                {/* Right Column - Form */}
                <Grid item xs={12} md={5} sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#050505',
                    borderLeft: '1px solid',
                    borderColor: alpha('#fff', 0.05)
                }}>
                    <Container maxWidth="xs">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Box sx={{ mb: 6 }}>
                                <Link component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', textDecoration: 'none', mb: 6, '&:hover': { color: 'white' } }}>
                                    <ArrowBack fontSize="small" /> Home
                                </Link>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                                        <Key />
                                    </Box>
                                    <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                                        Reset your password
                                    </Typography>
                                </Box>
                                <Typography variant="body1" sx={{ color: alpha('#fff', 0.6) }}>
                                    Enter your email address and we will send you a password reset link.
                                </Typography>
                            </Box>

                            {message && (
                                <Alert severity="success" sx={{ mb: 4, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.light' }}>
                                    {message}
                                </Alert>
                            )}

                            {error && (
                                <Alert severity="error" sx={{ mb: 4, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.light' }}>
                                    {error}
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    label="Enter your email"
                                    type="email"
                                    variant="outlined"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    required
                                    sx={{
                                        mb: 4,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            bgcolor: alpha('#fff', 0.03),
                                            color: 'white',
                                            '& fieldset': { borderColor: alpha('#fff', 0.1) },
                                            '&:hover fieldset': { borderColor: alpha('#fff', 0.2) },
                                            '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                                        },
                                        '& .MuiInputLabel-root': { color: alpha('#fff', 0.4) },
                                        '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.primary.main },
                                    }}
                                />

                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={isLoading}
                                    sx={{
                                        py: 1.8,
                                        borderRadius: 2,
                                        fontWeight: 'bold',
                                        textTransform: 'none',
                                        fontSize: '0.95rem',
                                        bgcolor: 'primary.main',
                                        '&:hover': { bgcolor: 'primary.dark' },
                                        color: 'white'
                                    }}
                                >
                                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Send password reset email'}
                                </Button>
                            </form>
                        </motion.div>
                    </Container>
                </Grid>
            </Grid>
        </Box>
    );
}
