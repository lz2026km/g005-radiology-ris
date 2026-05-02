// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 - 数据字典管理页面 v1.0.0
// 放射科专用数据字典：CT/MRI/X线检查项目、设备类型、诊断术语等
// ============================================================
import { useState, useMemo } from 'react'
import {
  Search, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight,
  BookOpen, Filter, RotateCcw, Stethoscope, Monitor, Camera,
  FileText, Activity, Zap, Cpu
} from 'lucide-react'

// ---------- 样式定义 ----------
const s: Record<string, React.CSSProperties> = {
  pageHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: 700, color: '#1e3a5f' },
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  toolbar: {
    display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
    background: '#fff', padding: '12px 16px', borderRadius: 10,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 16,
  },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 8, padding: '8px 14px', flex: 1, minWidth: 220,
  },
  searchInput: {
    border: 'none', outline: 'none', background: 'transparent',
    fontSize: 14, color: '#334155', width: '100%',
  },
  select: {
    border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 14px',
    fontSize: 13, color: '#334155', background: '#f8fafc', outline: 'none',
    cursor: 'pointer', minHeight: 44,
  },
  btnPrimary: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 18px', fontSize: 13, cursor: 'pointer', minHeight: 44,
    boxShadow: '0 2px 6px rgba(30,58,95,0.25)',
  },
  btnDanger: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8,
    padding: '8px 12px', fontSize: 13, cursor: 'pointer', minHeight: 44,
  },
  btnIcon: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8,
    padding: '8px 12px', fontSize: 13, cursor: 'pointer', minHeight: 44,
  },
  table: {
    width: '100%', borderCollapse: 'collapse', background: '#fff',
    borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  th: {
    background: '#f8fafc', padding: '12px 14px', textAlign: 'left',
    fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '12px 14px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f1f5f9',
  },
  badge: {
    display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11,
    fontWeight: 600,
  },
  badgeActive: { background: '#dcfce7', color: '#16a34a' },
  badgeInactive: { background: '#f1f5f9', color: '#94a3b8' },
  actions: { display: 'flex', gap: 6 },
  pagination: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 16, padding: '12px 16px', background: '#fff',
    borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  pageInfo: { fontSize: 13, color: '#64748b' },
  pageBtns: { display: 'flex', gap: 4 },
  pageBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 13, color: '#475569',
  },
  pageBtnActive: {
    background: '#1e3a5f', color: '#fff', border: '1px solid #1e3a5f',
  },
  pageBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: 14, width: 540, maxHeight: '90vh',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
  },
  modalHeader: {
    padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#1e3a5f',
  },
  modalTitle: { fontSize: 15, fontWeight: 700, color: '#fff' },
  modalClose: {
    background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 6,
    cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center',
    padding: 5,
  },
  modalBody: {
    padding: 20, overflowY: 'auto', flex: 1,
  },
  modalFooter: {
    padding: '12px 20px', borderTop: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'flex-end', gap: 10,
  },
  formGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
  },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 5 },
  formGroupFull: { gridColumn: '1 / -1' },
  label: { fontSize: 12, fontWeight: 600, color: '#475569' },
  required: { color: '#dc2626', marginLeft: 2 },
  input: {
    border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px',
    fontSize: 14, color: '#334155', outline: 'none', minHeight: 44,
    boxSizing: 'border-box', width: '100%',
  },
  textarea: {
    border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px',
    fontSize: 14, color: '#334155', outline: 'none', resize: 'vertical',
    minHeight: 80, fontFamily: 'inherit', boxSizing: 'border-box', width: '100%',
  },
  btnCancel: {
    padding: '10px 20px', borderRadius: 8, border: '1px solid #e2e8f0',
    background: '#fff', fontSize: 14, color: '#475569', cursor: 'pointer', minHeight: 44,
  },
  btnSubmit: {
    padding: '10px 20px', borderRadius: 8, border: 'none',
    background: '#1e3a5f', fontSize: 14, color: '#fff', cursor: 'pointer', minHeight: 44,
  },
  btnDeleteConfirm: {
    padding: '10px 20px', borderRadius: 8, border: 'none',
    background: '#dc2626', fontSize: 14, color: '#fff', cursor: 'pointer', minHeight: 44,
  },
  emptyState: {
    textAlign: 'center', padding: '60px 20px', color: '#94a3b8',
    fontSize: 16,
  },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 16, background: '#f1f5f9',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
  },
  emptyTitle: { fontSize: 16, fontWeight: 600, color: '#64748b', marginBottom: 8 },
  emptyDesc: { fontSize: 13, color: '#94a3b8', marginBottom: 20 },
  infoTip: {
    fontSize: 11, color: '#94a3b8', marginTop: 4,
  },
  deleteModalText: {
    fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 8,
  },
  stats: {
    display: 'flex', gap: 20, marginLeft: 'auto',
  },
  statCard: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#fff', padding: '8px 14px', borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9',
  },
  statItem: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 13, color: '#64748b',
  },
  statNum: { fontWeight: 800, color: '#1e3a5f', fontSize: 16 },
  categoryTag: {
    display: 'inline-block', padding: '3px 10px', borderRadius: 8,
    fontSize: 11, fontWeight: 700,
  },
  modalityBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 6,
    fontSize: 11, fontWeight: 600,
  },
}

