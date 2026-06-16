import { hasPermission, checkAccess } from '../services/auth/rbacService';
import type { Permission, AccessContext, ResourceType } from '../services/auth/rbacService';

export function useRBAC() {
  const userRole = 'doctor';
  return {
    can: (permission: Permission) => hasPermission(userRole, permission),
    checkAccess: (ctx: Omit<AccessContext, 'user'>) => checkAccess({ user: { role: userRole, department: '放射科' }, ...ctx }),
  };
}

export type { Permission, AccessContext, ResourceType };
