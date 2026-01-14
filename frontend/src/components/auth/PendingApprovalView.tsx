import { Box, Typography, Button, Paper, alpha, useTheme } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import type { RootState, AppDispatch } from '../../store';
import { motion } from 'framer-motion';
import { HourglassEmpty, Security, Logout } from '@mui/icons-material';

export const PendingApprovalView = () => {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#f8fafc',
                p: 3
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', maxWidth: 500 }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        p: 5,
                        textAlign: 'center',
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            bgcolor: 'warning.main'
                        }}
                    />

                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                            color: 'warning.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 4
                        }}
                    >
                        <HourglassEmpty sx={{ fontSize: 40 }} />
                    </Box>

                    <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: '#1e293b' }}>
                        Account Pending Approval
                    </Typography>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                        Hello, <strong>{user?.firstName}</strong>. Your account as a <strong>Shelter Partner</strong> is currently being reviewed by our administration team.
                        Security and verification are core to our mission. You will receive an email and a notification once your access is activated.
                    </Typography>

                    <Box
                        sx={{
                            p: 3,
                            bgcolor: alpha(theme.palette.primary.main, 0.03),
                            borderRadius: 2,
                            mb: 4,
                            border: '1px dashed',
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            textAlign: 'left'
                        }}
                    >
                        <Security color="primary" />
                        <Typography variant="body2" sx={{ color: 'primary.dark', fontWeight: 500 }}>
                            Typical verification takes 12-24 hours. Thank you for your patience while we ensure community safety.
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={<Logout />}
                        onClick={handleLogout}
                        sx={{
                            borderRadius: 1,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            borderColor: 'divider',
                            color: 'text.secondary'
                        }}
                    >
                        Sign Out
                    </Button>
                </Paper>
            </motion.div>
        </Box>
    );
};
