// @ts-nocheck
// G005 放射科RIS系统 - 设备效率分析页面（对标英飞达/锐科）
import { useState } from 'react'
import {
  Activity, Clock, TrendingUp, Timer, Zap, Gauge,
  Monitor, Settings, Search, Filter, ChevronDown,
  BarChart2, PieChart as PieChartIcon, Award, Download
} from 'lucide-react'

// ============================================================
// 样式常量
// ============================================================
const C = {
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  primaryLight: '#60a5fa',
  accent: '#3b82f6',
  white: '#ffffff',
  bg: '#0f172a',
  bgLight: '#1e293b',
  bgCard: '#1e293b',
  border: '#334155',
  borderLight: '#475569',
  textDark: '#f8fafc',
  textMid: '#cbd5e1',
  textLight: '#94a3b8',
  success: '#22c55e',
  successLight: '#86efac',
  warning: '#eab308',
  warningLight: '#fde047',
  danger: '#ef4444',
  dangerLight: '#fca5a5',
  info: '#06b6d4',
  infoLight: '#67e8f9',
  gray: '#6b7280',
  grayLight: '#9ca3af',
}

const STATUS_COLORS: Record<string, string> = {
  '运行中': C.success,
  '待机': C.warning,
  '维护': C.gray,
  '故障': C.danger,
}

// ============================================================
// 模拟数据
// ============================================================

// 设备列表
const DEVICES = [
  { id: 'SY-CT-001', name: 'CT-1', model: 'GE Revolution CT', type: 'CT', utilization: 87.5, status: '运行中' },
  { id: 'SY-CT-002', name: 'CT-2', model: '西门子SOMATOM Force', type: 'CT', utilization: 72.3, status: '待机' },
  { id: 'SY-MR-001', name: 'MRI-1', model: '西门子MAGNETOM Vida', type: 'MRI', utilization: 91.2, status: '运行中' },
  { id: 'SY-DSA-001', name: 'DSA', model: '飞利浦Azurion 7', type: 'DSA', utilization: 65.8, status: '维护' },
  { id: 'SY-DR-001', name: 'DR', model: '飞利浦DigitalDiagnost', type: 'DR', utilization: 78.6, status: '运行中' },
]

// 效率指标
const EFFICIENCY_METRICS = {
  avgExamTime: 18.5,      // 平均检查时间（分钟）
  dailyMax: 326,          // 日最大检查量
  bedTurnover: 4.2,       // 床位周转次数
  standbyHours: 2.3,      // 日待机时长（小时）
}

// 7天使用率趋势数据
const UTILIZATION_TREND = [
  { date: '04-27', CT1: 85.2, CT2: 70.5, MRI1: 88.7, DSA: 62.3, DR: 76.4 },
  { date: '04-28', CT1: 87.5, CT2: 73.1, MRI1: 91.2, DSA: 68.5, DR: 79.2 },
  { date: '04-29', CT1: 82.3, CT2: 75.8, MRI1: 85.6, DSA: 70.1, DR: 81.5 },
  { date: '04-30', CT1: 89.1, CT2: 71.2, MRI1: 93.4, DSA: 64.8, DR: 75.8 },
  { date: '05-01', CT1: 76.8, CT2: 68.4, MRI1: 79.5, DSA: 55.2, DR: 68.3 },
  { date: '05-02', CT1: 78.4, CT2: 69.7, MRI1: 82.1, DSA: 58.6, DR: 70.5 },
  { date: '05-03', CT1: 87.5, CT2: 72.3, MRI1: 91.2, DSA: 65.8, DR: 78.6 },
]

// 时段分析数据
const TIME_SEGMENT_DATA = [
  { period: '白班 08-18', CT: 156, MRI: 124, DSA: 45, DR: 189, total: 514 },
  { period: '夜班 18-08', CT: 68, MRI: 42, DSA: 18, DR: 72, total: 200 },
  { period: '周末', CT: 45, MRI: 38, DSA: 12, DR: 52, total: 147 },
]

