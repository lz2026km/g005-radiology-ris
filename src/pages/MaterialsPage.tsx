// @ts-nocheck
// G005 放射科RIS系统 - 物资耗材管理页面 v1.0.0
import { useState } from 'react'
import {
  Package, Boxes, AlertTriangle, CheckCircle, Clock, Search, Activity,
  Settings, TrendingUp, BarChart2, Calendar, User, Filter, ChevronUp,
  ChevronDown, RefreshCw, Plus, X, Check, Eye, DollarSign,
  BarChart as MatBarChart, PieChart as MatPieChart, TrendingDown, FileText, CreditCard, CalendarDays,
  Truck, ClipboardList, FileCheck, History, Download,
  Edit2, Trash2, ArrowDownUp, RefreshCcw, Send,
  CheckCheck, XCircle, ArrowRight, PackageCheck, PackageX
} from 'lucide-react'
import {
  BarChart as ChartBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart as RePieChart, Pie, Cell, Legend,
  AreaChart, Area
} from 'recharts'

// ============================================================
// 样式常量 - WIN10风格
// ============================================================
const C = {
  primary: '#1e40af',        // 深蓝主色
  primaryLight: '#3b82f6',   // 浅蓝
  primaryLighter: '#dbeafe', // 淡蓝背景
  accent: '#0891b2',         // 青色辅色
  accentLight: '#06b6d4',    // 浅青
  white: '#ffffff',          // 白色卡片
  bg: '#e8e8e8',             // 浅灰背景
  border: '#d1d5db',         // 边框色
  textDark: '#1f2937',       // 深色文字
  textMid: '#4b5563',        // 中色文字
  textLight: '#9ca3af',      // 浅色文字
  success: '#059669',        // 成功绿
  warning: '#d97706',        // 警告橙
  danger: '#dc2626',         // 危险红
  info: '#2563eb',           // 信息蓝
}

// 库存分类
export const MATERIAL_CATEGORIES = ['全部', '胶片', '造影剂', '注射器', '对比剂', '针筒', '导管', '其他耗材']

// 库存状态
const STOCK_STATUS = {
  NORMAL: 'normal',
  LOW: 'low',
  OUT: 'out'
}

// 预警阈值配置
const ALERT_THRESHOLDS: Record<string, number> = {
  '胶片': 100,
  '造影剂': 50,
  '注射器': 200,
  '对比剂': 30,
  '针筒': 500,
  '导管': 100,
  '其他耗材': 50
}

// ============================================================
// 模拟数据
// ============================================================

// 物资库存数据
const INITIAL_MATERIALS = [
  { id: 'M001', name: 'GE DR胶片', category: '胶片', spec: '35cm×43cm(14"×17")', unit: '张', stock: 450, minStock: 100, price: 12.5, supplier: 'GE医疗', lastIn: '2026-04-20', lastOut: '2026-05-01' },
  { id: 'M002', name: '柯尼卡CR胶片', category: '胶片', spec: '35cm×43cm(14"×17")', unit: '张', stock: 380, minStock: 100, price: 10.8, supplier: '柯尼卡美能达', lastIn: '2026-04-18', lastOut: '2026-05-01' },
  { id: 'M003', name: '欧乃影造影剂', category: '造影剂', spec: '20ml/支', unit: '支', stock: 120, minStock: 50, price: 85.0, supplier: 'GE医疗', lastIn: '2026-04-15', lastOut: '2026-04-30' },
  { id: 'M004', name: '碘佛醇注射液', category: '造影剂', spec: '100ml:35g(I)', unit: '瓶', stock: 85, minStock: 50, price: 220.0, supplier: '恒瑞医药', lastIn: '2026-04-22', lastOut: '2026-05-01' },
  { id: 'M005', name: '一次性注射器', category: '注射器', spec: '20ml', unit: '支', stock: 1500, minStock: 200, price: 1.8, supplier: '山东威高', lastIn: '2026-04-25', lastOut: '2026-05-01' },
  { id: 'M006', name: '一次性注射器', category: '注射器', spec: '50ml', unit: '支', stock: 320, minStock: 100, price: 3.2, supplier: '山东威高', lastIn: '2026-04-25', lastOut: '2026-04-29' },
  { id: 'M007', name: '碘克沙醇注射液', category: '对比剂', spec: '100ml', unit: '瓶', stock: 45, minStock: 30, price: 380.0, supplier: '拜耳医药', lastIn: '2026-04-10', lastOut: '2026-04-28' },
  { id: 'M008', name: '钆特酸葡胺注射液', category: '对比剂', spec: '15ml', unit: '支', stock: 28, minStock: 30, price: 450.0, supplier: 'GE医疗', lastIn: '2026-04-08', lastOut: '2026-04-25' },
  { id: 'M009', name: '一次性使用输液器', category: '导管', spec: '0.7×25mm', unit: '支', stock: 180, minStock: 100, price: 4.5, supplier: '贝朗医疗', lastIn: '2026-04-20', lastOut: '2026-05-01' },
  { id: 'M010', name: '静脉留置针', category: '导管', spec: '22G', unit: '支', stock: 95, minStock: 100, price: 18.0, supplier: 'BD医疗', lastIn: '2026-04-18', lastOut: '2026-04-30' },
  { id: 'M011', name: 'CT高压注射器针筒', category: '针筒', spec: '200ml双筒', unit: '套', stock: 65, minStock: 50, price: 120.0, supplier: '拜耳医药', lastIn: '2026-04-12', lastOut: '2026-04-27' },
  { id: 'M012', name: 'MR高压注射器针筒', category: '针筒', spec: '65ml单筒', unit: '套', stock: 42, minStock: 30, price: 95.0, supplier: '拜耳医药', lastIn: '2026-04-12', lastOut: '2026-04-25' },
]

