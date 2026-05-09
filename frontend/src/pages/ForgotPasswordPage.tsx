import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
    Box, 
    Container, 
    Typography, 
    TextField, 
    Button, 
    Paper, 
    IconButton, 
    Alert, 
    CircularProgress,
    alpha,
    useTheme,
    Link,
    InputAdornment,
    Grid
} from '@mui/material';
import { 
    ArrowBack, 
    Email, 
    VpnKey, 
    Lock, 
    CheckCircle, 
    Visibility, 
    VisibilityOff,
    Key
} from '@mui/icons-material';
import { AppDispatch } from '../store';
import { requestPasswordReset, verifyOTP, confirmPasswordReset } from '../features/auth/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'request' | 'verify' | 'reset' | 'success';

export default function ForgotPasswordPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const [step, setStep] = useState<Step>('request');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleRequest = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await dispatch(requestPasswordReset(email)).unwrap();
            setStep('verify');
        } catch (err: any) {
            setError(err || 'Failed to send reset code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const result = await dispatch(verifyOTP({ email, otp_code: otp })).unwrap();
            setResetToken(result.reset_token);
            setStep('reset');
        } catch (err: any) {
            setError(err || 'Invalid or expired code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await dispatch(confirmPasswordReset({ 
                token: resetToken, 
                new_password: newPassword, 
                new_password_confirm: confirmPassword 
            })).unwrap();
            setStep('success');
        } catch (err: any) {
            setError(err || 'Failed to reset password');
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
                        <Link component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', textDecoration: 'none', mb: 6, '&:hover': { color: 'white' } }}>
                            <ArrowBack fontSize="small" /> Home
                        </Link>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {step === 'request' && (
                                    <Box component="form" onSubmit={handleRequest}>
                                        <Box sx={{ mb: 4 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                                                    <Key />
                                                </Box>
                                                <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                                                    Forgot Password?
                                                </Typography>
                                            </Box>
                                            <Typography variant="body1" sx={{ color: alpha('#fff', 0.6) }}>
                                                Enter your email and we'll send you a 6-digit code to reset your password.
                                            </Typography>
                                        </Box>

                                        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.light' }}>{error}</Alert>}

                                        <TextField
                                            fullWidth
                                            label="Email Address"
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
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Email sx={{ color: alpha('#fff', 0.3) }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />

                                        <Button
                                            fullWidth
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            disabled={isLoading}
                                            sx={{ py: 1.8, borderRadius: 2, fontWeight: 'bold', textTransform: 'none', fontSize: '0.95rem', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, color: 'white' }}
                                        >
                                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Code'}
                                        </Button>
                                    </Box>
                                )}

                                {step === 'verify' && (
                                    <Box component="form" onSubmit={handleVerify}>
                                        <Box sx={{ mb: 4 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                                                    <VpnKey />
                                                </Box>
                                                <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                                                    Verify OTP
                                                </Typography>
                                            </Box>
                                            <Typography variant="body1" sx={{ color: alpha('#fff', 0.6) }}>
                                                Check <strong>{email}</strong> for the 6-digit code.
                                            </Typography>
                                        </Box>

                                        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.light' }}>{error}</Alert>}

                                        <TextField
                                            fullWidth
                                            label="Verification Code"
                                            placeholder="000000"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            required
                                            inputProps={{ 
                                                style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', fontWeight: 'bold', color: 'white' } 
                                            }}
                                            sx={{
                                                mb: 4,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    bgcolor: alpha('#fff', 0.03),
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
                                            disabled={isLoading || otp.length < 6}
                                            sx={{ py: 1.8, borderRadius: 2, fontWeight: 'bold', textTransform: 'none', fontSize: '0.95rem', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, color: 'white' }}
                                        >
                                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Verify Code'}
                                        </Button>
                                        
                                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                                            <Link component="button" type="button" variant="body2" onClick={() => handleRequest()} sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                                Resend code
                                            </Link>
                                        </Box>
                                    </Box>
                                )}

                                {step === 'reset' && (
                                    <Box component="form" onSubmit={handleReset}>
                                        <Box sx={{ mb: 4 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                                                    <Lock />
                                                </Box>
                                                <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                                                    New Password
                                                </Typography>
                                            </Box>
                                            <Typography variant="body1" sx={{ color: alpha('#fff', 0.6) }}>
                                                Create a secure password to protect your account.
                                            </Typography>
                                        </Box>

                                        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.light' }}>{error}</Alert>}

                                        <TextField
                                            fullWidth
                                            label="New Password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
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
                                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: alpha('#fff', 0.4) }}>
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />

                                        <TextField
                                            fullWidth
                                            label="Confirm Password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                                            sx={{ py: 1.8, borderRadius: 2, fontWeight: 'bold', textTransform: 'none', fontSize: '0.95rem', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, color: 'white' }}
                                        >
                                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                                        </Button>
                                    </Box>
                                )}

                                {step === 'success' && (
                                    <Box sx={{ textAlign: 'center' }}>
                                        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
                                        <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: 'white' }}>
                                            Success!
                                        </Typography>
                                        <Typography sx={{ color: alpha('#fff', 0.6), mb: 4 }}>
                                            Your password has been successfully updated.
                                        </Typography>

                                        <Button
                                            fullWidth
                                            component={RouterLink}
                                            to="/login"
                                            variant="contained"
                                            size="large"
                                            sx={{ py: 1.8, borderRadius: 2, fontWeight: 'bold', textTransform: 'none', fontSize: '0.95rem', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, color: 'white' }}
                                        >
                                            Back to Login
                                        </Button>
                                    </Box>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </Container>
                </Grid>
            </Grid>
        </Box>
    );
}
