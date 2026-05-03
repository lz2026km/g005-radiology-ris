// G005 放射科RIS系统 - 绿色IT无纸化环保统计页面 v1.0.0
import { useState } from 'react'
import {
  Leaf, FileText, Printer, CheckCircle, TrendingUp, TrendingDown,
  BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon,
  Calculator, TreePine, Percent, Download, RefreshCw
} from 'lucide-react'
import {
  LineChart, Line, BarChart as StatBarChart, Bar, PieChart as StatPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

// ============================================================
// 样式常量
// ============================================================
const C = {
  primary: '#1e40af',
  primaryLight: '#2563eb',
  primaryDark: '#1e3a8a',
  white: '#ffffff',
  background: '#f8fafc',
  text: '#1e293b',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  border: '#e2e8f0',
  success: '#059669',
  successBg: '#ecfdf5',
  successLight: '#d1fae5',
  warning: '#d97706',
  warningBg: '#fffbeb',
  info: '#2563eb',
  infoBg: '#eff6ff',
  purple: '#7c3aed',
  purpleBg: '#f5f3ff',
  green: '#16a34a',
  greenBg: '#f0fdf4',
}

// ============================================================
// 虚构数据生成
// ============================================================

// 30天无纸化率数据
const generatePaperlessData = () => {
  const data = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dayStr = `${date.getMonth() + 1}/${date.getDate()}`
    // 本期数据：无纸化率在65%-85%之间波动
    const currentRate = 65 + Math.random() * 20
    // 上月同期：略低5%左右
    const lastMonthRate = currentRate - 5 + Math.random() * 4
    data.push({
      date: dayStr,
      currentRate: Math.round(currentRate * 10) / 10,
      lastMonthRate: Math.round(lastMonthRate * 10) / 10,
      electronic: Math.floor(180 + Math.random() * 80),
      total: 280 + Math.floor(Math.random() * 40),
    })
  }
  return data
}

// 碳排放折算数据
const carbonData = {
  paperSaved: 12580, // 节省纸张（张）
  carbonFromPaper: 54.1, // 纸张碳排放折算（kg CO₂）
  inkSaved: 320, // 节省墨盒/硒鼓（套）
  carbonFromInk: 12.8, // 耗材碳排放折算（kg CO₂）
  totalCarbon: 66.9, // 总碳减排量（kg CO₂）
  treeEquivalent: Math.round(66.9 / 5), // 相当于植树XX棵（约5kg CO₂/棵/年）
}

// 电子签名数据
const signatureData = {
  electronicRate: 78.5, // 电子签名使用率%
  electronic: 6280,
  paper: 1720,
  departments: [
    { name: 'CT室', rate: 92.3, electronic: 456, paper: 38 },
    { name: 'MR室', rate: 88.7, electronic: 892, paper: 114 },
    { name: 'DR室', rate: 85.2, electronic: 1024, paper: 178 },
    { name: '超声科', rate: 79.8, electronic: 678, paper: 172 },
    { name: '介入科', rate: 76.5, electronic: 345, paper: 106 },
    { name: '核医学科', rate: 71.2, electronic: 289, paper: 117 },
    { name: '放射科门诊', rate: 68.4, electronic: 892, paper: 412 },
    { name: '体检中心', rate: 62.1, electronic: 456, paper: 278 },
  ],
}

// 成本节约数据
const costData = {
  paperCost: 12580 * 0.05, // 纸张成本（0.05元/张）
  inkCost: 320 * 280, // 耗材成本（280元/套）
  total: 0,
}
costData.total = costData.paperCost + costData.inkCost

// 统计数据
const stats = {
  paperlessRate: 78.2, // 本月无纸化率
  paperSaved: 12580, // 节省纸张
  carbonSaved: 66.9, // 节省碳排放
  signatureRate: 78.5, // 电子签名使用率
}

// ============================================================
// 组件
// ============================================================

interface StatCardProps {
  title: string
  value: string | number
  unit: string
  icon: React.ReactNode
  trend?: 'up' | 'down'
  trendValue?: string
  color?: string
}

