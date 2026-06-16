import type { ReactNode } from 'react';
import { useRBAC } from '../../hooks/useRBAC';
import type { Permission } from '../../hooks/useRBAC';

interface PermissionGateProps {
  permission?: Permission;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({ permission, fallback = null, children }: PermissionGateProps) {
  const { can } = useRBAC();
  if (!permission || can(permission)) return <>{children}</>;
  return <>{fallback}</>;
}
