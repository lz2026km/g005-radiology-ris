/**
 * G005 放射RIS系统 v3.0.1 - ReportLockBadge 单测
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReportLockBadge } from '../ReportLockBadge'

describe('ReportLockBadge', () => {
  it('未签发显示灰色 Tag', () => {
    render(<ReportLockBadge signed={false} />)
    expect(screen.getByTestId('lock-badge-pending')).toBeInTheDocument()
    expect(screen.getByText('未签名')).toBeInTheDocument()
  })

  it('已签发显示绿色 Tag + 签发人', () => {
    render(<ReportLockBadge signed signedBy="李明辉" signedAt="2026-06-08 10:00" />)
    expect(screen.getByTestId('lock-badge-signed')).toBeInTheDocument()
    expect(screen.getByText(/已电子签名/)).toBeInTheDocument()
  })
})
