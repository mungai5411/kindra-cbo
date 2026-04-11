import { createTheme, responsiveFontSizes, Theme, alpha } from '@mui/material/styles';

// Trafalgar Color Palettes
const lightPalette = {
    mode: 'light' as const,
    primary: {
        main: '#458FF6',
        light: '#7AAFFF',
        dark: '#2A6FD6',
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#1F1534',
        light: '#3C2E5D',
        dark: '#0D0819',
        contrastText: '#ffffff',
    },
    background: {
        default: '#FFFFFF',
        paper: '#FFFFFF',
    },
    text: {
        primary: '#000000',
        secondary: '#7D7987',
        disabled: '#C4C4C4',
    },
    divider: 'rgba(0, 0, 0, 0.05)',
};

const darkPalette = {
    mode: 'dark' as const,
    primary: lightPalette.primary,
    secondary: {
        main: '#FFFFFF',
        contrastText: '#000000',
    },
    background: {
        default: '#121212',
        paper: '#1E1E1E',
    },
    text: {
        primary: '#ffffff',
        secondary: 'rgba(255, 255, 255, 0.7)',
        disabled: 'rgba(255, 255, 255, 0.4)',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
};

export const getTheme = (mode: 'light' | 'dark'): Theme => {
    const palette = mode === 'light' ? lightPalette : darkPalette;

    const theme = createTheme({
        palette,
        typography: {
            fontFamily: '"Mulish", "Inter", "Roboto", sans-serif',
            h1: { fontWeight: 800, fontSize: '3rem', letterSpacing: '-0.02em', color: palette.text.primary },
            h2: { fontWeight: 700, fontSize: '2.5rem', letterSpacing: '-0.01em', color: palette.text.primary },
            h3: { fontWeight: 700, fontSize: '1.8rem', letterSpacing: '-0.01em', color: palette.text.primary },
            h4: { fontWeight: 600, fontSize: '1.25rem', color: palette.text.primary },
            h5: { fontWeight: 600, fontSize: '1rem', color: palette.text.primary },
            h6: { fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' },
            button: { fontWeight: 700, textTransform: 'none', fontSize: '0.9rem' },
            body1: { fontSize: '1rem', lineHeight: 1.7, color: palette.text.secondary },
            body2: { fontSize: '0.875rem', lineHeight: 1.6, color: palette.text.secondary },
        },
        shape: { borderRadius: 8 },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        transition: 'background-color 0.3s ease, color 0.3s ease',
                    }
                }
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        padding: '10px 28px',
                        transition: 'all 0.3s ease',
                        textTransform: 'none',
                        boxShadow: 'none',
                        '&:hover': { 
                            transform: 'translateY(-2px)',
                            boxShadow: mode === 'light' ? '0 10px 20px rgba(69, 143, 246, 0.2)' : 'none'
                        },
                    },
                    containedPrimary: {
                        background: palette.primary.main,
                        '&:hover': {
                            background: palette.primary.light,
                            boxShadow: '0 10px 20px rgba(69, 143, 246, 0.3)',
                        },
                    },
                    containedSecondary: {
                        borderRadius: 8
                    },
                    outlinedPrimary: {
                        borderWidth: 2,
                        borderRadius: 8,
                        '&:hover': {
                            borderWidth: 2,
                            background: alpha(palette.primary.main, 0.04),
                        }
                    }
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 12, // Standard card radius
                        border: 'none',
                        backgroundColor: mode === 'dark' ? '#1E1E1E' : '#ffffff',
                        boxShadow: mode === 'dark' ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.05)',
                        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        backgroundColor: palette.background.paper,
                        borderRadius: 12, // Standard paper radius
                        boxShadow: mode === 'dark' ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.05)',
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 8,
                            backgroundColor: mode === 'dark' ? alpha('#fff', 0.03) : '#fff',
                            '& fieldset': { borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' },
                            '&:hover fieldset': { borderColor: palette.primary.main },
                        },
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'dark' ? '#000000' : 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(12px)',
                        color: palette.text.primary,
                        boxShadow: 'none',
                        borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                    },
                },
            },
        },
    });

    return responsiveFontSizes(theme);
};

export const theme = getTheme('light');