// ---------- 字典数据类型 ----------
interface DictionaryItem {
  id: string
  category: string        // 分类：CT检查项目、MRI序列、X线体位、设备类型、诊断术语等
  code: string           // 编码
  name: string            // 名称
  pinyin?: string         // 拼音缩写
  modality?: string[]     // 适用设备类型：CT/MR/DR/DSA/乳腺/胃肠
  bodyPart?: string       // 检查部位
  sortOrder: number       // 排序
  isActive: boolean       // 是否启用
  notes?: string          // 备注
}

// ---------- 放射科字典分类颜色 ----------
const categoryColors: Record<string, { backgroundColor: string; color: string }> = {
  'CT检查项目':   { backgroundColor: '#dbeafe', color: '#1d4ed8' },
  'MRI序列':      { backgroundColor: '#fce7f3', color: '#be185d' },
  'X线检查':      { backgroundColor: '#dcfce7', color: '#16a34a' },
  '设备类型':     { backgroundColor: '#fef3c7', color: '#92400e' },
  '诊断术语':     { backgroundColor: '#e0e7ff', color: '#4338ca' },
  '检查部位':     { backgroundColor: '#fdf4ff', color: '#a21caf' },
  '造影剂':       { backgroundColor: '#ccfbf1', color: '#0f766e' },
  '辐射剂量':     { backgroundColor: '#fee2e2', color: '#b91c1c' },
  '体位技术':     { backgroundColor: '#fef9c3', color: '#854d0e' },
  '对比剂类型':   { backgroundColor: '#e0f2fe', color: '#0369a1' },
}

// ---------- 设备类型颜色 ----------
const modalityColors: Record<string, { bg: string; color: string }> = {
  'CT':    { bg: '#eff6ff', color: '#2563eb' },
  'MR':    { bg: '#f5f3ff', color: '#7c3aed' },
  'DR':    { bg: '#ecfdf5', color: '#059669' },
  'DSA':   { bg: '#fffbeb', color: '#d97706' },
  '乳腺':  { bg: '#fdf2f8', color: '#db2777' },
  '胃肠':  { bg: '#ecfeff', color: '#0891b2' },
}

