import { ReactNode, createContext, useContext, useMemo, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { getTheme } from '../theme/theme';

interface ColorModeContextType {
    mode: 'light';
    toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextType | undefined>(undefined);

export const useColorMode = () => {
    const context = useContext(ColorModeContext);
    if (!context) {
        throw new Error('useColorMode must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    // Theme mode is fixed to light
    const colorMode = useMemo(() => ({
        mode: 'light' as const,
        toggleColorMode: () => { }, // no-op — dark mode removed
    }), []);

    // Memoize theme creation to avoid recreation on every render
    const theme = useMemo(() => {
        try {
            return getTheme('light');
        } catch (error) {
            console.error('Failed to create theme:', error);
            // Fallback theme creation
            return getTheme('light');
        }
    }, []);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </ColorModeContext.Provider>
    );
};
