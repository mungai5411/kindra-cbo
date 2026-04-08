/**
 * Modern About Page
 * Showcases organization history, team, and impact
 * Mobile-first responsive design with Higherlife inspiration
 */

import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Avatar, Stack, alpha, useTheme, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Navbar } from '../components/public/Navbar';
import { Link } from 'react-router-dom';
import { ArrowForward } from '@mui/icons-material';
import { colorPsychology } from '../theme/colorPsychology';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

interface TeamMemberProps {
  name: string;
  role: string;
  image?: string;
  bio: string;
  delay: number;
}

const TeamMember: React.FC<TeamMemberProps> = ({ name, role, image, bio, delay }) => (
  <MotionCard
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    viewport={{ once: true, amount: 0.3 }}
    elevation={0}
    sx={{
      background: `linear-gradient(135deg, ${alpha(colorPsychology.programs.cases.primary, 0.08)}, ${alpha(colorPsychology.programs.donations.primary, 0.05)})`,
      border: `1px solid ${alpha(colorPsychology.programs.cases.primary, 0.15)}`,
      borderRadius: 3,
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: `0 12px 32px ${alpha(colorPsychology.programs.cases.primary, 0.1)}`
      }
    }}
  >
    <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
      <Avatar
        src={image}
        sx={{
          width: 80,
          height: 80,
          margin: '0 auto',
          mb: 2,
          bgcolor: colorPsychology.programs.cases.primary,
          fontSize: '2rem'
        }}
      >
        {name.charAt(0)}
      </Avatar>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
        {name}
      </Typography>

      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          color: colorPsychology.programs.volunteers.primary,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'block',
          mb: 1.5
        }}
      >
        {role}
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
        {bio}
      </Typography>
    </CardContent>
  </MotionCard>
);

interface MilestoneProps {
  year: string;
  title: string;
  description: string;
  delay: number;
}

const TimelineMilestone: React.FC<MilestoneProps> = ({ year, title, description, delay }) => (
  <MotionBox
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    viewport={{ once: true, amount: 0.3 }}
    sx={{
      display: 'flex',
      gap: 2,
      mb: 3,
      position: 'relative',
      pl: 3,
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: '1.5rem',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        bgcolor: colorPsychology.programs.cases.primary
      }
    }}
  >
    <Box>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          color: colorPsychology.programs.cases.primary,
          mb: 0.5
        }}
      >
        {year}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
        {description}
      </Typography>
    </Box>
  </MotionBox>
);

