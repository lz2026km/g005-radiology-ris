/**
 * G005 Radiology RIS - ChartContainer
 * Uniform chart wrapper: ResponsiveContainer + height + 3 states
 * (empty/skeleton/error) + optional title + actions.
 *
 * Migrates ad-hoc <ResponsiveContainer width="100%" height={N}> patterns
 * into a single source of truth.
 */
import React from 'react'
import { ResponsiveContainer } from 'recharts'
import ChartEmpty from './ChartEmpty'
import ChartSkeleton from './ChartSkeleton'
import ChartError from './ChartError'

export type ChartState = 'idle' | 'loading' | 'empty' | 'error' | 'ready'

export interface ChartContainerProps {
  title?: React.ReactNode
  action?: React.ReactNode
  height?: number
  state?: ChartState
  emptyDescription?: string
  errorDescription?: string
  onRetry?: () => void
  children: React.ReactElement
  style?: React.CSSProperties
  testId?: string
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  action,
  height = 240,
  state = 'ready',
  emptyDescription,
  errorDescription,
  onRetry,
  children,
  style,
  testId,
}) => {
  const containerStyle: React.CSSProperties = {
    width: '100%',
    overflow: 'hidden',
    ...style,
  }

  return (
    <div
      data-testid={testId}
      style={containerStyle}
    >
      {(title || action) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            gap: 8,
          }}
        >
          {title && (
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text, #1e293b)' }}>
              {title}
            </div>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {state === 'loading' && <ChartSkeleton height={height} showHeader={false} />}
      {state === 'empty' && <ChartEmpty description={emptyDescription} height={height} />}
      {state === 'error' && (
        <ChartError
          description={errorDescription}
          height={height}
          onRetry={onRetry}
        />
      )}
      {state === 'ready' && (
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default ChartContainer
