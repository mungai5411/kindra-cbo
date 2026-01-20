/**
 * Material-UI Theme Configuration
 * Premium Professional styling for Kindra CBO
 * Palette: Green/Pink/Purple (Strictly Requested)
 * Colors: #A8DCAB, #519755, #DBAAA7, #BE91BE
 */

import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Premium Color Palette
export const colors = {
    primary: {
        main: '#519755', // Deeper Green
        light: '#A8DCAB', // Light Green
        dark: '#3d7240',
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#BE91BE', // Purple
        light: '#DBAAA7', // Pinkish/Salmon
        dark: '#9c739c',
        contrastText: '#ffffff',
    },
    info: {
        main: '#7da780', // Leafy Green/Gray
        light: '#9cbda0',
        dark: '#5e8561',
        contrastText: '#ffffff',
    },
    success: {
        main: '#519755', // Primary Green
        light: '#A8DCAB',
        dark: '#3d7240',
        contrastText: '#ffffff',
    },
    error: {
        main: '#d32f2f', // Red 700
        light: '#ef5350',
        dark: '#c62828',
        contrastText: '#ffffff',
    },
    warning: {
        main: '#ffa726', // Orange 400
        light: '#ffb74d',
        dark: '#f57c00',
        contrastText: '#ffffff',
    },
    background: {
        default: '#f4f9f4', // Very light green tint
        paper: '#ffffff',
    },
    text: {
        primary: '#1a2e1c', // Deep forest green - high contrast
        secondary: '#4a5d4c', // Muted green-gray
        disabled: '#9cbda0',
    },
};

let baseTheme = createTheme({
    palette: colors,
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 800,
            fontSize: '2.25rem',
            lineHeight: 1.1,
            letterSpacing: '-0.04em',
            color: colors.text.primary,
            '@media (max-width:600px)': { fontSize: '1.75rem' },
        },
        h2: {
            fontWeight: 800,
            fontSize: '1.75rem',
            lineHeight: 1.2,
            letterSpacing: '-0.03em',
            color: colors.text.primary,
            '@media (max-width:600px)': { fontSize: '1.45rem' },
        },
        h3: {
            fontWeight: 700,
            fontSize: '1.5rem',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            color: colors.text.primary,
            '@media (max-width:600px)': { fontSize: '1.25rem' },
        },
        h4: {
            fontWeight: 700,
            fontSize: '1.15rem',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
            color: colors.text.primary,
            '@media (max-width:600px)': { fontSize: '1.05rem' },
        },
        h5: {
            fontWeight: 600,
            fontSize: '0.95rem',
            lineHeight: 1.4,
            color: colors.text.primary,
            '@media (max-width:600px)': { fontSize: '0.875rem' },
        },
        h6: {
            fontWeight: 700,
            fontSize: '0.75rem',
            lineHeight: 1.5,
            color: colors.text.primary,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            '@media (max-width:600px)': { fontSize: '0.7rem' },
        },
        button: {
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.8125rem',
            letterSpacing: '0.02em',
        },
        body1: {
            fontWeight: 400,
            fontSize: '0.875rem',
            lineHeight: 1.6,
            color: colors.text.primary,
        },
        body2: {
            fontWeight: 400,
            fontSize: '0.75rem',
            lineHeight: 1.6,
            color: colors.text.secondary,
        },
    },
    shape: {
        borderRadius: 4,
    },
    shadows: [
        'none',
        '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none'
    ],
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    fontSize: '0.9375rem', // Slightly larger base for easier view
                    lineHeight: 1.6,
                    '@media (max-width:1200px)': {
                        fontSize: '0.875rem',
                    },
                    '@media (max-width:600px)': {
                        fontSize: '0.78rem',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    padding: '6px 16px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: 'none',
                    textTransform: 'none',
                    '@media (max-width:600px)': {
                        padding: '4px 12px',
                        fontSize: '0.75rem',
                        minHeight: 32,
                        borderRadius: 4,
                    },
                    '&:hover': {
                        transform: 'translateY(-1.5px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    },
                    '&:active': {
                        transform: 'translateY(0)',
                    },
                },
                sizeLarge: {
                    padding: '8px 24px',
                    fontSize: '0.925rem',
                    '@media (max-width:600px)': {
                        padding: '6px 16px',
                        fontSize: '0.85rem',
                    },
                },
                containedPrimary: {
                    background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
                    border: 'none',
                    '&:hover': {
                        background: `linear-gradient(135deg, ${colors.primary.light} 0%, ${colors.primary.main} 100%)`,
                    },
                },
                containedSecondary: {
                    background: `linear-gradient(135deg, ${colors.secondary.main} 0%, ${colors.secondary.dark} 100%)`,
                    border: 'none',
                    '&:hover': {
                        background: `linear-gradient(135deg, ${colors.secondary.light} 0%, ${colors.secondary.main} 100%)`,
                    },
                },
                outlined: {
                    borderWidth: '1.5px',
                    '&:hover': {
                        borderWidth: '1.5px',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '@media (max-width:600px)': {
                        borderRadius: 6, // Tighter radius on mobile
                    },
                    '&:hover': {
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        transform: 'translateY(-4px)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                rounded: {
                    borderRadius: 8,
                    '@media (max-width:600px)': {
                        borderRadius: 6,
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 4,
                        backgroundColor: '#ffffff',
                        transition: 'all 0.2s ease',
                        '@media (max-width:600px)': {
                            borderRadius: 4,
                            fontSize: '0.85rem',
                        },
                        '& input': {
                            padding: '10px 14px',
                            '@media (max-width:600px)': {
                                padding: '8px 12px',
                            },
                        },
                        '& fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.1)',
                        },
                        '&:hover fieldset': {
                            borderColor: colors.primary.main,
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: colors.primary.main,
                            borderWidth: 2,
                        },
                    },
                    '& .MuiInputLabel-root': {
                        fontSize: '0.9rem',
                        '@media (max-width:600px)': {
                            fontSize: '0.8rem',
                            transform: 'translate(14px, 10px) scale(1)',
                        },
                        '&.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -9px) scale(0.75)',
                        }
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    color: colors.text.primary,
                    boxShadow: 'none',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRight: '1px solid rgba(0, 0, 0, 0.05)',
                    backgroundColor: '#ffffff',
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    minHeight: 40,
                    padding: '6px 16px',
                    '@media (max-width:600px)': {
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        minHeight: 36,
                    },
                    '&.Mui-selected': {
                        color: colors.primary.main,
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    padding: '12px 16px',
                    '@media (max-width:600px)': {
                        padding: '8px 10px',
                        fontSize: '0.75rem',
                    },
                },
                head: {
                    fontWeight: 600,
                    backgroundColor: '#f9fafb',
                    '@media (max-width:600px)': {
                        fontSize: '0.75rem',
                    },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 8,
                    '@media (max-width:600px)': {
                        borderRadius: 6,
                        margin: 16,
                    },
                },
            },
        },
    },
});

export const theme = responsiveFontSizes(baseTheme, {
    breakpoints: ['xs', 'sm', 'md', 'lg', 'xl'],
    factor: 2.5,
});
