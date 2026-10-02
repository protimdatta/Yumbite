import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAuth } from '../../context/AuthContext';

export function UserProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yumbite-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-yumbite-yellow/30 border-t-yumbite-yellow rounded-full animate-spin" />
          <p className="text-yumbite-muted text-body-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yumbite-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-yumbite-yellow/30 border-t-yumbite-yellow rounded-full animate-spin" />
          <p className="text-yumbite-muted text-body-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

export function AdminProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, admin } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yumbite-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-yumbite-yellow/30 border-t-yumbite-yellow rounded-full animate-spin" />
          <p className="text-yumbite-muted text-body-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yumbite-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-yumbite-yellow/30 border-t-yumbite-yellow rounded-full animate-spin" />
          <p className="text-yumbite-muted text-body-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}