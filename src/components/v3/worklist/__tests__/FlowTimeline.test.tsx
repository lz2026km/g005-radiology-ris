/**
 * G005 放射RIS系统 v3.0.1 - FlowTimeline 单测
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FlowTimeline, DEFAULT_FLOW, CRITICAL_FLOW } from '../FlowTimeline'

describe('FlowTimeline', () => {
  it('DEFAULT_FLOW ≥ 10 节点', () => {
    expect(DEFAULT_FLOW.length).toBeGreaterThanOrEqual(10)
  })

  it('CRITICAL_FLOW = 5 节点(对标卫宁)', () => {
    expect(CRITICAL_FLOW.length).toBe(5)
    expect(CRITICAL_FLOW.map((s) => s.key)).toEqual([
      'found', 'notified', 'acknowledged', 'resolving', 'resolved',
    ])
  })

  it('水平布局自动填充状态(当前=已签发)', () => {
    render(<FlowTimeline states={DEFAULT_FLOW} currentKey="signed" orientation="horizontal" />)
    const signed = screen.getByTestId('flow-node-signed')
    expect(signed).toBeInTheDocument()
    expect(signed.textContent).toContain('已签发')
  })

  it('垂直布局渲染所有节点', () => {
    render(<FlowTimeline states={DEFAULT_FLOW} currentKey="completed" orientation="vertical" />)
    expect(screen.getByTestId('flow-node-registered')).toBeInTheDocument()
    expect(screen.getByTestId('flow-node-archived')).toBeInTheDocument()
  })
})
