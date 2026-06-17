/**
 * useAuth Hook - 用户认证与角色管理
 * G005 Radiology RIS System v3.0.3.31
 *
 * v3.0.3.31: 修复硬编码管理员 — 从 localStorage 读取已登录用户,无登录态返回 null
 */
import { useMemo } from 'react';
import type { User, UserRole } from '../types';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
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

const AUTH_STORAGE_KEY = 'ris_current_user';

function loadCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function useAuth(): UseAuthReturn {
  const user = loadCurrentUser();

  const isAuthenticated = user !== null;
  const isAdmin = useMemo(() => user?.role === '管理员', [user?.role]);
  const isDoctor = useMemo(() => user?.role === '医生' || user?.role === '主任', [user?.role]);
  const isTechnician = useMemo(() => user?.role === '技师', [user?.role]);

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
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
    if (!user) return false;
    const requiredRoles = pathPermissions[path];
    if (!requiredRoles) return true;
    return hasRole(requiredRoles);
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    isDoctor,
    isTechnician,
    hasRole,
    canAccess,
  };
}

export default useAuth;