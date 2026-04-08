/**
 * Testimonials Section Component
 * Displays real impact stories and social proof
 * Mobile-first carousel design
 */

import React from 'react';
import { Box, Container, Typography, Card, CardContent, Avatar, Grid, alpha, Rating } from '@mui/material';
import { motion } from 'framer-motion';
import { colorPsychology } from '../../theme/colorPsychology';

const MotionCard = motion(Card);

interface TestimonialProps {
  name: string;
  role: string;
  image?: string;
  testimonial: string;
  rating: number;
  delay: number;
}

const TestimonialCard: React.FC<TestimonialProps> = ({ name, role, image, testimonial, rating, delay }) => (
  <MotionCard
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    viewport={{ once: true, amount: 0.3 }}
    elevation={0}
    sx={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))',
      border: '1px solid rgba(255,255,255,0.5)',
      borderRadius: 3,
      backdropFilter: 'blur(10px)',
      p: { xs: 2.5, md: 3 },
      height: '100%',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 32px ${alpha(colorPsychology.programs.cases.primary, 0.1)}`
      }
    }}
  >
    <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Rating */}
      <Box sx={{ mb: 2 }}>
        <Rating value={rating} readOnly size="small" sx={{ color: '#FFD700' }} />
      </Box>

      {/* Testimonial Text */}
      <Typography variant="body2" sx={{ mb: 3, flex: 1, lineHeight: 1.7, fontStyle: 'italic' }}>
        "{testimonial}"
      </Typography>

      {/* Author */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar src={image} sx={{ width: 48, height: 48, bgcolor: colorPsychology.programs.cases.primary }} />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {role}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </MotionCard>
);

export const TestimonialsSection: React.FC = () => {

  const testimonials: TestimonialProps[] = [
    {
      name: 'Sarah Kipchoge',
      role: 'Program Beneficiary',
      testimonial: 'Kindra CBO changed my family\'s life. Through their support, my children are back in school and we have food security. I\'m forever grateful.',
      rating: 5,
      delay: 0
    },
    {
      name: 'John Mwangi',
      role: 'Active Volunteer',
      testimonial: 'The most rewarding experience of my life. The team is professional, compassionate, and truly committed to making a difference in the community.',
      rating: 5,
      delay: 0.1
    },
    {
      name: 'Maria Ochieng',
      role: 'Donor',
      testimonial: 'I donate monthly because I trust Kindra\'s transparency and impact tracking. Seeing how my contribution helps real families is incredibly fulfilling.',
      rating: 5,
      delay: 0.2
    }
  ];

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, position: 'relative', overflow: 'hidden' }}>
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
            Real Stories
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              mb: 2,
              fontSize: { xs: '2rem', md: '2.8rem' }
            }}
          >
            Impact from the <Box component="span" sx={{ color: colorPsychology.programs.cases.primary }}>Community</Box>
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
            Hear directly from those whose lives have been transformed by our programs.
          </Typography>
        </Box>

        {/* Testimonials Grid */}
        <Grid container spacing={{ xs: 2.5, md: 3 }}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <TestimonialCard {...testimonial} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
