/**
 * Programs Showcase Component
 * Displays all program areas with color psychology and emotional messaging
 * Mobile-first responsive grid with hover animations
 */

import React from 'react';
import { Box, Container, Grid, Card, CardContent, Typography, Button, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowForward, VolunteerActivism, Groups, Savings, HomeWork } from '@mui/icons-material';

const MotionCard = motion(Card);

interface ProgramProps {
  title: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  stats: string;
  cta: string;
  link: string;
  delay: number;
}

const ProgramCard: React.FC<ProgramProps> = ({ title, description, color, icon, stats, cta, link, delay }) => {
  return (
    <MotionCard
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.3 }}
      elevation={0}
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.08)}, ${alpha(color, 0.02)})`,
        border: `1px solid ${alpha(color, 0.15)}`,
        borderRadius: 3,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${alpha(color, 0.1)}, transparent)`,
          pointerEvents: 'none',
          borderRadius: '50%'
        },
        '&:hover': {
          transform: 'translateY(-12px)',
          boxShadow: `0 20px 40px ${alpha(color, 0.15)}`,
          borderColor: alpha(color, 0.3),
          '& .program-cta': {
            transform: 'translateX(4px)'
          }
        }
      }}
    >
      {/* Color Top Border Accent */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.3)})`
        }}
      />

      <CardContent sx={{ p: { xs: 2.5, md: 3 }, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Icon */}
        <Box
          sx={{
            color,
            fontSize: '2.5rem',
            mb: 2,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {icon}
        </Box>

        {/* Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            mb: 1.5,
            color: 'text.primary',
            fontSize: { xs: '1.25rem', md: '1.5rem' }
          }}
        >
          {title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mb: 2.5,
            lineHeight: 1.6,
            flex: 1,
            fontSize: { xs: '0.9rem', md: '0.95rem' }
          }}
        >
          {description}
        </Typography>

        {/* Stats Badge */}
        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: alpha(color, 0.1),
            border: `1px solid ${alpha(color, 0.2)}`,
            borderRadius: 2,
            mb: 2,
            display: 'inline-block',
            width: 'fit-content'
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.75rem'
            }}
          >
            {stats}
          </Typography>
        </Box>

        {/* CTA Button */}
        <Button
          component={Link}
          to={link}
          variant="text"
          endIcon={<ArrowForward sx={{ fontSize: '1rem' }} />}
          className="program-cta"
          sx={{
            justifyContent: 'flex-start',
            pl: 0,
            color,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'transparent'
            }
          }}
        >
          {cta}
        </Button>
      </CardContent>
    </MotionCard>
  );
};

export const ProgramsShowcase: React.FC = () => {

  const programs: ProgramProps[] = [
    {
      title: 'Case Management',
      description: 'We provide targeted support to vulnerable children and families through comprehensive case management, ensuring personalized care and sustainable solutions.',
      color: theme.palette.primary.main,
      icon: <VolunteerActivism fontSize="inherit" />,
      stats: '2,500+ Active Cases',
      cta: 'Explore',
      link: '/dashboard/cases',
      delay: 0
    },
    {
      title: 'Volunteering',
      description: 'Join our active volunteer community dedicated to creating real change. Share your skills, time, and passion to empower vulnerable populations.',
      color: theme.palette.secondary.main,
      icon: <Groups fontSize="inherit" />,
      stats: '450+ Volunteers',
      cta: 'Get Involved',
      link: '/volunteer',
      delay: 0.1
    },
    {
      title: 'Donations',
      description: 'Your generosity directly impacts lives. Contribute financially or through material donations to support our programs and reach more families in need.',
      color: theme.palette.primary.light,
      icon: <Savings fontSize="inherit" />,
      stats: 'KES 50M+ Raised',
      cta: 'Donate Now',
      link: '/donate',
      delay: 0.2
    },
    {
      title: 'Shelter Support',
      description: 'We partner with care facilities to ensure every child has a safe, nurturing environment with quality care, education, and holistic development.',
      color: theme.palette.secondary.light,
      icon: <HomeWork fontSize="inherit" />,
      stats: '25+ Partner Shelters',
      cta: 'Learn More',
      link: '/dashboard/shelters',
      delay: 0.3
    }
  ];

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, position: 'relative', overflow: 'hidden' }}>
      <Container maxWidth="xl">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
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
            How We Help
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              mb: 2,
              fontSize: { xs: '2rem', md: '2.8rem' }
            }}
          >
            Our Programs
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.7
            }}
          >
            Every program is designed with compassion and backed by research to create lasting positive change.
          </Typography>
        </Box>

        {/* Programs Grid */}
        <Grid container spacing={{ xs: 2.5, md: 3 }}>
          {programs.map((program, index) => (
            <Grid item xs={12} sm={6} md={6} lg={6} key={index}>
              <ProgramCard {...program} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Decorative Background */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -200,
          left: -100,
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.03)}, transparent)`,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
    </Box>
  );
};
