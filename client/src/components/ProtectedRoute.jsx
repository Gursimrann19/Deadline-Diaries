import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ instructorOnly = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (instructorOnly && user.role !== 'instructor') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
