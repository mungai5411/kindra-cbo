import { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, Badge, Tooltip, useTheme, alpha, Menu, MenuItem, ListItemIcon, Divider, TextField } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Menu as MenuIcon, Notifications, Search, Logout, Settings } from '@mui/icons-material';
import { SettingsDrawer } from './SettingsDrawer';
import { NotificationsDrawer } from './NotificationsDrawer';

interface HeaderProps {
    handleDrawerToggle: () => void;
    user: any;
    handleLogout: () => void;
}

export const Header = ({ handleDrawerToggle, user, handleLogout }: HeaderProps) => {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const { unreadNotificationsCount } = useSelector((state: RootState) => state.auth);
    const open = Boolean(anchorEl);

    // Notifications count is now managed via Redux (authSlice)

    const handleNotificationsClick = () => {
        setNotificationsOpen(true);
    };

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSettingsClick = () => {
        setSettingsOpen(true);
        handleClose();
    };

    return (
        <>
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - 280px)` },
                    ml: { md: `280px` },
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(12px)',
                    color: 'text.primary',
                    boxShadow: 'none',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                <Toolbar sx={{
                    minHeight: { xs: '56px !important', sm: '64px !important' },
                    px: { xs: 1, sm: 2 }
                }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{
                            mr: { xs: 1, sm: 2 },
                            display: { xs: 'none', sm: 'inline-flex', md: 'none' }
                        }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Box sx={{ display: { xs: 'none', lg: 'flex' }, flexGrow: 1, maxWidth: 400, ml: 4 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search tasks, donors..."
                            InputProps={{
                                startAdornment: <Search fontSize="small" sx={{ mr: 1, opacity: 0.5 }} />,
                                sx: {
                                    borderRadius: 3,
                                    bgcolor: alpha(theme.palette.common.black, 0.03),
                                    '& fieldset': { border: 'none' },
                                    '&:hover': { bgcolor: alpha(theme.palette.common.black, 0.05) }
                                }
                            }}
                        />
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 } }}>


                        <Tooltip title="Community Updates">
                            <IconButton
                                onClick={handleNotificationsClick}
                                color="inherit"
                                sx={{
                                    border: { xs: 'none', sm: '1px solid' },
                                    borderColor: 'divider',
                                    borderRadius: '8px',
                                    p: { xs: 1, sm: 1.25 }
                                }}
                            >
                                <Badge badgeContent={unreadNotificationsCount} color="error" variant="standard">
                                    <Notifications fontSize="small" />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            ml: { xs: 0.5, sm: 1 },
                            gap: { xs: 1, sm: 1.5 },
                            pl: { xs: 1, sm: 2 },
                            borderLeft: '1px solid',
                            borderColor: 'divider'
                        }}>
                            <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                                <Typography variant="subtitle2" sx={{ lineHeight: 1.2, fontWeight: 600 }}>
                                    {user?.firstName} {user?.lastName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                    {user?.role || 'User'}
                                </Typography>
                            </Box>

                            <Tooltip title="Account Settings">
                                <IconButton
                                    onClick={handleClick}
                                    size="small"
                                    sx={{ ml: 0.5, p: 0 }}
                                    aria-controls={open ? 'account-menu' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={open ? 'true' : undefined}
                                >
                                    <Avatar
                                        src={user?.profile_picture}
                                        sx={{
                                            width: { xs: 32, sm: 40 },
                                            height: { xs: 32, sm: 40 },
                                            border: '2px solid',
                                            borderColor: 'primary.main',
                                            transition: 'all 0.2s',
                                            '&:hover': { transform: 'scale(1.05)' }
                                        }}
                                    >
                                        {user?.firstName?.[0]}
                                    </Avatar>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>

            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleSettingsClick}>
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleClose(); handleLogout(); }}>
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>

            <SettingsDrawer
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                user={user}
            />

            <NotificationsDrawer
                open={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                user={user}
            />
        </>
    );
};
