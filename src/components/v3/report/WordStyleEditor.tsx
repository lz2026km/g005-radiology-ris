/**
 * G005 放射RIS系统 v3.0.1 - Word 风格 4 段报告编辑器
 * 对标创业 / 东软 — 所见/结论/建议/签名 4 段 Word 风格工具栏
 */
import React, { useState, useCallback, useRef, useMemo } from 'react'
import { Card, Tabs, Button, Input, Space, Tag, Tooltip, message } from 'antd'
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Undo,
  Redo,
  Type,
  Save,
  Send,
  Printer,
  Mic,
  MicOff,
  Sparkles,
} from 'lucide-react'

const { TextArea } = Input

export interface WordStyleEditorProps {
  patientName?: string
  patientId?: string
  reportType?: string
  initialFindings?: string
  initialConclusion?: string
  initialSuggestion?: string
  initialSignature?: string
  onSave?: (content: {
    findings: string
    conclusion: string
    suggestion: string
    signature: string
  }) => void
  onSubmit?: (content: {
    findings: string
    conclusion: string
    suggestion: string
    signature: string
  }) => void
  onAIAssist?: (section: 'findings' | 'conclusion' | 'suggestion') => void
  onPhraseInsert?: () => void
  onHistoryRef?: () => void
}

const sectionConfig: { key: 'findings' | 'conclusion' | 'suggestion' | 'signature'; label: string; rows: number }[] = [
  { key: 'findings', label: '检查所见', rows: 8 },
  { key: 'conclusion', label: '检查结论', rows: 4 },
  { key: 'suggestion', label: '建议', rows: 3 },
  { key: 'signature', label: '签名', rows: 2 },
]

