/**
 * Reset Password Page
 * Allows users to set a new password using the token from email
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box,
    Container,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Paper,
    alpha,
    useTheme,
    InputAdornment,
    IconButton,
    Grid
} from '@mui/material';
import { Visibility, VisibilityOff, LockReset } from '@mui/icons-material';
import { motion } from 'framer-motion';
import apiClient from '../api/client';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const theme = useTheme();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            await apiClient.post('/auth/password-reset-confirm/', {
                token,
                new_password: password,
                new_password_confirm: confirmPassword
            });
            setMessage('Password reset successfully! Redirecting to login...');

            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to reset password. The link may be expired.');
            if (err.response?.data?.new_password) {
                setError(err.response.data.new_password[0]);
            }
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
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                                        <LockReset />
                                    </Box>
                                    <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                                        Reset your password
                                    </Typography>
                                </Box>
                                <Typography variant="body1" sx={{ color: alpha('#fff', 0.6) }}>
                                    Create a strong new password for your account
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
                                    label="New Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                    sx={{
                                        mb: 3,
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
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    sx={{ color: alpha('#fff', 0.4) }}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label="Confirm New Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Set New Password'}
                                </Button>
                            </form>
                        </motion.div>
                    </Container>
                </Grid>
            </Grid>
        </Box>
    );
}
