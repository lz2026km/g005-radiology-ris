import { useSearchParams } from 'react-router-dom'
import { useCallback, useMemo } from 'react'

export interface QueryParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  status?: string
  modality?: string
  [key: string]: string | number | undefined
}

export function useQueryParams(defaults?: Partial<QueryParams>) {
  const [searchParams, setSearchParams] = useSearchParams()

  const params = useMemo(() => {
    const p: QueryParams = { ...defaults }
    for (const [key, value] of searchParams.entries()) {
      if (key === 'page' || key === 'pageSize') {
        p[key] = Number(value)
      } else {
        p[key] = value
      }
    }
    return p
  }, [searchParams, defaults])

  const setParams = useCallback((updates: Partial<QueryParams>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === '' || value === null) {
          next.delete(key)
        } else {
          next.set(key, String(value))
        }
      }
      return next
    })
  }, [setSearchParams])

  return { params, setParams }
}