// 供应商数据
const INITIAL_SUPPLIERS = [
  { id: 'S001', name: 'GE医疗', contact: '王经理', phone: '010-12345678', email: 'wang@ge.com', address: '北京市经济技术开发区', categories: ['胶片', '造影剂', '对比剂'], rating: 4.8 },
  { id: 'S002', name: '柯尼卡美能达', contact: '李经理', phone: '021-87654321', email: 'li@konica.com', address: '上海市浦东新区', categories: ['胶片'], rating: 4.5 },
  { id: 'S003', name: '恒瑞医药', contact: '张经理', phone: '0518-1234567', email: 'zhang@hengrui.com', address: '江苏省连云港市', categories: ['造影剂', '对比剂'], rating: 4.7 },
  { id: 'S004', name: '山东威高', contact: '赵经理', phone: '0631-1234567', email: 'zhao@weigao.com', address: '山东省威海市', categories: ['注射器', '针筒', '导管'], rating: 4.6 },
  { id: 'S005', name: '拜耳医药', contact: '刘经理', phone: '010-98765432', email: 'liu@bayer.com', address: '北京市朝阳区', categories: ['对比剂', '针筒'], rating: 4.9 },
  { id: 'S006', name: '贝朗医疗', contact: '陈经理', phone: '021-65432109', email: 'chen@bbraun.com', address: '上海市闵行区', categories: ['导管'], rating: 4.4 },
  { id: 'S007', name: 'BD医疗', contact: '周经理', phone: '010-34567890', email: 'zhou@bd.com', address: '北京市海淀区', categories: ['导管', '注射器'], rating: 4.7 },
]

// 入库记录
const INITIAL_IN_RECORDS = [
  { id: 'IN001', materialId: 'M001', materialName: 'GE DR胶片', spec: '35cm×43cm(14"×17")', quantity: 500, date: '2026-04-20', operator: '张三', supplier: 'GE医疗', note: '季度采购' },
  { id: 'IN002', materialId: 'M003', materialName: '欧乃影造影剂', spec: '20ml/支', quantity: 200, date: '2026-04-15', operator: '李四', supplier: 'GE医疗', note: '常规补货' },
  { id: 'IN003', materialId: 'M004', materialName: '碘佛醇注射液', spec: '100ml:35g(I)', quantity: 100, date: '2026-04-22', operator: '张三', supplier: '恒瑞医药', note: '月度采购' },
  { id: 'IN004', materialId: 'M005', materialName: '一次性注射器', spec: '20ml', quantity: 2000, date: '2026-04-25', operator: '王五', supplier: '山东威高', note: '大批量采购' },
  { id: 'IN005', materialId: 'M007', materialName: '碘克沙醇注射液', spec: '100ml', quantity: 80, date: '2026-04-10', operator: '李四', supplier: '拜耳医药', note: '季度采购' },
]

// 出库记录
const INITIAL_OUT_RECORDS = [
  { id: 'OUT001', materialId: 'M001', materialName: 'GE DR胶片', spec: '35cm×43cm(14"×17")', quantity: 50, date: '2026-05-01', department: 'CT室', applicant: '赵技师', useFor: 'CT检查' },
  { id: 'OUT002', materialId: 'M004', materialName: '碘佛醇注射液', spec: '100ml:35g(I)', quantity: 15, date: '2026-05-01', department: 'CT室', applicant: '钱技师', useFor: '冠脉CTA' },
  { id: 'OUT003', materialId: 'M005', materialName: '一次性注射器', spec: '20ml', quantity: 500, date: '2026-05-01', department: 'CT室', applicant: '孙技师', useFor: 'CT增强检查' },
  { id: 'OUT004', materialId: 'M003', materialName: '欧乃影造影剂', spec: '20ml/支', quantity: 30, date: '2026-04-30', department: 'MR室', applicant: '周技师', useFor: 'MR检查' },
  { id: 'OUT005', materialId: 'M001', materialName: 'GE DR胶片', spec: '35cm×43cm(14"×17")', quantity: 80, date: '2026-04-29', department: 'DR室', applicant: '吴技师', useFor: '胸片检查' },
  { id: 'OUT006', materialId: 'M008', materialName: '钆特酸葡胺注射液', spec: '15ml', quantity: 12, date: '2026-04-25', department: 'MR室', applicant: '郑技师', useFor: 'MR增强检查' },
]

// 采购申请
const INITIAL_PURCHASE_REQUESTS = [
  { id: 'PR001', materialId: 'M008', materialName: '钆特酸葡胺注射液', spec: '15ml', quantity: 50, estimatedCost: 22500, applicant: '李主任', department: 'MR室', date: '2026-04-28', status: 'pending', reason: '库存不足，低于最小库存量' },
  { id: 'PR002', materialId: 'M010', materialName: '静脉留置针', spec: '22G', quantity: 200, estimatedCost: 3600, applicant: '张护士', department: 'CT室', date: '2026-04-27', status: 'approved', reason: '日常消耗补充' },
  { id: 'PR003', materialId: 'M007', materialName: '碘克沙醇注射液', spec: '100ml', quantity: 60, estimatedCost: 22800, applicant: '王主任', department: '导管室', date: '2026-04-26', status: 'pending', reason: '库存偏低，需补充' },
  { id: 'PR004', materialId: 'M002', materialName: '柯尼卡CR胶片', spec: '35cm×43cm(14"×17")', quantity: 300, estimatedCost: 3240, applicant: '刘技师', department: 'CR室', date: '2026-04-25', status: 'completed', reason: '胶片库存不足' },
]

// 采购历史
const INITIAL_PURCHASE_HISTORY = [
  { id: 'PH001', materialId: 'M001', materialName: 'GE DR胶片', spec: '35cm×43cm(14"×17")', quantity: 500, actualCost: 6250, supplier: 'GE医疗', orderDate: '2026-04-15', receiveDate: '2026-04-20', status: 'completed', purchaser: '张三' },
  { id: 'PH002', materialId: 'M004', materialName: '碘佛醇注射液', spec: '100ml:35g(I)', quantity: 100, actualCost: 22000, supplier: '恒瑞医药', orderDate: '2026-04-18', receiveDate: '2026-04-22', status: 'completed', purchaser: '李四' },
  { id: 'PH003', materialId: 'M005', materialName: '一次性注射器', spec: '20ml', quantity: 2000, actualCost: 3600, supplier: '山东威高', orderDate: '2026-04-20', receiveDate: '2026-04-25', status: 'completed', purchaser: '王五' },
  { id: 'PH004', materialId: 'M007', materialName: '碘克沙醇注射液', spec: '100ml', quantity: 80, actualCost: 30400, supplier: '拜耳医药', orderDate: '2026-04-05', receiveDate: '2026-04-10', status: 'completed', purchaser: '张三' },
]

