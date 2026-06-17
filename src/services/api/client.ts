import type { ApiResponse } from './types'
import { withRetry } from './retry'
import { getToken } from '../../utils/auth'
import { checkAccess, type AccessContext, type ResourceType } from '../auth/rbacService'

const API_BASE = '/api/v1'

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path}`
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  const mergedOptions: RequestInit = {
    ...options,
    headers,
    signal: controller.signal,
  };

  try {
    const res = await withRetry(() => fetch(url, mergedOptions));
    clearTimeout(timeoutId);
    if (res.status === 204) return { success: true, data: null as unknown as T }
    const body = await res.json()
    if (!res.ok) {
      console.error(`[API] ${options.method || 'GET'} ${url} failed:`, body)
      return { success: false, data: null as unknown as T, error: body.error }
    }
    return body
  } catch (err) {
    clearTimeout(timeoutId);
    console.error(`[API] Network error ${options.method || 'GET'} ${url}:`, err)
    return {
      success: false,
      data: null as unknown as T,
      error: { code: 'NETWORK_ERROR', message: '网络错误，请检查连接' },
    }
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

// ────────────────────────────────────────────────────────────────────────────
// RBAC 资源级访问控制包装
// ────────────────────────────────────────────────────────────────────────────

export interface AccessGuard {
  user: { role: string; userId: string; department: string };
  resource: { type: ResourceType; ownerDept?: string; ownerId?: string };
  action: 'create' | 'read' | 'update' | 'delete' | 'approve';
}

/**
 * protectedRequest: 自动执行 RBAC 资源级访问检查,失败时短路并返回 ACCESS_DENIED 错误
 * 不修改原 request,以便在不需要资源级检查的接口继续使用 api.*
 */
export async function protectedRequest<T>(
  guard: AccessGuard,
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const ctx: AccessContext = {
    user: { role: guard.user.role, userId: guard.user.userId, department: guard.user.department },
    resource: { type: guard.resource.type, ownerDept: guard.resource.ownerDept, ownerId: guard.resource.ownerId },
    action: guard.action,
    environment: { time: new Date() },
  }
  if (!checkAccess(ctx)) {
    console.warn('[RBAC] Access denied', { path, guard })
    return {
      success: false,
      data: null as unknown as T,
      error: { code: 'ACCESS_DENIED', message: '当前用户无权访问该资源' },
    }
  }
  return request<T>(path, options)
}

// ────────────────────────────────────────────────────────────────────────────
// v3.0.4 Service Worker 缓存失效辅助
// ────────────────────────────────────────────────────────────────────────────

/**
 * 删除 Service Worker 运行时缓存中的指定 URL
 *
 * 适用于 POST/PUT/DELETE 后,让下一次 GET 走网络而非 stale-while-revalidate 旧值。
 * 在 Service Worker 未注册 / 未激活 / 无 controller 时静默 no-op。
 *
 * @param path API 路径(相对 `/api/v1` 基地址或绝对 URL 均可)
 *
 * @example
 *   await api.post('/reports/123/sign', {});
 *   await invalidateApiCache('/reports/123');
 */
export async function invalidateApiCache(path: string): Promise<void> {
  if (typeof navigator === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration().catch(() => null);
  if (!reg || !navigator.serviceWorker.controller) return;

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_API_CACHE', url });
}

/**
 * 按前缀批量删除 Service Worker 运行时缓存中的 URL
 *
 * 适用于"创建一条新检查 → 失效整个 worklist 缓存"这类场景。
 *
 * @param prefix URL 前缀,如 `/api/v1/worklist`
 */
export async function invalidateApiCacheByPrefix(prefix: string): Promise<void> {
  if (typeof navigator === 'undefined') return;
  if (!serviceWorkerAvailable()) return;
  const reg = await navigator.serviceWorker.getRegistration().catch(() => null);
  if (!reg || !navigator.serviceWorker.controller) return;

  navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_API_CACHE_PREFIX', prefix });
}

function serviceWorkerAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}
