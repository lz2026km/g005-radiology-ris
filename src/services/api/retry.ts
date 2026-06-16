export interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  shouldRetry?: (error: unknown) => boolean
}

const defaultOptions: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  shouldRetry: (error: unknown) => {
    if (error instanceof TypeError) return true
    if (typeof error === 'object' && error !== null) {
      const e = error as { code?: string; status?: number }
      if (e.code === 'NETWORK_ERROR') return true
      if (e.status && e.status >= 500) return true
    }
    return false
  },
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const { maxRetries, baseDelay, maxDelay, shouldRetry } = {
    ...defaultOptions,
    ...options,
  }

  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt < maxRetries && shouldRetry(err)) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
        const jitter = delay * 0.1 * Math.random()
        await new Promise((r) => setTimeout(r, delay + jitter))
      } else {
        throw err
      }
    }
  }

  throw lastError
}
