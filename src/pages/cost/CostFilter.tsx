import React from 'react'
import {
  BarChart3, Server, Film, Users, TrendingUp, Package, Clock, Percent, Award,
  Hash, BadgePercent, Landmark, ClipboardList, FileSpreadsheet, Gavel,
} from 'lucide-react'
import type { TimeRange, TabType } from './index'
import { PRIMARY } from './index'

const TABS_CONFIG: { key: TabType; label: string; icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
  { key: 'overview', label: '综合概览', icon: BarChart3 },
  { key: 'equipment', label: '设备成本', icon: Server },
  { key: 'consumable', label: '耗材成本', icon: Film },
  { key: 'labor', label: '人力成本', icon: Users },
  { key: 'benefit', label: '效益分析', icon: TrendingUp },
  { key: 'medicalConsumable', label: '卫材消耗', icon: Package },
  { key: 'depreciation', label: '设备折旧', icon: Clock },
  { key: 'profitMargin', label: '成本利润率', icon: Percent },
  { key: 'departmentRanking', label: '科室收益排名', icon: Award },
  { key: 'drg', label: 'DRG/DIP成本', icon: Hash },
  { key: 'breakeven', label: '盈亏平衡', icon: BadgePercent },
  { key: 'insurance', label: '保险分摊', icon: Landmark },
  { key: 'budget', label: '预算执行', icon: ClipboardList },
  { key: 'pl', label: '损益表', icon: FileSpreadsheet },
  { key: 'claims', label: '理赔跟踪', icon: Gavel },
]

export function CostFilter({ activeTab, onTabChange, timeRange, onTimeRangeChange }: {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
}) {
  const tabsStyle: React.CSSProperties = {
    display: 'flex',
    gap: 4,
    marginBottom: 20,
    borderBottom: '1px solid #30363d',
    paddingBottom: 0,
    flexWrap: 'wrap',
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f0f6fc', marginBottom: 4 }}>💰 成本效益分析</div>
          <div style={{ fontSize: 13, color: '#6e7681' }}>放射科 CT/MRI/DSA 设备 · 耗材 · 人力成本综合分析</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['month', 'quarter', 'year'] as TimeRange[]).map(range => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
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

      <div style={tabsStyle}>
        {TABS_CONFIG.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
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
    </>
  )
}
