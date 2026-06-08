/**
 * G005 放射RIS系统 v3.0.1 - BatchActions 单测
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BatchActions } from '../BatchActions'

describe('BatchActions', () => {
  it('未选中时显示"全选"提示', () => {
    render(<BatchActions selectedCount={0} totalCount={10} />)
    expect(screen.getByTestId('batch-actions-empty')).toBeInTheDocument()
    expect(screen.getByText(/未选中/)).toBeInTheDocument()
  })

  it('选中时显示已选条数与操作按钮', () => {
    render(
      <BatchActions
        selectedCount={5}
        totalCount={20}
        onReassign={vi.fn()}
        onPrint={vi.fn()}
        onExport={vi.fn()}
        onDelete={vi.fn()}
        onSubmit={vi.fn()}
      />
    )
    expect(screen.getByText(/已选 5 \/ 20/)).toBeInTheDocument()
    expect(screen.getByTestId('batch-reassign')).toBeInTheDocument()
    expect(screen.getByTestId('batch-export')).toBeInTheDocument()
    expect(screen.getByTestId('batch-delete')).toBeInTheDocument()
  })

  it('点击"取消"触发 onClear', () => {
    const onClear = vi.fn()
    render(<BatchActions selectedCount={3} totalCount={10} onClear={onClear} />)
    fireEvent.click(screen.getByTestId('batch-clear'))
    expect(onClear).toHaveBeenCalled()
  })
})
