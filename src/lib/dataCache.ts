// P7: SWR/React Query数据缓存与去重
// 简单的数据缓存和请求去重工具

interface CacheEntry<T> {
  data: T
  timestamp: number
  expireAt: number
}

class SimpleDataCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map()
  private pendingRequests: Map<string, Promise<unknown>> = new Map()
  
  // 默认缓存时间：5分钟
  private defaultTTL = 5 * 60 * 1000
  
  // 获取缓存
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) return null
    
    // 检查是否过期
    if (Date.now() > entry.expireAt) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }
  
  // 设置缓存
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      expireAt: now + (ttl || this.defaultTTL)
    })
  }
  
  // 删除缓存
  delete(key: string): void {
    this.cache.delete(key)
  }
  
  // 清除所有缓存
  clear(): void {
    this.cache.clear()
  }
  
  // 获取或设置（带去重）
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    // 返回缓存数据（如果有效）
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }
    
    // 检查是否有正在进行的请求（去重）
    const pending = this.pendingRequests.get(key) as Promise<T> | undefined
    if (pending) {
      return pending
    }
    
    // 创建新请求
    const request = fetcher().then(data => {
      this.set(key, data, ttl)
      this.pendingRequests.delete(key)
      return data
    }).catch(error => {
      this.pendingRequests.delete(key)
      throw error
    })
    
    this.pendingRequests.set(key, request)
    return request
  }
  
  // 批量获取（不阻塞）
  async batchGet<T>(keys: string[], fetcher: (keys: string[]) => Promise<Record<string, T>>): Promise<Record<string, T>> {
    const result: Record<string, T> = {}
    const missingKeys: string[] = []
    
    // 收集所有未过期的缓存键
    for (const key of keys) {
      const cached = this.get<T>(key)
      if (cached !== null) {
        result[key] = cached
      } else {
        missingKeys.push(key)
      }
    }
    
    // 如果全部命中，直接返回
    if (missingKeys.length === 0) {
      return result
    }
    
    // 获取缺失的数据
    const fetched = await fetcher(missingKeys)
    for (const key of missingKeys) {
      if (fetched[key] !== undefined) {
        result[key] = fetched[key]
        this.set(key, fetched[key])
      }
    }
    
    return result
  }
  
  // 缓存统计
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// 全局缓存实例
export const globalCache = new SimpleDataCache()

// React Hook风格的缓存数据获取（模拟SWR）
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number
    revalidateOnFocus?: boolean
    dedupingInterval?: number
  } = {}
): {
  data: T | undefined
  error: Error | undefined
  isLoading: boolean
  mutate: () => Promise<void>
} {
  // 注意：这是简化版本，实际项目中应使用 SWR 或 React Query
  const [data, setData] = React.useState<T | undefined>(() => globalCache.get<T>(key))
  const [error, setError] = React.useState<Error | undefined>()
  const [isLoading, setIsLoading] = React.useState(false)
  
  const fetchData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await globalCache.getOrSet(key, fetcher, options.ttl)
      setData(result)
      setError(undefined)
    } catch (e) {
      setError(e as Error)
    } finally {
      setIsLoading(false)
    }
  }, [key, fetcher, options.ttl])
  
  React.useEffect(() => {
    fetchData()
  }, [fetchData])
  
  return {
    data,
    error,
    isLoading,
    mutate: fetchData
  }
}

// 数据去重装饰器
export function dedupe<T extends (...args: unknown[]) => unknown>(
  fn: T,
  interval = 2000
): T {
  const cache = new Map<string, { result: unknown; timestamp: number }>()
  
  return ((...args: unknown[]) => {
    const key = JSON.stringify(args)
    const now = Date.now()
    const cached = cache.get(key)
    
    if (cached && now - cached.timestamp < interval) {
      return cached.result as ReturnType<T>
    }
    
    const result = fn(...args)
    if (result instanceof Promise) {
      return result.then(res => {
        cache.set(key, { result: res, timestamp: now })
        return res
      }) as ReturnType<T>
    }
    
    cache.set(key, { result, timestamp: now })
    return result
  }) as T
}

// 全局导出
export default {
  globalCache,
  useCachedData,
  dedupe
}