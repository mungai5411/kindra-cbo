/**
 * Call To Action Section
 * Prominent section encouraging users to take action
 * Multiple CTA buttons with clear value proposition
 */

import React from 'react';
import { Box, Container, Grid, Typography, Button, alpha, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowForward, Groups, VolunteerActivism, Favorite } from '@mui/icons-material';
import { colorPsychology } from '../../theme/colorPsychology';

interface CTACardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  buttonLink: string;
  color: string;
  delay: number;
}

const CTACard: React.FC<CTACardProps> = ({ title, description, icon, buttonText, buttonLink, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    viewport={{ once: true, amount: 0.3 }}
    style={{ height: '100%' }}
  >
    <Card
      elevation={0}
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.08)}, ${alpha(color, 0.02)})`,
        border: `1px solid ${alpha(color, 0.15)}`,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
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
          pointerEvents: 'none'
        },
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 16px 32px ${alpha(color, 0.15)}`,
          borderColor: alpha(color, 0.3)
        }
      }}
    >
      {/* Color Bar */}
      <Box
        sx={{
          height: 4,
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.3)})`
        }}
      />

      <CardContent sx={{ p: { xs: 2.5, md: 3 }, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ fontSize: '2.5rem', mb: 2 }}>
          {icon}
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
          {title}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, flex: 1, lineHeight: 1.6 }}>
          {description}
        </Typography>

        <Button
          component={Link}
          to={buttonLink}
          variant="contained"
          endIcon={<ArrowForward sx={{ fontSize: '1rem' }} />}
          sx={{
            background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.7)})`,
            color: 'white',
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: 2,
            py: 1,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateX(4px)',
              boxShadow: `0 8px 16px ${alpha(color, 0.3)}`
            }
          }}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  </motion.div>
);

export const CallToAction: React.FC = () => {

  const ctaCards: CTACardProps[] = [
    {
      title: 'Make a Donation',
      description: 'Your generosity directly impacts lives. Every contribution brings hope and opportunity to vulnerable children and families.',
      icon: <Favorite sx={{ fontSize: 'inherit', color: colorPsychology.programs.donations.primary }} />,
      buttonText: 'Donate Now',
      buttonLink: '/donate',
      color: colorPsychology.programs.donations.primary,
      delay: 0
    },
    {
      title: 'Become a Volunteer',
      description: 'Share your skills, time, and passion. Join our community of changemakers creating real impact in vulnerable communities.',
      icon: <Groups sx={{ fontSize: 'inherit', color: colorPsychology.programs.volunteers.primary }} />,
      buttonText: 'Volunteer',
      buttonLink: '/volunteer',
      color: colorPsychology.programs.volunteers.primary,
      delay: 0.15
    },
    {
      title: 'Partner With Us',
      description: 'Organizations and businesses can partner with us to create systemic change. Let\'s build a better future together.',
      icon: <VolunteerActivism sx={{ fontSize: 'inherit', color: colorPsychology.programs.cases.primary }} />,
      buttonText: 'Explore Partnerships',
      buttonLink: '/contact',
      color: colorPsychology.programs.cases.primary,
      delay: 0.3
    }
  ];

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="lg">
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
            Get Involved
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              mb: 2,
              fontSize: { xs: '2rem', md: '2.8rem' }
            }}
          >
            Multiple Ways to Make <Box component="span" sx={{ color: colorPsychology.programs.cases.primary }}>Impact</Box>
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
            Whether you donate, volunteer, or partner with us—every contribution matters and creates tangible change.
          </Typography>
        </Box>

        {/* CTA Cards Grid */}
        <Grid container spacing={{ xs: 2.5, md: 3 }}>
          {ctaCards.map((card, index) => (
            <Grid item xs={12} md={4} key={index}>
              <CTACard {...card} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Decorative Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '-100px',
          right: '-150px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(colorPsychology.programs.volunteers.primary, 0.05)}, transparent)`,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
    </Box>
  );
};
