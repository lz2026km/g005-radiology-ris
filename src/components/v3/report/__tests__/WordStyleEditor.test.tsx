/**
 * G005 放射RIS系统 v3.0.2 - WordStyleEditor 单测
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WordStyleEditor } from '../WordStyleEditor'

describe('WordStyleEditor v3.0.2', () => {
  it('渲染 4 段所见/结论/建议/签名', () => {
    const { container } = render(<WordStyleEditor />)
    expect(container.textContent).toContain('检查所见')
    expect(container.textContent).toContain('检查结论')
    expect(container.textContent).toContain('建议')
    expect(container.textContent).toContain('签名')
  })

  it('编辑所见触发 state', () => {
    render(<WordStyleEditor initialFindings="" />)
    const ta = screen.getByTestId('textarea-findings') as HTMLTextAreaElement
    fireEvent.change(ta, { target: { value: '新增所见内容' } })
    expect(ta.value).toBe('新增所见内容')
  })

  it('点击保存触发 onSave', () => {
    const onSave = vi.fn()
    render(
      <WordStyleEditor
        initialFindings="所见内容"
        initialConclusion="结论"
        initialSignature="签名"
        onSave={onSave}
      />
    )
    fireEvent.click(screen.getByTestId('save-btn'))
    expect(onSave).toHaveBeenCalled()
    const content = onSave.mock.calls[0]![0]
    expect(content.findings).toBe('所见内容')
    expect(content.conclusion).toBe('结论')
    expect(content.signature).toBe('签名')
  })

  it('点击提交触发 onSubmit (有完整数据)', async () => {
    const onSubmit = vi.fn()
    render(
      <WordStyleEditor
        initialFindings="有效所见描述需要超过十个字"
        initialConclusion="有效结论"
        initialSignature="签名"
        onSubmit={onSubmit}
      />
    )
    fireEvent.click(screen.getByTestId('submit-btn'))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
  })

  it('提交时必填缺失不触发 onSubmit', () => {
    const onSubmit = vi.fn()
    render(<WordStyleEditor onSubmit={onSubmit} />)
    fireEvent.click(screen.getByTestId('submit-btn'))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('插入宏命令模板', () => {
    render(<WordStyleEditor />)
    const macroBtn = screen.getByTestId('macro-findings')
    fireEvent.click(macroBtn)
    const ta = screen.getByTestId('textarea-findings') as HTMLTextAreaElement
    expect(ta.value).toContain('{{')
  })

  it('打印按钮可点击', () => {
    render(<WordStyleEditor />)
    expect(screen.getByTestId('print-btn')).toBeInTheDocument()
  })

  it('显示总字数', () => {
    render(<WordStyleEditor initialFindings="所见" initialConclusion="结论" initialSignature="签" />)
    expect(screen.getAllByText(/\d+ 字/)).toBeTruthy()
  })
})
