// ============================================================
// G005 放射科RIS系统 v1.0.7 - 报告 KPI 大盘
// Phase R7：15 大指标 / 设备利用率 / 24h / 7d 趋势
// ============================================================

import React, { useState } from 'react';
import {
  BarChart3, TrendingUp, Activity, FileText, Clock, CheckCircle2,
  Zap, Cpu, Sparkles, Target, Award, Cloud,
  Leaf, Server, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { REPORT_KPI } from '../data/knowledgeStatsMock';

// ============================================================
// 主组件
// ============================================================
export default function ReportKpiDashboardPage() {
  const kpi = REPORT_KPI;
  const [period, setPeriod] = useState<'today' | 'month' | 'year'>('month');

  return (
    <div style={{ padding: 20, maxWidth: 1600, margin: '0 auto' }}>
      {/* 顶部 */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={20} color="#1e40af" /> 报告 KPI 大盘
            <span style={{ fontSize: 10, padding: '2px 6px', background: '#10b981', color: '#fff', borderRadius: 3, fontWeight: 700 }}>R7</span>
          </h1>
          <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>
            15 大核心指标 · 设备利用率 · 24h/7d 趋势 · 无纸化 / 区块链
          </p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: '#fff', borderRadius: 6, padding: 3, border: '1px solid #cbd5e1' }}>
          {(['today', 'month', 'year'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '4px 10px', border: 'none', borderRadius: 4,
                background: period === p ? '#3b82f6' : 'transparent',
                color: period === p ? '#fff' : '#475569',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {p === 'today' ? '今日' : p === 'month' ? '本月' : '本年'}
            </button>
          ))}
        </div>
      </div>

      {/* 核心 KPI 4 大 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
        <BigKpi icon={FileText} label="报告数" value={kpi.monthReports} suffix="份" color="#3b82f6" trend="up" trendValue="8.3%" />
        <BigKpi icon={Clock} label="平均签发" value={kpi.avgSignTime} suffix="分钟" color="#7c3aed" trend="down" trendValue="2.1m" />
        <BigKpi icon={Target} label="甲级率" value={kpi.qualifiedRate} suffix="%" color="#10b981" trend="up" trendValue="3.5%" />
        <BigKpi icon={Sparkles} label="AI 采纳" value={kpi.aiUsageRate} suffix="%" color="#dc2626" trend="up" trendValue="5.2%" />
      </div>

      {/* 质量 + 时效 + 危急值 + CA + 区块链 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 12 }}>
        <MiniKpi icon={CheckCircle2} label="已签发" value={kpi.signedCount} color="#10b981" />
        <MiniKpi icon={Clock} label="待签发" value={kpi.pendingCount} color="#f59e0b" alert />
        <MiniKpi icon={Zap} label="危急值及时率" value={`${kpi.criticalValueOnTimeRate}%`} color="#7c3aed" />
        <MiniKpi icon={Award} label="平均质量分" value={kpi.avgQualityScore} color="#0ea5e9" />
        <MiniKpi icon={Server} label="区块链存证" value={kpi.blockchainVerified} color="#3b82f6" />
      </div>

      {/* 设备利用率 + 24h 分布 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        {/* 设备利用率 */}
        <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Cpu size={13} /> 设备利用率
            </div>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>本月</span>
          </div>
          {kpi.deviceUtilization.map(d => (
            <div key={d.device} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: '#1e293b', fontWeight: 600 }}>{d.device}</span>
                <span><strong style={{ color: d.rate > 85 ? '#10b981' : d.rate > 75 ? '#f59e0b' : '#94a3b8' }}>{d.rate}%</strong> <span style={{ color: '#94a3b8' }}>· {d.count} 份</span></span>
              </div>
              <div style={{ height: 14, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: `${d.rate}%`, height: '100%',
                  background: d.rate > 85 ? 'linear-gradient(90deg, #10b981, #059669)' : d.rate > 75 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #94a3b8, #64748b)',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* 24h 报告分布 */}
        <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Activity size={13} /> 24 小时报告分布
            </div>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>今日</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 120 }}>
            {kpi.hourlyDistribution.map((count, hour) => {
              const max = Math.max(...kpi.hourlyDistribution);
              const h = (count / max) * 100;
              return (
                <div key={hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <div style={{ fontSize: 8, color: '#94a3b8' }}>{count > 0 ? count : ''}</div>
                  <div style={{
                    width: '100%', height: `${h}%`, minHeight: 2,
                    background: count > 100 ? 'linear-gradient(180deg, #dc2626, #fca5a5)' : count > 50 ? 'linear-gradient(180deg, #f59e0b, #fde68a)' : 'linear-gradient(180deg, #3b82f6, #bfdbfe)',
                    borderRadius: 2,
                  }} />
                  {hour % 4 === 0 && <div style={{ fontSize: 8, color: '#94a3b8' }}>{hour}</div>}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-around', fontSize: 10, color: '#64748b' }}>
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:59</span>
          </div>
        </div>
      </div>

      {/* 7 天趋势 + 检查类型分布 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        {/* 7 天趋势 */}
        <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={13} /> 近 7 天报告趋势
            </div>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>本周 {kpi.weeklyTrend.reduce((a, b) => a + b, 0)} 份</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, padding: '0 8px' }}>
            {kpi.weeklyTrend.map((count, i) => {
              const max = Math.max(...kpi.weeklyTrend);
              const h = (count / max) * 100;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#1e40af' }}>{count}</div>
                  <div style={{
                    width: '100%', height: `${h}%`, minHeight: 6,
                    background: 'linear-gradient(180deg, #3b82f6, #93c5fd)',
                    borderRadius: '4px 4px 0 0',
                  }} />
                  <div style={{ fontSize: 10, color: '#64748b' }}>周{['一','二','三','四','五','六','日'][i]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 检查类型分布 */}
        <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={13} /> 检查类型分布
          </div>
          {Object.entries(kpi.modalityDistribution).map(([mod, count]) => {
            const total = Object.values(kpi.modalityDistribution).reduce((a, b) => a + b, 0);
            const pct = ((count / total) * 100).toFixed(1);
            const colors: Record<string, string> = {
              CT: '#3b82f6', MR: '#7c3aed', DR: '#0891b2', US: '#10b981', MG: '#ec4899', DSA: '#dc2626',
            };
            return (
              <div key={mod} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                  <span style={{ color: '#1e293b', fontWeight: 600 }}>{mod}</span>
                  <span><strong style={{ color: colors[mod] }}>{count}</strong> <span style={{ color: '#94a3b8' }}>({pct}%)</span></span>
                </div>
                <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: colors[mod] }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 绿色 IT + 区块链 + 推送 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <KpiSimple icon={Leaf} label="无纸化率" value={`${kpi.paperlessRate}%`} color="#10b981" sub="节省纸张" />
        <KpiSimple icon={Cloud} label="电子胶片率" value={`${kpi.electronicFilmRate}%`} color="#0891b2" sub="减少胶片浪费" />
        <KpiSimple icon={Leaf} label="碳减排" value={`${kpi.carbonReduction} t`} color="#059669" sub="本月累计" />
      </div>
    </div>
  );
}

// ============================================================
// 大字 KPI
// ============================================================
const BigKpi: React.FC<{ icon: any; label: string; value: number | string; suffix?: string; color: string; trend?: 'up' | 'down'; trendValue?: string }> = ({ icon: Icon, label, value, suffix, color, trend, trendValue }) => (
  <div style={{ background: '#fff', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} />
        </div>
        <span style={{ fontSize: 10, color: '#64748b' }}>{label}</span>
      </div>
      {trend && trendValue && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 10, color: trend === 'up' ? '#10b981' : '#dc2626' }}>
          {trend === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          <span style={{ fontWeight: 600 }}>{trendValue}</span>
        </div>
      )}
    </div>
    <div>
      <span style={{ fontSize: 28, fontWeight: 700, color }}>{value}</span>
      {suffix && <span style={{ fontSize: 14, color: '#94a3b8', marginLeft: 4 }}>{suffix}</span>}
    </div>
  </div>
);

// ============================================================
// 小字 KPI
// ============================================================
const MiniKpi: React.FC<{ icon: any; label: string; value: number | string; color: string; alert?: boolean }> = ({ icon: Icon, label, value, color, alert }) => (
  <div style={{ background: '#fff', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={16} />
    </div>
    <div>
      <div style={{ fontSize: 10, color: '#64748b' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: alert ? '#dc2626' : '#1e293b' }}>{value}</div>
    </div>
  </div>
);

// ============================================================
// 简约 KPI
// ============================================================
const KpiSimple: React.FC<{ icon: any; label: string; value: string; color: string; sub: string }> = ({ icon: Icon, label, value, color, sub }) => (
  <div style={{ background: '#fff', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
    <Icon size={20} color={color} />
    <div>
      <div style={{ fontSize: 10, color: '#64748b' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 9, color: '#94a3b8' }}>{sub}</div>
    </div>
  </div>
);
