/**
 * G005 RIS v3.0.6.6 - 工作负载热力图页面
 * 20 点升级
 */
import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import WorkloadHeatmap from '../components/worklist/WorkloadHeatmap';
import { WorkloadBalancer } from '../services/worklist/WorkloadBalancer';
import { HeatmapBuilder } from '../services/worklist/HeatmapBuilder';

const SITES = [
  { siteId: 'SITE-MAIN', siteName: '总院', doctors: 12, activeStudies: 48, pendingReports: 32, completedToday: 64, averageReportMinutes: 18, utilizationPct: 82 },
  { siteId: 'SITE-BRANCH', siteName: '分院', doctors: 6, activeStudies: 18, pendingReports: 12, completedToday: 28, averageReportMinutes: 22, utilizationPct: 65 },
  { siteId: 'SITE-WEST', siteName: '西院', doctors: 8, activeStudies: 12, pendingReports: 8, completedToday: 18, averageReportMinutes: 24, utilizationPct: 45 },
  { siteId: 'SITE-NORTH', siteName: '北院', doctors: 5, activeStudies: 30, pendingReports: 22, completedToday: 22, averageReportMinutes: 20, utilizationPct: 78 },
];

export default function WorkloadHeatmapPage() {
  const balancer = useMemo(() => new WorkloadBalancer(), []);
  const builder = useMemo(() => new HeatmapBuilder(), []);
  const sites = useMemo(() => balancer.ingest(SITES), [balancer]);
  const cells = useMemo(() => builder.build({ sites }), [builder, sites]);

  return (
    <div style={{ padding: 24, background: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ background: 'linear-gradient(135deg,#0891b2 0%,#06b6d4 100%)', color: '#fff', padding: '14px 24px', borderRadius: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 size={20} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>工作负载热力图</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>跨院区 24 小时负荷监控 · 自动均衡</div>
          </div>
        </div>
      </header>
      <WorkloadHeatmap sites={sites} cells={cells} />
      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {sites.map((s) => (
          <div key={s.siteId} style={{ background: '#fff', borderRadius: 10, padding: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: '#1e3a5f', fontSize: 13 }}>{s.siteName}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>容量评分 {s.capacityScore}</div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 6 }}>
              利用率 {s.utilizationPct}% · 报告 {s.pendingReports} · 医生 {s.doctors}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}