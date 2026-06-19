/**
 * G005 放射RIS系统 v3.0.6.5 - 语音命令目录
 * 15 升级点:30+ 语音命令 / 中英双语 / 快捷键 / 分类
 */

import type { VoiceCommandDefinition } from '../../types/voice';

export const VOICE_COMMANDS: VoiceCommandDefinition[] = [
  // ---------- 标点 / 排版 ----------
  {
    id: 'cmd-001', command: '换行', english: 'New Line', aliases: ['新行', '回车'],
    action: 'new-line', category: 'punctuation',
    description: '在当前位置插入换行', descriptionEn: 'Insert new line at current position',
    shortcut: 'Ctrl+Enter', enabled: true, priority: 100,
  },
  {
    id: 'cmd-002', command: '新段落', english: 'New Paragraph', aliases: ['另起一段', '新段'],
    action: 'new-paragraph', category: 'punctuation',
    description: '插入新段落', descriptionEn: 'Insert new paragraph',
    enabled: true, priority: 100,
  },
  {
    id: 'cmd-003', command: '句号', english: 'Period', aliases: ['句号', '。'],
    action: 'insert-punctuation', category: 'punctuation',
    description: '插入中文句号', descriptionEn: 'Insert Chinese period',
    customPayload: { char: '。' }, enabled: true, priority: 95,
  },
  {
    id: 'cmd-004', command: '逗号', english: 'Comma', aliases: ['逗号', '，'],
    action: 'insert-punctuation', category: 'punctuation',
    description: '插入中文逗号', descriptionEn: 'Insert Chinese comma',
    customPayload: { char: '，' }, enabled: true, priority: 95,
  },
  {
    id: 'cmd-005', command: '冒号', english: 'Colon', aliases: ['冒号'],
    action: 'insert-punctuation', category: 'punctuation',
    description: '插入中文冒号', descriptionEn: 'Insert Chinese colon',
    customPayload: { char: '：' }, enabled: true, priority: 90,
  },
  {
    id: 'cmd-006', command: '分号', english: 'Semicolon', aliases: ['分号'],
    action: 'insert-punctuation', category: 'punctuation',
    description: '插入中文分号', descriptionEn: 'Insert Chinese semicolon',
    customPayload: { char: '；' }, enabled: true, priority: 90,
  },
  {
    id: 'cmd-007', command: '问号', english: 'Question Mark', aliases: ['问号'],
    action: 'insert-punctuation', category: 'punctuation',
    description: '插入中文问号', descriptionEn: 'Insert Chinese question mark',
    customPayload: { char: '？' }, enabled: true, priority: 90,
  },
  {
    id: 'cmd-008', command: '引号', english: 'Quote', aliases: ['引号', '双引号'],
    action: 'insert-punctuation', category: 'punctuation',
    description: '插入中文引号', descriptionEn: 'Insert Chinese quotes',
    customPayload: { char: '"' }, enabled: true, priority: 85,
  },

  // ---------- 编辑 ----------
  {
    id: 'cmd-010', command: '删除', english: 'Delete Last', aliases: ['删', '删除上一句', '退格'],
    action: 'delete-last', category: 'control',
    description: '删除最后一个字符或词', descriptionEn: 'Delete last character or word',
    enabled: true, priority: 100,
  },
  {
    id: 'cmd-011', command: '删除一句', english: 'Delete Sentence', aliases: ['删一句', '删除句子'],
    action: 'delete-word', category: 'control',
    description: '删除最近一句', descriptionEn: 'Delete last sentence',
    enabled: true, priority: 95,
  },
  {
    id: 'cmd-012', command: '全选', english: 'Select All', aliases: ['全部选择'],
    action: 'select-all', category: 'control',
    description: '全选所有文本', descriptionEn: 'Select all text',
    shortcut: 'Ctrl+A', enabled: true, priority: 90,
  },
  {
    id: 'cmd-013', command: '撤销', english: 'Undo', aliases: ['undo'],
    action: 'undo', category: 'control',
    description: '撤销上一次操作', descriptionEn: 'Undo last action',
    shortcut: 'Ctrl+Z', enabled: true, priority: 95,
  },
  {
    id: 'cmd-014', command: '重做', english: 'Redo', aliases: ['redo'],
    action: 'redo', category: 'control',
    description: '恢复上一次撤销', descriptionEn: 'Redo last action',
    shortcut: 'Ctrl+Y', enabled: true, priority: 90,
  },
  {
    id: 'cmd-015', command: '清除', english: 'Clear', aliases: ['清空', '清空所有'],
    action: 'select-all', category: 'control',
    description: '清空当前字段', descriptionEn: 'Clear current field',
    enabled: true, priority: 90,
  },

  // ---------- 字段导航 ----------
  {
    id: 'cmd-020', command: '下一字段', english: 'Next Field', aliases: ['下一个', '下一项'],
    action: 'next-field', category: 'field',
    description: '跳转到下一个输入字段', descriptionEn: 'Jump to next input field',
    enabled: true, priority: 100,
  },
  {
    id: 'cmd-021', command: '上一字段', english: 'Previous Field', aliases: ['上一个', '上一项'],
    action: 'prev-field', category: 'field',
    description: '跳转到上一个输入字段', descriptionEn: 'Jump to previous field',
    enabled: true, priority: 100,
  },
  {
    id: 'cmd-022', command: '去影像所见', english: 'Go to Findings', aliases: ['影像所见', '转到影像所见'],
    action: 'goto-field', category: 'field',
    description: '跳转到"影像所见"字段', descriptionEn: 'Jump to Findings section',
    customPayload: { field: 'findings' }, enabled: true, priority: 95,
  },
  {
    id: 'cmd-023', command: '去诊断印象', english: 'Go to Impression', aliases: ['诊断印象', '转到印象'],
    action: 'goto-field', category: 'field',
    description: '跳转到"诊断印象"字段', descriptionEn: 'Jump to Impression section',
    customPayload: { field: 'impression' }, enabled: true, priority: 95,
  },
  {
    id: 'cmd-024', command: '去建议', english: 'Go to Recommendations', aliases: ['建议', '转到建议'],
    action: 'goto-field', category: 'field',
    description: '跳转到"建议"字段', descriptionEn: 'Jump to Recommendations',
    customPayload: { field: 'recommendation' }, enabled: true, priority: 90,
  },
  {
    id: 'cmd-025', command: '去诊断', english: 'Go to Diagnosis', aliases: ['诊断', '转到诊断'],
    action: 'goto-field', category: 'field',
    description: '跳转到"诊断"字段', descriptionEn: 'Jump to Diagnosis',
    customPayload: { field: 'diagnosis' }, enabled: true, priority: 90,
  },
  {
    id: 'cmd-026', command: '清除字段', english: 'Clear Field', aliases: ['清空字段'],
    action: 'clear-field', category: 'field',
    description: '清空当前字段内容', descriptionEn: 'Clear current field',
    enabled: true, priority: 90,
  },

  // ---------- 模板插入 ----------
  {
    id: 'cmd-030', command: '正常模板', english: 'Normal Template', aliases: ['插入正常', '正常报告'],
    action: 'insert-template', category: 'template',
    description: '插入正常报告模板', descriptionEn: 'Insert normal report template',
    customPayload: { templateId: 'tpl-normal' }, enabled: true, priority: 95,
  },
  {
    id: 'cmd-031', command: '急诊模板', english: 'Emergency Template', aliases: ['插入急诊', '急诊报告'],
    action: 'insert-template', category: 'template',
    description: '插入急诊报告模板', descriptionEn: 'Insert emergency report template',
    customPayload: { templateId: 'tpl-emergency' }, enabled: true, priority: 90,
  },
  {
    id: 'cmd-032', command: '随访模板', english: 'Follow-up Template', aliases: ['插入随访'],
    action: 'insert-template', category: 'template',
    description: '插入随访模板', descriptionEn: 'Insert follow-up template',
    customPayload: { templateId: 'tpl-followup' }, enabled: true, priority: 85,
  },
  {
    id: 'cmd-033', command: '左肺', english: 'Left Lung', aliases: ['左肺结节'],
    action: 'insert-snippet', category: 'insertion',
    description: '插入"左肺"片段', descriptionEn: 'Insert "left lung" snippet',
    customPayload: { text: '左肺' }, enabled: true, priority: 90,
  },
  {
    id: 'cmd-034', command: '右肺', english: 'Right Lung', aliases: ['右肺结节'],
    action: 'insert-snippet', category: 'insertion',
    description: '插入"右肺"片段', descriptionEn: 'Insert "right lung" snippet',
    customPayload: { text: '右肺' }, enabled: true, priority: 90,
  },
  {
    id: 'cmd-035', command: '未见明显异常', english: 'No Abnormality', aliases: ['未见异常'],
    action: 'insert-snippet', category: 'insertion',
    description: '插入"未见明显异常"', descriptionEn: 'Insert "no obvious abnormality"',
    customPayload: { text: '未见明显异常' }, enabled: true, priority: 95,
  },
  {
    id: 'cmd-036', command: '建议随访', english: 'Follow-up', aliases: ['建议随诊'],
    action: 'insert-snippet', category: 'insertion',
    description: '插入"建议随访"', descriptionEn: 'Insert "follow-up recommended"',
    customPayload: { text: '建议随访' }, enabled: true, priority: 95,
  },
  {
    id: 'cmd-037', command: '建议复查', english: 'Re-examination', aliases: ['建议随诊复查'],
    action: 'insert-snippet', category: 'insertion',
    description: '插入"建议复查"', descriptionEn: 'Insert "re-examination recommended"',
    customPayload: { text: '建议复查' }, enabled: true, priority: 90,
  },
  {
    id: 'cmd-038', command: '结合临床', english: 'Clinical Correlation', aliases: ['结合临床病史'],
    action: 'insert-snippet', category: 'insertion',
    description: '插入"结合临床"', descriptionEn: 'Insert "clinical correlation"',
    customPayload: { text: '结合临床' }, enabled: true, priority: 90,
  },
  {
    id: 'cmd-039', command: '未见异常', english: 'Unremarkable', aliases: ['未发现异常'],
    action: 'insert-snippet', category: 'insertion',
    description: '插入"未见异常"', descriptionEn: 'Insert "unremarkable"',
    customPayload: { text: '未见明显异常' }, enabled: true, priority: 90,
  },

  // ---------- 保存 / 提交流程 ----------
  {
    id: 'cmd-040', command: '保存草稿', english: 'Save Draft', aliases: ['保存', '存草稿'],
    action: 'save-draft', category: 'save',
    description: '保存报告为草稿', descriptionEn: 'Save report as draft',
    shortcut: 'Ctrl+S', enabled: true, priority: 100,
  },
  {
    id: 'cmd-041', command: '提交审核', english: 'Submit for Review', aliases: ['提交', '送审'],
    action: 'submit-report', category: 'save',
    description: '提交报告供审核', descriptionEn: 'Submit report for review',
    enabled: true, priority: 100,
  },
  {
    id: 'cmd-042', command: '保存模板', english: 'Save Template', aliases: ['存为模板'],
    action: 'save-template', category: 'save',
    description: '保存当前文本为模板', descriptionEn: 'Save current text as template',
    enabled: true, priority: 85,
  },

  // ---------- 系统控制 ----------
  {
    id: 'cmd-050', command: '开始听写', english: 'Start Dictation', aliases: ['开始录音', '开始'],
    action: 'start-dictation', category: 'system',
    description: '开始语音听写', descriptionEn: 'Start voice dictation',
    enabled: true, priority: 100,
  },
  {
    id: 'cmd-051', command: '停止听写', english: 'Stop Dictation', aliases: ['停止', '结束听写'],
    action: 'stop-dictation', category: 'system',
    description: '停止语音听写', descriptionEn: 'Stop voice dictation',
    enabled: true, priority: 100,
  },
  {
    id: 'cmd-052', command: '暂停', english: 'Pause', aliases: ['暂停听写'],
    action: 'pause-dictation', category: 'system',
    description: '暂停语音听写', descriptionEn: 'Pause voice dictation',
    enabled: true, priority: 100,
  },
  {
    id: 'cmd-053', command: '继续', english: 'Resume', aliases: ['继续听写'],
    action: 'resume-dictation', category: 'system',
    description: '继续语音听写', descriptionEn: 'Resume voice dictation',
    enabled: true, priority: 100,
  },
  {
    id: 'cmd-054', command: '打开词汇', english: 'Open Vocabulary', aliases: ['医学词汇', '词汇管理'],
    action: 'open-vocab', category: 'system',
    description: '打开医学词汇管理', descriptionEn: 'Open medical vocabulary',
    enabled: true, priority: 85,
  },
  {
    id: 'cmd-055', command: '打开历史', english: 'Open History', aliases: ['历史记录'],
    action: 'open-history', category: 'system',
    description: '打开听写历史', descriptionEn: 'Open dictation history',
    enabled: true, priority: 85,
  },
  {
    id: 'cmd-056', command: '切换中文', english: 'Switch to Chinese', aliases: ['中文', '切中文'],
    action: 'switch-lang', category: 'system',
    description: '切换到中文识别', descriptionEn: 'Switch to Chinese',
    customPayload: { lang: 'zh-CN' }, enabled: true, priority: 90,
  },
  {
    id: 'cmd-057', command: '切换英文', english: 'Switch to English', aliases: ['英文', '切英文'],
    action: 'switch-lang', category: 'system',
    description: '切换到英文识别', descriptionEn: 'Switch to English',
    customPayload: { lang: 'en-US' }, enabled: true, priority: 90,
  },

  // ---------- 格式化 ----------
  {
    id: 'cmd-060', command: '加粗', english: 'Bold', aliases: ['粗体'],
    action: 'format-emphasis', category: 'formatting',
    description: '加粗当前选中文本', descriptionEn: 'Bold current selection',
    enabled: true, priority: 80,
  },
  {
    id: 'cmd-061', command: '斜体', english: 'Italic', aliases: [],
    action: 'format-emphasis', category: 'formatting',
    description: '斜体当前选中文本', descriptionEn: 'Italicize current selection',
    enabled: true, priority: 80,
  },
  {
    id: 'cmd-062', command: '正常', english: 'Normal Text', aliases: ['普通文本'],
    action: 'format-normal', category: 'formatting',
    description: '设置为正常文本', descriptionEn: 'Set as normal text',
    enabled: true, priority: 80,
  },
  {
    id: 'cmd-063', command: '逐字拼写', english: 'Spell Out', aliases: ['拼写'],
    action: 'spell-out', category: 'formatting',
    description: '逐字拼写当前内容', descriptionEn: 'Spell out current content',
    enabled: true, priority: 80,
  },

  // ---------- 跳转 / 浏览 ----------
  {
    id: 'cmd-070', command: '回车', english: 'Enter', aliases: ['回车键'],
    action: 'new-line', category: 'control',
    description: '插入回车', descriptionEn: 'Insert enter',
    enabled: true, priority: 95,
  },
  {
    id: 'cmd-071', command: '制表', english: 'Tab', aliases: ['缩进'],
    action: 'insert-punctuation', category: 'control',
    description: '插入制表符', descriptionEn: 'Insert tab',
    customPayload: { char: '\t' }, enabled: true, priority: 80,
  },
];

