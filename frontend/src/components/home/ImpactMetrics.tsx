/**
 * Impact Metrics Component
 * Displays key statistics with animations and color psychology
 * Shows real data from Redux with emotional visual hierarchy
 */

import React from 'react';
import { Box, Container, Grid, Typography, Paper, alpha, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  School,
  FamilyRestroom,
  Groups,
  Home
} from '@mui/icons-material';
import { colorPsychology } from '../../theme/colorPsychology';

const MotionPaper = motion(Paper);

interface MetricCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
  delay: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, value, label, color, delay }) => {
  return (
    <MotionPaper
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.3 }}
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        background: `linear-gradient(135deg, ${alpha(color, 0.08)}, ${alpha(color, 0.02)})`,
        border: `1px solid ${alpha(color, 0.2)}`,
        borderRadius: 3,
        textAlign: 'center',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 12px 32px ${alpha(color, 0.15)}`,
          borderColor: alpha(color, 0.4)
        }
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 2.5,
          background: alpha(color, 0.12),
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          mb: 2,
          fontSize: '1.75rem'
        }}
      >
        {icon}
      </Box>

      <Typography
        variant="h4"
        sx={{
          fontWeight: 900,
          color: 'text.primary',
          mb: 0.5,
          fontSize: { xs: '1.75rem', md: '2.25rem' }
        }}
      >
        {value.toLocaleString()}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          fontWeight: 600,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          fontSize: { xs: '0.75rem', md: '0.825rem' }
        }}
      >
        {label}
      </Typography>
    </MotionPaper>
  );
};

export const ImpactMetrics: React.FC = () => {
  const theme = useTheme();
  const { dashboardData } = useSelector((state: RootState) => state.reporting);
  const stats = dashboardData?.public || {};

  const metrics = [
    {
      icon: <School sx={{ fontSize: 'inherit' }} />,
      value: stats.children_supported ?? 0,
      label: 'Children Supported',
      color: colorPsychology.programs.cases.primary,
      delay: 0
    },
    {
      icon: <FamilyRestroom sx={{ fontSize: 'inherit' }} />,
      value: stats.families_helped ?? 0,
      label: 'Families Helped',
      color: colorPsychology.programs.donations.primary,
      delay: 0.1
    },
    {
      icon: <Groups sx={{ fontSize: 'inherit' }} />,
      value: stats.active_volunteers ?? 0,
      label: 'Active Volunteers',
      color: colorPsychology.programs.volunteers.primary,
      delay: 0.2
    },
    {
      icon: <Home sx={{ fontSize: 'inherit' }} />,
      value: stats.partner_organizations ?? 0,
      label: 'Partner Organizations',
      color: colorPsychology.programs.shelter.primary,
      delay: 0.3
    }
  ];

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 100%)`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: '-200px',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(colorPsychology.programs.volunteers.primary, 0.05)}, transparent)`,
          pointerEvents: 'none'
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
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
            Our Reach & Impact
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              mb: 2,
              fontSize: { xs: '2rem', md: '2.8rem' }
            }}
          >
            Real Impact, Real Numbers
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
            Join our community of changemakers making tangible differences in vulnerable lives across Kenya.
          </Typography>
        </Box>

        {/* Metrics Grid */}
        <Grid container spacing={{ xs: 2.5, md: 3 }}>
          {metrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <MetricCard {...metric} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
