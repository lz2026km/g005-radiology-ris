// @ts-nocheck
// G005 放射科RIS系统 - 放射物资管理页面 v1.0.0（对标岱嘉/卡易）
import { useState } from 'react'
import {
  Package, Boxes, AlertTriangle, CheckCircle, Clock, Search,
  Plus, X, Edit2, Trash2, RefreshCw, Filter, Calendar,
  User, Truck, FileText, ChevronDown, ChevronUp, Eye
} from 'lucide-react'

// ============================================================
// 样式常量
// ============================================================
const C = {
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  primaryLight: '#60a5fa',
  bg: '#0f172a',
  bgLight: '#1e293b',
  card: '#1e293b',
  border: '#334155',
  white: '#ffffff',
  textLight: '#94a3b8',
  textMuted: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  yellow: '#eab308',
}

// ============================================================
// 类型定义
// ============================================================
type TabType = 'inventory' | 'inbound' | 'outbound' | 'expiry' | 'suppliers'
type StockStatus = 'normal' | 'warning' | 'expired'

interface SupplyItem {
  id: string
  name: string
  stock: number
  unit: string
  spec: string
  expiryDate: string
  status: StockStatus
  category: string
  minStock: number
  batchNo: string
}

interface InboundRecord {
  id: string
  date: string
  name: string
  quantity: number
  batchNo: string
  expiryDate: string
  supplier: string
  operator: string
}

interface OutboundRecord {
  id: string
  department: string
  name: string
  quantity: number
  date: string
  operator: string
  purpose: string
}

interface ExpiryWarning {
  id: string
  name: string
  batchNo: string
  expiryDate: string
  daysLeft: number
  stock: number
  unit: string
  status: 'critical' | 'warning'
}

interface Supplier {
  id: string
  name: string
  contact: string
  phone: string
  address: string
  categories: string[]
  rating: number
}

// ============================================================
// 模拟数据
// ============================================================

const INITIAL_SUPPLIES: SupplyItem[] = [
  { id: 'S001', name: '碘佛醇注射液', stock: 85, unit: '瓶', spec: '100ml:35g(I)', expiryDate: '2026-05-15', status: 'normal', category: '造影剂', minStock: 30, batchNo: 'YFH20260401' },
  { id: 'S002', name: '碘克沙醇注射液', stock: 42, unit: '瓶', spec: '100ml', expiryDate: '2026-05-20', status: 'normal', category: '对比剂', minStock: 25, batchNo: 'IKSH20260402' },
  { id: 'S003', name: '欧乃影造影剂', stock: 120, unit: '支', spec: '20ml/支', expiryDate: '2026-06-10', status: 'normal', category: '造影剂', minStock: 50, batchNo: 'ONY20260403' },
  { id: 'S004', name: '钆特酸葡胺注射液', stock: 28, unit: '支', spec: '15ml', expiryDate: '2026-05-25', status: 'normal', category: '对比剂', minStock: 20, batchNo: 'GTS20260404' },
  { id: 'S005', name: 'CT高压注射器针筒', stock: 65, unit: '套', spec: '200ml双筒', expiryDate: '2027-04-15', status: 'normal', category: '注射耗材', minStock: 30, batchNo: 'CT20260405' },
  { id: 'S006', name: 'MR高压注射器针筒', stock: 38, unit: '套', spec: '65ml单筒', expiryDate: '2027-03-20', status: 'normal', category: '注射耗材', minStock: 20, batchNo: 'MR20260406' },
  { id: 'S007', name: 'GE DR胶片', stock: 450, unit: '张', spec: '35cm×43cm(14"×17")', expiryDate: '2028-12-31', status: 'normal', category: '胶片', minStock: 200, batchNo: 'GE20260407' },
  { id: 'S008', name: '柯尼卡CR胶片', stock: 380, unit: '张', spec: '35cm×43cm(14"×17")', expiryDate: '2028-12-31', status: 'normal', category: '胶片', minStock: 200, batchNo: 'KNK20260408' },
  { id: 'S009', name: '一次性注射器20ml', stock: 1500, unit: '支', spec: '20ml', expiryDate: '2027-06-30', status: 'normal', category: '注射耗材', minStock: 500, batchNo: 'SY20260409' },
  { id: 'S010', name: '静脉留置针22G', stock: 95, unit: '支', spec: '22G', expiryDate: '2026-04-28', status: 'expired', category: '导管', minStock: 50, batchNo: 'JX20260410' },
  { id: 'S011', name: 'CT增强用高压注射器', stock: 8, unit: '台', spec: '双筒型', expiryDate: '2029-12-31', status: 'warning', category: '设备', minStock: 2, batchNo: 'CTSF20260411' },
  { id: 'S012', name: '一次性使用造影导管', stock: 56, unit: '根', spec: '5F/6F', expiryDate: '2026-05-08', status: 'warning', category: '导管', minStock: 30, batchNo: 'ZY20260412' },
]

