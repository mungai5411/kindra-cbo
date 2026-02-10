import React, { useState } from 'react';
import { Box, Alert, Typography } from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import apiClient, { endpoints } from '../../api/client';

interface GoogleSignInButtonProps {
    onSuccess: (data: any) => void;
    onError?: (error: string) => void;
    selectedRole?: string | null;
    buttonText?: string;
    width?: string;
}

export const GoogleSignInButton = ({
    onSuccess,
    onError,
    selectedRole = null,
    buttonText = "continue_with",
    width = "320"
}: GoogleSignInButtonProps) => {
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setIsProcessing(true);
        setError('');

        try {
            const payload: any = {
                credential: credentialResponse.credential
            };

            // Only send role if it's explicitly provided (for Signup flow)
            if (selectedRole) {
                payload.role = selectedRole;
            }

            const response = await apiClient.post(endpoints.auth.googleLogin, payload);

            const { access, refresh, user } = response.data;
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);
            localStorage.setItem('user', JSON.stringify(user));

            onSuccess(response.data);
        } catch (err: any) {
            console.error('Google Auth Error:', err);
            const errorMessage = err.response?.data?.error || 'Google sign-in failed';
            setError(errorMessage);
            if (onError) onError(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Box sx={{ mb: 2, width: '100%' }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}
            <Box sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
                p: 2,
                borderRadius: '12px',
                bgcolor: '#fcfcfc',
                border: '1px solid #f0f0f0',
                opacity: isProcessing ? 0.7 : 1,
                pointerEvents: isProcessing ? 'none' : 'auto',
                transition: 'all 0.3s ease'
            }}>
                <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
                    Secure Sign In
                </Typography>
                <Box sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    minHeight: '40px',
                    '& > div': { width: '100% !important', display: 'flex', justifyContent: 'center' },
                }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google sign-in failed. Please try again.')}
                        theme="outline"
                        size="large"
                        shape="rectangular"
                        text={buttonText as any}
                        width={width}
                    />
                </Box>
            </Box>
        </Box>
    );
};
