// ============================================================
// G005 放射科RIS系统 - 科研数据抽取/课题数据脱敏管理 v1.0.0
// 功能：课题管理 / 数据抽取 / 标签管理 / 导出管理
// ============================================================
import React, { useState } from 'react'
import {
  FlaskConical, Plus, X, Search, Edit2, Trash2, Download, Upload,
  Tag, Folder, FileText, Calendar, User, Clock,
  ChevronDown, ChevronRight, Eye, EyeOff, Check, AlertCircle,
  Database, Shield, ShieldCheck, FileJson, FileSpreadsheet,
  Filter, RefreshCw, MoreVertical, Copy, Save
} from 'lucide-react'

// ==================== 类型定义 ====================
type TabKey = 'projects' | 'extract' | 'labels' | 'export'
type ProjectStatus = '进行中' | '已完成' | '已归档'
type LabelType = '诊断' | '部位' | '特征'
type ExamType = 'CT' | 'MR' | 'DXR' | 'US' | 'MG' | 'PET' | 'SPECT'
type ResultType = '阳性' | '阴性'
type ExportFormat = 'CSV' | 'JSON' | 'DICOM'

interface Project {
  id: string
  code: string
  name: string
  leader: string
  startDate: string
  status: ProjectStatus
  dataCount: number
  description: string
  members: string[]
}

interface ExamRecord {
  id: string
  patientId: string
  patientName: string
  age: number
  gender: string
  examType: ExamType
  examDate: string
  diagnosis: string
  result: ResultType
  idCard: string
  phone: string
  address: string
  modality: string
}

interface Label {
  id: string
  name: string
  type: LabelType
  color: string
  useCount: number
}

interface ExportRecord {
  id: string
  projectId: string
  projectName: string
  format: ExportFormat
  exportTime: string
  recordCount: number
  downloadUrl: string
  operator: string
}

interface ExtractFilter {
  examTypes: ExamType[]
  startDate: string
  endDate: string
  minAge: number
  maxAge: number
  keyword: string
  result: ResultType | ''
}

// ==================== 虚构数据 ====================
const mockProjects: Project[] = [
  {
    id: 'P001',
    code: 'RC-2024-001',
    name: '肺癌早筛多中心研究',
    leader: '张明远',
    startDate: '2024-01-15',
    status: '进行中',
    dataCount: 1250,
    description: '基于低剂量CT的肺癌早期筛查多中心临床研究',
    members: ['张明远', '李建国', '王秀英', '陈晓东']
  },
  {
    id: 'P002',
    code: 'RC-2024-002',
    name: '阿尔茨海默病MRI影像标志物研究',
    leader: '刘文彬',
    startDate: '2024-03-20',
    status: '进行中',
    dataCount: 680,
    description: '利用多模态MRI技术探索阿尔茨海默病早期影像生物标志物',
    members: ['刘文彬', '赵德明', '孙丽华']
  },
  {
    id: 'P003',
    code: 'RC-2023-015',
    name: '心血管CT-FFR应用研究',
    leader: '李建国',
    startDate: '2023-06-10',
    status: '已完成',
    dataCount: 450,
    description: 'CT血流储备分数(CFFR)在冠心病诊断中的应用价值评估',
    members: ['李建国', '张明远', '王强']
  },
  {
    id: 'P004',
    code: 'RC-2023-008',
    name: '脑卒中溶栓时间窗影像评估',
    leader: '陈晓东',
    startDate: '2023-09-01',
    status: '已归档',
    dataCount: 890,
    description: '急性脑卒中患者CT影像与溶栓疗效相关性研究',
    members: ['陈晓东', '刘文彬', '周伟']
  },
  {
    id: 'P005',
    code: 'RC-2024-005',
    name: '骨质疏松X光筛查标准制定',
    leader: '王秀英',
    startDate: '2024-06-01',
    status: '进行中',
    dataCount: 320,
    description: '基于双能X射线吸收法的骨质疏松自动化筛查方案研究',
    members: ['王秀英', '李梅', '张明远']
  }
]

