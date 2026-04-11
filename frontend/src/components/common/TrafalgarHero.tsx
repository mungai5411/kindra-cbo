import { Box, Container, Typography, Button, Grid } from '@mui/material';
import { motion } from 'framer-motion';

interface TrafalgarHeroProps {
    title: string | React.ReactNode;
    description: string;
    primaryActionText?: string;
    onPrimaryAction?: () => void;
    imageSrc: string;
    imageAlt?: string;
    reverse?: boolean; // If true, image is on the left
}

export const TrafalgarHero = ({
    title,
    description,
    primaryActionText,
    onPrimaryAction,
    imageSrc,
    imageAlt = 'Hero Illustration',
    reverse = false,
}: TrafalgarHeroProps) => {
    return (
        <Box sx={{ position: 'relative', pt: { xs: 15, md: 24 }, pb: { xs: 10, md: 15 }, overflow: 'hidden', bgcolor: 'background.default' }}>
            {/* Dot Pattern Graphic Background (Left Top) */}
            <Box sx={{
                position: 'absolute',
                top: { xs: '5%', md: '15%' },
                left: { xs: '-5%', md: '-2%' },
                opacity: 0.15,
                backgroundImage: 'radial-gradient(#458FF6 2px, transparent 2px)',
                backgroundSize: '20px 20px',
                width: '150px',
                height: '150px',
                zIndex: 0
            }} />
            
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center" direction={reverse ? 'row-reverse' : 'row'}>
                    {/* Text Section */}
                    <Grid item xs={12} md={6}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                            <Typography variant="h1" gutterBottom sx={{ mb: 3 }}>
                                {title}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 5, maxWidth: '90%' }}>
                                {description}
                            </Typography>

                            {primaryActionText && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={onPrimaryAction}
                                    sx={{ py: 1.5, px: 5, fontSize: '1rem' }}
                                >
                                    {primaryActionText}
                                </Button>
                            )}
                        </motion.div>
                    </Grid>

                    {/* Image Section */}
                    <Grid item xs={12} md={6}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
                            <Box 
                                component="img" 
                                src={imageSrc} 
                                alt={imageAlt} 
                                sx={{ 
                                    width: '100%', 
                                    maxWidth: '600px', 
                                    height: 'auto', 
                                    display: 'block', 
                                    margin: '0 auto',
                                    borderRadius: 6,
                                }} 
                            />
                        </motion.div>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};
