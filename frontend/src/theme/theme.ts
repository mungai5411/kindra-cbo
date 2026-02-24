import { createTheme, responsiveFontSizes, Theme, alpha } from '@mui/material/styles';

// Premium Color Palettes
const lightPalette = {
    mode: 'light' as const,
    primary: {
        main: '#43A047',
        light: '#76D275',
        dark: '#00701A',
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#FFB300',
        light: '#FFE54C',
        dark: '#C68400',
        contrastText: '#1a2e1c',
    },
    background: {
        default: '#F9FAFB',
        paper: '#ffffff',
    },
    text: {
        primary: '#1A2327',
        secondary: '#455A64',
        disabled: '#90A4AE',
    },
};

const darkPalette = {
    mode: 'dark' as const,
    primary: lightPalette.primary,
    secondary: lightPalette.secondary,
    background: {
        default: '#050505',
        paper: '#0A0A0A',
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

    let theme = createTheme({
        palette,
        typography: {
            fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            h1: { fontWeight: 800, fontSize: '2.25rem', letterSpacing: '-0.04em' },
            h2: { fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.03em' },
            h3: { fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.02em' },
            h4: { fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.01em' },
            h5: { fontWeight: 600, fontSize: '0.95rem' },
            h6: { fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' },
            button: { fontWeight: 700, textTransform: 'none', fontSize: '0.8125rem' },
            body1: { fontSize: '0.875rem', lineHeight: 1.6 },
            body2: { fontSize: '0.75rem', lineHeight: 1.6 },
        },
        shape: { borderRadius: 12 },
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
                        borderRadius: 10,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        textTransform: 'none',
                        '&:hover': { transform: 'translateY(-1.5px)' },
                    },
                    containedPrimary: {
                        background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.dark} 100%)`,
                        '&:hover': {
                            background: `linear-gradient(135deg, ${palette.primary.light} 0%, ${palette.primary.main} 100%)`,
                        },
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,
                        border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.06)',
                        backgroundColor: mode === 'dark' ? alpha('#111', 0.6) : '#fff',
                        backdropFilter: mode === 'dark' ? 'blur(10px)' : 'none',
                        backgroundImage: 'none',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        backgroundColor: palette.background.paper,
                        borderRadius: 16,
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 10,
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
                        backgroundColor: mode === 'dark' ? alpha('#050505', 0.8) : 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(12px)',
                        color: palette.text.primary,
                        boxShadow: 'none',
                        borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        backgroundColor: palette.background.paper,
                        borderRight: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                    },
                },
            },
            MuiTableCell: {
                styleOverrides: {
                    head: {
                        backgroundColor: mode === 'dark' ? alpha('#fff', 0.02) : '#f9fafb',
                    },
                },
            },
        },
    });

    return responsiveFontSizes(theme);
};

// Keep the static export for locations still using it, but they should transition to the context
export const theme = getTheme('light');