// ---------- 初始字典数据 ----------
const initialDictionaries: DictionaryItem[] = [
  // CT检查项目
  { id: 'DICT-CT-001', category: 'CT检查项目', code: 'CT-BRAIN-NC', name: '颅脑CT平扫', pinyin: 'lwnctps', modality: ['CT'], bodyPart: '头部', sortOrder: 1, isActive: true, notes: '常规颅脑平扫，层厚5mm' },
  { id: 'DICT-CT-002', category: 'CT检查项目', code: 'CT-BRAIN-C', name: '颅脑CT增强', pinyin: 'lwnctzq', modality: ['CT'], bodyPart: '头部', sortOrder: 2, isActive: true, notes: '需注射对比剂' },
  { id: 'DICT-CT-003', category: 'CT检查项目', code: 'CT-CHEST-NC', name: '胸部CT平扫', pinyin: 'xbctps', modality: ['CT'], bodyPart: '胸部', sortOrder: 3, isActive: true, notes: '肺窗+纵隔窗' },
  { id: 'DICT-CT-004', category: 'CT检查项目', code: 'CT-CHEST-C', name: '胸部CT增强', pinyin: 'xbctzq', modality: ['CT'], bodyPart: '胸部', sortOrder: 4, isActive: true, notes: '肺动脉CTA方案' },
  { id: 'DICT-CT-005', category: 'CT检查项目', code: 'CT-CTA-HEAD', name: '头颅CTA', pinyin: 'tlcta', modality: ['CT'], bodyPart: '头部', sortOrder: 5, isActive: true, notes: '脑血管成像' },
  { id: 'DICT-CT-006', category: 'CT检查项目', code: 'CT-CTA-CHEST', name: '肺动脉CTA', pinyin: 'fdmcta', modality: ['CT'], bodyPart: '胸部', sortOrder: 6, isActive: true, notes: 'PE诊断金标准' },
  { id: 'DICT-CT-007', category: 'CT检查项目', code: 'CT-ABD-NC', name: '腹部CT平扫', pinyin: 'fbctps', modality: ['CT'], bodyPart: '腹部', sortOrder: 7, isActive: true, notes: '肝胆胰脾肾' },
  { id: 'DICT-CT-008', category: 'CT检查项目', code: 'CT-ABD-C', name: '腹部CT增强', pinyin: 'fbctzq', modality: ['CT'], bodyPart: '腹部', sortOrder: 8, isActive: true, notes: '三期增强扫描' },
  { id: 'DICT-CT-009', category: 'CT检查项目', code: 'CT-CORONARY', name: '冠脉CTA', pinyin: 'gmcta', modality: ['CT'], bodyPart: '心脏', sortOrder: 9, isActive: true, notes: '心率要求<75bpm' },
  { id: 'DICT-CT-010', category: 'CT检查项目', code: 'CT-SPINE-C', name: '脊柱CT三维重建', pinyin: 'jzctswcj', modality: ['CT'], bodyPart: '脊柱', sortOrder: 10, isActive: true, notes: '多平面重建MPR' },

  // MRI序列
  { id: 'DICT-MR-001', category: 'MRI序列', code: 'MR-T1WI', name: 'T1WI成像', pinyin: 't1wi', modality: ['MR'], bodyPart: '全身', sortOrder: 1, isActive: true, notes: 'SE序列' },
  { id: 'DICT-MR-002', category: 'MRI序列', code: 'MR-T2WI', name: 'T2WI成像', pinyin: 't2wi', modality: ['MR'], bodyPart: '全身', sortOrder: 2, isActive: true, notes: 'FSE序列' },
  { id: 'DICT-MR-003', category: 'MRI序列', code: 'MR-T2FS', name: 'T2脂肪抑制', pinyin: 't2zfyz', modality: ['MR'], bodyPart: '全身', sortOrder: 3, isActive: true, notes: 'STIR/FLAIR' },
  { id: 'DICT-MR-004', category: 'MRI序列', code: 'MR-DWI', name: 'DWI扩散成像', pinyin: 'dwkscx', modality: ['MR'], bodyPart: '全身', sortOrder: 4, isActive: true, notes: 'b值800-1000' },
  { id: 'DICT-MR-005', category: 'MRI序列', code: 'MR-ADC', name: 'ADC图', pinyin: 'adct', modality: ['MR'], bodyPart: '全身', sortOrder: 5, isActive: true, notes: '定量扩散系数' },
  { id: 'DICT-MR-006', category: 'MRI序列', code: 'MR-FLAIR', name: 'FLAIR序列', pinyin: 'flair', modality: ['MR'], bodyPart: '颅脑', sortOrder: 6, isActive: true, notes: '脑白质病变评估' },
  { id: 'DICT-MR-007', category: 'MRI序列', code: 'MR-SWI', name: 'SWI磁敏感成像', pinyin: 'swicmgxc', modality: ['MR'], bodyPart: '颅脑', sortOrder: 7, isActive: true, notes: '微出血/静脉显示' },
  { id: 'DICT-MR-008', category: 'MRI序列', code: 'MR-MRA', name: 'MRA脑血管成像', pinyin: 'marnxgxc', modality: ['MR'], bodyPart: '颅脑', sortOrder: 8, isActive: true, notes: 'TOF/PC法' },
  { id: 'DICT-MR-009', category: 'MRI序列', code: 'MR-MRC', name: 'MRCP胆胰管成像', pinyin: 'mrcpdygxc', modality: ['MR'], bodyPart: '腹部', sortOrder: 9, isActive: true, notes: '胰胆管水成像' },
  { id: 'DICT-MR-010', category: 'MRI序列', code: 'MR-PROPELLER', name: 'Propeller平息扫', pinyin: 'propellerpxs', modality: ['MR'], bodyPart: '颅脑', sortOrder: 10, isActive: true, notes: '运动伪影校正' },

  // X线检查
  { id: 'DICT-DR-001', category: 'X线检查', code: 'DR-CHEST-PA', name: '胸部正侧位片', pinyin: 'xbzcwp', modality: ['DR'], bodyPart: '胸部', sortOrder: 1, isActive: true, notes: '立位PA+侧位' },
  { id: 'DICT-DR-002', category: 'X线检查', code: 'DR-ABD-KUB', name: '腹部立卧位片', pinyin: 'fblwwp', modality: ['DR'], bodyPart: '腹部', sortOrder: 2, isActive: true, notes: '消化道穿孔筛查' },
  { id: 'DICT-DR-003', category: 'X线检查', code: 'DR-SPINE-C', name: '颈椎正侧斜位', pinyin: 'jz zcxcw', modality: ['DR'], bodyPart: '颈椎', sortOrder: 3, isActive: true, notes: '张口位可选' },
  { id: 'DICT-DR-004', category: 'X线检查', code: 'DR-SPINE-T', name: '胸椎正侧位', pinyin: 'xzzc w', modality: ['DR'], bodyPart: '胸椎', sortOrder: 4, isActive: true, notes: '驼背患者可只照侧位' },
  { id: 'DICT-DR-005', category: 'X线检查', code: 'DR-SPINE-L', name: '腰椎正侧位', pinyin: 'yz zc w', modality: ['DR'], bodyPart: '腰椎', sortOrder: 5, isActive: true, notes: '腰骶部疼痛评估' },
  { id: 'DICT-DR-006', category: 'X线检查', code: 'DR-PELVIS', name: '骨盆正位', pinyin: 'gpzw', modality: ['DR'], bodyPart: '骨盆', sortOrder: 6, isActive: true, notes: '髋关节评估' },
  { id: 'DICT-DR-007', category: 'X线检查', code: 'DR-EXT-ARM', name: '四肢正侧位', pinyin: 'szzcw', modality: ['DR'], bodyPart: '四肢', sortOrder: 7, isActive: true, notes: '骨折/脱位评估' },
  { id: 'DICT-DR-008', category: 'X线检查', code: 'DR-SKULL', name: '头颅正侧位', pinyin: 'tlzcw', modality: ['DR'], bodyPart: '头部', sortOrder: 8, isActive: true, notes: '外伤/骨质评估' },

  // 设备类型
  { id: 'DICT-EQ-001', category: '设备类型', code: 'EQ-CT-64', name: '64排CT', pinyin: '64pct', modality: ['CT'], bodyPart: '全身', sortOrder: 1, isActive: true, notes: 'Philips Brilliance 64' },
  { id: 'DICT-EQ-002', category: '设备类型', code: 'EQ-CT-128', name: '128排CT', pinyin: '128pct', modality: ['CT'], bodyPart: '全身', sortOrder: 2, isActive: true, notes: 'Siemens Definition AS+' },
  { id: 'DICT-EQ-003', category: '设备类型', code: 'EQ-CT-DUAL', name: '双源CT', pinyin: 'syct', modality: ['CT'], bodyPart: '全身', sortOrder: 3, isActive: true, notes: '心脏冠脉成像优势' },
  { id: 'DICT-EQ-004', category: '设备类型', code: 'EQ-MR-15T', name: '1.5T MRI', pinyin: '15tmri', modality: ['MR'], bodyPart: '全身', sortOrder: 4, isActive: true, notes: 'Philips Achieva 1.5T' },
  { id: 'DICT-EQ-005', category: '设备类型', code: 'EQ-MR-30T', name: '3.0T MRI', pinyin: '30tmri', modality: ['MR'], bodyPart: '全身', sortOrder: 5, isActive: true, notes: 'Siemens TrioTim 3.0T' },
  { id: 'DICT-EQ-006', category: '设备类型', code: 'EQ-DR-FLAT', name: '数字化DR', pinyin: 'smhdr', modality: ['DR'], bodyPart: '全身', sortOrder: 6, isActive: true, notes: '平板探测器' },
  { id: 'DICT-EQ-007', category: '设备类型', code: 'EQ-DR-CARM', name: 'C形臂DR', pinyin: 'cxbd r', modality: ['DR', 'DSA'], bodyPart: '手术室', sortOrder: 7, isActive: true, notes: '术中透视/介入' },
  { id: 'DICT-EQ-008', category: '设备类型', code: 'EQ-DSA', name: 'DSA血管机', pinyin: 'dsaxg j', modality: ['DSA'], bodyPart: '心血管', sortOrder: 8, isActive: true, notes: 'Philips Allura Xper FD20' },

  // 诊断术语
  { id: 'DICT-DIAG-001', category: '诊断术语', code: 'DIAG-NORMAL', name: '未见明显异常', pinyin: 'wjmxyc', modality: ['CT', 'MR', 'DR'], bodyPart: '全身', sortOrder: 1, isActive: true, notes: '正常报告模板' },
  { id: 'DICT-DIAG-002', category: '诊断术语', code: 'DIAG-STROKE', name: '脑梗死', pinyin: 'ngs', modality: ['CT', 'MR'], bodyPart: '颅脑', sortOrder: 2, isActive: true, notes: '急慢性分期' },
  { id: 'DICT-DIAG-003', category: '诊断术语', code: 'DIAG-HEMORRHAGE', name: '脑出血', pinyin: 'ncx', modality: ['CT', 'MR'], bodyPart: '颅脑', sortOrder: 3, isActive: true, notes: '急性期高密度' },
  { id: 'DICT-DIAG-004', category: '诊断术语', code: 'DIAG-TUMOR', name: '占位性病变', pinyin: 'zwxb b', modality: ['CT', 'MR'], bodyPart: '全身', sortOrder: 4, isActive: true, notes: '良恶性待定' },
  { id: 'DICT-DIAG-005', category: '诊断术语', code: 'DIAG-METS', name: '转移瘤', pinyin: 'zyl', modality: ['CT', 'MR'], bodyPart: '全身', sortOrder: 5, isActive: true, notes: '多发/单发' },
  { id: 'DICT-DIAG-006', category: '诊断术语', code: 'DIAG-FRACTURE', name: '骨折', pinyin: 'gz', modality: ['DR', 'CT'], bodyPart: '四肢/脊柱', sortOrder: 6, isActive: true, notes: '请注明部位及类型' },
  { id: 'DICT-DIAG-007', category: '诊断术语', code: 'DIAG-PNEUMONIA', name: '肺炎', pinyin: 'fy', modality: ['CT', 'DR'], bodyPart: '肺部', sortOrder: 7, isActive: true, notes: '大叶性/支气管肺炎' },
  { id: 'DICT-DIAG-008', category: '诊断术语', code: 'DIAG-NODULE', name: '肺结节', pinyin: 'f jie', modality: ['CT'], bodyPart: '肺部', sortOrder: 8, isActive: true, notes: '请描述大小/形态' },
  { id: 'DICT-DIAG-009', category: '诊断术语', code: 'DIAG-DISK', name: '椎间盘突出', pinyin: 'zjptc', modality: ['MR', 'CT'], bodyPart: '脊柱', sortOrder: 9, isActive: true, notes: '请注明节段' },
  { id: 'DICT-DIAG-010', category: '诊断术语', code: 'DIAG-ANEURYSM', name: '动脉瘤', pinyin: 'dml', modality: ['CT', 'MR'], bodyPart: '血管', sortOrder: 10, isActive: true, notes: '请注明部位/大小' },

  // 检查部位
  { id: 'DICT-BP-001', category: '检查部位', code: 'BP-HEAD', name: '头部', pinyin: 'tb', modality: ['CT', 'MR', 'DR'], bodyPart: '头部', sortOrder: 1, isActive: true, notes: '颅脑/副鼻窦/颞骨' },
  { id: 'DICT-BP-002', category: '检查部位', code: 'BP-NECK', name: '颈部', pinyin: 'jb', modality: ['CT', 'MR', 'DR'], bodyPart: '颈部', sortOrder: 2, isActive: true, notes: '甲状腺/气管/血管' },
  { id: 'DICT-BP-003', category: '检查部位', code: 'BP-CHEST', name: '胸部', pinyin: 'xb', modality: ['CT', 'DR', 'MR'], bodyPart: '胸部', sortOrder: 3, isActive: true, notes: '肺/纵隔/胸壁' },
  { id: 'DICT-BP-004', category: '检查部位', code: 'BP-ABD', name: '腹部', pinyin: 'fb', modality: ['CT', 'MR', 'DR'], bodyPart: '腹部', sortOrder: 4, isActive: true, notes: '肝胆胰脾肾' },
  { id: 'DICT-BP-005', category: '检查部位', code: 'BP-PELVIS', name: '盆腔', pinyin: 'pq', modality: ['CT', 'MR'], bodyPart: '盆腔', sortOrder: 5, isActive: true, notes: '膀胱/前列腺/子宫' },
  { id: 'DICT-BP-006', category: '检查部位', code: 'BP-SPINE', name: '脊柱', pinyin: 'jz', modality: ['CT', 'MR', 'DR'], bodyPart: '脊柱', sortOrder: 6, isActive: true, notes: '颈椎/胸椎/腰椎/骶椎' },
  { id: 'DICT-BP-007', category: '检查部位', code: 'BP-EXT', name: '四肢', pinyin: 'sz', modality: ['DR', 'CT', 'MR'], bodyPart: '四肢', sortOrder: 7, isActive: true, notes: '骨关节/软组织' },

  // 造影剂
  { id: 'DICT-CM-001', category: '造影剂', code: 'CM-IOHEXOL', name: '碘海醇', pinyin: 'dhc', modality: ['CT'], bodyPart: '全身', sortOrder: 1, isActive: true, notes: '浓度300/350mgI/ml' },
  { id: 'DICT-CM-002', category: '造影剂', code: 'CM-IOPAMIRON', name: '碘帕醇', pinyin: 'dpc', modality: ['CT'], bodyPart: '全身', sortOrder: 2, isActive: true, notes: '心脏CTA常用' },
  { id: 'DICT-CM-003', category: '造影剂', code: 'CM-OMNIPAQUE', name: '欧乃派克', pinyin: 'onpk', modality: ['CT'], bodyPart: '全身', sortOrder: 3, isActive: true, notes: '低渗非离子型' },
  { id: 'DICT-CM-004', category: '造影剂', code: 'CM-GD-DTPA', name: '钆喷酸葡胺', pinyin: 'gpspa', modality: ['MR'], bodyPart: '全身', sortOrder: 4, isActive: true, notes: '马根维显/莫迪司' },
  { id: 'DICT-CM-005', category: '造影剂', code: 'CM-GADOvist', name: '钆布醇', pinyin: 'gbc', modality: ['MR'], bodyPart: '全身', sortOrder: 5, isActive: true, notes: '高浓度MR对比剂' },

  // 体位技术
  { id: 'DICT-POS-001', category: '体位技术', code: 'POS-AP', name: '前后位AP', pinyin: 'qhwap', modality: ['DR'], bodyPart: '全身', sortOrder: 1, isActive: true, notes: 'X线束从前往后' },
  { id: 'DICT-POS-002', category: '体位技术', code: 'POS-PA', name: '后前位PA', pinyin: 'hqwpa', modality: ['DR'], bodyPart: '胸部', sortOrder: 2, isActive: true, notes: '胸部标准体位' },
  { id: 'DICT-POS-003', category: '体位技术', code: 'POS-LAT', name: '侧位LAT', pinyin: 'cwlat', modality: ['DR'], bodyPart: '全身', sortOrder: 3, isActive: true, notes: '左侧/右侧位' },
  { id: 'DICT-POS-004', category: '体位技术', code: 'POS-OBL', name: '斜位OBL', pinyin: 'xwobl', modality: ['DR'], bodyPart: '脊柱', sortOrder: 4, isActive: true, notes: '45度角斜位' },
  { id: 'DICT-POS-005', category: '体位技术', code: 'POS-DECUB', name: '卧位', pinyin: 'ww', modality: ['DR'], bodyPart: '腹部', sortOrder: 5, isActive: true, notes: '仰卧/俯卧/侧卧' },
  { id: 'DICT-POS-006', category: '体位技术', code: 'POS-UPRIGHT', name: '立位', pinyin: 'lw', modality: ['DR'], bodyPart: '腹部', sortOrder: 6, isActive: true, notes: '消化道穿孔站立位' },
]

