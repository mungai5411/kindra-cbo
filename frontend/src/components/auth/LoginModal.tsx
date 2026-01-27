import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../features/auth/authSlice';
import { AppDispatch, RootState } from '../../store';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
    Link,
    Dialog,
    DialogContent,
    useTheme,
    alpha,
    useMediaQuery,
    Grid,
    Paper
} from '@mui/material';
import { Visibility, VisibilityOff, Close, Groups, Favorite, Business } from '@mui/icons-material';
import DOMPurify from 'isomorphic-dompurify';
import { useAuthModal } from '../../contexts/AuthModalContext';
import { GoogleLogin } from '@react-oauth/google';
import apiClient, { endpoints } from '../../api/client';

const ROLES = [
    { value: 'DONOR', label: 'Donor', icon: <Favorite />, description: 'I want to donate and support causes' },
    { value: 'VOLUNTEER', label: 'Volunteer', icon: <Groups />, description: 'I want to offer my time and skills' },
    { value: 'SHELTER_PARTNER', label: 'Shelter Home', icon: <Business />, description: 'I represent a partner organization' },
];

// Google Sign-In Component
const GoogleSignInButton = ({ onSuccess, selectedRole }: { onSuccess: (data: any) => void, selectedRole: string }) => {
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setIsProcessing(true);
        setError('');

        try {
            const response = await apiClient.post(endpoints.auth.googleLogin, {
                credential: credentialResponse.credential,
                role: selectedRole
            });

            if (response.data.is_new_user) {
                const { access, refresh, user } = response.data;
                localStorage.setItem('accessToken', access);
                localStorage.setItem('refreshToken', refresh);
                localStorage.setItem('user', JSON.stringify(user));
                onSuccess(response.data);
                return;
            }

            const { access, refresh, user } = response.data;
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);
            localStorage.setItem('user', JSON.stringify(user));

            onSuccess(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Google sign-in failed');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Box sx={{ mb: 2 }}>
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
                p: 2.5,
                borderRadius: '16px',
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
                        text="continue_with"
                        width="320"
                    />
                </Box>
            </Box>
        </Box>
    );
};

