export type Permission =
  | 'report.create' | 'report.edit' | 'report.view' | 'report.delete' | 'report.approve' | 'report.sign'
  | 'patient.create' | 'patient.edit' | 'patient.view'
  | 'exam.create' | 'exam.update' | 'exam.delete'
  | 'user.manage' | 'user.view'
  | 'system.admin' | 'audit.view'
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
  'super-admin': { id: 'super-admin', name: '超级管理员', permissions: ['report.create', 'report.edit', 'report.view', 'report.delete', 'report.approve', 'report.sign', 'patient.create', 'patient.edit', 'patient.view', 'exam.create', 'exam.update', 'exam.delete', 'user.manage', 'user.view', 'system.admin', 'audit.view', 'template.edit', 'template.use', 'critical.ack', 'critical.manage', 'stats.view', 'stats.export'], description: '全部权限' },
  'admin': { id: 'admin', name: '管理员', parent: 'super-admin', permissions: ['user.manage', 'system.admin', 'stats.view', 'audit.view'], description: '系统管理' },
  'director': { id: 'director', name: '科主任', parent: 'admin', permissions: ['report.approve', 'report.sign', 'report.view', 'stats.view', 'stats.export', 'template.edit', 'critical.manage'], description: '审核/统计' },
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
  user: { role: string; department: string; };
  resource: { type: ResourceType; ownerDept?: string; ownerId?: string; };
  action: 'create' | 'read' | 'update' | 'delete' | 'approve';
  environment: { time: Date; location?: string; };
}

export function checkAccess(ctx: AccessContext): boolean {
  if (hasPermission(ctx.user.role, `${ctx.resource.type}.${ctx.action}` as Permission)) return true;
  if (ctx.action === 'read' && ctx.resource.ownerDept && ctx.user.department === ctx.resource.ownerDept) return true;
  return false;
}
