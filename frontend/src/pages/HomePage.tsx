/**
 * Modern Home Page - Complete UI Revamp
 * Incorporates all new components with mobile-first design
 * Uses Higherlife-inspired color psychology and animations
 */

import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';
import { AppDispatch, RootState } from '../store';
import { fetchPublicStats } from '../features/reporting/reportingSlice';
import { fetchMedia } from '../features/media/mediaSlice';
import { Navbar } from '../components/public/Navbar';
import { HeroSection } from '../components/home/HeroSection';
import { ImpactMetrics } from '../components/home/ImpactMetrics';
import { MissionAndValues } from '../components/home/MissionAndValues';
import { ProgramsShowcase } from '../components/home/ProgramsShowcase';
import { CallToAction } from '../components/home/CallToAction';
import { FAQSection } from '../components/home/FAQSection';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { NewsletterSection } from '../components/home/NewsletterSection';

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { assets: landingPageImages } = useSelector((state: RootState) => state.media);
  
  // Memoize filtered images to prevent infinite re-renders
  const heroImages = useMemo(
    () => landingPageImages.filter(asset => asset.source_type === 'SHELTER'),
    [landingPageImages]
  );

  // Fetch public statistics and media on component mount
  useEffect(() => {
    dispatch(fetchPublicStats());
    dispatch(fetchMedia());
  }, [dispatch]);

  return (
    <Box sx={{ bgcolor: 'background.default', overflow: 'hidden' }}>
      {/* Navigation */}
      <Navbar />

      {/* Hero Section - First Impression */}
      <HeroSection images={heroImages} />

      {/* Impact Metrics - Show Scale */}
      <ImpactMetrics />

      {/* Mission & Values - Build Trust */}
      <MissionAndValues />

      {/* Programs Showcase - How We Help */}
      <ProgramsShowcase />

      {/* Call To Action - Encourage Engagement */}
      <CallToAction />

      {/* Testimonials - Social Proof */}
      <TestimonialsSection />

      {/* FAQ Section - Address Concerns */}
      <FAQSection />

      {/* Newsletter Signup - Build Community */}
      <NewsletterSection backgroundImage={heroImages[0]?.file} />
    </Box>
  );
}
