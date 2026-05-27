// ============================================================
// G005 放射科RIS系统 - DRG/DIP分组器页面
// 诊断相关分组 · 病历分组结果 · 100+分组规则
// ============================================================
// @ts-nocheck
import { useState, useMemo } from 'react'
import {
  Activity, Search, Filter, RefreshCw, ChevronLeft, ChevronRight,
  FileText, Calendar, User, Clock, Settings, BarChart3,
  CheckCircle, XCircle, AlertTriangle, TrendingUp, DollarSign,
  Package, Layers, Stethoscope, HeartPulse, Gauge, Target,
  ArrowRightLeft, Calculator, Database, ListOrdered, BookOpen,
  ClipboardList, CheckSquare, XSquare, Zap, Shield, Briefcase
} from 'lucide-react'

// ==================== 类型定义 ====================
type TabType = 'cases' | 'rules' | 'metrics' | 'batch'
type CaseStatus = '已分组' | '待审核' | '已完成'

// 病例记录
interface DRGRecord {
  id: string
  patientId: string
  patientName: string
  gender: '男' | '女'
  age: number
  admissionDate: string
  dischargeDate: string
  mainDiagnosis: string
  secondaryDiagnoses: string[]
  procedures: string[]
  totalCost: number
  standardCost: number
  drgCode: string
  drgName: string
  adrgCode: string
  adrgName: string
  mdcCode: string
  mdcName: string
  weight: number
  price: number
  status: CaseStatus
  stayDays: number
  cmi: number
}

// 分组规则
interface DRGRule {
  id: number
  code: string
  name: string
  type: 'MDC' | 'ADRG' | 'DRG'
  parentCode?: string
  mdcCode?: string
  mdcName?: string
  adrgCode?: string
  adrgName?: string
  conditions: string[]
  icdCodes: string[]
  procedureCodes?: string[]
  weight: number
  price: number
  description: string
  priority: number
  exclusiveGroup?: string
}

// 质量指标
interface QualityMetrics {
  totalCases: number
  avgWeight: number
  cmi: number
  avgStayDays: number
  avgCost: number
  avgStandardCost: number
  costDeviation: number
  groupingRate: number
  unbundledCases: number
}

// ==================== 常量 ====================
const PRIMARY = '#1e40af'
const PRIMARY_LIGHT = '#3b82f6'
const ACCENT = '#f59e0b'

// ==================== 导入数据 ====================
import { DRG_RECORDS, DRG_RULES } from '../data/initialData'

// ==================== 样式 ====================
const styles: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
    marginBottom: 20,
  },
  kpiCard: {
    background: '#fff',
    borderRadius: 10,
    padding: '16px 18px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  kpiIcon: {
    width: 44, height: 44, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  kpiValue: {
    fontSize: 26, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2,
  },
  kpiLabel: {
    fontSize: 13, color: '#64748b', marginTop: 2,
  },
  tabs: {
    display: 'flex',
    gap: 0,
    borderBottom: '2px solid #e2e8f0',
    marginBottom: 20,
  },
  tab: {
    padding: '12px 24px',
    fontSize: 15,
    fontWeight: 600,
    color: '#64748b',
    background: 'none',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  tabActive: {
    color: PRIMARY,
    borderBottomColor: PRIMARY,
  },
  toolbar: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    background: '#fff',
    padding: '14px 18px',
    borderRadius: 10,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    marginBottom: 16,
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '8px 14px',
    flex: 1,
    minWidth: 200,
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: 14,
    color: '#334155',
    width: '100%',
  },
  select: {
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '8px 14px',
    fontSize: 14,
    color: '#334155',
    background: '#f8fafc',
    outline: 'none',
    cursor: 'pointer',
  },
  tableWrapper: {
    background: '#fff',
    borderRadius: 10,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 14,
  },
  th: {
    background: '#f8fafc',
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontWeight: 600,
    color: '#475569',
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    color: '#334155',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  },
  badgeSuccess: {
    background: '#dcfce7',
    color: '#166534',
  },
  badgeWarning: {
    background: '#fef3c7',
    color: '#d97706',
  },
  badgeInfo: {
    background: '#dbeafe',
    color: '#1e40af',
  },
  badgeDanger: {
    background: '#fee2e2',
    color: '#dc2626',
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
  },
  btnPrimary: {
    background: PRIMARY,
    color: '#fff',
  },
  btnOutline: {
    background: 'transparent',
    border: '1px solid #e2e8f0',
    color: '#475569',
  },
  cardList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: 14,
  },
  card: {
    background: '#fff',
    borderRadius: 10,
    padding: '16px 18px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #f1f5f9',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ruleCard: {
    background: '#fff',
    borderRadius: 10,
    padding: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    marginBottom: 12,
    borderLeft: '4px solid #1e40af',
  },
  ruleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleTag: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
  },
  ruleCondition: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  metricCard: {
    background: '#fff',
    borderRadius: 10,
    padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  metricTitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1a3a5c',
  },
  detailModal: {
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
  },
  detailContent: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    width: 700,
    maxHeight: '80vh',
    overflow: 'auto',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderTop: '1px solid #e2e8f0',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#94a3b8',
  },
}