export const COMMAND_CATEGORIES: { key: string; label: string; icon: string; count: number }[] = [
  { key: 'punctuation', label: '标点排版', icon: 'Type', count: VOICE_COMMANDS.filter((c) => c.category === 'punctuation').length },
  { key: 'control', label: '编辑控制', icon: 'Edit', count: VOICE_COMMANDS.filter((c) => c.category === 'control').length },
  { key: 'field', label: '字段导航', icon: 'Navigation', count: VOICE_COMMANDS.filter((c) => c.category === 'field').length },
  { key: 'template', label: '模板插入', icon: 'Layout', count: VOICE_COMMANDS.filter((c) => c.category === 'template').length },
  { key: 'insertion', label: '片段插入', icon: 'PlusCircle', count: VOICE_COMMANDS.filter((c) => c.category === 'insertion').length },
  { key: 'save', label: '保存提交', icon: 'Save', count: VOICE_COMMANDS.filter((c) => c.category === 'save').length },
  { key: 'system', label: '系统控制', icon: 'Settings', count: VOICE_COMMANDS.filter((c) => c.category === 'system').length },
  { key: 'formatting', label: '格式设置', icon: 'Palette', count: VOICE_COMMANDS.filter((c) => c.category === 'formatting').length },
];

export const COMMAND_HOTKEYS: Record<string, string> = {
  'cmd-001': 'Ctrl+Enter',
  'cmd-012': 'Ctrl+A',
  'cmd-013': 'Ctrl+Z',
  'cmd-014': 'Ctrl+Y',
  'cmd-040': 'Ctrl+S',
};
