import { ReactNode, createContext, useContext, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { getTheme } from '../theme/theme';

interface ColorModeContextType {
    mode: 'light';
    toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextType>({
    mode: 'light',
    toggleColorMode: () => { },
});

export const useColorMode = () => useContext(ColorModeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const colorMode = useMemo(() => ({
        mode: 'light' as const,
        toggleColorMode: () => { }, // no-op — dark mode removed
    }), []);

    const theme = useMemo(() => getTheme('light'), []);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
        </ColorModeContext.Provider>
    );
};
