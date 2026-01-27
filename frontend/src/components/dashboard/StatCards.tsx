import React from 'react';
import { Typography, Box, useTheme, alpha, Paper, Avatar } from '@mui/material';
import { motion } from 'framer-motion';

interface StatCardProps {
    title: string;
    value: string | number;
    color?: string;
    icon?: React.ReactNode;
    subtitle?: string;
    description?: string;
    delay?: number;
}

export const StatsCard = ({ title, value, color, icon, subtitle, description, delay = 0 }: StatCardProps) => {
    const theme = useTheme();
    const cardColor = color || theme.palette.primary.main;

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay }}
            sx={{ height: '100%' }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 4,
                    background: alpha(cardColor, 0.03),
                    border: '1px solid',
                    borderColor: alpha(cardColor, 0.1),
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    '&:hover': {
                        borderColor: cardColor,
                        background: alpha(cardColor, 0.05),
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 28px ${alpha(cardColor, 0.1)}`,
                        '& .icon-bg': {
                            transform: 'scale(1.1) rotate(0deg)',
                            opacity: 0.15
                        }
                    }
                }}
            >
                {/* Decorative background icon */}
                <Box
                    className="icon-bg"
                    sx={{
                        position: 'absolute',
                        right: -10,
                        bottom: -10,
                        fontSize: 100,
                        color: cardColor,
                        opacity: 0.08,
                        transition: 'all 0.4s ease',
                        pointerEvents: 'none',
                        zIndex: 0
                    }}
                >
                    {icon}
                </Box>

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2
                    }}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: alpha(cardColor, 0.1),
                            color: cardColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {icon}
                        </Box>
                        {(subtitle || description) && (
                            <Typography variant="caption" sx={{
                                fontWeight: 700,
                                color: cardColor,
                                bgcolor: alpha(cardColor, 0.08),
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1.5,
                                whiteSpace: 'nowrap'
                            }}>
                                {subtitle || description}
                            </Typography>
                        )}
                    </Box>

                    <Typography variant="overline" sx={{
                        fontWeight: 800,
                        color: 'text.secondary',
                        letterSpacing: 1.2,
                        opacity: 0.7
                    }}>
                        {title}
                    </Typography>

                    <Typography variant="h4" sx={{
                        fontWeight: 900,
                        color: 'text.primary',
                        mt: 0.5,
                        fontSize: { xs: '1.5rem', md: '1.75rem' }
                    }}>
                        {value}
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export const DashboardStatCard = ({ title, value, subtitle, color, icon }: StatCardProps) => {
    const theme = useTheme();
    const cardColor = color || theme.palette.primary.main;

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: 4,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.1),
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: alpha(cardColor, 0.3),
                    boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {icon && (
                    <Avatar sx={{
                        bgcolor: alpha(cardColor, 0.1),
                        color: cardColor,
                        borderRadius: 2,
                        width: 44,
                        height: 44
                    }}>
                        {icon}
                    </Avatar>
                )}
                <Box>
                    <Typography variant="caption" sx={{
                        fontWeight: 700,
                        color: 'text.secondary',
                        display: 'block',
                        textTransform: 'uppercase',
                        letterSpacing: 1
                    }}>
                        {title}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.2 }}>
                        {value}
                    </Typography>
                    {subtitle && (
                        <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Paper>
    );
};