// ==================== 工具函数 ====================
const formatCurrency = (value: number): string => {
  return `¥${value.toLocaleString()}`
}

const formatDate = (date: string): string => {
  return date
}

// ==================== 子组件 ====================

// KPI卡片
function KpiCard({ title, value, subtitle, icon: Icon, color }: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ size?: number | string; color?: string }>
  color?: string
}) {
  return (
    <div style={styles.kpiCard}>
      <div style={{ ...styles.kpiIcon, background: `${color || PRIMARY}15` }}>
        <Icon size={22} color={color || PRIMARY} />
      </div>
      <div>
        <div style={styles.kpiValue}>{value}</div>
        <div style={styles.kpiLabel}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
  )
}

// 病例卡片
function CaseCard({ record, onClick }: { record: DRGRecord; onClick: () => void }) {
  const statusColors: Record<CaseStatus, { bg: string; color: string }> = {
    '已分组': { bg: '#dbeafe', color: '#1e40af' },
    '待审核': { bg: '#fef3c7', color: '#d97706' },
    '已完成': { bg: '#dcfce7', color: '#166534' },
  }

  const costDiff = record.totalCost - record.standardCost
  const costDiffPercent = record.standardCost > 0 ? ((costDiff / record.standardCost) * 100).toFixed(1) : '0'

  return (
    <div style={styles.card} onClick={onClick} className="cursor-pointer">
      <div style={styles.cardHeader}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1a3a5c' }}>{record.patientName}</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{record.patientId} · {record.gender} · {record.age}岁</div>
        </div>
        <span style={{ ...styles.badge, background: statusColors[record.status].bg, color: statusColors[record.status].color }}>
          {record.status}
        </span>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>主诊断</div>
        <div style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{record.mainDiagnosis}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        <div style={{ background: '#eff6ff', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>DRG编码</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e40af' }}>{record.drgCode}</div>
        </div>
        <div style={{ background: '#eff6ff', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>权重</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e40af' }}>{record.weight.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px', marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>{record.drgName}</div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>{record.adrgName} · {record.mdcName}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
        <span style={{ color: '#64748b' }}>住院 {record.stayDays} 天</span>
        <span style={{ fontWeight: 600, color: costDiff > 0 ? '#dc2626' : '#166534' }}>
          {costDiff >= 0 ? '+' : ''}{costDiffPercent}% 标准费用
        </span>
      </div>
    </div>
  )
}

// 分组规则卡片
function RuleCard({ rule }: { rule: DRGRule }) {
  const typeColors: Record<string, { bg: string; color: string }> = {
    'MDC': { bg: '#f1f5f9', color: '#475569' },
    'ADRG': { bg: '#dbeafe', color: '#1e40af' },
    'DRG': { bg: '#dcfce7', color: '#166534' },
  }

  return (
    <div style={styles.ruleCard}>
      <div style={styles.ruleHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ ...styles.ruleTag, background: typeColors[rule.type].bg, color: typeColors[rule.type].color }}>
            {rule.type}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1a3a5c' }}>{rule.code}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>{rule.name}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1e40af' }}>权重: {rule.weight.toFixed(2)}</span>
          <span style={{ fontSize: 13, color: '#166534' }}>¥{rule.price.toLocaleString()}</span>
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>
        {rule.description}
      </div>

      {rule.conditions.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginRight: 6 }}>入组条件:</span>
          {rule.conditions.map((c, i) => (
            <span key={i} style={{ fontSize: 11, color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, marginRight: 4 }}>
              {c}
            </span>
          ))}
        </div>
      )}

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        <span style={{ fontWeight: 600 }}>ICD:</span> {rule.icdCodes.join(', ')}
        {rule.procedureCodes && rule.procedureCodes.length > 0 && (
          <span style={{ marginLeft: 12 }}><span style={{ fontWeight: 600 }}>手术:</span> {rule.procedureCodes.join(', ')}</span>
        )}
      </div>
    </div>
  )
}

