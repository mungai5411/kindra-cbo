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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay }}
        >
            <Card sx={{
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 2,
                boxShadow: theme.shadows[1],
                border: '1px solid',
                borderColor: alpha(cardColor, 0.1),
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 12px 24px ${alpha(cardColor, 0.15)}`
                }
            }}>
                {icon && (
                    <Box sx={{
                        position: 'absolute',
                        right: { xs: -20, sm: -10 },
                        top: { xs: -10, sm: -5 },
                        opacity: 0.05,
                        fontSize: { xs: 40, sm: 60 },
                        color: cardColor,
                        transform: 'rotate(15deg)',
                        pointerEvents: 'none'
                    }}>
                        {icon}
                    </Box>
                )}
                <CardContent sx={{
                    position: 'relative',
                    zIndex: 1,
                    p: { xs: 1, sm: 1.5 },
                    '&:last-child': { pb: { xs: 1, sm: 1.5 } }
                }}>
                    <Typography variant="h4" fontWeight="800" sx={{
                        color: cardColor,
                        mb: 0,
                        lineHeight: 1,
                        fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                    }}>
                        {value}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" fontWeight="700" sx={{
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        mt: 0.5
                    }}>
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, opacity: 0.8, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                            {subtitle}
                        </Typography>
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
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    lineHeight: 1
                }}>
                    {title}
                </Typography>
                <Typography variant="h4" sx={{
                    fontWeight: 800,
                    my: 0.5,
                    color: 'text.primary',
                    fontSize: { xs: '1.1rem', sm: '1.4rem', md: '1.6rem' }
                }}>
                    {value}
                </Typography>
                {subtitle && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};
