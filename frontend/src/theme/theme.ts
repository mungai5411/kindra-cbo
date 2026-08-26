import { createTheme, responsiveFontSizes, Theme, alpha } from '@mui/material/styles';

// Refined Minimalist Color Palette (Human-crafted editorial style)
const lightPalette = {
    mode: 'light' as const,
    primary: {
        main: '#0f172a',      // Sleek Slate / Charcoal
        light: '#334155',
        dark: '#020617',
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#2563eb',      // Accent Royal Blue
        light: '#60a5fa',
        dark: '#1d4ed8',
        contrastText: '#ffffff',
    },
    background: {
        default: '#fafafa',   // Soft minimal canvas
        paper: '#ffffff',
    },
    text: {
        primary: '#09090b',   // Crisp charcoal text
        secondary: '#52525b', // Muted body text
        disabled: '#a1a1aa',
    },
    divider: '#e4e4e7',      // Subtle 1px borders
};

const darkPalette = {
    mode: 'dark' as const,
    primary: {
        main: '#ffffff',
        light: '#f4f4f5',
        dark: '#e4e4e7',
        contrastText: '#09090b',
    },
    secondary: {
        main: '#3b82f6',
        light: '#60a5fa',
        dark: '#1d4ed8',
        contrastText: '#ffffff',
    },
    background: {
        default: '#09090b',
        paper: '#141417',
    },
    text: {
        primary: '#f4f4f5',
        secondary: '#a1a1aa',
        disabled: '#52525b',
    },
    divider: '#27272a',
};

export const getTheme = (mode: 'light' | 'dark'): Theme => {
    const palette = mode === 'light' ? lightPalette : darkPalette;

    const theme = createTheme({
        palette,
        typography: {
            fontFamily: '"Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            h1: { fontWeight: 800, fontSize: '2.75rem', letterSpacing: '-0.03em', color: palette.text.primary },
            h2: { fontWeight: 700, fontSize: '2.25rem', letterSpacing: '-0.02em', color: palette.text.primary },
            h3: { fontWeight: 700, fontSize: '1.65rem', letterSpacing: '-0.02em', color: palette.text.primary },
            h4: { fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.01em', color: palette.text.primary },
            h5: { fontWeight: 600, fontSize: '1rem', color: palette.text.primary },
            h6: { fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' },
            button: { fontWeight: 600, textTransform: 'none', fontSize: '0.875rem' },
            body1: { fontSize: '0.975rem', lineHeight: 1.65, color: palette.text.secondary },
            body2: { fontSize: '0.875rem', lineHeight: 1.55, color: palette.text.secondary },
        },
        shape: { borderRadius: 12 },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        transition: 'background-color 0.2s ease, color 0.2s ease',
                    }
                }
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        padding: '8px 20px',
                        transition: 'all 0.15s ease-in-out',
                        textTransform: 'none',
                        boxShadow: 'none',
                        fontWeight: 600,
                        '&:hover': { 
                            boxShadow: 'none',
                            opacity: 0.92,
                        },
                    },
                    containedPrimary: {
                        background: palette.primary.main,
                        color: palette.primary.contrastText,
                        '&:hover': {
                            background: palette.primary.light,
                            boxShadow: 'none',
                        },
                    },
                    containedSecondary: {
                        background: palette.secondary.main,
                        color: palette.secondary.contrastText,
                        '&:hover': {
                            background: palette.secondary.dark,
                            boxShadow: 'none',
                        }
                    },
                    outlinedPrimary: {
                        borderWidth: 1,
                        borderColor: palette.divider,
                        color: palette.text.primary,
                        '&:hover': {
                            borderWidth: 1,
                            borderColor: palette.text.primary,
                            background: alpha(palette.text.primary, 0.04),
                        }
                    }
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,
                        border: `1px solid ${palette.divider}`,
                        backgroundColor: palette.background.paper,
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                        transition: 'border-color 0.2s ease, transform 0.2s ease',
                        '&:hover': {
                            borderColor: mode === 'light' ? '#cbd5e1' : '#3f3f46',
                        }
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        backgroundColor: palette.background.paper,
                        borderRadius: 16,
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                        border: `1px solid ${palette.divider}`,
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 8,
                            backgroundColor: mode === 'dark' ? alpha('#fff', 0.02) : '#fff',
                            '& fieldset': { borderColor: palette.divider },
                            '&:hover fieldset': { borderColor: mode === 'light' ? '#94a3b8' : '#52525b' },
                            '&.Mui-focused fieldset': { borderColor: palette.primary.main, borderWidth: 1 },
                        },
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'dark' ? '#09090b' : 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(8px)',
                        color: palette.text.primary,
                        boxShadow: 'none',
                        borderBottom: `1px solid ${palette.divider}`,
                    },
                },
            },
        },
    });

    return responsiveFontSizes(theme);
};

export const theme = getTheme('light');
