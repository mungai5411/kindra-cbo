import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    useTheme,
    alpha
} from '@mui/material';

interface ConfirmationDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    severity?: 'info' | 'warning' | 'error';
}

export const ConfirmationDialog = ({
    open,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    severity = 'warning'
}: ConfirmationDialogProps) => {
    const theme = useTheme();

    const getColor = () => {
        switch (severity) {
            case 'error': return theme.palette.error.main;
            case 'warning': return theme.palette.warning.main;
            default: return theme.palette.primary.main;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    padding: 1,
                    minWidth: { xs: '90%', sm: 400 }
                }
            }}
        >
            <DialogTitle sx={{ fontWeight: 'bold', color: getColor() }}>
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ color: 'text.primary' }}>
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button
                    onClick={onCancel}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
                >
                    {cancelText}
                </Button>
                <Button
                    variant="contained"
                    onClick={onConfirm}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 'bold',
                        bgcolor: getColor(),
                        '&:hover': { bgcolor: alpha(getColor(), 0.8) }
                    }}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
