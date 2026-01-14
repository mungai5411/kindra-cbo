/**
 * Main App Component
 */

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
// Contexts
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthModalProvider, useAuthModal } from './contexts/AuthModalContext';
import CssBaseline from '@mui/material/CssBaseline';
import ProtectedRoute from './components/ProtectedRoute';

// Page Components
import HomePage from './pages/HomePage';
// LoginPage removed
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';
import StoriesPage from './pages/StoriesPage';
import BlogPostPage from './pages/BlogPostPage';
import DonationsPage from './pages/DonationsPage';
// RegisterPage removed
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { PendingApprovalView } from './components/auth/PendingApprovalView';

// Modals
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';

// Component to handle /login redirect
const LoginRedirect = () => {
    const { openLoginModal } = useAuthModal();
    const navigate = useNavigate();

    useEffect(() => {
        openLoginModal();
        navigate('/', { replace: true });
    }, [openLoginModal, navigate]);

    return null;
};

// Component to handle /register redirect
const RegisterRedirect = () => {
    const { openRegisterModal } = useAuthModal();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const role = params.get('role');
        openRegisterModal(role || undefined);
        navigate('/', { replace: true });
    }, [openRegisterModal, navigate, location]);

    return null;
};

function App() {
    return (
        <ThemeProvider>
            <AuthModalProvider>
                <CssBaseline />
                <Router>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/login" element={<LoginRedirect />} />
                        <Route path="/register" element={<RegisterRedirect />} />
                        <Route path="/pending-approval" element={<PendingApprovalView />} />

                        {/* Consolidated Blog & Stories */}
                        <Route path="/blog" element={<StoriesPage />} />
                        <Route path="/blog/:slug" element={<BlogPostPage />} />
                        <Route path="/stories" element={<StoriesPage />} />

                        <Route path="/donate" element={<DonationsPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />

                        {/* Protected routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <DashboardPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Redirect unknown routes to home */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    <LoginModal />
                    <RegisterModal />
                </Router>
            </AuthModalProvider>
        </ThemeProvider>
    );
}

export default App;
