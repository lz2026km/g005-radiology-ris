import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';
import type { ReactNode } from 'react';

export function RequireAuth({ children, roles }: { children: ReactNode; roles?: UserRole[] }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && roles.length > 0 && user && !roles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }
  return <>{children}</>;
}