function StatCard({ title, value, unit, icon, trend, trendValue, color = C.primary }: StatCardProps) {
  return (
    <div style={{
      background: C.white,
      borderRadius: 12,
      padding: '20px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    }}>
      <div style={{
        width: 56,
        height: 56,
        borderRadius: 12,
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 4 }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: C.text }}>{value}</span>
          <span style={{ fontSize: 14, color: C.textMuted }}>{unit}</span>
        </div>
        {trend && trendValue && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginTop: 4,
            fontSize: 12,
            color: trend === 'up' ? C.success : '#ef4444',
          }}>
            {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{trendValue}</span>
            <span style={{ color: C.textLight }}>vs上月</span>
          </div>
        )}
      </div>
    </div>
  )
}

interface TabButtonProps {
  label: string
  active: boolean
  onClick: () => void
  icon?: React.ReactNode
}

function TabButton({ label, active, onClick, icon }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 20px',
        border: 'none',
        borderBottom: active ? `2px solid ${C.primary}` : '2px solid transparent',
        background: 'transparent',
        color: active ? C.primary : C.textMuted,
        fontSize: 14,
        fontWeight: active ? 600 : 500,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

// 无纸化率趋势Tab
function PaperlessTrendTab() {
  const data = generatePaperlessData()

  return (
    <div>
      {/* 图表标题 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: 0 }}>30天无纸化率趋势</h3>
          <p style={{ fontSize: 13, color: C.textMuted, margin: '4px 0 0 0' }}>无纸化率 = 电子报告数 / 总报告数</p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 3, background: C.primary, borderRadius: 2 }} />
            <span style={{ fontSize: 12, color: C.textMuted }}>本期</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 3, background: '#94a3b8', borderRadius: 2 }} />
            <span style={{ fontSize: 12, color: C.textMuted }}>上月同期</span>
          </div>
        </div>
      </div>

      {/* 折线图 */}
      <div style={{
        background: C.white,
        borderRadius: 12,
        padding: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0',
      }}>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: C.textMuted }}
              tickLine={false}
              axisLine={{ stroke: C.border }}
            />
            <YAxis
              domain={[50, 100]}
              tick={{ fontSize: 11, fill: C.textMuted }}
              tickLine={false}
              axisLine={{ stroke: C.border }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number) => [`${value}%`, '']}
            />
            <Line
              type="monotone"
              dataKey="currentRate"
              stroke={C.primary}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: C.primary }}
            />
            <Line
              type="monotone"
              dataKey="lastMonthRate"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 4, fill: '#94a3b8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 统计摘要 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginTop: 20,
      }}>
        <div style={{
          background: C.white,
          borderRadius: 8,
          padding: '16px',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, color: C.textMuted }}>平均无纸化率</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.primary }}>75.8%</div>
        </div>
        <div style={{
          background: C.white,
          borderRadius: 8,
          padding: '16px',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, color: C.textMuted }}>最高无纸化率</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.success }}>85.2%</div>
        </div>
        <div style={{
          background: C.white,
          borderRadius: 8,
          padding: '16px',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, color: C.textMuted }}>本月电子报告</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.text }}>5,842</div>
        </div>
        <div style={{
          background: C.white,
          borderRadius: 8,
          padding: '16px',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, color: C.textMuted }}>环比增长</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.success }}>+5.3%</div>
        </div>
      </div>
    </div>
  )
}