const mockExamRecords: ExamRecord[] = [
  { id: 'E001', patientId: 'P10001', patientName: '王建国', age: 58, gender: '男', examType: 'CT', examDate: '2024-11-15', diagnosis: '右肺上叶结节', result: '阳性', idCard: '110101195806121234', phone: '13812345678', address: '北京市朝阳区建国路88号', modality: 'CT-01' },
  { id: 'E002', patientId: 'P10002', patientName: '李淑芬', age: 45, gender: '女', examType: 'MR', examDate: '2024-11-14', diagnosis: '颅内未见明显异常', result: '阴性', idCard: '110102197904032345', phone: '13923456789', address: '北京市海淀区中关村大街1号', modality: 'MR-01' },
  { id: 'E003', patientId: 'P10003', patientName: '张伟', age: 67, gender: '男', examType: 'CT', examDate: '2024-11-13', diagnosis: '左肺下叶磨玻璃密度影', result: '阳性', idCard: '110103195712151234', phone: '13734567890', address: '北京市西城区金融街8号', modality: 'CT-02' },
  { id: 'E004', patientId: 'P10004', patientName: '刘艳', age: 52, gender: '女', examType: 'DXR', examDate: '2024-11-12', diagnosis: '胸椎骨质未见明显异常', result: '阴性', idCard: '110104197305061234', phone: '13645678901', address: '北京市东城区王府井大街66号', modality: 'DXR-01' },
  { id: 'E005', patientId: 'P10005', patientName: '陈永强', age: 73, gender: '男', examType: 'MR', examDate: '2024-11-11', diagnosis: '双侧海马萎缩', result: '阳性', idCard: '110105195108231234', phone: '13556789012', address: '北京市石景山区古城路28号', modality: 'MR-02' },
  { id: 'E006', patientId: 'P10006', patientName: '赵敏', age: 38, gender: '女', examType: 'US', examDate: '2024-11-10', diagnosis: '甲状腺右侧叶实性结节', result: '阳性', idCard: '110106198708151234', phone: '13467890123', address: '北京市丰台区西三环南路14号', modality: 'US-01' },
  { id: 'E007', patientId: 'P10007', patientName: '孙国庆', age: 61, gender: '男', examType: 'CT', examDate: '2024-11-09', diagnosis: '冠脉钙化积分显著增高', result: '阳性', idCard: '110107196402101234', phone: '13378901234', address: '北京市房山区良乡拱辰大街1号', modality: 'CT-01' },
  { id: 'E008', patientId: 'P10008', patientName: '周莉', age: 55, gender: '女', examType: 'MG', examDate: '2024-11-08', diagnosis: '右乳外上象限簇状钙化', result: '阳性', idCard: '110108197005032345', phone: '13289012345', address: '北京市通州区新华大街158号', modality: 'MG-01' },
  { id: 'E009', patientId: 'P10009', patientName: '吴磊', age: 42, gender: '男', examType: 'MR', examDate: '2024-11-07', diagnosis: '腰椎间盘突出(L4-L5)', result: '阳性', idCard: '110109198306201234', phone: '13190123456', address: '北京市顺义区新顺南大街18号', modality: 'MR-01' },
  { id: 'E010', patientId: 'P10010', patientName: '郑华', age: 49, gender: '女', examType: 'CT', examDate: '2024-11-06', diagnosis: '腹部CT平扫未见明显异常', result: '阴性', idCard: '110111197608141234', phone: '13091234567', address: '北京市昌平区东小口镇政府街5号', modality: 'CT-03' },
]

const mockLabels: Label[] = [
  { id: 'L001', name: '肺结节', type: '诊断', color: '#ef4444', useCount: 456 },
  { id: 'L002', name: '磨玻璃密度影', type: '诊断', color: '#f97316', useCount: 234 },
  { id: 'L003', name: '冠状动脉钙化', type: '诊断', color: '#eab308', useCount: 189 },
  { id: 'L004', name: '脑萎缩', type: '诊断', color: '#22c55e', useCount: 156 },
  { id: 'L005', name: '肺叶', type: '部位', color: '#3b82f6', useCount: 678 },
  { id: 'L006', name: '海马区', type: '部位', color: '#8b5cf6', useCount: 123 },
  { id: 'L007', name: '腰椎', type: '部位', color: '#06b6d4', useCount: 267 },
  { id: 'L008', name: '钙化灶', type: '特征', color: '#ec4899', useCount: 345 },
  { id: 'L009', name: '肿大淋巴结', type: '特征', color: '#14b8a6', useCount: 178 },
  { id: 'L010', name: '胸腔积液', type: '特征', color: '#f43f5e', useCount: 145 },
]

const mockExportRecords: ExportRecord[] = [
  { id: 'EX001', projectId: 'P001', projectName: '肺癌早筛多中心研究', format: 'CSV', exportTime: '2024-11-15 14:30:25', recordCount: 320, downloadUrl: '/exports/RC-2024-001_20241115.csv', operator: '张明远' },
  { id: 'EX002', projectId: 'P001', projectName: '肺癌早筛多中心研究', format: 'JSON', exportTime: '2024-11-14 10:15:00', recordCount: 150, downloadUrl: '/exports/RC-2024-001_20241114.json', operator: '李建国' },
  { id: 'EX003', projectId: 'P002', projectName: '阿尔茨海默病MRI影像标志物研究', format: 'DICOM', exportTime: '2024-11-13 16:45:30', recordCount: 85, downloadUrl: '/exports/RC-2024-002_20241113.zip', operator: '刘文彬' },
  { id: 'EX004', projectId: 'P003', projectName: '心血管CT-FFR应用研究', format: 'CSV', exportTime: '2024-11-12 09:20:10', recordCount: 450, downloadUrl: '/exports/RC-2023-015_20241112.csv', operator: '李建国' },
  { id: 'EX005', projectId: 'P005', projectName: '骨质疏松X光筛查标准制定', format: 'JSON', exportTime: '2024-11-11 11:00:45', recordCount: 120, downloadUrl: '/exports/RC-2024-005_20241111.json', operator: '王秀英' },
]

