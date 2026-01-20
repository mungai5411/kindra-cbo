import { Card, CardContent, Typography, Box, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';

interface StatCardProps {
    title: string;
    value: string | number;
    color?: string;
    icon?: React.ReactNode;
    subtitle?: string;
    delay?: number;
}

export const StatsCard = ({ title, value, color, icon, subtitle, delay = 0 }: StatCardProps) => {
    const theme = useTheme();
    const cardColor = color || theme.palette.primary.main;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: delay }}
            style={{ height: '100%' }}
        >
            <Card sx={{
                height: '100%',
                minWidth: { xs: 240, sm: 'auto' }, // Support for horizontal scroller on mobile
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 5, // High radius as per insight
                boxShadow: `0 4px 20px ${alpha(cardColor, 0.08)}`,
                border: 'none',
                bgcolor: cardColor,
                color: theme.palette.getContrastText(cardColor),
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 28px ${alpha(cardColor, 0.2)}`
                }
            }}>
                <Box sx={{
                    position: 'absolute',
                    right: -10,
                    top: -10,
                    opacity: 0.15,
                    fontSize: 80,
                    color: 'white',
                    transform: 'rotate(15deg)',
                    pointerEvents: 'none'
                }}>
                    {icon}
                </Box>

                <CardContent sx={{
                    position: 'relative',
                    zIndex: 1,
                    p: 2.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    '&:last-child': { pb: 2.5 }
                }}>
                    <Typography variant="caption" sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 1.5,
                        opacity: 0.8,
                        fontSize: '0.65rem',
                        mb: 1
                    }}>
                        {title}
                    </Typography>

                    <Typography variant="h4" fontWeight="900" sx={{
                        lineHeight: 1,
                        fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.85rem' },
                        letterSpacing: -0.5
                    }}>
                        {value}
                    </Typography>

                    {subtitle && (
                        <Box sx={{
                            mt: 2,
                            pt: 1.5,
                            borderTop: '1px solid',
                            borderColor: alpha('#fff', 0.2),
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                        }}>
                            <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600 }}>
                                {subtitle}
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export const DashboardStatCard = ({ title, value, subtitle, color }: StatCardProps) => {
    const theme = useTheme();
    const cardColor = color || theme.palette.primary.main;

    return (
        <Card sx={{
            borderRadius: 2,
            boxShadow: theme.shadows[1],
            borderLeft: { xs: `3px solid ${cardColor}`, sm: `4px solid ${cardColor}` },
            transition: 'transform 0.2s',
            '&:hover': { transform: 'scale(1.02)' }
        }}>
            <CardContent sx={{ p: { xs: 1, sm: 1.5 }, '&:last-child': { pb: { xs: 1, sm: 1.5 } } }}>
                <Typography variant="overline" color="text.secondary" sx={{
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    fontSize: { xs: '0.625rem', sm: '0.75rem' },
                    lineHeight: 1
                }}>
                    {title}
                </Typography>
                <Typography variant="h4" sx={{
                    fontWeight: 800,
                    my: 0.5,
                    color: 'text.primary',
                    fontSize: { xs: '1.05rem', sm: '1.4rem', md: '1.6rem' }
                }}>
                    {value}
                </Typography>
                {subtitle && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.8rem' } }}>
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};
