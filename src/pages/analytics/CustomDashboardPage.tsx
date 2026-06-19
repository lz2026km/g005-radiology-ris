import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3 } from 'lucide-react';
import Dashboard from '../../components/analytics/Dashboard';
import type { DashboardWidget, KpiSnapshot } from '../../types/analytics';
import { kpiEngine } from '../../services/analytics/KpiEngine';
import { ANALYTICS_KPIS } from '../../data/analyticsKpis';

export default function CustomDashboardPage() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => [
    { id: 'w-1', type: 'kpi', kpiId: 'kpi-001', title: '报告总数' },
    { id: 'w-2', type: 'kpi', kpiId: 'kpi-010', title: '平均签发时长' },
    { id: 'w-3', type: 'kpi', kpiId: 'kpi-020', title: '甲级报告率' },
    { id: 'w-4', type: 'kpi', kpiId: 'kpi-030', title: '危急值及时率' },
    { id: 'w-5', type: 'kpi', kpiId: 'kpi-040', title: '设备利用率' },
    { id: 'w-6', type: 'kpi', kpiId: 'kpi-050', title: 'AI辅助率' },
  ]);
  const [snapshot, setSnapshot] = useState<KpiSnapshot | null>(null);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('month');

  useEffect(() => {
    const now = new Date();
    const rangeMap = {
      today: { start: now.toISOString().substring(0, 10), end: now.toISOString().substring(0, 10) },
      week: { start: new Date(now.getTime() - 7 * 86400000).toISOString().substring(0, 10), end: now.toISOString().substring(0, 10) },
      month: { start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().substring(0, 10), end: now.toISOString().substring(0, 10) },
    };
    const snap = kpiEngine.computeSnapshot(period, rangeMap[period]);
    setSnapshot(snap);
  }, [period]);

  const handleAddWidget = useCallback((type: DashboardWidget['type']) => {
    const defs = ANALYTICS_KPIS.filter(d => !widgets.some(w => w.kpiId === d.id));
    if (!defs.length) return;
    const def = defs[0]!;
    setWidgets(prev => [...prev, { id: `w-${Date.now()}`, type, kpiId: def.id, title: def.name }]);
  }, [widgets]);

  const handleRemoveWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  }, []);

  return (
    <div style={{ padding: 20, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 20, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={18} color="#1e40af" /> 自定义 KPI 大盘
          </h1>
          <p style={{ fontSize: 11, color: '#64748b', margin: '4px 0 0' }}>拖拽组件 · 自由配置 · 实时刷新</p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: '#fff', borderRadius: 6, padding: 3, border: '1px solid #cbd5e1' }}>
          {(['today', 'week', 'month'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: '4px 10px', border: 'none', borderRadius: 4,
              background: period === p ? '#3b82f6' : 'transparent',
              color: period === p ? '#fff' : '#475569',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>{p === 'today' ? '今日' : p === 'week' ? '本周' : '本月'}</button>
          ))}
        </div>
      </div>
      {snapshot && (
        <Dashboard
          widgets={widgets}
          snapshot={snapshot}
          definitions={ANALYTICS_KPIS}
          onAddWidget={handleAddWidget}
          onRemoveWidget={handleRemoveWidget}
        />
      )}
    </div>
  );
}
