/**
 * Glassmorphism Theme Utilities
 * Centralized styling for consistent glassmorphism effect across all pages
 */

import { alpha } from '@mui/material';

// Harmonized color palette matching new Theme
export const glassColors = {
    primaryGradient: 'linear-gradient(135deg, #519755 0%, #3d7240 100%)', // Green Gradient
    secondaryGradient: 'linear-gradient(to right, #BE91BE 0%, #DBAAA7 100%)', // Purple/Pink Gradient
    accentGradient: 'linear-gradient(to bottom right, #A8DCAB 0%, #519755 100%)', // Light Green to Dark
    successGradient: 'linear-gradient(45deg, #519755 0%, #A8DCAB 100%)',
    warningGradient: 'linear-gradient(45deg, #ffa726 0%, #f57c00 100%)',

    // Radial backgrounds (Strictly Light Mode)
    primaryBgLight: (alpha: any) => `radial-gradient(circle at 20% 30%, ${alpha('#519755', 0.15)} 0%, transparent 50%), #f4f9f4`,
    secondaryBgLight: (alpha: any) => `radial-gradient(circle at 20% 30%, ${alpha('#BE91BE', 0.15)} 0%, transparent 50%), #f4f9f4`,
    successBgLight: (alpha: any) => `radial-gradient(circle at 20% 30%, ${alpha('#519755', 0.12)} 0%, transparent 50%), #f4f9f4`,
    warningBgLight: (alpha: any) => `radial-gradient(circle at 20% 30%, ${alpha('#ffa726', 0.12)} 0%, transparent 50%), #f4f9f4`,

    // Chat Bubble Colors
    bubbleSender: 'linear-gradient(135deg, #519755 0%, #3d7240 100%)',
    bubbleReceiver: 'rgba(255, 255, 255, 0.9)',
    bubblePrivate: 'rgba(240, 240, 240, 0.5)',
};

// Glassmorphism card style
export const glassCard = (theme: any, variant: 'default' | 'elevated' = 'default') => ({
    background: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(20px)',
    border: '1px solid',
    borderColor: alpha(theme.palette.divider, 0.5),
    borderRadius: variant === 'elevated' ? 1 : 0.5,
    boxShadow: variant === 'elevated'
        ? '0 12px 40px rgba(0,0,0,0.15)'
        : '0 8px 32px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
        boxShadow: variant === 'elevated'
            ? '0 16px 48px rgba(0,0,0,0.2)'
            : '0 12px 36px rgba(0,0,0,0.12)',
        borderColor: alpha(theme.palette.primary.main, 0.3),
    }
});

// Glassmorphism input field
export const glassInput = {
    borderRadius: 3,
    '& .MuiOutlinedInput-root': {
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
        },
        '&.Mui-focused': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }
    }
};

// Glassmorphism button
export const glassButton = (theme: any, variant: 'primary' | 'secondary' | 'accent' = 'primary') => {
    const gradients = {
        primary: glassColors.primaryGradient,
        secondary: glassColors.secondaryGradient,
        accent: glassColors.accentGradient,
    };

    return {
        background: gradients[variant],
        borderRadius: 3,
        fontWeight: 700,
        textTransform: 'none' as const,
        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
        transition: 'all 0.3s',
        '&:hover': {
            boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.35)}`,
            transform: 'translateY(-2px)',
        }
    };
};

// Page container with gradient background
export const glassPageContainer = (_isDark: boolean, variant: 'primary' | 'secondary' | 'success' | 'warning' = 'primary') => {
    const bgMap = {
        primary: glassColors.primaryBgLight,
        secondary: glassColors.secondaryBgLight,
        success: glassColors.successBgLight,
        warning: glassColors.warningBgLight,
    };

    return {
        minHeight: '100vh',
        background: bgMap[variant](alpha),
        pt: 4,
        pb: 8,
    };
};

// Gradient text
export const gradientText = (gradient: string) => ({
    background: gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 900,
});

// Floating card animation
export const floatingAnimation = {
    '@keyframes float': {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-10px)' },
    },
    animation: 'float 4s ease-in-out infinite',
};

// Shimmer effect
export const shimmerEffect = {
    '@keyframes shimmer': {
        '0%': { backgroundPosition: '-1000px 0' },
        '100%': { backgroundPosition: '1000px 0' },
    },
    background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
    backgroundSize: '1000px 100%',
    animation: 'shimmer 2s infinite',
};

// Specialized glass notification item
export const glassNotificationItem = (theme: any, read: boolean) => ({
    p: 2,
    mb: 1,
    borderRadius: 0.5,
    background: read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
    border: '1px solid',
    borderColor: read ? 'transparent' : alpha(theme.palette.divider, 0.5),
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
        background: alpha(theme.palette.primary.main, 0.08),
        transform: 'translateX(4px)',
    }
});

// Specialized glass chat bubble
export const glassChatBubble = (isSender: boolean, isPrivate: boolean, isMobile: boolean = false) => ({
    p: isMobile ? 1 : 1.5,
    borderRadius: isSender ? '4px 4px 1px 4px' : '4px 4px 4px 1px',
    background: isPrivate ? glassColors.bubblePrivate : (isSender ? glassColors.bubbleSender : glassColors.bubbleReceiver),
    color: isSender ? '#ffffff' : '#1a2e1c',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: isPrivate ? '1px dashed rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.3)',
    position: 'relative',
    maxWidth: '100%',
    backdropFilter: isSender ? 'none' : 'blur(10px)',
    '& .MuiTypography-root': {
        fontSize: isMobile ? '0.75rem' : '0.85rem',
        lineHeight: 1.4,
        color: 'inherit !important', // Force contrast
    }
});

export default {
    glassColors,
    glassCard,
    glassInput,
    glassButton,
    glassPageContainer,
    gradientText,
    floatingAnimation,
    shimmerEffect,
    glassNotificationItem,
    glassChatBubble,
};
