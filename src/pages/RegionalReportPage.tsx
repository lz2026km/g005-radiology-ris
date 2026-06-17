// TODO v3.0.4: 此文件超过 2000 行（3347行），需要拆分为子组件
// v3.0.4 重构目标：
// 1. 提取页面头部 (title + breadcrumb + actions)
// 2. 提取搜索/筛选栏为独立组件
// 3. 提取列表/表格为独立组件
// 4. 提取对话框/编辑面板为独立组件
// G005 放射RIS系统 - 区域影像报告管理页面 v2.0.0
// 功能：远程会诊、区域报告审核、危急值通报、医联体远程诊断、跨机构联合签发、区域数据统计
// 新增：跨机构报告分享、远程阅读SLA监控、区域统计看板
import React, { useState } from 'react'
import {
  // 会诊相关图标
  Video, FileText, Clock, CheckCircle, Send, Search, Filter, RefreshCw, ChevronRight, Plus, Eye,
  // 报告审核相关图标
  ShieldCheck, BadgeCheck, XCircle, ClipboardList,
  // 危急值相关图标
  ShieldAlert, // 统计图表相关图标
  BarChart3, Activity,
  // 机构相关图标
  Building2, Building, // 通用图标
  Download, Settings, X, Check, ArrowRight, Circle, ArrowUp, ArrowDown, Monitor, PenTool,
  // 联合签发相关图标
  FileSignature, Lock, Share2, UserX, UserCheck, TrendingUp, TrendingDown,
  Users, Globe, Target, Timer, Award
} from 'lucide-react'

// ============ 样式常量 ============
const COLORS = {
  primary: '#1e40af',      // 深蓝主色
  secondary: '#0891b2',    // 青色辅色
  success: '#16a34a',       // 成功绿
  warning: '#d97706',      // 警告橙
  danger: '#dc2626',        // 危险红
  bgGray: '#e8e8e8',        // 浅灰背景
  cardWhite: '#ffffff',     // 白色卡片
  textDark: '#1f2937',      // 深色文字
  textMuted: '#6b7280',     // 灰色文字
  border: '#d1d5db',        // 边框色
  pending: '#f59e0b',       // 待处理
  inProgress: '#3b82f6',    // 进行中
  completed: '#10b981',     // 已完成
}

const styles = {
  // 页面容器
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: COLORS.bgGray,
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    fontSize: '14px',
    color: COLORS.textDark,
  },
  // 顶部标题栏
  header: {
    backgroundColor: COLORS.primary,
    color: 'white',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '20px',
    fontWeight: 600,
  },
  headerSubtitle: {
    fontSize: '12px',
    opacity: 0.85,
    marginTop: '2px',
  },
  // 统计卡片容器
  statsContainer: {
    display: 'flex',
    gap: '16px',
    padding: '20px 24px',
    flexWrap: 'wrap' as const,
  },
  statCard: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: '8px',
    padding: '16px 20px',
    minWidth: '180px',
    flex: 1,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
  },
  statLabel: {
    fontSize: '12px',
    color: COLORS.textMuted,
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: COLORS.primary,
  },
  statChange: {
    fontSize: '11px',
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  // 主内容区
  mainContent: {
    display: 'flex',
    gap: '16px',
    padding: '0 24px 20px',
    height: 'calc(100vh - 280px)',
    minHeight: '500px',
  },
  // 左侧面板
  leftPanel: {
    width: '260px',
    backgroundColor: COLORS.cardWhite,
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  panelHeader: {
    padding: '14px 16px',
    borderBottom: '1px solid #e5e7eb',
    fontWeight: 600,
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  panelBody: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '8px',
  },
  // 中间面板
  middlePanel: {
    flex: 1,
    backgroundColor: COLORS.cardWhite,
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  // 右侧面板
  rightPanel: {
    width: '320px',
    backgroundColor: COLORS.cardWhite,
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  // 底部面板
  bottomPanel: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: '8px',
    margin: '0 24px 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  // Tab 标签
  tabContainer: {
    display: 'flex',
    gap: '4px',
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    flexWrap: 'wrap' as const,
  },
  tab: {
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
    border: 'none',
    backgroundColor: 'transparent',
    color: COLORS.textMuted,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    color: 'white',
  },
  // 列表项
  listItem: {
    padding: '10px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '4px',
    transition: 'all 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  listItemActive: {
    backgroundColor: '#eff6ff',
    borderLeft: `3px solid ${COLORS.primary}`,
  },
  listItemHover: {
    backgroundColor: '#f3f4f6',
  },
  // 表格样式
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '13px',
  },
  th: {
    padding: '10px 12px',
    textAlign: 'left' as const,
    backgroundColor: '#f9fafb',
    borderBottom: '2px solid #e5e7eb',
    fontWeight: 600,
    color: COLORS.textDark,
    whiteSpace: 'nowrap' as const,
  },
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid #e5e7eb',
  },
  // 按钮样式
  button: {
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
    border: 'none',
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    color: 'white',
  },
  buttonSecondary: {
    backgroundColor: COLORS.secondary,
    color: 'white',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    border: `1px solid ${COLORS.primary}`,
    color: COLORS.primary,
  },
  buttonDanger: {
    backgroundColor: COLORS.danger,
    color: 'white',
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    color: COLORS.textMuted,
  },
  // 状态标签
  statusTag: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  // 输入框
  input: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  // 文本域
  textarea: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '13px',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: '80px',
    fontFamily: 'inherit',
  },
  // 模态框
  modal: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: '12px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 600,
    fontSize: '16px',
  },
  modalBody: {
    padding: '20px',
  },
  modalFooter: {
    padding: '16px 20px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  // 表单项
  formGroup: {
    marginBottom: '16px',
  },
  formLabel: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 500,
    fontSize: '13px',
    color: COLORS.textDark,
  },
  // 小标签
  badge: {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
  },
  // 分页
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
  },
  // 空状态
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center' as const,
    color: COLORS.textMuted,
  },
  // 时间线
  timeline: {
    padding: '16px',
  },
  timelineItem: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    position: 'relative' as const,
  },
  timelineDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: COLORS.primary,
    marginTop: '4px',
    flexShrink: 0,
  },
  timelineLine: {
    position: 'absolute' as const,
    left: '4px',
    top: '16px',
    bottom: '-12px',
    width: '2px',
    backgroundColor: '#e5e7eb',
  },
  // 图表容器
  chartContainer: {
    padding: '16px',
    height: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    margin: '12px',
  },
  // 进度条
  progressBar: {
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s',
  },
  // 搜索框
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    margin: '12px',
  },
}

// ============ 类型定义 ============
interface Institution {
  id: string
  name: string
  level: '三级' | '二级' | '一级'
  type: '综合医院' | '专科医院' | '基层医疗'
  reportCount: number
  pendingCount: number
  icon: string
}

interface Consultation {
  id: string
  caseId: string
  patientName: string
  gender: string
  age: number
  institution: string
  modality: string
  examItem: string
  applyReason: string
  status: '待接诊' | '会诊中' | '已完成' | '已取消'
  applyTime: string
  acceptTime?: string
  completeTime?: string
  applyDoctor: string
  acceptDoctor?: string
  consultationOpinion?: string
  priority: '普通' | '紧急' | '立即'
}

interface Report {
  id: string
  reportId: string
  institution: string
  patientName: string
  gender: string
  age: number
  modality: string
  examItem: string
  reportTime: string
  reportDoctor: string
  status: '待审核' | '已通过' | '有问题' | '已驳回'
  qualityScore: number
  qualityIssues: string[]
  reviewOpinion?: string
  reviewDoctor?: string
  reviewTime?: string
}

interface CriticalValueReport {
  id: string
  patientName: string
  gender: string
  age: number
  institution: string
  modality: string
  examItem: string
  criticalFinding: string
  severity: '危急' | '高危' | '紧急'
  reportedTime: string
  reportedDoctor: string
  status: '待确认' | '已接收' | '处理中' | '已闭环'
  receiveTime?: string
  receiveDoctor?: string
  handleTime?: string
  handleDoctor?: string
  closeTime?: string
}

// 医联体远程诊断记录
interface RemoteDiagnosis {
  id: string
  caseId: string
  patientName: string
  gender: string
  age: number
  examType: string
  applyInstitution: string
  remoteExpert: string
  expertInstitution: string
  status: '待书写' | '书写中' | '待审核' | '已完成'
  applyTime: string
  startTime?: string
  completeTime?: string
  reportContent?: string
  isOtherTyping?: boolean
  otherTypingName?: string
}

// 跨机构联合签发记录
interface CoSignRecord {
  id: string
  reportId: string
  examType: string
  patientName: string
  gender: string
  age: number
  participatingInstitutions: string[]
  status: '待签发' | '签发中' | '已完成'
  createTime: string
  completeTime?: string
  signatures: Signature[]
  versions: ReportVersion[]
}

interface Signature {
  institution: string
  doctorName: string
  signTime: string
  certificateStatus: '已认证' | '未认证' | '过期'
  order: number
}

interface ReportVersion {
  version: string
  modifyTime: string
  modifyInstitution: string
  modifyReason: string
  modifier: string
}

interface StatData {
  label: string
  value: number | string
  change?: number
  changeType?: 'up' | 'down'
  icon: React.ReactNode
  color: string
}

// 新增类型
interface ShareRecord {
  id: string
  reportId: string
  patientName: string
  institution: string
  targetInstitution: string
  sharedDate: string
  sharedBy: string
  status: 'active' | 'revoked'
  consent: boolean
  accessCount: number
}

interface SLARecord {
  siteName: string
  assignedExams: number
  completedExams: number
  avgTAT: string
  slaTarget: string
  slaCompliance: number
}

// ============ 模拟数据 ============
// 医疗机构数据
const mockInstitutions: Institution[] = [
  { id: '1', name: '市中心医院', level: '三级', type: '综合医院', reportCount: 1256, pendingCount: 23, icon: 'hospital' },
  { id: '2', name: '医学院附属医院', level: '三级', type: '综合医院', reportCount: 1089, pendingCount: 18, icon: 'building' },
  { id: '3', name: '区人民医院', level: '二级', type: '综合医院', reportCount: 678, pendingCount: 12, icon: 'building2' },
  { id: '4', name: '妇幼保健院', level: '二级', type: '专科医院', reportCount: 456, pendingCount: 8, icon: 'clinic' },
  { id: '5', name: '社区服务中心', level: '一级', type: '基层医疗', reportCount: 234, pendingCount: 5, icon: 'clinic' },
]

// 会诊记录数据
const mockConsultations: Consultation[] = [
  { id: 'C001', caseId: 'RC20260501001', patientName: '王建国', gender: '男', age: 58, institution: '市中心医院', modality: 'CT', examItem: '胸部增强CT', applyReason: '右肺占位性病变，需明确诊断', status: '待接诊', applyTime: '2026-05-02 08:30', applyDoctor: '李明', priority: '紧急' },
  { id: 'C002', caseId: 'RC20260501002', patientName: '张丽华', gender: '女', age: 45, institution: '区人民医院', modality: 'MRI', examItem: '颅脑MRI', applyReason: '头晕头痛待查', status: '会诊中', applyTime: '2026-05-02 09:15', acceptTime: '2026-05-02 09:30', applyDoctor: '王芳', acceptDoctor: '赵主任', priority: '普通' },
  { id: 'C003', caseId: 'RC20260501003', patientName: '陈志强', gender: '男', age: 67, institution: '医学院附属医院', modality: 'DR', examItem: '胸片', applyReason: '肺结核复查', status: '已完成', applyTime: '2026-05-01 14:20', acceptTime: '2026-05-01 14:35', completeTime: '2026-05-01 15:10', applyDoctor: '刘洋', acceptDoctor: '张主任', consultationOpinion: '右肺上叶见纤维索条影，结核灶稳定，建议定期复查', priority: '普通' },
  { id: 'C004', caseId: 'RC20260501004', patientName: '周小红', gender: '女', age: 34, institution: '妇幼保健院', modality: '超声', examItem: '产科彩超', applyReason: '孕24周大排畸', status: '已完成', applyTime: '2026-05-01 10:00', acceptTime: '2026-05-01 10:15', completeTime: '2026-05-01 11:30', applyDoctor: '孙颖', acceptDoctor: '李主任', consultationOpinion: '胎儿发育正常，羊水量正常，未见明显畸形', priority: '普通' },
  { id: 'C005', caseId: 'RC20260501005', patientName: '刘德华', gender: '男', age: 72, institution: '社区服务中心', modality: 'CT', examItem: '腹部CT', applyReason: '腹痛待查，疑似肠梗阻', status: '会诊中', applyTime: '2026-05-02 07:45', acceptTime: '2026-05-02 08:00', applyDoctor: '马超', acceptDoctor: '王主任', priority: '立即' },
]

