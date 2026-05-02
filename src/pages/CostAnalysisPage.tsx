// @ts-nocheck
// ============================================================
// G005 放射科RIS - 成本效益分析页面 v0.7.0
// CT/MRI/DSA设备成本 · 胶片耗材 · 技师人力成本分析
// ============================================================
import { useState, useMemo } from 'react'
import {
  TrendingUp, TrendingDown, DollarSign, Monitor, Users, Film,
  Calendar, BarChart3, PieChart as PieChartIcon, Activity,
  ArrowUpRight, ArrowDownRight, Server, Clock, Scissors, HeartPulse
} from 'lucide-react'

// ==================== 类型定义 ====================
type TimeRange = 'month' | 'quarter' | 'year'
type TabType = 'overview' | 'equipment' | 'consumable' | 'labor' | 'benefit'

// 设备成本数据类型
type EquipmentCost = {
  id: string
  name: string
  modality: string  // CT/MRI/DSA
  purchasePrice: number        // 采购价格(万元)
  depreciationYears: number    // 折旧年限
  annualMaintenance: number    // 年维护费(万元)
  annualUsage: number          // 年检查人次
  unitCost: number             // 单次检查设备成本
}

// 耗材成本类型
type ConsumableCost = {
  id: string
  name: string
  category: string  // 胶片/对比剂/注射器/其他
  unit: string
  unitPrice: number
  monthlyUsage: number
  monthlyCost: number
  annualCost: number
}

// 人力成本类型
type LaborCost = {
  id: string
  role: string     // 技师/护士/医师
  count: number     // 人数
  avgSalary: number // 平均月薪(元)
  annualCost: number
  workload: number  // 人均年检查量
}

// 效益数据类型
type BenefitData = {
  month: string
  revenue: number      // 收入(万元)
  cost: number         // 成本(万元)
  profit: number       // 利润(万元)
  examCount: number    // 检查人次
}

// ==================== 常量配置 ====================
const PRIMARY = '#1e40af'
const PRIMARY_LIGHT = '#3b82f6'
const ACCENT = '#f59e0b'

// 设备配置
const EQUIPMENT_DATA: EquipmentCost[] = [
  {
    id: 'ct-force',
    name: 'SOMATOM Force',
    modality: 'CT',
    purchasePrice: 1200,
    depreciationYears: 10,
    annualMaintenance: 80,
    annualUsage: 12000,
    unitCost: 0,
  },
  {
    id: 'mri-prisma',
    name: 'Prisma 3.0T',
    modality: 'MRI',
    purchasePrice: 2800,
    depreciationYears: 10,
    annualMaintenance: 150,
    annualUsage: 6000,
    unitCost: 0,
  },
  {
    id: 'dsa-artis',
    name: 'Artis Zee',
    modality: 'DSA',
    purchasePrice: 1800,
    depreciationYears: 10,
    annualMaintenance: 120,
    annualUsage: 3000,
    unitCost: 0,
  },
  {
    id: 'ct-lightning',
    name: 'SOMATOM Lightning',
    modality: 'CT',
    purchasePrice: 600,
    depreciationYears: 10,
    annualMaintenance: 45,
    annualUsage: 8000,
    unitCost: 0,
  },
  {
    id: 'mri-sempra',
    name: 'Sempra 1.5T',
    modality: 'MRI',
    purchasePrice: 900,
    depreciationYears: 10,
    annualMaintenance: 60,
    annualUsage: 5000,
    unitCost: 0,
  },
]

// 耗材配置
const CONSUMABLE_DATA: ConsumableCost[] = [
  { id: 'film-14x17', name: '14x17英寸胶片', category: '胶片', unit: '张', unitPrice: 28, monthlyUsage: 3000, monthlyCost: 84000, annualCost: 1008000 },
  { id: 'film-10x12', name: '10x12英寸胶片', category: '胶片', unit: '张', unitPrice: 18, monthlyUsage: 5000, monthlyCost: 90000, annualCost: 1080000 },
  { id: 'film-8x10', name: '8x10英寸胶片', category: '胶片', unit: '张', unitPrice: 12, monthlyUsage: 2000, monthlyCost: 24000, annualCost: 288000 },
  { id: 'contrast-ct', name: 'CT对比剂(碘海醇)', category: '对比剂', unit: '瓶', unitPrice: 280, monthlyUsage: 600, monthlyCost: 168000, annualCost: 2016000 },
  { id: 'contrast-mri', name: 'MRI对比剂(钆剂)', category: '对比剂', unit: '瓶', unitPrice: 520, monthlyUsage: 200, monthlyCost: 104000, annualCost: 1248000 },
  { id: 'injector-syringe', name: '高压注射器针筒', category: '注射器', unit: '支', unitPrice: 85, monthlyUsage: 400, monthlyCost: 34000, annualCost: 408000 },
  { id: 'catheter-dsa', name: 'DSA导管耗材', category: '耗材', unit: '套', unitPrice: 2500, monthlyUsage: 80, monthlyCost: 200000, annualCost: 2400000 },
  { id: 'film-chemical', name: '胶片冲洗化学试剂', category: '其他', unit: '套', unitPrice: 4500, monthlyUsage: 4, monthlyCost: 18000, annualCost: 216000 },
  { id: 'dvd-medias', name: 'DICOM光盘刻录', category: '其他', unit: '张', unitPrice: 8, monthlyUsage: 600, monthlyCost: 4800, annualCost: 57600 },
]

