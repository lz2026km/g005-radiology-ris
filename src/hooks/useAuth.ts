/**
 * useAuth Hook - 用户认证与角色管理
 * G005 Radiology RIS System
 */
import { useMemo } from 'react';
import type { User, UserRole } from '../types';

interface UseAuthReturn {
  user: User;
  isAdmin: boolean;
  isDoctor: boolean;
  isTechnician: boolean;
  hasRole: (roles: UserRole[]) => boolean;
  canAccess: (path: string) => boolean;
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  '管理员': 100,
  '主任': 90,
  '医生': 70,
  '技师': 50,
  '护士': 40,
};

// 默认用户 (临时数据，实际应从context或API获取)
const defaultUser: User = {
  id: 'U001',
  name: '李明辉',
  role: '管理员',
  department: '放射科',
  phone: '13800138000',
  username: 'liminghui',
  title: '主任医师',
  specialty: 'CT/MR',
};

export function useAuth(): UseAuthReturn {
  const user = defaultUser;

  const isAdmin = useMemo(() => user.role === '管理员', [user.role]);
  const isDoctor = useMemo(() => user.role === '医生' || user.role === '主任', [user.role]);
  const isTechnician = useMemo(() => user.role === '技师', [user.role]);

  const hasRole = (roles: UserRole[]): boolean => {
    return roles.includes(user.role);
  };

  // 路径权限映射
  const pathPermissions: Record<string, UserRole[]> = {
    '/authority': ['管理员'],
    '/system/dicom-print': ['技师', '管理员'],
    '/equipment-lifecycle': ['技师', '主任', '管理员'],
    '/cost-analysis': ['主任', '管理员'],
  };

  const canAccess = (path: string): boolean => {
    const requiredRoles = pathPermissions[path];
    if (!requiredRoles) return true; // 默认允许访问
    return hasRole(requiredRoles);
  };

  return {
    user,
    isAdmin,
    isDoctor,
    isTechnician,
    hasRole,
    canAccess,
  };
}

export default useAuth;