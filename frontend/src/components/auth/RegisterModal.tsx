import React, { useState, useEffect } from 'react';
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
import { GoogleSignInButton } from './GoogleSignInButton';

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

    const inputInnerSx = {
        height: '46px',
        borderRadius: '8px',
        bgcolor: '#fff',
        '& fieldset': { borderColor: '#ddd' },
        '&:hover fieldset': { borderColor: '#bbb !important' },
        '&.Mui-focused fieldset': { borderColor: '#000 !important', borderWidth: '1px' },
        fontSize: '0.9rem',
    };

    const LabelComponent = ({ children }: { children: React.ReactNode }) => (
        <Typography
            variant="body2"
            sx={{ mb: 0.75, color: '#333', fontSize: '0.85rem', fontWeight: "600" }}
        >
            {children}
        </Typography>
    );

    return (
        <Dialog
            open={isRegisterOpen}
            onClose={closeRegisterModal}
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
                    width: isMobile ? 'calc(100% - 32px)' : '460px',
                    maxWidth: '460px',
                    border: 'none',
                }
            }}
        >
            <IconButton
                onClick={closeRegisterModal}
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

            <DialogContent sx={{ p: isMobile ? 3 : 5, pt: isMobile ? 5 : 6 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="700" sx={{ color: '#000', mb: 1, letterSpacing: '-0.02em' }}>
                        Create account
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666', fontWeight: 400 }}>
                        Join the Kindra community today
                    </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <LabelComponent>First Name *</LabelComponent>
                            <TextField
                                fullWidth
                                name="first_name"
                                placeholder="Jane"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                                InputProps={{ sx: inputInnerSx }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <LabelComponent>Last Name *</LabelComponent>
                            <TextField
                                fullWidth
                                name="last_name"
                                placeholder="Doe"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                                InputProps={{ sx: inputInnerSx }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <LabelComponent>Email Address *</LabelComponent>
                            <TextField
                                fullWidth
                                name="email"
                                type="email"
                                placeholder="jane@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                InputProps={{ sx: inputInnerSx }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <LabelComponent>Phone Number</LabelComponent>
                            <TextField
                                fullWidth
                                name="phone_number"
                                placeholder="+254..."
                                value={formData.phone_number}
                                onChange={handleChange}
                                InputProps={{ sx: inputInnerSx }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <LabelComponent>I am a... *</LabelComponent>
                            <TextField
                                fullWidth
                                select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                                InputProps={{ sx: inputInnerSx }}
                            >
                                {ROLES.map((option) => (
                                    <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.9rem' }}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <LabelComponent>Organization (Optional)</LabelComponent>
                            <TextField
                                fullWidth
                                name="organization"
                                placeholder="Organization name"
                                value={formData.organization}
                                onChange={handleChange}
                                InputProps={{ sx: inputInnerSx }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <LabelComponent>Password *</LabelComponent>
                            <TextField
                                fullWidth
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                InputProps={{
                                    sx: inputInnerSx,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                size="small"
                                            >
                                                {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <LabelComponent>Confirm Password *</LabelComponent>
                            <TextField
                                fullWidth
                                name="password_confirm"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={formData.password_confirm}
                                onChange={handleChange}
                                required
                                InputProps={{ sx: inputInnerSx }}
                            />
                        </Grid>
                    </Grid>

                    {error && <Alert severity="error" sx={{ mt: 3, mb: 0, borderRadius: '8px' }}>{error}</Alert>}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{
                            mt: 4,
                            py: 1.5,
                            borderRadius: '8px',
                            fontWeight: '700',
                            textTransform: 'none',
                            fontSize: '16px',
                            bgcolor: '#000',
                            color: '#fff',
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: '#222',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            },
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Create account'}
                    </Button>

                    <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
                        <Box sx={{ flex: 1, height: '1px', bgcolor: '#eee' }} />
                        <Typography variant="body2" sx={{ px: 2, color: '#999', fontWeight: 500 }}>
                            or
                        </Typography>
                        <Box sx={{ flex: 1, height: '1px', bgcolor: '#eee' }} />
                    </Box>

                    <GoogleSignInButton
                        selectedRole={formData.role}
                        buttonText="signup_with"
                        onSuccess={(data: any) => {
                            dispatch({
                                type: 'auth/register/fulfilled',
                                payload: { access: data.access, refresh: data.refresh, user: data.user }
                            });
                            closeRegisterModal();
                            navigate('/dashboard');
                        }}
                    />

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                            Already have an account?{' '}
                            <Link
                                component="button"
                                variant="body2"
                                onClick={switchToLogin}
                                sx={{
                                    color: '#0066ff',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                Sign in
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};
