/**
 * About Us Page
 * Showcasing the organization's mission, story, and team with premium styling.
 */

import { Box, Container, Typography, Grid, Card, Avatar, useTheme, alpha, Stack, Paper, Divider } from '@mui/material';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/public/Navbar';
import { VolunteerActivism, Handshake, Lightbulb, Groups, AssignmentTurnedIn, Public, TrendingUp, Favorite } from '@mui/icons-material';
import { glassCard, gradientText, glassColors } from '../theme/glassmorphism';

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

const TEAM = [
    {
        name: "Sarah Johnson",
        role: "Executive Director",
        bio: "Former UN relief coordinator with 15 years of experience in community development.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"
    },
    {
        name: "David Kimani",
        role: "Head of Operations",
        bio: "Dedicated to building sustainable logistical networks in rural Kenya.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"
    },
    {
        name: "Dr. Amani Okafor",
        role: "Health Program Lead",
        bio: "Pediatrician focused on preventative care and child nutrition initiatives.",
        image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=400"
    },
    {
        name: "James Ochieng",
        role: "Community Liaison",
        bio: "Connecting local leadership with resources to drive grassroots change.",
        image: "https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?auto=format&fit=crop&q=80&w=400"
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

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', overflow: 'hidden' }}>
            <Navbar />

            {/* Premium Hero Section */}
            <Box sx={{
                position: 'relative',
                height: { xs: '70vh', md: '85vh' },
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
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        >
                            <Typography
                                variant="overline"
                                sx={{
                                    fontWeight: 900,
                                    letterSpacing: 6,
                                    color: 'primary.main',
                                    display: 'block',
                                    mb: 2,
                                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                OUR JOURNEY OF HOPE
                            </Typography>
                            <MotionTypography
                                variant="h1"
                                sx={{
                                    ...gradientText(glassColors.primaryGradient),
                                    fontSize: { xs: '3.5rem', md: '6rem' },
                                    mb: 3,
                                    lineHeight: 1
                                }}
                            >
                                Driven by <br /> Compassion.
                            </MotionTypography>
                            <Typography
                                variant="h5"
                                sx={{
                                    maxWidth: 800,
                                    mx: 'auto',
                                    color: 'text.secondary',
                                    fontWeight: 500,
                                    lineHeight: 1.6,
                                    px: 2
                                }}
                            >
                                Kindra CBO is a grassroots movement dedicated to restoring dignity and building a sustainable future where every child in Kenya can thrive.
                            </Typography>
                        </MotionBox>
                    </AnimatePresence>
                </Container>

                {/* Decorative Scroll indicator icon could go here */}
            </Box>

            {/* Core Pillars Section */}
            <Container maxWidth="lg" sx={{ py: { xs: 8, md: 15 }, mt: { xs: -8, md: -15 }, position: 'relative', zIndex: 2 }}>
                <Grid container spacing={3}>
                    {[
                        { title: "Our Mission", icon: <VolunteerActivism />, text: "To empower vulnerable communities through sustainable social, health, and economic support systems.", color: theme.palette.primary.main, delay: 0 },
                        { title: "Our Vision", icon: <Lightbulb />, text: "A world where every family has the resources, dignity, and opportunity to build their own prosperous future.", color: '#BE91BE', delay: 0.1 },
                        { title: "Our Values", icon: <TrendingUp />, text: "Integrity, Radical Transparency, Community-First Action, and Unwavering Commitment to measurable Impact.", color: '#DBAAA7', delay: 0.2 }
                    ].map((item, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <MotionBox
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: item.delay, duration: 0.6 }}
                            >
                                <Paper sx={{
                                    ...glassCard(theme, 'elevated'),
                                    height: '100%',
                                    p: { xs: 4, md: 5 },
                                    borderRadius: 8,
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    borderColor: alpha(item.color, 0.2),
                                    '&:hover': {
                                        borderColor: item.color,
                                        transform: 'translateY(-12px)',
                                    }
                                }}>
                                    <Avatar sx={{
                                        bgcolor: alpha(item.color, 0.1),
                                        color: item.color,
                                        width: 80,
                                        height: 80,
                                        mb: 4,
                                        boxShadow: `0 8px 16px ${alpha(item.color, 0.2)}`
                                    }}>
                                        {item.icon}
                                    </Avatar>
                                    <Typography variant="h3" fontWeight="900" gutterBottom sx={{ fontSize: '1.75rem', letterSpacing: -1 }}>
                                        {item.title}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, fontSize: '1rem' }}>
                                        {item.text}
                                    </Typography>
                                </Paper>
                            </MotionBox>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Split Story Section */}
            <Box sx={{ py: { xs: 10, md: 20 }, position: 'relative', overflow: 'hidden' }}>
                <Container maxWidth="lg">
                    <Grid container spacing={8} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <MotionBox
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <Typography variant="overline" color="primary" sx={{ fontWeight: 900, letterSpacing: 4 }}>THE GENESIS</Typography>
                                <Typography variant="h2" fontWeight="900" sx={{ mb: 4, letterSpacing: -2 }}>The Kindra Story</Typography>
                                <Typography variant="body1" paragraph color="text.secondary" sx={{ fontSize: '1.2rem', lineHeight: 2 }}>
                                    Founded in 2025, Kindra CBO began as a small group of neighbors in Nairobi concerned about the increasing number of vulnerable children in their community.
                                </Typography>
                                <Typography variant="body1" paragraph color="text.secondary" sx={{ fontSize: '1.2rem', lineHeight: 2 }}>
                                    What started as a simple weekly food drive quickly evolved into a comprehensive digital support network, bridging the gap between resources and those who need them most. Today, we stand as a beacon of transparency and a catalyst for change.
                                </Typography>
                                <Stack direction="row" spacing={3} sx={{ mt: 5 }}>
                                    <Box>
                                        <Typography variant="h3" color="primary" fontWeight="900">50+</Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight="700">PARTNER SCHOOLS</Typography>
                                    </Box>
                                    <Divider orientation="vertical" flexItem />
                                    <Box>
                                        <Typography variant="h3" color="secondary" fontWeight="900">10k+</Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight="700">LIVES IMPACTED</Typography>
                                    </Box>
                                </Stack>
                            </MotionBox>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <MotionBox
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                sx={{ position: 'relative' }}
                            >
                                <Box sx={{
                                    position: 'absolute',
                                    top: -20,
                                    right: -20,
                                    bottom: -20,
                                    left: -20,
                                    background: glassColors.secondaryGradient,
                                    borderRadius: 10,
                                    filter: 'blur(60px)',
                                    opacity: 0.1,
                                    zIndex: 0
                                }} />
                                <Card sx={{
                                    borderRadius: 10,
                                    overflow: 'hidden',
                                    boxShadow: '0 40px 80px rgba(0,0,0,0.12)',
                                    zIndex: 1,
                                    position: 'relative'
                                }}>
                                    <Box
                                        component="img"
                                        src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=2070"
                                        sx={{ width: '100%', height: 500, objectFit: 'cover' }}
                                    />
                                    <Box sx={{
                                        position: 'absolute',
                                        bottom: 30,
                                        left: 30,
                                        right: 30,
                                        p: 3,
                                        ...glassCard(theme),
                                        borderRadius: 4,
                                        color: 'text.primary'
                                    }}>
                                        <Typography variant="subtitle1" fontWeight="900" display="flex" alignItems="center" gap={1}>
                                            <Favorite color="error" fontSize="small" /> Community-Driven Impact
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">Building lasting change together.</Typography>
                                    </Box>
                                </Card>
                            </MotionBox>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Minimal Values Grid */}
            <Box sx={{ py: 15, bgcolor: alpha(theme.palette.divider, 0.03) }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 10 }}>
                        <Typography variant="overline" color="primary" sx={{ fontWeight: 900, letterSpacing: 4 }}>CORE VALUES</Typography>
                        <Typography variant="h3" fontWeight="900">What Drives Us</Typography>
                    </Box>
                    <Grid container spacing={3}>
                        {VALUES.map((val, i) => (
                            <Grid item xs={12} sm={6} md={3} key={i}>
                                <Paper sx={{
                                    p: 4,
                                    borderRadius: 6,
                                    height: '100%',
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'rgba(0,0,0,0.05)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                                        transform: 'translateY(-5px)'
                                    }
                                }}>
                                    <Box sx={{ color: 'primary.main', mb: 2 }}>{val.icon}</Box>
                                    <Typography variant="h5" fontWeight="900" gutterBottom>{val.title}</Typography>
                                    <Typography variant="body2" color="text.secondary" lineHeight={1.8}>{val.desc}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Leadership Section */}
            <Container maxWidth="lg" id="team" sx={{ py: 15 }}>
                <Box sx={{ textAlign: 'center', mb: 12 }}>
                    <Typography variant="overline" color="secondary" sx={{ fontWeight: 900, letterSpacing: 4 }}>LEADERSHIP</Typography>
                    <Typography variant="h2" fontWeight="900" sx={{ letterSpacing: -2 }}>Meet Our Visionaries</Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', mt: 3, fontWeight: 500 }}>
                        A collective of passionate experts dedicated to building sustainable community solutions.
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {TEAM.map((member, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <MotionBox
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card sx={{
                                    textAlign: 'center',
                                    borderRadius: 8,
                                    p: 4,
                                    background: 'transparent',
                                    boxShadow: 'none',
                                    border: 'none',
                                    '&:hover img': {
                                        transform: 'scale(1.05)',
                                        borderColor: 'primary.main'
                                    }
                                }}>
                                    <Box sx={{
                                        mb: 4,
                                        position: 'relative',
                                        width: 180,
                                        height: 180,
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
                                                border: '6px solid',
                                                borderColor: alpha(theme.palette.secondary.light, 0.2),
                                                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                                boxShadow: theme.shadows[10]
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="h5" fontWeight="900" sx={{ mb: 0.5 }}>{member.name}</Typography>
                                    <Typography variant="subtitle2" color="secondary" fontWeight="800" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>{member.role}</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ px: 1, lineHeight: 1.7 }}>
                                        {member.bio}
                                    </Typography>
                                </Card>
                            </MotionBox>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Minimal Background Blobs */}
            <Box sx={{
                position: 'fixed',
                top: '10%',
                right: '-5%',
                width: 400,
                height: 400,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                filter: 'blur(100px)',
                zIndex: -1,
                pointerEvents: 'none'
            }} />
            <Box sx={{
                position: 'fixed',
                bottom: '10%',
                left: '-5%',
                width: 500,
                height: 500,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.secondary.main, 0.03),
                filter: 'blur(120px)',
                zIndex: -1,
                pointerEvents: 'none'
            }} />
        </Box>
    );
}