// 消耗统计数据 - 按检查项目
const CONSUMPTION_BY_EXAM = [
  { name: 'CT平扫', film: 120, contrast: 0, syringe: 0, catheter: 0, total: 1440 },
  { name: 'CT增强', film: 150, contrast: 180, syringe: 150, catheter: 30, total: 11910 },
  { name: 'MR平扫', film: 60, contrast: 0, syringe: 0, catheter: 0, total: 720 },
  { name: 'MR增强', film: 80, contrast: 120, syringe: 80, catheter: 20, total: 15880 },
  { name: 'DR胸片', film: 300, contrast: 0, syringe: 0, catheter: 0, total: 3600 },
  { name: 'DSA介入', film: 40, contrast: 200, syringe: 60, catheter: 100, total: 35680 },
]

// 月度消耗报表数据
const MONTHLY_CONSUMPTION = [
  { month: '2026-01', film: 3200, contrast: 850, syringe: 4200, catheter: 680, totalCost: 186500 },
  { month: '2026-02', film: 2800, contrast: 720, syringe: 3800, catheter: 590, totalCost: 165200 },
  { month: '2026-03', film: 3500, contrast: 920, syringe: 4500, catheter: 750, totalCost: 210800 },
  { month: '2026-04', film: 3800, contrast: 1050, syringe: 4800, catheter: 820, totalCost: 234500 },
]

// ============================================================
// 辅助函数
// ============================================================

// 获取库存状态
const getStockStatus = (stock: number, minStock: number, category: string): { status: string; color: string; label: string } => {
  const threshold = ALERT_THRESHOLDS[category] || minStock
  if (stock === 0) return { status: STOCK_STATUS.OUT, color: C.danger, label: '缺货' }
  if (stock <= threshold * 0.5) return { status: STOCK_STATUS.LOW, color: C.warning, label: '库存紧张' }
  return { status: STOCK_STATUS.NORMAL, color: C.success, label: '正常' }
}

// 格式化金额
const formatCurrency = (amount: number): string => {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ============================================================
// 子组件
// ============================================================

// Tab标签组件
interface TabItem {
  key: string
  label: string
  icon: React.ReactNode
}

const TabNav = ({ tabs, activeTab, onTabChange }: { tabs: TabItem[]; activeTab: string; onTabChange: (key: string) => void }) => (
  <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, background: C.white, padding: '0 16px' }}>
    {tabs.map(tab => (
      <button
        key={tab.key}
        onClick={() => onTabChange(tab.key)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '12px 20px',
          border: 'none', background: 'transparent', cursor: 'pointer',
          borderBottom: activeTab === tab.key ? `2px solid ${C.primary}` : '2px solid transparent',
          color: activeTab === tab.key ? C.primary : C.textMid,
          fontSize: 14, fontWeight: activeTab === tab.key ? 600 : 400, transition: 'all 0.2s'
        }}
      >
        {tab.icon} {tab.label}
      </button>
    ))}
  </div>
)

// 统计卡片组件
const StatCard = ({ title, value, subValue, icon, color }: {
  title: string; value: string; subValue?: string; icon: React.ReactNode; color: string
}) => (
  <div style={{
    background: C.white, borderRadius: 8, padding: 20, display: 'flex', alignItems: 'center',
    gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: `1px solid ${C.border}`
  }}>
    <div style={{ width: 48, height: 48, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 12, color: C.textLight, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: C.textDark }}>{value}</div>
      {subValue && <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>{subValue}</div>}
    </div>
  </div>
)

