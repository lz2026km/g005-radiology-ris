/**
 * Progress Bar / Spinner - E2: 长时间操作进度指示
 * G005 Radiology RIS System
 */
import React from 'react'
import { Loader2 } from 'lucide-react'

interface ProgressBarProps {
  value: number // 0-100
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: string
  bgColor?: string
}

interface SpinnerProps {
  size?: number
  color?: string
  text?: string
}

interface LoadingOverlayProps {
  text?: string
  progress?: number // 如果有进度值，显示进度条而不是spinner
}

/**
 * 线性进度条
 */
export function ProgressBar({ value, showLabel = true, size = 'md', color = '#3b82f6', bgColor = '#e2e8f0' }: ProgressBarProps) {
  const heights = { sm: 4, md: 8, lg: 12 }
  const h = heights[size]
  const pct = Math.min(100, Math.max(0, value))
  
  return (
    <div style={{ width: '100%' }}>
      <div style={{ height: h, background: bgColor, borderRadius: h / 2, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: h / 2,
          transition: 'width 0.3s ease',
        }} />
      </div>
      {showLabel && (
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, textAlign: 'right' }}>
          {Math.round(pct)}%
        </div>
      )}
    </div>
  )
}

/**
 * 环形加载中 Spinner
 */
export function Spinner({ size = 24, color = '#3b82f6', text }: SpinnerProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <Loader2 size={size} color={color} style={{ animation: 'spin 0.8s linear infinite' }} />
      {text && <span style={{ fontSize: 13, color: '#64748b' }}>{text}</span>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

/**
 * 全屏/遮罩 Loading 状态
 */
export function LoadingOverlay({ text = '加载中...', progress }: LoadingOverlayProps) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.7)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
      zIndex: 9998,
    }}>
      {progress !== undefined ? (
        <div style={{ width: 280 }}>
          <ProgressBar value={progress} showLabel text={`${text} ${Math.round(progress)}%`} size="lg" />
        </div>
      ) : (
        <>
          <Loader2 size={40} color="#3b82f6" style={{ animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: '#fff', fontSize: 15 }}>{text}</span>
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

/**
 * 文件上传进度条（带文件信息）
 */
interface UploadProgressProps {
  fileName: string
  progress: number // 0-100
  status?: 'uploading' | 'processing' | 'complete' | 'error'
}

export function UploadProgress({ fileName, progress, status = 'uploading' }: UploadProgressProps) {
  const statusConfig = {
    uploading: { color: '#3b82f6', label: '上传中' },
    processing: { color: '#f59e0b', label: '处理中' },
    complete: { color: '#10b981', label: '已完成' },
    error: { color: '#ef4444', label: '失败' },
  }
  const cfg = statusConfig[status]
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#334155', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</span>
        <span style={{ fontSize: 12, color: cfg.color }}>{cfg.label} {status !== 'complete' ? `${Math.round(progress)}%` : ''}</span>
      </div>
      <ProgressBar value={progress} showLabel={false} size="sm" color={cfg.color} />
    </div>
  )
}

/**
 * 报告生成进度条（带步骤说明）
 */
interface ReportGenerationProgressProps {
  steps: string[]
  currentStep: number // 0-indexed
  progress: number
}

export function ReportGenerationProgress({ steps, currentStep, progress }: ReportGenerationProgressProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {steps.map((step, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: idx <= currentStep ? '#3b82f6' : '#e2e8f0',
              color: idx <= currentStep ? '#fff' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
            }}>
              {idx < currentStep ? '✓' : idx + 1}
            </div>
            <span style={{ fontSize: 12, color: idx <= currentStep ? '#334155' : '#94a3b8' }}>{step}</span>
          </div>
        ))}
      </div>
      <ProgressBar value={progress} showLabel size="md" />
    </div>
  )
}

export default { ProgressBar, Spinner, LoadingOverlay, UploadProgress, ReportGenerationProgress }