// ---------- 空字典项 ----------
const emptyDictionary = (): Partial<DictionaryItem> => ({
  category: '',
  code: '',
  name: '',
  pinyin: '',
  modality: [],
  bodyPart: '',
  sortOrder: 0,
  isActive: true,
  notes: '',
})

// ---------- 校验 ----------
const validateDictionary = (d: Partial<DictionaryItem>): string[] => {
  const errs: string[] = []
  if (!(d.category ?? "").trim()) errs.push('分类不能为空')
  if (!(d.code ?? "").trim()) errs.push('编码不能为空')
  if (!(d.name ?? "").trim()) errs.push('名称不能为空')
  if (d.sortOrder ?? 0 < 0) errs.push('排序号不能为负数')
  return errs
}

// ---------- 主组件 ----------
export default function DictionaryPage() {
  const [dictionaries, setDictionaries] = useState<DictionaryItem[]>(initialDictionaries)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [modalityFilter, setModalityFilter] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 12

  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete' | null>(null)
  const [editingDictionary, setEditingDictionary] = useState<Partial<DictionaryItem>>(emptyDictionary())
  const [formErrors, setFormErrors] = useState<string[]>([])

  // 获取所有分类
  const categories = useMemo(() => {
    const cats = [...new Set(dictionaries.map(d => (d.category ?? "")))]
    return cats.sort()
  }, [dictionaries])

  // 获取所有设备类型
  const modalities = useMemo(() => {
    const mods = [...new Set(dictionaries.flatMap(d => d.modality ?? []))]
    return mods.sort()
  }, [dictionaries])

  // 过滤
  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase()
    return dictionaries.filter(d => {
      const matchSearch = !kw ||
        (d.name ?? "").toLowerCase().includes(kw) ||
        (d.code ?? "").toLowerCase().includes(kw) ||
        (d.pinyin ?? "").toLowerCase().includes(kw) ||
        (d.notes ?? "").toLowerCase().includes(kw) ||
        (d.bodyPart ?? "").toLowerCase().includes(kw)
      const matchCategory = !categoryFilter || ((d.category ?? "")) === categoryFilter
      const matchModality = !modalityFilter || (d.modality ?? []).includes(modalityFilter)
      return matchSearch && matchCategory && matchModality
    })
  }, [dictionaries, search, categoryFilter, modalityFilter])

  // 分页
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  // 统计
  const stats = useMemo(() => {
    const total = dictionaries.length
    const active = dictionaries.filter(d => d.isActive).length
    const catCount = categories.length
    return { total, active, catCount }
  }, [dictionaries, categories])

  const openAdd = () => {
    setEditingDictionary(emptyDictionary())
    setFormErrors([])
    setModalMode('add')
  }

  const openEdit = (d: DictionaryItem) => {
    setEditingDictionary({ ...d })
    setFormErrors([])
    setModalMode('edit')
  }

  const openDelete = (d: DictionaryItem) => {
    setEditingDictionary({ ...d })
    setModalMode('delete')
  }

  const closeModal = () => setModalMode(null)

  const handleSubmit = () => {
    if (modalMode === 'delete') {
      setDictionaries(prev => prev.filter(d => d.id !== editingDictionary.id))
      closeModal()
      return
    }
    const errs = validateDictionary(editingDictionary)
    if (errs.length > 0) { setFormErrors(errs); return }
    if (modalMode === 'add') {
      const id = 'DICT-' + String(Date.now()).slice(-6)
      setDictionaries(prev => [{ ...editingDictionary, id }, ...prev])
    } else if (modalMode === 'edit') {
      setDictionaries(prev => prev.map(d => d.id === editingDictionary.id ? { ...editingDictionary } as DictionaryItem : d))
    }
    closeModal()
  }

  const handleField = (field: keyof Partial<DictionaryItem>, value: string | number | boolean | string[]) => {
    setEditingDictionary(prev => ({ ...prev, [field]: value }))
  }

  const handleModalityToggle = (mod: string) => {
    const current = editingDictionary.modality ?? []
    setEditingDictionary(prev => ({
      ...prev,
      modality: current.includes(mod) ? current.filter(m => m !== mod) : [...current, mod],
    }))
  }

  const resetFilters = () => {
    setSearch('')
    setCategoryFilter('')
    setModalityFilter('')
    setPage(1)
  }

  return (
    <div style={{ background: '#f0f4f8', minHeight: '100vh', padding: 20, fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif' }}>
      {/* 页头 */}
      <div style={s.pageHeader}>
        <div>
          <div style={s.title}>📖 数据字典管理</div>
          <div style={s.subtitle}>放射科检查项目、设备类型、诊断术语标准化字典</div>
        </div>
        <div style={s.stats}>
          <div style={s.statCard}>
            <BookOpen size={15} color="#64748b" />
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#1e3a5f' }}>{stats.total}</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>字典条目</div>
            </div>
          </div>
          <div style={s.statCard}>
            <Activity size={15} color="#16a34a" />
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#16a34a' }}>{stats.active}</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>已启用</div>
            </div>
          </div>
          <div style={s.statCard}>
            <Filter size={15} color="#7c3aed" />
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#7c3aed' }}>{stats.catCount}</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>分类数</div>
            </div>
          </div>
        </div>
      </div>

      {/* 工具栏 */}
      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={15} color="#94a3b8" />
          <input
            style={s.searchInput}
            placeholder="搜索名称、编码、拼音、备注..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1) }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 2 }}>
              <X size={13} color="#94a3b8" />
            </button>
          )}
        </div>
        <select
          style={s.select}
          value={categoryFilter}
          onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}
        >
          <option value="">全部分类</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          style={s.select}
          value={modalityFilter}
          onChange={e => { setModalityFilter(e.target.value); setPage(1) }}
        >
          <option value="">全部设备</option>
          {modalities.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        {(search || categoryFilter || modalityFilter) && (
          <button style={s.btnIcon} onClick={resetFilters}>
            <RotateCcw size={13} /> 重置
          </button>
        )}
        <button style={s.btnPrimary} onClick={openAdd}>
          <Plus size={15} /> 新增字典项
        </button>
      </div>

      {/* 表格 */}
      {paged.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>
              <BookOpen size={28} color="#94a3b8" />
            </div>
            <div style={s.emptyTitle}>暂无字典数据</div>
            <div style={s.emptyDesc}>当前分类下没有字典记录，请尝试调整筛选条件</div>
            <button style={s.btnPrimary} onClick={openAdd}>
              <Plus size={15} /> 新增第一条字典
            </button>
          </div>
        </div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>分类</th>
              <th style={s.th}>编码</th>
              <th style={s.th}>名称</th>
              <th style={s.th}>设备类型</th>
              <th style={s.th}>部位</th>
              <th style={s.th}>拼音</th>
              <th style={s.th}>排序</th>
              <th style={s.th}>状态</th>
              <th style={s.th}>备注</th>
              <th style={s.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(d => (
              <tr key={d.id} style={{ background: '#fff', transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#fafbff'}
                onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = '#fff'}
              >
                <td style={s.td}>
                  <span
                    style={{
                      ...s.categoryTag,
                      ...(categoryColors[(d.category ?? "")] || { backgroundColor: '#f1f5f9', color: '#475569' }),
                    }}
                  >
                    {d.category ?? ""}
                  </span>
                </td>
                <td style={s.td}>
                  <code style={{ fontFamily: 'monospace', fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#64748b' }}>
                    {d.code ?? ""}
                  </code>
                </td>
                <td style={s.td}>
                  <div style={{ fontWeight: 600, color: '#1e3a5f' }}>{d.name ?? ""}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>{d.id}</div>
                </td>
                <td style={s.td}>
                  <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    {(d.modality ?? []).map(m => (
                      <span key={m} style={{
                        ...s.modalityBadge,
                        ...(modalityColors[m] || { bg: '#f1f5f9', color: '#475569' }),
                        backgroundColor: modalityColors[m]?.bg || '#f1f5f9',
                        color: modalityColors[m]?.color || '#475569',
                      }}>
                        {m}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={s.td}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{d.bodyPart || '-'}</span>
                </td>
                <td style={s.td}>
                  <span style={{ color: '#94a3b8', fontSize: 11 }}>{d.pinyin || '-'}</span>
                </td>
                <td style={s.td}>
                  <span style={{ color: '#64748b', fontFamily: 'monospace' }}>{d.sortOrder ?? 0}</span>
                </td>
                <td style={s.td}>
                  <span style={{ ...s.badge, ...(d.isActive ? s.badgeActive : s.badgeInactive) }}>
                    {d.isActive ? '✓ 启用' : '✗ 停用'}
                  </span>
                </td>
                <td style={s.td}>
                  <div
                    style={{
                      maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap', color: '#94a3b8', fontSize: 12,
                    }}
                    title={d.notes}
                  >
                    {d.notes || '-'}
                  </div>
                </td>
                <td style={s.td}>
                  <div style={s.actions}>
                    <button style={{ ...s.btnIcon, minHeight: 32, padding: '6px 10px' }} onClick={() => openEdit(d)} title="编辑">
                      <Edit2 size={12} /> 编辑
                    </button>
                    <button style={{ ...s.btnDanger, minHeight: 32, padding: '6px 10px' }} onClick={() => openDelete(d)} title="删除">
                      <Trash2 size={12} /> 删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 分页 */}
      <div style={s.pagination}>
        <div style={s.pageInfo}>
          共 <strong style={{ color: '#1e3a5f' }}>{filtered.length}</strong> 条记录，
          第 <strong style={{ color: '#1e3a5f' }}>{page}</strong> / <strong style={{ color: '#1e3a5f' }}>{totalPages}</strong> 页
        </div>
        <div style={s.pageBtns}>
          <button
            style={{ ...s.pageBtn, ...(page === 1 ? s.pageBtnDisabled : {}) }}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let num = i + 1
            if (totalPages > 5) {
              if (page > 3) num = page - 2 + i
              if (page > totalPages - 2) num = totalPages - 4 + i
            }
            return (
              <button
                key={num}
                style={{ ...s.pageBtn, ...(page === num ? s.pageBtnActive : {}) }}
                onClick={() => setPage(num)}
              >
                {num}
              </button>
            )
          })}
          <button
            style={{ ...s.pageBtn, ...(page === totalPages ? s.pageBtnDisabled : {}) }}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* 弹窗 */}
      {modalMode && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div style={s.modal}>
            {/* 删除确认 */}
            {modalMode === 'delete' ? (
              <>
                <div style={s.modalHeader}>
                  <div style={s.modalTitle}>⚠️ 确认删除</div>
                  <button style={s.modalClose} onClick={closeModal}><X size={16} /></button>
                </div>
                <div style={s.modalBody}>
                  <div style={s.deleteModalText}>
                    确定要删除字典项 <strong>"{editingDictionary.name}"</strong> 吗？
                  </div>
                  <div style={s.deleteModalText}>
                    此操作不可恢复，关联数据可能受影响。
                  </div>
                </div>
                <div style={s.modalFooter}>
                  <button style={s.btnCancel} onClick={closeModal}>取消</button>
                  <button style={s.btnDeleteConfirm} onClick={handleSubmit}>确认删除</button>
                </div>
              </>
            ) : (
              <>
                <div style={s.modalHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BookOpen size={16} color="#60a5fa" />
                    <span style={s.modalTitle}>{modalMode === 'add' ? '➕ 新增字典项' : '✏️ 编辑字典项'}</span>
                  </div>
                  <button style={s.modalClose} onClick={closeModal}><X size={16} /></button>
                </div>
                <div style={s.modalBody}>
                  {/* 错误提示 */}
                  {formErrors.length > 0 && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
                      {formErrors.map((err, i) => (
                        <div key={i} style={{ fontSize: 12, color: '#dc2626' }}>• {err}</div>
                      ))}
                    </div>
                  )}

                  {/* 表单 */}
                  <div style={s.formGrid}>
                    {/* 分类 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>分类 <span style={s.required}>*</span></label>
                      <select
                        style={s.input}
                        value={editingDictionary.category ?? ''}
                        onChange={e => handleField('category', e.target.value)}
                      >
                        <option value="">请选择分类</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* 编码 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>编码 <span style={s.required}>*</span></label>
                      <input
                        style={s.input}
                        placeholder="如：CT-BRAIN-NC"
                        value={editingDictionary.code ?? ''}
                        onChange={e => handleField('code', e.target.value)}
                      />
                    </div>

                    {/* 名称 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>名称 <span style={s.required}>*</span></label>
                      <input
                        style={s.input}
                        placeholder="如：颅脑CT平扫"
                        value={editingDictionary.name ?? ''}
                        onChange={e => handleField('name', e.target.value)}
                      />
                    </div>

                    {/* 拼音 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>拼音缩写</label>
                      <input
                        style={s.input}
                        placeholder="如：lwnctps"
                        value={editingDictionary.pinyin ?? ''}
                        onChange={e => handleField('pinyin', e.target.value)}
                      />
                    </div>

                    {/* 检查部位 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>检查部位</label>
                      <input
                        style={s.input}
                        placeholder="如：头部、胸部、腹部"
                        value={editingDictionary.bodyPart ?? ''}
                        onChange={e => handleField('bodyPart', e.target.value)}
                      />
                    </div>

                    {/* 排序 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>排序号</label>
                      <input
                        style={s.input}
                        type="number"
                        min={0}
                        placeholder="0"
                        value={editingDictionary.sortOrder ?? 0}
                        onChange={e => handleField('sortOrder', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    {/* 设备类型 */}
                    <div style={{ ...s.formGroup, ...s.formGroupFull }}>
                      <label style={s.label}>适用设备类型</label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {['CT', 'MR', 'DR', 'DSA', '乳腺', '胃肠'].map(m => {
                          const isSelected = (editingDictionary.modality ?? []).includes(m)
                          return (
                            <label
                              key={m}
                              onClick={() => handleModalityToggle(m)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '7px 12px', borderRadius: 8, cursor: 'pointer',
                                fontSize: 12, fontWeight: 600,
                                border: `1px solid ${isSelected ? (modalityColors[m]?.color || '#1e3a5f') : '#e2e8f0'}`,
                                background: isSelected ? (modalityColors[m]?.bg || '#eff6ff') : '#fff',
                                color: isSelected ? (modalityColors[m]?.color || '#1e3a5f') : '#94a3b8',
                                userSelect: 'none',
                              }}
                            >
                              <div style={{
                                width: 14, height: 14, borderRadius: 4,
                                border: `2px solid ${isSelected ? (modalityColors[m]?.color || '#1e3a5f') : '#cbd5e1'}`,
                                background: isSelected ? (modalityColors[m]?.color || '#1e3a5f') : '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                              }}>
                                {isSelected && <span style={{ color: '#fff', fontSize: 9 }}>✓</span>}
                              </div>
                              {m}
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    {/* 状态 */}
                    <div style={{ ...s.formGroup, ...s.formGroupFull }}>
                      <label
                        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#334155' }}
                        onClick={() => handleField('isActive', !editingDictionary.isActive)}
                      >
                        <div style={{
                          width: 16, height: 16, borderRadius: 4,
                          border: `2px solid ${editingDictionary.isActive ? '#16a34a' : '#cbd5e1'}`,
                          background: editingDictionary.isActive ? '#16a34a' : '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {editingDictionary.isActive && <span style={{ color: '#fff', fontSize: 10 }}>✓</span>}
                        </div>
                        启用状态
                      </label>
                    </div>

                    {/* 备注 */}
                    <div style={{ ...s.formGroup, ...s.formGroupFull }}>
                      <label style={s.label}>备注说明</label>
                      <textarea
                        style={s.textarea}
                        placeholder="补充说明，如：适应症、检查参数要求等"
                        value={editingDictionary.notes ?? ''}
                        onChange={e => handleField('notes', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
                <div style={s.modalFooter}>
                  <button style={s.btnCancel} onClick={closeModal}>取消</button>
                  <button style={s.btnSubmit} onClick={handleSubmit}>
                    {modalMode === 'add' ? '确认新增' : '保存修改'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
