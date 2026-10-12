import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoLoader from './LogoLoader';

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LogoLoader fullPage label="Checking session…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
