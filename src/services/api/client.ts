import type { ApiResponse } from './types'
import { withRetry } from './retry'

const API_BASE = '/api/v1'

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path}`
  const token = localStorage.getItem('auth_token')

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
