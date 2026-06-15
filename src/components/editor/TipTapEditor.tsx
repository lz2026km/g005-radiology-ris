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
import { useCallback } from 'react'

interface TipTapEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  readOnly?: boolean
  minHeight?: number
}

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

export default function TipTapEditor({ content, onChange, placeholder = '请输入报告内容...', readOnly = false, minHeight = 300 }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: { depth: 100 } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Typography,
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: 10000 }),
      Link.configure({ openOnClick: false }),
      ImageExt,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow, TableCell, TableHeader,
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
          <MenuButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} label="画" title="高亮" />
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
          <MenuButton onClick={insertTable} label="表" title="插入表格" />
          <MenuButton onClick={addLink} active={editor.isActive('link')} label="链" title="插入链接" />
          <MenuButton onClick={addImage} label="图" title="插入图片" />
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
