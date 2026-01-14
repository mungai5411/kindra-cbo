/**
 * About Us Page
 * Showcasing the organization's mission, story, and team with premium styling.
 */

import { Box, Container, Typography, Grid, Card, Avatar, useTheme, alpha } from '@mui/material';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Navbar } from '../components/public/Navbar';
import { VolunteerActivism, Handshake, Lightbulb, Groups } from '@mui/icons-material';

const MotionBox = motion(Box);


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

export default function AboutPage() {
    const theme = useTheme();
    const { scrollY } = useScroll();
    const yHero = useTransform(scrollY, [0, 300], [0, 100]);

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', overflow: 'hidden' }}>
            <Navbar />

            {/* Hero Section */}
            <Box sx={{
                position: 'relative',
                height: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '150px',
                    background: `linear-gradient(to top, ${theme.palette.background.default}, transparent)`,
                }
            }}>
                <MotionBox
                    style={{ y: yHero }}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 0,
                        backgroundImage: 'url("https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=2070")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'brightness(0.5)'
                    }}
                />

                <Container sx={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white' }}>
                    <MotionBox
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 4, opacity: 0.8 }}>
                            WHO WE ARE
                        </Typography>
                        <Typography variant="h1" sx={{ fontWeight: 900, fontSize: { xs: '3rem', md: '5rem' }, mb: 2 }}>
                            Driven by <span style={{ color: theme.palette.primary.main }}>Compassion</span>.
                        </Typography>
                        <Typography variant="h5" sx={{ maxWidth: 700, mx: 'auto', opacity: 0.9, fontWeight: 300 }}>
                            We are more than an organization. We are a movement dedicated to restoring hope and building a future where every child can thrive.
                        </Typography>
                    </MotionBox>
                </Container>
            </Box>

            {/* Mission & Vision */}
            <Container maxWidth="lg" sx={{ py: 10, mt: -10, position: 'relative', zIndex: 2 }}>
                <Grid container spacing={4}>
                    {[
                        { title: "Our Mission", icon: <VolunteerActivism />, text: "To empower vulnerable communities through sustainable education, healthcare, and economic support systems.", color: theme.palette.primary.main },
                        { title: "Our Vision", icon: <Lightbulb />, text: "A world where every family has the resources, dignity, and opportunity to build a prosperous future.", color: theme.palette.secondary.main },
                        { title: "Our Values", icon: <Handshake />, text: "Integrity, Transparency, Community-First Action, and Unwavering Commitment to Impact.", color: theme.palette.success.main }
                    ].map((item, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <MotionBox
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                            >
                                <Card sx={{
                                    height: '100%',
                                    p: { xs: 2.5, sm: 3 },
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                                    backdropFilter: 'blur(20px)',
                                    boxShadow: theme.shadows[1],
                                    border: '1px solid',
                                    borderColor: alpha(item.color, 0.15),
                                    transition: 'transform 0.3s',
                                    '&:hover': { transform: 'translateY(-6px)', boxShadow: theme.shadows[4] }
                                }}>
                                    <Avatar sx={{ bgcolor: alpha(item.color, 0.1), color: item.color, width: 60, height: 60, mb: 3 }}>
                                        {item.icon}
                                    </Avatar>
                                    <Typography variant="h4" fontWeight="800" gutterBottom>{item.title}</Typography>
                                    <Typography variant="body1" color="text.secondary" lineHeight={1.8}>{item.text}</Typography>
                                </Card>
                            </MotionBox>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Our Story Section */}
            <Box sx={{ py: 10, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <Container maxWidth="md">
                    <MotionBox
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        sx={{ textAlign: 'center', mb: 8 }}
                    >
                        <Groups sx={{ fontSize: 60, color: 'primary.main', mb: 2, opacity: 0.5 }} />
                        <Typography variant="h3" fontWeight="900" gutterBottom>The Kindra Story</Typography>
                        <Box sx={{ width: 60, height: 6, bgcolor: 'primary.main', mx: 'auto', borderRadius: 3, mb: 4 }} />

                        <Typography variant="body1" paragraph sx={{ fontSize: '1.2rem', color: 'text.secondary', lineHeight: 2 }}>
                            Founded in 2025, Kindra CBO began as a small group of neighbors in Nairobi concerned about the increasing number of vulnerable children in their community. What started as a weekly food drive quickly evolved into a comprehensive support network.
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ fontSize: '1.2rem', color: 'text.secondary', lineHeight: 2 }}>
                            Today, we partner with over 50 local schools and healthcare providers, bridging the gap between resources and those who need them most. Our journey is proof that when a community unites with a shared purpose, transformation is not just possible—it is inevitable.
                        </Typography>
                    </MotionBox>
                </Container>
            </Box>

            {/* Our Team Section */}
            <Container maxWidth="lg" id="team" sx={{ py: 12 }}>
                <Box sx={{ textAlign: 'center', mb: 10 }}>
                    <Typography variant="overline" color="primary" fontWeight="bold">LEADERSHIP</Typography>
                    <Typography variant="h2" fontWeight="900">Meet Our Team</Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
                        The passionate individuals working behind the scenes to make our mission a reality.
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {TEAM.map((member, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <MotionBox
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card sx={{
                                    textAlign: 'center',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: 'none',
                                    boxShadow: 'none',
                                    bgcolor: 'transparent'
                                }}>
                                    <Box sx={{ mb: 3, position: 'relative', display: 'inline-block' }}>
                                        <Box
                                            component="img"
                                            src={member.image}
                                            alt={member.name}
                                            sx={{
                                                width: 200,
                                                height: 200,
                                                borderRadius: 2,
                                                objectFit: 'cover',
                                                boxShadow: theme.shadows[10],
                                                border: '4px solid',
                                                borderColor: 'background.paper'
                                            }}
                                        />
                                        <Box sx={{
                                            position: 'absolute',
                                            bottom: 10,
                                            right: 10,
                                            bgcolor: 'primary.main',
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            boxShadow: 3
                                        }}>
                                            <Handshake fontSize="small" />
                                        </Box>
                                    </Box>
                                    <Typography variant="h5" fontWeight="bold">{member.name}</Typography>
                                    <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom>{member.role}</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                                        {member.bio}
                                    </Typography>
                                </Card>
                            </MotionBox>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