export const WordStyleEditor: React.FC<WordStyleEditorProps> = ({
  patientName = '张三',
  patientId = 'P001',
  reportType = '胸部 CT 平扫',
  initialFindings = '',
  initialConclusion = '',
  initialSuggestion = '',
  initialSignature = '',
  onSave,
  onSubmit,
  onAIAssist,
  onPhraseInsert,
  onHistoryRef,
}) => {
  const [findings, setFindings] = useState(initialFindings)
  const [conclusion, setConclusion] = useState(initialConclusion)
  const [suggestion, setSuggestion] = useState(initialSuggestion)
  const [signature, setSignature] = useState(initialSignature)
  const [recording, setRecording] = useState(false)
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

  const wordCount = useMemo(
    () => findings.length + conclusion.length + suggestion.length + signature.length,
    [findings, conclusion, suggestion, signature]
  )

  const insertAtCursor = useCallback(
    (text: string, section: typeof sectionConfig[number]['key']) => {
      const el = textareaRefs.current[section]
      if (!el) {
        if (section === 'findings') setFindings((s) => s + text)
        else if (section === 'conclusion') setConclusion((s) => s + text)
        else if (section === 'suggestion') setSuggestion((s) => s + text)
        else setSignature((s) => s + text)
        return
      }
      const start = el.selectionStart
      const end = el.selectionEnd
      const current = el.value
      const next = current.slice(0, start) + text + current.slice(end)
      if (section === 'findings') setFindings(next)
      else if (section === 'conclusion') setConclusion(next)
      else if (section === 'suggestion') setSuggestion(next)
      else setSignature(next)
      requestAnimationFrame(() => {
        el.focus()
        el.setSelectionRange(start + text.length, start + text.length)
      })
    },
    []
  )

  const handleSave = useCallback(() => {
    onSave?.({ findings, conclusion, suggestion, signature })
    message.success('报告草稿已保存')
  }, [findings, conclusion, suggestion, signature, onSave])

  const handleSubmit = useCallback(() => {
    onSubmit?.({ findings, conclusion, suggestion, signature })
    message.success('报告已提交一审')
  }, [findings, conclusion, suggestion, signature, onSubmit])

  const toggleRecording = useCallback(() => {
    setRecording((r) => !r)
    if (!recording) {
      message.info('开始语音录入...')
      setTimeout(() => {
        setRecording(false)
        insertAtCursor('\n\n[语音录入] 影像学表现符合上述描述,建议进一步随访。', 'findings')
        message.success('语音录入完成')
      }, 2000)
    } else {
      message.info('停止语音录入')
    }
  }, [recording, insertAtCursor])

  const renderToolbar = (section: typeof sectionConfig[number]['key']) => (
    <Space size={2} style={{ marginBottom: 4 }}>
      <Tooltip title="加粗">
        <Button size="small" type="text" icon={<Bold size={12} />} onClick={() => insertAtCursor('**加粗**', section)} />
      </Tooltip>
      <Tooltip title="斜体">
        <Button size="small" type="text" icon={<Italic size={12} />} onClick={() => insertAtCursor('*斜体*', section)} />
      </Tooltip>
      <Tooltip title="下划线">
        <Button size="small" type="text" icon={<Underline size={12} />} onClick={() => insertAtCursor('__下划线__', section)} />
      </Tooltip>
      <Tooltip title="左对齐">
        <Button size="small" type="text" icon={<AlignLeft size={12} />} onClick={() => insertAtCursor('\n', section)} />
      </Tooltip>
      <Tooltip title="居中">
        <Button size="small" type="text" icon={<AlignCenter size={12} />} onClick={() => insertAtCursor('\n', section)} />
      </Tooltip>
      <Tooltip title="右对齐">
        <Button size="small" type="text" icon={<AlignRight size={12} />} onClick={() => insertAtCursor('\n', section)} />
      </Tooltip>
      <Tooltip title="列表">
        <Button size="small" type="text" icon={<List size={12} />} onClick={() => insertAtCursor('\n- 项目', section)} />
      </Tooltip>
      <Tooltip title="撤销">
        <Button size="small" type="text" icon={<Undo size={12} />} />
      </Tooltip>
      <Tooltip title="重做">
        <Button size="small" type="text" icon={<Redo size={12} />} />
      </Tooltip>
      {section !== 'signature' && (
        <>
          <Tooltip title="AI 续写">
            <Button
              size="small"
              type="text"
              icon={<Sparkles size={12} color="#722ed1" />}
              onClick={() => onAIAssist?.(section as 'findings' | 'conclusion' | 'suggestion')}
              data-testid={`ai-${section}`}
            />
          </Tooltip>
          <Tooltip title="插入短语">
            <Button
              size="small"
              type="text"
              icon={<Type size={12} />}
              onClick={onPhraseInsert}
              data-testid={`phrase-${section}`}
            />
          </Tooltip>
          <Tooltip title="历史引用">
            <Button
              size="small"
              type="text"
              icon={<Save size={12} />}
              onClick={onHistoryRef}
              data-testid={`history-${section}`}
            />
          </Tooltip>
        </>
      )}
    </Space>
  )

  const renderSection = (
    section: typeof sectionConfig[number]['key'],
    label: string,
    rows: number,
    value: string,
    setter: (v: string) => void
  ) => (
    <div key={section} style={{ marginBottom: 12 }} data-testid={`section-${section}`}>
      <div
        style={{
          background: '#f1f5f9',
          padding: '4px 12px',
          fontSize: 12,
          fontWeight: 700,
          color: '#1e3a5f',
          borderRadius: '4px 4px 0 0',
        }}
      >
        {label}
      </div>
      {renderToolbar(section)}
      <TextArea
        ref={(el) => {
          textareaRefs.current[section] = el?.textarea ?? null
        }}
        value={value}
        onChange={(e) => setter(e.target.value)}
        autoSize={{ minRows: rows, maxRows: rows + 10 }}
        bordered
        style={{
          fontSize: 13,
          lineHeight: 1.8,
          fontFamily: 'Microsoft YaHei, PingFang SC, sans-serif',
        }}
        placeholder={`请输入${label}...`}
        data-testid={`textarea-${section}`}
      />
    </div>
  )

  return (
    <Card
      data-testid="word-style-editor"
      title={
        <Space>
          <Type size={16} color="#1e3a5f" />
          <span>报告编辑器 · {reportType}</span>
          <Tag color="blue">
            {patientName} · {patientId}
          </Tag>
        </Space>
      }
      extra={
        <Space>
          <Tooltip title="语音录入">
            <Button
              type={recording ? 'primary' : 'default'}
              danger={recording}
              shape="circle"
              size="small"
              icon={recording ? <MicOff size={14} /> : <Mic size={14} />}
              onClick={toggleRecording}
              data-testid="voice-toggle"
            />
          </Tooltip>
          <Button icon={<Printer size={14} />} onClick={() => window.print()} data-testid="print-btn">
            打印
          </Button>
          <Button icon={<Save size={14} />} onClick={handleSave} data-testid="save-btn">
            保存
          </Button>
          <Button type="primary" icon={<Send size={14} />} onClick={handleSubmit} data-testid="submit-btn">
            提交
          </Button>
        </Space>
      }
    >
      <Tabs
        defaultActiveKey="edit"
        items={[
          {
            key: 'edit',
            label: '编辑',
            children: (
              <div>
                {renderSection('findings', sectionConfig[0]!.label, sectionConfig[0]!.rows, findings, setFindings)}
                {renderSection('conclusion', sectionConfig[1]!.label, sectionConfig[1]!.rows, conclusion, setConclusion)}
                {renderSection('suggestion', sectionConfig[2]!.label, sectionConfig[2]!.rows, suggestion, setSuggestion)}
                {renderSection('signature', sectionConfig[3]!.label, sectionConfig[3]!.rows, signature, setSignature)}
              </div>
            ),
          },
          {
            key: 'preview',
            label: '预览',
            children: (
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  padding: 24,
                  fontSize: 14,
                  lineHeight: 2,
                  fontFamily: 'Microsoft YaHei, PingFang SC, serif',
                }}
              >
                <h3 style={{ textAlign: 'center' }}>{reportType}</h3>
                <div style={{ marginBottom: 16, color: '#64748b' }}>
                  患者:{patientName} · ID:{patientId}
                </div>
                <h4>检查所见</h4>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{findings || '(空)'}</pre>
                <h4>检查结论</h4>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{conclusion || '(空)'}</pre>
                <h4>建议</h4>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{suggestion || '(空)'}</pre>
                <h4>签名</h4>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{signature || '(空)'}</pre>
              </div>
            ),
          },
        ]}
      />
      <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right' }}>总字数:{wordCount}</div>
    </Card>
  )
}

export default WordStyleEditor