const INITIAL_INBOUND: InboundRecord[] = [
  { id: 'IN001', date: '2026-05-02 09:30', name: '碘佛醇注射液', quantity: 50, batchNo: 'YFH20260501', expiryDate: '2026-11-15', supplier: '恒瑞医药', operator: '张华' },
  { id: 'IN002', date: '2026-05-02 10:15', name: '碘克沙醇注射液', quantity: 30, batchNo: 'IKSH20260502', expiryDate: '2026-12-20', supplier: '拜耳医药', operator: '李娜' },
  { id: 'IN003', date: '2026-05-01 14:20', name: 'CT高压注射器针筒', quantity: 20, batchNo: 'CT20260503', expiryDate: '2028-04-15', supplier: '拜耳医药', operator: '王强' },
  { id: 'IN004', date: '2026-05-01 15:00', name: 'GE DR胶片', quantity: 200, batchNo: 'GE20260504', expiryDate: '2029-12-31', supplier: 'GE医疗', operator: '张华' },
  { id: 'IN005', date: '2026-04-30 09:00', name: '一次性注射器20ml', quantity: 1000, batchNo: 'SY20260430', expiryDate: '2028-06-30', supplier: '山东威高', operator: '李娜' },
  { id: 'IN006', date: '2026-04-29 11:30', name: '欧乃影造影剂', quantity: 100, batchNo: 'ONY20260429', expiryDate: '2026-10-10', supplier: 'GE医疗', operator: '王强' },
]

const INITIAL_OUTBOUND: OutboundRecord[] = [
  { id: 'OUT001', department: 'CT室', name: '碘佛醇注射液', quantity: 15, date: '2026-05-02', operator: '赵医生', purpose: 'CT增强检查' },
  { id: 'OUT002', department: 'CT室', name: 'CT高压注射器针筒', quantity: 8, date: '2026-05-02', operator: '钱护士', purpose: 'CT增强检查' },
  { id: 'OUT003', department: 'MR室', name: '钆特酸葡胺注射液', quantity: 6, date: '2026-05-02', operator: '孙医生', purpose: 'MR增强检查' },
  { id: 'OUT004', department: 'DR室', name: 'GE DR胶片', quantity: 50, date: '2026-05-01', operator: '周技师', purpose: '常规X线摄影' },
  { id: 'OUT005', department: 'CT室', name: '碘克沙醇注射液', quantity: 8, date: '2026-05-01', operator: '赵医生', purpose: 'CT血管造影' },
  { id: 'OUT006', department: '导管室', name: '一次性使用造影导管', quantity: 4, date: '2026-04-30', operator: '吴医生', purpose: '介入手术' },
]

