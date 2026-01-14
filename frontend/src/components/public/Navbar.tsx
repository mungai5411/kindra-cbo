import { AppBar, Box, Toolbar, Button, Container, useTheme, alpha, IconButton, Drawer, List, ListItem, ListItemText, Divider } from '@mui/material';
import { Menu as MenuIcon, Close } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthModal } from '../../contexts/AuthModalContext';
import logo from '../../assets/logo.jpg';


const NAV_ITEMS = [
    { label: 'Stories', path: '/stories' },
    { label: 'Donate', path: '/donate' },
];

export const Navbar = () => {
    const theme = useTheme();
    const location = useLocation();
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

                    {/* Hamburger Menu Button (All Screens) */}
                    <IconButton
                        sx={{
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
                    </Box>
                </Box>
            </Drawer>
        </AppBar>
    );
};
