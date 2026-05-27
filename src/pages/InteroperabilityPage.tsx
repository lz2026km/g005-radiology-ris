// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 - HIE互联互通平台 v1.0.0
// 功能：机构互联互通、文档交换、协议转换、交易监控
// ============================================================
import { useState, useMemo } from 'react'
import {
  Network, Database, Server, Globe, Link2, FileText, CheckCircle, XCircle,
  Clock, AlertCircle, TrendingUp, Activity, RefreshCw, Search, Filter,
  ChevronDown, ChevronRight, Wifi, WifiOff, MessageSquare, Inbox,
  Send, Download, Upload, BarChart2, PieChart as PieChartIcon, ArrowRight,
  Monitor, Shield, AlertTriangle, Check, X, MoreVertical, Eye, Pause, Play
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts'
import { initialPatients } from '../data/initialData'

// ==================== 类型定义 ====================
type TabKey = 'dashboard' | 'facilities' | 'documents' | 'transactions' | 'queue' | 'health'
type ProtocolType = 'HL7v2' | 'HL7v3' | 'FHIR' | 'CDA' | 'DICOM' | 'XDS' | 'IHE'
type TransactionStatus = '成功' | '失败' | '待处理' | '处理中' | '超时' | '重试'
type FacilityStatus = '在线' | '离线' | '维护中' | '告警'

interface HIEIntegration {
  id: string
  name: string
  type: '医院' | '实验室' | '诊所' | '数据中心' | '区域平台' | '影像中心'
  region: string
  protocol: ProtocolType[]
  status: FacilityStatus
  patientCount: number
  transactionCount: number
  lastTransaction: string
  responseTime: number
  uptime: number
  description: string
  address: string
  contact: string
}

interface HIETransactionLog {
  id: string
  timestamp: string
  source: string
  target: string
  documentType: 'CDA' | 'HL7' | 'FHIR' | 'DICOM' | 'XDS' | 'PIX' | 'PDQ'
  action: string
  status: TransactionStatus
  duration: number
  messageId: string
  patientId?: string
  errorMessage?: string
  retryCount: number
  size: string
}

interface QueueMessage {
  id: string
  queueName: string
  priority: '高' | '中' | '低'
  status: '等待中' | '处理中' | '已完成' | '失败'
  createdAt: string
  processedAt?: string
  retryCount: number
}

interface ProtocolStat {
  name: string
  sent: number
  received: number
  failed: number
}

// ==================== 样式常量 ====================
const COLORS = {
  primary: '#1e40af',
  primaryLight: '#3b82f6',
  secondary: '#0891b2',
  success: '#16a34a',
  successLight: '#dcfce7',
  warning: '#d97706',
  warningLight: '#fef3c7',
  danger: '#dc2626',
  dangerLight: '#fee2e2',
  bgGray: '#f1f5f9',
  border: '#e2e8f0',
  text: '#1e293b',
  textLight: '#64748b',
}

// ==================== 辅助函数 ====================
const getStatusColor = (status: string) => {
  switch (status) {
    case '在线':
    case '成功':
    case '已完成':
      return COLORS.success
    case '离线':
    case '失败':
    case '超时':
      return COLORS.danger
    case '维护中':
    case '待处理':
      return COLORS.warning
    case '告警':
    case '处理中':
      return COLORS.primaryLight
    default:
      return COLORS.textLight
  }
}

const getStatusBgColor = (status: string) => {
  switch (status) {
    case '在线':
    case '成功':
    case '已完成':
      return COLORS.successLight
    case '离线':
    case '失败':
    case '超时':
      return COLORS.dangerLight
    case '维护中':
    case '待处理':
      return COLORS.warningLight
    default:
      return COLORS.bgGray
  }
}

// ==================== HIE数据 (导出) ====================
export const HIE_INTEGRATIONS: HIEIntegration[] = [
  { id: 'HIE-001', name: '市第一人民医院', type: '医院', region: '城区', protocol: ['HL7v2', 'FHIR', 'DICOM'], status: '在线', patientCount: 125680, transactionCount: 856200, lastTransaction: '2026-05-27 14:32:15', responseTime: 120, uptime: 99.8, description: '三级甲等综合医院，区域医联体核心', address: '建设路123号', contact: '信息科: 88812345' },
  { id: 'HIE-002', name: '市人民医院', type: '医院', region: '城区', protocol: ['HL7v2', 'CDA', 'DICOM'], status: '在线', patientCount: 98234, transactionCount: 654320, lastTransaction: '2026-05-27 14:32:08', responseTime: 98, uptime: 99.5, description: '三级甲等综合医院', address: '解放路456号', contact: '信息中心: 88823456' },
  { id: 'HIE-003', name: '市中医医院', type: '医院', region: '城区', protocol: ['HL7v2', 'FHIR'], status: '在线', patientCount: 45678, transactionCount: 234560, lastTransaction: '2026-05-27 14:31:55', responseTime: 135, uptime: 99.2, description: '三级甲等中医医院', address: '和平路789号', contact: '信息科: 88834567' },
  { id: 'HIE-004', name: '市妇幼保健院', type: '医院', region: '城区', protocol: ['HL7v2', 'CDA', 'FHIR'], status: '在线', patientCount: 34567, transactionCount: 198340, lastTransaction: '2026-05-27 14:30:42', responseTime: 145, uptime: 98.9, description: '三级甲等专科医院', address: '胜利路101号', contact: '信息科: 88845678' },
  { id: 'HIE-005', name: '县人民医院', type: '医院', region: '县域', protocol: ['HL7v2', 'DICOM', 'XDS'], status: '在线', patientCount: 78956, transactionCount: 456780, lastTransaction: '2026-05-27 14:32:20', responseTime: 220, uptime: 98.5, description: '二级甲等综合医院', address: '县城建设路', contact: '信息科: 76912345' },
  { id: 'HIE-006', name: '县中医院', type: '医院', region: '县域', protocol: ['HL7v2', 'CDA'], status: '在线', patientCount: 45678, transactionCount: 234560, lastTransaction: '2026-05-27 14:31:18', responseTime: 198, uptime: 98.2, description: '二级甲等中医医院', address: '县城健康路', contact: '信息科: 76923456' },
  { id: 'HIE-007', name: '市医学检验中心', type: '实验室', region: '城区', protocol: ['HL7v2', 'FHIR'], status: '在线', patientCount: 234567, transactionCount: 1234560, lastTransaction: '2026-05-27 14:32:25', responseTime: 85, uptime: 99.9, description: '区域检验中心', address: '科技路88号', contact: '技术部: 88856789' },
  { id: 'HIE-008', name: '区医学检验中心', type: '实验室', region: '县域', protocol: ['HL7v2'], status: '在线', patientCount: 87654, transactionCount: 543210, lastTransaction: '2026-05-27 14:32:10', responseTime: 110, uptime: 99.6, description: '区级检验分中心', address: '工业区创新路', contact: '技术部: 88867890' },
  { id: 'HIE-009', name: '市影像诊断中心', type: '影像中心', region: '城区', protocol: ['DICOM', 'FHIR', 'XDS'], status: '在线', patientCount: 45678, transactionCount: 345600, lastTransaction: '2026-05-27 14:32:30', responseTime: 180, uptime: 99.4, description: '区域影像会诊中心', address: '杏林路200号', contact: '影像科: 88878901' },
  { id: 'HIE-010', name: '区社区卫生中心', type: '诊所', region: '城区', protocol: ['HL7v2', 'FHIR'], status: '在线', patientCount: 34567, transactionCount: 198760, lastTransaction: '2026-05-27 14:32:05', responseTime: 95, uptime: 98.8, description: '社区卫生服务中心', address: '社区路1号', contact: '信息室: 88889012' },
  { id: 'HIE-011', name: '东苑社区卫生站', type: '诊所', region: '城区', protocol: ['HL7v2'], status: '在线', patientCount: 12345, transactionCount: 67890, lastTransaction: '2026-05-27 14:28:15', responseTime: 105, uptime: 97.5, description: '社区卫生服务站', address: '东苑小区', contact: '办公室: 88890123' },
  { id: 'HIE-012', name: '西苑社区卫生站', type: '诊所', region: '城区', protocol: ['HL7v2'], status: '维护中', patientCount: 9876, transactionCount: 54320, lastTransaction: '2026-05-27 10:15:00', responseTime: 0, uptime: 0, description: '社区卫生服务站', address: '西苑小区', contact: '办公室: 88891234' },
  { id: 'HIE-013', name: '市紧急救援中心', type: '医院', region: '城区', protocol: ['HL7v2', 'FHIR', 'DICOM'], status: '在线', patientCount: 12345, transactionCount: 87650, lastTransaction: '2026-05-27 14:32:35', responseTime: 75, uptime: 99.7, description: '120急救中心', address: '急救路999号', contact: '指挥室: 88800000' },
  { id: 'HIE-014', name: '省人民医院', type: '医院', region: '省城', protocol: ['HL7v2', 'HL7v3', 'FHIR', 'CDA', 'DICOM', 'XDS', 'IHE'], status: '在线', patientCount: 234567, transactionCount: 1567890, lastTransaction: '2026-05-27 14:32:40', responseTime: 250, uptime: 99.9, description: '省级三级甲等医院，省医联体核心', address: '省城中心大道1号', contact: '信息中心: 01112345678' },
  { id: 'HIE-015', name: '省儿童医院', type: '医院', region: '省城', protocol: ['HL7v2', 'FHIR', 'CDA'], status: '在线', patientCount: 87654, transactionCount: 456780, lastTransaction: '2026-05-27 14:32:18', responseTime: 230, uptime: 99.6, description: '省级三级甲等儿童医院', address: '省城儿童路100号', contact: '信息科: 01112345679' },
  { id: 'HIE-016', name: '省肿瘤医院', type: '医院', region: '省城', protocol: ['HL7v2', 'DICOM', 'FHIR', 'XDS'], status: '在线', patientCount: 65432, transactionCount: 345670, lastTransaction: '2026-05-27 14:31:50', responseTime: 195, uptime: 99.3, description: '省级三级甲等肿瘤专科医院', address: '省城肿瘤路200号', contact: '信息科: 01112345680' },
  { id: 'HIE-017', name: '市精神卫生中心', type: '医院', region: '城区', protocol: ['HL7v2', 'CDA'], status: '在线', patientCount: 23456, transactionCount: 123450, lastTransaction: '2026-05-27 14:32:02', responseTime: 165, uptime: 98.7, description: '三级甲等精神专科医院', address: '心理路300号', contact: '信息科: 88811122' },
  { id: 'HIE-018', name: '市康复医院', type: '医院', region: '城区', protocol: ['HL7v2', 'FHIR'], status: '在线', patientCount: 12345, transactionCount: 87650, lastTransaction: '2026-05-27 14:30:55', responseTime: 140, uptime: 98.4, description: '二级甲等康复专科医院', address: '康复路150号', contact: '信息科: 88822233' },
  { id: 'HIE-019', name: '区第一社区卫生中心', type: '诊所', region: '城区', protocol: ['HL7v2', 'FHIR'], status: '在线', patientCount: 23456, transactionCount: 156780, lastTransaction: '2026-05-27 14:32:12', responseTime: 88, uptime: 98.9, description: '示范社区卫生服务中心', address: '区府路1号', contact: '信息室: 88833344' },
  { id: 'HIE-020', name: '区第二社区卫生中心', type: '诊所', region: '城区', protocol: ['HL7v2'], status: '在线', patientCount: 18765, transactionCount: 98760, lastTransaction: '2026-05-27 14:32:08', responseTime: 92, uptime: 98.6, description: '社区卫生服务中心', address: '社区路88号', contact: '信息室: 88844455' },
  { id: 'HIE-021', name: '区第三社区卫生中心', type: '诊所', region: '城区', protocol: ['HL7v2'], status: '告警', patientCount: 15678, transactionCount: 76540, lastTransaction: '2026-05-27 14:25:00', responseTime: 450, uptime: 95.0, description: '社区卫生服务中心', address: '社区路188号', contact: '信息室: 88855566' },
  { id: 'HIE-022', name: '市医保结算中心', type: '数据中心', region: '城区', protocol: ['HL7v2', 'FHIR'], status: '在线', patientCount: 0, transactionCount: 2345600, lastTransaction: '2026-05-27 14:32:45', responseTime: 65, uptime: 99.9, description: '市医保信息系统', address: '政务中心', contact: '技术部: 88866677' },
  { id: 'HIE-023', name: '省健康信息平台', type: '区域平台', region: '省城', protocol: ['HL7v2', 'HL7v3', 'FHIR', 'CDA', 'XDS', 'IHE'], status: '在线', patientCount: 4567890, transactionCount: 12345678, lastTransaction: '2026-05-27 14:32:50', responseTime: 320, uptime: 99.95, description: '省级全民健康信息平台', address: '省城信息化大厦', contact: '平台办: 01112345681' },
  { id: 'HIE-024', name: '市卫生信息平台', type: '区域平台', region: '城区', protocol: ['HL7v2', 'FHIR', 'CDA', 'XDS', 'IHE'], status: '在线', patientCount: 2345678, transactionCount: 8765432, lastTransaction: '2026-05-27 14:32:48', responseTime: 185, uptime: 99.8, description: '市级全民健康信息平台', address: '市政中心', contact: '信息办: 88877788' },
  { id: 'HIE-025', name: '区卫生信息平台', type: '区域平台', region: '城区', protocol: ['HL7v2', 'FHIR', 'CDA', 'XDS'], status: '在线', patientCount: 1234567, transactionCount: 4567890, lastTransaction: '2026-05-27 14:32:35', responseTime: 125, uptime: 99.6, description: '区级全民健康信息平台', address: '区政中心', contact: '信息办: 88888899' },
  { id: 'HIE-026', name: '市疾控中心', type: '数据中心', region: '城区', protocol: ['HL7v2', 'FHIR'], status: '在线', patientCount: 0, transactionCount: 345670, lastTransaction: '2026-05-27 14:32:22', responseTime: 78, uptime: 99.5, description: '疾病预防控制中心', address: '防疫路1号', contact: '信息科: 88899900' },
  { id: 'HIE-027', name: '市血液中心', type: '数据中心', region: '城区', protocol: ['HL7v2', 'FHIR'], status: '在线', patientCount: 0, transactionCount: 123450, lastTransaction: '2026-05-27 14:32:15', responseTime: 82, uptime: 99.4, description: '中心血站', address: '献血路100号', contact: '信息科: 88800011' },
  { id: 'HIE-028', name: '市民健康档案库', type: '数据中心', region: '城区', protocol: ['HL7v2', 'FHIR', 'CDA', 'XDS'], status: '在线', patientCount: 3456789, transactionCount: 9876543, lastTransaction: '2026-05-27 14:32:55', responseTime: 95, uptime: 99.9, description: '市民电子健康档案库', address: '信息港', contact: '档案办: 88811133' },
  { id: 'HIE-029', name: '省医学影像中心', type: '影像中心', region: '省城', protocol: ['DICOM', 'FHIR', 'XDS', 'IHE'], status: '在线', patientCount: 123456, transactionCount: 876540, lastTransaction: '2026-05-27 14:32:42', responseTime: 280, uptime: 99.7, description: '省级医学影像数据中心', address: '省城影像路', contact: '影像部: 01112345682' },
  { id: 'HIE-030', name: '市远程会诊中心', type: '影像中心', region: '城区', protocol: ['DICOM', 'FHIR', 'IHE'], status: '在线', patientCount: 34567, transactionCount: 234560, lastTransaction: '2026-05-27 14:32:38', responseTime: 210, uptime: 99.5, description: '区域远程会诊中心', address: '杏林路300号', contact: '会诊办: 88822244' },
  { id: 'HIE-031', name: '区牙科诊所联盟', type: '诊所', region: '城区', protocol: ['HL7v2'], status: '离线', patientCount: 4567, transactionCount: 23456, lastTransaction: '2026-05-26 18:00:00', responseTime: 0, uptime: 0, description: '口腔门诊部联盟', address: '牙科街', contact: '信息室: 88833355' },
  { id: 'HIE-032', name: '区眼科诊所', type: '诊所', region: '城区', protocol: ['HL7v2'], status: '维护中', patientCount: 3456, transactionCount: 12345, lastTransaction: '2026-05-27 08:30:00', responseTime: 0, uptime: 0, description: '眼科门诊部', address: '眼科路', contact: '信息室: 88844466' },
]

// 生成HIE_TRANSACTION_LOGS (120+条)
function generateTransactionLogs(): HIETransactionLog[] {
  const facilities = HIE_INTEGRATIONS.filter(f => f.status === '在线')
  const documentTypes: HIETransactionLog['documentType'][] = ['CDA', 'HL7', 'FHIR', 'DICOM', 'XDS', 'PIX', 'PDQ']
  const actions = ['查询', '提交', '获取', '订阅', '推送', '确认', '取消', '更新']
  const statuses: TransactionStatus[] = ['成功', '成功', '成功', '失败', '待处理', '处理中', '超时', '重试']
  const patientIds = initialPatients.slice(0, 50).map(p => p.id)
  
  const logs: HIETransactionLog[] = []
  const now = new Date()
  
  for (let i = 0; i < 120; i++) {
    const sourceIdx = Math.floor(Math.random() * facilities.length)
    let targetIdx = Math.floor(Math.random() * facilities.length)
    while (targetIdx === sourceIdx) {
      targetIdx = Math.floor(Math.random() * facilities.length)
    }
    
    const source = facilities[sourceIdx]
    const target = facilities[targetIdx]
    const docType = documentTypes[Math.floor(Math.random() * documentTypes.length)]
    const action = actions[Math.floor(Math.random() * actions.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    const timestamp = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    const duration = status === '成功' ? Math.floor(Math.random() * 300) + 20 : Math.floor(Math.random() * 1000) + 500
    
    logs.push({
      id: `TXN-${String(i + 1).padStart(4, '0')}`,
      timestamp: timestamp.toISOString().replace('T', ' ').slice(0, 19),
      source: source.name,
      target: target.name,
      documentType: docType,
      action,
      status,
      duration,
      messageId: `MSG-${Date.now()}-${i}`,
      patientId: Math.random() > 0.3 ? patientIds[Math.floor(Math.random() * patientIds.length)] : undefined,
      errorMessage: status === '失败' || status === '超时' ? '连接超时或数据格式错误' : undefined,
      retryCount: status === '重试' ? Math.floor(Math.random() * 3) + 1 : 0,
      size: `${(Math.random() * 500 + 10).toFixed(2)} KB`
    })
  }
  
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export const HIE_TRANSACTION_LOGS = generateTransactionLogs()

// ==================== 子组件：统计卡片 ====================
interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
  bgColor: string
  trend?: string
}

function StatCard({ label, value, icon, color, bgColor, trend }: StatCardProps) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: '16px 20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{label}</div>
        {trend && <div style={{ fontSize: 11, color: COLORS.success, marginTop: 2 }}>{trend}</div>}
      </div>
    </div>
  )
}

// ==================== 子组件：标签页按钮 ====================
interface TabButtonProps {
  tabKey: TabKey
  label: string
  icon: React.ReactNode
  isActive: boolean
  onClick: () => void
  badge?: number | string
}

function TabButton({ label, icon, isActive, onClick, badge }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 20px',
        border: 'none',
        borderBottom: isActive ? '3px solid #1e40af' : '3px solid transparent',
        background: 'none',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: isActive ? 700 : 500,
        color: isActive ? '#1e40af' : '#64748b',
        transition: 'all 0.2s',
      }}
    >
      {icon}
      {label}
      {badge !== undefined && (
        <span style={{
          background: isActive ? '#1e40af' : '#e2e8f0',
          color: isActive ? '#fff' : '#64748b',
          borderRadius: 10,
          padding: '1px 6px',
          fontSize: 11,
          fontWeight: 700,
        }}>
          {badge}
        </span>
      )}
    </button>
  )
}

