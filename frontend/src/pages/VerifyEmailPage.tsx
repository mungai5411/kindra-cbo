/**
 * Verify Email Page
 * Handles email verification via token from URL
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    Box,
    Container,
    Typography,
    CircularProgress,
    Paper,
    Button,
    alpha,
    useTheme
} from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';
import { motion } from 'framer-motion';
import apiClient from '../api/client';
import { fetchProfile } from '../features/auth/authSlice';
import type { AppDispatch } from '../store';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const theme = useTheme();

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await apiClient.post('/auth/verify-email/', { token });
                setStatus('success');
                setMessage('Email verified successfully! You can now access all features.');

                // If tokens returned, update session
                if (response.data.tokens) {
                    localStorage.setItem('accessToken', response.data.tokens.access);
                    localStorage.setItem('refreshToken', response.data.tokens.refresh);
                    // Update Redux state
                    dispatch(fetchProfile());
                }
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.error || 'Verification failed. The link may be expired or invalid.');
            }
        };

        verifyEmail();
    }, [token, dispatch]);

    const handleContinue = () => {
        navigate('/dashboard');
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                py: 4
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    component={motion.div}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    elevation={24}
                    sx={{
                        p: 5,
                        borderRadius: 5,
                        textAlign: 'center',
                        backdropFilter: 'blur(10px)',
                        backgroundColor: alpha(theme.palette.background.paper, 0.95),
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.1),
                    }}
                >
                    <Box sx={{ mb: 3 }}>
                        {status === 'loading' && (
                            <CircularProgress size={60} thickness={4} />
                        )}
                        {status === 'success' && (
                            <CheckCircle sx={{ fontSize: 80, color: 'success.main' }} />
                        )}
                        {status === 'error' && (
                            <Error sx={{ fontSize: 80, color: 'error.main' }} />
                        )}
                    </Box>

                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {status === 'loading' ? 'Verifying...' :
                            status === 'success' ? 'Email Verified!' : 'Verification Failed'}
                    </Typography>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
                        {message}
                    </Typography>

                    {status !== 'loading' && (
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleContinue}
                            sx={{
                                px: 4,
                                py: 1.5,
                                borderRadius: 5,
                                fontWeight: 'bold',
                                textTransform: 'none',
                                fontSize: '1.1rem'
                            }}
                        >
                            {status === 'success' ? 'Continue to Dashboard' : 'Back to Home'}
                        </Button>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}
