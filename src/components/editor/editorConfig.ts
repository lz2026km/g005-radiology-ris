// ============================================================
// G005 放射科RIS系统 v1.0.1 - 富文本编辑器工具栏
// Phase R1：医疗专用工具栏
// ============================================================

import {
  Bold, Italic, Underline, Subscript, Superscript,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Heading1, Heading2, Quote, Code, Link2, Image as ImageIcon,
  Ruler, Sigma, AlertCircle, FlaskConical, Type,
  type LucideIcon,
} from 'lucide-react';

export interface ToolbarButton {
  id: string;
  label: string;
  icon: LucideIcon;
  command: string;
  value?: string;
  shortcut?: string;
  group: 'format' | 'paragraph' | 'insert' | 'medical' | 'align';
}

export const TOOLBAR_BUTTONS: ToolbarButton[] = [
  // 文字格式
  { id: 'bold',        label: '加粗',       icon: Bold,        command: 'bold',          shortcut: 'Ctrl+B', group: 'format' },
  { id: 'italic',      label: '斜体',       icon: Italic,      command: 'italic',        shortcut: 'Ctrl+I', group: 'format' },
  { id: 'underline',   label: '下划线',     icon: Underline,   command: 'underline',     shortcut: 'Ctrl+U', group: 'format' },
  { id: 'subscript',   label: '下标',       icon: Subscript,   command: 'subscript',                          group: 'format' },
  { id: 'superscript', label: '上标',       icon: Superscript, command: 'superscript',                        group: 'format' },
  // 段落
  { id: 'h1',          label: '标题 1',     icon: Heading1,    command: 'formatBlock',   value: 'H1',            group: 'paragraph' },
  { id: 'h2',          label: '标题 2',     icon: Heading2,    command: 'formatBlock',   value: 'H2',            group: 'paragraph' },
  { id: 'quote',       label: '引用',       icon: Quote,       command: 'formatBlock',   value: 'BLOCKQUOTE',    group: 'paragraph' },
  { id: 'p',           label: '正文',       icon: Type,        command: 'formatBlock',   value: 'P',             group: 'paragraph' },
  // 列表
  { id: 'ul',          label: '无序列表',   icon: List,        command: 'insertUnorderedList',                group: 'paragraph' },
  { id: 'ol',          label: '有序列表',   icon: ListOrdered, command: 'insertOrderedList',                  group: 'paragraph' },
  // 对齐
  { id: 'align-l',     label: '左对齐',     icon: AlignLeft,   command: 'justifyLeft',                       group: 'align' },
  { id: 'align-c',     label: '居中',       icon: AlignCenter, command: 'justifyCenter',                     group: 'align' },
  { id: 'align-r',     label: '右对齐',     icon: AlignRight,  command: 'justifyRight',                      group: 'align' },
  // 插入
  { id: 'link',        label: '链接',       icon: Link2,       command: 'createLink',                        group: 'insert' },
  { id: 'image',       label: '插入图像',   icon: ImageIcon,   command: 'insertImage',                       group: 'insert' },
  { id: 'code',        label: '代码',       icon: Code,        command: 'formatBlock',   value: 'PRE',           group: 'insert' },
  // 医疗专用
  { id: 'measurement', label: '插入测量值', icon: Ruler,       command: 'insertMeasurement',                 group: 'medical' },
  { id: 'finding',     label: '插入征象',   icon: AlertCircle, command: 'insertFinding',                     group: 'medical' },
  { id: 'formula',     label: '插入公式',   icon: Sigma,       command: 'insertFormula',                     group: 'medical' },
  { id: 'lab',         label: '插入化验',   icon: FlaskConical, command: 'insertLab',                        group: 'medical' },
];

// 特殊符号快速插入
export const SPECIAL_SYMBOLS = [
  { label: '°', name: '度' },
  { label: '±', name: '正负' },
  { label: '≤', name: '小于等于' },
  { label: '≥', name: '大于等于' },
  { label: 'α', name: 'alpha' },
  { label: 'β', name: 'beta' },
  { label: 'γ', name: 'gamma' },
  { label: 'μg', name: '微克' },
  { label: 'mmHg', name: '毫米汞柱' },
  { label: 'HU', name: '亨氏单位' },
  { label: 'm²', name: '平方米' },
  { label: 'cm³', name: '立方厘米' },
  { label: '↑', name: '升高' },
  { label: '↓', name: '降低' },
  { label: '→', name: '导致' },
  { label: '※', name: '星号' },
];

// 工具栏分组顺序
export const TOOLBAR_GROUPS: Array<{ key: string; label: string; buttons: string[] }> = [
  { key: 'format',    label: '文字格式', buttons: ['bold', 'italic', 'underline', 'subscript', 'superscript'] },
  { key: 'paragraph', label: '段落',     buttons: ['h1', 'h2', 'quote', 'p', 'ul', 'ol'] },
  { key: 'align',     label: '对齐',     buttons: ['align-l', 'align-c', 'align-r'] },
  { key: 'insert',    label: '插入',     buttons: ['link', 'image', 'code'] },
  { key: 'medical',   label: '医疗专用', buttons: ['measurement', 'finding', 'formula', 'lab'] },
];