// Input sanitization function
const sanitizeInput = (input: string): string => {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

export const LoginModal = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch<AppDispatch>();
    const { isLoginOpen, closeLoginModal, switchToRegister } = useAuthModal();
    const { isLoading: reduxLoading, error: reduxError } = useSelector((state: RootState) => state.auth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);
    const [localError, setLocalError] = useState('');
    const [rateLimitError, setRateLimitError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const [selectedRole, setSelectedRole] = useState<string>('DONOR');
    const [isGoogleFlow, setIsGoogleFlow] = useState(false);

    // Clear errors when user starts typing
    useEffect(() => {
        setLocalError('');
        setRateLimitError('');
    }, [email, password]);

    // Reset form when modal opens
    useEffect(() => {
        if (isLoginOpen) {
            setEmail('');
            setPassword('');
            setLocalError('');
            setRateLimitError('');
            setLocalLoading(false);
            setIsGoogleFlow(false);
        }
    }, [isLoginOpen]);



    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLocalError('');
        setRateLimitError('');
        setLocalLoading(true);

        const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());
        const sanitizedPassword = password;

        if (!validateEmail(sanitizedEmail)) {
            setLocalError('Please enter a valid email address');
            setLocalLoading(false);
            return;
        }

        if (sanitizedPassword.length < 8) {
            setLocalError('Password must be at least 8 characters');
            setLocalLoading(false);
            return;
        }

        try {
            await Promise.all([
                dispatch(login({
                    email: sanitizedEmail,
                    password: sanitizedPassword
                })).unwrap(),
                new Promise(resolve => setTimeout(resolve, 800))
            ]);

            closeLoginModal();
            const from = (location.state as any)?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        } catch (err: any) {
            if (typeof err === 'string' && err.includes('Rate limit exceeded')) {
                setRateLimitError('Too many login attempts. Please try again later.');
            } else {
                setLocalError(err || 'Login failed. Please check your credentials.');
            }
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <Dialog
            open={isLoginOpen}
            onClose={closeLoginModal}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    backgroundColor: '#fff',
                    backgroundImage: 'none',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    overflow: 'visible',
                    mx: isMobile ? 2 : 'auto',
                    width: isMobile ? 'calc(100% - 32px)' : '440px',
                    maxWidth: '440px',
                    border: 'none',
                }
            }}
        >
            <IconButton
                onClick={closeLoginModal}
                sx={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    color: '#999',
                    '&:hover': { color: '#333' }
                }}
            >
                <Close />
            </IconButton>

            {isLoginOpen && (
                <DialogContent sx={{ p: isMobile ? 3 : 5, pt: isMobile ? 5 : 6 }}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" fontWeight="700" sx={{ color: '#000', mb: 1, letterSpacing: '-0.02em' }}>
                            {isGoogleFlow ? "Select your role" : "Welcome back"}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#666', fontWeight: 400 }}>
                            {isGoogleFlow ? "Please select how you want to join Kindra" : "Please enter your details"}
                        </Typography>
                    </Box>

                    {isGoogleFlow ? (
                        <>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                {ROLES.map((role) => {
                                    const isSelected = selectedRole === role.value;
                                    return (
                                        <Grid item xs={12} key={role.value}>
                                            <Paper
                                                elevation={isSelected ? 4 : 0}
                                                onClick={() => setSelectedRole(role.value)}
                                                sx={{
                                                    p: 2,
                                                    cursor: 'pointer',
                                                    borderRadius: '16px',
                                                    border: '2px solid',
                                                    borderColor: isSelected ? 'primary.main' : '#f0f0f0',
                                                    bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.02) : '#fff',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2.5,
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    '&:hover': {
                                                        borderColor: isSelected ? 'primary.main' : '#ddd',
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
                                                    },
                                                    '&::after': isSelected ? {
                                                        content: '""',
                                                        position: 'absolute',
                                                        top: 0,
                                                        right: 0,
                                                        width: '40px',
                                                        height: '40px',
                                                        background: `linear-gradient(135deg, transparent 50%, ${theme.palette.primary.main} 50%)`,
                                                        opacity: 0.1
                                                    } : {}
                                                }}
                                            >
                                                <Box sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: '12px',
                                                    bgcolor: isSelected ? 'primary.main' : '#f8f9fa',
                                                    color: isSelected ? '#fff' : 'text.secondary',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: isSelected ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` : 'none'
                                                }}>
                                                    {role.icon}
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#1a1a1a', lineHeight: 1.2 }}>
                                                        {role.label}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, mt: 0.5, display: 'block' }}>
                                                        {role.description}
                                                    </Typography>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                            <GoogleSignInButton
                                selectedRole={selectedRole}
                                onSuccess={(data) => {
                                    dispatch({
                                        type: 'auth/login/fulfilled',
                                        payload: { access: data.access, refresh: data.refresh, user: data.user }
                                    });
                                    closeLoginModal();
                                    const from = (location.state as any)?.from?.pathname || '/dashboard';
                                    navigate(from, { replace: true });
                                }}
                            />
                            <Button
                                fullWidth
                                variant="text"
                                onClick={() => setIsGoogleFlow(false)}
                                sx={{
                                    color: 'text.secondary',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    '&:hover': { bgcolor: 'transparent', color: 'primary.main', textDecoration: 'underline' }
                                }}
                            >
                                Back to email login
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => setIsGoogleFlow(true)}
                                sx={{
                                    mb: 3,
                                    py: 1.5,
                                    borderRadius: '8px',
                                    borderColor: '#ddd',
                                    color: '#333',
                                    textTransform: 'none',
                                    fontWeight: '600',
                                    fontSize: '15px',
                                    '&:hover': {
                                        borderColor: '#bbb',
                                        bgcolor: '#f9f9f9'
                                    }
                                }}
                            >
                                Continue with Google
                            </Button>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Box sx={{ flex: 1, height: '1px', bgcolor: '#eee' }} />
                                <Typography variant="body2" sx={{ px: 2, color: '#999', fontWeight: 500 }}>
                                    or
                                </Typography>
                                <Box sx={{ flex: 1, height: '1px', bgcolor: '#eee' }} />
                            </Box>

                            {(reduxError || localError) && !rateLimitError && (
                                <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
                                    {localError || reduxError}
                                </Alert>
                            )}

                            {rateLimitError && (
                                <Alert severity="warning" sx={{ mb: 3, borderRadius: '8px' }}>
                                    {rateLimitError}
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: '#333' }}>
                                        Email address
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                        disabled={localLoading || reduxLoading}
                                        required
                                        InputProps={{
                                            sx: {
                                                height: '48px',
                                                borderRadius: '8px',
                                                '& fieldset': { borderColor: '#ddd' },
                                                '&:hover fieldset': { borderColor: '#bbb !important' },
                                                '&.Mui-focused fieldset': { borderColor: '#000 !important', borderWidth: '1px' },
                                            }
                                        }}
                                    />
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: '#333' }}>
                                        Password
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                        disabled={localLoading || reduxLoading}
                                        required
                                        InputProps={{
                                            sx: {
                                                height: '48px',
                                                borderRadius: '8px',
                                                '& fieldset': { borderColor: '#ddd' },
                                                '&:hover fieldset': { borderColor: '#bbb !important' },
                                                '&.Mui-focused fieldset': { borderColor: '#000 !important', borderWidth: '1px' },
                                            },
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                        size="small"
                                                    >
                                                        {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="checkbox"
                                            id="remember_me"
                                            checked={rememberMe}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                                            style={{
                                                width: '18px',
                                                height: '18px',
                                                cursor: 'pointer',
                                                accentColor: '#000'
                                            }}
                                        />
                                        <Typography
                                            component="label"
                                            htmlFor="remember_me"
                                            variant="body2"
                                            sx={{ ml: 1, cursor: 'pointer', color: '#444', fontWeight: 500 }}
                                        >
                                            Remember for 30 days
                                        </Typography>
                                    </Box>
                                    <Link
                                        component={RouterLink}
                                        to="/forgot-password"
                                        onClick={closeLoginModal}
                                        sx={{
                                            color: '#0066ff',
                                            textDecoration: 'none',
                                            fontWeight: 700,
                                            fontSize: '14px',
                                            '&:hover': { textDecoration: 'underline' }
                                        }}
                                    >
                                        Forgot password
                                    </Link>
                                </Box>

                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    disabled={localLoading || reduxLoading || !!rateLimitError}
                                    sx={{
                                        bgcolor: '#000',
                                        color: '#fff',
                                        py: 1.5,
                                        borderRadius: '8px',
                                        fontWeight: '700',
                                        textTransform: 'none',
                                        fontSize: '16px',
                                        boxShadow: 'none',
                                        '&:hover': {
                                            bgcolor: '#222',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        },
                                        '&:disabled': {
                                            bgcolor: '#eee',
                                            color: '#aaa'
                                        }
                                    }}
                                >
                                    {(localLoading || reduxLoading) ? <CircularProgress size={24} color="inherit" /> : 'Sign in'}
                                </Button>

                                <Box sx={{ mt: 4, textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                                        Don't have an account?{' '}
                                        <Link
                                            component="button"
                                            variant="body2"
                                            onClick={switchToRegister}
                                            sx={{
                                                color: '#0066ff',
                                                fontWeight: 700,
                                                textDecoration: 'none',
                                                '&:hover': { textDecoration: 'underline' }
                                            }}
                                        >
                                            Sign up
                                        </Link>
                                    </Typography>
                                </Box>
                            </form>
                        </>
                    )}
                </DialogContent>
            )}
        </Dialog>
    );
};
