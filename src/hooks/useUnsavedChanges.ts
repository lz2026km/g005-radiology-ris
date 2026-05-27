// @ts-nocheck
/**
 * useUnsavedChanges - E10: 字段修改后底部出现"您有未保存的更改"提示
 * 患者信息修改变更提示
 * G005 Radiology RIS System
 */
import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

interface UseUnsavedChangesOptions {
  /** 是否有未保存的更改 */
  isDirty: boolean
  /** 自定义提示消息 */
  message?: string
  /** 是否启用浏览器原生beforeunload提示，默认true */
  enableNativePrompt?: boolean
}

/**
 * 监测未保存更改的Hook
 * 在表单有变更但未保存时，显示底部提示条
 * 同时防止用户意外导航离开
 */
export function useUnsavedChanges(options: UseUnsavedChangesOptions) {
  const { isDirty, message = '您有未保存的更改', enableNativePrompt = true } = options
  const [showBanner, setShowBanner] = useState(false)
  const navigate = useNavigate()
  const guardEnabledRef = useRef(false)

  // 同步脏状态
  useEffect(() => {
    setShowBanner(isDirty)
  }, [isDirty])

  // 浏览器原生离开提示
  useEffect(() => {
    if (!enableNativePrompt) return

    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = message
        return message
      }
    }

    if (isDirty) {
      window.addEventListener('beforeunload', handler)
      guardEnabledRef.current = true
    }

    return () => {
      window.removeEventListener('beforeunload', handler)
      guardEnabledRef.current = false
    }
  }, [isDirty, enableNativePrompt, message])

  // 路由守卫：当有未保存更改时，导航前提示
  useEffect(() => {
    if (!isDirty) return

    const handleRouteChange = (e: PopStateEvent) => {
      const confirmed = window.confirm(message + '，确定要离开吗？')
      if (!confirmed) {
        e.preventDefault()
        window.history.pushState(null, '', window.location.href)
      }
    }

    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [isDirty, message])

  return {
    /** 是否显示底部未保存提示条 */
    showBanner,
    /** 手动隐藏提示（但不清除脏状态） */
    dismissBanner: () => setShowBanner(false),
  }
}

/**
 * 未保存更改提示条组件
 */
interface UnsavedChangesBannerProps {
  message?: string
  onSave?: () => void
  onDiscard?: () => void
}

export function UnsavedChangesBanner({
  message = '您有未保存的更改',
  onSave,
  onDiscard,
}: UnsavedChangesBannerProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fef3c7',
        borderTop: '1px solid #f59e0b',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 9997,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, color: '#92400e', fontWeight: 500 }}>{message}</span>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {onDiscard && (
          <button
            onClick={onDiscard}
            style={{
              padding: '6px 16px',
              fontSize: 13,
              border: '1px solid #d97706',
              borderRadius: 6,
              background: 'transparent',
              color: '#92400e',
              cursor: 'pointer',
            }}
          >
            放弃更改
          </button>
        )}
        {onSave && (
          <button
            onClick={onSave}
            style={{
              padding: '6px 16px',
              fontSize: 13,
              border: 'none',
              borderRadius: 6,
              background: '#f59e0b',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            保存更改
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * 通用表单变更追踪Hook
 * 用于表单组件内部，自动追踪字段变更
 */
export function useFormDirtyState<T extends Record<string, unknown>>(initialValues: T) {
  const [initial] = useState<T>(initialValues)
  const [current, setCurrent] = useState<T>(initialValues)

  const isDirty = useCallback(() => {
    return JSON.stringify(current) !== JSON.stringify(initial)
  }, [current, initial])

  const getChangedFields = useCallback(() => {
    const changed: Partial<T> = {}
    for (const key of Object.keys(initial)) {
      if (current[key as keyof T] !== initial[key as keyof T]) {
        (changed as Record<string, unknown>)[key] = current[key as keyof T]
      }
    }
    return changed
  }, [current, initial])

  const resetToInitial = useCallback(() => {
    setCurrent(initial)
  }, [initial])

  return {
    current,
    setCurrent,
    isDirty,
    getChangedFields,
    resetToInitial,
  }
}

export default useUnsavedChanges