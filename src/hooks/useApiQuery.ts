import { useState, useEffect, useCallback } from 'react'
import type { ApiResponse } from '../services/api/types'

export interface UseApiQueryOptions<T> {
  fallback?: T
  immediate?: boolean
}

export interface UseApiQueryResult<T> {
  data: T | undefined
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useApiQuery<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  options: UseApiQueryOptions<T> = {}
): UseApiQueryResult<T> {
  const { fallback, immediate = true } = options
  const [data, setData] = useState<T | undefined>(fallback)
  const [loading, setLoading] = useState<boolean>(immediate)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async (): Promise<void> => {
    setLoading(true)
    try {
      const res = await fetcher()
      if (res.success) {
        setData(res.data)
        setError(null)
      } else {
        setError(res.error?.message ?? 'API 调用失败')
        if (fallback !== undefined) setData(fallback)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误')
      if (fallback !== undefined) setData(fallback)
    } finally {
      setLoading(false)
    }
  }, [fetcher, fallback])

  useEffect(() => {
    if (immediate) {
      void refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { data, loading, error, refetch }
}
