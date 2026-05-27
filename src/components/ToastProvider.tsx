/**
 * Toast Notification System - E1: 统一操作成功/失败提示
 * G005 Radiology RIS System
 * 自定义实现，无需react-hot-toast依赖
 */
import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (type: ToastType, message: string, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={20} />,
  error: <XCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <Info size={20} />,
}

const toastColors: Record<ToastType, { bg: string; border: string; color: string; icon: string }> = {
  success: { bg: '#ecfdf5', border: '#10b981', color: '#059669', icon: '#10b981' },
  error: { bg: '#fef2f2', border: '#ef4444', color: '#dc2626', icon: '#ef4444' },
  warning: { bg: '#fffbeb', border: '#f59e0b', color: '#d97706', icon: '#f59e0b' },
  info: { bg: '#eff6ff', border: '#3b82f6', color: '#2563eb', icon: '#3b82f6' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const toast: Toast = { id, type, message, duration }
    
    setToasts(prev => [...prev, toast])
    
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }
  }, [removeToast])

  const success = useCallback((message: string, duration?: number) => showToast('success', message, duration), [showToast])
  const error = useCallback((message: string, duration?: number) => showToast('error', message, duration), [showToast])
  const warning = useCallback((message: string, duration?: number) => showToast('warning', message, duration), [showToast])
  const info = useCallback((message: string, duration?: number) => showToast('info', message, duration), [showToast])

  return (
    <ToastContext.Provider value={{ toasts, showToast, success, error, warning, info, removeToast }}>
      {children}
      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 9999,
        pointerEvents: 'none',
      }}>
        {toasts.map(toast => {
          const colors = toastColors[toast.type]
          return (
            <div
              key={toast.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                pointerEvents: 'auto',
                minWidth: 300,
                maxWidth: 400,
                animation: 'slideIn 0.2s ease-out',
              }}
            >
              <span style={{ color: colors.icon, flexShrink: 0 }}>{toastIcons[toast.type]}</span>
              <span style={{ flex: 1, fontSize: 14, color: colors.color }}>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: colors.color,
                  padding: 4,
                  display: 'flex',
                  borderRadius: 4,
                  opacity: 0.7,
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
              >
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

// 便捷导出
export const toast = {
  success: (message: string, duration?: number) => useToast().success(message, duration),
  error: (message: string, duration?: number) => useToast().error(message, duration),
  warning: (message: string, duration?: number) => useToast().warning(message, duration),
  info: (message: string, duration?: number) => useToast().info(message, duration),
}

export default ToastProvider