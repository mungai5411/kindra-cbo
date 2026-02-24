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
    IconButton
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
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    elevation={24}
                    sx={{
                        p: 4,
                        borderRadius: 5,
                        backdropFilter: 'blur(10px)',
                        backgroundColor: alpha(theme.palette.background.paper, 0.95),
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.1),
                        boxShadow: theme.shadows[10]
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <LockReset sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Reset Password
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Create a strong new password for your account
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
                            label="New Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            required
                            sx={{ mb: 3 }}
                            InputProps={{
                                sx: { borderRadius: 3 },
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
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
                            sx={{ mb: 3 }}
                            InputProps={{
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
                                borderRadius: 5,
                                fontWeight: 'bold',
                                textTransform: 'none',
                                fontSize: '1.1rem'
                            }}
                        >
                            {isLoading ? 'Resetting...' : 'Set New Password'}
                        </Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
}