// 人力成本配置
const LABOR_DATA: LaborCost[] = [
  { id: 'tech-ct', role: 'CT技师', count: 8, avgSalary: 12000, annualCost: 0, workload: 0 },
  { id: 'tech-mri', role: 'MRI技师', count: 6, avgSalary: 13500, annualCost: 0, workload: 0 },
  { id: 'tech-dsa', role: 'DSA技师', count: 4, avgSalary: 15000, annualCost: 0, workload: 0 },
  { id: 'nurse-ct', role: 'CT护士', count: 4, avgSalary: 10000, annualCost: 0, workload: 0 },
  { id: 'nurse-mri', role: 'MRI护士', count: 3, avgSalary: 10000, annualCost: 0, workload: 0 },
  { id: 'nurse-dsa', role: 'DSA护士', count: 3, avgSalary: 11000, annualCost: 0, workload: 0 },
  { id: 'physician', role: '放射科医师', count: 12, avgSalary: 18000, annualCost: 0, workload: 0 },
  { id: 'assistant', role: '登记员/助理', count: 6, avgSalary: 6000, annualCost: 0, workload: 0 },
]

// 月度效益数据
const BENEFIT_DATA: BenefitData[] = [
  { month: '2025-07', revenue: 680, cost: 420, profit: 260, examCount: 4200 },
  { month: '2025-08', revenue: 720, cost: 435, profit: 285, examCount: 4450 },
  { month: '2025-09', revenue: 695, cost: 428, profit: 267, examCount: 4300 },
  { month: '2025-10', revenue: 780, cost: 445, profit: 335, examCount: 4800 },
  { month: '2025-11', revenue: 820, cost: 460, profit: 360, examCount: 5100 },
  { month: '2025-12', revenue: 890, cost: 485, profit: 405, examCount: 5500 },
  { month: '2026-01', revenue: 750, cost: 440, profit: 310, examCount: 4600 },
  { month: '2026-02', revenue: 680, cost: 420, profit: 260, examCount: 4100 },
  { month: '2026-03', revenue: 820, cost: 465, profit: 355, examCount: 5100 },
  { month: '2026-04', revenue: 860, cost: 475, profit: 385, examCount: 5300 },
]

// ==================== 工具函数 ====================
const formatCurrency = (value: number, isSmall = false): string => {
  if (isSmall) {
    return `¥${value.toLocaleString()}`
  }
  return `¥${value.toLocaleString()}万`
}

