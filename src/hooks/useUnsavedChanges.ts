/**
 * useUnsavedChanges - E10: 字段修改后底部出现"您有未保存的更改"提示
 * 患者信息修改变更提示
 * G005 Radiology RIS System
 */
import React, { useEffect, useState, useCallback, useRef } from 'react'

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
      // 使用 beforeunload 模式而非 window.confirm 避免 headless 阻塞
      e.preventDefault()
      window.history.pushState(null, '', window.location.href)
    }

    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [isDirty])

  return {
    showBanner,
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

// Using React.createElement instead of JSX to avoid build issues
export function UnsavedChangesBanner({
  message = '您有未保存的更改',
  onSave,
  onDiscard,
}: UnsavedChangesBannerProps) {
  const containerStyle: React.CSSProperties = {
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
  }

  const textStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#92400e',
    fontWeight: 500,
  }

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: 12,
  }

  const discardButtonStyle: React.CSSProperties = {
    padding: '6px 16px',
    fontSize: 13,
    border: '1px solid #d97706',
    borderRadius: 6,
    background: 'transparent',
    color: '#92400e',
    cursor: 'pointer',
  }

  const saveButtonStyle: React.CSSProperties = {
    padding: '6px 16px',
    fontSize: 13,
    border: 'none',
    borderRadius: 6,
    background: '#f59e0b',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
  }

  return React.createElement('div', { style: containerStyle },
    React.createElement('span', { style: textStyle }, message),
    React.createElement('div', { style: buttonGroupStyle },
      onDiscard && React.createElement('button', {
        onClick: onDiscard,
        style: discardButtonStyle
      }, '放弃更改'),
      onSave && React.createElement('button', {
        onClick: onSave,
        style: saveButtonStyle
      }, '保存更改')
    )
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