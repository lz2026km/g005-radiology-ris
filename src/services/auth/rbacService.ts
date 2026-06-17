export type Permission =
  | 'report.create' | 'report.edit' | 'report.view' | 'report.delete' | 'report.approve' | 'report.sign' | 'report.publish'
  | 'patient.create' | 'patient.edit' | 'patient.view'
  | 'exam.create' | 'exam.update' | 'exam.delete' | 'exam.view'
  | 'user.manage' | 'user.view' | 'user.create' | 'user.update' | 'user.delete'
  | 'system.admin' | 'audit.view' | 'audit.approve'
  | 'template.edit' | 'template.use'
  | 'critical.ack' | 'critical.manage'
  | 'stats.view' | 'stats.export';

export type ResourceType = 'report' | 'patient' | 'exam' | 'user' | 'template' | 'critical' | 'stats' | 'system';

export interface Role {
  id: string;
  name: string;
  parent?: string;
  permissions: Permission[];
  description: string;
}

export const ROLES: Record<string, Role> = {
  'super-admin': { id: 'super-admin', name: '超级管理员', permissions: ['report.create', 'report.edit', 'report.view', 'report.delete', 'report.approve', 'report.sign', 'report.publish', 'patient.create', 'patient.edit', 'patient.view', 'exam.create', 'exam.update', 'exam.delete', 'user.manage', 'user.view', 'user.create', 'user.update', 'user.delete', 'system.admin', 'audit.view', 'audit.approve', 'template.edit', 'template.use', 'critical.ack', 'critical.manage', 'stats.view', 'stats.export'], description: '全部权限' },
  'admin': { id: 'admin', name: '管理员', parent: 'super-admin', permissions: ['user.manage', 'user.create', 'user.update', 'user.delete', 'system.admin', 'stats.view', 'audit.view', 'audit.approve'], description: '系统管理' },
  'director': { id: 'director', name: '科主任', parent: 'admin', permissions: ['report.approve', 'report.sign', 'report.view', 'report.publish', 'stats.view', 'stats.export', 'template.edit', 'critical.manage', 'audit.approve'], description: '审核/统计' },
  'doctor': { id: 'doctor', name: '诊断医师', parent: 'director', permissions: ['report.create', 'report.edit', 'report.view', 'patient.view', 'exam.view', 'template.use', 'critical.ack'], description: '写报告' },
  'technician': { id: 'technician', name: '技师', parent: 'doctor', permissions: ['exam.create', 'exam.update', 'patient.view', 'exam.view'], description: '检查操作' },
  'nurse': { id: 'nurse', name: '护士', permissions: ['patient.view', 'patient.edit', 'critical.ack'], description: '护理/通知' },
};

export function hasPermission(userRole: string, requiredPermission: Permission): boolean {
  const role = ROLES[userRole];
  if (!role) return false;
  if (role.permissions.includes('*' as any)) return true;
  if (role.permissions.includes(requiredPermission)) return true;
  if (role.parent) return hasPermission(role.parent, requiredPermission);
  return false;
}

export interface AccessContext {
  user: { role: string; department: string; userId: string; };
  resource: { type: ResourceType; ownerDept?: string; ownerId?: string; };
  action: 'create' | 'read' | 'update' | 'delete' | 'approve';
  environment: { time: Date; location?: string; };
}

export function canApprove(userId: string, resourceOwnerId: string): boolean {
  return userId !== resourceOwnerId;
}

export function checkAccess(ctx: AccessContext): boolean {
  // Fix 1: Deny self-approval
  if (ctx.action === 'approve' && ctx.resource.ownerId && ctx.resource.ownerId === ctx.user.userId) return false;

  if (hasPermission(ctx.user.role, `${ctx.resource.type}.${ctx.action}` as Permission)) return true;

  // Fix 2: Patient-level access control
  if (ctx.resource.type === 'patient') {
    if (ctx.action === 'read') {
      if (ctx.resource.ownerId && ctx.resource.ownerId === ctx.user.userId) return true;
      if (ctx.resource.ownerDept && ctx.user.department === ctx.resource.ownerDept) return true;
    }
    return false;
  }

  if (ctx.action === 'read' && ctx.resource.ownerDept && ctx.user.department === ctx.resource.ownerDept) return true;
  return false;
}
