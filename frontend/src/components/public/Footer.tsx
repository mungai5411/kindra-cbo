/**
 * Modern Footer Component
 * Consistent across all pages with links, contact, and newsletter signup
 * Mobile-first responsive design
 */

import React from 'react';
import { Box, Container, Grid, Typography, Link as MuiLink, Stack, Divider, alpha, TextField, Button, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { Mail, Phone, LocationOn, Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';
import { colorPsychology } from '../../theme/colorPsychology';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSectionProps {
  title: string;
  links: FooterLink[];
}

const FooterSection: React.FC<FooterSectionProps> = ({ title, links }) => (
  <Box>
    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'white' }}>
      {title}
    </Typography>
    <Stack spacing={1.5}>
      {links.map((link, i) => (
        <MuiLink
          key={i}
          component={Link}
          to={link.href}
          sx={{
            color: alpha('white', 0.8),
            textDecoration: 'none',
            fontWeight: 500,
            transition: 'all 0.3s ease',
            '&:hover': {
              color: 'white',
              pl: 0.5
            }
          }}
        >
          {link.label}
        </MuiLink>
      ))}
    </Stack>
  </Box>
);

export const Footer: React.FC = () => {
  const footerLinks = {
    programs: [
      { label: 'Case Management', href: '/dashboard/cases' },
      { label: 'Volunteering', href: '/volunteer' },
      { label: 'Donate', href: '/donate' },
      { label: 'Shelters', href: '/dashboard/shelters' }
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Stories', href: '/stories' },
      { label: 'Contact', href: '/contact' }
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Code of Conduct', href: '/codeofconduct' },
      { label: 'Accessibility', href: '/accessibility' }
    ],
    resources: [
      { label: 'Annual Report', href: '/resources/annual-report' },
      { label: 'Impact Stories', href: '/stories' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Download App', href: '/download' }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/kindracbo', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/kindracbo', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/kindracbo', label: 'Instagram' },
    { icon: LinkedIn, href: 'https://linkedin.com/company/kindra-cbo', label: 'LinkedIn' }
  ];

  const contactInfo = [
    { icon: Phone, label: 'Phone', value: '+254 702 123456', href: 'tel:+254702123456' },
    { icon: Mail, label: 'Email', value: 'info@kindra.org', href: 'mailto:info@kindra.org' },
    { icon: LocationOn, label: 'Address', value: 'Nairobi, Kenya', href: 'https://maps.google.com' }
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1a1a1a',
        color: 'white',
        pt: { xs: 6, md: 10 },
        pb: { xs: 4, md: 6 },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: -200,
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(colorPsychology.programs.cases.primary, 0.05)}, transparent)`,
          pointerEvents: 'none'
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Main Footer Content */}
        <Grid container spacing={{ xs: 4, md: 5 }} sx={{ mb: 6 }}>
          {/* Brand & Description */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
                <Box component="span" sx={{ color: colorPsychology.programs.cases.primary }}>K</Box>indra
              </Typography>
              <Typography variant="body2" sx={{ color: alpha('white', 0.7), lineHeight: 1.6 }}>
                Transforming lives and building futures for vulnerable children and families across Kenya.
              </Typography>
            </Box>

            {/* Contact Info */}
            <Stack spacing={1.5}>
              {contactInfo.map((item, i) => {
                const Icon = item.icon;
                return (
                  <MuiLink
                    key={i}
                    href={item.href}
                    underline="none"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      color: alpha('white', 0.8),
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: colorPsychology.programs.cases.primary
                      }
                    }}
                  >
                    <Icon sx={{ fontSize: '1.25rem', flexShrink: 0 }} />
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block', opacity: 0.7 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {item.value}
                      </Typography>
                    </Box>
                  </MuiLink>
                );
              })}
            </Stack>
          </Grid>

          {/* Links Sections */}
          <Grid item xs={12} sm={6} md={2}>
            <FooterSection title="Programs" links={footerLinks.programs} />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FooterSection title="Company" links={footerLinks.company} />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FooterSection title="Legal" links={footerLinks.legal} />
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'white' }}>
              Stay Updated
            </Typography>
            <Typography variant="body2" sx={{ color: alpha('white', 0.7), mb: 2, lineHeight: 1.6 }}>
              Subscribe to our newsletter for impact stories and updates.
            </Typography>
            <Stack spacing={1} direction={{ xs: 'column', sm: 'row', md: 'column' }}>
              <TextField
                placeholder="Your email"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    bgcolor: alpha('white', 0.1),
                    '& fieldset': {
                      borderColor: alpha('white', 0.2)
                    },
                    '&:hover fieldset': {
                      borderColor: alpha('white', 0.3)
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: colorPsychology.programs.cases.primary
                    }
                  }
                }}
              />
              <Button
                variant="contained"
                sx={{
                  bgcolor: colorPsychology.programs.cases.primary,
                  fontWeight: 700,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: alpha(colorPsychology.programs.cases.primary, 0.8)
                  }
                }}
              >
                Subscribe
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider sx={{ bgcolor: alpha('white', 0.1), my: 4 }} />

        {/* Bottom Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
          {/* Copyright */}
          <Typography variant="body2" sx={{ color: alpha('white', 0.6) }}>
            © 2023-{new Date().getFullYear()} Kindra CBO. All rights reserved.
          </Typography>

          {/* Social Links */}
          <Stack direction="row" spacing={1.5}>
            {socialLinks.map((social, i) => {
              const Icon = social.icon;
              return (
                <IconButton
                  key={i}
                  component={MuiLink}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{
                    color: alpha('white', 0.7),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: colorPsychology.programs.cases.primary,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Icon />
                </IconButton>
              );
            })}
          </Stack>

          {/* Trust Badges */}
          <Typography variant="caption" sx={{ color: alpha('white', 0.6) }}>
            ✓ Registered NGO • ✓ Transparent & Verified
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