// ==================== 子组件：设施卡片 ====================
interface FacilityCardProps {
  facility: HIEIntegration
  onClick?: () => void
}

function FacilityCard({ facility, onClick }: FacilityCardProps) {
  const statusColor = getStatusColor(facility.status)
  const statusBgColor = getStatusBgColor(facility.status)
  
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 10,
        border: '1px solid #e2e8f0',
        padding: 16,
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(30,64,175,0.15)'
        e.currentTarget.style.borderColor = '#1e40af'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
        e.currentTarget.style.borderColor = '#e2e8f0'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: facility.status === '在线' ? '#dbeafe' : '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: facility.status === '在线' ? '#1e40af' : '#94a3b8',
        }}>
          {facility.type === '医院' && <Server size={20} />}
          {facility.type === '实验室' && <Database size={20} />}
          {facility.type === '诊所' && <Network size={20} />}
          {facility.type === '数据中心' && <Database size={20} />}
          {facility.type === '区域平台' && <Globe size={20} />}
          {facility.type === '影像中心' && <Monitor size={20} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{facility.name}</div>
          <div style={{ fontSize: 11, color: COLORS.textLight }}>{facility.region} · {facility.type}</div>
        </div>
        <div style={{
          padding: '2px 8px',
          borderRadius: 10,
          background: statusBgColor,
          color: statusColor,
          fontSize: 11,
          fontWeight: 600,
        }}>
          {facility.status}
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: COLORS.textLight }}>
          <span>患者:</span>
          <span style={{ fontWeight: 600, color: COLORS.text, marginLeft: 4 }}>
            {facility.patientCount > 0 ? `${(facility.patientCount / 10000).toFixed(1)}万` : '-'}
          </span>
        </div>
        <div style={{ fontSize: 11, color: COLORS.textLight }}>
          <span>交易:</span>
          <span style={{ fontWeight: 600, color: COLORS.text, marginLeft: 4 }}>
            {facility.transactionCount > 0 ? `${(facility.transactionCount / 10000).toFixed(1)}万` : '-'}
          </span>
        </div>
        <div style={{ fontSize: 11, color: COLORS.textLight }}>
          <span>响应:</span>
          <span style={{ fontWeight: 600, color: COLORS.text, marginLeft: 4 }}>
            {facility.responseTime > 0 ? `${facility.responseTime}ms` : '-'}
          </span>
        </div>
        <div style={{ fontSize: 11, color: COLORS.textLight }}>
          <span>可用:</span>
          <span style={{ fontWeight: 600, color: COLORS.text, marginLeft: 4 }}>
            {facility.uptime > 0 ? `${facility.uptime}%` : '-'}
          </span>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {facility.protocol.slice(0, 4).map(p => (
          <div key={p} style={{
            padding: '2px 6px',
            background: '#eff6ff',
            color: '#1e40af',
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 600,
          }}>
            {p}
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== 子组件：交易日志表格 ====================
interface TransactionTableProps {
  logs: HIETransactionLog[]
  maxRows?: number
}

function TransactionTable({ logs, maxRows = 15 }: TransactionTableProps) {
  const displayLogs = logs.slice(0, maxRows)
  
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>时间</th>
            <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>源</th>
            <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>目标</th>
            <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>类型</th>
            <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>动作</th>
            <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>状态</th>
            <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>耗时</th>
          </tr>
        </thead>
        <tbody>
          {displayLogs.map((log, idx) => {
            const statusColor = getStatusColor(log.status)
            const statusBgColor = getStatusBgColor(log.status)
            return (
              <tr key={log.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 12px', color: '#64748b', fontFamily: 'monospace' }}>{log.timestamp.slice(5, 19)}</td>
                <td style={{ padding: '10px 12px', fontWeight: 500, color: COLORS.text }}>{log.source.slice(0, 10)}</td>
                <td style={{ padding: '10px 12px', fontWeight: 500, color: COLORS.text }}>{log.target.slice(0, 10)}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    padding: '2px 6px',
                    background: '#eff6ff',
                    color: '#1e40af',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 600,
                  }}>
                    {log.documentType}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', color: '#64748b' }}>{log.action}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    padding: '2px 8px',
                    background: statusBgColor,
                    color: statusColor,
                    borderRadius: 10,
                    fontSize: 10,
                    fontWeight: 600,
                  }}>
                    {log.status}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: log.duration > 500 ? COLORS.danger : COLORS.text }}>
                  {log.duration}ms
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ==================== 子组件：协议统计柱状图 ====================
interface ProtocolChartProps {
  data: ProtocolStat[]
}

function ProtocolChart({ data }: ProtocolChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
        <Tooltip
          contentStyle={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="sent" name="发送" fill="#1e40af" radius={[4, 4, 0, 0]} />
        <Bar dataKey="received" name="接收" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="failed" name="失败" fill="#dc2626" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ==================== 主组件 ====================
export default function InteroperabilityPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedFacility, setSelectedFacility] = useState<HIEIntegration | null>(null)
  
  // 计算统计数据
  const stats = useMemo(() => {
    const totalIntegrations = HIE_INTEGRATIONS.length
    const onlineIntegrations = HIE_INTEGRATIONS.filter(f => f.status === '在线').length
    const totalTransactions = HIE_INTEGRATIONS.reduce((sum, f) => sum + f.transactionCount, 0)
    const avgResponseTime = Math.round(
      HIE_INTEGRATIONS.filter(f => f.responseTime > 0)
        .reduce((sum, f) => sum + f.responseTime, 0) / 
      HIE_INTEGRATIONS.filter(f => f.responseTime > 0).length
    )
    
    const recentLogs = HIE_TRANSACTION_LOGS.slice(0, 100)
    const successRate = ((recentLogs.filter(l => l.status === '成功').length / recentLogs.length) * 100).toFixed(1)
    const todayTransactions = HIE_TRANSACTION_LOGS.filter(l => l.timestamp.startsWith('2026-05-27')).length
    
    return {
      totalIntegrations,
      onlineIntegrations,
      totalTransactions,
      avgResponseTime,
      successRate,
      todayTransactions,
    }
  }, [])
  
  // 协议统计数据
  const protocolStats = useMemo((): ProtocolStat[] => {
    const protocols = ['HL7v2', 'FHIR', 'CDA', 'DICOM', 'XDS', 'PIX', 'PDQ']
    return protocols.map(p => {
      const logs = HIE_TRANSACTION_LOGS.filter(l => l.documentType === p)
      return {
        name: p,
        sent: logs.filter(l => l.source.includes('市') || l.source.includes('省')).length,
        received: logs.filter(l => l.target.includes('市') || l.target.includes('省')).length,
        failed: logs.filter(l => l.status === '失败').length,
      }
    })
  }, [])
  
  // 消息队列数据
  const queueData: QueueMessage[] = useMemo(() => [
    { id: 'Q001', queueName: 'HL7入站队列', priority: '高', status: '处理中', createdAt: '2026-05-27 14:30:00', processedAt: undefined, retryCount: 0 },
    { id: 'Q002', queueName: 'FHIR出站队列', priority: '高', status: '等待中', createdAt: '2026-05-27 14:31:00', processedAt: undefined, retryCount: 0 },
    { id: 'Q003', queueName: 'CDA文档队列', priority: '中', status: '已完成', createdAt: '2026-05-27 14:28:00', processedAt: '2026-05-27 14:28:45', retryCount: 0 },
    { id: 'Q004', queueName: 'DICOM影像队列', priority: '高', status: '处理中', createdAt: '2026-05-27 14:32:00', processedAt: undefined, retryCount: 0 },
    { id: 'Q005', queueName: 'XDS注册队列', priority: '中', status: '等待中', createdAt: '2026-05-27 14:30:30', processedAt: undefined, retryCount: 2 },
    { id: 'Q006', queueName: 'PIX查询队列', priority: '低', status: '已完成', createdAt: '2026-05-27 14:29:00', processedAt: '2026-05-27 14:29:15', retryCount: 0 },
    { id: 'Q007', queueName: 'PDQ患者队列', priority: '中', status: '失败', createdAt: '2026-05-27 14:25:00', processedAt: undefined, retryCount: 3 },
  ], [])
  
  // 系统健康数据
  const healthData = useMemo(() => [
    { component: '消息网关', status: '正常', uptime: '99.9%', responseTime: 45, load: 35 },
    { component: '协议转换器', status: '正常', uptime: '99.7%', responseTime: 78, load: 52 },
    { component: '文档存储服务', status: '正常', uptime: '99.95%', responseTime: 32, load: 28 },
    { component: '患者主索引服务', status: '正常', uptime: '99.8%', responseTime: 55, load: 42 },
    { component: '影像存储服务', status: '正常', uptime: '99.6%', responseTime: 120, load: 65 },
    { component: '认证服务', status: '正常', uptime: '99.99%', responseTime: 25, load: 18 },
  ], [])
  
  // 过滤设施
  const filteredFacilities = useMemo(() => {
    if (!searchKeyword) return HIE_INTEGRATIONS
    return HIE_INTEGRATIONS.filter(f =>
      f.name.includes(searchKeyword) ||
      f.region.includes(searchKeyword) ||
      f.type.includes(searchKeyword)
    )
  }, [searchKeyword])
  
  // 最近交易
  const recentTransactions = useMemo(() => {
    return HIE_TRANSACTION_LOGS.slice(0, 30)
  }, [])
  
  // 今日交易趋势
  const todayTrend = useMemo(() => {
    const hours = Array.from({ length: 14 }, (_, i) => `${i + 8}:00`)
    return hours.map(h => ({
      hour: h,
      count: Math.floor(Math.random() * 50) + 20,
      success: Math.floor(Math.random() * 45) + 18,
      failed: Math.floor(Math.random() * 5),
    }))
  }, [])
  
  return (
    <div style={{ padding: 24, background: '#f1f5f9', minHeight: '100vh' }}>
      {/* 顶部标题 */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e40af', margin: 0 }}>🏥 HIE互联互通平台</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Health Information Exchange - 区域医疗信息互联互通</p>
      </div>
      
      {/* 标签页 */}
      <div style={{
        display: 'flex',
        gap: 4,
        borderBottom: '2px solid #e2e8f0',
        marginBottom: 20,
        background: '#fff',
        borderRadius: '10px 10px 0 0',
        padding: '0 16px',
      }}>
        <TabButton tabKey="dashboard" label="总览" icon={<BarChart2 size={16} />} isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <TabButton tabKey="facilities" label="机构" icon={<Network size={16} />} isActive={activeTab === 'facilities'} onClick={() => setActiveTab('facilities')} badge={HIE_INTEGRATIONS.length} />
        <TabButton tabKey="documents" label="文档" icon={<FileText size={16} />} isActive={activeTab === 'documents'} onClick={() => setActiveTab('documents')} />
        <TabButton tabKey="transactions" label="交易" icon={<Activity size={16} />} isActive={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} badge={HIE_TRANSACTION_LOGS.length} />
        <TabButton tabKey="queue" label="队列" icon={<Inbox size={16} />} isActive={activeTab === 'queue'} onClick={() => setActiveTab('queue')} />
        <TabButton tabKey="health" label="健康" icon={<Shield size={16} />} isActive={activeTab === 'health'} onClick={() => setActiveTab('health')} />
      </div>
      
      {/* 内容区域 */}
      <div style={{ background: '#fff', borderRadius: '0 0 10px 10px', padding: 20 }}>
        {/* ===== 总览仪表盘 ===== */}
        {activeTab === 'dashboard' && (
          <div>
            {/* 统计卡片 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              <StatCard
                label="接入机构"
                value={stats.totalIntegrations}
                icon={<Network size={24} />}
                color={COLORS.primary}
                bgColor="#dbeafe"
                trend={`在线 ${stats.onlineIntegrations}`}
              />
              <StatCard
                label="累计交易"
                value={`${(stats.totalTransactions / 10000).toFixed(0)}万`}
                icon={<Activity size={24} />}
                color={COLORS.success}
                bgColor="#dcfce7"
                trend="+12.5%"
              />
              <StatCard
                label="今日交易"
                value={stats.todayTransactions}
                icon={<TrendingUp size={24} />}
                color={COLORS.secondary}
                bgColor="#cffafe"
              />
              <StatCard
                label="成功率"
                value={`${stats.successRate}%`}
                icon={<CheckCircle size={24} />}
                color={stats.successRate >= '98' ? COLORS.success : COLORS.warning}
                bgColor={stats.successRate >= '98' ? COLORS.successLight : COLORS.warningLight}
              />
            </div>
            
            {/* 交易趋势和协议分布 */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
              {/* 今日交易趋势 */}
              <div style={{
                background: '#f8fafc',
                borderRadius: 10,
                padding: 16,
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>
                  📊 今日交易趋势
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={todayTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="count" name="交易量" fill="#1e40af" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* 协议分布饼图 */}
              <div style={{
                background: '#f8fafc',
                borderRadius: 10,
                padding: 16,
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>
                  📈 协议分布
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'HL7v2', value: 35 },
                        { name: 'FHIR', value: 28 },
                        { name: 'CDA', value: 18 },
                        { name: 'DICOM', value: 12 },
                        { name: '其他', value: 7 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                    >
                      {['#1e40af', '#3b82f6', '#0891b2', '#16a34a', '#94a3b8'].map((color, idx) => (
                        <Cell key={idx} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
                  {['#1e40af:Hl7', '#3b82f6:FHIR', '#0891b2:CDA', '#16a34a:DICOM', '#94a3b8:其他'].map(item => {
                    const [color, label] = item.split(':')
                    return (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                        <span style={{ fontSize: 10, color: '#64748b' }}>{label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            
            {/* 最新交易和机构状态 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* 最新交易 */}
              <div style={{
                background: '#f8fafc',
                borderRadius: 10,
                padding: 16,
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>⚡ 最新交易</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>实时更新</span>
                </div>
                <TransactionTable logs={recentTransactions.slice(0, 8)} maxRows={8} />
              </div>
              
              {/* 机构状态 */}
              <div style={{
                background: '#f8fafc',
                borderRadius: 10,
                padding: 16,
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>
                  🏥 机构连接状态
                </div>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {HIE_INTEGRATIONS.slice(0, 10).map(f => (
                    <div key={f.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '8px 0',
                      borderBottom: '1px solid #e2e8f0',
                    }}>
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: f.status === '在线' ? COLORS.success : f.status === '离线' ? COLORS.danger : COLORS.warning,
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>{f.name}</div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>{f.region}</div>
                      </div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>{f.responseTime > 0 ? `${f.responseTime}ms` : '-'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* ===== 机构网络 ===== */}
        {activeTab === 'facilities' && (
          <div>
            {/* 搜索和统计 */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="搜索机构名称、区域..."
                  value={searchKeyword}
                  onChange={e => setSearchKeyword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{
                  padding: '8px 16px',
                  background: '#dbeafe',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.success }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.primary }}>在线 {HIE_INTEGRATIONS.filter(f => f.status === '在线').length}</span>
                </div>
                <div style={{
                  padding: '8px 16px',
                  background: '#f1f5f9',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.danger }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>离线 {HIE_INTEGRATIONS.filter(f => f.status === '离线').length}</span>
                </div>
                <div style={{
                  padding: '8px 16px',
                  background: '#fef3c7',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.warning }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>告警 {HIE_INTEGRATIONS.filter(f => f.status === '告警' || f.status === '维护中').length}</span>
                </div>
              </div>
            </div>
            
            {/* 机构卡片网格 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {filteredFacilities.map(f => (
                <FacilityCard
                  key={f.id}
                  facility={f}
                  onClick={() => setSelectedFacility(f)}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* ===== 文档交换 ===== */}
        {activeTab === 'documents' && (
          <div>
            {/* 文档类型统计 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { type: 'CDA', count: 34567, desc: '临床文档架构' },
                { type: 'HL7', count: 89654, desc: 'HL7消息' },
                { type: 'FHIR', count: 56789, desc: '快速医疗互操作性' },
                { type: 'DICOM', count: 12345, desc: '医学影像' },
                { type: 'XDS', count: 8765, desc: '跨企业文档共享' },
              ].map(doc => (
                <div key={doc.type} style={{
                  background: '#eff6ff',
                  borderRadius: 10,
                  padding: 16,
                  textAlign: 'center',
                  border: '1px solid #bfdbfe',
                }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.primary }}>{doc.count}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary, marginTop: 4 }}>{doc.type}</div>
                  <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 4 }}>{doc.desc}</div>
                </div>
              ))}
            </div>
            
            {/* 文档交换记录表 */}
            <div style={{
              background: '#f8fafc',
              borderRadius: 10,
              padding: 16,
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>
                📄 文档交换记录
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#e2e8f0' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>文档ID</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>类型</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>源</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>目标</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>患者</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>时间</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {HIE_TRANSACTION_LOGS.slice(0, 15).map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: COLORS.primary }}>{log.messageId.slice(0, 20)}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          padding: '2px 6px',
                          background: '#eff6ff',
                          color: COLORS.primary,
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 600,
                        }}>
                          {log.documentType}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px' }}>{log.source.slice(0, 8)}</td>
                      <td style={{ padding: '8px 12px' }}>{log.target.slice(0, 8)}</td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{log.patientId || '-'}</td>
                      <td style={{ padding: '8px 12px', color: '#64748b' }}>{log.timestamp.slice(5, 16)}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: 10,
                          fontSize: 10,
                          fontWeight: 600,
                          background: getStatusBgColor(log.status),
                          color: getStatusColor(log.status),
                        }}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* ===== 交易日志 ===== */}
        {activeTab === 'transactions' && (
          <div>
            {/* 交易统计 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 24 }}>
              <StatCard label="总交易数" value={HIE_TRANSACTION_LOGS.length} icon={<Activity size={20} />} color={COLORS.primary} bgColor="#dbeafe" />
              <StatCard label="成功" value={HIE_TRANSACTION_LOGS.filter(l => l.status === '成功').length} icon={<CheckCircle size={20} />} color={COLORS.success} bgColor="#dcfce7" />
              <StatCard label="失败" value={HIE_TRANSACTION_LOGS.filter(l => l.status === '失败').length} icon={<XCircle size={20} />} color={COLORS.danger} bgColor="#fee2e2" />
              <StatCard label="处理中" value={HIE_TRANSACTION_LOGS.filter(l => l.status === '处理中').length} icon={<Clock size={20} />} color={COLORS.primaryLight} bgColor="#dbeafe" />
              <StatCard label="待处理" value={HIE_TRANSACTION_LOGS.filter(l => l.status === '待处理').length} icon={<AlertCircle size={20} />} color={COLORS.warning} bgColor="#fef3c7" />
              <StatCard label="超时" value={HIE_TRANSACTION_LOGS.filter(l => l.status === '超时').length} icon={<Clock size={20} />} color="#94a3b8" bgColor="#f1f5f9" />
            </div>
            
            {/* 协议统计图表 */}
            <div style={{
              background: '#f8fafc',
              borderRadius: 10,
              padding: 16,
              border: '1px solid #e2e8f0',
              marginBottom: 24,
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>
                📊 协议交易统计
              </div>
              <ProtocolChart data={protocolStats} />
            </div>
            
            {/* 交易日志表 */}
            <div style={{
              background: '#f8fafc',
              borderRadius: 10,
              padding: 16,
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>
                📋 交易明细
              </div>
              <TransactionTable logs={HIE_TRANSACTION_LOGS} maxRows={20} />
              <div style={{ textAlign: 'center', padding: 12, color: '#64748b', fontSize: 12 }}>
                显示前20条，共 {HIE_TRANSACTION_LOGS.length} 条记录
              </div>
            </div>
          </div>
        )}
        
        {/* ===== 消息队列 ===== */}
        {activeTab === 'queue' && (
          <div>
            {/* 队列概览 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              <StatCard label="总队列数" value={queueData.length} icon={<Inbox size={20} />} color={COLORS.primary} bgColor="#dbeafe" />
              <StatCard label="处理中" value={queueData.filter(q => q.status === '处理中').length} icon={<RefreshCw size={20} />} color={COLORS.secondary} bgColor="#cffafe" />
              <StatCard label="等待中" value={queueData.filter(q => q.status === '等待中').length} icon={<Clock size={20} />} color={COLORS.warning} bgColor="#fef3c7" />
              <StatCard label="失败" value={queueData.filter(q => q.status === '失败').length} icon={<AlertCircle size={20} />} color={COLORS.danger} bgColor="#fee2e2" />
            </div>
            
            {/* 队列列表 */}
            <div style={{
              background: '#f8fafc',
              borderRadius: 10,
              padding: 16,
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>
                📬 消息队列详情
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#e2e8f0' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>队列名称</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>优先级</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>状态</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>创建时间</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>处理时间</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>重试次数</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {queueData.map(q => (
                    <tr key={q.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: COLORS.text }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <MessageSquare size={14} color={COLORS.primary} />
                          {q.queueName}
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: 10,
                          fontSize: 10,
                          fontWeight: 600,
                          background: q.priority === '高' ? '#fee2e2' : q.priority === '中' ? '#fef3c7' : '#f1f5f9',
                          color: q.priority === '高' ? COLORS.danger : q.priority === '中' ? COLORS.warning : '#64748b',
                        }}>
                          {q.priority}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: 10,
                          fontSize: 10,
                          fontWeight: 600,
                          background: getStatusBgColor(q.status),
                          color: getStatusColor(q.status),
                        }}>
                          {q.status}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#64748b' }}>{q.createdAt.slice(5, 16)}</td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#64748b' }}>{q.processedAt ? q.processedAt.slice(5, 16) : '-'}</td>
                      <td style={{ padding: '8px 12px', color: q.retryCount > 0 ? COLORS.danger : COLORS.text }}>{q.retryCount > 0 ? `${q.retryCount}次` : '-'}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {q.status === '等待中' && (
                            <button style={{ padding: '4px 8px', background: COLORS.primary, color: '#fff', border: 'none', borderRadius: 4, fontSize: 10, cursor: 'pointer' }}>
                              处理
                            </button>
                          )}
                          {q.status === '失败' && (
                            <button style={{ padding: '4px 8px', background: COLORS.warning, color: '#fff', border: 'none', borderRadius: 4, fontSize: 10, cursor: 'pointer' }}>
                              重试
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* ===== 系统健康 ===== */}
        {activeTab === 'health' && (
          <div>
            {/* 健康概览 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              <StatCard label="系统状态" value="正常" icon={<Shield size={20} />} color={COLORS.success} bgColor="#dcfce7" />
              <StatCard label="平均响应" value={`${stats.avgResponseTime}ms`} icon={<Activity size={20} />} color={COLORS.primary} bgColor="#dbeafe" />
              <StatCard label="系统可用性" value="99.8%" icon={<CheckCircle size={20} />} color={COLORS.success} bgColor="#dcfce7" />
              <StatCard label="活跃连接" value={stats.onlineIntegrations} icon={<Link2 size={20} />} color={COLORS.secondary} bgColor="#cffafe" />
            </div>
            
            {/* 组件健康列表 */}
            <div style={{
              background: '#f8fafc',
              borderRadius: 10,
              padding: 16,
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>
                🔧 系统组件健康状态
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#e2e8f0' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>组件名称</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>状态</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>运行时间</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>响应时间</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>负载</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {healthData.map((h, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: COLORS.text }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Server size={14} color={COLORS.primary} />
                          {h.component}
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: h.status === '正常' ? COLORS.success : COLORS.danger }} />
                          <span style={{ color: h.status === '正常' ? COLORS.success : COLORS.danger, fontWeight: 600 }}>{h.status}</span>
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px', color: COLORS.success, fontWeight: 600 }}>{h.uptime}</td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: h.responseTime > 100 ? COLORS.warning : COLORS.text }}>{h.responseTime}ms</td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{
                          width: 60,
                          height: 6,
                          background: '#e2e8f0',
                          borderRadius: 3,
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${h.load}%`,
                            height: '100%',
                            background: h.load > 80 ? COLORS.danger : h.load > 60 ? COLORS.warning : COLORS.success,
                            borderRadius: 3,
                          }} />
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <button style={{
                          padding: '4px 8px',
                          background: '#f1f5f9',
                          border: 'none',
                          borderRadius: 4,
                          fontSize: 10,
                          cursor: 'pointer',
                          color: '#64748b',
                        }}>
                          详情
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}