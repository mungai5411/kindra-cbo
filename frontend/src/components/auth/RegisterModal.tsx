import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Grid,
    Link,
    Alert,
    MenuItem,
    CircularProgress,
    useTheme,
    alpha,
    Dialog,
    DialogContent,
    Typography,
    IconButton,
    useMediaQuery,
    InputAdornment
} from '@mui/material';
import { Close, Visibility, VisibilityOff } from '@mui/icons-material';
import { register } from '../../features/auth/authSlice';
import type { AppDispatch } from '../../store';
import { useAuthModal } from '../../contexts/AuthModalContext';
import logo from '../../assets/logo.jpg';

const ROLES = [
    { value: 'VOLUNTEER', label: 'Volunteer' },
    { value: 'DONOR', label: 'Donor' },
    { value: 'SHELTER_PARTNER', label: 'Shelter Partner' },
];

export const RegisterModal = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { isRegisterOpen, closeRegisterModal, switchToLogin, initialRole } = useAuthModal();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        organization: '',
        role: 'VOLUNTEER',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isRegisterOpen) {
            setFormData(prev => ({
                ...prev,
                email: '',
                password: '',
                password_confirm: '',
                first_name: '',
                last_name: '',
                phone_number: '',
                organization: '',
                role: initialRole && ROLES.some(r => r.value === initialRole) ? initialRole : 'VOLUNTEER'
            }));
            setError('');
            setLoading(false);
            setShowPassword(false);
        }
    }, [isRegisterOpen, initialRole]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.password_confirm) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await Promise.all([
                dispatch(register(formData)).unwrap(),
                new Promise(resolve => setTimeout(resolve, 800))
            ]);
            closeRegisterModal();
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(typeof err === 'string' ? err : 'Registration failed. Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    // Compact "pill" styles
    const inputSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '20px', // Smaller radius for compact look
            backgroundColor: alpha(theme.palette.common.white, 0.8),
            fontSize: '0.85rem', // Smaller text
            '& fieldset': {
                borderColor: alpha(theme.palette.grey[300], 0.5),
            },
            '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
            },
            '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: '2px',
            },
            '& input': {
                py: 0.75, // Very compact padding
                px: 1.5,
            },
            '& .MuiSelect-select': {
                py: 0.75,
                px: 1.5,
            }
        },
        '& .MuiInputLabel-root': {
            fontSize: '0.8rem',
            transform: 'translate(14px, 8px) scale(1)',
            '&.Mui-focused, &.MuiFormLabel-filled': {
                transform: 'translate(14px, -14px) scale(0.75)', // Move label higher up
            },
        },
    };

    return (
        <Dialog
            open={isRegisterOpen}
            onClose={closeRegisterModal}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    bgcolor: '#fafafa',
                    backgroundImage: 'none',
                    boxShadow: theme.shadows[24],
                    overflow: 'visible',
                    mx: isMobile ? 2 : 'auto',
                    width: isMobile ? 'calc(100% - 32px)' : '400px',
                    maxWidth: '400px',
                    maxHeight: 'calc(100% - 32px)'
                }
            }}
        >
            <IconButton
                onClick={closeRegisterModal}
                size="small"
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: 'text.secondary',
                    zIndex: 1
                }}
            >
                <Close fontSize="small" />
            </IconButton>

            <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            p: 1,
                            borderRadius: '16px',
                            bgcolor: 'white',
                            mb: 1,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        }}
                    >
                        <Box
                            component="img"
                            src={logo}
                            alt="Kindra Logo"
                            sx={{
                                height: 28, // Smaller logo
                                width: 'auto',
                                objectFit: 'contain'
                            }}
                        />
                    </Box>
                    <Typography variant="h6" fontWeight="700" gutterBottom sx={{ color: '#1a1a1a', fontSize: '1.1rem', mb: 0 }}>
                        Join Kindra
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, py: 0, '& .MuiAlert-message': { py: 0.5 } }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={1.5}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="First Name *"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                                sx={inputSx}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Last Name *"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                                sx={inputSx}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email Address *"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                sx={inputSx}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                sx={inputSx}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="I am a... *"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                                sx={inputSx}
                            >
                                {ROLES.map((option) => (
                                    <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.85rem' }}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Organization (Optional)"
                                name="organization"
                                value={formData.organization}
                                onChange={handleChange}
                                sx={inputSx}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Password *"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                sx={inputSx}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                size="small"
                                                sx={{ mr: 0.5, p: 0.5 }}
                                            >
                                                {showPassword ? <VisibilityOff fontSize="small" sx={{ fontSize: 18 }} /> : <Visibility fontSize="small" sx={{ fontSize: 18 }} />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Confirm Password *"
                                name="password_confirm"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password_confirm}
                                onChange={handleChange}
                                required
                                sx={inputSx}
                            />
                        </Grid>
                    </Grid>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="medium"
                        disabled={loading}
                        sx={{
                            mt: 2.5,
                            py: 1,
                            borderRadius: '20px',
                            fontSize: '0.95rem',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
                            bgcolor: '#388e3c',
                            '&:hover': {
                                bgcolor: '#2e7d32',
                                boxShadow: '0 6px 16px rgba(46, 125, 50, 0.3)',
                            }
                        }}
                    >
                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Register'}
                    </Button>

                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                            Already have an account?{' '}
                            <Link
                                component="button"
                                variant="body2"
                                onClick={switchToLogin}
                                sx={{
                                    fontWeight: 700,
                                    color: '#388e3c',
                                    textDecoration: 'none',
                                    fontSize: '0.8rem',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                Sign In
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};
