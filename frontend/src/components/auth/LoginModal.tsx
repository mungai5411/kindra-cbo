import React, { useState, useEffect } from 'react';
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
    useMediaQuery,
    alpha
} from '@mui/material';
import { Visibility, VisibilityOff, Close } from '@mui/icons-material';
import { Checkbox, FormControlLabel } from '@mui/material';
import DOMPurify from 'isomorphic-dompurify';
import { useAuthModal } from '../../contexts/AuthModalContext';
import { GoogleSignInButton } from './GoogleSignInButton';



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

    const handleSubmit = async (e: React.FormEvent) => {
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
            const from = (location.state as any)?.from?.pathname || '/dashboard/overview';
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
                    borderRadius: 5,
                    backgroundColor: 'background.paper',
                    backgroundImage: 'none',
                    boxShadow: theme.shadows[10],
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
                    color: 'text.disabled',
                    '&:hover': { color: 'text.primary' }
                }}
            >
                <Close />
            </IconButton>

            {isLoginOpen && (
                <DialogContent sx={{ p: isMobile ? 3 : 5, pt: isMobile ? 5 : 6 }}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" fontWeight="700" sx={{ mb: 1, letterSpacing: '-0.02em' }}>
                            {isGoogleFlow ? "Sign in with Google" : "Welcome back"}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                            {isGoogleFlow ? "Access your account securely" : "Please enter your details"}
                        </Typography>
                    </Box>

                    {isGoogleFlow ? (
                        <>
                            <GoogleSignInButton
                                selectedRole={null} // No role for login flow
                                onSuccess={(data: any) => {
                                    dispatch({
                                        type: 'auth/login/fulfilled',
                                        payload: { access: data.access, refresh: data.refresh, user: data.user }
                                    });
                                    closeLoginModal();
                                    const from = (location.state as any)?.from?.pathname || '/dashboard/overview';
                                    navigate(from, { replace: true });
                                }}
                                onError={(msg) => {
                                    if (msg.includes('not found') || msg.includes('sign up')) {
                                        switchToRegister();
                                    } else {
                                        setLocalError(msg); // Will be displayed in Alert
                                    }
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
                                    borderRadius: 3,
                                    borderColor: 'divider',
                                    color: 'text.primary',
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

                            <Box component="form" onSubmit={handleSubmit}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: '#333' }}>
                                        Email address
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                        disabled={localLoading || reduxLoading}
                                        required
                                        InputProps={{
                                            sx: {
                                                height: '48px',
                                                borderRadius: 3,
                                                '& fieldset': { borderColor: 'divider' },
                                                '&:hover fieldset': { borderColor: alpha(theme.palette.primary.main, 0.4) },
                                                '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
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
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                        disabled={localLoading || reduxLoading}
                                        required
                                        InputProps={{
                                            sx: {
                                                height: '48px',
                                                borderRadius: 3,
                                                '& fieldset': { borderColor: 'divider' },
                                                '&:hover fieldset': { borderColor: alpha(theme.palette.primary.main, 0.4) },
                                                '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
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
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={rememberMe}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                                                sx={{
                                                    color: 'divider',
                                                    '&.Mui-checked': { color: 'primary.main' }
                                                }}
                                            />
                                        }
                                        label={
                                            <Typography variant="body2" sx={{ color: '#444', fontWeight: 500 }}>
                                                Remember for 30 days
                                            </Typography>
                                        }
                                    />
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
                                        bgcolor: 'primary.main',
                                        color: 'primary.contrastText',
                                        py: 1.5,
                                        borderRadius: 3,
                                        fontWeight: '700',
                                        textTransform: 'none',
                                        fontSize: '16px',
                                        boxShadow: theme.shadows[4],
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
                            </Box>
                        </>
                    )}
                </DialogContent>
            )}
        </Dialog>
    );
};
