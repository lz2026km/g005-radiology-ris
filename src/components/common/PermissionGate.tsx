import type { ReactNode } from 'react';
import { useRBAC, type Permission } from '../../hooks/useRBAC';

interface PermissionGateProps {
  permission?: Permission | string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({ permission, fallback = null, children }: PermissionGateProps) {
  const { can } = useRBAC();
  if (!permission) return <>{children}</>;
  return can(permission as Permission) ? <>{children}</> : <>{fallback}</>;
}
