import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import type { KpiValue, KpiDefinition } from '../../types/analytics';

export interface KpiCardProps {
  definition: KpiDefinition;
  value: KpiValue;
  period?: string;
}

const TREND_ICON: Record<string, React.ElementType> = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus };
const TREND_COLOR: Record<string, string> = { up: '#10b981', down: '#dc2626', flat: '#6b7280' };

/**
 * v3.0.6.8-23c (A8): 24px sparkline + stable sparkline spacing
 */
const SPARKLINE_HEIGHT = 24;

export default function KpiCard({ definition, value, period }: KpiCardProps) {
  const TrendIcon = TREND_ICON[value.trend] ?? Minus;
  const trendColor = TREND_COLOR[value.trend] ?? '#6b7280';
  const isGood = definition.higherIsBetter ? value.trend === 'up' : value.trend === 'down';
  const displayColor = value.trend === 'flat' ? '#6b7280' : isGood ? '#10b981' : '#dc2626';

  const formatValue = (v: number): string => {
    if (definition.format === 'percent') return `${v}%`;
    if (definition.format === 'minutes') return `${v}m`;
    if (definition.format === 'hours') return `${v}h`;
    if (definition.format === 'currency') return `¥${v.toLocaleString()}`;
    if (definition.format === 'score') return `${v}`;
    return v.toLocaleString();
  };

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 14, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>{definition.name}</span>
        <span style={{ fontSize: 9, color: '#94a3b8', background: '#f1f5f9', padding: '1px 6px', borderRadius: 3 }}>{period ?? ''}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>{formatValue(value.value)}</span>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>{definition.unit}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: displayColor }}>
          <TrendIcon size={12} />
          <span style={{ fontSize: 11, fontWeight: 600 }}>{value.mom ?? 0}%</span>
        </div>
        {value.yoy !== undefined && (
          <span style={{ fontSize: 10, color: '#94a3b8' }}>同比 {value.yoy > 0 ? '+' : ''}{value.yoy}%</span>
        )}
      </div>
      {value.sparkline && (
        <div style={{ height: SPARKLINE_HEIGHT, display: 'flex', alignItems: 'flex-end', gap: 1, marginTop: 4 }}>
          {value.sparkline.map((pt, i) => {
            const max = Math.max(...(value.sparkline ?? [1]));
            const h = Math.max(2, (pt / max) * (SPARKLINE_HEIGHT - 4));
            return <div key={i} style={{ flex: 1, height: `${h}px`, background: '#3b82f6', borderRadius: 1, opacity: 0.6 + (i / (value.sparkline?.length ?? 1)) * 0.4 }} />;
          })}
        </div>
      )}
      {value.target !== undefined && (
        <div style={{ marginTop: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#94a3b8', marginBottom: 2 }}>
            <span>目标: {formatValue(value.target)}</span>
            <span>{value.achieved !== undefined ? `${value.achieved}%` : ''}</span>
          </div>
          <div style={{ height: 4, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, value.achieved ?? 0)}%`, height: '100%', background: (value.achieved ?? 0) >= 100 ? '#10b981' : (value.achieved ?? 0) >= 75 ? '#f59e0b' : '#dc2626', borderRadius: 2 }} />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * v3.0.6.8-23c (A8): responsive KPI grid using auto-fit.
 * Drop-in replacement for fixed `repeat(N, 1fr)` grids in 6 dashboards.
 */
export function KpiAutoGrid({ children, min = 220, gap = 16, style }: { children: React.ReactNode; min?: number; gap?: number; style?: React.CSSProperties }) {
  return (
    <div
      data-testid="kpi-auto-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
        gap,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
