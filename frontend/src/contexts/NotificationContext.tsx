/**
 * Notification Context
 * Handles global toast notifications and confirmation dialogs
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
    Snackbar, 
    Alert, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogContentText, 
    DialogActions, 
    Button, 
    Box, 
    Typography,
    alpha,
    useTheme,
    Zoom,
    CircularProgress
} from '@mui/material';
import { 
    Info, 
    CheckCircle, 
    Warning, 
    Error as ErrorIcon,
    HelpOutline
} from '@mui/icons-material';

interface ConfirmOptions {
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
    severity?: 'info' | 'warning' | 'error' | 'success';
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
}

interface NotificationOptions {
    message: string;
    severity?: 'info' | 'warning' | 'error' | 'success';
    duration?: number;
}

interface NotificationContextType {
    notify: (options: NotificationOptions | string) => void;
    confirm: (options: ConfirmOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const theme = useTheme();

    // Notification State
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifMessage, setNotifMessage] = useState('');
    const [notifSeverity, setNotifSeverity] = useState<'info' | 'warning' | 'error' | 'success'>('info');
    const [notifDuration, setNotifDuration] = useState(6000);

    // Confirmation State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    const notify = useCallback((options: NotificationOptions | string) => {
        if (typeof options === 'string') {
            setNotifMessage(options);
            setNotifSeverity('info');
            setNotifDuration(6000);
        } else {
            setNotifMessage(options.message);
            setNotifSeverity(options.severity || 'info');
            setNotifDuration(options.duration || 6000);
        }
        setNotifOpen(true);
    }, []);

    const confirm = useCallback((options: ConfirmOptions) => {
        setConfirmOptions(options);
        setConfirmOpen(true);
    }, []);

    const handleNotifClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setNotifOpen(false);
    };

    const handleConfirmCancel = () => {
        if (confirmOptions?.onCancel) confirmOptions.onCancel();
        setConfirmOpen(false);
        setConfirmOptions(null);
    };

    const handleConfirmOk = async () => {
        if (confirmOptions) {
            setIsConfirming(true);
            try {
                await confirmOptions.onConfirm();
            } finally {
                setIsConfirming(false);
                setConfirmOpen(false);
                setConfirmOptions(null);
            }
        }
    };

    const getSeverityIcon = (severity?: string) => {
        switch (severity) {
            case 'success': return <CheckCircle sx={{ color: 'success.main' }} />;
            case 'warning': return <Warning sx={{ color: 'warning.main' }} />;
            case 'error': return <ErrorIcon sx={{ color: 'error.main' }} />;
            default: return <HelpOutline sx={{ color: 'primary.main' }} />;
        }
    };

    return (
        <NotificationContext.Provider value={{ notify, confirm }}>
            {children}

            {/* Global Toast Notification */}
            <Snackbar
                open={notifOpen}
                autoHideDuration={notifDuration}
                onClose={handleNotifClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                TransitionComponent={Zoom}
            >
                <Alert
                    onClose={handleNotifClose}
                    severity={notifSeverity}
                    variant="filled"
                    sx={{
                        borderRadius: 3,
                        fontWeight: 600,
                        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
                        backdropFilter: 'blur(10px)',
                        background: alpha(theme.palette[notifSeverity === 'info' ? 'primary' : notifSeverity].main, 0.9),
                        px: 3,
                        py: 1
                    }}
                >
                    {notifMessage}
                </Alert>
            </Snackbar>

            {/* Global Confirmation Dialog */}
            <Dialog
                open={confirmOpen}
                onClose={handleConfirmCancel}
                TransitionComponent={Zoom}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        p: 1,
                        background: alpha(theme.palette.background.paper, 0.9),
                        backdropFilter: 'blur(20px)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.5),
                        boxShadow: `0 24px 64px ${alpha(theme.palette.common.black, 0.3)}`,
                        maxWidth: 400
                    }
                }}
            >
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mb: 2,
                        transform: 'scale(1.5)'
                    }}>
                        {getSeverityIcon(confirmOptions?.severity || (confirmOptions?.isDangerous ? 'error' : 'info'))}
                    </Box>
                    <DialogTitle sx={{ 
                        textAlign: 'center', 
                        p: 0, 
                        fontWeight: 'bold',
                        fontSize: '1.25rem'
                    }}>
                        {confirmOptions?.title}
                    </DialogTitle>
                    <DialogContent sx={{ p: 0, mt: 2 }}>
                        <DialogContentText sx={{ textAlign: 'center', color: 'text.secondary' }}>
                            {confirmOptions?.message}
                        </DialogContentText>
                    </DialogContent>
                </Box>
                <DialogActions sx={{ p: 2, justifyContent: 'center', gap: 1 }}>
                    <Button 
                        onClick={handleConfirmCancel} 
                        disabled={isConfirming}
                        variant="outlined"
                        sx={{ 
                            borderRadius: 2, 
                            px: 3, 
                            fontWeight: 'bold',
                            borderColor: alpha(theme.palette.divider, 0.5)
                        }}
                    >
                        {confirmOptions?.cancelText || 'Cancel'}
                    </Button>
                    <Button 
                        onClick={handleConfirmOk} 
                        disabled={isConfirming}
                        variant="contained"
                        color={confirmOptions?.isDangerous ? 'error' : (confirmOptions?.severity || 'primary')}
                        autoFocus
                        startIcon={isConfirming ? <CircularProgress size={20} color="inherit" /> : null}
                        sx={{ 
                            borderRadius: 2, 
                            px: 3, 
                            fontWeight: 'bold',
                            boxShadow: theme.shadows[4]
                        }}
                    >
                        {confirmOptions?.confirmText || 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>
        </NotificationContext.Provider>
    );
};
