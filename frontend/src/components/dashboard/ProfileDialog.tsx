import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Avatar,
    Typography,
    Divider,
    Stack,
    IconButton,
    Chip,
    useTheme,
    alpha,
    useMediaQuery
} from '@mui/material';
import {
    Email,
    Phone,
    AdminPanelSettings,
    CalendarMonth,
    Close,
    Edit,
    VerifiedUser
} from '@mui/icons-material';

interface ProfileDialogProps {
    open: boolean;
    onClose: () => void;
    user: any;
    onEdit?: () => void;
}

export const ProfileDialog = ({ open, onClose, user, onEdit }: ProfileDialogProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (!user) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: isMobile ? 3 : 5,
                    overflow: 'hidden',
                    mx: isMobile ? 2 : 'auto',
                    width: isMobile ? 'calc(100% - 32px)' : 'auto'
                }
            }}
        >
            <Box sx={{
                height: 120,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                position: 'relative'
            }}>
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', top: 12, right: 12, color: 'white', bgcolor: alpha('#000', 0.2), '&:hover': { bgcolor: alpha('#000', 0.4) } }}
                >
                    <Close />
                </IconButton>
            </Box>

            <DialogContent sx={{ pt: 0, position: 'relative' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: -6, mb: 3 }}>
                    <Avatar
                        src={user.profile_picture}
                        sx={{
                            width: 120,
                            height: 120,
                            border: '6px solid',
                            borderColor: 'background.paper',
                            boxShadow: theme.shadows[4]
                        }}
                    >
                        {user.firstName?.[0]}
                    </Avatar>
                    <Typography variant="h5" fontWeight="900" sx={{ mt: 2 }}>
                        {user.firstName} {user.lastName}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip
                            icon={<AdminPanelSettings sx={{ fontSize: '1rem !important' }} />}
                            label={user.role || 'User'}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 600, borderRadius: 1.5 }}
                        />
                        {user.is_verified && (
                            <Chip
                                icon={<VerifiedUser sx={{ fontSize: '1rem !important' }} />}
                                label="Verified"
                                size="small"
                                color="success"
                                sx={{ fontWeight: 600, borderRadius: 1.5 }}
                            />
                        )}
                    </Stack>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Stack spacing={2.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                            <Email />
                        </Avatar>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Email Address</Typography>
                            <Typography variant="body1" fontWeight="500">{user.email}</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }}>
                            <Phone />
                        </Avatar>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Phone Number</Typography>
                            <Typography variant="body1" fontWeight="500">{user.phoneNumber || 'Not provided'}</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main' }}>
                            <CalendarMonth />
                        </Avatar>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Member Since</Typography>
                            <Typography variant="body1" fontWeight="500">
                                {user.dateJoined ? new Date(user.dateJoined).toLocaleDateString(undefined, { month: 'long', year: 'numeric', day: 'numeric' }) : 'N/A'}
                            </Typography>
                        </Box>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={onEdit}
                    sx={{ borderRadius: 3, px: 3, textTransform: 'none', fontWeight: 'bold' }}
                >
                    Edit Profile
                </Button>
                <Button
                    variant="contained"
                    onClick={onClose}
                    sx={{ borderRadius: 3, px: 4, textTransform: 'none', fontWeight: 'bold' }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};