const INITIAL_EXPIRY: ExpiryWarning[] = [
  { id: 'E001', name: '静脉留置针22G', batchNo: 'JX20260410', expiryDate: '2026-04-28', daysLeft: -5, stock: 95, unit: '支', status: 'critical' },
  { id: 'E002', name: '一次性使用造影导管', batchNo: 'ZY20260412', expiryDate: '2026-05-08', daysLeft: 5, stock: 56, unit: '根', status: 'critical' },
  { id: 'E003', name: '碘佛醇注射液', batchNo: 'YFH20260401', expiryDate: '2026-05-15', daysLeft: 12, stock: 85, unit: '瓶', status: 'critical' },
  { id: 'E004', name: '碘克沙醇注射液', batchNo: 'IKSH20260402', expiryDate: '2026-05-20', daysLeft: 17, stock: 42, unit: '瓶', status: 'warning' },
  { id: 'E005', name: '钆特酸葡胺注射液', batchNo: 'GTS20260404', expiryDate: '2026-05-25', daysLeft: 22, stock: 28, unit: '支', status: 'warning' },
  { id: 'E006', name: '欧乃影造影剂', batchNo: 'ONY20260403', expiryDate: '2026-06-10', daysLeft: 38, stock: 120, unit: '支', status: 'warning' },
  { id: 'E007', name: 'CT增强用高压注射器', batchNo: 'CTSF20260411', expiryDate: '2026-06-15', daysLeft: 43, stock: 8, unit: '台', status: 'warning' },
]

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'SUP001', name: 'GE医疗', contact: '王经理', phone: '010-12345678', address: '北京市经济技术开发区', categories: ['胶片', '造影剂', '对比剂'], rating: 4.8 },
  { id: 'SUP002', name: '恒瑞医药', contact: '张经理', phone: '0518-1234567', address: '江苏省连云港市', categories: ['造影剂', '对比剂'], rating: 4.7 },
  { id: 'SUP003', name: '拜耳医药', contact: '刘经理', phone: '010-98765432', address: '北京市朝阳区', categories: ['对比剂', '注射耗材'], rating: 4.9 },
  { id: 'SUP004', name: '山东威高', contact: '赵经理', phone: '0631-1234567', address: '山东省威海市', categories: ['注射耗材', '导管'], rating: 4.6 },
  { id: 'SUP005', name: '柯尼卡美能达', contact: '李经理', phone: '021-87654321', address: '上海市浦东新区', categories: ['胶片'], rating: 4.5 },
  { id: 'SUP006', name: '贝朗医疗', contact: '陈经理', phone: '021-65432109', address: '上海市闵行区', categories: ['导管', '注射耗材'], rating: 4.4 },
]

// ============================================================
// 辅助函数
// ============================================================
const getToday = () => new Date().toISOString().split('T')[0]

