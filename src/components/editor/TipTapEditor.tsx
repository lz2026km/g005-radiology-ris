/**
 * G005 RIS v3.0.2.10 - TipTap 富文本编辑器
 * 替代旧的 contenteditable + execCommand 编辑器
 */
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Link from '@tiptap/extension-link'
import ImageExt from '@tiptap/extension-image'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Superscript } from '@tiptap/extension-superscript'
import { Subscript } from '@tiptap/extension-subscript'
import { useCallback, useState, useRef, useEffect } from 'react'

interface TipTapEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  readOnly?: boolean
  minHeight?: number
}

const SYMBOLS = ['°', '±', '≤', '≥', 'α', 'β', 'γ', 'μg', 'mmHg', 'HU', 'm²', 'cm³', '↑', '↓', '→', '※', '∵', '∴', '√', '∈', '∞', '≈', '≠', '≡', '⌘', '☤', '☢', '☣', '⚕', '✦', '✧', '※', '❖', '◆', '◇', '○', '●', '◎', '◉', '⚬']

const FONT_COLORS = ['#dc2626', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#1e293b']
const HIGHLIGHT_COLORS = ['#fef3c7', '#dbeafe', '#dcfce7', '#fee2e2', '#f3e8ff']

const MenuButton = ({ onClick, active, label, title }: { onClick: () => void; active?: boolean; label: string; title?: string }) => (
  <button
    onClick={onClick}
    title={title ?? label}
    style={{
      padding: '4px 8px', border: active ? '1px solid #3b82f6' : '1px solid #e2e8f0',
      background: active ? '#dbeafe' : '#fff', borderRadius: 4, cursor: 'pointer',
      fontSize: 12, fontWeight: active ? 700 : 400, color: active ? '#1e40af' : '#64748b',
      minWidth: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
  >{label}</button>
)

const Divider = () => <div style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 2px' }} />

const popupBase = {
  position: 'absolute' as const, top: '100%', left: 0, zIndex: 1000,
  background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6,
  boxShadow: '0 4px 12px rgba(0,0,0,0.12)', padding: 6,
}

export default function TipTapEditor({ content, onChange, placeholder = '请输入报告内容...', readOnly = false, minHeight = 300 }: TipTapEditorProps) {
  const [symbolsOpen, setSymbolsOpen] = useState(false)
  const [fontColorOpen, setFontColorOpen] = useState(false)
  const [highlightOpen, setHighlightOpen] = useState(false)

  const symbolsRef = useRef<HTMLDivElement>(null)
  const fontColorRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (symbolsRef.current && !symbolsRef.current.contains(e.target as Node)) setSymbolsOpen(false)
      if (fontColorRef.current && !fontColorRef.current.contains(e.target as Node)) setFontColorOpen(false)
      if (highlightRef.current && !highlightRef.current.contains(e.target as Node)) setHighlightOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: { depth: 100 } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Typography,
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: 10000 }),
      Link.configure({ openOnClick: false }),
      ImageExt,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow, TableCell, TableHeader,
      TextStyle,
      Color,
      Superscript,
      Subscript,
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  })

  const addLink = useCallback(() => {
    if (!editor) return
    const url = window.prompt('输入链接地址：')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt('输入图片地址：')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  const insertTable = useCallback(() => {
    if (!editor) return
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  const insertSymbol = useCallback((sym: string) => {
    editor?.chain().focus().insertContent(sym).run()
    setSymbolsOpen(false)
  }, [editor])

  const setFontColor = useCallback((color?: string) => {
    if (color) editor?.chain().focus().setColor(color).run()
    else editor?.chain().focus().unsetColor().run()
    setFontColorOpen(false)
  }, [editor])

  const setHighlightColor = useCallback((color?: string) => {
    if (color) editor?.chain().focus().setHighlight({ color }).run()
    else editor?.chain().focus().unsetHighlight().run()
    setHighlightOpen(false)
  }, [editor])

  if (!editor) return <div style={{ minHeight }}>加载编辑器...</div>

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
      {/* 工具栏 */}
      {!readOnly && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, padding: 6, borderBottom: '1px solid #e2e8f0', background: '#f8fafc', alignItems: 'center' }}>
          <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} label="B" title="加粗 Ctrl+B" />
          <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} label="I" title="斜体 Ctrl+I" />
          <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} label="U" title="下划线 Ctrl+U" />
          <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} label="S" title="删除线" />
          <Divider />
          <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} label="H1" />
          <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} label="H2" />
          <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} label="H3" />
          <Divider />
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} label="左" />
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} label="中" />
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} label="右" />
          <Divider />
          <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} label="•" title="无序列表" />
          <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} label="1." title="有序列表" />
          <MenuButton onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} label="✓" title="任务列表" />
          <Divider />
          <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} label={'"'} title="引用" />
          <MenuButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} label="</>" title="代码块" />
          <Divider />
          <MenuButton onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} label="Sup" title="上标" />
          <MenuButton onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} label="Sub" title="下标" />
          <Divider />
          <MenuButton onClick={insertTable} label="表" title="插入表格" />
          <MenuButton onClick={addLink} active={editor.isActive('link')} label="链" title="插入链接" />
          <MenuButton onClick={addImage} label="图" title="插入图片" />
          <Divider />
          {/* 符号面板 */}
          <div ref={symbolsRef} style={{ position: 'relative' }}>
            <MenuButton onClick={() => setSymbolsOpen(v => !v)} active={symbolsOpen} label="Ω" title="特殊符号" />
            {symbolsOpen && (
              <div style={{ ...popupBase, width: 280, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {SYMBOLS.map(sym => (
                  <button key={sym} onClick={() => insertSymbol(sym)}
                    style={{
                      width: 34, height: 30, border: '1px solid #e2e8f0', borderRadius: 3,
                      background: '#fff', cursor: 'pointer', fontSize: 13,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#1e293b',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                  >{sym}</button>
                ))}
              </div>
            )}
          </div>
          {/* 字体颜色 */}
          <div ref={fontColorRef} style={{ position: 'relative' }}>
            <MenuButton onClick={() => setFontColorOpen(v => !v)} active={editor.isActive('textStyle') && !!editor.getAttributes('textStyle').color} label="A" title="字体颜色" />
            {fontColorOpen && (
              <div style={{ ...popupBase, width: 166, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {FONT_COLORS.map(c => (
                  <button key={c} onClick={() => setFontColor(c)}
                    style={{
                      width: 30, height: 30, borderRadius: 4, border: '2px solid #e2e8f0',
                      background: c, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    title={c}
                  />
                ))}
                <button onClick={() => setFontColor()}
                  style={{
                    width: 30, height: 30, borderRadius: 4, border: '2px solid #e2e8f0',
                    background: '#fff', cursor: 'pointer', fontSize: 14, color: '#94a3b8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  title="移除颜色"
                >✕</button>
              </div>
            )}
          </div>
          {/* 高亮颜色 */}
          <div ref={highlightRef} style={{ position: 'relative' }}>
            <MenuButton onClick={() => setHighlightOpen(v => !v)} active={editor.isActive('highlight')} label="画" title="高亮颜色" />
            {highlightOpen && (
              <div style={{ ...popupBase, width: 138, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {HIGHLIGHT_COLORS.map(c => (
                  <button key={c} onClick={() => setHighlightColor(c)}
                    style={{
                      width: 30, height: 30, borderRadius: 4, border: '2px solid #e2e8f0',
                      background: c, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    title={c}
                  />
                ))}
                <button onClick={() => setHighlightColor()}
                  style={{
                    width: 30, height: 30, borderRadius: 4, border: '2px solid #e2e8f0',
                    background: '#fff', cursor: 'pointer', fontSize: 14, color: '#94a3b8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  title="移除高亮"
                >✕</button>
              </div>
            )}
          </div>
          <Divider />
          <MenuButton onClick={() => editor.chain().focus().undo().run()} label="↩" title="撤销 Ctrl+Z" />
          <MenuButton onClick={() => editor.chain().focus().redo().run()} label="↪" title="重做 Ctrl+Y" />
        </div>
      )}

      {/* 编辑器主体 */}
      <EditorContent editor={editor} style={{ minHeight, padding: '12px 16px', outline: 'none' }} />

      {/* 底部状态栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 12px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 11, color: '#94a3b8' }}>
        <span>{editor.storage.characterCount.characters()} 字</span>
        <span>{editor.storage.characterCount.words()} 词</span>
      </div>
    </div>
  )
}