// ==================== 样式常量 ====================
const COLORS = {
  primary: '#1e40af',
  primaryLight: '#3b82f6',
  primaryLighter: '#dbeafe',
  secondary: '#64748b',
  success: '#16a34a',
  successLight: '#dcfce7',
  warning: '#d97706',
  warningLight: '#fef3c7',
  danger: '#dc2626',
  dangerLight: '#fee2e2',
  bgGray: '#f1f5f9',
  bgWhite: '#ffffff',
  border: '#e2e8f0',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textLight: '#94a3b8',
}

// ==================== 工具函数 ====================
function maskName(name: string): string {
  if (!name || name.length === 0) return name
  return name.charAt(0) + '***'
}

function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 6) return idCard
  return idCard.substring(0, 3) + '***********' + idCard.substring(idCard.length - 4)
}

function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone
  return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4)
}

function maskAddress(address: string): string {
  if (!address) return address
  const parts = address.split('')
  if (parts.length <= 4) return address.charAt(0) + '***'
  return address.substring(0, 4) + '***'
}

function getStatusColor(status: ProjectStatus): string {
  switch (status) {
    case '进行中': return COLORS.primaryLight
    case '已完成': return COLORS.success
    case '已归档': return COLORS.secondary
    default: return COLORS.secondary
  }
}

function getStatusBgColor(status: ProjectStatus): string {
  switch (status) {
    case '进行中': return COLORS.primaryLighter
    case '已完成': return COLORS.successLight
    case '已归档': return '#f1f5f9'
    default: return '#f1f5f9'
  }
}

function getLabelTypeColor(type: LabelType): string {
  switch (type) {
    case '诊断': return '#ef4444'
    case '部位': return '#3b82f6'
    case '特征': return '#8b5cf6'
    default: return COLORS.secondary
  }
}

function getExportFormatIcon(format: ExportFormat): React.ReactNode {
  switch (format) {
    case 'CSV': return <FileSpreadsheet size={16} />
    case 'JSON': return <FileJson size={16} />
    case 'DICOM': return <Database size={16} />
  }
}

// ==================== 子组件 ====================
interface TabButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 20px',
        background: active ? COLORS.primary : 'transparent',
        color: active ? '#ffffff' : COLORS.textSecondary,
        border: 'none',
        borderBottom: active ? '2px solid ' + COLORS.primary : '2px solid transparent',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 600,
        transition: 'all 0.2s',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: number
}

