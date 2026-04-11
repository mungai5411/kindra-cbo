/**
 * Mission & Values Section Component
 * Establishes organizational purpose with visual hierarchy
 * Mobile-first design with clear value proposition
 */

import React from 'react';
import { Box, Container, Grid, Card, Typography, alpha, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { CheckCircle, Public, Insights, VerifiedUser, Handshake } from '@mui/icons-material';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

interface ValueProps {
  title: string;
  description: string;
  delay: number;
}

const ValueCard: React.FC<ValueProps> = ({ title, description, delay }) => {
  return (
    <MotionCard
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.3 }}
      elevation={0}
      sx={{
        background: 'transparent',
        border: 'none',
        p: 0,
        display: 'flex',
        gap: 2,
        textAlign: 'left'
      }}
    >
      <CheckCircle
        sx={{
          color: 'secondary.main',
          fontSize: '1.5rem',
          flexShrink: 0,
          mt: 0.25
        }}
      />
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
          {description}
        </Typography>
      </Box>
    </MotionCard>
  );
};

export const MissionAndValues: React.FC = () => {
  const values = [
    {
      title: 'Community-Driven',
      description: 'We believe in the power of communities to solve their own problems. Our approach prioritizes local leadership and ownership.',
      delay: 0
    },
    {
      title: 'Transparent',
      description: 'We maintain complete transparency about our work, finances, and impact. Every donation is tracked and reported with full accountability.',
      delay: 0.1
    },
    {
      title: 'Sustainable',
      description: 'We focus on long-term solutions that create lasting change, not quick fixes. Our programs are designed for sustainability and scale.',
      delay: 0.2
    },
    {
      title: 'Child-Centered',
      description: 'Every decision we make puts children\'s rights, safety, and wellbeing at the center. We follow international child protection standards.',
      delay: 0.3
    }
  ];

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
          {/* Left: Mission Statement */}
          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  mb: 1
                }}
              >
                Our Foundation
              </Typography>

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  mb: 3,
                  fontSize: { xs: '1.8rem', md: '2.4rem' }
                }}
              >
                Driven by <Box component="span" sx={{ color: 'secondary.main' }}>Purpose</Box>, Guided by <Box component="span" sx={{ color: 'primary.main' }}>Values</Box>
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.8,
                  mb: 3,
                  fontSize: { xs: '0.95rem', md: '1.1rem' }
                }}
              >
                Kindra CBO exists to transform the lives of vulnerable children and families across Kenya through sustainable, community-driven initiatives that prioritize compassion, transparency, and long-term impact.
              </Typography>

              <Stack spacing={2}>
                {values.map((value, index) => (
                  <ValueCard key={index} {...value} />
                ))}
              </Stack>
            </MotionBox>
          </Grid>

          {/* Right: Visual Element */}
          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              viewport={{ once: true, amount: 0.3 }}
              sx={{
                position: 'relative',
                height: { xs: '300px', md: '400px' },
                perspective: '1000px'
              }}
            >
              {/* Background Cards with Gradient */}
               <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.primary.light} 100%)`,
                  borderRadius: 3,
                  opacity: 0.08,
                  transform: 'rotate(-2deg) scale(1.05)',
                  zIndex: 0
                }}
              />

              <Box
                sx={{
                  position: 'absolute',
                  top: 20,
                  left: 20,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
                  borderRadius: 3,
                  opacity: 0.04,
                  zIndex: 0
                }}
              />

              {/* Main Content Card */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.08)})`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  borderRadius: 3,
                  p: { xs: 3, md: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  zIndex: 1
                }}
              >
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                    est. 2023
                  </Typography>
                  <Box sx={{
                    display: 'inline-block',
                    px: 2,
                    py: 1,
                    bgcolor: alpha(theme.palette.secondary.main, 0.15),
                    borderRadius: 2,
                    mb: 2
                  }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                      ✓ REGISTERED & VERIFIED
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={2}>
                  {[
                    { text: 'Operating across Kenya', icon: <Public sx={{ fontSize: '1.2rem', color: 'primary.main' }} /> },
                    { text: 'Real-time impact tracking', icon: <Insights sx={{ fontSize: '1.2rem', color: 'secondary.main' }} /> },
                    { text: 'Full transparency & accountability', icon: <VerifiedUser sx={{ fontSize: '1.2rem', color: 'primary.main' }} /> },
                    { text: '500+ partnerships', icon: <Handshake sx={{ fontSize: '1.2rem', color: 'secondary.main' }} /> }
                  ].map((stat, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {stat.icon}
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        {stat.text}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </MotionBox>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
