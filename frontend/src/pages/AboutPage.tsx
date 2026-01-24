import { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, Avatar, useTheme, alpha, Stack, Paper, Divider, CircularProgress } from '@mui/material';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/public/Navbar';
import { VolunteerActivism, Handshake, Lightbulb, Groups, AssignmentTurnedIn, Public, TrendingUp, Favorite } from '@mui/icons-material';
import { glassCard, gradientText, glassColors } from '../theme/glassmorphism';
import apiClient from '../api/client';

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

const FALLBACK_TEAM = [
    {
        name: "Sarah Johnson",
        role: "Executive Director",
        bio: "Former UN relief coordinator with 15 years of experience in community development.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"
    }
];

const VALUES = [
    { title: "Transparency", icon: <AssignmentTurnedIn />, desc: "Complete openness in all our financial and operational processes." },
    { title: "Inclusivity", icon: <Groups />, desc: "Serving all children regardless of background, gender, or belief." },
    { title: "Sustainability", icon: <Public />, desc: "Long-term solutions that empower children for a lifetime." },
    { title: "Integrity", icon: <Handshake />, desc: "Upholding the highest ethical standards in every single action." }
];

export default function AboutPage() {
    const theme = useTheme();
    const { scrollY } = useScroll();
    const yHero = useTransform(scrollY, [0, 400], [0, 150]);
    const opacityHero = useTransform(scrollY, [0, 300], [1, 0]);

    const [team, setTeam] = useState<any[]>([]);
    const [content, setContent] = useState<{ [key: string]: any }>({});
    const [loading, setLoading] = useState(true);

    const getContent = (key: string, fallback: string) => content[key]?.content || fallback;
    const getValue = (key: string, fallback: string) => content[key]?.value || fallback;
    const getTitle = (key: string, fallback: string) => content[key]?.title || fallback;

    useEffect(() => {
        const loadAll = async () => {
            try {
                const [teamRes, contentRes] = await Promise.all([
                    apiClient.get('/blog/team/'),
                    apiClient.get('/blog/content/?is_active=true')
                ]);

                const teamData = teamRes.data.results || teamRes.data;
                setTeam(teamData.length > 0 ? teamData : FALLBACK_TEAM);

                const contentData = contentRes.data.results || contentRes.data;
                const contentMap = contentData.reduce((acc: any, item: any) => {
                    acc[item.key] = item;
                    return acc;
                }, {});
                setContent(contentMap);
            } catch (err) {
                console.error('Failed to sync page content:', err);
                setTeam(FALLBACK_TEAM);
            } finally {
                setLoading(false);
            }
        };
        loadAll();
    }, []);

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', overflow: 'hidden' }}>
            <Navbar />

            {/* Premium Hero Section - Squeezed */}
            <Box sx={{
                position: 'relative',
                height: { xs: '45vh', md: '55vh' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                background: glassColors.primaryBgLight(alpha)
            }}>
                <MotionBox
                    style={{ y: yHero, opacity: opacityHero }}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 0,
                        backgroundImage: 'url("https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: `linear-gradient(to bottom, ${alpha(theme.palette.background.default, 0.4)}, ${theme.palette.background.default})`,
                        }
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <AnimatePresence>
                        <MotionBox
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <Typography
                                variant="overline"
                                sx={{
                                    fontWeight: 900,
                                    letterSpacing: 4,
                                    color: 'primary.main',
                                    display: 'block',
                                    mb: 1,
                                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                {getContent('about-hero-overline', 'OUR JOURNEY OF HOPE')}
                            </Typography>
                            <MotionTypography
                                variant="h1"
                                sx={{
                                    ...gradientText(glassColors.primaryGradient),
                                    fontSize: { xs: '2.5rem', md: '4rem' },
                                    mb: 2,
                                    lineHeight: 1.1
                                }}
                            >
                                {getContent('about-hero-title', 'Driven by Compassion.')}
                            </MotionTypography>
                            <Typography
                                variant="h6"
                                sx={{
                                    maxWidth: 700,
                                    mx: 'auto',
                                    color: 'text.secondary',
                                    fontWeight: 500,
                                    lineHeight: 1.5,
                                    px: 2
                                }}
                            >
                                {getContent('about-hero-desc', 'Kindra CBO is a grassroots movement dedicated to restoring dignity and building a sustainable future where every child in Kenya can thrive.')}
                            </Typography>
                        </MotionBox>
                    </AnimatePresence>
                </Container>
            </Box>

            {/* Core Pillars Section - Squeezed */}
            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, mt: { xs: -4, md: -6 }, position: 'relative', zIndex: 2 }}>
                <Grid container spacing={3}>
                    {[
                        { title: getTitle('about-mission', 'Our Mission'), icon: <VolunteerActivism />, text: getContent('about-mission', "To empower vulnerable communities through sustainable social, health, and economic support systems."), color: theme.palette.primary.main, delay: 0 },
                        { title: getTitle('about-vision', 'Our Vision'), icon: <Lightbulb />, text: getContent('about-vision', "A world where every family has the resources, dignity, and opportunity to build their own prosperous future."), color: '#BE91BE', delay: 0.1 },
                        { title: getTitle('about-values', 'Our Values'), icon: <TrendingUp />, text: getContent('about-values', "Integrity, Radical Transparency, Community-First Action, and Unwavering Commitment to measurable Impact."), color: '#DBAAA7', delay: 0.2 }
                    ].map((item, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <MotionBox
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: item.delay, duration: 0.5 }}
                            >
                                <Paper sx={{
                                    ...glassCard(theme, 'elevated'),
                                    height: '100%',
                                    p: { xs: 3, md: 4 },
                                    borderRadius: 6,
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    borderColor: alpha(item.color, 0.2),
                                    '&:hover': {
                                        borderColor: item.color,
                                        transform: 'translateY(-8px)',
                                    }
                                }}>
                                    <Avatar sx={{
                                        bgcolor: alpha(item.color, 0.1),
                                        color: item.color,
                                        width: 60,
                                        height: 60,
                                        mb: 2,
                                        boxShadow: `0 6px 12px ${alpha(item.color, 0.15)}`
                                    }}>
                                        {item.icon}
                                    </Avatar>
                                    <Typography variant="h5" fontWeight="900" gutterBottom sx={{ letterSpacing: -0.5 }}>
                                        {item.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                        {item.text}
                                    </Typography>
                                </Paper>
                            </MotionBox>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Split Story Section - Squeezed */}
            <Box sx={{ py: { xs: 4, md: 8 }, position: 'relative', overflow: 'hidden' }}>
                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <MotionBox
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <Typography variant="overline" color="primary" sx={{ fontWeight: 900, letterSpacing: 2 }}>{getContent('about-genesis-overline', 'THE GENESIS')}</Typography>
                                <Typography variant="h3" fontWeight="900" sx={{ mb: 2, letterSpacing: -1 }}>{getTitle('about-genesis-story', 'The Kindra Story')}</Typography>
                                <Typography variant="body2" paragraph color="text.secondary" sx={{ fontSize: '1rem', lineHeight: 1.8 }}>
                                    {getContent('about-genesis-story', 'Founded in 2025, Kindra CBO began as a small group of neighbors in Nairobi concerned about the increasing number of vulnerable children in their community.')}
                                </Typography>
                                <Stack direction="row" spacing={3} sx={{ mt: 3 }}>
                                    <Box>
                                        <Typography variant="h4" color="primary" fontWeight="900">{getValue('about-stat-schools', '50+')}</Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight="700">PARTNER SCHOOLS</Typography>
                                    </Box>
                                    <Divider orientation="vertical" flexItem />
                                    <Box>
                                        <Typography variant="h4" color="secondary" fontWeight="900">{getValue('about-stat-impact', '10k+')}</Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight="700">LIVES IMPACTED</Typography>
                                    </Box>
                                </Stack>
                            </MotionBox>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <MotionBox
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                sx={{ position: 'relative' }}
                            >
                                <Box sx={{
                                    position: 'absolute',
                                    top: -10,
                                    right: -10,
                                    bottom: -10,
                                    left: -10,
                                    background: glassColors.secondaryGradient,
                                    borderRadius: 8,
                                    filter: 'blur(40px)',
                                    opacity: 0.1,
                                    zIndex: 0
                                }} />
                                <Card sx={{
                                    borderRadius: 6,
                                    overflow: 'hidden',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                    zIndex: 1,
                                    position: 'relative'
                                }}>
                                    <Box
                                        component="img"
                                        src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=2070"
                                        sx={{ width: '100%', height: 350, objectFit: 'cover' }}
                                    />
                                    <Box sx={{
                                        position: 'absolute',
                                        bottom: 20,
                                        left: 20,
                                        right: 20,
                                        p: 2,
                                        ...glassCard(theme),
                                        borderRadius: 3,
                                        color: 'text.primary'
                                    }}>
                                        <Typography variant="subtitle2" fontWeight="900" display="flex" alignItems="center" gap={1}>
                                            <Favorite color="error" fontSize="small" /> Community Impact
                                        </Typography>
                                    </Box>
                                </Card>
                            </MotionBox>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Minimal Values Grid - Squeezed */}
            <Box sx={{ py: 6, bgcolor: alpha(theme.palette.divider, 0.02) }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography variant="overline" color="primary" sx={{ fontWeight: 900, letterSpacing: 2 }}>CORE VALUES</Typography>
                        <Typography variant="h4" fontWeight="900">What Drives Us</Typography>
                    </Box>
                    <Grid container spacing={2}>
                        {VALUES.map((val, i) => (
                            <Grid item xs={12} sm={6} md={3} key={i}>
                                <Paper sx={{
                                    p: 3,
                                    borderRadius: 4,
                                    height: '100%',
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'rgba(0,0,0,0.05)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        boxShadow: '0 10px 20px rgba(0,0,0,0.03)',
                                        transform: 'translateY(-3px)'
                                    }
                                }}>
                                    <Box sx={{ color: 'primary.main', mb: 1.5, '& svg': { fontSize: 24 } }}>{val.icon}</Box>
                                    <Typography variant="h6" fontWeight="900" gutterBottom sx={{ fontSize: '1.1rem' }}>{val.title}</Typography>
                                    <Typography variant="caption" color="text.secondary" lineHeight={1.6} display="block">{val.desc}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Leadership Section - Squeezed */}
            <Container maxWidth="lg" id="team" sx={{ py: 8 }}>
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography variant="overline" color="secondary" sx={{ fontWeight: 900, letterSpacing: 2 }}>LEADERSHIP</Typography>
                    <Typography variant="h3" fontWeight="900" sx={{ letterSpacing: -1 }}>Meet Our Visionaries</Typography>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
                ) : (
                    <Grid container spacing={3}>
                        {team.map((member, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <MotionBox
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card sx={{
                                        textAlign: 'center',
                                        borderRadius: 6,
                                        p: 3,
                                        background: 'transparent',
                                        boxShadow: 'none',
                                        border: 'none',
                                        '&:hover img': {
                                            transform: 'scale(1.03)',
                                            borderColor: 'primary.main'
                                        }
                                    }}>
                                        <Box sx={{
                                            mb: 2,
                                            position: 'relative',
                                            width: 140,
                                            height: 140,
                                            mx: 'auto'
                                        }}>
                                            <Box
                                                component="img"
                                                src={member.image}
                                                alt={member.name}
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    border: '4px solid',
                                                    borderColor: alpha(theme.palette.secondary.light, 0.15),
                                                    transition: 'all 0.4s ease-out',
                                                    boxShadow: theme.shadows[4]
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="h6" fontWeight="900" sx={{ mb: 0.25, fontSize: '1.1rem' }}>{member.name}</Typography>
                                        <Typography variant="caption" color="secondary" fontWeight="800" sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>{member.role}</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ px: 1, lineHeight: 1.5, display: 'block' }}>
                                            {member.bio}
                                        </Typography>
                                    </Card>
                                </MotionBox>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>

            {/* Minimal Background Blobs */}
            <Box sx={{
                position: 'fixed',
                top: '10%',
                right: '-5%',
                width: 300,
                height: 300,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                filter: 'blur(80px)',
                zIndex: -1,
                pointerEvents: 'none'
            }} />
            <Box sx={{
                position: 'fixed',
                bottom: '10%',
                left: '-5%',
                width: 400,
                height: 400,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.secondary.main, 0.02),
                filter: 'blur(100px)',
                zIndex: -1,
                pointerEvents: 'none'
            }} />
        </Box>

    );
}