export default function AboutPage() {
  const theme = useTheme();

  const teamMembers: TeamMemberProps[] = [
    {
      name: 'Sarah Kipchoge',
      role: 'Executive Director',
      bio: 'Visionary leader with 15+ years experience in community development and child welfare.',
      delay: 0
    },
    {
      name: 'James Mwangi',
      role: 'Programs Director',
      bio: 'Passionate advocate for sustainable development and community-led change initiatives.',
      delay: 0.1
    },
    {
      name: 'Grace Ochieng',
      role: 'Operations Manager',
      bio: 'Ensures seamless program delivery and operational excellence across all initiatives.',
      delay: 0.2
    }
  ];

  const milestones: MilestoneProps[] = [
    {
      year: '2023',
      title: 'Foundation Established',
      description: 'Kindra CBO registered and began operations focused on vulnerable children in Kenya.',
      delay: 0
    },
    {
      year: '2024',
      title: 'Program Expansion',
      description: 'Opened 5 new program centers and reached 2,500 children in need.',
      delay: 0.1
    },
    {
      year: '2025',
      title: 'Community Impact',
      description: 'Engaged 450+ volunteers and established partnerships with 25 shelter homes.',
      delay: 0.2
    }
  ];

  const values = [
    {
      icon: '❤️',
      title: 'Compassion',
      description: 'We lead with empathy and genuine care for every individual we serve.'
    },
    {
      icon: '🔄',
      title: 'Sustainability',
      description: 'We build long-term solutions that create lasting positive change.'
    },
    {
      icon: '🤝',
      title: 'Community',
      description: 'We believe in the power of collective action and local leadership.'
    },
    {
      icon: '✨',
      title: 'Integrity',
      description: 'We maintain transparency and accountability in everything we do.'
    }
  ];

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      <Navbar />

      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colorPsychology.programs.cases.primary} 0%, ${colorPsychology.programs.donations.primary} 100%)`,
          py: { xs: 8, md: 12 },
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 20% 50%, ${alpha(theme.palette.common.white, 0.1)}, transparent)`,
            pointerEvents: 'none'
          }
        }}
      >
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          sx={{ position: 'relative', zIndex: 1 }}
        >
          <Container maxWidth="md">
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                mb: 2,
                opacity: 0.9
              }}
            >
              About Our Organization
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                mb: 2,
                fontSize: { xs: '2.2rem', md: '3rem' }
              }}
            >
              Our Story
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                opacity: 0.95,
                lineHeight: 1.7
              }}
            >
              Founded on the belief that every child deserves a chance at a better future, Kindra CBO works tirelessly to transform lives across Kenya.
            </Typography>
          </Container>
        </MotionBox>
      </Box>

      {/* Mission & Vision */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={{ xs: 4, md: 5 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: colorPsychology.programs.cases.primary,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  mb: 1
                }}
              >
                Our Mission
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
                Sustainable <Box component="span" sx={{ color: colorPsychology.programs.donations.primary }}>Community</Box> Transformation
              </Typography>
              <Typography sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3, fontSize: '1.05rem' }}>
                To empower vulnerable children and families across Kenya through integrated, sustainable development initiatives that prioritize education, health, economic empowerment, and psychosocial support.
              </Typography>
            </MotionBox>
          </Grid>

          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: colorPsychology.programs.volunteers.primary,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  mb: 1
                }}
              >
                Our Vision
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
                A Kenya Where <Box component="span" sx={{ color: colorPsychology.programs.cases.primary }}>Every Child</Box> Thrives
              </Typography>
              <Typography sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3, fontSize: '1.05rem' }}>
                A prosperous Kenya where every child, regardless of circumstance, has access to quality education, healthcare, economic opportunity, and the supportive environment needed to reach their full potential.
              </Typography>
            </MotionBox>
          </Grid>
        </Grid>
      </Container>

      {/* Core Values */}
      <Box sx={{ bgcolor: alpha(colorPsychology.programs.cases.primary, 0.03), py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: colorPsychology.programs.cases.primary,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                mb: 1
              }}
            >
              Core Values
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900 }}>
              What We <Box component="span" sx={{ color: colorPsychology.programs.cases.primary }}>Believe</Box>
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2.5, md: 3 }}>
            {values.map((value, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <MotionCard
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  elevation={0}
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    background: 'transparent',
                    border: 'none'
                  }}
                >
                  <Box sx={{ fontSize: '3rem', mb: 2 }}>{value.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {value.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    {value.description}
                  </Typography>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Timeline */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: colorPsychology.programs.cases.primary,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              mb: 1
            }}
          >
            Our Journey
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900 }}>
            Key <Box component="span" sx={{ color: colorPsychology.programs.cases.primary }}>Milestones</Box>
          </Typography>
        </Box>

        <Box sx={{ pl: { xs: 0, md: 3 }, borderLeft: { md: `2px solid ${alpha(colorPsychology.programs.cases.primary, 0.2)}` } }}>
          {milestones.map((milestone, i) => (
            <TimelineMilestone key={i} {...milestone} />
          ))}
        </Box>
      </Container>

      {/* Team */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: colorPsychology.programs.cases.primary,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              mb: 1
            }}
          >
            Leadership
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
            Meet the <Box component="span" sx={{ color: colorPsychology.programs.cases.primary }}>Team</Box>
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            Dedicated professionals committed to creating lasting change in vulnerable communities.
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2.5, md: 3 }}>
          {teamMembers.map((member, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <TeamMember {...member} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colorPsychology.programs.cases.primary} 0%, ${colorPsychology.programs.donations.primary} 100%)`,
          py: { xs: 6, md: 8 },
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
            Ready to Make an Impact?
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 4, opacity: 0.95 }}>
            Join our community of changemakers today.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              component={Link}
              to="/donate"
              variant="contained"
              sx={{
                bgcolor: 'white',
                color: colorPsychology.programs.cases.primary,
                fontWeight: 700,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                borderRadius: 2
              }}
              endIcon={<ArrowForward />}
            >
              Donate Now
            </Button>
            <Button
              component={Link}
              to="/volunteer"
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'white',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: alpha(theme.palette.common.white, 0.1)
                }
              }}
              endIcon={<ArrowForward />}
            >
              Volunteer
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