const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`
}

const calculateUnitCost = (equipment: EquipmentCost): number => {
  const annualDepreciation = equipment.purchasePrice / equipment.depreciationYears
  const totalAnnualCost = annualDepreciation + equipment.annualMaintenance
  return totalAnnualCost / equipment.annualUsage
}

// ==================== 子组件 ====================

// 成本卡片
function CostCard({ title, value, subtitle, icon: Icon, trend, trendValue, color }: {
  title: string
  value: string
  subtitle?: string
  icon: any
  trend?: 'up' | 'down'
  trendValue?: string
  color?: string
}) {
  const cardStyle: React.CSSProperties = {
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 8,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }

  const iconContainerStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: color ? `${color}20` : '#1e40af20',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const valueStyle: React.CSSProperties = {
    fontSize: 24,
    fontWeight: 700,
    color: '#f0f6fc',
  }

  const trendStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    color: trend === 'up' ? '#22c55e' : '#ef4444',
  }

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <span style={{ fontSize: 13, color: '#8b949e' }}>{title}</span>
        <div style={iconContainerStyle}>
          <Icon size={18} color={color || '#3b82f6'} />
        </div>
      </div>
      <div style={valueStyle}>{value}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {subtitle && <span style={{ fontSize: 12, color: '#6e7681' }}>{subtitle}</span>}
        {trend && trendValue && (
          <div style={trendStyle}>
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// 设备成本表格行
function EquipmentRow({ equipment, index }: { equipment: EquipmentCost; index: number }) {
  const unitCost = calculateUnitCost(equipment)
  const totalAnnual = (equipment.purchasePrice / equipment.depreciationYears) + equipment.annualMaintenance

  const rowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '40px 1fr 80px 100px 100px 100px 100px',
    gap: 8,
    padding: '12px 16px',
    borderBottom: '1px solid #21262d',
    alignItems: 'center',
    background: index % 2 === 0 ? '#0d1117' : '#161b22',
  }

  const modalityColors: Record<string, string> = {
    'CT': '#3b82f6',
    'MRI': '#8b5cf6',
    'DSA': '#f59e0b',
  }

  return (
    <div style={rowStyle}>
      <span style={{ color: '#6e7681', fontSize: 12 }}>{index + 1}</span>
      <div>
        <div style={{ color: '#f0f6fc', fontSize: 13, fontWeight: 500 }}>{equipment.name}</div>
        <div style={{ color: '#6e7681', fontSize: 11 }}>{equipment.id.toUpperCase()}</div>
      </div>
      <span style={{
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 500,
        background: `${modalityColors[equipment.modality]}20`,
        color: modalityColors[equipment.modality],
      }}>
        {equipment.modality}
      </span>
      <span style={{ color: '#8b949e', fontSize: 13 }}>{formatCurrency(equipment.purchasePrice)}</span>
      <span style={{ color: '#8b949e', fontSize: 13 }}>{formatCurrency(totalAnnual)}</span>
      <span style={{ color: '#8b949e', fontSize: 13 }}>{equipment.annualUsage.toLocaleString()}</span>
      <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 600 }}>
        ¥{unitCost.toFixed(0)}
      </span>
    </div>
  )
}

// 耗材表格行
function ConsumableRow({ item, index }: { item: ConsumableCost; index: number }) {
  const categoryColors: Record<string, string> = {
    '胶片': '#22c55e',
    '对比剂': '#3b82f6',
    '注射器': '#f59e0b',
    '耗材': '#ef4444',
    '其他': '#8b949e',
  }

  const rowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '40px 1fr 80px 80px 100px 100px',
    gap: 8,
    padding: '12px 16px',
    borderBottom: '1px solid #21262d',
    alignItems: 'center',
    background: index % 2 === 0 ? '#0d1117' : '#161b22',
  }

  return (
    <div style={rowStyle}>
      <span style={{ color: '#6e7681', fontSize: 12 }}>{index + 1}</span>
      <span style={{ color: '#f0f6fc', fontSize: 13 }}>{item.name}</span>
      <span style={{
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 500,
        background: `${categoryColors[item.category]}20`,
        color: categoryColors[item.category],
      }}>
        {item.category}
      </span>
      <span style={{ color: '#8b949e', fontSize: 13 }}>{formatCurrency(item.unitPrice, true)}/{item.unit}</span>
      <span style={{ color: '#8b949e', fontSize: 13 }}>{item.monthlyUsage.toLocaleString()}</span>
      <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 600 }}>
        {formatCurrency(item.annualCost, true)}
      </span>
    </div>
  )
}

// 人力成本行
function LaborRow({ item, index }: { item: LaborCost; index: number }) {
  const annualCost = item.count * item.avgSalary * 12
  const roleColors: Record<string, string> = {
    '技师': '#3b82f6',
    '护士': '#22c55e',
    '医师': '#f59e0b',
    '登记员': '#8b949e',
  }
  const roleType = item.role.includes('技师') ? '技师' : item.role.includes('护士') ? '护士' : item.role.includes('医师') ? '医师' : '登记员'

  const rowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '40px 1fr 60px 100px 100px 100px',
    gap: 8,
    padding: '12px 16px',
    borderBottom: '1px solid #21262d',
    alignItems: 'center',
    background: index % 2 === 0 ? '#0d1117' : '#161b22',
  }

  return (
    <div style={rowStyle}>
      <span style={{ color: '#6e7681', fontSize: 12 }}>{index + 1}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 500,
          background: `${roleColors[roleType]}20`,
          color: roleColors[roleType],
        }}>
          {roleType}
        </span>
        <span style={{ color: '#f0f6fc', fontSize: 13 }}>{item.role}</span>
      </div>
      <span style={{ color: '#8b949e', fontSize: 13 }}>{item.count}人</span>
      <span style={{ color: '#8b949e', fontSize: 13 }}>{formatCurrency(item.avgSalary, true)}/月</span>
      <span style={{ color: '#8b949e', fontSize: 13 }}>{formatCurrency(annualCost, true)}</span>
      <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 600 }}>
        {Math.round(item.annualUsage / item.count)}例/人
      </span>
    </div>
  )
}

// 简易柱状图
function SimpleBarChart({ data, height = 200 }: { data: { label: string; value: number; color?: string }[]; height?: number }) {
  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      gap: 8,
      height,
      padding: '16px 8px',
    }}>
      {data.map((item, idx) => {
        const barHeight = (item.value / maxValue) * (height - 40)
        return (
          <div key={idx} style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}>
            <div style={{
              width: '100%',
              height: barHeight,
              background: item.color || '#3b82f6',
              borderRadius: '4px 4px 0 0',
              transition: 'height 0.3s ease',
              opacity: 0.85,
            }} />
            <span style={{ fontSize: 10, color: '#6e7681' }}>{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// 简易饼图
function SimplePieChart({ data, size = 160 }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  let accumulatedPercent = 0

  const getArcPath = (startPercent: number, endPercent: number, radius: number) => {
    const startAngle = startPercent * 2 * Math.PI - Math.PI / 2
    const endAngle = endPercent * 2 * Math.PI - Math.PI / 2
    const x1 = radius + radius * Math.cos(startAngle)
    const y1 = radius + radius * Math.sin(startAngle)
    const x2 = radius + radius * Math.cos(endAngle)
    const y2 = radius + radius * Math.sin(endAngle)
    const largeArc = endPercent - startPercent > 0.5 ? 1 : 0
    return `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size * 2} ${size * 2}`}>
        {data.map((item, idx) => {
          const percent = item.value / total
          const path = getArcPath(accumulatedPercent, accumulatedPercent + percent, size)
          accumulatedPercent += percent
          return (
            <path
              key={idx}
              d={path}
              fill={item.color}
              style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
            >
              <title>{item.label}: {formatPercent(percent * 100)}</title>
            </path>
          )
        })}
        <circle cx={size} cy={size} r={size * 0.5} fill="#161b22" />
        <text x={size} y={size - 8} textAnchor="middle" fill="#f0f6fc" fontSize="14" fontWeight="600">
          {total.toLocaleString()}万
        </text>
        <text x={size} y={size + 12} textAnchor="middle" fill="#6e7681" fontSize="10">
          年度成本
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: item.color }} />
            <span style={{ fontSize: 12, color: '#8b949e' }}>{item.label}</span>
            <span style={{ fontSize: 12, color: '#f0f6fc', marginLeft: 'auto' }}>{formatPercent((item.value / total) * 100)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== 主组件 ====================
export default function CostAnalysisPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('year')
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // 计算汇总数据
  const summaryData = useMemo(() => {
    // 设备总成本
    const totalEquipmentCost = EQUIPMENT_DATA.reduce((sum, eq) => {
      const annualDep = eq.purchasePrice / eq.depreciationYears
      return sum + annualDep + eq.annualMaintenance
    }, 0)

    // 耗材总成本
    const totalConsumableCost = CONSUMABLE_DATA.reduce((sum, c) => sum + c.annualCost, 0)

    // 人力总成本
    const totalLaborCost = LABOR_DATA.reduce((sum, l) => sum + l.count * l.avgSalary * 12, 0)

    // 总成本
    const totalCost = totalEquipmentCost + totalConsumableCost + totalLaborCost

    // 总收入(取最新月份)
    const latestRevenue = BENEFIT_DATA[BENEFIT_DATA.length - 1]?.revenue || 0
    const latestProfit = BENEFIT_DATA[BENEFIT_DATA.length - 1]?.profit || 0

    // 年总检查量
    const totalExams = BENEFIT_DATA.reduce((sum, b) => sum + b.examCount, 0)

    // 月均成本
    const monthlyAvgCost = totalCost / 12

    // 人次均成本
    const costPerExam = totalCost / totalExams

    return {
      totalEquipmentCost,
      totalConsumableCost,
      totalLaborCost,
      totalCost,
      latestRevenue,
      latestProfit,
      totalExams,
      monthlyAvgCost,
      costPerExam,
    }
  }, [])

  // 计算每种设备的单价成本
  const equipmentWithUnitCost = useMemo(() => {
    return EQUIPMENT_DATA.map(eq => ({
      ...eq,
      unitCost: calculateUnitCost(eq),
      totalAnnual: (eq.purchasePrice / eq.depreciationYears) + eq.annualMaintenance,
    }))
  }, [])

  // 更新人力数据的工作量
  const laborWithWorkload = useMemo(() => {
    const totalExams = BENEFIT_DATA.reduce((sum, b) => sum + b.examCount, 0)
    return LABOR_DATA.map(l => ({
      ...l,
      annualCost: l.count * l.avgSalary * 12,
      annualUsage: totalExams,
    }))
  }, [])

  // 成本构成饼图数据
  const costCompositionData = [
    { label: '设备折旧+维护', value: summaryData.totalEquipmentCost, color: '#3b82f6' },
    { label: '耗材成本', value: summaryData.totalConsumableCost, color: '#22c55e' },
    { label: '人力成本', value: summaryData.totalLaborCost, color: '#f59e0b' },
  ]

  // 成本趋势数据
  const costTrendData = BENEFIT_DATA.map(b => ({
    label: b.month.slice(5),
    value: b.cost,
    color: '#3b82f6',
  }))

  // 效益趋势数据
  const benefitTrendData = BENEFIT_DATA.map(b => ({
    label: b.month.slice(5),
    value: b.profit,
    color: '#22c55e',
  }))

  // 月度收入成本对比
  const revenueVsCostData = [
    ...BENEFIT_DATA.map(b => ({ label: b.month.slice(5), value: b.revenue, color: '#22c55e' })),
    ...BENEFIT_DATA.map(b => ({ label: b.month.slice(5), value: b.cost, color: '#ef4444' })),
  ]

  // ==================== 渲染 ====================
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: '#0d1117',
    color: '#f0f6fc',
    padding: '24px',
  }

  const headerStyle: React.CSSProperties = {
    marginBottom: 24,
  }

  const titleStyle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    color: '#f0f6fc',
    marginBottom: 4,
  }

  const subtitleStyle: React.CSSProperties = {
    fontSize: 13,
    color: '#6e7681',
  }

  const tabsStyle: React.CSSProperties = {
    display: 'flex',
    gap: 4,
    marginBottom: 20,
    borderBottom: '1px solid #30363d',
    paddingBottom: 0,
  }

  const timeRangeStyle: React.CSSProperties = {
    display: 'flex',
    gap: 8,
    marginBottom: 20,
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    color: '#f0f6fc',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  }

  const tableHeaderStyle: React.CSSProperties = {
    display: 'grid',
    padding: '8px 16px',
    background: '#161b22',
    borderBottom: '1px solid #30363d',
    fontSize: 11,
    fontWeight: 600,
    color: '#8b949e',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }

  return (
    <div style={containerStyle}>
      {/* 头部 */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={titleStyle}>💰 成本效益分析</div>
            <div style={subtitleStyle}>放射科 CT/MRI/DSA 设备 · 耗材 · 人力成本综合分析</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['month', 'quarter', 'year'] as TimeRange[]).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  background: timeRange === range ? PRIMARY : '#21262d',
                  color: timeRange === range ? '#fff' : '#8b949e',
                  transition: 'all 0.2s',
                }}
              >
                {range === 'month' ? '月度' : range === 'quarter' ? '季度' : '年度'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab切换 */}
      <div style={tabsStyle}>
        {([
          { key: 'overview', label: '综合概览', icon: BarChart3 },
          { key: 'equipment', label: '设备成本', icon: Server },
          { key: 'consumable', label: '耗材成本', icon: Film },
          { key: 'labor', label: '人力成本', icon: Users },
          { key: 'benefit', label: '效益分析', icon: TrendingUp },
        ] as { key: TabType; label: string; icon: any }[]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #3b82f6' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === tab.key ? '#f0f6fc' : '#8b949e',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s',
            }}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== 综合概览 ==================== */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* 核心指标卡片 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <CostCard
              title="年度总成本"
              value={formatCurrency(summaryData.totalCost)}
              subtitle="设备+耗材+人力"
              icon={DollarSign}
              trend="up"
              trendValue="+5.2%"
              color="#ef4444"
            />
            <CostCard
              title="月均成本"
              value={formatCurrency(summaryData.monthlyAvgCost)}
              subtitle="月度平均支出"
              icon={Calendar}
              color="#f59e0b"
            />
            <CostCard
              title="年度总收入"
              value={formatCurrency(summaryData.latestRevenue)}
              subtitle="最新月份收入"
              icon={TrendingUp}
              trend="up"
              trendValue="+12.5%"
              color="#22c55e"
            />
            <CostCard
              title="人次均成本"
              value={formatCurrency(summaryData.costPerExam, true)}
              subtitle={`共 ${summaryData.totalExams.toLocaleString()} 人次`}
              icon={Users}
              color="#3b82f6"
            />
          </div>

          {/* 成本构成 */}
          <div style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 8,
            padding: 20,
          }}>
            <div style={sectionTitleStyle}>
              <PieChartIcon size={16} color="#8b949e" />
              成本构成分析
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
              <SimplePieChart data={costCompositionData} size={140} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {costCompositionData.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: '#f0f6fc' }}>{item.label}</span>
                      <span style={{ fontSize: 13, color: item.color, fontWeight: 600 }}>
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                    <div style={{ height: 6, background: '#21262d', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        width: `${(item.value / summaryData.totalCost) * 100}%`,
                        height: '100%',
                        background: item.color,
                        borderRadius: 3,
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 月度趋势 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: 8,
              padding: 20,
            }}>
              <div style={sectionTitleStyle}>
                <Activity size={16} color="#3b82f6" />
                月度成本趋势
              </div>
              <SimpleBarChart data={costTrendData} height={180} />
            </div>
            <div style={{
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: 8,
              padding: 20,
            }}>
              <div style={sectionTitleStyle}>
                <TrendingUp size={16} color="#22c55e" />
                月度利润趋势
              </div>
              <SimpleBarChart data={benefitTrendData} height={180} />
            </div>
          </div>

          {/* 设备成本效率 */}
          <div style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 8,
            padding: 20,
          }}>
            <div style={sectionTitleStyle}>
              <Monitor size={16} color="#3b82f6" />
              设备成本效率排名
            </div>
            <div style={tableHeaderStyle} style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 80px 100px 100px 100px 100px',
              gap: 8,
              padding: '8px 16px',
              background: '#21262d',
              borderBottom: '1px solid #30363d',
              fontSize: 11,
              fontWeight: 600,
              color: '#8b949e',
            }}>
              <span>#</span>
              <span>设备名称</span>
              <span>类型</span>
              <span>采购价(万)</span>
              <span>年成本(万)</span>
              <span>年检查量</span>
              <span>单次成本</span>
            </div>
            {equipmentWithUnitCost
              .sort((a, b) => a.unitCost - b.unitCost)
              .slice(0, 4)
              .map((eq, idx) => (
                <EquipmentRow key={eq.id} equipment={eq} index={idx} />
              ))}
          </div>
        </div>
      )}

      {/* ==================== 设备成本 ==================== */}
      {activeTab === 'equipment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <CostCard
              title="设备总资产"
              value={formatCurrency(EQUIPMENT_DATA.reduce((s, e) => s + e.purchasePrice, 0))}
              subtitle={`${EQUIPMENT_DATA.length} 台设备`}
              icon={Server}
              color="#3b82f6"
            />
            <CostCard
              title="年维护费用"
              value={formatCurrency(EQUIPMENT_DATA.reduce((s, e) => s + e.annualMaintenance, 0))}
              subtitle="年度维保支出"
              icon={Activity}
              color="#f59e0b"
            />
            <CostCard
              title="年检查总量"
              value={EQUIPMENT_DATA.reduce((s, e) => s + e.annualUsage, 0).toLocaleString()}
              subtitle="合计检查人次"
              icon={Monitor}
              color="#22c55e"
            />
          </div>

          <div style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 8,
            padding: 20,
          }}>
            <div style={sectionTitleStyle}>
              <Server size={16} color="#3b82f6" />
              设备成本明细
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 80px 100px 100px 100px 100px',
              gap: 8,
              padding: '8px 16px',
              background: '#21262d',
              borderBottom: '1px solid #30363d',
              fontSize: 11,
              fontWeight: 600,
              color: '#8b949e',
            }}>
              <span>#</span>
              <span>设备名称</span>
              <span>类型</span>
              <span>采购价(万)</span>
              <span>年成本(万)</span>
              <span>年检查量</span>
              <span>单次成本</span>
            </div>
            {equipmentWithUnitCost.map((eq, idx) => (
              <EquipmentRow key={eq.id} equipment={eq} index={idx} />
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: 8,
              padding: 20,
            }}>
              <div style={sectionTitleStyle}>
                <Monitor size={16} color="#3b82f6" />
                设备类型分布
              </div>
              <SimplePieChart data={[
                { label: 'CT设备', value: EQUIPMENT_DATA.filter(e => e.modality === 'CT').reduce((s, e) => s + e.purchasePrice, 0), color: '#3b82f6' },
                { label: 'MRI设备', value: EQUIPMENT_DATA.filter(e => e.modality === 'MRI').reduce((s, e) => s + e.purchasePrice, 0), color: '#8b5cf6' },
                { label: 'DSA设备', value: EQUIPMENT_DATA.filter(e => e.modality === 'DSA').reduce((s, e) => s + e.purchasePrice, 0), color: '#f59e0b' },
              ]} size={120} />
            </div>
            <div style={{
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: 8,
              padding: 20,
            }}>
              <div style={sectionTitleStyle}>
                <Scissors size={16} color="#22c55e" />
                单次检查成本分布
              </div>
              <SimpleBarChart data={equipmentWithUnitCost.map(eq => ({
                label: eq.modality,
                value: eq.unitCost,
                color: eq.modality === 'CT' ? '#3b82f6' : eq.modality === 'MRI' ? '#8b5cf6' : '#f59e0b',
              }))} height={160} />
            </div>
          </div>
        </div>
      )}

      {/* ==================== 耗材成本 ==================== */}
      {activeTab === 'consumable' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <CostCard
              title="胶片耗材"
              value={formatCurrency(CONSUMABLE_DATA.filter(c => c.category === '胶片').reduce((s, c) => s + c.annualCost, 0), true)}
              subtitle="X光胶片/打印片"
              icon={Film}
              color="#22c55e"
            />
            <CostCard
              title="对比剂"
              value={formatCurrency(CONSUMABLE_DATA.filter(c => c.category === '对比剂').reduce((s, c) => s + c.annualCost, 0), true)}
              subtitle="CT/MRI增强"
              icon={HeartPulse}
              color="#3b82f6"
            />
            <CostCard
              title="DSA耗材"
              value={formatCurrency(CONSUMABLE_DATA.filter(c => c.category === '耗材').reduce((s, c) => s + c.annualCost, 0), true)}
              subtitle="导管/介入耗材"
              icon={Activity}
              color="#f59e0b"
            />
            <CostCard
              title="耗材总计"
              value={formatCurrency(summaryData.totalConsumableCost)}
              subtitle={`${CONSUMABLE_DATA.length} 类耗材`}
              icon={Scissors}
              color="#ef4444"
            />
          </div>

          <div style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 8,
            padding: 20,
          }}>
            <div style={sectionTitleStyle}>
              <Film size={16} color="#22c55e" />
              耗材明细
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 80px 80px 100px 100px',
              gap: 8,
              padding: '8px 16px',
              background: '#21262d',
              borderBottom: '1px solid #30363d',
              fontSize: 11,
              fontWeight: 600,
              color: '#8b949e',
            }}>
              <span>#</span>
              <span>名称</span>
              <span>类别</span>
              <span>单价</span>
              <span>月用量</span>
              <span>年成本</span>
            </div>
            {CONSUMABLE_DATA.map((item, idx) => (
              <ConsumableRow key={item.id} item={item} index={idx} />
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: 8,
              padding: 20,
            }}>
              <div style={sectionTitleStyle}>
                <PieChartIcon size={16} color="#8b949e" />
                耗材类别占比
              </div>
              <SimplePieChart data={[
                { label: '胶片', value: CONSUMABLE_DATA.filter(c => c.category === '胶片').reduce((s, c) => s + c.annualCost, 0), color: '#22c55e' },
                { label: '对比剂', value: CONSUMABLE_DATA.filter(c => c.category === '对比剂').reduce((s, c) => s + c.annualCost, 0), color: '#3b82f6' },
                { label: '注射器', value: CONSUMABLE_DATA.filter(c => c.category === '注射器').reduce((s, c) => s + c.annualCost, 0), color: '#f59e0b' },
                { label: 'DSA耗材', value: CONSUMABLE_DATA.filter(c => c.category === '耗材').reduce((s, c) => s + c.annualCost, 0), color: '#ef4444' },
                { label: '其他', value: CONSUMABLE_DATA.filter(c => c.category === '其他').reduce((s, c) => s + c.annualCost, 0), color: '#8b949e' },
              ]} size={130} />
            </div>
            <div style={{
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: 8,
              padding: 20,
            }}>
              <div style={sectionTitleStyle}>
                <BarChart3 size={16} color="#3b82f6" />
                主要耗材成本排序
              </div>
              <SimpleBarChart data={CONSUMABLE_DATA
                .sort((a, b) => b.annualCost - a.annualCost)
                .slice(0, 6)
                .map(c => ({
                  label: c.category,
                  value: c.annualCost,
                  color: c.category === '胶片' ? '#22c55e' : c.category === '对比剂' ? '#3b82f6' : c.category === '耗材' ? '#ef4444' : '#f59e0b',
                }))} height={160} />
            </div>
          </div>
        </div>
      )}

      {/* ==================== 人力成本 ==================== */}
      {activeTab === 'labor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <CostCard
              title="技师人力"
              value={formatCurrency(laborWithWorkload.filter(l => l.role.includes('技师')).reduce((s, l) => s + l.annualCost, 0), true)}
              subtitle={`${laborWithWorkload.filter(l => l.role.includes('技师')).reduce((s, l) => s + l.count, 0)} 人`}
              icon={Users}
              color="#3b82f6"
            />
            <CostCard
              title="护士人力"
              value={formatCurrency(laborWithWorkload.filter(l => l.role.includes('护士')).reduce((s, l) => s + l.annualCost, 0), true)}
              subtitle={`${laborWithWorkload.filter(l => l.role.includes('护士')).reduce((s, l) => s + l.count, 0)} 人`}
              icon={Users}
              color="#22c55e"
            />
            <CostCard
              title="医师人力"
              value={formatCurrency(laborWithWorkload.filter(l => l.role.includes('医师')).reduce((s, l) => s + l.annualCost, 0), true)}
              subtitle={`${laborWithWorkload.filter(l => l.role.includes('医师')).reduce((s, l) => s + l.count, 0)} 人`}
              icon={Users}
              color="#f59e0b"
            />
            <CostCard
              title="人力总成本"
              value={formatCurrency(summaryData.totalLaborCost)}
              subtitle={`${LABOR_DATA.reduce((s, l) => s + l.count, 0)} 人`}
              icon={DollarSign}
              color="#ef4444"
            />
          </div>

          <div style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 8,
            padding: 20,
          }}>
            <div style={sectionTitleStyle}>
              <Users size={16} color="#3b82f6" />
              人力成本明细
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 60px 100px 100px 100px',
              gap: 8,
              padding: '8px 16px',
              background: '#21262d',
              borderBottom: '1px solid #30363d',
              fontSize: 11,
              fontWeight: 600,
              color: '#8b949e',
            }}>
              <span>#</span>
              <span>岗位</span>
              <span>人数</span>
              <span>月薪(元)</span>
              <span>年成本(元)</span>
              <span>人均年检查</span>
            </div>
            {laborWithWorkload.map((item, idx) => (
              <LaborRow key={item.id} item={item} index={idx} />
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: 8,
              padding: 20,
            }}>
              <div style={sectionTitleStyle}>
                <PieChartIcon size={16} color="#8b949e" />
                人力成本岗位占比
              </div>
              <SimplePieChart data={[
                { label: '放射技师', value: laborWithWorkload.filter(l => l.role.includes('技师')).reduce((s, l) => s + l.annualCost, 0), color: '#3b82f6' },
                { label: '护士', value: laborWithWorkload.filter(l => l.role.includes('护士')).reduce((s, l) => s + l.annualCost, 0), color: '#22c55e' },
                { label: '放射医师', value: laborWithWorkload.filter(l => l.role.includes('医师')).reduce((s, l) => s + l.annualCost, 0), color: '#f59e0b' },
                { label: '行政辅助', value: laborWithWorkload.filter(l => !l.role.includes('技师') && !l.role.includes('护士') && !l.role.includes('医师')).reduce((s, l) => s + l.annualCost, 0), color: '#8b949e' },
              ]} size={130} />
            </div>
            <div style={{
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: 8,
              padding: 20,
            }}>
              <div style={sectionTitleStyle}>
                <BarChart3 size={16} color="#22c55e" />
                各岗位年均成本
              </div>
              <SimpleBarChart data={[
                { label: 'CT技师', value: laborWithWorkload.find(l => l.id === 'tech-ct')?.annualCost || 0, color: '#3b82f6' },
                { label: 'MRI技师', value: laborWithWorkload.find(l => l.id === 'tech-mri')?.annualCost || 0, color: '#8b5cf6' },
                { label: 'DSA技师', value: laborWithWorkload.find(l => l.id === 'tech-dsa')?.annualCost || 0, color: '#f59e0b' },
                { label: '医师', value: laborWithWorkload.find(l => l.id === 'physician')?.annualCost || 0, color: '#22c55e' },
              ]} height={160} />
            </div>
          </div>
        </div>
      )}

      {/* ==================== 效益分析 ==================== */}
      {activeTab === 'benefit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <CostCard
              title="年度总收入"
              value={formatCurrency(BENEFIT_DATA.reduce((s, b) => s + b.revenue, 0))}
              subtitle="近12个月累计"
              icon={TrendingUp}
              trend="up"
              trendValue="+18.2%"
              color="#22c55e"
            />
            <CostCard
              title="年度总成本"
              value={formatCurrency(BENEFIT_DATA.reduce((s, b) => s + b.cost, 0))}
              subtitle="近12个月累计"
              icon={DollarSign}
              color="#ef4444"
            />
            <CostCard
              title="年度总利润"
              value={formatCurrency(BENEFIT_DATA.reduce((s, b) => s + b.profit, 0))}
              subtitle="收入-成本"
              icon={TrendingUp}
              trend="up"
              trendValue="+22.5%"
              color="#22c55e"
            />
            <CostCard
              title="利润率"
              value={formatPercent((BENEFIT_DATA.reduce((s, b) => s + b.profit, 0) / BENEFIT_DATA.reduce((s, b) => s + b.revenue, 0)) * 100)}
              subtitle="利润/收入"
              icon={BarChart3}
              color="#3b82f6"
            />
          </div>

          {/* 月度收入成本对比 */}
          <div style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 8,
            padding: 20,
          }}>
            <div style={sectionTitleStyle}>
              <BarChart3 size={16} color="#3b82f6" />
              月度收入 vs 成本趋势
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: '#22c55e' }} />
                <span style={{ fontSize: 12, color: '#8b949e' }}>收入</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: '#ef4444' }} />
                <span style={{ fontSize: 12, color: '#8b949e' }}>成本</span>
              </div>
            </div>
            <SimpleBarChart data={BENEFIT_DATA.map(b => ({
              label: b.month.slice(5),
              value: b.revenue,
              color: '#22c55e',
            }))} height={200} />
            <div style={{ marginTop: 12 }}>
              <SimpleBarChart data={BENEFIT_DATA.map(b => ({
                label: b.month.slice(5),
                value: b.cost,
                color: '#ef4444',
              }))} height={200} />
            </div>
          </div>

          {/* 月度利润趋势 */}
          <div style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 8,
            padding: 20,
          }}>
            <div style={sectionTitleStyle}>
              <TrendingUp size={16} color="#22c55e" />
              月度利润趋势
            </div>
            <SimpleBarChart data={benefitTrendData} height={200} />
          </div>

          {/* 效益统计表 */}
          <div style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 8,
            padding: 20,
          }}>
            <div style={sectionTitleStyle}>
              <Activity size={16} color="#8b949e" />
              月度效益明细
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '80px 100px 100px 100px 100px',
              gap: 8,
              padding: '8px 16px',
              background: '#21262d',
              borderBottom: '1px solid #30363d',
              fontSize: 11,
              fontWeight: 600,
              color: '#8b949e',
            }}>
              <span>月份</span>
              <span>收入(万)</span>
              <span>成本(万)</span>
              <span>利润(万)</span>
              <span>检查量</span>
            </div>
            {BENEFIT_DATA.map((item, idx) => {
              const profitRate = (item.profit / item.revenue) * 100
              return (
                <div key={item.month} style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 100px 100px 100px 100px',
                  gap: 8,
                  padding: '12px 16px',
                  borderBottom: '1px solid #21262d',
                  background: idx % 2 === 0 ? '#0d1117' : '#161b22',
                  alignItems: 'center',
                }}>
                  <span style={{ color: '#8b949e', fontSize: 13 }}>{item.month}</span>
                  <span style={{ color: '#22c55e', fontSize: 13 }}>{formatCurrency(item.revenue)}</span>
                  <span style={{ color: '#ef4444', fontSize: 13 }}>{formatCurrency(item.cost)}</span>
                  <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 600 }}>{formatCurrency(item.profit)}</span>
                  <span style={{ color: '#f0f6fc', fontSize: 13 }}>
                    {item.examCount.toLocaleString()}
                    <span style={{ color: '#6e7681', fontSize: 11, marginLeft: 4 }}>
                      ({profitRate > 0 ? '+' : ''}{profitRate.toFixed(1)}%)
                    </span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
