import { useState, useCallback, useMemo } from 'react'

interface PaginationState {
  page: number
  pageSize: number
  total: number
}

interface PaginationReturn extends PaginationState {
  totalPages: number
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setTotal: (total: number) => void
  reset: () => void
}

export function usePagination(initialPage = 1, initialPageSize = 20): PaginationReturn {
  const [state, setState] = useState<PaginationState>({
    page: initialPage,
    pageSize: initialPageSize,
    total: 0,
  })

  const totalPages = useMemo(() => Math.max(1, Math.ceil(state.total / state.pageSize)), [state.total, state.pageSize])

  const setPage = useCallback((page: number) => setState((prev) => ({ ...prev, page })), [])
  const setPageSize = useCallback((pageSize: number) => setState((prev) => ({ ...prev, page: 1, pageSize })), [])
  const setTotal = useCallback((total: number) => setState((prev) => ({ ...prev, total })), [])
  const reset = useCallback(() => setState({ page: initialPage, pageSize: initialPageSize, total: 0 }), [initialPage, initialPageSize])

  return { ...state, totalPages, setPage, setPageSize, setTotal, reset }
}