// 报告审核数据
const mockReports: Report[] = [
  { id: 'R001', reportId: 'REP20260501001', institution: '区人民医院', patientName: '张三', gender: '男', age: 55, modality: 'CT', examItem: '胸部CT', reportTime: '2026-05-02 08:00', reportDoctor: '王医生', status: '待审核', qualityScore: 0, qualityIssues: [] },
  { id: 'R002', reportId: 'REP20260501002', institution: '妇幼保健院', patientName: '李四', gender: '女', age: 28, modality: '超声', examItem: '乳腺彩超', reportTime: '2026-05-02 09:30', reportDoctor: '赵医生', status: '有问题', qualityScore: 72, qualityIssues: ['描述欠详细', '诊断意见不明确'] },
  { id: 'R003', reportId: 'REP20260501003', institution: '社区服务中心', patientName: '周五', gender: '男', age: 62, modality: 'DR', examItem: '腰椎片', reportTime: '2026-05-01 16:00', reportDoctor: '孙医生', status: '已通过', qualityScore: 95, qualityIssues: [] },
  { id: 'R004', reportId: 'REP20260501004', institution: '区人民医院', patientName: '钱七', gender: '女', age: 41, modality: 'MRI', examItem: '膝关节MRI', reportTime: '2026-05-01 14:20', reportDoctor: '陈医生', status: '已驳回', qualityScore: 45, qualityIssues: ['报告格式不规范', '缺少测量数据', '影像描述与诊断不符'] },
  { id: 'R005', reportId: 'REP20260501005', institution: '医学院附属医院', patientName: '孙九', gender: '男', age: 73, modality: 'CT', examItem: '颅脑CT', reportTime: '2026-05-01 11:45', reportDoctor: '周医生', status: '待审核', qualityScore: 0, qualityIssues: [] },
]

// 危急值通报数据
const mockCriticalValues: CriticalValueReport[] = [
  { id: 'CV001', patientName: '吴一', gender: '男', age: 65, institution: '市中心医院', modality: 'CT', examItem: '胸部CT', criticalFinding: '主动脉夹层', severity: '危急', reportedTime: '2026-05-02 08:00', reportedDoctor: '李主任', status: '已闭环', receiveTime: '2026-05-02 08:05', receiveDoctor: '张医生', handleTime: '2026-05-02 08:30', handleDoctor: '急诊科', closeTime: '2026-05-02 09:15' },
  { id: 'CV002', patientName: '郑二', gender: '女', age: 48, institution: '医学院附属医院', modality: 'CT', examItem: '腹部CT', criticalFinding: '肝占位性病变（疑似肝癌）', severity: '危急', reportedTime: '2026-05-02 09:30', reportedDoctor: '王主任', status: '处理中', receiveTime: '2026-05-02 09:35', receiveDoctor: '刘医生', handleTime: '2026-05-02 10:00', handleDoctor: '肿瘤科' },
  { id: 'CV003', patientName: '冯三', gender: '男', age: 52, institution: '区人民医院', modality: 'X光', examItem: '胸片', criticalFinding: '气胸（肺压缩约50%）', severity: '紧急', reportedTime: '2026-05-01 15:20', reportedDoctor: '孙医生', status: '已闭环', receiveTime: '2026-05-01 15:22', receiveDoctor: '赵医生', handleTime: '2026-05-01 15:45', handleDoctor: '胸外科', closeTime: '2026-05-01 16:30' },
  { id: 'CV004', patientName: '褚四', gender: '女', age: 38, institution: '妇幼保健院', modality: '超声', examItem: '妇产科彩超', criticalFinding: '宫外孕破裂待排', severity: '危急', reportedTime: '2026-05-01 11:00', reportedDoctor: '陈医生', status: '已闭环', receiveTime: '2026-05-01 11:03', receiveDoctor: '黄医生', handleTime: '2026-05-01 11:20', handleDoctor: '妇科', closeTime: '2026-05-01 12:00' },
  { id: 'CV005', patientName: '卫五', gender: '男', age: 71, institution: '社区服务中心', modality: '心电图', examItem: '常规心电图', criticalFinding: '急性心肌梗死', severity: '危急', reportedTime: '2026-05-01 08:30', reportedDoctor: '周医生', status: '已闭环', receiveTime: '2026-05-01 08:32', receiveDoctor: '吴医生', handleTime: '2026-05-01 08:45', handleDoctor: '心内科', closeTime: '2026-05-01 09:30' },
]

// 医联体远程诊断数据（10条）
const mockRemoteDiagnoses: RemoteDiagnosis[] = [
  { id: 'RD001', caseId: 'REM20260501001', patientName: '赵伟', gender: '男', age: 56, examType: '胸部CT', applyInstitution: '区人民医院', remoteExpert: '张主任', expertInstitution: '市中心医院', status: '待书写', applyTime: '2026-05-02 10:00' },
  { id: 'RD002', caseId: 'REM20260501002', patientName: '钱敏', gender: '女', age: 43, examType: '颅脑MRI', applyInstitution: '社区服务中心', remoteExpert: '李教授', expertInstitution: '医学院附属医院', status: '书写中', applyTime: '2026-05-02 09:00', startTime: '2026-05-02 09:15', isOtherTyping: true, otherTypingName: '李教授' },
  { id: 'RD003', caseId: 'REM20260501003', patientName: '孙强', gender: '男', age: 65, examType: '腹部CT', applyInstitution: '妇幼保健院', remoteExpert: '王主任', expertInstitution: '市中心医院', status: '待审核', applyTime: '2026-05-02 08:00', startTime: '2026-05-02 08:20', completeTime: '2026-05-02 08:45', reportContent: '肝右叶见约3.2cm低密度影，边界欠清，增强扫描见轻中度强化，建议进一步检查。' },
  { id: 'RD004', caseId: 'REM20260501004', patientName: '周莉', gender: '女', age: 38, examType: '乳腺钼靶', applyInstitution: '区人民医院', remoteExpert: '陈专家', expertInstitution: '医学院附属医院', status: '已完成', applyTime: '2026-05-01 14:00', startTime: '2026-05-01 14:15', completeTime: '2026-05-01 15:00', reportContent: '双侧乳腺腺体致密，未见明确占位性病变，BI-RADS 1类。' },
  { id: 'RD005', caseId: 'REM20260501005', patientName: '吴涛', gender: '男', age: 72, examType: '胸片', applyInstitution: '社区服务中心', remoteExpert: '刘主任', expertInstitution: '市中心医院', status: '待书写', applyTime: '2026-05-02 11:30' },
  { id: 'RD006', caseId: 'REM20260501006', patientName: '郑华', gender: '女', age: 51, examType: '骨盆MRI', applyInstitution: '区人民医院', remoteExpert: '赵教授', expertInstitution: '医学院附属医院', status: '书写中', applyTime: '2026-05-02 08:45', startTime: '2026-05-02 09:00', isOtherTyping: false },
  { id: 'RD007', caseId: 'REM20260501007', patientName: '冯军', gender: '男', age: 48, examType: '颈部CT', applyInstitution: '妇幼保健院', remoteExpert: '孙主任', expertInstitution: '市中心医院', status: '待审核', applyTime: '2026-05-01 16:00', startTime: '2026-05-01 16:20', completeTime: '2026-05-01 16:50', reportContent: '甲状腺右叶见一枚约1.5cm结节，边界尚清，建议密切随访。' },
  { id: 'RD008', caseId: 'REM20260501008', patientName: '曹芳', gender: '女', age: 29, examType: '心脏彩超', applyInstitution: '社区服务中心', remoteExpert: '周主任', expertInstitution: '医学院附属医院', status: '已完成', applyTime: '2026-05-01 10:00', startTime: '2026-05-01 10:15', completeTime: '2026-05-01 11:00', reportContent: '心脏结构及功能未见明显异常，左室射血分数60%。' },
  { id: 'RD009', caseId: 'REM20260501009', patientName: '张磊', gender: '男', age: 61, examType: '胸部增强CT', applyInstitution: '区人民医院', remoteExpert: '吴主任', expertInstitution: '市中心医院', status: '待书写', applyTime: '2026-05-02 13:00' },
  { id: 'RD010', caseId: 'REM20260501010', patientName: '李梅', gender: '女', age: 45, examType: '颅脑CT', applyInstitution: '妇幼保健院', remoteExpert: '郑教授', expertInstitution: '医学院附属医院', status: '书写中', applyTime: '2026-05-02 07:30', startTime: '2026-05-02 07:45', isOtherTyping: true, otherTypingName: '郑教授' },
]

// 跨机构联合签发数据（5条）
const mockCoSignRecords: CoSignRecord[] = [
  {
    id: 'CS001',
    reportId: 'COS20260501001',
    examType: '胸部CT',
    patientName: '王明',
    gender: '男',
    age: 58,
    participatingInstitutions: ['社区服务中心', '区人民医院', '市中心医院'],
    status: '已完成',
    createTime: '2026-05-01 09:00',
    completeTime: '2026-05-01 11:30',
    signatures: [
      { institution: '社区服务中心', doctorName: '马超医生', signTime: '2026-05-01 09:00', certificateStatus: '已认证', order: 1 },
      { institution: '区人民医院', doctorName: '李主任', signTime: '2026-05-01 10:15', certificateStatus: '已认证', order: 2 },
      { institution: '市中心医院', doctorName: '张主任', signTime: '2026-05-01 11:30', certificateStatus: '已认证', order: 3 },
    ],
    versions: [
      { version: 'V1.0', modifyTime: '2026-05-01 09:00', modifyInstitution: '社区服务中心', modifyReason: '初步报告', modifier: '马超医生' },
      { version: 'V1.1', modifyTime: '2026-05-01 10:15', modifyInstitution: '区人民医院', modifyReason: '补充影像描述', modifier: '李主任' },
      { version: 'V1.2', modifyTime: '2026-05-01 11:30', modifyInstitution: '市中心医院', modifyReason: '最终诊断意见', modifier: '张主任' },
    ],
  },
  {
    id: 'CS002',
    reportId: 'COS20260501002',
    examType: '颅脑MRI',
    patientName: '刘芳',
    gender: '女',
    age: 42,
    participatingInstitutions: ['区人民医院', '医学院附属医院', '市中心医院'],
    status: '签发中',
    createTime: '2026-05-02 08:00',
    signatures: [
      { institution: '区人民医院', doctorName: '王医生', signTime: '2026-05-02 08:00', certificateStatus: '已认证', order: 1 },
      { institution: '医学院附属医院', doctorName: '赵教授', signTime: '2026-05-02 09:30', certificateStatus: '已认证', order: 2 },
    ],
    versions: [
      { version: 'V1.0', modifyTime: '2026-05-02 08:00', modifyInstitution: '区人民医院', modifyReason: '初步报告', modifier: '王医生' },
      { version: 'V1.1', modifyTime: '2026-05-02 09:30', modifyInstitution: '医学院附属医院', modifyReason: '专家补充意见', modifier: '赵教授' },
    ],
  },
  {
    id: 'CS003',
    reportId: 'COS20260501003',
    examType: '腹部CT',
    patientName: '陈刚',
    gender: '男',
    age: 55,
    participatingInstitutions: ['社区服务中心', '区人民医院', '医学院附属医院', '市中心医院'],
    status: '已完成',
    createTime: '2026-05-01 14:00',
    completeTime: '2026-05-01 17:00',
    signatures: [
      { institution: '社区服务中心', doctorName: '孙医生', signTime: '2026-05-01 14:00', certificateStatus: '已认证', order: 1 },
      { institution: '区人民医院', doctorName: '陈主任', signTime: '2026-05-01 15:00', certificateStatus: '已认证', order: 2 },
      { institution: '医学院附属医院', doctorName: '刘教授', signTime: '2026-05-01 16:00', certificateStatus: '已认证', order: 3 },
      { institution: '市中心医院', doctorName: '周主任', signTime: '2026-05-01 17:00', certificateStatus: '已认证', order: 4 },
    ],
    versions: [
      { version: 'V1.0', modifyTime: '2026-05-01 14:00', modifyInstitution: '社区服务中心', modifyReason: '初步报告', modifier: '孙医生' },
      { version: 'V1.1', modifyTime: '2026-05-01 15:00', modifyInstitution: '区人民医院', modifyReason: '影像补充', modifier: '陈主任' },
      { version: 'V1.2', modifyTime: '2026-05-01 16:00', modifyInstitution: '医学院附属医院', modifyReason: '专家会诊意见', modifier: '刘教授' },
      { version: 'V1.3', modifyTime: '2026-05-01 17:00', modifyInstitution: '市中心医院', modifyReason: '最终审核', modifier: '周主任' },
    ],
  },
  {
    id: 'CS004',
    reportId: 'COS20260501004',
    examType: '乳腺钼靶',
    patientName: '周丽',
    gender: '女',
    age: 38,
    participatingInstitutions: ['妇幼保健院', '市中心医院'],
    status: '已完成',
    createTime: '2026-05-02 10:00',
    completeTime: '2026-05-02 12:00',
    signatures: [
      { institution: '妇幼保健院', doctorName: '黄医生', signTime: '2026-05-02 10:00', certificateStatus: '已认证', order: 1 },
      { institution: '市中心医院', doctorName: '吴主任', signTime: '2026-05-02 12:00', certificateStatus: '已认证', order: 2 },
    ],
    versions: [
      { version: 'V1.0', modifyTime: '2026-05-02 10:00', modifyInstitution: '妇幼保健院', modifyReason: '初步报告', modifier: '黄医生' },
      { version: 'V1.1', modifyTime: '2026-05-02 12:00', modifyInstitution: '市中心医院', modifyReason: '专家复核', modifier: '吴主任' },
    ],
  },
  {
    id: 'CS005',
    reportId: 'COS20260501005',
    examType: '骨盆MRI',
    patientName: '刘德华',
    gender: '男',
    age: 67,
    participatingInstitutions: ['社区服务中心', '区人民医院', '医学院附属医院'],
    status: '待签发',
    createTime: '2026-05-02 14:00',
    signatures: [
      { institution: '社区服务中心', doctorName: '赵医生', signTime: '2026-05-02 14:00', certificateStatus: '已认证', order: 1 },
    ],
    versions: [
      { version: 'V1.0', modifyTime: '2026-05-02 14:00', modifyInstitution: '社区服务中心', modifyReason: '初步报告', modifier: '赵医生' },
    ],
  },
]

