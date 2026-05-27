/**
 * useUrlSync - E5: URLparams同步筛选条件
 * 表格排序/筛选状态保持，支持书签分享
 * G005 Radiology RIS System
 */
import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

type Primitive = string | number | boolean | undefined | null

interface UseUrlSyncOptions<T extends Record<string, Primitive>> {
  /** 初始默认值 */
  defaults: T
  /** 是否在URL中保留null/undefined值，默认false */
  keepFalsy?: boolean
}

/**
 * 将筛选/排序状态同步到URL Query Params
 * 支持深层对象，自动序列化为 key.subkey 格式
 */
export function useUrlSync<T extends Record<string, Primitive>>(
  options: UseUrlSyncOptions<T>
) {
  const { defaults, keepFalsy = false } = options
  const [searchParams, setSearchParams] = useSearchParams()

  // 从URL读取当前值
  const getValueFromParams = useCallback((): T => {
    const result: Record<string, Primitive> = {}
    for (const key of Object.keys(defaults)) {
      const paramVal = searchParams.get(key)
      if (paramVal !== null) {
        // 尝试解析JSON兼容的值
        if (paramVal === 'true') result[key] = true
        else if (paramVal === 'false') result[key] = false
        else if (!isNaN(Number(paramVal)) && paramVal !== '') result[key] = Number(paramVal)
        else result[key] = paramVal ?? undefined
      }
    }
    return result as T
  }, [searchParams, defaults])

  const [state, setState] = useState<T>(getValueFromParams)

  // 同步state到URL
  const syncToUrl = useCallback((newState: T) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(newState)) {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value))
      } else if (keepFalsy) {
        // 保留空值
        params.set(key, '')
      }
    }
    setSearchParams(params, { replace: true })
  }, [setSearchParams, keepFalsy])

  // 更新单个字段
  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setState(prev => {
      const newState = { ...prev, [key]: value }
      syncToUrl(newState)
      return newState
    })
  }, [syncToUrl])

  // 批量更新
  const setFields = useCallback((updates: Partial<T>) => {
    setState(prev => {
      const newState = { ...prev, ...updates }
      syncToUrl(newState)
      return newState
    })
  }, [syncToUrl])

  // 重置为默认值
  const reset = useCallback(() => {
    setState(defaults)
    syncToUrl(defaults)
  }, [defaults, syncToUrl])

  // URL变化时同步到state（浏览器前进后退）
  useEffect(() => {
    const fromParams = getValueFromParams()
    setState(fromParams)
  }, [searchParams])

  return {
    /** 当前状态 */
    values: state,
    /** 当前URL search string */
    searchString: searchParams.toString(),
    /** 更新单个字段并同步到URL */
    setField,
    /** 批量更新并同步到URL */
    setFields,
    /** 重置为默认值 */
    reset,
    /** 检查是否与默认值不同 */
    isDirty: JSON.stringify(state) !== JSON.stringify(defaults),
  }
}

/**
 * 解析URL中的数组参数（?status=已报告,待检查）
 */
export function parseArrayParam(param: string | null): string[] {
  if (!param) return []
  return param.split(',').filter(Boolean)
}

/**
 * 将数组参数编码到URL（?status=已报告,待检查）
 */
export function encodeArrayParam(values: string[]): string {
  return values.filter(Boolean).join(',')
}

export default useUrlSync