import { useState, useEffect } from 'react';
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
    useMediaQuery
} from '@mui/material';
import { Visibility, VisibilityOff, Close, Security } from '@mui/icons-material';
import DOMPurify from 'isomorphic-dompurify';
import { useAuthModal } from '../../contexts/AuthModalContext';
import logo from '../../assets/logo.jpg';
import { GoogleLogin } from '@react-oauth/google';
import apiClient, { endpoints } from '../../api/client';

// Google Sign-In Component
const GoogleSignInButton = ({ onSuccess }: { onSuccess: () => void }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await apiClient.post(endpoints.auth.googleLogin, {
                credential: credentialResponse.credential
            });

            const { access, refresh, user } = response.data;

            // Store tokens
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);
            localStorage.setItem('user', JSON.stringify(user));

            // Update Redux state
            dispatch({
                type: 'auth/login/fulfilled',
                payload: { access, refresh, user }
            });

            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Google sign-in failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in failed. Please try again.')}
                useOneTap
                theme="filled_blue"
                size="large"
                width="100%"
                disabled={isLoading}
            />
        </Box>
    );
};

// Input sanitization function
const sanitizeInput = (input: string): string => {
    // Remove HTML tags and script content
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

export const LoginModal = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch<AppDispatch>();
    const { isLoginOpen, closeLoginModal, switchToRegister } = useAuthModal();
    const { isLoading, error } = useSelector((state: RootState) => state.auth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);
    const [localError, setLocalError] = useState('');
    const [rateLimitError, setRateLimitError] = useState('');

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
        }
    }, [isLoginOpen]);

    // Email validation
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');
        setRateLimitError('');
        setLocalLoading(true);

        // Sanitize inputs to prevent XSS
        const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());
        const sanitizedPassword = password; // Don't sanitize password, just use as-is

        // Validate email
        if (!validateEmail(sanitizedEmail)) {
            setLocalError('Please enter a valid email address');
            setLocalLoading(false);
            return;
        }

        // Validate password length (basic check)
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

            // Success
            closeLoginModal();
            const from = (location.state as any)?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        } catch (err: any) {
            // Handle rate limiting error specifically
            if (err.includes('Rate limit exceeded')) {
                // Extract seconds if present, but don't show them to user
                setRateLimitError('Too many login attempts. Please try again in a few minutes.');
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
                    borderRadius: 3,
                    backdropFilter: 'blur(10px)',
                    backgroundColor: alpha(theme.palette.background.paper, 0.95),
                    backgroundImage: 'none',
                    boxShadow: theme.shadows[24],
                    overflow: 'visible',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.1),
                    mx: isMobile ? 2 : 'auto',
                    width: isMobile ? 'calc(100% - 32px)' : '400px',
                    maxWidth: '400px'
                }
            }}
        >
            <IconButton
                onClick={closeLoginModal}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: 'text.secondary'
                }}
            >
                <Close />
            </IconButton>

            <DialogContent sx={{ p: isMobile ? 2.5 : 3, pt: isMobile ? 3.5 : 4 }}>
                <Box sx={{ textAlign: 'center', mb: isMobile ? 2 : 2.5 }}>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            p: 1,
                            borderRadius: 2,
                            bgcolor: 'white',
                            mb: 1.5,
                            boxShadow: theme.shadows[1],
                            border: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.1)
                        }}
                    >
                        <Box
                            component="img"
                            src={logo}
                            alt="Kindra Logo"
                            sx={{
                                height: isMobile ? 35 : 40,
                                width: 'auto',
                                objectFit: 'contain'
                            }}
                        />
                    </Box>
                    <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" gutterBottom>
                        Welcome Back
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Securely login to your account
                    </Typography>
                </Box>

                {(error || localError) && !rateLimitError && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {localError || error}
                    </Alert>
                )}

                {rateLimitError && (
                    <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                        <strong>Too Many Attempts</strong><br />
                        {rateLimitError}
                        <br /><br />
                        This is a security measure to protect your account.
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
                        autoComplete="email"
                        sx={{ mb: 2 }}
                        InputProps={{
                            sx: { borderRadius: 2 }
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        required
                        autoComplete="current-password"
                        sx={{ mb: 2 }}
                        InputProps={{
                            sx: { borderRadius: 2 },
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

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, mt: -1 }}>
                        <Link
                            component={RouterLink}
                            to="/forgot-password"
                            onClick={closeLoginModal}
                            sx={{
                                textDecoration: 'none',
                                fontWeight: 600,
                                color: 'primary.main',
                                fontSize: '0.85rem',
                                '&:hover': { textDecoration: 'underline' }
                            }}
                        >
                            Forgot Password?
                        </Link>
                    </Box>

                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={localLoading || isLoading || !!rateLimitError}
                        startIcon={(localLoading || isLoading) ? <CircularProgress size={20} color="inherit" /> : null}
                        sx={{
                            py: 1.25,
                            borderRadius: 2,
                            fontWeight: 'bold',
                            textTransform: 'none',
                            fontSize: '1rem',
                            boxShadow: theme.shadows[4]
                        }}
                    >
                        {(localLoading || isLoading) ? 'Logging in...' : 'Login'}
                    </Button>

                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Don't have an account?{' '}
                            <Link
                                component="button"
                                variant="body2"
                                onClick={switchToRegister}
                                sx={{
                                    fontWeight: 800,
                                    color: 'primary.main',
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                Register
                            </Link>
                        </Typography>
                    </Box>
                </form>

                {/* Divider */}
                <Box sx={{ display: 'flex', alignItems: 'center', my: isMobile ? 2 : 2.5 }}>
                    <Box sx={{ flex: 1, height: '1px', bgcolor: alpha(theme.palette.divider, 0.2) }} />
                    <Typography variant="caption" color="text.secondary" sx={{ px: 1.5 }}>
                        OR
                    </Typography>
                    <Box sx={{ flex: 1, height: '1px', bgcolor: alpha(theme.palette.divider, 0.2) }} />
                </Box>

                {/* Google Sign-In
Button */}
                <GoogleSignInButton onSuccess={() => {
                    closeLoginModal();
                    const from = (location.state as any)?.from?.pathname || '/dashboard';
                    navigate(from, { replace: true });
                }} />

                <Box sx={{ mt: 2.5, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <Security sx={{ fontSize: 14 }} /> Your data is encrypted end-to-end
                    </Typography>
                </Box>
            </DialogContent>
        </Dialog>
    );
};