// 设备负荷排行榜
const LOAD_RANKING = [
  { rank: 1, deviceId: 'SY-MR-001', deviceName: 'MRI-1', totalExams: 1842, avgUtilization: 91.2, avgWaitTime: 8.5, score: 95.6 },
  { rank: 2, deviceId: 'SY-CT-001', deviceName: 'CT-1', totalExams: 1658, avgUtilization: 87.5, avgWaitTime: 12.3, score: 89.2 },
  { rank: 3, deviceId: 'SY-DR-001', deviceName: 'DR', totalExams: 1432, avgUtilization: 78.6, avgWaitTime: 15.8, score: 82.4 },
  { rank: 4, deviceId: 'SY-CT-002', deviceName: 'CT-2', totalExams: 1298, avgUtilization: 72.3, avgWaitTime: 18.2, score: 76.8 },
  { rank: 5, deviceId: 'SY-DSA-001', deviceName: 'DSA', totalExams: 486, avgUtilization: 65.8, avgWaitTime: 25.6, score: 68.5 },
]

// ============================================================
// SVG折线图组件
// ============================================================
const TrendLineChart: React.FC<{ data: typeof UTILIZATION_TREND }> = ({ data }) => {
  const width = 600
  const height = 200
  const padding = { top: 20, right: 30, bottom: 30, left: 40 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const maxVal = 100
  const minVal = 50

  const scaleX = (i: number) => padding.left + (i / (data.length - 1)) * chartWidth
  const scaleY = (v: number) => padding.top + chartHeight - ((v - minVal) / (maxVal - minVal)) * chartHeight

  const devices = ['CT1', 'CT2', 'MRI1', 'DSA', 'DR']
  const colors = [C.primary, C.warning, C.success, C.info, '#a855f7']

  const createPath = (deviceKey: keyof typeof data[0]) => {
    return data.map((d, i) => {
      const val = d[deviceKey] as number
      const x = scaleX(i)
      const y = scaleY(val)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      {/* 网格线 */}
      {[50, 60, 70, 80, 90, 100].map(v => (
        <g key={v}>
          <line
            x1={padding.left} y1={scaleY(v)}
            x2={width - padding.right} y2={scaleY(v)}
            stroke={C.border} strokeWidth={1} strokeDasharray="4,4"
          />
          <text x={padding.left - 8} y={scaleY(v) + 4} fill={C.textLight} fontSize={10} textAnchor="end">
            {v}%
          </text>
        </g>
      ))}

      {/* X轴标签 */}
      {data.map((d, i) => (
        <text
          key={d.date}
          x={scaleX(i)} y={height - 5}
          fill={C.textLight} fontSize={10} textAnchor="middle"
        >
          {d.date}
        </text>
      ))}

      {/* 数据线 */}
      {devices.map((device, idx) => (
        <path
          key={device}
          d={createPath(device as keyof typeof data[0])}
          fill="none"
          stroke={colors[idx]}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}

      {/* 数据点 */}
      {devices.map((device, deviceIdx) => (
        data.map((d, i) => {
          const val = d[device as keyof typeof d] as number
          return (
            <circle
              key={`${device}-${i}`}
              cx={scaleX(i)}
              cy={scaleY(val)}
              r={4}
              fill={colors[deviceIdx]}
              stroke={C.bg} strokeWidth={2}
            />
          )
        })
      ))}

      {/* 图例 */}
      <g transform={`translate(${padding.left}, ${height + 15})`}>
        {devices.map((device, idx) => (
          <g key={device} transform={`translate(${idx * 90}, 0)`}>
            <line x1={0} y1={0} x2={20} y2={0} stroke={colors[idx]} strokeWidth={2} />
            <text x={25} y={4} fill={C.textLight} fontSize={10}>
              {device === 'CT1' ? 'CT-1' : device === 'CT2' ? 'CT-2' : device === 'MRI1' ? 'MRI-1' : device}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}

// ============================================================
// 时段分析柱状图
// ============================================================
const TimeSegmentChart: React.FC<{ data: typeof TIME_SEGMENT_DATA }> = ({ data }) => {
  const width = 500
  const height = 180
  const padding = { top: 15, right: 20, bottom: 30, left: 40 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const maxVal = 600
  const barGroupWidth = chartWidth / data.length
  const barWidth = 40
  const barGap = 8

  const devices = ['CT', 'MRI', 'DSA', 'DR']
  const colors = [C.primary, C.success, C.warning, C.info]

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      {/* 网格线 */}
      {[0, 150, 300, 450, 600].map(v => (
        <g key={v}>
          <line
            x1={padding.left} y1={padding.top + chartHeight - (v / maxVal) * chartHeight}
            x2={width - padding.right} y2={padding.top + chartHeight - (v / maxVal) * chartHeight}
            stroke={C.border} strokeWidth={1} strokeDasharray="4,4"
          />
          <text
            x={padding.left - 8}
            y={padding.top + chartHeight - (v / maxVal) * chartHeight + 4}
            fill={C.textLight} fontSize={10} textAnchor="end"
          >
            {v}
          </text>
        </g>
      ))}

      {/* 柱状图 */}
      {data.map((d, i) => {
        const groupX = padding.left + i * barGroupWidth + barGroupWidth / 2 - (barWidth * 2 + barGap * 1.5)
        return (
          <g key={d.period}>
            {devices.map((device, j) => {
              const val = d[device as keyof typeof d] as number
              const barHeight = (val / maxVal) * chartHeight
              return (
                <rect
                  key={device}
                  x={groupX + j * (barWidth + barGap)}
                  y={padding.top + chartHeight - barHeight}
                  width={barWidth}
                  height={barHeight}
                  fill={colors[j]}
                  rx={3}
                />
              )
            })}
            <text
              x={padding.left + i * barGroupWidth + barGroupWidth / 2}
              y={height - 8}
              fill={C.textLight} fontSize={9} textAnchor="middle"
            >
              {d.period}
            </text>
          </g>
        )
      })}

      {/* 图例 */}
      <g transform={`translate(${padding.left}, ${height + 12})`}>
        {devices.map((device, idx) => (
          <g key={device} transform={`translate(${idx * 60}, 0)`}>
            <rect x={0} y={-8} width={12} height={12} fill={colors[idx]} rx={2} />
            <text x={16} y={2} fill={C.textLight} fontSize={10}>{device}</text>
          </g>
        ))}
      </g>
    </svg>
  )
}

// ============================================================
// 设备状态灯组件
// ============================================================
const StatusLight: React.FC<{ status: string }> = ({ status }) => {
  const color = STATUS_COLORS[status] || C.gray
  const pulse = status === '运行中' ? 'pulse' : ''

  return (
    <span style={{
      display: 'inline-block',
      width: 10,
      height: 10,
      borderRadius: '50%',
      backgroundColor: color,
      marginRight: 6,
      boxShadow: `0 0 6px ${color}`,
      animation: pulse ? 'pulse 2s infinite' : 'none',
    }} />
  )
}

// ============================================================
// 主页面组件
// ============================================================
export default function EquipmentEfficiencyPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d')

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: C.bg,
      color: C.textDark,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: 24,
    }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontSize: 24,
          fontWeight: 600,
          color: C.textDark,
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <Activity size={28} color={C.primary} />
          设备效率分析
        </h1>
        <p style={{ color: C.textLight, fontSize: 14 }}>
          实时监控设备运行状态与效率指标，对标英飞达/锐科行业标准
        </p>
      </div>

      {/* 设备卡片行 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 16,
        marginBottom: 24,
      }}>
        {DEVICES.map((device) => (
          <div key={device.id} style={{
            backgroundColor: C.bgCard,
            borderRadius: 12,
            padding: 20,
            border: `1px solid ${C.border}`,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* 状态指示条 */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              backgroundColor: STATUS_COLORS[device.status],
            }} />

            {/* 设备名称和状态 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: C.textDark, marginBottom: 2 }}>{device.name}</h3>
                <p style={{ fontSize: 11, color: C.textLight }}>{device.model}</p>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: `${STATUS_COLORS[device.status]}20`,
                padding: '4px 10px',
                borderRadius: 12,
              }}>
                <StatusLight status={device.status} />
                <span style={{ fontSize: 12, color: STATUS_COLORS[device.status] }}>{device.status}</span>
              </div>
            </div>

            {/* 使用率 */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: C.textLight }}>使用率</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.primary }}>{device.utilization}%</span>
              </div>
              <div style={{
                height: 6,
                backgroundColor: C.border,
                borderRadius: 3,
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${device.utilization}%`,
                  height: '100%',
                  backgroundColor: C.primary,
                  borderRadius: 3,
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>

            {/* 设备ID */}
            <div style={{
              fontSize: 10,
              color: C.textLight,
              fontFamily: 'monospace',
              marginTop: 12,
            }}>
              {device.id}
            </div>
          </div>
        ))}
      </div>

      {/* 效率指标行 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 24,
      }}>
        <div style={{
          backgroundColor: C.bgCard,
          borderRadius: 12,
          padding: 20,
          border: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: `${C.primary}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Timer size={24} color={C.primary} />
          </div>
          <div>
            <p style={{ fontSize: 12, color: C.textLight, marginBottom: 4 }}>平均检查时间</p>
            <p style={{ fontSize: 24, fontWeight: 600, color: C.textDark }}>
              {EFFICIENCY_METRICS.avgExamTime}
              <span style={{ fontSize: 14, color: C.textLight, marginLeft: 4 }}>分钟</span>
            </p>
          </div>
        </div>

        <div style={{
          backgroundColor: C.bgCard,
          borderRadius: 12,
          padding: 20,
          border: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: `${C.success}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Zap size={24} color={C.success} />
          </div>
          <div>
            <p style={{ fontSize: 12, color: C.textLight, marginBottom: 4 }}>日最大检查量</p>
            <p style={{ fontSize: 24, fontWeight: 600, color: C.textDark }}>
              {EFFICIENCY_METRICS.dailyMax}
              <span style={{ fontSize: 14, color: C.textLight, marginLeft: 4 }}>例/日</span>
            </p>
          </div>
        </div>

        <div style={{
          backgroundColor: C.bgCard,
          borderRadius: 12,
          padding: 20,
          border: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: `${C.warning}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <TrendingUp size={24} color={C.warning} />
          </div>
          <div>
            <p style={{ fontSize: 12, color: C.textLight, marginBottom: 4 }}>床位周转次数</p>
            <p style={{ fontSize: 24, fontWeight: 600, color: C.textDark }}>
              {EFFICIENCY_METRICS.bedTurnover}
              <span style={{ fontSize: 14, color: C.textLight, marginLeft: 4 }}>次/日</span>
            </p>
          </div>
        </div>

        <div style={{
          backgroundColor: C.bgCard,
          borderRadius: 12,
          padding: 20,
          border: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: `${C.info}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Clock size={24} color={C.info} />
          </div>
          <div>
            <p style={{ fontSize: 12, color: C.textLight, marginBottom: 4 }}>日待机时长</p>
            <p style={{ fontSize: 24, fontWeight: 600, color: C.textDark }}>
              {EFFICIENCY_METRICS.standbyHours}
              <span style={{ fontSize: 14, color: C.textLight, marginLeft: 4 }}>小时</span>
            </p>
          </div>
        </div>
      </div>

      {/* 图表区域：使用率趋势 + 时段分析 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr',
        gap: 16,
        marginBottom: 24,
      }}>
        {/* 使用率趋势折线图 */}
        <div style={{
          backgroundColor: C.bgCard,
          borderRadius: 12,
          padding: 24,
          border: `1px solid ${C.border}`,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textDark, marginBottom: 4 }}>设备使用率趋势</h3>
              <p style={{ fontSize: 12, color: C.textLight }}>近7天各设备使用率变化</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['7d', '14d', '30d'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: 12,
                    cursor: 'pointer',
                    backgroundColor: selectedPeriod === period ? C.primary : C.border,
                    color: selectedPeriod === period ? C.white : C.textLight,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <TrendLineChart data={UTILIZATION_TREND} />
          </div>
        </div>

        {/* 检查量时段分析 */}
        <div style={{
          backgroundColor: C.bgCard,
          borderRadius: 12,
          padding: 24,
          border: `1px solid ${C.border}`,
        }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textDark, marginBottom: 4 }}>检查量时段分析</h3>
            <p style={{ fontSize: 12, color: C.textLight }}>白班/夜班/周末分类统计</p>
          </div>
          <TimeSegmentChart data={TIME_SEGMENT_DATA} />

          {/* 时段汇总 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            marginTop: 16,
            paddingTop: 16,
            borderTop: `1px solid ${C.border}`,
          }}>
            {TIME_SEGMENT_DATA.map((item) => (
              <div key={item.period} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 11, color: C.textLight, marginBottom: 4 }}>{item.period}</p>
                <p style={{ fontSize: 18, fontWeight: 600, color: C.primary }}>{item.total}</p>
                <p style={{ fontSize: 10, color: C.textLight }}>例</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 设备负荷排行榜 */}
      <div style={{
        backgroundColor: C.bgCard,
        borderRadius: 12,
        padding: 24,
        border: `1px solid ${C.border}`,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textDark, marginBottom: 4 }}>设备负荷排行榜</h3>
            <p style={{ fontSize: 12, color: C.textLight }}>综合评分基于使用率、等待时间、检查量等指标</p>
          </div>
          <button style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            backgroundColor: 'transparent',
            color: C.textLight,
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <Download size={14} />
            导出报表
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 13,
          }}>
            <thead>
              <tr style={{
                borderBottom: `1px solid ${C.border}`,
              }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: C.textLight, fontWeight: 500 }}>排名</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: C.textLight, fontWeight: 500 }}>设备编号</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: C.textLight, fontWeight: 500 }}>设备名称</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', color: C.textLight, fontWeight: 500 }}>总检查量</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', color: C.textLight, fontWeight: 500 }}>平均使用率</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', color: C.textLight, fontWeight: 500 }}>平均等待时间</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', color: C.textLight, fontWeight: 500 }}>综合评分</th>
              </tr>
            </thead>
            <tbody>
              {LOAD_RANKING.map((item, idx) => (
                <tr
                  key={item.deviceId}
                  style={{
                    borderBottom: `1px solid ${C.border}`,
                    backgroundColor: idx === 0 ? `${C.primary}08` : 'transparent',
                  }}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: idx === 0 ? C.primary : idx === 1 ? C.warning : idx === 2 ? C.info : C.border,
                      color: idx < 3 ? C.bg : C.textLight,
                      fontWeight: 600,
                      fontSize: 12,
                    }}>
                      {item.rank}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: C.textLight, fontFamily: 'monospace', fontSize: 12 }}>
                    {item.deviceId}
                  </td>
                  <td style={{ padding: '14px 16px', color: C.textDark, fontWeight: 500 }}>
                    {item.deviceName}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', color: C.textDark }}>
                    {item.totalExams.toLocaleString()} 例
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: 4,
                      backgroundColor: item.avgUtilization >= 85 ? `${C.success}20` :
                        item.avgUtilization >= 70 ? `${C.primary}20` : `${C.warning}20`,
                      color: item.avgUtilization >= 85 ? C.success :
                        item.avgUtilization >= 70 ? C.primary : C.warning,
                      fontSize: 12,
                      fontWeight: 500,
                    }}>
                      {item.avgUtilization}%
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', color: C.textDark }}>
                    {item.avgWaitTime} 分钟
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <div style={{
                        width: 100,
                        height: 6,
                        backgroundColor: C.border,
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${item.score}%`,
                          height: '100%',
                          backgroundColor: item.score >= 90 ? C.success :
                            item.score >= 75 ? C.primary : C.warning,
                          borderRadius: 3,
                        }} />
                      </div>
                      <span style={{
                        fontWeight: 600,
                        color: item.score >= 90 ? C.success :
                          item.score >= 75 ? C.primary : C.warning,
                        fontSize: 13,
                      }}>
                        {item.score}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 底部统计 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 20,
          paddingTop: 16,
          borderTop: `1px solid ${C.border}`,
          fontSize: 12,
          color: C.textLight,
        }}>
          <span>统计周期：近30天</span>
          <span>数据更新时间：2026-05-03 10:30</span>
        </div>
      </div>

      {/* CSS动画 */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
