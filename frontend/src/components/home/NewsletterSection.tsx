/**
 * Newsletter Signup Section Component
 * Uses real background image instead of AI gradients
 * Mobile-first design with form validation
 */

import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Alert, alpha, useTheme, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { Send, CheckCircle } from '@mui/icons-material';
import { colorPsychology } from '../../theme/colorPsychology';

const MotionBox = motion(Box);

interface NewsletterSectionProps {
  backgroundImage?: string;
}

export const NewsletterSection: React.FC<NewsletterSectionProps> = ({ backgroundImage }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setEmail('');
      setLoading(false);
      // Reset after 5s
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundColor: colorPsychology.programs.cases.primary,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(135deg, ${alpha(theme.palette.common.black, 0.55)} 0%, ${alpha(theme.palette.common.black, 0.45)} 100%)`,
          pointerEvents: 'none'
        }
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.3 }}
          sx={{ textAlign: 'center' }}
        >
          {/* Headline */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              mb: 2,
              color: 'white',
              fontSize: { xs: '1.8rem', md: '2.5rem' }
            }}
          >
            Stay Updated on Our <Box component="span" sx={{ textDecoration: 'underline' }}>Impact</Box>
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.95)',
              fontWeight: 500,
              mb: 4,
              lineHeight: 1.7
            }}
          >
            Subscribe to our newsletter for impact stories, program updates, and ways to make a difference.
          </Typography>

          {/* Form */}
          {!submitted ? (
            <Stack spacing={2}>
              <Box
                component="form"
                onSubmit={handleSubscribe}
                sx={{
                  display: 'flex',
                  gap: 1,
                  flexDirection: { xs: 'column', sm: 'row' },
                  width: '100%'
                }}
              >
                <TextField
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  disabled={loading}
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      bg: 'white',
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: 'transparent'
                      },
                      '&:hover fieldset': {
                        borderColor: alpha(colorPsychology.programs.cases.primary, 0.3)
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: colorPsychology.programs.cases.primary
                      }
                    }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    background: 'white',
                    color: colorPsychology.programs.cases.primary,
                    fontWeight: 700,
                    textTransform: 'none',
                    px: { xs: 3, sm: 4 },
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 16px ${alpha(theme.palette.common.black, 0.15)}`
                    }
                  }}
                  endIcon={<Send sx={{ fontSize: '1rem' }} />}
                >
                  Subscribe
                </Button>
              </Box>

              {error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 500
                }}
              >
                ✓ We respect your privacy. Unsubscribe anytime.
              </Typography>
            </Stack>
          ) : (
            <MotionBox
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                py: 3
              }}
            >
              <CheckCircle sx={{ fontSize: '3rem', color: 'white' }} />
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: 'white',
                    mb: 0.5
                  }}
                >
                  Thank you for subscribing!
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)'
                  }}
                >
                  Check your email for a welcome message from our team.
                </Typography>
              </Box>
            </MotionBox>
          )}
        </MotionBox>

        {/* Decorative Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.common.white, 0.08)}, transparent)`,
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      </Container>
    </Box>
  );
};
