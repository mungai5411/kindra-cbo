import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user && !user.is_approved && !user.is_staff && !user.is_superuser) {
        return <Navigate to="/pending-approval" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect unauthorized access to dashboard or home
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
