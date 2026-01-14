import {
    Dialog,
    DialogActions,
    Button,
    Typography,
    Box,
    useTheme,
    alpha
} from '@mui/material';
import { WarningAmberRounded } from '@mui/icons-material';

interface LogoutDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const LogoutDialog = ({ open, onClose, onConfirm }: LogoutDialogProps) => {
    const theme = useTheme();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    width: '100%',
                    maxWidth: 400,
                    p: 1,
                    background: alpha(theme.palette.background.paper, 0.95),
                    backdropFilter: 'blur(20px)',
                    boxShadow: theme.shadows[20]
                }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3, px: 3 }}>
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2
                    }}
                >
                    <WarningAmberRounded sx={{ fontSize: 32, color: theme.palette.warning.main }} />
                </Box>
                <Typography variant="h6" fontWeight="bold" textAlign="center" gutterBottom>
                    Logging Out?
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                    It's sad to see you leave, are you sure you want to log out?
                </Typography>
            </Box>

            <DialogActions sx={{ p: 3, pt: 4, display: 'flex', gap: 2 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={onClose}
                    sx={{
                        borderRadius: 2,
                        borderColor: 'divider',
                        color: 'text.primary'
                    }}
                >
                    Cancel
                </Button>
                <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    onClick={onConfirm}
                    sx={{
                        borderRadius: 2,
                        fontWeight: 'bold',
                        boxShadow: 'none'
                    }}
                >
                    Logout
                </Button>
            </DialogActions>
        </Dialog>
    );
};
