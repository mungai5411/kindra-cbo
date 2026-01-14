/**
 * Kindra CBO - Modern Premium Home Page
 * Redesigned with Framer Motion, Glassmorphism, and Unified Theming
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import logo from '../assets/logo.jpg';
import { fetchPublicStats } from '../features/reporting/reportingSlice';
import {
    Container,
    Typography,
    Button,
    Box,
    Grid,
    Card,
    CardContent,
    useTheme,
    alpha,
    Avatar,
    Stack,
    // IconButton // Removed unused
} from '@mui/material';
import {

    School,
    HealthAndSafety,
    FamilyRestroom,
    Groups,
    TrendingUp,
    EmojiEvents,
    Favorite,
    PlayArrow,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Navbar } from '../components/public/Navbar';

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionGrid = motion(Grid);



const IMPACT_AREAS = [
    {
        title: 'Education Support',
        desc: 'Ensuring every child has access to quality learning and materials.',
        icon: <School sx={{ fontSize: 40 }} />,
        color: 'primary.main'
    },
    {
        title: 'Healthcare Access',
        desc: 'Providing vital medical care and health education to families.',
        icon: <HealthAndSafety sx={{ fontSize: 40 }} />,
        color: 'secondary.main'
    },
    {
        title: 'Community Programs',
        desc: 'Building sustainable infrastructure and support networks.',
        icon: <Groups sx={{ fontSize: 40 }} />,
        color: 'success.main'
    },
    {
        title: 'Family Support',
        desc: 'Direct intervention and case management for those in need.',
        icon: <FamilyRestroom sx={{ fontSize: 40 }} />,
        color: 'warning.main'
    },
];

export default function HomePage() {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { dashboardData } = useSelector((state: RootState) => state.reporting);

    useEffect(() => {
        dispatch(fetchPublicStats());
    }, [dispatch]);

    const statsData = dashboardData?.public || {};

    const STATS = [
        { value: statsData.children_supported ?? 0, label: 'Children Supported', icon: <School />, color: '#6366f1' },
        { value: statsData.families_helped ?? 0, label: 'Families Helped', icon: <FamilyRestroom />, color: '#14b8a6' },
        { value: statsData.active_volunteers ?? 0, label: 'Active Volunteers', icon: <Groups />, color: '#f59e0b' },
        { value: statsData.partner_organizations ?? 0, label: 'Partner Organizations', icon: <TrendingUp />, color: '#ec4899' },
    ];

    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);


    return (
        <Box sx={{ bgcolor: 'background.default', overflow: 'hidden' }}>
            <Navbar />

            {/* Hero Section */}
            <Box
                sx={{
                    position: 'relative',
                    minHeight: '80vh',
                    display: 'flex',
                    alignItems: 'center',
                    background: `radial-gradient(circle at 20% 30%, ${alpha(theme.palette.primary.light, 0.05)} 0%, transparent 60%), radial-gradient(circle at 80% 70%, ${alpha(theme.palette.secondary.light, 0.03)} 0%, transparent 60%), #f8f9fa`,
                    pt: 6,
                }}
            >
                {/* ... Hero Content ... */}
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} lg={7}>
                            {/* ... Content ... */}
                            <MotionBox
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                    <Box sx={{ px: 2, py: 0.5, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 700 }}>
                                        EST. 2023
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                        • REGIONAL IMPACT INITIATIVE
                                    </Typography>
                                </Stack>

                                <Typography
                                    variant="h1"
                                    sx={{
                                        fontWeight: 900,
                                        lineHeight: 1.1,
                                        mb: 2,
                                        fontSize: { xs: '2.5rem', md: '3.5rem' },
                                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    Empowering Lives, <br />
                                    Building Futures.
                                </Typography>

                                <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary', fontWeight: 500, lineHeight: 1.6, maxWidth: '600px' }}>
                                    Kindra CBO is dedicated to supporting vulnerable children and families across Kenya through sustainable, community-driven transformation.
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>

                                    <Button
                                        component="a"
                                        href="https://www.youtube.com/channel/UC_placeholder"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variant="outlined"
                                        size="medium"
                                        endIcon={<PlayArrow />}
                                        sx={{
                                            py: 1.5,
                                            px: 3,
                                            borderRadius: '10px',
                                            fontSize: '1rem',
                                            fontWeight: 700,
                                            borderWidth: '2px',
                                            '&:hover': { borderWidth: '2px', transform: 'translateY(-2px)', bgcolor: alpha(theme.palette.primary.main, 0.05) },
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        Watch Our Story
                                    </Button>
                                </Box>

                                <Stack direction="row" spacing={2} sx={{ mt: 4, alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex' }}>
                                        {[1, 2, 3].map(i => (
                                            <Avatar key={i} sx={{ border: '2px solid white', ml: i === 1 ? 0 : -1.5, width: 36, height: 36 }} />
                                        ))}
                                        <Box sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            border: '2px solid white',
                                            ml: -1.5
                                        }}>
                                            +50
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        <Box component="span" sx={{ color: 'primary.main' }}>50+ Active Volunteers</Box> joined this month
                                    </Typography>
                                </Stack>
                            </MotionBox>
                        </Grid>

                        <Grid item xs={12} lg={5} sx={{ display: { xs: 'none', lg: 'block' } }}>
                            <MotionBox
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                style={{ y: y1 }}
                                sx={{ position: 'relative' }}
                            >
                                {/* Decorative elements */}
                                <Box sx={{
                                    position: 'absolute',
                                    top: -40,
                                    right: -40,
                                    width: 200,
                                    height: 200,
                                    borderRadius: '50%',
                                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                    filter: 'blur(40px)',
                                    zIndex: 0
                                }} />

                                <Card sx={{
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                    boxShadow: '0 32px 64px rgba(0,0,0,0.1)',
                                    position: 'relative',
                                    zIndex: 1,
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.divider, 0.5)
                                }}>
                                    <Box
                                        component="img"
                                        src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop"
                                        sx={{ width: '100%', height: 350, objectFit: 'cover' }}
                                    />
                                    <Box sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        p: 4,
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)',
                                        color: 'common.white'
                                    }}>
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white', mb: 0.2 }}>Grace Community Center</Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', display: 'block' }}>Supporting mobile education in Nairobi slums</Typography>
                                    </Box>
                                </Card>

                                {/* Floating Stat Card */}
                                <MotionBox
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    sx={{
                                        position: 'absolute',
                                        top: '10%',
                                        left: -60,
                                        p: 2,
                                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: 4,
                                        boxShadow: theme.shadows[10],
                                        border: '1px solid',
                                        borderColor: alpha(theme.palette.primary.main, 0.2),
                                        zIndex: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2
                                    }}
                                >
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}>
                                        <Favorite />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">Impact Goal</Typography>
                                        <Typography variant="caption" color="text.secondary">85% Reached this year</Typography>
                                    </Box>
                                </MotionBox>
                            </MotionBox>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Stats Bar */}
            <Container maxWidth="lg" sx={{ mt: { xs: 2, md: -3 }, position: 'relative', zIndex: 10 }}>
                <MotionGrid
                    container
                    spacing={2}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    {STATS.map((stat, index) => (
                        <Grid item xs={6} md={3} key={index}>
                            <Card sx={{
                                textAlign: 'center',
                                p: 1,
                                borderRadius: 3,
                                background: alpha(theme.palette.background.paper, 0.9),
                                backdropFilter: 'blur(20px)',
                                border: '1px solid',
                                borderColor: alpha(theme.palette.divider, 0.4),
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                transition: 'all 0.3s'
                            }}>
                                <CardContent sx={{ '&:last-child': { pb: 1.5, px: 1 } }}>
                                    <Avatar sx={{
                                        mx: 'auto',
                                        mb: 1.5,
                                        bgcolor: alpha(stat.color, 0.1),
                                        color: stat.color,
                                        width: 40,
                                        height: 40,
                                    }}>
                                        {stat.icon}
                                    </Avatar>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                                        {stat.label}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </MotionGrid>
            </Container>

            {/* Impact Areas Section */}
            <Box id="impact" sx={{ py: 6, position: 'relative' }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <MotionTypography
                            variant="overline"
                            sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 2 }}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                        >
                            WHAT WE DO
                        </MotionTypography>
                        <MotionTypography
                            variant="h3"
                            sx={{ fontWeight: 800, mb: 1.5, fontSize: { xs: '2rem', md: '3rem' } }}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            Our Impact Areas
                        </MotionTypography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
                            We tackle the root causes of poverty through targeted interventions.
                        </Typography>
                    </Box>

                    <Grid container spacing={2}>
                        {IMPACT_AREAS.map((area, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <MotionBox
                                    whileHover={{ y: -5 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <Card sx={{
                                        height: '100%',
                                        p: 3,
                                        borderRadius: 3,
                                        border: '1px solid',
                                        borderColor: alpha(theme.palette.divider, 0.1),
                                        background: alpha(theme.palette.background.paper, 0.8),
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        '&:hover': { bgcolor: 'background.paper', boxShadow: theme.shadows[4], borderColor: (area.title === 'Education Support' ? theme.palette.success.main : area.color) }
                                    }}>
                                        <Box sx={{ color: (area.title === 'Education Support' ? 'success.main' : area.color), mb: 2 }}>
                                            {area.icon}
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '1rem' }}>
                                            {area.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                                            {area.desc}
                                        </Typography>
                                    </Card>
                                </MotionBox>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Why Partner Section */}
            <Box sx={{
                py: 8,
                bgcolor: alpha(theme.palette.divider, 0.05),
                borderRadius: { xs: 0, md: '60px 60px 0 0' }
            }}>
                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Box sx={{ position: 'relative' }}>
                                <Box sx={{
                                    position: 'absolute',
                                    top: -20,
                                    left: -20,
                                    width: 80,
                                    height: 80,
                                    bgcolor: 'primary.main',
                                    borderRadius: 3,
                                    zIndex: 0
                                }} />
                                <Box
                                    component="img"
                                    src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=2070&auto=format&fit=crop"
                                    sx={{
                                        width: '100%',
                                        height: 350,
                                        objectFit: 'cover',
                                        borderRadius: 8,
                                        position: 'relative',
                                        zIndex: 1,
                                        boxShadow: theme.shadows[20]
                                    }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800 }}>TRANSPARENCY & IMPACT</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 800, mb: 3 }}>Why Partner With Us</Typography>

                            <Stack spacing={3}>
                                {[
                                    { title: 'Data-Driven Results', icon: <TrendingUp />, desc: 'We track every shilling and its direct impact on the ground.' },
                                    { title: 'Community Centric', icon: <Groups />, desc: 'Our solutions are built with the community, not just for them.' },
                                    { title: 'Proven Track Record', icon: <EmojiEvents />, desc: 'Over 5 years of consistent transformation across the region.' },
                                ].map((item, i) => (
                                    <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 44, height: 44 }}>
                                            {item.icon}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">{item.title}</Typography>
                                            <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box sx={{ py: 8 }}>
                <Container maxWidth="md">
                    <Card sx={{
                        borderRadius: 6,
                        p: { xs: 3, md: 5 },
                        textAlign: 'center',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        color: 'white',
                        boxShadow: '0 24px 48px rgba(99, 102, 241, 0.3)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Decorative circles */}
                        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
                        <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />

                        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1.5, color: 'common.white', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                            Transform Lives Today
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3, opacity: 0.9, color: 'common.white', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                            Your support directly impacts vulnerable children and families. Every contribution brings hope, education, and opportunity to those who need it most.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">

                            <Button
                                variant="outlined"
                                size="medium"
                                component={Link}
                                to="/register"
                                sx={{
                                    borderColor: 'white',
                                    color: 'white',
                                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: '12px',
                                    fontWeight: 800,
                                    fontSize: '1rem',
                                    borderWidth: '2px'
                                }}
                            >
                                Start Volunteering
                            </Button>
                        </Stack>
                    </Card>
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{
                bgcolor: '#f0fdf4', // Light mint background
                pt: 8,
                pb: 4,
                borderTop: '1px solid',
                borderColor: 'rgba(0,0,0,0.05)'
            }}>
                <Container maxWidth="lg">
                    <Grid container spacing={8}>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ mb: 3 }}>
                                <Box component="img" src={logo} alt="Kindra CBO" sx={{ height: 70, objectFit: 'contain' }} />
                            </Box>
                            <Typography variant="body2" sx={{ mb: 4, lineHeight: 1.8, color: '#3f6212', maxWidth: '300px' }}>
                                Empowering vulnerable children and families in Kenya through sustainable community-driven transformation and support.
                            </Typography>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 3, color: '#14532d' }}>Organization</Typography>
                            <Stack spacing={2}>
                                {[
                                    { label: 'About Us', path: '/about' },
                                    { label: 'Our Team', path: '/about#team' },
                                    { label: 'Impact', path: '#impact', isScroll: true },
                                    { label: 'Stories', path: '/stories' }
                                ].map(item => (
                                    <Typography
                                        key={item.label}
                                        variant="body2"
                                        component={item.isScroll ? 'a' : Link}
                                        {...(item.isScroll ? { href: item.path } : { to: item.path })}
                                        sx={{
                                            textDecoration: 'none',
                                            color: '#3f6212',
                                            '&:hover': { color: '#15803d' },
                                            cursor: 'pointer',
                                            display: 'block'
                                        }}
                                    >
                                        {item.label}
                                    </Typography>
                                ))}
                            </Stack>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 3, color: '#14532d' }}>Support</Typography>
                            <Stack spacing={2}>
                                {[
                                    { label: 'Donate', path: '/donate' },
                                    { label: 'Volunteer', path: '/register?role=VOLUNTEER' },
                                    { label: 'Partner', path: '/register?role=SHELTER_PARTNER' },
                                    { label: 'Contact', path: 'mailto:hello@kindracbo.org', isExternal: true }
                                ].map(item => (
                                    <Typography
                                        key={item.label}
                                        variant="body2"
                                        component={item.isExternal ? 'a' : Link}
                                        {...(item.isExternal ? { href: item.path } : { to: item.path })}
                                        sx={{
                                            textDecoration: 'none',
                                            color: '#3f6212',
                                            '&:hover': { color: '#15803d' },
                                            display: 'block'
                                        }}
                                    >
                                        {item.label}
                                    </Typography>
                                ))}
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 3, color: '#14532d' }}>Newsletter</Typography>
                            <Typography variant="body2" sx={{ mb: 3, color: '#3f6212' }}>Get updates on our impact and new initiatives.</Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Box
                                    component="input"
                                    placeholder="Your email"
                                    sx={{
                                        p: '10px 16px',
                                        borderRadius: '50px',
                                        border: '1px solid',
                                        borderColor: 'rgba(0,0,0,0.1)',
                                        outline: 'none',
                                        flexGrow: 1,
                                        bgcolor: 'white',
                                        fontSize: '0.9rem',
                                        '&:focus': {
                                            borderColor: '#15803d',
                                            boxShadow: '0 0 0 2px rgba(21, 128, 61, 0.1)'
                                        }
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    sx={{
                                        borderRadius: '50px',
                                        px: 4,
                                        bgcolor: '#3f6212', // Darker green/olive
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        '&:hover': {
                                            bgcolor: '#14532d'
                                        }
                                    }}
                                >
                                    Join
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 8, pt: 3, borderTop: '1px solid', borderColor: 'rgba(0,0,0,0.05)', textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#3f6212', opacity: 0.8 }}>
                            © {new Date().getFullYear()} Kindra CBO. All rights reserved. Registered NGO in Kenya.
                        </Typography>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}
