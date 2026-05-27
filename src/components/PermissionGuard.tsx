/**
 * RBAC Permission Component
 * G005 Radiology RIS System
 * S6: Button-level permission control
 */
import React from 'react';
import { hasPermission, hasAnyPermission, hasAllPermissions, Permission, User } from '../types';

interface PermissionGuardProps {
  /**
   * Required permission(s) to render children
   */
  permission: Permission | Permission[];
  /**
   * Require all permissions (AND) vs any permission (OR)
   */
  requireAll?: boolean;
  /**
   * Fallback element to render when permission denied
   */
  fallback?: React.ReactNode;
  /**
   * Current user (defaults to context user)
   */
  user?: User;
  /**
   * Children to render when permitted
   */
  children: React.ReactNode;
}

/**
 * Permission Guard Component
 * Controls rendering based on user permissions
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  requireAll = false,
  fallback = null,
  user,
  children,
}) => {
  // Get current user from context or props
  const currentUser = user || getCurrentUserFromContext();
  
  if (!currentUser) {
    return <>{fallback}</>;
  }

  const permissions = Array.isArray(permission) ? permission : [permission];
  const hasAccess = requireAll
    ? hasAllPermissions(currentUser, permissions)
    : hasAnyPermission(currentUser, permissions);

  return <>{hasAccess ? children : fallback}</>;
};

/**
 * Get current user from app context
 */
function getCurrentUserFromContext(): User | null {
  // This would be connected to the app's auth context
  // For now, returns null - app should provide this
  return null;
}

// ========== Permission Hooks ==========

interface UsePermissionReturn {
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canAll: (permissions: Permission[]) => boolean;
}

/**
 * Hook to check permissions in components
 */
export function usePermission(user?: User): UsePermissionReturn {
  const currentUser = user || getCurrentUserFromContext();
  
  return {
    can: (permission: Permission) => currentUser ? hasPermission(currentUser, permission) : false,
    canAny: (permissions: Permission[]) => currentUser ? hasAnyPermission(currentUser, permissions) : false,
    canAll: (permissions: Permission[]) => currentUser ? hasAllPermissions(currentUser, permissions) : false,
  };
}

// ========== HOC for Permission Wrapping ==========

type ComponentProps = Record<string, unknown>;

/**
 * Higher Order Component for permission checking
 */
export function withPermission<P extends ComponentProps>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermission: Permission | Permission[],
  requireAll = false
): React.FC<P> {
  return function PermissionWrapper(props: P) {
    return (
      <PermissionGuard permission={requiredPermission} requireAll={requireAll}>
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  };
}

// ========== Pre-built Permission Button Components ==========

interface PermissionButtonProps {
  permission: Permission | Permission[];
  requireAll?: boolean;
  user?: User;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Button with permission control
 */
export const PermissionButton: React.FC<PermissionButtonProps> = ({
  permission,
  requireAll = false,
  user,
  className = '',
  style,
  disabled = false,
  onClick,
  children,
  variant = 'primary',
  size = 'md',
}) => {
  return (
    <PermissionGuard permission={permission} requireAll={requireAll} user={user}>
      <button
        className={`permission-btn permission-btn-${variant} permission-btn-${size} ${className}`}
        style={style}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
    </PermissionGuard>
  );
};

// ========== RBAC Debug Panel (Development Only) ==========

interface RbacDebugProps {
  user: User;
}

/**
 * Development tool to show current user's permissions
 */
export const RbacDebug: React.FC<RbacDebugProps> = ({ user }) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const permissions = ROLE_PERMISSIONS[user.role] || [];

  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      background: 'rgba(0,0,0,0.9)',
      color: '#fff',
      padding: 15,
      borderRadius: 8,
      fontSize: 12,
      maxWidth: 300,
      zIndex: 9999,
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
        🔐 RBAC Debug
      </div>
      <div>User: {user.name} ({user.role})</div>
      <div style={{ marginTop: 8 }}>
        Permissions: {permissions.length}
      </div>
      <div style={{ marginTop: 8, fontSize: 10, maxHeight: 150, overflow: 'auto' }}>
        {permissions.join(', ')}
      </div>
    </div>
  );
};

// Re-export ROLE_PERMISSIONS for convenience
export { ROLE_PERMISSIONS } from '../types';