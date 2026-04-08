/**
 * Hero Section Component
 * Modern, mobile-first hero with gradient background and CTAs
 * Inspired by Higherlife Foundation's impact messaging
 */

import React from 'react';
import { Box, Container, Typography, Button, alpha, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Favorite, ArrowForward } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { colorPsychology } from '../../theme/colorPsychology';

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

interface HeroSectionProps {
  heroImage?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ heroImage }) => {
  const theme = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as any }
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: 'calc(100vh - 64px)', md: '70vh' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: heroImage
          ? `linear-gradient(135deg, ${alpha(colorPsychology.programs.cases.primary, 0.85)}, ${alpha(colorPsychology.programs.donations.primary, 0.85)}), url(${heroImage})`
          : `linear-gradient(135deg, ${colorPsychology.programs.cases.primary} 0%, ${colorPsychology.programs.donations.primary} 50%, ${colorPsychology.programs.volunteers.primary} 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: { xs: 'scroll', md: 'fixed' },
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 20% 50%, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 50%),
                       radial-gradient(circle at 80% 80%, ${alpha(theme.palette.common.black, 0.1)} 0%, transparent 50%)`,
          pointerEvents: 'none'
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 4, md: 6 } }}>
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          sx={{ textAlign: { xs: 'center', md: 'left' } }}
        >
          {/* Badge */}
          <MotionBox variants={itemVariants} sx={{ display: 'inline-block', mb: 2 }}>
            <Box
              sx={{
                px: 2,
                py: 0.75,
                bgcolor: alpha(theme.palette.common.white, 0.15),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
                borderRadius: 50,
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              🌍 IMPACT IN ACTION
            </Box>
          </MotionBox>

          {/* Main Headline */}
          <MotionBox
            variants={itemVariants}
            sx={{
              fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.8rem' },
              fontWeight: 900,
              lineHeight: 1.15,
              mb: 2,
              color: 'white',
              textShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.3)}`
            }}
          >
            <h1 style={{ margin: 0, font: 'inherit', display: 'block' }}>
              Empowering Lives,<br />
              <Box component="span" sx={{ background: `linear-gradient(90deg, #FFD700, #FFA500)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Building Futures
              </Box>
            </h1>
          </MotionBox>

          {/* Subheading */}
          <MotionTypography
            variants={itemVariants}
            sx={{
              fontSize: { xs: '1rem', md: '1.2rem' },
              color: 'rgba(255, 255, 255, 0.95)',
              mb: 4,
              maxWidth: { xs: '100%', md: '600px' },
              lineHeight: 1.7,
              fontWeight: 500
            }}
          >
            Join thousands transforming vulnerable children and families' lives across Kenya through sustainable, community-driven initiatives.
          </MotionTypography>

          {/* CTA Buttons */}
          <MotionBox variants={itemVariants} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
            <Button
              component={Link}
              to="/donate"
              variant="contained"
              size="large"
              startIcon={<Favorite />}
              sx={{
                px: { xs: 3, md: 4 },
                py: 1.5,
                fontSize: { xs: '0.95rem', md: '1rem' },
                fontWeight: 700,
                borderRadius: 3,
                textTransform: 'none',
                background: `linear-gradient(135deg, ${colorPsychology.programs.donations.primary}, ${colorPsychology.programs.donations.light})`,
                color: 'white',
                boxShadow: `0 8px 24px ${alpha(colorPsychology.programs.donations.primary, 0.4)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 32px ${alpha(colorPsychology.programs.donations.primary, 0.6)}`
                }
              }}
            >
              Donate Now
            </Button>

            <Button
              component={Link}
              to="/volunteer"
              variant="outlined"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                px: { xs: 3, md: 4 },
                py: 1.5,
                fontSize: { xs: '0.95rem', md: '1rem' },
                fontWeight: 700,
                borderRadius: 3,
                textTransform: 'none',
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                borderWidth: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-4px)'
                }
              }}
            >
              Get Involved
            </Button>
          </MotionBox>

          {/* Scroll Indicator */}
          <MotionBox
            variants={itemVariants}
            sx={{ mt: 6 }}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', fontWeight: 600 }}>
              ↓ Scroll to explore more
            </Typography>
          </MotionBox>
        </MotionBox>
      </Container>
    </Box>
  );
};