// 碳排放折算Tab
function CarbonTab() {
  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: `${C.green}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: C.green,
        }}>
          <TreePine size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: 0 }}>碳排放折算</h3>
          <p style={{ fontSize: 13, color: C.textMuted, margin: '4px 0 0 0' }}>1张A4纸≈4.3g CO₂ · 1套耗材≈40kg CO₂</p>
        </div>
      </div>

      {/* 折算卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 16,
        marginBottom: 20,
      }}>
        {/* 纸张碳折算 */}
        <div style={{
          background: C.white,
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: C.infoBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.primary,
            }}>
              <FileText size={22} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: C.textMuted }}>节省纸张 → 碳排放</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>
                {carbonData.paperSaved.toLocaleString()} 张
              </div>
            </div>
          </div>
          <div style={{
            background: C.infoBg,
            borderRadius: 8,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 13, color: C.textMuted }}>碳减排量</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.primary }}>
              {carbonData.carbonFromPaper} kg CO₂
            </span>
          </div>
        </div>

        {/* 耗材碳折算 */}
        <div style={{
          background: C.white,
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: C.purpleBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.purple,
            }}>
              <Printer size={22} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: C.textMuted }}>节省耗材 → 碳排放</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>
                {carbonData.inkSaved} 套
              </div>
            </div>
          </div>
          <div style={{
            background: C.purpleBg,
            borderRadius: 8,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 13, color: C.textMuted }}>碳减排量</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.purple }}>
              {carbonData.carbonFromInk} kg CO₂
            </span>
          </div>
        </div>
      </div>

      {/* 总碳减排量 */}
      <div style={{
        background: `linear-gradient(135deg, ${C.green}, #059669)`,
        borderRadius: 12,
        padding: 28,
        color: C.white,
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 4 }}>本月总碳减排量</div>
            <div style={{ fontSize: 42, fontWeight: 700 }}>
              {carbonData.totalCarbon} <span style={{ fontSize: 18, fontWeight: 500 }}>kg CO₂</span>
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 12,
            padding: '20px 28px',
            textAlign: 'center',
          }}>
            <TreePine size={32} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 28, fontWeight: 700 }}>{carbonData.treeEquivalent}</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>棵植树</div>
          </div>
        </div>
      </div>

      {/* 碳减排柱状图 */}
      <div style={{
        background: C.white,
        borderRadius: 12,
        padding: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0',
      }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: '0 0 16px 0' }}>碳减排构成</h4>
        <ResponsiveContainer width="100%" height={200}>
          <StatBarChart
            data={[
              { name: '纸张', value: carbonData.carbonFromPaper },
              { name: '耗材', value: carbonData.carbonFromInk },
            ]}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: C.textMuted }} tickFormatter={(v) => `${v}kg`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: C.textMuted }} width={40} />
            <Tooltip
              contentStyle={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number) => [`${value} kg CO₂`, '']}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {[
                { name: '纸张', fill: C.primary },
                { name: '耗材', fill: C.purple },
              ].map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </StatBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// 电子签名使用统计Tab
function SignatureTab() {
  const pieData = [
    { name: '电子签名', value: signatureData.electronic, color: C.primary },
    { name: '纸质签名', value: signatureData.paper, color: '#94a3b8' },
  ]

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 20,
      }}>
        {/* 饼图 */}
        <div style={{
          background: C.white,
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0',
        }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: '0 0 16px 0' }}>电子签名 vs 纸质签名</h4>
          <ResponsiveContainer width="100%" height={220}>
            <StatPieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number) => [value.toLocaleString(), '']}
              />
            </StatPieChart>
          </ResponsiveContainer>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 24,
            marginTop: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: C.primary }} />
              <span style={{ fontSize: 12, color: C.textMuted }}>电子签名 {signatureData.electronicRate}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#94a3b8' }} />
              <span style={{ fontSize: 12, color: C.textMuted }}>纸质签名 {100 - signatureData.electronicRate}%</span>
            </div>
          </div>
        </div>

        {/* 各科室电子签名使用率排名 */}
        <div style={{
          background: C.white,
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0',
        }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: '0 0 16px 0' }}>各科室电子签名使用率排名</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {signatureData.departments.map((dept, index) => (
              <div key={dept.name}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      background: index < 3 ? C.primary : C.textLight,
                      color: C.white,
                      fontSize: 10,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {index + 1}
                    </span>
                    <span style={{ fontSize: 13, color: C.text }}>{dept.name}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.primary }}>{dept.rate}%</span>
                </div>
                <div style={{
                  height: 6,
                  background: C.border,
                  borderRadius: 3,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${dept.rate}%`,
                    background: index < 3 ? C.primary : C.textLight,
                    borderRadius: 3,
                    transition: 'width 0.3s',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// 节约成本Tab
function CostTab() {
  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: C.successBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: C.success,
        }}>
          <Calculator size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: 0 }}>节约成本统计</h3>
          <p style={{ fontSize: 13, color: C.textMuted, margin: '4px 0 0 0' }}>本月通过无纸化办公节约的成本</p>
        </div>
      </div>

      {/* 成本统计卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginBottom: 20,
      }}>
        {/* 纸张成本 */}
        <div style={{
          background: C.white,
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: C.infoBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: C.primary,
          }}>
            <FileText size={24} />
          </div>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 8 }}>节省纸张成本</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.text }}>
            ¥{costData.paperCost.toFixed(0)}
          </div>
          <div style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>
            {carbonData.paperSaved.toLocaleString()} 张 × ¥0.05
          </div>
        </div>

        {/* 耗材成本 */}
        <div style={{
          background: C.white,
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: C.purpleBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: C.purple,
          }}>
            <Printer size={24} />
          </div>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 8 }}>节省耗材成本</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.text }}>
            ¥{costData.inkCost.toFixed(0)}
          </div>
          <div style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>
            {carbonData.inkSaved} 套 × ¥280
          </div>
        </div>

        {/* 总成本 */}
        <div style={{
          background: `linear-gradient(135deg, ${C.success}, #059669)`,
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          textAlign: 'center',
          color: C.white,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Calculator size={24} />
          </div>
          <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 8 }}>总节约成本</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            ¥{costData.total.toFixed(0)}
          </div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>
            较上月 +12.5%
          </div>
        </div>
      </div>

      {/* 成本构成饼图 */}
      <div style={{
        background: C.white,
        borderRadius: 12,
        padding: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0',
      }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: '0 0 16px 0' }}>成本节约构成</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <ResponsiveContainer width={200} height={180}>
            <StatPieChart>
              <Pie
                data={[
                  { name: '纸张', value: costData.paperCost, color: C.primary },
                  { name: '耗材', value: costData.inkCost, color: C.purple },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                <Cell fill={C.primary} />
                <Cell fill={C.purple} />
              </Pie>
              <Tooltip
                contentStyle={{
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number) => [`¥${value.toFixed(2)}`, '']}
              />
            </StatPieChart>
          </ResponsiveContainer>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: C.primary }} />
                <span style={{ fontSize: 13, color: C.text }}>纸张节约</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginLeft: 20 }}>
                ¥{costData.paperCost.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: C.purple }} />
                <span style={{ fontSize: 13, color: C.text }}>耗材节约</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginLeft: 20 }}>
                ¥{costData.inkCost.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 主页面组件
// ============================================================
export default function GreenITPage() {
  const [activeTab, setActiveTab] = useState<'trend' | 'carbon' | 'signature' | 'cost'>('trend')

  const tabs = [
    { key: 'trend', label: '无纸化率趋势', icon: <LineChartIcon size={16} /> },
    { key: 'carbon', label: '碳排放折算', icon: <Leaf size={16} /> },
    { key: 'signature', label: '电子签名统计', icon: <CheckCircle size={16} /> },
    { key: 'cost', label: '节约成本', icon: <Calculator size={16} /> },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: C.background,
      padding: '24px',
    }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontSize: 22,
          fontWeight: 700,
          color: C.text,
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `${C.primary}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: C.primary,
          }}>
            <Leaf size={20} />
          </div>
          绿色IT · 无纸化环保统计
        </h1>
        <p style={{ fontSize: 13, color: C.textMuted, margin: '8px 0 0 0' }}>
          统计日期：2026年5月 · 数据每日更新
        </p>
      </div>

      {/* 顶部统计卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 24,
      }}>
        <StatCard
          title="本月无纸化率"
          value={stats.paperlessRate}
          unit="%"
          icon={<Percent size={24} />}
          trend="up"
          trendValue="+5.3%"
          color={C.primary}
        />
        <StatCard
          title="节省纸张"
          value={stats.paperSaved.toLocaleString()}
          unit="张"
          icon={<FileText size={24} />}
          trend="up"
          trendValue="+1,256张"
          color={C.info}
        />
        <StatCard
          title="节省碳排放"
          value={stats.carbonSaved}
          unit="kg CO₂"
          icon={<Leaf size={24} />}
          trend="up"
          trendValue="+8.2kg"
          color={C.green}
        />
        <StatCard
          title="电子签名使用率"
          value={stats.signatureRate}
          unit="%"
          icon={<CheckCircle size={24} />}
          trend="up"
          trendValue="+3.2%"
          color={C.purple}
        />
      </div>

      {/* Tab切换 */}
      <div style={{
        background: C.white,
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0',
        marginBottom: 16,
      }}>
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${C.border}`,
          padding: '0 8px',
        }}>
          {tabs.map(tab => (
            <TabButton
              key={tab.key}
              label={tab.label}
              icon={tab.icon}
              active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
            />
          ))}
        </div>

        {/* Tab内容 */}
        <div style={{ padding: 24 }}>
          {activeTab === 'trend' && <PaperlessTrendTab />}
          {activeTab === 'carbon' && <CarbonTab />}
          {activeTab === 'signature' && <SignatureTab />}
          {activeTab === 'cost' && <CostTab />}
        </div>
      </div>
    </div>
  )
}
