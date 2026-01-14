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
    InputAdornment
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
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                py: 4
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    elevation={24}
                    sx={{
                        p: 4,
                        borderRadius: 2,
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.1),
                        boxShadow: theme.shadows[10]
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            bgcolor: alpha('#667eea', 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2
                        }}>
                            <Key sx={{ fontSize: 40, color: 'primary.main' }} />
                        </Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Forgot Password?
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            No worries! Enter your email and we'll send you reset instructions.
                        </Typography>
                    </Box>

                    {message && (
                        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                            {message}
                        </Alert>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            required
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email color="action" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 3 }
                            }}
                        />

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                            sx={{
                                py: 1.5,
                                borderRadius: 3,
                                fontWeight: 'bold',
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                mb: 3
                            }}
                        >
                            {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                        </Button>
                    </form>

                    <Box sx={{ textAlign: 'center' }}>
                        <Link
                            component={RouterLink}
                            to="/login"
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 1,
                                fontWeight: 600,
                                color: 'text.secondary',
                                textDecoration: 'none',
                                '&:hover': { color: 'primary.main' }
                            }}
                        >
                            <ArrowBack fontSize="small" /> Back to Login
                        </Link>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