// 库存预警列表组件
const LowStockAlert = ({ materials }: { materials: typeof INITIAL_MATERIALS }) => {
  const lowStockItems = materials.filter(m => {
    const threshold = ALERT_THRESHOLDS[m.category] || m.minStock
    return m.stock <= threshold
  })

  if (lowStockItems.length === 0) {
    return (
      <div style={{ background: C.white, borderRadius: 8, padding: 20, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} color={C.success} /> 库存预警
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: '#f0fdf4', borderRadius: 6 }}>
          <CheckCircle size={18} color={C.success} />
          <span style={{ color: C.success, fontSize: 13 }}>所有物资库存充足</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: C.white, borderRadius: 8, padding: 20, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <AlertTriangle size={16} color={C.warning} /> 库存预警 ({lowStockItems.length}项)
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {lowStockItems.map(item => {
          const threshold = ALERT_THRESHOLDS[item.category] || item.minStock
          const stockRate = item.stock / threshold
          return (
            <div key={item.id} style={{ padding: 10, background: stockRate === 0 ? '#fef2f2' : '#fffbeb', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.textDark }}>{item.name}</div>
                <div style={{ fontSize: 11, color: C.textLight }}>{item.spec} · 当前库存{item.stock}{item.unit}</div>
              </div>
              <div style={{
                padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                background: stockRate === 0 ? C.danger : C.warning, color: C.white
              }}>
                {stockRate === 0 ? '缺货' : '库存紧张'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// 主组件
// ============================================================
export default function MaterialsPage() {
  // 当前选中tab
  const [activeTab, setActiveTab] = useState('inventory')

  // 搜索和筛选
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)

  // 物资库存数据
  const [materials, setMaterials] = useState(INITIAL_MATERIALS)

  // 入库弹窗
  const [showInModal, setShowInModal] = useState(false)
  const [inForm, setInForm] = useState({ materialId: '', quantity: '', date: new Date().toISOString().split('T')[0], operator: '', supplier: '', note: '' })

  // 出库弹窗
  const [showOutModal, setShowOutModal] = useState(false)
  const [outForm, setOutForm] = useState({ materialId: '', quantity: '', date: new Date().toISOString().split('T')[0], department: '', applicant: '', useFor: '' })

  // 采购申请弹窗
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [purchaseForm, setPurchaseForm] = useState({ materialId: '', quantity: '', estimatedCost: '', applicant: '', department: '', reason: '' })

  // 采购审批弹窗
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState<typeof INITIAL_PURCHASE_REQUESTS[0] | null>(null)

  // 详情/编辑弹窗
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailType, setDetailType] = useState('')
  const [detailData, setDetailData] = useState<any>(null)

  // 刷新数据
  const handleRefresh = () => {
    setMaterials(INITIAL_MATERIALS)
    alert('数据已刷新')
  }

  // 打开详情弹窗
  const handleOpenDetail = (type: string, data: any) => {
    setDetailType(type)
    setDetailData(data)
    setShowDetailModal(true)
  }

  // 导出功能
  const handleExport = (type: string) => {
    alert(`正在导出${type}数据...`)
  }

  // Tab配置
  const tabs: TabItem[] = [
    { key: 'inventory', label: '物资库存', icon: <Package size={16} /> },
    { key: 'purchase', label: '采购管理', icon: <ClipboardList size={16} /> },
    { key: 'consumption', label: '消耗统计', icon: <BarChart2 size={16} /> },
    { key: 'supplier', label: '供应商', icon: <Truck size={16} /> },
  ]

  // 筛选后的物资
  const filteredMaterials = materials.filter(m => {
    const matchKeyword = m.name.includes(searchKeyword) || m.spec.includes(searchKeyword) || m.supplier.includes(searchKeyword)
    const matchCategory = selectedCategory === '全部' || m.category === selectedCategory
    const threshold = ALERT_THRESHOLDS[m.category] || m.minStock
    const matchLowStock = !showLowStockOnly || m.stock <= threshold
    return matchKeyword && matchCategory && matchLowStock
  })

  // 入库处理
  const handleInSubmit = () => {
    if (!inForm.materialId || !inForm.quantity) return
    const material = materials.find(m => m.id === inForm.materialId)
    if (material) {
      setMaterials(prev => prev.map(m =>
        m.id === inForm.materialId ? { ...m, stock: m.stock + parseInt(inForm.quantity), lastIn: inForm.date } : m
      ))
    }
    setShowInModal(false)
    setInForm({ materialId: '', quantity: '', date: new Date().toISOString().split('T')[0], operator: '', supplier: '', note: '' })
  }

  // 出库处理
  const handleOutSubmit = () => {
    if (!outForm.materialId || !outForm.quantity) return
    const material = materials.find(m => m.id === outForm.materialId)
    if (material) {
      const qty = parseInt(outForm.quantity)
      if (qty > material.stock) {
        alert('库存不足！')
        return
      }
      setMaterials(prev => prev.map(m =>
        m.id === outForm.materialId ? { ...m, stock: m.stock - qty, lastOut: outForm.date } : m
      ))
    }
    setShowOutModal(false)
    setOutForm({ materialId: '', quantity: '', date: new Date().toISOString().split('T')[0], department: '', applicant: '', useFor: '' })
  }

  // 采购申请提交
  const handlePurchaseSubmit = () => {
    if (!purchaseForm.materialId || !purchaseForm.quantity) return
    setShowPurchaseModal(false)
    setPurchaseForm({ materialId: '', quantity: '', estimatedCost: '', applicant: '', department: '', reason: '' })
  }

  // 审批通过
  const handleApprove = (purchase: typeof INITIAL_PURCHASE_REQUESTS[0]) => {
    setSelectedPurchase(purchase)
    setShowApproveModal(true)
  }

  // 统计汇总
  const totalMaterials = materials.length
  const totalValue = materials.reduce((sum, m) => sum + m.stock * m.price, 0)
  const lowStockCount = materials.filter(m => {
    const threshold = ALERT_THRESHOLDS[m.category] || m.minStock
    return m.stock <= threshold
  }).length
  const outOfStockCount = materials.filter(m => m.stock === 0).length

  // ============================================================
  // 渲染各Tab内容
  // ============================================================

  // 物资库存Tab
  const renderInventoryTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 顶部操作栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* 搜索框 */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.textLight }} />
            <input
              type="text"
              placeholder="搜索物资名称、规格、供应商..."
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              style={{ width: 280, padding: '8px 12px 8px 34px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none' }}
            />
          </div>
          {/* 分类筛选 */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{ padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none', cursor: 'pointer' }}
          >
            {MATERIAL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          {/* 仅显示预警 */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.textMid, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={e => setShowLowStockOnly(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            仅显示预警
          </label>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowInModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: C.primary, color: C.white, border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}
          >
            <PackageCheck size={16} /> 入库
          </button>
          <button
            onClick={() => setShowOutModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: C.accent, color: C.white, border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}
          >
            <PackageX size={16} /> 出库
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard title="物资种类" value={totalMaterials.toString()} subValue="种分类物资" icon={<Package size={24} />} color={C.primary} />
        <StatCard title="库存总值" value={formatCurrency(totalValue)} subValue="当前库存总价值" icon={<DollarSign size={24} />} color={C.accent} />
        <StatCard title="库存预警" value={lowStockCount.toString()} subValue="项需要关注" icon={<AlertTriangle size={24} />} color={C.warning} />
        <StatCard title="缺货物资" value={outOfStockCount.toString()} subValue="项已缺货" icon={<XCircle size={24} />} color={C.danger} />
      </div>

      {/* 库存预警 */}
      <LowStockAlert materials={materials} />

      {/* 库存列表 */}
      <div style={{ background: C.white, borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 14, fontWeight: 600, color: C.textDark }}>
          物资库存列表 ({filteredMaterials.length}项)
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.bg }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: C.textMid, fontWeight: 500 }}>物资名称</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: C.textMid, fontWeight: 500 }}>分类</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: C.textMid, fontWeight: 500 }}>规格</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: C.textMid, fontWeight: 500 }}>库存量</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: C.textMid, fontWeight: 500 }}>单价</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: C.textMid, fontWeight: 500 }}>供应商</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: C.textMid, fontWeight: 500 }}>状态</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: C.textMid, fontWeight: 500 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.map((m, idx) => {
              const stockStatus = getStockStatus(m.stock, m.minStock, m.category)
              return (
                <tr key={m.id} style={{ borderTop: idx > 0 ? `1px solid ${C.border}` : 'none' }}>
                  <td style={{ padding: '10px 12px', fontSize: 13, color: C.textDark, fontWeight: 500 }}>{m.name}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: C.textMid }}>
                    <span style={{ padding: '2px 8px', background: C.primaryLighter, color: C.primary, borderRadius: 4 }}>{m.category}</span>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: C.textMid }}>{m.spec}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, color: stockStatus.color, fontWeight: 600 }}>
                    {m.stock} {m.unit}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, color: C.textDark }}>{formatCurrency(m.price)}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: C.textMid }}>{m.supplier}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500,
                      background: `${stockStatus.color}15`, color: stockStatus.color
                    }}>
                      {stockStatus.label}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <button style={{ padding: '4px 10px', border: `1px solid ${C.border}`, borderRadius: 4, background: C.white, cursor: 'pointer', fontSize: 12, color: C.textMid, marginRight: 4 }}>
                      <Filter size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> 明细
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 入库记录和出库记录 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* 入库记录 */}
        <div style={{ background: C.white, borderRadius: 8, border: `1px solid ${C.border}`, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark, display: 'flex', alignItems: 'center', gap: 6 }}>
              <PackageCheck size={16} color={C.success} /> 最近入库记录
            </div>
            <button onClick={() => setActiveTab('purchase')} style={{ fontSize: 12, color: C.primary, background: 'transparent', border: 'none', cursor: 'pointer' }}>查看全部</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {INITIAL_IN_RECORDS.slice(0, 5).map(record => (
              <div key={record.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: C.bg, borderRadius: 6, fontSize: 12 }}>
                <div>
                  <div style={{ color: C.textDark, fontWeight: 500 }}>{record.materialName}</div>
                  <div style={{ color: C.textLight }}>{record.date} · {record.operator}</div>
                </div>
                <div style={{ color: C.success, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  +{record.quantity}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 出库记录 */}
        <div style={{ background: C.white, borderRadius: 8, border: `1px solid ${C.border}`, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark, display: 'flex', alignItems: 'center', gap: 6 }}>
              <PackageX size={16} color={C.danger} /> 最近出库记录
            </div>
            <button onClick={() => setActiveTab('consumption')} style={{ fontSize: 12, color: C.primary, background: 'transparent', border: 'none', cursor: 'pointer' }}>查看全部</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {INITIAL_OUT_RECORDS.slice(0, 5).map(record => (
              <div key={record.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: C.bg, borderRadius: 6, fontSize: 12 }}>
                <div>
                  <div style={{ color: C.textDark, fontWeight: 500 }}>{record.materialName}</div>
                  <div style={{ color: C.textLight }}>{record.date} · {record.department}</div>
                </div>
                <div style={{ color: C.danger, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  -{record.quantity}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // 采购管理Tab
  const renderPurchaseTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 顶部操作栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 14, color: C.textMid }}>
          <span style={{ marginRight: 16 }}>待审批: <strong style={{ color: C.warning }}>{INITIAL_PURCHASE_REQUESTS.filter(p => p.status === 'pending').length}</strong> 项</span>
          <span style={{ marginRight: 16 }}>已通过: <strong style={{ color: C.success }}>{INITIAL_PURCHASE_REQUESTS.filter(p => p.status === 'approved').length}</strong> 项</span>
          <span>已完成: <strong style={{ color: C.info }}>{INITIAL_PURCHASE_REQUESTS.filter(p => p.status === 'completed').length}</strong> 项</span>
        </div>
        <button
          onClick={() => setShowPurchaseModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: C.primary, color: C.white, border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}
        >
          <Plus size={16} /> 新增采购申请
        </button>
      </div>

      {/* 采购申请列表 */}
      <div style={{ background: C.white, borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 14, fontWeight: 600, color: C.textDark }}>
          采购申请列表
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.bg }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: C.textMid, fontWeight: 500 }}>申请单号</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: C.textMid, fontWeight: 500 }}>物资名称</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: C.textMid, fontWeight: 500 }}>数量</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: C.textMid, fontWeight: 500 }}>预估金额</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: C.textMid, fontWeight: 500 }}>申请部门</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: C.textMid, fontWeight: 500 }}>申请人</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: C.textMid, fontWeight: 500 }}>状态</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: C.textMid, fontWeight: 500 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {INITIAL_PURCHASE_REQUESTS.map((pr, idx) => (
              <tr key={pr.id} style={{ borderTop: idx > 0 ? `1px solid ${C.border}` : 'none' }}>
                <td style={{ padding: '10px 12px', fontSize: 12, color: C.textMid }}>{pr.id}</td>
                <td style={{ padding: '10px 12px', fontSize: 13, color: C.textDark, fontWeight: 500 }}>{pr.materialName}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: C.textMid }}>{pr.quantity}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, color: C.textDark }}>{formatCurrency(pr.estimatedCost)}</td>
                <td style={{ padding: '10px 12px', fontSize: 12, color: C.textMid }}>{pr.department}</td>
                <td style={{ padding: '10px 12px', fontSize: 12, color: C.textMid }}>{pr.applicant}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500,
                    background: pr.status === 'pending' ? `${C.warning}15` : pr.status === 'approved' ? `${C.info}15` : `${C.success}15`,
                    color: pr.status === 'pending' ? C.warning : pr.status === 'approved' ? C.info : C.success
                  }}>
                    {pr.status === 'pending' ? '待审批' : pr.status === 'approved' ? '已通过' : '已完成'}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  {pr.status === 'pending' && (
                    <button
                      onClick={() => handleApprove(pr)}
                      style={{ padding: '4px 10px', border: `1px solid ${C.success}`, borderRadius: 4, background: C.white, cursor: 'pointer', fontSize: 12, color: C.success, marginRight: 4 }}
                    >
                      审批
                    </button>
                  )}
                  <button onClick={() => handleOpenDetail('purchase', pr)} style={{ padding: '4px 10px', border: `1px solid ${C.border}`, borderRadius: 4, background: C.white, cursor: 'pointer', fontSize: 12, color: C.textMid }}>
                    查看
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 采购历史 */}
      <div style={{ background: C.white, borderRadius: 8, border: `1px solid ${C.border}`, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark, display: 'flex', alignItems: 'center', gap: 6 }}>
            <History size={16} color={C.primary} /> 采购历史
          </div>
          <button onClick={() => handleExport('采购历史')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.primary, background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <Download size={14} /> 导出
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.bg }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 12, color: C.textMid }}>订单号</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 12, color: C.textMid }}>物资名称</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: 12, color: C.textMid }}>数量</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 12, color: C.textMid }}>实际金额</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 12, color: C.textMid }}>供应商</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: 12, color: C.textMid }}>下单日期</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: 12, color: C.textMid }}>到货日期</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: 12, color: C.textMid }}>采购员</th>
            </tr>
          </thead>
          <tbody>
            {INITIAL_PURCHASE_HISTORY.map((ph, idx) => (
              <tr key={ph.id} style={{ borderTop: idx > 0 ? `1px solid ${C.border}` : 'none' }}>
                <td style={{ padding: '8px 10px', fontSize: 12, color: C.textMid }}>{ph.id}</td>
                <td style={{ padding: '8px 10px', fontSize: 12, color: C.textDark }}>{ph.materialName}</td>
                <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: 12, color: C.textMid }}>{ph.quantity}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: 12, color: C.textDark }}>{formatCurrency(ph.actualCost)}</td>
                <td style={{ padding: '8px 10px', fontSize: 12, color: C.textMid }}>{ph.supplier}</td>
                <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: 12, color: C.textMid }}>{ph.orderDate}</td>
                <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: 12, color: C.textMid }}>{ph.receiveDate}</td>
                <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: 12, color: C.textMid }}>{ph.purchaser}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // 消耗统计Tab
  const renderConsumptionTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 统计概览 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard
          title="本月胶片消耗"
          value="3800张"
          subValue="较上月 +8.6%"
          icon={<Package size={24} />}
          color={C.primary}
        />
        <StatCard
          title="本月造影剂消耗"
          value="1050支"
          subValue="较上月 +14.1%"
          icon={<Droplet size={24} />}
          color={C.accent}
        />
        <StatCard
          title="本月采购支出"
          value="¥234,500"
          subValue="较上月 +11.3%"
          icon={<DollarSign size={24} />}
          color={C.success}
        />
        <StatCard
          title="累计物资种类"
          value="156种"
          subValue="在用供应商7家"
          icon={<Boxes size={24} />}
          color={C.warning}
        />
      </div>

      {/* 图表区域 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* 检查项目消耗量 */}
        <div style={{ background: C.white, borderRadius: 8, border: `1px solid ${C.border}`, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark, marginBottom: 16 }}>各检查项目物资消耗量</div>
          <ResponsiveContainer width="100%" height={250}>
            <ChartBar data={CONSUMPTION_BY_EXAM}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.textMid }} />
              <YAxis tick={{ fontSize: 11, fill: C.textMid }} />
              <Tooltip
                contentStyle={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12 }}
                formatter={(value: number) => [value, '']}
              />
              <Bar dataKey="film" name="胶片" fill={C.primary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="contrast" name="造影剂" fill={C.accent} radius={[4, 4, 0, 0]} />
              <Bar dataKey="syringe" name="注射器" fill={C.success} radius={[4, 4, 0, 0]} />
            </ChartBar>
          </ResponsiveContainer>
        </div>

        {/* 月度消耗趋势 */}
        <div style={{ background: C.white, borderRadius: 8, border: `1px solid ${C.border}`, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark, marginBottom: 16 }}>月度物资消耗费用趋势</div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={MONTHLY_CONSUMPTION}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.textMid }} />
              <YAxis tick={{ fontSize: 11, fill: C.textMid }} tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12 }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Area type="monotone" dataKey="totalCost" name="消耗费用" stroke={C.primary} fill={C.primaryLighter} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 消耗明细表格 */}
      <div style={{ background: C.white, borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 14, fontWeight: 600, color: C.textDark }}>
          各检查项目消耗明细
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.bg }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: C.textMid, fontWeight: 500 }}>检查项目</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: C.textMid, fontWeight: 500 }}>胶片(张)</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: C.textMid, fontWeight: 500 }}>造影剂(支)</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: C.textMid, fontWeight: 500 }}>注射器(支)</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: C.textMid, fontWeight: 500 }}>导管(支)</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: C.textMid, fontWeight: 500 }}>预估费用(元)</th>
            </tr>
          </thead>
          <tbody>
            {CONSUMPTION_BY_EXAM.map((item, idx) => (
              <tr key={item.name} style={{ borderTop: idx > 0 ? `1px solid ${C.border}` : 'none' }}>
                <td style={{ padding: '10px 12px', fontSize: 13, color: C.textDark, fontWeight: 500 }}>{item.name}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: C.textMid }}>{item.film}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: C.textMid }}>{item.contrast}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: C.textMid }}>{item.syringe}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: C.textMid }}>{item.catheter}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, color: C.primary, fontWeight: 600 }}>{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 月度消耗报表 */}
      <div style={{ background: C.white, borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 14, fontWeight: 600, color: C.textDark, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>月度消耗报表</span>
          <button onClick={() => handleExport('月度消耗报表')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.primary, background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <Download size={14} /> 导出报表
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.bg }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: C.textMid, fontWeight: 500 }}>月份</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: C.textMid, fontWeight: 500 }}>胶片(张)</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: C.textMid, fontWeight: 500 }}>造影剂(支)</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: C.textMid, fontWeight: 500 }}>注射器(支)</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: C.textMid, fontWeight: 500 }}>导管(支)</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: C.textMid, fontWeight: 500 }}>总费用(元)</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: C.textMid, fontWeight: 500 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {MONTHLY_CONSUMPTION.map((item, idx) => (
              <tr key={item.month} style={{ borderTop: idx > 0 ? `1px solid ${C.border}` : 'none' }}>
                <td style={{ padding: '10px 12px', fontSize: 13, color: C.textDark, fontWeight: 500 }}>{item.month}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: C.textMid }}>{item.film}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: C.textMid }}>{item.contrast}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: C.textMid }}>{item.syringe}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: C.textMid }}>{item.catheter}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, color: C.primary, fontWeight: 600 }}>{formatCurrency(item.totalCost)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <button onClick={() => handleOpenDetail('consumption', item)} style={{ padding: '4px 10px', border: `1px solid ${C.border}`, borderRadius: 4, background: C.white, cursor: 'pointer', fontSize: 12, color: C.textMid }}>
                    查看明细
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // 供应商Tab
  const renderSupplierTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 供应商统计 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard title="供应商总数" value={INITIAL_SUPPLIERS.length.toString()} subValue="家合作供应商" icon={<Truck size={24} />} color={C.primary} />
        <StatCard title="本月采购额" value="¥234,500" subValue="来自采购统计" icon={<DollarSign size={24} />} color={C.accent} />
        <StatCard title="平均响应时间" value="24h" subValue="供应商平均交期" icon={<Clock size={24} />} color={C.success} />
        <StatCard title="质量评分" value="4.7" subValue="综合平均评分" icon={<CheckCircle size={24} />} color={C.warning} />
      </div>

      {/* 供应商列表 */}
      <div style={{ background: C.white, borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 14, fontWeight: 600, color: C.textDark }}>
          供应商列表
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.bg }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: C.textMid, fontWeight: 500 }}>供应商名称</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: C.textMid, fontWeight: 500 }}>联系人</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: C.textMid, fontWeight: 500 }}>联系电话</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: C.textMid, fontWeight: 500 }}>主营分类</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: C.textMid, fontWeight: 500 }}>评分</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: C.textMid, fontWeight: 500 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {INITIAL_SUPPLIERS.map((supplier, idx) => (
              <tr key={supplier.id} style={{ borderTop: idx > 0 ? `1px solid ${C.border}` : 'none' }}>
                <td style={{ padding: '10px 12px', fontSize: 13, color: C.textDark, fontWeight: 500 }}>{supplier.name}</td>
                <td style={{ padding: '10px 12px', fontSize: 12, color: C.textMid }}>{supplier.contact}</td>
                <td style={{ padding: '10px 12px', fontSize: 12, color: C.textMid }}>{supplier.phone}</td>
                <td style={{ padding: '10px 12px', fontSize: 12, color: C.textMid }}>
                  {supplier.categories.map((cat, i) => (
                    <span key={i} style={{ marginRight: 4 }}>
                      <span style={{ padding: '2px 6px', background: C.primaryLighter, color: C.primary, borderRadius: 3, fontSize: 11 }}>{cat}</span>
                    </span>
                  ))}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <span style={{ color: C.warning, fontWeight: 600 }}>{supplier.rating}</span>
                  <span style={{ color: C.textLight, fontSize: 11 }}> / 5.0</span>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <button onClick={() => handleOpenDetail('supplier-edit', supplier)} style={{ padding: '4px 10px', border: `1px solid ${C.border}`, borderRadius: 4, background: C.white, cursor: 'pointer', fontSize: 12, color: C.textMid, marginRight: 4 }}>
                    编辑
                  </button>
                  <button onClick={() => handleOpenDetail('supplier-detail', supplier)} style={{ padding: '4px 10px', border: `1px solid ${C.border}`, borderRadius: 4, background: C.white, cursor: 'pointer', fontSize: 12, color: C.textMid }}>
                    详情
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ============================================================
  // 弹窗渲染
  // ============================================================

  // 入库弹窗
  const renderInModal = () => {
    if (!showInModal) return null
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }} onClick={() => setShowInModal(false)}>
        <div style={{ background: C.white, borderRadius: 12, padding: 24, width: 480 }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.textDark }}>物资入库</div>
            <button onClick={() => setShowInModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.textMid }}>
              <X size={20} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, color: C.textMid, marginBottom: 4, display: 'block' }}>选择物资 *</label>
              <select
                value={inForm.materialId}
                onChange={e => setInForm({ ...inForm, materialId: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none' }}
              >
                <option value="">请选择物资</option>
                {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.spec})</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, color: C.textMid, marginBottom: 4, display: 'block' }}>入库数量 *</label>
              <input
                type="number"
                placeholder="请输入数量"
                value={inForm.quantity}
                onChange={e => setInForm({ ...inForm, quantity: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: C.textMid, marginBottom: 4, display: 'block' }}>入库日期</label>
              <input
                type="date"
                value={inForm.date}
                onChange={e => setInForm({ ...inForm, date: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: C.textMid, marginBottom: 4, display: 'block' }}>操作员</label>
              <input
                type="text"
                placeholder="请输入操作员姓名"
                value={inForm.operator}
                onChange={e => setInForm({ ...inForm, operator: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: C.textMid, marginBottom: 4, display: 'block' }}>供应商</label>
              <input
                type="text"
                placeholder="请输入供应商名称"
                value={inForm.supplier}
                onChange={e => setInForm({ ...inForm, supplier: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: C.textMid, marginBottom: 4, display: 'block' }}>备注</label>
              <input
                type="text"
                placeholder="选填备注信息"
                value={inForm.note}
                onChange={e => setInForm({ ...inForm, note: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                onClick={handleInSubmit}
                style={{ flex: 1, padding: '10px 16px', background: C.primary, color: C.white, border: 'none', borderRadius: 6, fontSize: 14, cursor: 'pointer', fontWeight: 500 }}
              >
                确认入库
              </button>
              <button
                onClick={() => setShowInModal(false)}
                style={{ flex: 1, padding: '10px 16px', background: C.white, color: C.textMid, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 14, cursor: 'pointer' }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 出库弹窗
  const renderOutModal = () => {
    if (!showOutModal) return null
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }} onClick={() => setShowOutModal(false)}>
        <div style={{ background: C.white, borderRadius: 12, padding: 24, width: 480 }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.textDark }}>物资出库</div>
            <button onClick={() => setShowOutModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.textMid }}>
              <X size={20} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, color: C.textMid, marginBottom: 4, display: 'block' }}>选择物资 *</label>
              <select
                value={outForm.materialId}
                onChange={e => setOutForm({ ...outForm, materialId: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none' }}
              >
                <option value="">请选择物资</option>
                {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.spec}) - 库存{m.stock}{m.unit}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, color: C.textMid, marginBottom: 4, display: 'block' }}>出库数量 *</label>
              <input
                type="number"
                placeholder="请输入数量"
                value={outForm.quantity}
                onChange={e => setOutForm({ ...outForm, quantity: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: C.textMid, marginBottom: 4, display: 'block' }}>出库日期</label>
              <input
                type="date"
                value={outForm.date}
                onChange={e => setOutForm({ ...outForm, date: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: C.textMid, marginBottom: 4, display: 'block' }}>领用部门</label>
              <select
                value={outForm.department}
                onChange={e => setOutForm({ ...outForm, department: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none' }}
              >
                <option value="">请选择部门</option>
                <option value="CT室">CT室</option>
                <option value="MR室">MR室</option>
                <option value="DR室">DR室</option>
                <option value="导管室">导管室</option>
                <option value="CR室">CR室</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, color: C.textMid, marginBottom: 4, display: 'block' }}>领用人</label>
              <input
                type="text"
                placeholder="请输入领用人姓名"
                value={outForm.applicant}
                onChange={e => setOutForm({ ...outForm, applicant: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: C.textMid, marginBottom: 4, display: 'block' }}>用途</label>
              <input
                type="text"
                placeholder="如：CT增强检查"
                value={outForm.useFor}
                onChange={e => setOutForm({ ...outForm, useFor: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                onClick={handleOutSubmit}
                style={{ flex: 1, padding: '10px 16px', background: C.accent, color: C.white, border: 'none', borderRadius: 6, fontSize: 14, cursor: 'pointer', fontWeight: 500 }}
              >
                确认出库
              </button>
              <button
                onClick={() => setShowOutModal(false)}
                style={{ flex: 1, padding: '10px 16px', background: C.white, color: C.textMid, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 14, cursor: 'pointer' }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 采购申请弹窗
  const renderPurchaseModal = () => {
    if (!showPurchaseModal) return null
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }} onClick={() => setShowPurchaseModal(false)}>
        <div style={{ background: C.white, borderRadius: 12, padding: 24, width: 480 }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.textDark }}>新建采购申请</div>
            <button onClick={() => setShowPurchaseModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.textMid }}>
              <X size={20} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, color: C.textMid, marginBottom: 4, display: 'block' }}>选择物资 *</label>
              <select
                value={purchaseForm.materialId}
                onChange={e => setPurchaseForm({ ...purchaseForm, materialId: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none' }}
              >
                <option value="">请选择物资</option>
                {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.spec})</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, color: C.textMid, marginBottom: 4, display: 'block' }}>采购数量 *</label>
              <input
                type="number"
                placeholder="请输入采购数量"
                value={purchaseForm.quantity}
                onChange={e => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: C.textMid, marginBottom: 4, display: 'block' }}>预估金额(元)</label>
              <input
                type="number"
                placeholder="请输入预估金额"
                value={purchaseForm.estimatedCost}
                onChange={e => setPurchaseForm({ ...purchaseForm, estimatedCost: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: C.textMid, marginBottom: 4, display: 'block' }}>申请部门</label>
              <select
                value={purchaseForm.department}
                onChange={e => setPurchaseForm({ ...purchaseForm, department: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none' }}
              >
                <option value="">请选择部门</option>
                <option value="CT室">CT室</option>
                <option value="MR室">MR室</option>
                <option value="DR室">DR室</option>
                <option value="导管室">导管室</option>
                <option value="CR室">CR室</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, color: C.textMid, marginBottom: 4, display: 'block' }}>申请人</label>
              <input
                type="text"
                placeholder="请输入申请人姓名"
                value={purchaseForm.applicant}
                onChange={e => setPurchaseForm({ ...purchaseForm, applicant: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: C.textMid, marginBottom: 4, display: 'block' }}>申请原因</label>
              <input
                type="text"
                placeholder="请输入申请原因"
                value={purchaseForm.reason}
                onChange={e => setPurchaseForm({ ...purchaseForm, reason: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                onClick={handlePurchaseSubmit}
                style={{ flex: 1, padding: '10px 16px', background: C.primary, color: C.white, border: 'none', borderRadius: 6, fontSize: 14, cursor: 'pointer', fontWeight: 500 }}
              >
                提交申请
              </button>
              <button
                onClick={() => setShowPurchaseModal(false)}
                style={{ flex: 1, padding: '10px 16px', background: C.white, color: C.textMid, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 14, cursor: 'pointer' }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 审批弹窗
  const renderApproveModal = () => {
    if (!showApproveModal || !selectedPurchase) return null
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }} onClick={() => setShowApproveModal(false)}>
        <div style={{ background: C.white, borderRadius: 12, padding: 24, width: 440 }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.textDark }}>采购审批</div>
            <button onClick={() => setShowApproveModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.textMid }}>
              <X size={20} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ color: C.textMid }}>申请单号</span>
              <span style={{ color: C.textDark, fontWeight: 500 }}>{selectedPurchase.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ color: C.textMid }}>物资名称</span>
              <span style={{ color: C.textDark }}>{selectedPurchase.materialName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ color: C.textMid }}>规格</span>
              <span style={{ color: C.textDark }}>{selectedPurchase.spec}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ color: C.textMid }}>申请数量</span>
              <span style={{ color: C.textDark, fontWeight: 500 }}>{selectedPurchase.quantity}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ color: C.textMid }}>预估金额</span>
              <span style={{ color: C.primary, fontWeight: 600 }}>{formatCurrency(selectedPurchase.estimatedCost)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ color: C.textMid }}>申请部门</span>
              <span style={{ color: C.textDark }}>{selectedPurchase.department}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ color: C.textMid }}>申请人</span>
              <span style={{ color: C.textDark }}>{selectedPurchase.applicant}</span>
            </div>
            <div style={{ padding: '8px 0' }}>
              <div style={{ color: C.textMid, marginBottom: 4 }}>申请原因</div>
              <div style={{ color: C.textDark, padding: 8, background: C.bg, borderRadius: 6 }}>{selectedPurchase.reason}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                onClick={() => { setShowApproveModal(false); alert('已通过审批') }}
                style={{ flex: 1, padding: '10px 16px', background: C.success, color: C.white, border: 'none', borderRadius: 6, fontSize: 14, cursor: 'pointer', fontWeight: 500 }}
              >
                <CheckCheck size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> 批准
              </button>
              <button
                onClick={() => { setShowApproveModal(false); alert('已拒绝') }}
                style={{ flex: 1, padding: '10px 16px', background: C.danger, color: C.white, border: 'none', borderRadius: 6, fontSize: 14, cursor: 'pointer', fontWeight: 500 }}
              >
                <XCircle size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> 拒绝
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 详情弹窗
  const renderDetailModal = () => {
    if (!showDetailModal || !detailData) return null
    const titles: Record<string, string> = {
      'purchase': '采购申请详情',
      'consumption': '消耗明细',
      'supplier-edit': '编辑供应商',
      'supplier-detail': '供应商详情'
    }
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }} onClick={() => setShowDetailModal(false)}>
        <div style={{ background: C.white, borderRadius: 12, padding: 24, width: 500 }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.textDark }}>{titles[detailType] || '详情'}</div>
            <button onClick={() => setShowDetailModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.textMid }}>
              <X size={20} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            {Object.entries(detailData).map(([key, value]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ color: C.textMid }}>{key}</span>
                <span style={{ color: C.textDark, fontWeight: 500 }}>{String(value)}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              onClick={() => setShowDetailModal(false)}
              style={{ flex: 1, padding: '10px 16px', background: C.white, color: C.textMid, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 14, cursor: 'pointer' }}
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // 主渲染
  // ============================================================
  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      {/* 页面头部 */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '16px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: C.textDark, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Package size={24} color={C.primary} /> 物资耗材管理
            </h1>
            <div style={{ fontSize: 13, color: C.textLight, marginTop: 4 }}>管理医疗物资库存、采购和消耗统计</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleRefresh} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: C.white, color: C.textMid, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
              <RefreshCw size={14} /> 刷新数据
            </button>
          </div>
        </div>
      </div>

      {/* Tab导航 */}
      <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab内容 */}
      <div style={{ padding: 20 }}>
        {activeTab === 'inventory' && renderInventoryTab()}
        {activeTab === 'purchase' && renderPurchaseTab()}
        {activeTab === 'consumption' && renderConsumptionTab()}
        {activeTab === 'supplier' && renderSupplierTab()}
      </div>

      {/* 弹窗 */}
      {renderInModal()}
      {renderOutModal()}
      {renderPurchaseModal()}
      {renderApproveModal()}
      {renderDetailModal()}
    </div>
  )
}
