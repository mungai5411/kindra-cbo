import { ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { theme } from '../theme/theme';

// Context is no longer needed for toggling, but we keep the hook for compatibility
// or simply remove it if we update all consumers. 
// For now, let's keep a dummy context to avoid breaking imports immediately, 
// but it will be static.
import { createContext, useContext } from 'react';

const ColorModeContext = createContext({ toggleColorMode: () => { } });

export const useColorMode = () => useContext(ColorModeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    // Strictly Light Mode - No State Needed

    return (
        <ColorModeContext.Provider value={{ toggleColorMode: () => { } }}>
            <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
        </ColorModeContext.Provider>
    );
};
