
import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthModalContextType {
    isLoginOpen: boolean;
    openLoginModal: () => void;
    closeLoginModal: () => void;
    isRegisterOpen: boolean;
    openRegisterModal: (initialRole?: string) => void;
    closeRegisterModal: () => void;
    switchToRegister: () => void;
    switchToLogin: () => void;
    initialRole?: string;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [initialRole, setInitialRole] = useState<string | undefined>(undefined);

    const openLoginModal = () => {
        setIsRegisterOpen(false);
        setIsLoginOpen(true);
    };
    const closeLoginModal = () => setIsLoginOpen(false);

    const openRegisterModal = (role?: string) => {
        if (role) setInitialRole(role);
        setIsLoginOpen(false);
        setIsRegisterOpen(true);
    };
    const closeRegisterModal = () => {
        setIsRegisterOpen(false);
        setInitialRole(undefined);
    };

    const switchToRegister = () => {
        closeLoginModal();
        openRegisterModal();
    };

    const switchToLogin = () => {
        closeRegisterModal();
        openLoginModal();
    };

    return (
        <AuthModalContext.Provider value={{
            isLoginOpen,
            openLoginModal,
            closeLoginModal,
            isRegisterOpen,
            openRegisterModal,
            closeRegisterModal,
            switchToRegister,
            switchToLogin,
            initialRole
        }}>
            {children}
        </AuthModalContext.Provider>
    );
};

export const useAuthModal = () => {
    const context = useContext(AuthModalContext);
    if (!context) {
        throw new Error('useAuthModal must be used within an AuthModalProvider');
    }
    return context;
};