// 新增模拟数据: 报告分享
const mockShareRecords: ShareRecord[] = [
  { id: 'SH001', reportId: 'REP20260501001', patientName: '张三', institution: '区人民医院', targetInstitution: '市中心医院', sharedDate: '2026-05-02 10:00', sharedBy: '王医生', status: 'active', consent: true, accessCount: 3 },
  { id: 'SH002', reportId: 'REP20260501002', patientName: '李四', institution: '妇幼保健院', targetInstitution: '医学院附属医院', sharedDate: '2026-05-01 14:00', sharedBy: '赵医生', status: 'active', consent: true, accessCount: 1 },
  { id: 'SH003', reportId: 'REP20260501003', patientName: '周五', institution: '社区服务中心', targetInstitution: '市中心医院', sharedDate: '2026-04-30 09:00', sharedBy: '孙医生', status: 'revoked', consent: true, accessCount: 5 },
  { id: 'SH004', reportId: 'REP20260501005', patientName: '孙九', institution: '医学院附属医院', targetInstitution: '区人民医院', sharedDate: '2026-05-03 08:00', sharedBy: '周医生', status: 'active', consent: false, accessCount: 0 },
]

// 新增: SLA数据
const mockSLAData: SLARecord[] = [
  { siteName: '市中心医院', assignedExams: 45, completedExams: 42, avgTAT: '2.5h', slaTarget: '4h', slaCompliance: 93 },
  { siteName: '医学院附属医院', assignedExams: 38, completedExams: 36, avgTAT: '3.0h', slaTarget: '4h', slaCompliance: 95 },
  { siteName: '区人民医院', assignedExams: 28, completedExams: 25, avgTAT: '3.5h', slaTarget: '6h', slaCompliance: 89 },
  { siteName: '妇幼保健院', assignedExams: 15, completedExams: 14, avgTAT: '2.0h', slaTarget: '4h', slaCompliance: 93 },
  { siteName: '社区服务中心', assignedExams: 10, completedExams: 9, avgTAT: '4.0h', slaTarget: '8h', slaCompliance: 90 },
]

// ============ 辅助函数 ============
// 获取状态颜色
const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    '待接诊': COLORS.pending,
    '会诊中': COLORS.inProgress,
    '已完成': COLORS.completed,
    '已取消': COLORS.textMuted,
    '待审核': COLORS.pending,
    '已通过': COLORS.completed,
    '有问题': COLORS.warning,
    '已驳回': COLORS.danger,
    '待确认': COLORS.pending,
    '已接收': COLORS.inProgress,
    '处理中': COLORS.inProgress,
    '已闭环': COLORS.completed,
    '待书写': COLORS.pending,
    '书写中': COLORS.inProgress,
    '待签发': COLORS.pending,
    '签发中': COLORS.inProgress,
  }
  return colorMap[status] || COLORS.textMuted
}

// 获取严重程度颜色
const getSeverityColor = (severity: string): string => {
  const colorMap: Record<string, string> = {
    '危急': COLORS.danger,
    '高危': COLORS.warning,
    '紧急': COLORS.pending,
  }
  return colorMap[severity] || COLORS.textMuted
}

// 获取机构图标
const getInstitutionIcon = (iconType: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'hospital': <Building size={16} style={{ color: COLORS.primary }} />,
    'building': <Building2 size={16} style={{ color: COLORS.secondary }} />,
    'clinic': <Building2 size={16} style={{ color: COLORS.success }} />,
  }
  return iconMap[iconType] || <Building2 size={16} />
}

// 格式化日期时间
const formatDateTime = (dateTimeStr: string): string => {
  return dateTimeStr
}

// ============ 组件定义 ============
// ============ 新增: 跨机构报告分享组件 ============
const ReportSharingSection: React.FC = () => {
  const [shares, setShares] = useState(mockShareRecords)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareForm, setShareForm] = useState({ reportId: '', targetInstitution: '', consent: true })

  const handleRevoke = (id: string) => { setShares(shares.map(s => s.id === id ? { ...s, status: 'revoked' as const } : s)) }
  const handleShare = () => {
    setShares([...shares, { id: `SH${Date.now()}`, reportId: shareForm.reportId, patientName: '新建患者', institution: '本院', targetInstitution: shareForm.targetInstitution, sharedDate: new Date().toISOString().split('T')[0], sharedBy: '当前用户', status: 'active', consent: shareForm.consent, accessCount: 0 }])
    setShowShareModal(false); setShareForm({ reportId: '', targetInstitution: '', consent: true })
  }

  return (
    <div style={{ ...styles.middlePanel, display: 'flex', flexDirection: 'column' }}>
      <div style={styles.panelHeader}><span>跨机构报告分享</span><button style={{ ...styles.button, ...styles.buttonPrimary }} onClick={() => setShowShareModal(true)}><Share2 size={14} /> 分享报告</button></div>
      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>报告编号</th><th style={styles.th}>患者</th><th style={styles.th}>来源机构</th><th style={styles.th}>目标机构</th><th style={styles.th}>分享时间</th><th style={styles.th}>分享人</th><th style={styles.th}>知情同意</th><th style={styles.th}>访问次数</th><th style={styles.th}>状态</th><th style={styles.th}>操作</th></tr></thead>
          <tbody>{shares.map(s => (
            <tr key={s.id}>
              <td style={styles.td}>{s.reportId}</td><td style={styles.td}>{s.patientName}</td><td style={styles.td}>{s.institution}</td><td style={styles.td}>{s.targetInstitution}</td><td style={styles.td}>{s.sharedDate}</td><td style={styles.td}>{s.sharedBy}</td>
              <td style={styles.td}>{s.consent ? <span style={{ color: COLORS.success }}>✓ 已获取</span> : <span style={{ color: COLORS.warning }}>⏳ 待获取</span>}</td>
              <td style={styles.td}>{s.accessCount}</td>
              <td style={styles.td}><span style={{ ...styles.statusTag, backgroundColor: s.status === 'active' ? COLORS.successLight : '#f3f4f6', color: s.status === 'active' ? COLORS.success : COLORS.textMuted }}>{s.status === 'active' ? '有效' : '已撤销'}</span></td>
              <td style={styles.td}>{s.status === 'active' && <button style={{ ...styles.button, padding: '4px 10px', fontSize: '12px', backgroundColor: COLORS.danger, color: 'white' }} onClick={() => handleRevoke(s.id)}><UserX size={12} /> 撤销</button>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div style={{ borderTop: '1px solid #e5e7eb', padding: '12px', background: '#f9fafb' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: COLORS.textMuted, marginBottom: '8px' }}>分享审计日志</div>
        <div style={{ fontSize: '12px', color: COLORS.textMuted }}>报告分享操作已记录至审计系统，所有访问行为可追溯。</div>
      </div>
      {showShareModal && (
        <div style={styles.modal} onClick={() => setShowShareModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}><span>分享报告</span><X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowShareModal(false)} /></div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}><label style={styles.formLabel}>报告编号</label><input style={{ ...styles.input, width: '100%' }} value={shareForm.reportId} onChange={e => setShareForm({ ...shareForm, reportId: e.target.value })} placeholder="输入报告编号" /></div>
              <div style={styles.formGroup}><label style={styles.formLabel}>目标机构</label><select style={{ ...styles.input, width: '100%' }} value={shareForm.targetInstitution} onChange={e => setShareForm({ ...shareForm, targetInstitution: e.target.value })}><option value="">请选择</option>{mockInstitutions.map(i => <option key={i.id} value={i.name}>{i.name}</option>)}</select></div>
              <div style={styles.formGroup}><label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" checked={shareForm.consent} onChange={e => setShareForm({ ...shareForm, consent: e.target.checked })} /> <span style={{ fontSize: 13 }}>已获得患者知情同意</span></label></div>
            </div>
            <div style={styles.modalFooter}><button style={{ ...styles.button, ...styles.buttonOutline }} onClick={() => setShowShareModal(false)}>取消</button><button style={{ ...styles.button, ...styles.buttonPrimary }} onClick={handleShare}><Share2 size={14} /> 分享</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============ 新增: 远程阅读SLA监控 ============
const SLAAndTATSection: React.FC = () => {
  const [slaData] = useState(mockSLAData)
  return (
    <div style={{ ...styles.middlePanel, display: 'flex', flexDirection: 'column' }}>
      <div style={styles.panelHeader}><span>远程阅读SLA监控</span><button style={{ ...styles.button, ...styles.buttonOutline, padding: '4px 10px', fontSize: '12px' }}><RefreshCw size={12} /> 刷新</button></div>
      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '6px', textAlign: 'center' }}><div style={{ fontSize: '20px', fontWeight: 700, color: COLORS.primary }}>136</div><div style={{ fontSize: '11px', color: COLORS.textMuted }}>本月分配检查</div></div>
          <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '6px', textAlign: 'center' }}><div style={{ fontSize: '20px', fontWeight: 700, color: COLORS.success }}>126</div><div style={{ fontSize: '11px', color: COLORS.textMuted }}>已完成</div></div>
          <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '6px', textAlign: 'center' }}><div style={{ fontSize: '20px', fontWeight: 700, color: COLORS.warning }}>3.0h</div><div style={{ fontSize: '11px', color: COLORS.textMuted }}>平均周转时间</div></div>
          <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '6px', textAlign: 'center' }}><div style={{ fontSize: '20px', fontWeight: 700, color: COLORS.success }}>92%</div><div style={{ fontSize: '11px', color: COLORS.textMuted }}>SLA达标率</div></div>
        </div>
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>远程站点</th><th style={styles.th}>分配检查</th><th style={styles.th}>已完成</th><th style={styles.th}>平均TAT</th><th style={styles.th}>SLA目标</th><th style={styles.th}>SLA合规率</th><th style={styles.th}>状态</th></tr></thead>
          <tbody>{slaData.map((s, idx) => (
            <tr key={idx}>
              <td style={styles.td}><div style={{ fontWeight: 500 }}>{s.siteName}</div></td>
              <td style={styles.td}>{s.assignedExams}</td>
              <td style={styles.td}>{s.completedExams}</td>
              <td style={styles.td}>{s.avgTAT}</td>
              <td style={styles.td}>{s.slaTarget}</td>
              <td style={styles.td}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ ...styles.progressBar, width: '60px' }}><div style={{ ...styles.progressFill, width: `${s.slaCompliance}%`, backgroundColor: s.slaCompliance >= 90 ? COLORS.success : s.slaCompliance >= 80 ? COLORS.warning : COLORS.danger }} /></div><span style={{ fontSize: '12px', fontWeight: 600 }}>{s.slaCompliance}%</span></div></td>
              <td style={styles.td}><span style={{ ...styles.statusTag, backgroundColor: s.slaCompliance >= 90 ? COLORS.successLight : s.slaCompliance >= 80 ? COLORS.warningLight : COLORS.dangerLight, color: s.slaCompliance >= 90 ? COLORS.success : s.slaCompliance >= 80 ? COLORS.warning : COLORS.danger }}>{s.slaCompliance >= 90 ? '达标' : s.slaCompliance >= 80 ? '临界' : '未达标'}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}