function Modal({ open, onClose, title, children, width = 600 }: ModalProps) {
  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: COLORS.bgWhite,
          borderRadius: 12,
          width: width,
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid ' + COLORS.border,
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.textPrimary }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              color: COLORS.textSecondary,
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: 20 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ==================== 课题管理Tab ====================
function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailProject, setDetailProject] = useState<Project | null>(null)
  const [newProject, setNewProject] = useState<Partial<Project>>({
    code: '',
    name: '',
    leader: '',
    startDate: '',
    description: '',
    members: [],
  })

  const handleCreateProject = () => {
    const project: Project = {
      id: 'P' + String(Date.now()).slice(-3),
      code: newProject.code || '',
      name: newProject.name || '',
      leader: newProject.leader || '',
      startDate: newProject.startDate || new Date().toISOString().split('T')[0],
      status: '进行中',
      dataCount: 0,
      description: newProject.description || '',
      members: newProject.members || [],
    }
    setProjects([...projects, project])
    setShowModal(false)
    setNewProject({
      code: '',
      name: '',
      leader: '',
      startDate: '',
      description: '',
      members: [],
    })
  }

  const handleShowDetail = (project: Project) => {
    setDetailProject(project)
    setShowDetailModal(true)
  }

  return (
    <div>
      {/* 工具栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: COLORS.bgWhite,
            border: '1px solid ' + COLORS.border,
            borderRadius: 8,
            padding: '8px 12px',
            gap: 8,
          }}>
            <Search size={16} color={COLORS.textSecondary} />
            <input
              placeholder="搜索课题名称或编号..."
              style={{
                border: 'none',
                outline: 'none',
                fontSize: 14,
                width: 240,
                background: 'transparent',
              }}
            />
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 16px',
            background: COLORS.primary,
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <Plus size={16} />
          新建课题
        </button>
      </div>

      {/* 课题列表 */}
      <div style={{
        background: COLORS.bgWhite,
        borderRadius: 12,
        border: '1px solid ' + COLORS.border,
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: COLORS.bgGray }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>课题编号</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>课题名称</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>负责人</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>开始日期</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>状态</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>数据量</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, idx) => (
              <tr
                key={project.id}
                style={{
                  background: idx % 2 === 0 ? COLORS.bgWhite : COLORS.bgGray,
                  borderTop: '1px solid ' + COLORS.border,
                }}
              >
                <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: COLORS.primary }}>{project.code}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: COLORS.textPrimary }}>{project.name}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: COLORS.textSecondary }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <User size={14} color={COLORS.textSecondary} />
                    {project.leader}
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: COLORS.textSecondary }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} color={COLORS.textSecondary} />
                    {project.startDate}
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    background: getStatusBgColor(project.status),
                    color: getStatusColor(project.status),
                  }}>
                    {project.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, textAlign: 'right' }}>
                  {project.dataCount.toLocaleString()}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <button
                      onClick={() => handleShowDetail(project)}
                      style={{
                        padding: '6px 10px',
                        background: 'none',
                        border: '1px solid ' + COLORS.border,
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 12,
                        color: COLORS.textSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Eye size={12} />
                      详情
                    </button>
                    <button
                      style={{
                        padding: 6,
                        background: 'none',
                        border: '1px solid ' + COLORS.border,
                        borderRadius: 6,
                        cursor: 'pointer',
                        color: COLORS.textSecondary,
                      }}
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 新建课题弹窗 */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="新建课题" width={560}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 6 }}>课题编号</label>
            <input
              type="text"
              value={newProject.code}
              onChange={e => setNewProject({ ...newProject, code: e.target.value })}
              placeholder="如: RC-2024-006"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid ' + COLORS.border,
                borderRadius: 8,
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 6 }}>课题名称</label>
            <input
              type="text"
              value={newProject.name}
              onChange={e => setNewProject({ ...newProject, name: e.target.value })}
              placeholder="请输入课题名称"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid ' + COLORS.border,
                borderRadius: 8,
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 6 }}>负责人</label>
            <input
              type="text"
              value={newProject.leader}
              onChange={e => setNewProject({ ...newProject, leader: e.target.value })}
              placeholder="请输入负责人姓名"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid ' + COLORS.border,
                borderRadius: 8,
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 6 }}>开始日期</label>
            <input
              type="date"
              value={newProject.startDate}
              onChange={e => setNewProject({ ...newProject, startDate: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid ' + COLORS.border,
                borderRadius: 8,
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 6 }}>课题描述</label>
            <textarea
              value={newProject.description}
              onChange={e => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="请输入课题描述"
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid ' + COLORS.border,
                borderRadius: 8,
                fontSize: 14,
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                padding: '10px 20px',
                background: COLORS.bgGray,
                color: COLORS.textSecondary,
                border: '1px solid ' + COLORS.border,
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              取消
            </button>
            <button
              onClick={handleCreateProject}
              style={{
                padding: '10px 20px',
                background: COLORS.primary,
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              创建课题
            </button>
          </div>
        </div>
      </Modal>

      {/* 课题详情弹窗 */}
      <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)} title="课题详情" width={640}>
        {detailProject && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{
              background: COLORS.bgGray,
              padding: 16,
              borderRadius: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.textPrimary }}>{detailProject.name}</span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  background: getStatusBgColor(detailProject.status),
                  color: getStatusColor(detailProject.status),
                }}>
                  {detailProject.status}
                </span>
              </div>
              <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 }}>{detailProject.description}</div>
              <div style={{ display: 'flex', gap: 24, fontSize: 13, color: COLORS.textSecondary }}>
                <span>课题编号: <strong style={{ color: COLORS.primary }}>{detailProject.code}</strong></span>
                <span>数据量: <strong style={{ color: COLORS.textPrimary }}>{detailProject.dataCount}</strong></span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 }}>负责人</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary }}>{detailProject.leader}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 }}>开始日期</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary }}>{detailProject.startDate}</div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 }}>课题成员</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {detailProject.members.map((member, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '4px 12px',
                      background: COLORS.primaryLighter,
                      color: COLORS.primary,
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {member}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  padding: '10px 20px',
                  background: COLORS.bgGray,
                  color: COLORS.textSecondary,
                  border: '1px solid ' + COLORS.border,
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// ==================== 数据抽取Tab ====================
function ExtractTab() {
  const [filter, setFilter] = useState<ExtractFilter>({
    examTypes: [],
    startDate: '',
    endDate: '',
    minAge: 0,
    maxAge: 100,
    keyword: '',
    result: '',
  })
  const [showDesensitization, setShowDesensitization] = useState(true)
  const [selectedExamTypes, setSelectedExamTypes] = useState<ExamType[]>([])

  const examTypeOptions: ExamType[] = ['CT', 'MR', 'DXR', 'US', 'MG', 'PET', 'SPECT']

  const toggleExamType = (type: ExamType) => {
    setSelectedExamTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const handleExtract = () => {
    alert('数据抽取功能已触发，共 ' + mockExamRecords.length + ' 条记录将被抽取并脱敏')
  }

  return (
    <div>
      {/* 筛选条件 */}
      <div style={{
        background: COLORS.bgWhite,
        borderRadius: 12,
        border: '1px solid ' + COLORS.border,
        padding: 20,
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} />
          数据筛选条件
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {/* 检查类型 */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 8 }}>检查类型</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {examTypeOptions.map(type => (
                <button
                  key={type}
                  onClick={() => toggleExamType(type)}
                  style={{
                    padding: '6px 12px',
                    background: selectedExamTypes.includes(type) ? COLORS.primary : COLORS.bgGray,
                    color: selectedExamTypes.includes(type) ? '#ffffff' : COLORS.textSecondary,
                    border: '1px solid ' + (selectedExamTypes.includes(type) ? COLORS.primary : COLORS.border),
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 日期范围 */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 8 }}>日期范围</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="date"
                value={filter.startDate}
                onChange={e => setFilter({ ...filter, startDate: e.target.value })}
                style={{
                  padding: '8px 12px',
                  border: '1px solid ' + COLORS.border,
                  borderRadius: 6,
                  fontSize: 13,
                }}
              />
              <span style={{ color: COLORS.textSecondary }}>至</span>
              <input
                type="date"
                value={filter.endDate}
                onChange={e => setFilter({ ...filter, endDate: e.target.value })}
                style={{
                  padding: '8px 12px',
                  border: '1px solid ' + COLORS.border,
                  borderRadius: 6,
                  fontSize: 13,
                }}
              />
            </div>
          </div>

          {/* 患者年龄范围 */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 8 }}>患者年龄范围</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                value={filter.minAge}
                onChange={e => setFilter({ ...filter, minAge: Number(e.target.value) })}
                min={0}
                max={120}
                style={{
                  padding: '8px 12px',
                  border: '1px solid ' + COLORS.border,
                  borderRadius: 6,
                  fontSize: 13,
                  width: 80,
                }}
              />
              <span style={{ color: COLORS.textSecondary }}>至</span>
              <input
                type="number"
                value={filter.maxAge}
                onChange={e => setFilter({ ...filter, maxAge: Number(e.target.value) })}
                min={0}
                max={120}
                style={{
                  padding: '8px 12px',
                  border: '1px solid ' + COLORS.border,
                  borderRadius: 6,
                  fontSize: 13,
                  width: 80,
                }}
              />
              <span style={{ color: COLORS.textSecondary }}>岁</span>
            </div>
          </div>

          {/* 检查结果 */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 8 }}>检查结果</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['', '阳性', '阴性'].map(result => (
                <button
                  key={result || 'all'}
                  onClick={() => setFilter({ ...filter, result: result as ResultType | '' })}
                  style={{
                    padding: '6px 16px',
                    background: filter.result === result ? COLORS.primary : COLORS.bgGray,
                    color: filter.result === result ? '#ffffff' : COLORS.textSecondary,
                    border: '1px solid ' + (filter.result === result ? COLORS.primary : COLORS.border),
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {result || '全部'}
                </button>
              ))}
            </div>
          </div>

          {/* 诊断关键词 */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 8 }}>诊断关键词</label>
            <input
              type="text"
              value={filter.keyword}
              onChange={e => setFilter({ ...filter, keyword: e.target.value })}
              placeholder="输入诊断关键词进行搜索..."
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid ' + COLORS.border,
                borderRadius: 8,
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </div>

      {/* 抽取预览表格 */}
      <div style={{
        background: COLORS.bgWhite,
        borderRadius: 12,
        border: '1px solid ' + COLORS.border,
        padding: 20,
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Database size={16} />
          抽取预览（10条）
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: COLORS.bgGray }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: COLORS.textSecondary }}>患者ID</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: COLORS.textSecondary }}>姓名</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: COLORS.textSecondary }}>年龄/性别</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: COLORS.textSecondary }}>检查类型</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: COLORS.textSecondary }}>检查日期</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: COLORS.textSecondary }}>诊断</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: COLORS.textSecondary }}>结果</th>
                {showDesensitization && (
                  <>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: COLORS.textSecondary }}>身份证号</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: COLORS.textSecondary }}>手机号</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: COLORS.textSecondary }}>地址</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {mockExamRecords.map((record, idx) => (
                <tr
                  key={record.id}
                  style={{
                    background: idx % 2 === 0 ? COLORS.bgWhite : COLORS.bgGray,
                    borderTop: '1px solid ' + COLORS.border,
                  }}
                >
                  <td style={{ padding: '10px 12px', color: COLORS.textSecondary }}>{record.patientId}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: showDesensitization ? COLORS.textSecondary : COLORS.textPrimary }}>
                    {showDesensitization ? maskName(record.patientName) : record.patientName}
                  </td>
                  <td style={{ padding: '10px 12px', color: COLORS.textPrimary }}>{record.age}岁/{record.gender}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      padding: '3px 8px',
                      background: COLORS.primaryLighter,
                      color: COLORS.primary,
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                    }}>
                      {record.examType}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: COLORS.textSecondary }}>{record.examDate}</td>
                  <td style={{ padding: '10px 12px', color: COLORS.textPrimary }}>{record.diagnosis}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      background: record.result === '阳性' ? COLORS.dangerLight : COLORS.successLight,
                      color: record.result === '阳性' ? COLORS.danger : COLORS.success,
                    }}>
                      {record.result}
                    </span>
                  </td>
                  {showDesensitization && (
                    <>
                      <td style={{ padding: '10px 12px', color: COLORS.textSecondary, fontFamily: 'monospace', fontSize: 12 }}>
                        {maskIdCard(record.idCard)}
                      </td>
                      <td style={{ padding: '10px 12px', color: COLORS.textSecondary, fontFamily: 'monospace', fontSize: 12 }}>
                        {maskPhone(record.phone)}
                      </td>
                      <td style={{ padding: '10px 12px', color: COLORS.textSecondary, fontSize: 12 }}>
                        {maskAddress(record.address)}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 脱敏规则 */}
      <div style={{
        background: COLORS.bgWhite,
        borderRadius: 12,
        border: '1px solid ' + COLORS.border,
        padding: 20,
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={16} />
          脱敏规则
          <button
            onClick={() => setShowDesensitization(!showDesensitization)}
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              background: showDesensitization ? COLORS.primary : COLORS.bgGray,
              color: showDesensitization ? '#ffffff' : COLORS.textSecondary,
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {showDesensitization ? <EyeOff size={14} /> : <Eye size={14} />}
            {showDesensitization ? '已启用脱敏' : '已禁用脱敏'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div style={{
            padding: 16,
            background: COLORS.bgGray,
            borderRadius: 8,
            borderLeft: '4px solid ' + COLORS.primary,
          }}>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 }}>姓名</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary, fontFamily: 'monospace' }}>
              王*** → {maskName('王建国')}
            </div>
          </div>
          <div style={{
            padding: 16,
            background: COLORS.bgGray,
            borderRadius: 8,
            borderLeft: '4px solid ' + COLORS.warning,
          }}>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 }}>身份证号</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary, fontFamily: 'monospace' }}>
              110***2345 → {maskIdCard('110101195806121234')}
            </div>
          </div>
          <div style={{
            padding: 16,
            background: COLORS.bgGray,
            borderRadius: 8,
            borderLeft: '4px solid ' + COLORS.success,
          }}>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 }}>手机号</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary, fontFamily: 'monospace' }}>
              138****5678 → {maskPhone('13812345678')}
            </div>
          </div>
          <div style={{
            padding: 16,
            background: COLORS.bgGray,
            borderRadius: 8,
            borderLeft: '4px solid ' + COLORS.danger,
          }}>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 }}>地址</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary, fontFamily: 'monospace' }}>
              北京市*** → {maskAddress('北京市朝阳区建国路88号')}
            </div>
          </div>
        </div>
      </div>

      {/* 确认抽取按钮 */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleExtract}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 40px',
            background: COLORS.primary,
            color: '#ffffff',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 15,
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
          }}
        >
          <Download size={18} />
          确认抽取（10条记录）
        </button>
      </div>
    </div>
  )
}

