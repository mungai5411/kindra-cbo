import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrafalgarHero } from '../common/TrafalgarHero';
import { MediaAsset } from '../../features/media/mediaSlice';

interface HeroSectionProps {
  images?: MediaAsset[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ images = [] }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Rotate through images every 8 seconds
  useEffect(() => {
    if (images.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [images.length]);

  // Construct absolute URL for image
  const getImageUrl = (filePath: string) => {
    if (!filePath) return null;
    if (filePath.startsWith('http')) return filePath;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    return `${apiUrl}/${filePath}`.replace(/\/+/g, '/').replace(':/', '://');
  };

  const currentImage = images.length > 0 
    ? getImageUrl(images[currentImageIndex]?.file) 
    : 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop'; // Fallback illustration

  return (
    <TrafalgarHero
      title={
        <>
            Empowering Lives,<br />
            Building Futures
        </>
      }
      description="Join thousands transforming vulnerable children and families' lives across Kenya through sustainable, community-driven initiatives."
      primaryActionText="Donate Now"
      onPrimaryAction={() => navigate('/donate')}
      imageSrc={currentImage as string}
      imageAlt="Kindra Community Support"
    />
  );
};