// ==================== 主组件 ====================
export default function DRGPage() {
  const [activeTab, setActiveTab] = useState<TabType>('cases')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('全部')
  const [filterMDC, setFilterMDC] = useState<string>('全部')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRecord, setSelectedRecord] = useState<DRGRecord | null>(null)
  const pageSize = 12

  // 计算质量指标
  const metrics: QualityMetrics = useMemo(() => {
    const totalCases = DRG_RECORDS.length
    const avgWeight = DRG_RECORDS.reduce((sum, r) => sum + r.weight, 0) / totalCases
    const cmi = avgWeight
    const avgStayDays = DRG_RECORDS.reduce((sum, r) => sum + r.stayDays, 0) / totalCases
    const avgCost = DRG_RECORDS.reduce((sum, r) => sum + r.totalCost, 0) / totalCases
    const avgStandardCost = DRG_RECORDS.reduce((sum, r) => sum + r.standardCost, 0) / totalCases
    const costDeviation = ((avgCost - avgStandardCost) / avgStandardCost * 100)
    const groupedCases = DRG_RECORDS.filter(r => r.drgCode !== '').length
    const groupingRate = (groupedCases / totalCases * 100)

    return {
      totalCases,
      avgWeight,
      cmi,
      avgStayDays,
      avgCost,
      avgStandardCost,
      costDeviation,
      groupingRate,
      unbundledCases: totalCases - groupedCases,
    }
  }, [])

  // 过滤病例
  const filteredRecords = useMemo(() => {
    return DRG_RECORDS.filter(record => {
      const matchSearch = searchKeyword === '' ||
        record.patientName.includes(searchKeyword) ||
        record.patientId.includes(searchKeyword) ||
        record.drgCode.includes(searchKeyword) ||
        record.drgName.includes(searchKeyword) ||
        record.mainDiagnosis.includes(searchKeyword)
      const matchStatus = filterStatus === '全部' || record.status === filterStatus
      const matchMDC = filterMDC === '全部' || record.mdcCode === filterMDC
      return matchSearch && matchStatus && matchMDC
    })
  }, [searchKeyword, filterStatus, filterMDC])

  // 分页
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRecords.slice(start, start + pageSize)
  }, [filteredRecords, currentPage])

  const totalPages = Math.ceil(filteredRecords.length / pageSize)

  // 获取MDC列表
  const mdcList = useMemo(() => {
    const mdcs = new Set(DRG_RECORDS.map(r => r.mdcCode))
    return ['全部', ...Array.from(mdcs)]
  }, [])

  // 统计数据
  const statsData = useMemo(() => ({
    passRate: metrics.groupingRate,
    totalCases: metrics.totalCases,
    avgCMI: metrics.cmi.toFixed(2),
    avgStay: metrics.avgStayDays.toFixed(1),
  }), [metrics])

  return (
    <div style={styles.root}>
      {/* 标题栏 */}
      <div style={styles.header}>
        <h2 style={styles.title}>DRG/DIP 分组器</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...styles.btn, ...styles.btnOutline }}>
            <RefreshCw size={16} />
            刷新规则
          </button>
          <button style={{ ...styles.btn, ...styles.btnPrimary }}>
            <Calculator size={16} />
            批量分组
          </button>
        </div>
      </div>

      {/* KPI指标 */}
      <div style={styles.kpiRow}>
        <KpiCard
          title="总病例数"
          value={statsData.totalCases}
          subtitle="本月入组"
          icon={FileText}
          color={PRIMARY}
        />
        <KpiCard
          title="分组率"
          value={`${statsData.passRate.toFixed(1)}%`}
          subtitle="成功入组"
          icon={Target}
          color="#166534"
        />
        <KpiCard
          title="CMI指数"
          value={statsData.avgCMI}
          subtitle="病例组合指数"
          icon={Gauge}
          color="#d97706"
        />
        <KpiCard
          title="平均住院"
          value={`${statsData.avgStay}天`}
          subtitle="人均住院日"
          icon={Clock}
          color="#8b5cf6"
        />
      </div>

      {/* 标签页 */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'cases' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('cases')}
        >
          <FileText size={16} />
          病例列表
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'rules' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('rules')}
        >
          <ListOrdered size={16} />
          分组规则 ({DRG_RULES.length})
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'metrics' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('metrics')}
        >
          <BarChart3 size={16} />
          质量指标
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'batch' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('batch')}
        >
          <Layers size={16} />
          批量分组
        </button>
      </div>

      {/* 病例列表 */}
      {activeTab === 'cases' && (
        <>
          <div style={styles.toolbar}>
            <div style={styles.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input
                style={styles.searchInput}
                placeholder="搜索患者姓名/ID/DRG编码/诊断..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <select style={styles.select} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="全部">全部状态</option>
              <option value="已分组">已分组</option>
              <option value="待审核">待审核</option>
              <option value="已完成">已完成</option>
            </select>
            <select style={styles.select} value={filterMDC} onChange={(e) => setFilterMDC(e.target.value)}>
              {mdcList.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div style={styles.cardList}>
            {paginatedRecords.map(record => (
              <CaseCard
                key={record.id}
                record={record}
                onClick={() => setSelectedRecord(record)}
              />
            ))}
          </div>

          {filteredRecords.length === 0 && (
            <div style={styles.emptyState}>
              <FileText size={48} color="#e2e8f0" style={{ marginBottom: 12 }} />
              <div>暂无符合条件的病例记录</div>
            </div>
          )}

          {filteredRecords.length > 0 && (
            <div style={styles.pagination}>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                显示 {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredRecords.length)} 条，共 {filteredRecords.length} 条
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  style={{ ...styles.btn, ...styles.btnOutline, padding: '6px 12px' }}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: 13, color: '#475569', padding: '6px 12px' }}>
                  第 {currentPage}/{totalPages} 页
                </span>
                <button
                  style={{ ...styles.btn, ...styles.btnOutline, padding: '6px 12px' }}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 分组规则 */}
      {activeTab === 'rules' && (
        <>
          <div style={styles.toolbar}>
            <div style={styles.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input
                style={styles.searchInput}
                placeholder="搜索规则编码/名称..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <select style={styles.select} value={filterMDC} onChange={(e) => setFilterMDC(e.target.value)}>
              <option value="全部">全部类型</option>
              <option value="MDC">MDC主分类</option>
              <option value="ADRG">ADRG核心分组</option>
              <option value="DRG">DRG细分组</option>
            </select>
          </div>

          <div>
            {DRG_RULES.filter(rule => {
              const matchSearch = searchKeyword === '' ||
                rule.code.includes(searchKeyword) ||
                rule.name.includes(searchKeyword)
              const matchType = filterMDC === '全部' || rule.type === filterMDC
              return matchSearch && matchType
            }).map(rule => (
              <RuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </>
      )}

      {/* 质量指标 */}
      {activeTab === 'metrics' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            <div style={styles.metricCard}>
              <div style={styles.metricTitle}>总病例数</div>
              <div style={styles.metricValue}>{metrics.totalCases}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>本月入组病例</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricTitle}>CMI指数</div>
              <div style={styles.metricValue}>{metrics.cmi.toFixed(2)}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>病例组合指数</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricTitle}>分组率</div>
              <div style={styles.metricValue}>{metrics.groupingRate.toFixed(1)}%</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>成功入组比例</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricTitle}>平均权重</div>
              <div style={styles.metricValue}>{metrics.avgWeight.toFixed(2)}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>DRG平均权重</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricTitle}>平均住院日</div>
              <div style={styles.metricValue}>{metrics.avgStayDays.toFixed(1)}天</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>人均住院天数</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricTitle}>费用偏差</div>
              <div style={{ ...styles.metricValue, color: metrics.costDeviation > 0 ? '#dc2626' : '#166534' }}>
                {metrics.costDeviation > 0 ? '+' : ''}{metrics.costDeviation.toFixed(1)}%
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>实际vs标准费用</div>
            </div>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>指标项</th>
                  <th style={styles.th}>当前值</th>
                  <th style={styles.th}>去年同期</th>
                  <th style={styles.th}>同比变化</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>平均住院日</td>
                  <td style={styles.td}>{metrics.avgStayDays.toFixed(1)}天</td>
                  <td style={styles.td}>7.2天</td>
                  <td style={{ ...styles.td, color: '#166534' }}>↓ 0.3天</td>
                </tr>
                <tr>
                  <td style={styles.td}>次均费用</td>
                  <td style={styles.td}>¥{(metrics.avgCost / 10000).toFixed(2)}万</td>
                  <td style={styles.td}>¥1.28万</td>
                  <td style={{ ...styles.td, color: '#dc2626' }}>↑ 5.2%</td>
                </tr>
                <tr>
                  <td style={styles.td}>CMI指数</td>
                  <td style={styles.td}>{metrics.cmi.toFixed(2)}</td>
                  <td style={styles.td}>0.98</td>
                  <td style={{ ...styles.td, color: '#166534' }}>↑ 0.05</td>
                </tr>
                <tr>
                  <td style={styles.td}>低风险死亡率</td>
                  <td style={styles.td}>0.12%</td>
                  <td style={styles.td}>0.15%</td>
                  <td style={{ ...styles.td, color: '#166534' }}>↓ 0.03%</td>
                </tr>
                <tr>
                  <td style={styles.td}>费用消耗指数</td>
                  <td style={styles.td}>1.05</td>
                  <td style={styles.td}>1.00</td>
                  <td style={{ ...styles.td, color: '#d97706' }}>↑ 0.05</td>
                </tr>
                <tr>
                  <td style={styles.td}>时间消耗指数</td>
                  <td style={styles.td}>0.96</td>
                  <td style={styles.td}>1.00</td>
                  <td style={{ ...styles.td, color: '#166534' }}>↓ 0.04</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 批量分组 */}
      {activeTab === 'batch' && (
        <div style={styles.tableWrapper}>
          <div style={{ padding: 24, textAlign: 'center' }}>
            <Layers size={64} color="#e2e8f0" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
              批量分组功能
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
              上传诊断和手术编码数据，批量进行DRG/DIP分组
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button style={{ ...styles.btn, ...styles.btnPrimary }}>
                <FileText size={16} />
                上传诊断数据
              </button>
              <button style={{ ...styles.btn, ...styles.btnOutline }}>
                <FileText size={16} />
                上传手术数据
              </button>
              <button style={{ ...styles.btn, ...styles.btnPrimary }}>
                <Calculator size={16} />
                开始分组
              </button>
            </div>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>批次号</th>
                <th style={styles.th}>上传时间</th>
                <th style={styles.th}>数据量</th>
                <th style={styles.th}>状态</th>
                <th style={styles.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>BATCH202605001</td>
                <td style={styles.td}>2026-05-02 10:30</td>
                <td style={styles.td}>156例</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, ...styles.badgeSuccess }}>已完成</span>
                </td>
                <td style={styles.td}>
                  <button style={{ ...styles.btn, ...styles.btnOutline, padding: '4px 10px', fontSize: 12 }}>查看详情</button>
                </td>
              </tr>
              <tr>
                <td style={styles.td}>BATCH202605002</td>
                <td style={styles.td}>2026-05-03 14:20</td>
                <td style={styles.td}>89例</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, ...styles.badgeSuccess }}>已完成</span>
                </td>
                <td style={styles.td}>
                  <button style={{ ...styles.btn, ...styles.btnOutline, padding: '4px 10px', fontSize: 12 }}>查看详情</button>
                </td>
              </tr>
              <tr>
                <td style={styles.td}>BATCH202605003</td>
                <td style={styles.td}>2026-05-04 09:15</td>
                <td style={styles.td}>234例</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, ...styles.badgeWarning }}>处理中</span>
                </td>
                <td style={styles.td}>
                  <button style={{ ...styles.btn, ...styles.btnOutline, padding: '4px 10px', fontSize: 12 }}>查看详情</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 详情弹窗 */}
      {selectedRecord && (
        <div style={styles.detailModal} onClick={() => setSelectedRecord(null)}>
          <div style={styles.detailContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a3a5c', margin: 0 }}>分组详情</h3>
              <button
                style={{ ...styles.btn, ...styles.btnOutline, padding: '4px 8px' }}
                onClick={() => setSelectedRecord(null)}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>患者姓名</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c' }}>{selectedRecord.patientName}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>患者ID</div>
                <div style={{ fontSize: 14, color: '#334155' }}>{selectedRecord.patientId}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>入院日期</div>
                <div style={{ fontSize: 14, color: '#334155' }}>{selectedRecord.admissionDate}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>出院日期</div>
                <div style={{ fontSize: 14, color: '#334155' }}>{selectedRecord.dischargeDate}</div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>主诊断</div>
              <div style={{ fontSize: 14, color: '#334155', background: '#f8fafc', padding: '10px 12px', borderRadius: 8 }}>
                {selectedRecord.mainDiagnosis}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>其他诊断</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{selectedRecord.secondaryDiagnoses.join('; ')}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>手术操作</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{selectedRecord.procedures.join('; ')}</div>
            </div>

            <div style={{ background: '#eff6ff', borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1e40af', marginBottom: 12 }}>分组结果</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>MDC分类</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{selectedRecord.mdcCode} {selectedRecord.mdcName}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>ADRG</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{selectedRecord.adrgCode} {selectedRecord.adrgName}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>DRG</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af' }}>{selectedRecord.drgCode}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>DRG名称</div>
                  <div style={{ fontSize: 13, color: '#334155' }}>{selectedRecord.drgName}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>权重</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#166534' }}>{selectedRecord.weight.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>定价(元)</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#166534' }}>¥{selectedRecord.price.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>实际费用</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#dc2626' }}>¥{selectedRecord.totalCost.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>标准费用</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#166534' }}>¥{selectedRecord.standardCost.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}