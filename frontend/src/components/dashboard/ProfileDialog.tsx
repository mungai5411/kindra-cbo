import {
    Dialog,
    DialogContent,
    Button,
    Box,
    Avatar,
    Typography,
    Stack,
    IconButton,
    Chip,
    Paper,
    useTheme,
    alpha
} from '@mui/material';
import {
    Email,
    Phone,
    CalendarMonth,
    Close,
    Edit
} from '@mui/icons-material';

interface ProfileDialogProps {
    open: boolean;
    onClose: () => void;
    user: any;
    onEdit?: () => void;
}

export const ProfileDialog = ({ open, onClose, user, onEdit }: ProfileDialogProps) => {
    const theme = useTheme();

    if (!user) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 5,
                    overflow: 'hidden',
                    bgcolor: '#FBFBFB',
                }
            }}
        >
            <Box sx={{
                p: 3,
                pb: 1,
                display: 'flex',
                justifyContent: 'flex-end',
                bgcolor: 'transparent'
            }}>
                <IconButton
                    onClick={onClose}
                    sx={{ bgcolor: alpha(theme.palette.divider, 0.1) }}
                >
                    <Close fontSize="small" />
                </IconButton>
            </Box>

            <DialogContent sx={{ pt: 0, px: 3, pb: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                    <Avatar
                        src={user.profile_picture}
                        sx={{
                            width: 100,
                            height: 100,
                            border: '4px solid white',
                            boxShadow: theme.shadows[3],
                            mb: 2
                        }}
                    >
                        {user.firstName?.[0]}
                    </Avatar>
                    <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: -0.5 }}>
                        {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, opacity: 0.8 }}>
                        {user.email}
                    </Typography>

                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Chip
                            label={user.role || 'User'}
                            size="small"
                            sx={{
                                fontWeight: 700,
                                borderRadius: 1.5,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main',
                                border: 'none'
                            }}
                        />
                        {user.is_verified && (
                            <Chip
                                label="Verified"
                                size="small"
                                color="success"
                                sx={{ fontWeight: 700, borderRadius: 1.5 }}
                            />
                        )}
                    </Box>
                </Box>

                <Paper elevation={0} sx={{
                    borderRadius: 4,
                    p: 2,
                    bgcolor: 'white',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.08)
                }}>
                    <Stack spacing={2.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main' }}>
                                <Email fontSize="small" />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Email Address</Typography>
                                <Typography variant="body2" fontWeight="600">{user.email}</Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.05), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'secondary.main' }}>
                                <Phone fontSize="small" />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Phone Number</Typography>
                                <Typography variant="body2" fontWeight="600">{user.phone_number || 'Not provided'}</Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'info.main' }}>
                                <CalendarMonth fontSize="small" />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Member Since</Typography>
                                <Typography variant="body2" fontWeight="600">
                                    {user.date_joined ? new Date(user.date_joined).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'N/A'}
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                </Paper>
            </DialogContent>

            <Box sx={{ p: 3, pt: 0 }}>
                <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={onEdit}
                    sx={{
                        borderRadius: 3,
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 12px ' + alpha(theme.palette.primary.main, 0.2)
                    }}
                >
                    Edit Profile Details
                </Button>
            </Box>
        </Dialog>
    );
};
