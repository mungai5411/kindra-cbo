import { AppBar, Box, Toolbar, Button, Container, useTheme, alpha, IconButton, Drawer, List, ListItem, ListItemText, Divider, Typography, Stack } from '@mui/material';
import { Menu as MenuIcon, Close } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthModal } from '../../contexts/AuthModalContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../features/auth/authSlice';
import bgLogo from '../../assets/logo.jpg';
const logo = bgLogo;


const NAV_ITEMS = [
    { label: 'About', path: '/about' },
    { label: 'Stories', path: '/stories' },
    { label: 'Impact', path: '/#impact' },
    { label: 'Donate', path: '/donate' },
];

export const Navbar = () => {
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { openLoginModal, openRegisterModal } = useAuthModal();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
        setMobileOpen(false);
    };

    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
            return;
        }
        setMobileOpen(open);
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                background: scrolled ? alpha(theme.palette.background.paper, 0.8) : 'transparent',
                backdropFilter: scrolled ? 'blur(10px)' : 'none',
                boxShadow: scrolled ? theme.shadows[1] : 'none',
                transition: 'all 0.3s ease-in-out',
                color: scrolled || location.pathname !== '/' ? 'text.primary' : 'white'
            }}
        >
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
                    {/* Logo Section */}
                    <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit' }}>
                        <Box
                            component="img"
                            src={logo}
                            alt="Kindra Logo"
                            sx={{
                                height: 45,
                                width: 'auto',
                                objectFit: 'contain',
                                borderRadius: 1
                            }}
                        />
                    </Box>


                    {/* Desktop Navigation */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 4 }}>
                        {NAV_ITEMS.map((item) => (
                            <Typography
                                key={item.label}
                                component={Link}
                                to={item.path}
                                variant="body2"
                                sx={{
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    fontWeight: 600,
                                    position: 'relative',
                                    '&:after': {
                                        content: '""',
                                        position: 'absolute',
                                        width: '0%',
                                        height: '2px',
                                        bottom: -4,
                                        left: 0,
                                        bgcolor: 'primary.main',
                                        transition: 'width 0.3s'
                                    },
                                    '&:hover': {
                                        color: 'primary.main',
                                        '&:after': { width: '100%' }
                                    }
                                }}
                            >
                                {item.label}
                            </Typography>
                        ))}

                        <Stack direction="row" spacing={2}>
                            {isAuthenticated ? (
                                <>
                                    <Button
                                        component={Link}
                                        to="/dashboard/overview"
                                        variant="outlined"
                                        color="primary"
                                        size="medium"
                                        sx={{
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            borderRadius: '50px',
                                        }}
                                    >
                                        Dashboard
                                    </Button>
                                    <Button
                                        color="inherit"
                                        onClick={handleLogout}
                                        size="medium"
                                        sx={{
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        color="inherit"
                                        onClick={openLoginModal}
                                        size="medium"
                                        sx={{
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        Sign In
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => openRegisterModal('VOLUNTEER')}
                                        size="medium"
                                        sx={{
                                            borderRadius: '50px',
                                            px: 3,
                                            boxShadow: theme.shadows[4],
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            bgcolor: scrolled ? 'primary.main' : 'common.white',
                                            color: scrolled ? 'common.white' : 'primary.main',
                                            '&:hover': {
                                                bgcolor: scrolled ? 'primary.dark' : alpha(theme.palette.common.white, 0.9),
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        Get Involved
                                    </Button>
                                </>
                            )}
                        </Stack>
                    </Box>

                    {/* Hamburger Menu Button (Mobile Only) */}
                    <IconButton
                        sx={{
                            display: { xs: 'flex', md: 'none' },
                            color: 'inherit',
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.1)
                            }
                        }}
                        onClick={toggleDrawer(true)}
                    >
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </Container>

            {/* Floating Menu Drawer */}
            <Drawer
                anchor="top"
                open={mobileOpen}
                onClose={toggleDrawer(false)}
                PaperProps={{
                    sx: {
                        width: 240,
                        height: 'auto',
                        maxHeight: 'calc(100vh - 100px)',
                        position: 'fixed',
                        top: '70px !important',
                        right: '16px !important',
                        bottom: 'auto !important',
                        left: 'auto !important',
                        borderRadius: 3,
                        bgcolor: 'background.paper',
                        backgroundImage: 'none',
                        boxShadow: (theme) => theme.shadows[8],
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden'
                    }
                }}
                ModalProps={{
                    keepMounted: true,
                    BackdropProps: {
                        sx: {
                            bgcolor: 'rgba(0,0,0,0.1)',
                            backdropFilter: 'blur(2px)'
                        }
                    }
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        bgcolor: alpha(theme.palette.primary.main, 0.04)
                    }}>
                        <Box
                            component="img"
                            src={logo}
                            alt="Kindra Logo"
                            sx={{
                                height: 28,
                                width: 'auto',
                                objectFit: 'contain',
                                borderRadius: 1
                            }}
                        />
                        <IconButton
                            onClick={toggleDrawer(false)}
                            size="small"
                            sx={{
                                p: 0.5,
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    color: 'error.main'
                                }
                            }}
                        >
                            <Close fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* Navigation Links */}
                    <List sx={{ px: 1.5, py: 1.5 }}>
                        {NAV_ITEMS.map((item) => (
                            <ListItem
                                key={item.label}
                                component={Link}
                                to={item.path}
                                onClick={toggleDrawer(false)}
                                sx={{
                                    color: 'text.primary',
                                    borderRadius: 1.5,
                                    mb: 0.25,
                                    py: 0.75,
                                    transition: 'all 0.2s',
                                    bgcolor: location.pathname === item.path ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.12)
                                    }
                                }}
                            >
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontWeight: location.pathname === item.path ? 700 : 500,
                                        color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>

                    <Divider sx={{ mx: 2 }} />

                    {/* CTA Buttons */}
                    <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {isAuthenticated ? (
                            <>
                                <Button
                                    fullWidth
                                    component={Link}
                                    to="/dashboard/overview"
                                    variant="contained"
                                    onClick={() => setMobileOpen(false)}
                                    size="small"
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        py: 0.5,
                                    }}
                                >
                                    Go to Dashboard
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    color="error"
                                    onClick={handleLogout}
                                    size="small"
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        py: 0.5,
                                    }}
                                >
                                    Log Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={() => {
                                        setMobileOpen(false);
                                        openLoginModal();
                                    }}
                                    size="small"
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        py: 0.5,
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    Sign In
                                </Button>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => {
                                        setMobileOpen(false);
                                        openRegisterModal('VOLUNTEER');
                                    }}
                                    size="small"
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        py: 0.5,
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    Get Involved
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>
            </Drawer>
        </AppBar>
    );
};