// ============ 新增: 区域统计看板 ============
const RegionalStatsDashboard: React.FC = () => {
  return (
    <div style={{ ...styles.middlePanel, display: 'flex', flexDirection: 'column' }}>
      <div style={styles.panelHeader}><span>区域统计分析</span></div>
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '8px', textAlign: 'center', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#3b82f6' }}>3,713</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>区域总检查量</div>
            <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px' }}><TrendingUp size={11} /> +8.2% 较上月</div>
          </div>
          <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '8px', textAlign: 'center', borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#10b981' }}>18min</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>平均报告周转时间</div>
            <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}><TrendingDown size={11} /> -5% 较上月</div>
          </div>
          <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', textAlign: 'center', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#f59e0b' }}>96.8%</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>区域平均质量评分</div>
            <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px' }}><TrendingUp size={11} /> +0.3% 较上月</div>
          </div>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>各机构检查量对比</div>
          {mockInstitutions.map(inst => { const maxVal = Math.max(...mockInstitutions.map(i => i.reportCount)); const pct = (inst.reportCount / maxVal) * 100; return (
            <div key={inst.id} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}><span>{inst.name}</span><span style={{ fontWeight: 600 }}>{inst.reportCount}</span></div>
              <div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${pct}%`, backgroundColor: COLORS.primary }} /></div>
            </div>
          )})}
        </div>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>各机构平均周转时间</div>
          {mockInstitutions.map(inst => { const tat = Math.floor(Math.random() * 40) + 15; return (
            <div key={inst.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '13px' }}>{inst.name}</span>
              <span style={{ fontWeight: 600, color: tat <= 30 ? COLORS.success : tat <= 45 ? COLORS.warning : COLORS.danger }}>{tat}min</span>
            </div>
          )})}
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>区域质量监控指标</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '6px' }}><div style={{ fontSize: '11px', color: COLORS.textMuted }}>报告完整率</div><div style={{ fontSize: '18px', fontWeight: 600, color: COLORS.success }}>98.2%</div></div>
            <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '6px' }}><div style={{ fontSize: '11px', color: COLORS.textMuted }}>诊断符合率</div><div style={{ fontSize: '18px', fontWeight: 600, color: COLORS.success }}>96.5%</div></div>
            <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '6px' }}><div style={{ fontSize: '11px', color: COLORS.textMuted }}>危急值闭环率</div><div style={{ fontSize: '18px', fontWeight: 600, color: COLORS.success }}>98%</div></div>
            <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '6px' }}><div style={{ fontSize: '11px', color: COLORS.textMuted }}>会诊响应时效</div><div style={{ fontSize: '18px', fontWeight: 600, color: COLORS.warning }}>18min</div></div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * RegionalReportPage - 区域影像报告管理页面
 * 功能：远程会诊、区域报告审核、危急值通报、医联体远程诊断、跨机构联合签发、区域数据统计
 * 新增：跨机构报告分享、远程阅读SLA监控、区域统计看板
 */
const RegionalReportPage: React.FC = () => {
  // ============ 状态定义 ============
  // 当前激活的主Tab
  const [activeMainTab, setActiveMainTab] = useState<'consultation' | 'report' | 'critical' | 'remote' | 'cosign' | 'sharing' | 'sla' | 'regionalStats'>('consultation')
  // 当前选中的机构
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all')
  // 搜索关键词
  const [searchKeyword, setSearchKeyword] = useState('')
  // 会诊Tab子页签
  const [consultationTab, setConsultationTab] = useState<'list' | 'apply' | 'detail'>('list')
  // 选中的会诊记录
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  // 报告Tab子页签
  const [reportTab, setReportTab] = useState<'list' | 'detail'>('list')
  // 选中的报告
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  // 医联体远程诊断子页签
  const [remoteTab, setRemoteTab] = useState<'list' | 'writing'>('list')
  // 选中的远程诊断记录
  const [selectedRemoteDiagnosis, setSelectedRemoteDiagnosis] = useState<RemoteDiagnosis | null>(null)
  // 远程书写报告内容
  const [remoteReportContent, setRemoteReportContent] = useState('')
  // 联合签发子页签
  const [cosignTab, setCosignTab] = useState<'list' | 'detail'>('list')
  // 选中的联合签发记录
  const [selectedCoSign, setSelectedCoSign] = useState<CoSignRecord | null>(null)
  // 模态框状态
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  // 成功提示Toast状态
  const [toastSuccess, setToastSuccess] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  // 系统设置弹窗状态
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  // 会诊申请表单
  const [consultationForm, setConsultationForm] = useState({
    patientName: '',
    gender: '男',
    age: '',
    modality: 'CT',
    examItem: '',
    applyReason: '',
    priority: '普通',
    institution: '',
  })
  // 会诊意见表单
  const [opinionText, setOpinionText] = useState('')
  // 审核意见表单
  const [reviewText, setReviewText] = useState('')
  // 统计数据
  const [stats, setStats] = useState({
    totalReports: 3713,
    pendingConsultations: 23,
    criticalValues: 5,
    avgResponseTime: '18分钟',
  })

  // ============ 统计数据计算 ============
  // 根据筛选的机构计算统计数据
  const getFilteredStats = () => {
    if (selectedInstitution === 'all') {
      return {
        totalReports: 3713,
        pendingConsultations: mockConsultations.filter(c => c.status === '待接诊').length,
        criticalValues: mockCriticalValues.filter(cv => cv.status !== '已闭环').length,
        avgResponseTime: '18分钟',
      }
    }
    const inst = mockInstitutions.find(i => i.id === selectedInstitution)
    return {
      totalReports: inst?.reportCount || 0,
      pendingConsultations: mockConsultations.filter(c => c.institution === inst?.name && c.status === '待接诊').length,
      criticalValues: mockCriticalValues.filter(cv => cv.institution === inst?.name && cv.status !== '已闭环').length,
      avgResponseTime: '15分钟',
    }
  }

  // ============ 筛选数据 ============
  // 筛选会诊记录
  const getFilteredConsultations = () => {
    return mockConsultations.filter(c => {
      const matchInstitution = selectedInstitution === 'all' || c.institution === mockInstitutions.find(i => i.id === selectedInstitution)?.name
      const matchSearch = searchKeyword === '' ||
        c.patientName.includes(searchKeyword) ||
        c.caseId.includes(searchKeyword) ||
        c.examItem.includes(searchKeyword)
      return matchInstitution && matchSearch
    })
  }

  // 筛选报告
  const getFilteredReports = () => {
    return mockReports.filter(r => {
      const matchInstitution = selectedInstitution === 'all' || r.institution === mockInstitutions.find(i => i.id === selectedInstitution)?.name
      const matchSearch = searchKeyword === '' ||
        r.patientName.includes(searchKeyword) ||
        r.reportId.includes(searchKeyword) ||
        r.examItem.includes(searchKeyword)
      return matchInstitution && matchSearch
    })
  }

  // 筛选危急值
  const getFilteredCriticalValues = () => {
    return mockCriticalValues.filter(cv => {
      const matchInstitution = selectedInstitution === 'all' || cv.institution === mockInstitutions.find(i => i.id === selectedInstitution)?.name
      const matchSearch = searchKeyword === '' ||
        cv.patientName.includes(searchKeyword) ||
        cv.criticalFinding.includes(searchKeyword)
      return matchInstitution && matchSearch
    })
  }

  // 筛选远程诊断记录
  const getFilteredRemoteDiagnoses = () => {
    return mockRemoteDiagnoses.filter(rd => {
      const matchInstitution = selectedInstitution === 'all' || rd.applyInstitution === mockInstitutions.find(i => i.id === selectedInstitution)?.name
      const matchSearch = searchKeyword === '' ||
        rd.patientName.includes(searchKeyword) ||
        rd.caseId.includes(searchKeyword) ||
        rd.examType.includes(searchKeyword)
      return matchInstitution && matchSearch
    })
  }

  // 筛选联合签发记录
  const getFilteredCoSignRecords = () => {
    return mockCoSignRecords.filter(cs => {
      const matchInstitution = selectedInstitution === 'all' || cs.participatingInstitutions.includes(mockInstitutions.find(i => i.id === selectedInstitution)?.name || '')
      const matchSearch = searchKeyword === '' ||
        cs.patientName.includes(searchKeyword) ||
        cs.reportId.includes(searchKeyword) ||
        cs.examType.includes(searchKeyword)
      return matchInstitution && matchSearch
    })
  }

  // ============ 事件处理 ============
  // 选择机构
  const handleSelectInstitution = (id: string) => {
    setSelectedInstitution(id)
  }

  // 选择会诊记录
  const handleSelectConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation)
    setConsultationTab('detail')
  }

  // 选择报告
  const handleSelectReport = (report: Report) => {
    setSelectedReport(report)
    setReportTab('detail')
  }

  // 选择远程诊断记录
  const handleSelectRemoteDiagnosis = (rd: RemoteDiagnosis) => {
    setSelectedRemoteDiagnosis(rd)
    setRemoteReportContent(rd.reportContent || '')
    setRemoteTab('writing')
  }

  // 选择联合签发记录
  const handleSelectCoSign = (cs: CoSignRecord) => {
    setSelectedCoSign(cs)
    setCosignTab('detail')
  }

  // 发起会诊申请
  const handleApplyConsultation = () => {
    setModalType('apply')
    setShowModal(true)
  }

  // 提交会诊申请
  const handleSubmitConsultation = () => {
    console.log('提交会诊申请:', consultationForm)
    setShowModal(false)
    setConsultationForm({
      patientName: '',
      gender: '男',
      age: '',
      modality: 'CT',
      examItem: '',
      applyReason: '',
      priority: '普通',
      institution: '',
    })
  }

  // 接受会诊
  const handleAcceptConsultation = (consultation: Consultation) => {
    console.log('接受会诊:', consultation.id)
  }

  // 提交会诊意见
  const handleSubmitOpinion = () => {
    console.log('提交会诊意见:', opinionText)
    setShowModal(false)
    setOpinionText('')
  }

  // 审核报告
  const handleReviewReport = (report: Report, result: '通过' | '驳回') => {
    console.log('审核报告:', report.id, result, reviewText)
    setShowModal(false)
    setReviewText('')
  }

  // 确认危急值
  const handleConfirmCritical = (cv: CriticalValueReport) => {
    console.log('确认危急值:', cv.id)
  }

  // 提交远程报告
  const handleSubmitRemoteReport = () => {
    console.log('提交远程报告:', selectedRemoteDiagnosis?.id, remoteReportContent)
    // 显示成功Toast
    setToastMessage('报告提交成功！')
    setToastSuccess(true)
    setTimeout(() => setToastSuccess(false), 3000)
    setRemoteTab('list')
    setSelectedRemoteDiagnosis(null)
    setRemoteReportContent('')
  }

  // ============ 渲染统计卡片 ============
  const renderStatCards = () => {
    const filteredStats = getFilteredStats()
    const statItems: StatData[] = [
      { label: '报告总数', value: filteredStats.totalReports, change: 12, changeType: 'up', icon: <FileText size={18} />, color: COLORS.primary },
      { label: '待接诊会诊', value: filteredStats.pendingConsultations, change: -3, changeType: 'down', icon: <Video size={18} />, color: COLORS.warning },
      { label: '危急值待处理', value: filteredStats.criticalValues, change: 2, changeType: 'up', icon: <ShieldAlert size={18} />, color: COLORS.danger },
      { label: '平均响应时间', value: filteredStats.avgResponseTime, change: -5, changeType: 'down', icon: <Clock size={18} />, color: COLORS.success },
    ]

    return (
      <div style={styles.statsContainer}>
        {statItems.map((stat, index) => (
          <div key={index} style={styles.statCard}>
            <div style={{ ...styles.statLabel, color: stat.color }}>
              {stat.icon}
              <span>{stat.label}</span>
            </div>
            <div style={{ ...styles.statValue, color: stat.color }}>{stat.value}</div>
            {stat.change !== undefined && (
              <div style={{ ...styles.statChange, color: stat.changeType === 'up' ? COLORS.danger : COLORS.success }}>
                {stat.changeType === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                <span>{Math.abs(stat.change)}% 较上月</span>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  // ============ 渲染机构列表 ============
  const renderInstitutionList = () => {
    return (
      <div style={styles.leftPanel}>
        <div style={styles.panelHeader}>
          <span>医疗机构</span>
          <span style={{ fontSize: '12px', fontWeight: 400, color: COLORS.textMuted }}>{mockInstitutions.length}家</span>
        </div>
        <div style={{ padding: '8px' }}>
          {/* 全部机构 */}
          <div
            style={{
              ...styles.listItem,
              ...(selectedInstitution === 'all' ? styles.listItemActive : {}),
            }}
            onClick={() => handleSelectInstitution('all')}
            onMouseEnter={(e) => {
              if (selectedInstitution !== 'all') e.currentTarget.style.backgroundColor = '#f3f4f6'
            }}
            onMouseLeave={(e) => {
              if (selectedInstitution !== 'all') e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Building size={16} style={{ color: COLORS.primary }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: '13px' }}>全部机构</div>
              <div style={{ fontSize: '11px', color: COLORS.textMuted }}>区域所有医院</div>
            </div>
            <span style={{ ...styles.badge, backgroundColor: '#eff6ff', color: COLORS.primary }}>
              {mockInstitutions.reduce((sum, i) => sum + i.reportCount, 0)}
            </span>
          </div>
          {/* 机构列表 */}
          {mockInstitutions.map((inst) => (
            <div
              key={inst.id}
              style={{
                ...styles.listItem,
                ...(selectedInstitution === inst.id ? styles.listItemActive : {}),
              }}
              onClick={() => handleSelectInstitution(inst.id)}
              onMouseEnter={(e) => {
                if (selectedInstitution !== inst.id) e.currentTarget.style.backgroundColor = '#f3f4f6'
              }}
              onMouseLeave={(e) => {
                if (selectedInstitution !== inst.id) e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {getInstitutionIcon(inst.icon)}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: '13px' }}>{inst.name}</div>
                <div style={{ fontSize: '11px', color: COLORS.textMuted }}>
                  {inst.level} {inst.type}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ ...styles.badge, backgroundColor: '#f3f4f6', color: COLORS.textMuted }}>
                  {inst.reportCount}
                </span>
                {inst.pendingCount > 0 && (
                  <div style={{ fontSize: '10px', color: COLORS.warning, marginTop: '2px' }}>
                    待审 {inst.pendingCount}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* 快捷筛选 */}
        <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: COLORS.textMuted }}>快速筛选</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {['全部', '三级医院', '二级医院', '一级医院', '待审核'].map((filter) => (
              <span
                key={filter}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  backgroundColor: filter === '全部' ? COLORS.primary : '#f3f4f6',
                  color: filter === '全部' ? 'white' : COLORS.textMuted,
                }}
              >
                {filter}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ============ 渲染会诊列表 ============
  const renderConsultationList = () => {
    const consultations = getFilteredConsultations()
    return (
      <div style={{ ...styles.middlePanel, display: 'flex', flexDirection: 'column' }}>
        <div style={styles.panelHeader}>
          <span>远程会诊</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{ ...styles.button, ...styles.buttonPrimary }}
              onClick={handleApplyConsultation}
            >
              <Plus size={14} />
              发起会诊
            </button>
          </div>
        </div>
        {/* Tab页签 */}
        <div style={styles.tabContainer}>
          {[
            { key: 'list', label: '会诊记录', icon: <ClipboardList size={14} /> },
            { key: 'apply', label: '发起申请', icon: <Plus size={14} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              style={{
                ...styles.tab,
                ...(consultationTab === tab.key ? styles.tabActive : {}),
              }}
              onClick={() => setConsultationTab(tab.key as 'list' | 'apply')}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        {/* 搜索框 */}
        <div style={styles.searchBox}>
          <Search size={16} style={{ color: COLORS.textMuted }} />
          <input
            type="text"
            placeholder="搜索患者姓名、病例号、检查项目..."
            style={{ ...styles.input, flex: 1, border: 'none', backgroundColor: 'transparent' }}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          {searchKeyword && (
            <X
              size={14}
              style={{ cursor: 'pointer', color: COLORS.textMuted }}
              onClick={() => setSearchKeyword('')}
            />
          )}
        </div>
        {/* 会诊记录列表 */}
        {consultationTab === 'list' && (
          <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
            {consultations.length === 0 ? (
              <div style={styles.emptyState}>
                <FileText size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
                <div>暂无会诊记录</div>
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>病例号</th>
                    <th style={styles.th}>患者信息</th>
                    <th style={styles.th}>检查信息</th>
                    <th style={styles.th}>申请机构</th>
                    <th style={styles.th}>状态</th>
                    <th style={styles.th}>申请时间</th>
                    <th style={styles.th}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {consultations.map((c) => (
                    <tr
                      key={c.id}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedConsultation?.id === c.id ? '#eff6ff' : 'transparent',
                      }}
                      onClick={() => handleSelectConsultation(c)}
                    >
                      <td style={styles.td}>
                        <div style={{ fontWeight: 500 }}>{c.caseId}</div>
                        <div style={{ fontSize: '11px', color: COLORS.textMuted }}>
                          优先级: {c.priority === '立即' ? '🔥' : c.priority === '紧急' ? '⚠️' : ''}{c.priority}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div>{c.patientName}</div>
                        <div style={{ fontSize: '11px', color: COLORS.textMuted }}>{c.gender} {c.age}岁</div>
                      </td>
                      <td style={styles.td}>
                        <div>{c.modality} - {c.examItem}</div>
                      </td>
                      <td style={styles.td}>{c.institution}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusTag,
                            backgroundColor: `${getStatusColor(c.status)}20`,
                            color: getStatusColor(c.status),
                          }}
                        >
                          <Circle size={6} fill={getStatusColor(c.status)} />
                          {c.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontSize: '12px' }}>{c.applyTime}</div>
                      </td>
                      <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                        {c.status === '待接诊' && (
                          <button
                            style={{ ...styles.button, padding: '4px 10px', fontSize: '12px', backgroundColor: COLORS.primary, color: 'white' }}
                            onClick={() => handleAcceptConsultation(c)}
                          >
                            接诊
                          </button>
                        )}
                        {c.status === '会诊中' && (
                          <button
                            style={{ ...styles.button, padding: '4px 10px', fontSize: '12px', backgroundColor: COLORS.success, color: 'white' }}
                            onClick={() => {
                              setSelectedConsultation(c)
                              setConsultationTab('detail')
                            }}
                          >
                            填写意见
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {/* 发起申请表单 */}
        {consultationTab === 'apply' && (
          <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
            <div style={{ maxWidth: '600px' }}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>患者姓名 *</label>
                <input
                  type="text"
                  style={{ ...styles.input, width: '100%' }}
                  placeholder="请输入患者姓名"
                  value={consultationForm.patientName}
                  onChange={(e) => setConsultationForm({ ...consultationForm, patientName: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>性别</label>
                  <select
                    style={{ ...styles.input, width: '100%' }}
                    value={consultationForm.gender}
                    onChange={(e) => setConsultationForm({ ...consultationForm, gender: e.target.value })}
                  >
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>年龄</label>
                  <input
                    type="number"
                    style={{ ...styles.input, width: '100%' }}
                    placeholder="年龄"
                    value={consultationForm.age}
                    onChange={(e) => setConsultationForm({ ...consultationForm, age: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>设备类型</label>
                  <select
                    style={{ ...styles.input, width: '100%' }}
                    value={consultationForm.modality}
                    onChange={(e) => setConsultationForm({ ...consultationForm, modality: e.target.value })}
                  >
                    <option value="CT">CT</option>
                    <option value="MRI">MRI</option>
                    <option value="DR">DR</option>
                    <option value="超声">超声</option>
                    <option value="胃肠">胃肠</option>
                  </select>
                </div>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>检查项目</label>
                  <input
                    type="text"
                    style={{ ...styles.input, width: '100%' }}
                    placeholder="检查项目"
                    value={consultationForm.examItem}
                    onChange={(e) => setConsultationForm({ ...consultationForm, examItem: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.formLabel}>申请机构</label>
                <select
                  style={{ ...styles.input, width: '100%' }}
                  value={consultationForm.institution}
                  onChange={(e) => setConsultationForm({ ...consultationForm, institution: e.target.value })}
                >
                  <option value="">请选择申请机构</option>
                  {mockInstitutions.map((inst) => (
                    <option key={inst.id} value={inst.name}>{inst.name}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>优先级</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['普通', '紧急', '立即'].map((p) => (
                    <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="priority"
                        value={p}
                        checked={consultationForm.priority === p}
                        onChange={(e) => setConsultationForm({ ...consultationForm, priority: e.target.value })}
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>申请理由 *</label>
                <textarea
                  style={{ ...styles.textarea, width: '100%', minHeight: '120px' }}
                  placeholder="请详细描述会诊目的和临床信息..."
                  value={consultationForm.applyReason}
                  onChange={(e) => setConsultationForm({ ...consultationForm, applyReason: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  style={{ ...styles.button, ...styles.buttonOutline }}
                  onClick={() => setConsultationTab('list')}
                >
                  取消
                </button>
                <button
                  style={{ ...styles.button, ...styles.buttonPrimary }}
                  onClick={handleSubmitConsultation}
                >
                  <Send size={14} />
                  提交申请
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ============ 渲染会诊详情 ============
  const renderConsultationDetail = () => {
    if (!selectedConsultation) {
      return (
        <div style={{ ...styles.middlePanel, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={styles.emptyState}>
            <Video size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <div>请选择一个会诊记录查看详情</div>
          </div>
        </div>
      )
    }

    const c = selectedConsultation
    return (
      <div style={{ ...styles.middlePanel, display: 'flex', flexDirection: 'column' }}>
        <div style={styles.panelHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Video size={18} style={{ color: COLORS.primary }} />
            <span>会诊详情</span>
          </div>
          <button
            style={{ ...styles.button, ...styles.buttonGhost }}
            onClick={() => {
              setSelectedConsultation(null)
              setConsultationTab('list')
            }}
          >
            <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
            返回
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {/* 基本信息 */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '14px', color: COLORS.textMuted }}>基本信息</h4>
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>病例号</div>
                  <div style={{ fontWeight: 500 }}>{c.caseId}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>状态</div>
                  <span
                    style={{
                      ...styles.statusTag,
                      backgroundColor: `${getStatusColor(c.status)}20`,
                      color: getStatusColor(c.status),
                    }}
                  >
                    {c.status}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>患者姓名</div>
                  <div style={{ fontWeight: 500 }}>{c.patientName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>患者信息</div>
                  <div>{c.gender} / {c.age}岁</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>检查设备</div>
                  <div>{c.modality}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>检查项目</div>
                  <div>{c.examItem}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>申请机构</div>
                  <div>{c.institution}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>申请医生</div>
                  <div>{c.applyDoctor}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>申请时间</div>
                  <div>{c.applyTime}</div>
                </div>
                {c.acceptDoctor && (
                  <div>
                    <div style={{ fontSize: '12px', color: COLORS.textMuted }}>接诊医生</div>
                    <div>{c.acceptDoctor}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* 申请理由 */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '14px', color: COLORS.textMuted }}>会诊申请理由</h4>
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px' }}>
              {c.applyReason}
            </div>
          </div>
          {/* 会诊意见 */}
          {c.status === '已完成' && c.consultationOpinion && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '14px', color: COLORS.textMuted }}>会诊意见</h4>
              <div style={{ backgroundColor: '#f0fdf4', borderRadius: '8px', padding: '16px', border: `1px solid ${COLORS.success}` }}>
                {c.consultationOpinion}
              </div>
            </div>
          )}
          {/* 填写会诊意见 */}
          {c.status === '会诊中' && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '14px', color: COLORS.textMuted }}>填写会诊意见</h4>
              <textarea
                style={{ ...styles.textarea, width: '100%', minHeight: '150px' }}
                placeholder="请输入会诊意见..."
                value={opinionText}
                onChange={(e) => setOpinionText(e.target.value)}
              />
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  style={{ ...styles.button, ...styles.buttonPrimary }}
                  onClick={() => {
                    setModalType('opinion')
                    setShowModal(true)
                  }}
                >
                  <Check size={14} />
                  提交意见
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============ 渲染报告审核列表 ============
  const renderReportList = () => {
    const reports = getFilteredReports()
    return (
      <div style={{ ...styles.middlePanel, display: 'flex', flexDirection: 'column' }}>
        <div style={styles.panelHeader}>
          <span>区域报告审核</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{ ...styles.button, ...styles.buttonOutline }}
              onClick={() => {
                console.log('打开质控筛选')
                setModalType('quality-filter')
                setShowModal(true)
              }}
            >
              <Filter size={14} />
              质控筛选
            </button>
          </div>
        </div>
        {/* Tab页签 */}
        <div style={styles.tabContainer}>
          {[
            { key: 'list', label: '报告列表', icon: <FileText size={14} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              style={{
                ...styles.tab,
                ...(reportTab === tab.key ? styles.tabActive : {}),
              }}
              onClick={() => setReportTab(tab.key as 'list')}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        {/* 搜索框 */}
        <div style={styles.searchBox}>
          <Search size={16} style={{ color: COLORS.textMuted }} />
          <input
            type="text"
            placeholder="搜索报告号、患者姓名..."
            style={{ ...styles.input, flex: 1, border: 'none', backgroundColor: 'transparent' }}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
        {/* 报告列表 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>报告号</th>
                <th style={styles.th}>患者信息</th>
                <th style={styles.th}>检查信息</th>
                <th style={styles.th}>报告机构</th>
                <th style={styles.th}>质控评分</th>
                <th style={styles.th}>状态</th>
                <th style={styles.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr
                  key={r.id}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedReport?.id === r.id ? '#eff6ff' : 'transparent',
                  }}
                  onClick={() => handleSelectReport(r)}
                >
                  <td style={styles.td}>
                    <div style={{ fontWeight: 500 }}>{r.reportId}</div>
                    <div style={{ fontSize: '11px', color: COLORS.textMuted }}>{r.reportTime}</div>
                  </td>
                  <td style={styles.td}>
                    <div>{r.patientName}</div>
                    <div style={{ fontSize: '11px', color: COLORS.textMuted }}>{r.gender} {r.age}岁</div>
                  </td>
                  <td style={styles.td}>
                    <div>{r.modality} - {r.examItem}</div>
                  </td>
                  <td style={styles.td}>{r.institution}</td>
                  <td style={styles.td}>
                    {r.qualityScore > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ ...styles.progressBar, width: '60px' }}>
                          <div
                            style={{
                              ...styles.progressFill,
                              width: `${r.qualityScore}%`,
                              backgroundColor: r.qualityScore >= 90 ? COLORS.success : r.qualityScore >= 70 ? COLORS.warning : COLORS.danger,
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{r.qualityScore}</span>
                      </div>
                    ) : (
                      <span style={{ color: COLORS.textMuted }}>-</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusTag,
                        backgroundColor: `${getStatusColor(r.status)}20`,
                        color: getStatusColor(r.status),
                      }}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                    {r.status === '待审核' && (
                      <>
                        <button
                          style={{ ...styles.button, padding: '4px 10px', fontSize: '12px', backgroundColor: COLORS.success, color: 'white', marginRight: '6px' }}
                          onClick={() => {
                            setSelectedReport(r)
                            setModalType('review')
                            setShowModal(true)
                          }}
                        >
                          审核
                        </button>
                      </>
                    )}
                    <button
                      style={{ ...styles.button, padding: '4px 10px', fontSize: '12px', backgroundColor: COLORS.primary, color: 'white' }}
                      onClick={() => {
                        setSelectedReport(r)
                        setReportTab('detail')
                      }}
                    >
                      查看
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ============ 渲染报告详情 ============
  const renderReportDetail = () => {
    if (!selectedReport) {
      return (
        <div style={{ ...styles.middlePanel, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={styles.emptyState}>
            <FileText size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <div>请选择一个报告查看详情</div>
          </div>
        </div>
      )
    }

    const r = selectedReport
    return (
      <div style={{ ...styles.middlePanel, display: 'flex', flexDirection: 'column' }}>
        <div style={styles.panelHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} style={{ color: COLORS.primary }} />
            <span>报告详情</span>
          </div>
          <button
            style={{ ...styles.button, ...styles.buttonGhost }}
            onClick={() => {
              setSelectedReport(null)
              setReportTab('list')
            }}
          >
            <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
            返回
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {/* 基本信息 */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '14px', color: COLORS.textMuted }}>报告信息</h4>
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>报告号</div>
                  <div style={{ fontWeight: 500 }}>{r.reportId}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>状态</div>
                  <span
                    style={{
                      ...styles.statusTag,
                      backgroundColor: `${getStatusColor(r.status)}20`,
                      color: getStatusColor(r.status),
                    }}
                  >
                    {r.status}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>患者姓名</div>
                  <div style={{ fontWeight: 500 }}>{r.patientName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>患者信息</div>
                  <div>{r.gender} / {r.age}岁</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>检查设备</div>
                  <div>{r.modality}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>检查项目</div>
                  <div>{r.examItem}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>报告机构</div>
                  <div>{r.institution}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>报告医生</div>
                  <div>{r.reportDoctor}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>报告时间</div>
                  <div>{r.reportTime}</div>
                </div>
                {r.reviewDoctor && (
                  <div>
                    <div style={{ fontSize: '12px', color: COLORS.textMuted }}>审核医生</div>
                    <div>{r.reviewDoctor}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* 质控评分 */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '14px', color: COLORS.textMuted }}>质控评分</h4>
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px' }}>
              {r.qualityScore > 0 ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: r.qualityScore >= 90 ? COLORS.success : r.qualityScore >= 70 ? COLORS.warning : COLORS.danger }}>
                      {r.qualityScore}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ ...styles.progressBar, height: '12px' }}>
                        <div
                          style={{
                            ...styles.progressFill,
                            width: `${r.qualityScore}%`,
                            backgroundColor: r.qualityScore >= 90 ? COLORS.success : r.qualityScore >= 70 ? COLORS.warning : COLORS.danger,
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '11px', color: COLORS.textMuted, marginTop: '4px' }}>
                        格式规范 / 内容完整 / 诊断准确
                      </div>
                    </div>
                  </div>
                  {r.qualityIssues.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '12px', color: COLORS.danger, marginBottom: '6px' }}>发现问题：</div>
                      {r.qualityIssues.map((issue, idx) => (
                        <div key={idx} style={{ fontSize: '13px', color: COLORS.danger, marginLeft: '12px' }}>
                          • {issue}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: COLORS.textMuted }}>尚未进行质控评分</div>
              )}
            </div>
          </div>
          {/* 审核意见 */}
          {r.reviewOpinion && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '14px', color: COLORS.textMuted }}>审核意见</h4>
              <div style={{ backgroundColor: '#fef3c7', borderRadius: '8px', padding: '16px', border: `1px solid ${COLORS.warning}` }}>
                {r.reviewOpinion}
              </div>
            </div>
          )}
          {/* 审核操作 */}
          {r.status === '待审核' && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '14px', color: COLORS.textMuted }}>审核操作</h4>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  style={{ ...styles.button, ...styles.buttonPrimary }}
                  onClick={() => {
                    setModalType('review-pass')
                    setShowModal(true)
                  }}
                >
                  <CheckCircle size={14} />
                  通过
                </button>
                <button
                  style={{ ...styles.button, ...styles.buttonDanger }}
                  onClick={() => {
                    setModalType('review-reject')
                    setShowModal(true)
                  }}
                >
                  <XCircle size={14} />
                  驳回
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============ 渲染医联体远程诊断列表 ============
  const renderRemoteDiagnosisList = () => {
    const diagnoses = getFilteredRemoteDiagnoses()
    return (
      <div style={{ ...styles.middlePanel, display: 'flex', flexDirection: 'column' }}>
        <div style={styles.panelHeader}>
          <span>医联体远程诊断</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{ ...styles.button, ...styles.buttonOutline }}
              onClick={() => {
                console.log('同步远程诊断数据')
                setToastMessage('数据同步成功')
                setToastSuccess(true)
                setTimeout(() => setToastSuccess(false), 2000)
              }}
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
        {/* Tab页签 */}
        <div style={styles.tabContainer}>
          {[
            { key: 'list', label: '远程书写列表', icon: <Monitor size={14} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              style={{
                ...styles.tab,
                ...(remoteTab === tab.key ? styles.tabActive : {}),
              }}
              onClick={() => setRemoteTab(tab.key as 'list')}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        {/* 搜索框 */}
        <div style={styles.searchBox}>
          <Search size={16} style={{ color: COLORS.textMuted }} />
          <input
            type="text"
            placeholder="搜索患者姓名、病例号、检查类型..."
            style={{ ...styles.input, flex: 1, border: 'none', backgroundColor: 'transparent' }}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          {searchKeyword && (
            <X
              size={14}
              style={{ cursor: 'pointer', color: COLORS.textMuted }}
              onClick={() => setSearchKeyword('')}
            />
          )}
        </div>
        {/* 远程诊断列表 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>病例号</th>
                <th style={styles.th}>患者信息</th>
                <th style={styles.th}>检查类型</th>
                <th style={styles.th}>申请机构</th>
                <th style={styles.th}>远程专家</th>
                <th style={styles.th}>状态</th>
                <th style={styles.th}>申请时间</th>
                <th style={styles.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {diagnoses.map((rd) => (
                <tr
                  key={rd.id}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedRemoteDiagnosis?.id === rd.id ? '#eff6ff' : 'transparent',
                  }}
                  onClick={() => handleSelectRemoteDiagnosis(rd)}
                >
                  <td style={styles.td}>
                    <div style={{ fontWeight: 500 }}>{rd.caseId}</div>
                  </td>
                  <td style={styles.td}>
                    <div>{rd.patientName}</div>
                    <div style={{ fontSize: '11px', color: COLORS.textMuted }}>{rd.gender} {rd.age}岁</div>
                  </td>
                  <td style={styles.td}>{rd.examType}</td>
                  <td style={styles.td}>{rd.applyInstitution}</td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 500 }}>{rd.remoteExpert}</div>
                    <div style={{ fontSize: '11px', color: COLORS.textMuted }}>{rd.expertInstitution}</div>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusTag,
                        backgroundColor: `${getStatusColor(rd.status)}20`,
                        color: getStatusColor(rd.status),
                      }}
                    >
                      <Circle size={6} fill={getStatusColor(rd.status)} />
                      {rd.status}
                    </span>
                    {rd.isOtherTyping && (
                      <div style={{ fontSize: '10px', color: COLORS.inProgress, marginTop: '2px' }}>
                        📝 {rd.otherTypingName}正在输入...
                      </div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontSize: '12px' }}>{rd.applyTime}</div>
                  </td>
                  <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                    <button
                      style={{ ...styles.button, padding: '4px 10px', fontSize: '12px', backgroundColor: COLORS.primary, color: 'white' }}
                      onClick={() => handleSelectRemoteDiagnosis(rd)}
                    >
                      <PenTool size={12} />
                      书写
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ============ 渲染远程书写界面 ============
  const renderRemoteWriting = () => {
    if (!selectedRemoteDiagnosis) {
      return (
        <div style={{ ...styles.middlePanel, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={styles.emptyState}>
            <Monitor size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <div>请选择一个远程诊断记录</div>
          </div>
        </div>
      )
    }

    const rd = selectedRemoteDiagnosis
    return (
      <div style={{ ...styles.middlePanel, display: 'flex', flexDirection: 'column' }}>
        <div style={styles.panelHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Monitor size={18} style={{ color: COLORS.primary }} />
            <span>远程书写 - {rd.caseId}</span>
          </div>
          <button
            style={{ ...styles.button, ...styles.buttonGhost }}
            onClick={() => {
              setSelectedRemoteDiagnosis(null)
              setRemoteTab('list')
              setRemoteReportContent('')
            }}
          >
            <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
            返回
          </button>
        </div>
        {/* 实时状态提示 */}
        {rd.isOtherTyping && (
          <div style={{ padding: '8px 16px', backgroundColor: `${COLORS.inProgress}15`, borderBottom: `1px solid ${COLORS.inProgress}30`, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS.inProgress, animation: 'pulse 1s infinite' }} />
            <span style={{ fontSize: '12px', color: COLORS.inProgress }}>
              📝 {rd.otherTypingName} 正在输入报告...
            </span>
          </div>
        )}
        {/* 主体内容区 - 左侧影像 + 右侧报告面板 */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* 左侧：DICOM影像查看（模拟） */}
          <div style={{ flex: 1, backgroundColor: '#1a1a2e', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontSize: '12px' }}>DICOM影像查看器（模拟）</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ ...styles.button, padding: '4px 8px', fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                  缩放
                </button>
                <button style={{ ...styles.button, padding: '4px 8px', fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                  窗宽窗位
                </button>
                <button style={{ ...styles.button, padding: '4px 8px', fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                  测量
                </button>
              </div>
            </div>
            {/* 模拟影像区域 */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ width: '200px', height: '200px', borderRadius: '8px', background: 'linear-gradient(135deg, #2d2d44 0%, #1a1a2e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                  <Monitor size={48} style={{ marginBottom: '8px', opacity: 0.5 }} />
                  <div style={{ fontSize: '12px' }}>CT 胸部</div>
                  <div style={{ fontSize: '10px', marginTop: '4px' }}>影像加载区域</div>
                </div>
              </div>
              {/* 模拟定位线 */}
              <div style={{ position: 'absolute', top: '20px', left: '20px', color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>
                AXIAL | 5.0mm | W:400 L:40
              </div>
              <div style={{ position: 'absolute', bottom: '20px', right: '20px', color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>
                1/120
              </div>
            </div>
          </div>
          {/* 右侧：报告书写面板 */}
          <div style={{ width: '400px', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
            {/* 患者信息 */}
            <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>患者信息</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px' }}>
                <div>姓名：{rd.patientName}</div>
                <div>性别：{rd.gender}</div>
                <div>年龄：{rd.age}岁</div>
                <div>检查：{rd.examType}</div>
                <div style={{ gridColumn: '1/-1' }}>申请机构：{rd.applyInstitution}</div>
                <div style={{ gridColumn: '1/-1' }}>远程专家：{rd.remoteExpert}（{rd.expertInstitution}）</div>
              </div>
            </div>
            {/* 报告内容 */}
            <div style={{ flex: 1, padding: '12px', overflow: 'auto' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>报告内容</div>
              <textarea
                style={{
                  ...styles.textarea,
                  width: '100%',
                  minHeight: '200px',
                  fontSize: '13px',
                  lineHeight: '1.6',
                }}
                placeholder="请在此书写诊断报告..."
                value={remoteReportContent}
                onChange={(e) => setRemoteReportContent(e.target.value)}
              />
            </div>
            {/* 双向数字签名 */}
            <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>双向数字签名</div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1, padding: '8px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '10px', color: COLORS.textMuted, marginBottom: '4px' }}>申请医生签名</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={12} style={{ color: COLORS.success }} />
                    <span style={{ fontSize: '11px' }}>待签名</span>
                  </div>
                </div>
                <div style={{ flex: 1, padding: '8px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '10px', color: COLORS.textMuted, marginBottom: '4px' }}>审核专家签名</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={12} style={{ color: COLORS.pending }} />
                    <span style={{ fontSize: '11px' }}>待签名</span>
                  </div>
                </div>
              </div>
              <button
                style={{ ...styles.button, width: '100%', justifyContent: 'center', ...styles.buttonPrimary }}
                onClick={handleSubmitRemoteReport}
              >
                <PenTool size={14} />
                提交报告
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============ 渲染跨机构联合签发列表 ============
  const renderCoSignList = () => {
    const records = getFilteredCoSignRecords()
    return (
      <div style={{ ...styles.middlePanel, display: 'flex', flexDirection: 'column' }}>
        <div style={styles.panelHeader}>
          <span>跨机构报告联合签发</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{ ...styles.button, ...styles.buttonOutline }}
              onClick={() => {
                console.log('新增联合签发记录')
                setModalType('cosign-add')
                setShowModal(true)
              }}
            >
              <Plus size={14} />
              新增
            </button>
          </div>
        </div>
        {/* Tab页签 */}
        <div style={styles.tabContainer}>
          {[
            { key: 'list', label: '联合签发记录', icon: <FileSignature size={14} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              style={{
                ...styles.tab,
                ...(cosignTab === tab.key ? styles.tabActive : {}),
              }}
              onClick={() => setCosignTab(tab.key as 'list')}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        {/* 搜索框 */}
        <div style={styles.searchBox}>
          <Search size={16} style={{ color: COLORS.textMuted }} />
          <input
            type="text"
            placeholder="搜索报告编号、患者姓名..."
            style={{ ...styles.input, flex: 1, border: 'none', backgroundColor: 'transparent' }}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
        {/* 联合签发列表 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>报告编号</th>
                <th style={styles.th}>患者信息</th>
                <th style={styles.th}>检查类型</th>
                <th style={styles.th}>参与机构</th>
                <th style={styles.th}>签发状态</th>
                <th style={styles.th}>签发时间</th>
                <th style={styles.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {records.map((cs) => (
                <tr
                  key={cs.id}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedCoSign?.id === cs.id ? '#eff6ff' : 'transparent',
                  }}
                  onClick={() => handleSelectCoSign(cs)}
                >
                  <td style={styles.td}>
                    <div style={{ fontWeight: 500 }}>{cs.reportId}</div>
                  </td>
                  <td style={styles.td}>
                    <div>{cs.patientName}</div>
                    <div style={{ fontSize: '11px', color: COLORS.textMuted }}>{cs.gender} {cs.age}岁</div>
                  </td>
                  <td style={styles.td}>{cs.examType}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {cs.participatingInstitutions.map((inst, idx) => (
                        <span key={idx} style={{ ...styles.badge, backgroundColor: '#e0e7ff', color: COLORS.primary, fontSize: '10px' }}>
                          {inst}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusTag,
                        backgroundColor: `${getStatusColor(cs.status)}20`,
                        color: getStatusColor(cs.status),
                      }}
                    >
                      <Circle size={6} fill={getStatusColor(cs.status)} />
                      {cs.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontSize: '12px' }}>{cs.createTime}</div>
                    {cs.completeTime && (
                      <div style={{ fontSize: '11px', color: COLORS.textMuted }}>完成: {cs.completeTime}</div>
                    )}
                  </td>
                  <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                    <button
                      style={{ ...styles.button, padding: '4px 10px', fontSize: '12px', backgroundColor: COLORS.primary, color: 'white' }}
                      onClick={() => handleSelectCoSign(cs)}
                    >
                      <Eye size={12} />
                      查看
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ============ 渲染联合签发详情 ============
  const renderCoSignDetail = () => {
    if (!selectedCoSign) {
      return (
        <div style={{ ...styles.middlePanel, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={styles.emptyState}>
            <FileSignature size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <div>请选择一个联合签发记录</div>
          </div>
        </div>
      )
    }

    const cs = selectedCoSign
    return (
      <div style={{ ...styles.middlePanel, display: 'flex', flexDirection: 'column' }}>
        <div style={styles.panelHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSignature size={18} style={{ color: COLORS.primary }} />
            <span>联合签发详情 - {cs.reportId}</span>
          </div>
          <button
            style={{ ...styles.button, ...styles.buttonGhost }}
            onClick={() => {
              setSelectedCoSign(null)
              setCosignTab('list')
            }}
          >
            <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
            返回
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {/* 基本信息 */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '14px', color: COLORS.textMuted }}>基本信息</h4>
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>报告编号</div>
                  <div style={{ fontWeight: 500 }}>{cs.reportId}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>状态</div>
                  <span
                    style={{
                      ...styles.statusTag,
                      backgroundColor: `${getStatusColor(cs.status)}20`,
                      color: getStatusColor(cs.status),
                    }}
                  >
                    {cs.status}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>患者姓名</div>
                  <div style={{ fontWeight: 500 }}>{cs.patientName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>患者信息</div>
                  <div>{cs.gender} / {cs.age}岁</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>检查类型</div>
                  <div>{cs.examType}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>创建时间</div>
                  <div>{cs.createTime}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 多方签名展示 */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '14px', color: COLORS.textMuted }}>多方签名</h4>
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {cs.signatures.map((sig, idx) => (
                  <React.Fragment key={idx}>
                    <div style={{ padding: '12px 16px', backgroundColor: 'white', borderRadius: '8px', border: `1px solid ${sig.certificateStatus === '已认证' ? COLORS.success : COLORS.danger}30`, minWidth: '160px' }}>
                      <div style={{ fontSize: '11px', color: COLORS.textMuted, marginBottom: '4px' }}>
                        <BadgeCheck size={12} style={{ color: COLORS.primary }} /> {sig.institution}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>{sig.doctorName}</div>
                      <div style={{ fontSize: '10px', color: COLORS.textMuted, marginBottom: '4px' }}>{sig.signTime}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {sig.certificateStatus === '已认证' ? (
                          <>
                            <CheckCircle size={12} style={{ color: COLORS.success }} />
                            <span style={{ fontSize: '10px', color: COLORS.success }}>✓已认证</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={12} style={{ color: COLORS.danger }} />
                            <span style={{ fontSize: '10px', color: COLORS.danger }}>未认证</span>
                          </>
                        )}
                      </div>
                    </div>
                    {idx < cs.signatures.length - 1 && (
                      <ArrowRight size={20} style={{ color: COLORS.textMuted }} />
                    )}
                  </React.Fragment>
                ))}
                {cs.status === '待签发' && (
                  <>
                    <div style={{ padding: '12px 16px', backgroundColor: '#f3f4f6', borderRadius: '8px', border: '2px dashed #d1d5db', minWidth: '120px', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: COLORS.textMuted }}>待签名</div>
                      <div style={{ fontSize: '11px', color: COLORS.textMuted, marginTop: '4px' }}>...</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 报告版本管理 */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '14px', color: COLORS.textMuted }}>报告版本管理</h4>
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, fontSize: '12px' }}>版本号</th>
                    <th style={{ ...styles.th, fontSize: '12px' }}>修改时间</th>
                    <th style={{ ...styles.th, fontSize: '12px' }}>修改机构</th>
                    <th style={{ ...styles.th, fontSize: '12px' }}>修改原因</th>
                    <th style={{ ...styles.th, fontSize: '12px' }}>修改人</th>
                  </tr>
                </thead>
                <tbody>
                  {cs.versions.map((ver, idx) => (
                    <tr key={idx}>
                      <td style={{ ...styles.td, fontSize: '12px' }}>
                        <span style={{ ...styles.badge, backgroundColor: idx === cs.versions.length - 1 ? COLORS.primary : '#e5e7eb', color: idx === cs.versions.length - 1 ? 'white' : COLORS.textMuted }}>
                          {ver.version}
                        </span>
                      </td>
                      <td style={{ ...styles.td, fontSize: '12px' }}>{ver.modifyTime}</td>
                      <td style={{ ...styles.td, fontSize: '12px' }}>{ver.modifyInstitution}</td>
                      <td style={{ ...styles.td, fontSize: '12px' }}>{ver.modifyReason}</td>
                      <td style={{ ...styles.td, fontSize: '12px' }}>{ver.modifier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============ 渲染右侧面板 ============
  const renderRightPanel = () => {
    return (
      <div style={styles.rightPanel}>
        <div style={styles.panelHeader}>
          <span>区域统计</span>
          <button
            style={{ ...styles.button, ...styles.buttonGhost, padding: '4px' }}
            onClick={() => {
              console.log('刷新统计数据')
              setToastMessage('统计数据已刷新')
              setToastSuccess(true)
              setTimeout(() => setToastSuccess(false), 2000)
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
        {/* Tab页签 */}
        <div style={{ ...styles.tabContainer, padding: '8px 12px' }}>
          {[
            { key: 'stats', label: '数据统计', icon: <BarChart3 size={14} /> },
            { key: 'quality', label: '质控分析', icon: <ShieldCheck size={14} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              style={{
                ...styles.tab,
                padding: '6px 12px',
                fontSize: '12px',
                ...(activeMainTab === tab.key ? styles.tabActive : {}),
              }}
              onClick={() => setActiveMainTab(tab.key as 'consultation' | 'report' | 'critical')}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        {/* 报告数量统计 */}
        <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '10px', color: COLORS.textMuted }}>
            各机构报告数量
          </div>
          {mockInstitutions.map((inst) => {
            const maxCount = Math.max(...mockInstitutions.map(i => i.reportCount))
            const percentage = (inst.reportCount / maxCount) * 100
            return (
              <div key={inst.id} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px' }}>{inst.name}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{inst.reportCount}</span>
                </div>
                <div style={{ ...styles.progressBar, height: '6px' }}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${percentage}%`,
                      backgroundColor: COLORS.primary,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        {/* 会诊响应时间 */}
        <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '10px', color: COLORS.textMuted }}>
            会诊响应时间（分钟）
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '100px' }}>
            {[
              { label: '今日', value: 15, height: 40 },
              { label: '本周', value: 18, height: 48 },
              { label: '本月', value: 22, height: 58 },
              { label: '本季', value: 20, height: 53 },
            ].map((item, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: COLORS.primary }}>{item.value}</div>
                <div
                  style={{
                    width: '30px',
                    height: `${item.height}%`,
                    backgroundColor: COLORS.primary,
                    borderRadius: '4px 4px 0 0',
                    margin: '4px auto',
                  }}
                />
                <div style={{ fontSize: '10px', color: COLORS.textMuted }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* 阳性率统计 */}
        <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '10px', color: COLORS.textMuted }}>
            阳性率统计
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke={COLORS.success}
                  strokeWidth="3"
                  strokeDasharray={`${67} 100`}
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '14px', fontWeight: 600 }}>
                67%
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: COLORS.textMuted, marginBottom: '4px' }}>本月区域阳性率</div>
              <div style={{ fontSize: '13px' }}>较上月 <span style={{ color: COLORS.success }}>+2.3%</span></div>
            </div>
          </div>
        </div>
        {/* 危急值处理时效 */}
        <div style={{ padding: '12px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '10px', color: COLORS.textMuted }}>
            危急值处理时效
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 600, color: COLORS.success }}>8分钟</div>
              <div style={{ fontSize: '10px', color: COLORS.textMuted }}>平均接收时间</div>
            </div>
            <div style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 600, color: COLORS.primary }}>25分钟</div>
              <div style={{ fontSize: '10px', color: COLORS.textMuted }}>平均处理时间</div>
            </div>
            <div style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 600, color: COLORS.success }}>98%</div>
              <div style={{ fontSize: '10px', color: COLORS.textMuted }}>闭环率</div>
            </div>
            <div style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 600, color: COLORS.warning }}>3例</div>
              <div style={{ fontSize: '10px', color: COLORS.textMuted }}>处理中</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============ 渲染底部危急值面板 ============
  const renderCriticalValuePanel = () => {
    const criticalValues = getFilteredCriticalValues()
    return (
      <div style={styles.bottomPanel}>
        <div style={styles.panelHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} style={{ color: COLORS.danger }} />
            <span>危急值通报记录</span>
            <span style={{ ...styles.badge, backgroundColor: COLORS.danger, color: 'white' }}>
              {criticalValues.filter(cv => cv.status !== '已闭环').length} 待处理
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
            style={{ ...styles.button, ...styles.buttonOutline, padding: '4px 10px', fontSize: '12px' }}
            onClick={() => {
              console.log('查看危急值统计报表')
              setModalType('critical-stats')
              setShowModal(true)
            }}
          >
            <BarChart3 size={14} />
            统计报表
          </button>
            <button
            style={{ ...styles.button, ...styles.buttonOutline, padding: '4px 10px', fontSize: '12px' }}
            onClick={() => {
              console.log('导出危急值记录')
              setToastMessage('危急值记录导出成功')
              setToastSuccess(true)
              setTimeout(() => setToastSuccess(false), 2000)
            }}
          >
            <Download size={14} />
            导出
          </button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>患者信息</th>
                <th style={styles.th}>检查信息</th>
                <th style={styles.th}>机构</th>
                <th style={styles.th}>危急发现</th>
                <th style={styles.th}>严重程度</th>
                <th style={styles.th}>上报时间</th>
                <th style={styles.th}>上报医生</th>
                <th style={styles.th}>状态</th>
                <th style={styles.th}>接收时间</th>
                <th style={styles.th}>处理时间</th>
                <th style={styles.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {criticalValues.map((cv) => (
                <tr key={cv.id}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 500 }}>{cv.patientName}</div>
                    <div style={{ fontSize: '11px', color: COLORS.textMuted }}>{cv.gender} {cv.age}岁</div>
                  </td>
                  <td style={styles.td}>
                    <div>{cv.modality}</div>
                    <div style={{ fontSize: '11px', color: COLORS.textMuted }}>{cv.examItem}</div>
                  </td>
                  <td style={styles.td}>{cv.institution}</td>
                  <td style={styles.td}>
                    <div style={{ color: COLORS.danger, fontWeight: 500 }}>{cv.criticalFinding}</div>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusTag,
                        backgroundColor: `${getSeverityColor(cv.severity)}20`,
                        color: getSeverityColor(cv.severity),
                      }}
                    >
                      {cv.severity}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontSize: '12px' }}>{cv.reportedTime}</div>
                  </td>
                  <td style={styles.td}>{cv.reportedDoctor}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusTag,
                        backgroundColor: `${getStatusColor(cv.status)}20`,
                        color: getStatusColor(cv.status),
                      }}
                    >
                      <Circle size={6} fill={getStatusColor(cv.status)} />
                      {cv.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {cv.receiveTime ? (
                      <div style={{ fontSize: '12px' }}>{cv.receiveTime}</div>
                    ) : (
                      <span style={{ color: COLORS.textMuted }}>-</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {cv.handleTime ? (
                      <div style={{ fontSize: '12px' }}>{cv.handleTime}</div>
                    ) : (
                      <span style={{ color: COLORS.textMuted }}>-</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {cv.status === '待确认' && (
                      <button
                        style={{ ...styles.button, padding: '4px 10px', fontSize: '12px', backgroundColor: COLORS.warning, color: 'white' }}
                        onClick={() => handleConfirmCritical(cv)}
                      >
                        确认
                      </button>
                    )}
                    {cv.status === '处理中' && (
                      <button
                        style={{ ...styles.button, padding: '4px 10px', fontSize: '12px', backgroundColor: COLORS.success, color: 'white' }}
                        onClick={() => {
                          console.log('闭环:', cv.id)
                        }}
                      >
                        闭环
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* 分页 */}
        <div style={styles.pagination}>
          <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
            共 {criticalValues.length} 条记录
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
            style={{ ...styles.button, ...styles.buttonGhost, padding: '4px 8px' }}
            onClick={() => {
              console.log('上一页')
              setToastMessage('已是第一页')
              setToastSuccess(true)
              setTimeout(() => setToastSuccess(false), 1500)
            }}
          >
            上一页
          </button>
            <button
            style={{ ...styles.button, ...styles.buttonGhost, padding: '4px 8px' }}
            onClick={() => {
              console.log('下一页')
              setToastMessage('已是最后一页')
              setToastSuccess(true)
              setTimeout(() => setToastSuccess(false), 1500)
            }}
          >
            下一页
          </button>
          </div>
        </div>
      </div>
    )
  }

  // ============ 渲染模态框 ============
  const renderModal = () => {
    if (!showModal) return null

    return (
      <div style={styles.modal} onClick={() => setShowModal(false)}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          {/* 会诊申请模态框 */}
          {modalType === 'apply' && (
            <>
              <div style={styles.modalHeader}>
                <span>发起会诊申请</span>
                <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
              </div>
              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>患者姓名 *</label>
                  <input
                    type="text"
                    style={{ ...styles.input, width: '100%' }}
                    placeholder="请输入患者姓名"
                    value={consultationForm.patientName}
                    onChange={(e) => setConsultationForm({ ...consultationForm, patientName: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ ...styles.formGroup, flex: 1 }}>
                    <label style={styles.formLabel}>性别</label>
                    <select
                      style={{ ...styles.input, width: '100%' }}
                      value={consultationForm.gender}
                      onChange={(e) => setConsultationForm({ ...consultationForm, gender: e.target.value })}
                    >
                      <option value="男">男</option>
                      <option value="女">女</option>
                    </select>
                  </div>
                  <div style={{ ...styles.formGroup, flex: 1 }}>
                    <label style={styles.formLabel}>年龄</label>
                    <input
                      type="number"
                      style={{ ...styles.input, width: '100%' }}
                      placeholder="年龄"
                      value={consultationForm.age}
                      onChange={(e) => setConsultationForm({ ...consultationForm, age: e.target.value })}
                    />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>申请机构 *</label>
                  <select
                    style={{ ...styles.input, width: '100%' }}
                    value={consultationForm.institution}
                    onChange={(e) => setConsultationForm({ ...consultationForm, institution: e.target.value })}
                  >
                    <option value="">请选择机构</option>
                    {mockInstitutions.map((inst) => (
                      <option key={inst.id} value={inst.name}>{inst.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button style={{ ...styles.button, ...styles.buttonOutline }} onClick={() => setShowModal(false)}>
                  取消
                </button>
                <button style={{ ...styles.button, ...styles.buttonPrimary }} onClick={handleSubmitConsultation}>
                  提交
                </button>
              </div>
            </>
          )}
          {/* 会诊意见模态框 */}
          {modalType === 'opinion' && (
            <>
              <div style={styles.modalHeader}>
                <span>填写会诊意见</span>
                <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
              </div>
              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>会诊意见</label>
                  <textarea
                    style={{ ...styles.textarea, width: '100%', minHeight: '150px' }}
                    placeholder="请详细填写会诊意见..."
                    value={opinionText}
                    onChange={(e) => setOpinionText(e.target.value)}
                  />
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button style={{ ...styles.button, ...styles.buttonOutline }} onClick={() => setShowModal(false)}>
                  取消
                </button>
                <button style={{ ...styles.button, ...styles.buttonPrimary }} onClick={handleSubmitOpinion}>
                  提交意见
                </button>
              </div>
            </>
          )}
          {/* 报告审核模态框 */}
          {modalType === 'review' && (
            <>
              <div style={styles.modalHeader}>
                <span>审核报告</span>
                <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
              </div>
              <div style={styles.modalBody}>
                <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px' }}>
                    <div style={{ marginBottom: '8px' }}>报告号：{selectedReport?.reportId}</div>
                    <div style={{ marginBottom: '8px' }}>患者：{selectedReport?.patientName}</div>
                    <div>检查：{selectedReport?.modality} - {selectedReport?.examItem}</div>
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>审核意见</label>
                  <textarea
                    style={{ ...styles.textarea, width: '100%', minHeight: '120px' }}
                    placeholder="请填写审核意见..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button
                  style={{ ...styles.button, padding: '8px 20px', backgroundColor: COLORS.success, color: 'white' }}
                  onClick={() => handleReviewReport(selectedReport!, '通过')}
                >
                  <CheckCircle size={14} />
                  通过
                </button>
                <button
                  style={{ ...styles.button, padding: '8px 20px', backgroundColor: COLORS.danger, color: 'white' }}
                  onClick={() => handleReviewReport(selectedReport!, '驳回')}
                >
                  <XCircle size={14} />
                  驳回
                </button>
              </div>
            </>
          )}
          {/* 报告通过审核模态框 */}
          {modalType === 'review-pass' && (
            <>
              <div style={styles.modalHeader}>
                <span>审核通过</span>
                <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
              </div>
              <div style={styles.modalBody}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <CheckCircle size={48} style={{ color: COLORS.success, marginBottom: '16px' }} />
                  <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>确认通过该报告？</div>
                  <div style={{ color: COLORS.textMuted, fontSize: '13px' }}>
                    报告号：{selectedReport?.reportId}
                  </div>
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button style={{ ...styles.button, ...styles.buttonOutline }} onClick={() => setShowModal(false)}>
                  取消
                </button>
                <button
                  style={{ ...styles.button, ...styles.buttonPrimary }}
                  onClick={() => {
                    handleReviewReport(selectedReport!, '通过')
                    setModalType('')
                  }}
                >
                  确认通过
                </button>
              </div>
            </>
          )}
          {/* 报告驳回审核模态框 */}
          {modalType === 'review-reject' && (
            <>
              <div style={styles.modalHeader}>
                <span>驳回报告</span>
                <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
              </div>
              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>驳回原因 *</label>
                  <textarea
                    style={{ ...styles.textarea, width: '100%', minHeight: '120px' }}
                    placeholder="请详细说明驳回原因，以便下级医院修正..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button style={{ ...styles.button, ...styles.buttonOutline }} onClick={() => setShowModal(false)}>
                  取消
                </button>
                <button
                  style={{ ...styles.button, ...styles.buttonDanger }}
                  onClick={() => {
                    handleReviewReport(selectedReport!, '驳回')
                    setModalType('')
                  }}
                >
                  确认驳回
                </button>
              </div>
            </>
          )}
          {/* 质控筛选模态框 */}
          {modalType === 'quality-filter' && (
            <>
              <div style={styles.modalHeader}>
                <span>质控筛选</span>
                <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
              </div>
              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>质量评分范围</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="number" style={{ ...styles.input, width: '80px' }} placeholder="最低" min="0" max="100" />
                    <span>至</span>
                    <input type="number" style={{ ...styles.input, width: '80px' }} placeholder="最高" min="0" max="100" />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>问题类型</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" /> 描述欠详细
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" /> 诊断意见不明确
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" /> 报告格式不规范
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" /> 缺少测量数据
                    </label>
                  </div>
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button style={{ ...styles.button, ...styles.buttonOutline }} onClick={() => setShowModal(false)}>
                  取消
                </button>
                <button style={{ ...styles.button, ...styles.buttonPrimary }} onClick={() => {
                  setShowModal(false)
                  setToastMessage('筛选条件已应用')
                  setToastSuccess(true)
                  setTimeout(() => setToastSuccess(false), 2000)
                }}>
                  应用筛选
                </button>
              </div>
            </>
          )}
          {/* 新增联合签发模态框 */}
          {modalType === 'cosign-add' && (
            <>
              <div style={styles.modalHeader}>
                <span>新增联合签发</span>
                <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
              </div>
              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>报告编号 *</label>
                  <input type="text" style={{ ...styles.input, width: '100%' }} placeholder="请输入报告编号" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>检查类型</label>
                  <select style={{ ...styles.input, width: '100%' }}>
                    <option value="">请选择</option>
                    <option value="CT">CT</option>
                    <option value="MRI">MRI</option>
                    <option value="DR">DR</option>
                    <option value="超声">超声</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>参与机构</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {mockInstitutions.map(inst => (
                      <label key={inst.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" /> {inst.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button style={{ ...styles.button, ...styles.buttonOutline }} onClick={() => setShowModal(false)}>
                  取消
                </button>
                <button style={{ ...styles.button, ...styles.buttonPrimary }} onClick={() => {
                  setShowModal(false)
                  setToastMessage('联合签发记录已创建')
                  setToastSuccess(true)
                  setTimeout(() => setToastSuccess(false), 2000)
                }}>
                  创建
                </button>
              </div>
            </>
          )}
          {/* 危急值统计模态框 */}
          {modalType === 'critical-stats' && (
            <>
              <div style={styles.modalHeader}>
                <span>危急值统计报表</span>
                <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
              </div>
              <div style={styles.modalBody}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: COLORS.danger }}>5</div>
                    <div style={{ fontSize: '12px', color: COLORS.textMuted }}>待处理</div>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: COLORS.success }}>3</div>
                    <div style={{ fontSize: '12px', color: COLORS.textMuted }}>已闭环</div>
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>按时间范围筛选</label>
                  <select style={{ ...styles.input, width: '100%' }}>
                    <option value="today">今日</option>
                    <option value="week">本周</option>
                    <option value="month">本月</option>
                    <option value="year">本年</option>
                  </select>
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button style={{ ...styles.button, ...styles.buttonOutline }} onClick={() => setShowModal(false)}>
                  关闭
                </button>
                <button style={{ ...styles.button, ...styles.buttonPrimary }} onClick={() => {
                  setShowModal(false)
                  setToastMessage('报表已导出')
                  setToastSuccess(true)
                  setTimeout(() => setToastSuccess(false), 2000)
                }}>
                  导出报表
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // ============ 渲染主界面 ============
  return (
    <div style={styles.pageContainer}>
      {/* 顶部标题栏 */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>
            <Activity size={24} />
            区域影像报告管理
          </div>
          <div style={styles.headerSubtitle}>
            远程会诊 | 报告审核 | 危急值通报 | 医联体远程诊断 | 跨机构联合签发
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', opacity: 0.85 }}>
            {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </div>
          <button
          style={{ ...styles.button, backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
          onClick={() => setShowSettingsModal(true)}
        >
          <Settings size={14} />
          设置
        </button>
        </div>
      </div>

      {/* 统计卡片 */}
      {renderStatCards()}

      {/* 主Tab导航 */}
      <div style={{ padding: '0 24px', marginBottom: '16px' }}>
        <div style={styles.tabContainer}>
          {[
            { key: 'consultation', label: '远程会诊', icon: <Video size={14} /> },
            { key: 'report', label: '报告审核', icon: <ShieldCheck size={14} /> },
            { key: 'critical', label: '危急值', icon: <ShieldAlert size={14} /> },
            { key: 'remote', label: '远程诊断', icon: <Monitor size={14} /> },
            { key: 'cosign', label: '联合签发', icon: <FileSignature size={14} /> },
            { key: 'sharing', label: '报告分享', icon: <Share2 size={14} /> },
            { key: 'sla', label: 'SLA监控', icon: <Timer size={14} /> },
            { key: 'regionalStats', label: '区域统计', icon: <BarChart3 size={14} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              style={{ ...styles.tab, ...(activeMainTab === tab.key ? styles.tabActive : {}) }}
              onClick={() => setActiveMainTab(tab.key as any)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 主内容区 */}
      <div style={styles.mainContent}>
        {/* 左侧机构列表 */}
        {renderInstitutionList()}

        {/* 中间面板 - 根据Tab显示不同内容 */}
        {activeMainTab === 'consultation' && (
          consultationTab === 'detail' ? renderConsultationDetail() : renderConsultationList()
        )}
        {activeMainTab === 'report' && (
          reportTab === 'detail' ? renderReportDetail() : renderReportList()
        )}
        {activeMainTab === 'critical' && (
          <div style={{ ...styles.middlePanel, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={styles.emptyState}>
              <ShieldAlert size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <div>请在下方危急值通报记录区域进行操作</div>
            </div>
          </div>
        )}
        {activeMainTab === 'remote' && (
          remoteTab === 'writing' ? renderRemoteWriting() : renderRemoteDiagnosisList()
        )}
        {activeMainTab === 'cosign' && (
          cosignTab === 'detail' ? renderCoSignDetail() : renderCoSignList()
        )}
        {activeMainTab === 'sharing' && <ReportSharingSection />}
        {activeMainTab === 'sla' && <SLAAndTATSection />}
        {activeMainTab === 'regionalStats' && <RegionalStatsDashboard />}

        {/* 右侧统计面板 */}
        {renderRightPanel()}
      </div>

      {/* 底部危急值通报记录 */}
      {renderCriticalValuePanel()}

      {/* 成功提示Toast */}
      {toastSuccess && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: COLORS.success,
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          zIndex: 2000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Check size={18} />
          {toastMessage}
        </div>
      )}

      {/* 系统设置弹窗 */}
      {showSettingsModal && (
        <div style={styles.modal} onClick={() => setShowSettingsModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span>系统设置</span>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowSettingsModal(false)} />
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>机构名称</label>
                <input type="text" style={{ ...styles.input, width: '100%' }} placeholder="请输入机构名称" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>通知设置</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" defaultChecked /> 接收危急值提醒
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" defaultChecked /> 接收会诊通知
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" /> 接收报告审核通知
                  </label>
                </div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={{ ...styles.button, ...styles.buttonOutline }} onClick={() => setShowSettingsModal(false)}>
                取消
              </button>
              <button style={{ ...styles.button, ...styles.buttonPrimary }} onClick={() => {
                setShowSettingsModal(false)
                setToastMessage('设置已保存')
                setToastSuccess(true)
                setTimeout(() => setToastSuccess(false), 2000)
              }}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 模态框 */}
      {renderModal()}
    </div>
  )
}

export default RegionalReportPage