// ==================== 数据标签化管理Tab ====================
function LabelsTab() {
  const [labels, setLabels] = useState<Label[]>(mockLabels)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newLabel, setNewLabel] = useState<Partial<Label>>({
    name: '',
    type: '诊断',
    color: '#3b82f6',
  })
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterType, setFilterType] = useState<LabelType | ''>('')

  const handleAddLabel = () => {
    if (!newLabel.name) return
    const label: Label = {
      id: 'L' + String(Date.now()).slice(-3),
      name: newLabel.name || '',
      type: newLabel.type || '诊断',
      color: newLabel.color || '#3b82f6',
      useCount: 0,
    }
    setLabels([...labels, label])
    setShowAddModal(false)
    setNewLabel({ name: '', type: '诊断', color: '#3b82f6' })
  }

  const filteredLabels = labels.filter(label => {
    const matchKeyword = label.name.toLowerCase().includes(searchKeyword.toLowerCase())
    const matchType = !filterType || label.type === filterType
    return matchKeyword && matchType
  })

  return (
    <div>
      {/* 工具栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: COLORS.bgWhite,
            border: '1px solid ' + COLORS.border,
            borderRadius: 8,
            padding: '8px 12px',
            gap: 8,
          }}>
            <Search size={16} color={COLORS.textSecondary} />
            <input
              placeholder="搜索标签..."
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: 14,
                width: 180,
                background: 'transparent',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['', '诊断', '部位', '特征'].map(type => (
              <button
                key={type || 'all'}
                onClick={() => setFilterType(type as LabelType | '')}
                style={{
                  padding: '8px 14px',
                  background: filterType === type ? COLORS.primary : COLORS.bgWhite,
                  color: filterType === type ? '#ffffff' : COLORS.textSecondary,
                  border: '1px solid ' + (filterType === type ? COLORS.primary : COLORS.border),
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {type || '全部'}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 16px',
            background: COLORS.primary,
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <Plus size={16} />
          自定义标签
        </button>
      </div>

      {/* 标签列表 */}
      <div style={{
        background: COLORS.bgWhite,
        borderRadius: 12,
        border: '1px solid ' + COLORS.border,
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: COLORS.bgGray }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>标签名</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>标签类型</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>使用次数</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredLabels.map((label, idx) => (
              <tr
                key={label.id}
                style={{
                  background: idx % 2 === 0 ? COLORS.bgWhite : COLORS.bgGray,
                  borderTop: '1px solid ' + COLORS.border,
                }}
              >
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: label.color,
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary }}>{label.name}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    background: getLabelTypeColor(label.type) + '20',
                    color: getLabelTypeColor(label.type),
                  }}>
                    {label.type}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: COLORS.textPrimary, textAlign: 'center' }}>
                  {label.useCount.toLocaleString()}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <button
                      style={{
                        padding: '6px 10px',
                        background: 'none',
                        border: '1px solid ' + COLORS.border,
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 12,
                        color: COLORS.textSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Tag size={12} />
                      应用
                    </button>
                    <button
                      style={{
                        padding: 6,
                        background: 'none',
                        border: '1px solid ' + COLORS.border,
                        borderRadius: 6,
                        cursor: 'pointer',
                        color: COLORS.danger,
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 已抽取数据标签管理提示 */}
      <div style={{
        marginTop: 20,
        padding: 20,
        background: COLORS.primaryLighter,
        borderRadius: 12,
        border: '1px solid ' + COLORS.primaryLight,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.primary, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tag size={16} />
          已抽取数据标签管理
        </div>
        <div style={{ fontSize: 13, color: COLORS.textSecondary }}>
          <p style={{ marginBottom: 8 }}>当前已抽取记录：50条</p>
          <p>为已抽取的影像数据添加诊断标签、部位标签和特征标签，便于后续研究和分析。</p>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <button
            style={{
              padding: '10px 16px',
              background: COLORS.primary,
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            批量标注
          </button>
          <button
            style={{
              padding: '10px 16px',
              background: COLORS.bgWhite,
              color: COLORS.primary,
              border: '1px solid ' + COLORS.primary,
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            查看已标注目录
          </button>
        </div>
      </div>

      {/* 添加标签弹窗 */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="添加自定义标签" width={440}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 6 }}>标签名称</label>
            <input
              type="text"
              value={newLabel.name}
              onChange={e => setNewLabel({ ...newLabel, name: e.target.value })}
              placeholder="请输入标签名称"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid ' + COLORS.border,
                borderRadius: 8,
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 6 }}>标签类型</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['诊断', '部位', '特征'] as LabelType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setNewLabel({ ...newLabel, type })}
                  style={{
                    padding: '8px 16px',
                    background: newLabel.type === type ? getLabelTypeColor(type) : COLORS.bgGray,
                    color: newLabel.type === type ? '#ffffff' : COLORS.textSecondary,
                    border: '1px solid ' + (newLabel.type === type ? getLabelTypeColor(type) : COLORS.border),
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 6 }}>标签颜色</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'].map(color => (
                <button
                  key={color}
                  onClick={() => setNewLabel({ ...newLabel, color })}
                  style={{
                    width: 32,
                    height: 32,
                    background: color,
                    border: newLabel.color === color ? '3px solid ' + COLORS.textPrimary : '2px solid ' + COLORS.border,
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <button
              onClick={() => setShowAddModal(false)}
              style={{
                padding: '10px 20px',
                background: COLORS.bgGray,
                color: COLORS.textSecondary,
                border: '1px solid ' + COLORS.border,
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              取消
            </button>
            <button
              onClick={handleAddLabel}
              style={{
                padding: '10px 20px',
                background: COLORS.primary,
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              添加标签
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ==================== 导出管理Tab ====================
function ExportTab() {
  const [exports, setExports] = useState<ExportRecord[]>(mockExportRecords)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [exportPermissions, setExportPermissions] = useState({
    allowCsv: true,
    allowJson: true,
    allowDicom: false,
    maxRecordsPerExport: 1000,
    requireApproval: true,
  })

  const handleDownload = (record: ExportRecord) => {
    alert('开始下载: ' + record.downloadUrl)
  }

  return (
    <div>
      {/* 导出记录 */}
      <div style={{
        background: COLORS.bgWhite,
        borderRadius: 12,
        border: '1px solid ' + COLORS.border,
        overflow: 'hidden',
        marginBottom: 20,
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid ' + COLORS.border,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} />
            导出记录
          </div>
          <button
            onClick={() => setShowPermissionModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              background: COLORS.bgGray,
              color: COLORS.textSecondary,
              border: '1px solid ' + COLORS.border,
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <Shield size={14} />
            导出权限管理
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: COLORS.bgGray }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>课题</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>导出格式</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>导出时间</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>记录数</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>操作人</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {exports.map((record, idx) => (
              <tr
                key={record.id}
                style={{
                  background: idx % 2 === 0 ? COLORS.bgWhite : COLORS.bgGray,
                  borderTop: '1px solid ' + COLORS.border,
                }}
              >
                <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: COLORS.primary }}>{record.projectName}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {getExportFormatIcon(record.format)}
                    <span style={{
                      padding: '3px 8px',
                      background: record.format === 'DICOM' ? COLORS.warningLight : COLORS.bgGray,
                      color: record.format === 'DICOM' ? COLORS.warning : COLORS.textSecondary,
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                    }}>
                      {record.format}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: COLORS.textSecondary }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={12} />
                    {record.exportTime}
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, textAlign: 'right' }}>
                  {record.recordCount.toLocaleString()}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: COLORS.textSecondary }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <User size={12} />
                    {record.operator}
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <button
                      onClick={() => handleDownload(record)}
                      style={{
                        padding: '6px 12px',
                        background: COLORS.primary,
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Download size={12} />
                      下载
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 导出权限管理弹窗 */}
      <Modal open={showPermissionModal} onClose={() => setShowPermissionModal(false)} title="导出权限管理" width={500}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            padding: 16,
            background: COLORS.warningLight,
            borderRadius: 8,
            border: '1px solid ' + COLORS.warning,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <AlertCircle size={16} color={COLORS.warning} />
              <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.warning }}>权限提示</span>
            </div>
            <div style={{ fontSize: 12, color: COLORS.textSecondary }}>
              科研数据导出涉及患者隐私，请严格按照医院相关规定管理和审批导出权限。
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 12 }}>允许导出的格式</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { key: 'allowCsv', label: 'CSV 格式', desc: '表格数据，便于统计分析' },
                { key: 'allowJson', label: 'JSON 格式', desc: '结构化数据，便于程序处理' },
                { key: 'allowDicom', label: 'DICOM 格式', desc: '原始影像数据，需额外审批' },
              ].map(item => (
                <label
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 12,
                    background: COLORS.bgGray,
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={exportPermissions[item.key as keyof typeof exportPermissions] as boolean}
                    onChange={e => setExportPermissions({ ...exportPermissions, [item.key]: e.target.checked })}
                    style={{ marginRight: 12, width: 18, height: 18 }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 8 }}>
              单次最大导出记录数
            </label>
            <input
              type="number"
              value={exportPermissions.maxRecordsPerExport}
              onChange={e => setExportPermissions({ ...exportPermissions, maxRecordsPerExport: Number(e.target.value) })}
              min={1}
              max={10000}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid ' + COLORS.border,
                borderRadius: 8,
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={exportPermissions.requireApproval}
              onChange={e => setExportPermissions({ ...exportPermissions, requireApproval: e.target.checked })}
              style={{ width: 18, height: 18 }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary }}>导出需管理员审批</span>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <button
              onClick={() => setShowPermissionModal(false)}
              style={{
                padding: '10px 20px',
                background: COLORS.bgGray,
                color: COLORS.textSecondary,
                border: '1px solid ' + COLORS.border,
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              取消
            </button>
            <button
              onClick={() => {
                alert('导出权限设置已保存')
                setShowPermissionModal(false)
              }}
              style={{
                padding: '10px 20px',
                background: COLORS.primary,
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              保存设置
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ==================== 主组件 ====================
export default function ResearchPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('projects')

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'projects', label: '课题管理', icon: <Folder size={16} /> },
    { key: 'extract', label: '数据抽取', icon: <Database size={16} /> },
    { key: 'labels', label: '数据标签化管理', icon: <Tag size={16} /> },
    { key: 'export', label: '导出管理', icon: <Download size={16} /> },
  ]

  return (
    <div style={{ padding: 24, background: COLORS.bgGray, minHeight: '100vh' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40,
            height: 40,
            background: COLORS.primary,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FlaskConical size={20} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: COLORS.textPrimary, margin: 0 }}>
              科研数据抽取
            </h1>
            <p style={{ fontSize: 13, color: COLORS.textSecondary, margin: 0 }}>
              课题数据脱敏管理 · 5个课题 · 50条已抽取记录
            </p>
          </div>
        </div>
      </div>

      {/* Tab导航 */}
      <div style={{
        display: 'flex',
        gap: 4,
        background: COLORS.bgWhite,
        padding: '4px 4px 0',
        borderRadius: '12px 12px 0 0',
        border: '1px solid ' + COLORS.border,
        borderBottom: 'none',
      }}>
        {tabs.map(tab => (
          <TabButton
            key={tab.key}
            active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            icon={tab.icon}
            label={tab.label}
          />
        ))}
      </div>

      {/* Tab内容 */}
      <div style={{
        background: COLORS.bgWhite,
        border: '1px solid ' + COLORS.border,
        borderRadius: '0 0 12px 12px',
        padding: 24,
        minHeight: 500,
      }}>
        {activeTab === 'projects' && <ProjectsTab />}
        {activeTab === 'extract' && <ExtractTab />}
        {activeTab === 'labels' && <LabelsTab />}
        {activeTab === 'export' && <ExportTab />}
      </div>
    </div>
  )
}