const getDaysUntil = (dateStr: string) => {
  const today = new Date()
  const target = new Date(dateStr)
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const getExpiryStatus = (daysLeft: number): 'critical' | 'warning' | 'normal' => {
  if (daysLeft <= 0) return 'critical'
  if (daysLeft <= 30) return 'critical'
  if (daysLeft <= 90) return 'warning'
  return 'normal'
}

// ============================================================
// 组件：看板卡片
// ============================================================
const DashboardCard = ({ title, value, icon: Icon, color, subtitle }: {
  title: string
  value: string | number
  icon: any
  color: string
  subtitle?: string
}) => (
  <div style={{
    background: C.card,
    borderRadius: '12px',
    padding: '20px 24px',
    border: `1px solid ${C.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1,
    minWidth: '200px',
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      background: `${color}20`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Icon size={24} color={color} />
    </div>
    <div>
      <div style={{ color: C.textLight, fontSize: '13px', marginBottom: '4px' }}>{title}</div>
      <div style={{ color: C.white, fontSize: '28px', fontWeight: '600' }}>{value}</div>
      {subtitle && <div style={{ color: C.textMuted, fontSize: '12px', marginTop: '4px' }}>{subtitle}</div>}
    </div>
  </div>
)

// ============================================================
// 组件：标签页按钮
// ============================================================
const TabButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    style={{
      padding: '10px 20px',
      background: active ? C.primary : 'transparent',
      color: active ? C.white : C.textLight,
      border: `1px solid ${active ? C.primary : C.border}`,
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s',
    }}
    onMouseEnter={(e) => {
      if (!active) {
        e.currentTarget.style.background = C.bgLight
        e.currentTarget.style.borderColor = C.primaryLight
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.borderColor = C.border
      }
    }}
  >
    {children}
  </button>
)

// ============================================================
// 组件：表格
// ============================================================
const Table = ({ columns, data, onRowClick }: {
  columns: { key: string; label: string; width?: string }[]
  data: any[]
  onRowClick?: (row: any) => void
}) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: `2px solid ${C.border}` }}>
          {columns.map(col => (
            <th key={col.key} style={{
              padding: '12px 16px',
              textAlign: 'left',
              color: C.textLight,
              fontSize: '13px',
              fontWeight: '500',
              width: col.width || 'auto',
              whiteSpace: 'nowrap',
            }}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr
            key={row.id || idx}
            onClick={() => onRowClick?.(row)}
            style={{
              borderBottom: `1px solid ${C.border}`,
              cursor: onRowClick ? 'pointer' : 'default',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.bgLight }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            {columns.map(col => (
              <td key={col.key} style={{
                padding: '12px 16px',
                color: C.white,
                fontSize: '14px',
              }}>
                {row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

// ============================================================
// 组件：入库表单弹窗
// ============================================================
const InboundFormModal = ({ visible, onClose, onSubmit }: {
  visible: boolean
  onClose: () => void
  onSubmit: (data: Partial<InboundRecord>) => void
}) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    batchNo: '',
    expiryDate: '',
    supplier: '',
    operator: '',
  })

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: C.card,
        borderRadius: '16px',
        padding: '24px',
        width: '500px',
        maxWidth: '90vw',
        border: `1px solid ${C.border}`,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: C.white, fontSize: '18px', margin: 0 }}>添加入库记录</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textLight }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ display: 'grid', gap: '16px' }}>
          {[
            { label: '物资名称', key: 'name', type: 'text' },
            { label: '入库数量', key: 'quantity', type: 'number' },
            { label: '批号', key: 'batchNo', type: 'text' },
            { label: '效期', key: 'expiryDate', type: 'date' },
            { label: '供应商', key: 'supplier', type: 'text' },
            { label: '操作人', key: 'operator', type: 'text' },
          ].map(field => (
            <div key={field.key}>
              <label style={{ display: 'block', color: C.textLight, fontSize: '13px', marginBottom: '6px' }}>
                {field.label}
              </label>
              <input
                type={field.type}
                value={formData[field.key as keyof typeof formData]}
                onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: '8px',
                  color: C.white,
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: `1px solid ${C.border}`,
              borderRadius: '8px',
              color: C.textLight,
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            取消
          </button>
          <button
            onClick={() => {
              onSubmit(formData)
              setFormData({ name: '', quantity: '', batchNo: '', expiryDate: '', supplier: '', operator: '' })
            }}
            style={{
              padding: '10px 20px',
              background: C.primary,
              border: 'none',
              borderRadius: '8px',
              color: C.white,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            确认入库
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 组件：状态标签
// ============================================================
const StatusBadge = ({ status }: { status: StockStatus | 'critical' | 'warning' }) => {
  const config: Record<string, { bg: string; color: string; text: string }> = {
    normal: { bg: '#22c55e20', color: '#22c55e', text: '正常' },
    warning: { bg: '#f59e0b20', color: '#f59e0b', text: '预警' },
    expired: { bg: '#ef444420', color: '#ef4444', text: '过期' },
    critical: { bg: '#ef444420', color: '#ef4444', text: '紧急' },
  }
  const { bg, color, text } = config[status] || config.normal
  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: '12px',
      background: bg,
      color: color,
      fontSize: '12px',
      fontWeight: '500',
    }}>
      {text}
    </span>
  )
}

// ============================================================
// 主页面组件
// ============================================================
export default function SuppliesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('inventory')
  const [supplies] = useState<SupplyItem[]>(INITIAL_SUPPLIES)
  const [inbound, setInbound] = useState<InboundRecord[]>(INITIAL_INBOUND)
  const [outbound] = useState<OutboundRecord[]>(INITIAL_OUTBOUND)
  const [expiryList] = useState<ExpiryWarning[]>(INITIAL_EXPIRY)
  const [suppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS)
  const [showInboundModal, setShowInboundModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // 计算看板数据
  const totalVarieties = supplies.length
  const expiryWarningCount = expiryList.filter(e => e.status === 'critical' || e.status === 'warning').length
  const weekConsumption = outbound.filter(o => {
    const outDate = new Date(o.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return outDate >= weekAgo
  }).reduce((sum, o) => sum + o.quantity, 0)
  const pendingReplenish = supplies.filter(s => s.stock <= s.minStock).length

  // 库存看板列
  const inventoryColumns = [
    { key: 'name', label: '物资名称' },
    { key: 'stock', label: '当前库存' },
    { key: 'unit', label: '单位' },
    { key: 'spec', label: '规格' },
    { key: 'expiryDate', label: '效期' },
    { key: 'status', label: '状态', width: '100px' },
  ]

  // 入库记录列
  const inboundColumns = [
    { key: 'date', label: '入库时间' },
    { key: 'name', label: '物资名称' },
    { key: 'quantity', label: '数量' },
    { key: 'batchNo', label: '批号' },
    { key: 'expiryDate', label: '效期' },
    { key: 'supplier', label: '供应商' },
  ]

  // 出库记录列
  const outboundColumns = [
    { key: 'department', label: '领用科室' },
    { key: 'name', label: '物资名称' },
    { key: 'quantity', label: '数量' },
    { key: 'date', label: '日期' },
    { key: 'operator', label: '经手人' },
    { key: 'purpose', label: '用途' },
  ]

  // 效期预警列
  const expiryColumns = [
    { key: 'name', label: '物资名称' },
    { key: 'batchNo', label: '批号' },
    { key: 'expiryDate', label: '效期' },
    { key: 'daysLeft', label: '剩余天数' },
    { key: 'stock', label: '库存' },
    { key: 'unit', label: '单位' },
    { key: 'status', label: '预警等级' },
  ]

  // 供应商列
  const supplierColumns = [
    { key: 'name', label: '供应商名称' },
    { key: 'contact', label: '联系人' },
    { key: 'phone', label: '联系电话' },
    { key: 'address', label: '地址' },
    { key: 'categories', label: '供应品类' },
    { key: 'rating', label: '评分' },
  ]

  const handleInboundSubmit = (data: Partial<InboundRecord>) => {
    const newRecord: InboundRecord = {
      id: `IN${String(inbound.length + 1).padStart(3, '0')}`,
      date: `${getToday()} ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`,
      name: data.name || '',
      quantity: Number(data.quantity) || 0,
      batchNo: data.batchNo || '',
      expiryDate: data.expiryDate || '',
      supplier: data.supplier || '',
      operator: data.operator || '',
    }
    setInbound(prev => [newRecord, ...prev])
    setShowInboundModal(false)
  }

  const getExpiryRowStyle = (daysLeft: number) => {
    if (daysLeft <= 30) return { background: '#ef444420' }
    if (daysLeft <= 90) return { background: '#f59e0b20' }
    return {}
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'inventory':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="搜索物资名称..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: '8px',
                    color: C.white,
                    fontSize: '14px',
                    width: '200px',
                  }}
                />
              </div>
              <div style={{ color: C.textMuted, fontSize: '13px' }}>
                共 {supplies.filter(s => s.name.includes(searchTerm)).length} 条记录
              </div>
            </div>
            <Table
              columns={inventoryColumns}
              data={supplies.filter(s => s.name.includes(searchTerm))}
            />
          </div>
        )

      case 'inbound':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button
                onClick={() => setShowInboundModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: C.primary,
                  border: 'none',
                  borderRadius: '8px',
                  color: C.white,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                <Plus size={16} /> 添加入库
              </button>
            </div>
            <Table columns={inboundColumns} data={inbound} />
            <InboundFormModal
              visible={showInboundModal}
              onClose={() => setShowInboundModal(false)}
              onSubmit={handleInboundSubmit}
            />
          </div>
        )

      case 'outbound':
        return <Table columns={outboundColumns} data={outbound} />

      case 'expiry':
        return (
          <div>
            <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#ef4444' }} />
                <span style={{ color: C.textLight, fontSize: '13px' }}>30天内（红色紧急）</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f59e0b' }} />
                <span style={{ color: C.textLight, fontSize: '13px' }}>90天内（黄色预警）</span>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                    {expiryColumns.map(col => (
                      <th key={col.key} style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        color: C.textLight,
                        fontSize: '13px',
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                      }}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {expiryList.map(row => (
                    <tr
                      key={row.id}
                      style={{
                        borderBottom: `1px solid ${C.border}`,
                        ...getExpiryRowStyle(row.daysLeft),
                      }}
                    >
                      <td style={{ padding: '12px 16px', color: C.white, fontSize: '14px' }}>{row.name}</td>
                      <td style={{ padding: '12px 16px', color: C.white, fontSize: '14px' }}>{row.batchNo}</td>
                      <td style={{ padding: '12px 16px', color: C.white, fontSize: '14px' }}>{row.expiryDate}</td>
                      <td style={{
                        padding: '12px 16px',
                        color: row.daysLeft <= 0 ? C.danger : row.daysLeft <= 30 ? C.danger : C.warning,
                        fontSize: '14px',
                        fontWeight: '600',
                      }}>
                        {row.daysLeft <= 0 ? `已过期${Math.abs(row.daysLeft)}天` : `${row.daysLeft}天`}
                      </td>
                      <td style={{ padding: '12px 16px', color: C.white, fontSize: '14px' }}>{row.stock}</td>
                      <td style={{ padding: '12px 16px', color: C.white, fontSize: '14px' }}>{row.unit}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'suppliers':
        return (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {supplierColumns.map(col => (
                    <th key={col.key} style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      color: C.textLight,
                      fontSize: '13px',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                    }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {suppliers.map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    style={{
                      borderBottom: `1px solid ${C.border}`,
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = C.bgLight}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', color: C.white, fontSize: '14px' }}>{row.name}</td>
                    <td style={{ padding: '12px 16px', color: C.white, fontSize: '14px' }}>{row.contact}</td>
                    <td style={{ padding: '12px 16px', color: C.white, fontSize: '14px' }}>{row.phone}</td>
                    <td style={{ padding: '12px 16px', color: C.textLight, fontSize: '14px' }}>{row.address}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {row.categories.map((cat, i) => (
                          <span key={i} style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: `${C.primary}30`,
                            color: C.primaryLight,
                            fontSize: '12px',
                          }}>
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: C.warning, fontSize: '14px', fontWeight: '500' }}>{row.rating}</span>
                        <span style={{ color: C.textMuted, fontSize: '12px' }}>/5.0</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      padding: '24px',
    }}>
      {/* 标题 */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          color: C.white,
          fontSize: '24px',
          fontWeight: '600',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <Package size={28} color={C.primary} />
          放射物资管理
        </h1>
        <p style={{ color: C.textMuted, fontSize: '14px', marginTop: '8px' }}>
          对标岱嘉/卡易系统 — 放射科医用耗材与物资的全流程管理
        </p>
      </div>

      {/* 看板卡片 */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <DashboardCard
          title="总库存品种"
          value={totalVarieties}
          icon={Boxes}
          color={C.primary}
          subtitle="种物资"
        />
        <DashboardCard
          title="效期预警数"
          value={expiryWarningCount}
          icon={AlertTriangle}
          color={C.danger}
          subtitle="需要处理"
        />
        <DashboardCard
          title="本周消耗"
          value={weekConsumption}
          icon={Package}
          color={C.warning}
          subtitle="件/支/台"
        />
        <DashboardCard
          title="待补充"
          value={pendingReplenish}
          icon={Clock}
          color={C.info}
          subtitle="库存不足"
        />
      </div>

      {/* 标签页切换 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        borderBottom: `1px solid ${C.border}`,
        paddingBottom: '16px',
        flexWrap: 'wrap',
      }}>
        <TabButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')}>
          库存看板
        </TabButton>
        <TabButton active={activeTab === 'inbound'} onClick={() => setActiveTab('inbound')}>
          入库管理
        </TabButton>
        <TabButton active={activeTab === 'outbound'} onClick={() => setActiveTab('outbound')}>
          出库记录
        </TabButton>
        <TabButton active={activeTab === 'expiry'} onClick={() => setActiveTab('expiry')}>
          效期预警
        </TabButton>
        <TabButton active={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')}>
          供应商
        </TabButton>
      </div>

      {/* 标签页内容 */}
      <div style={{
        background: C.card,
        borderRadius: '12px',
        padding: '20px',
        border: `1px solid ${C.border}`,
      }}>
        {renderTabContent()}
      </div>
    </div>
  )
}
