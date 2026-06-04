// ============================================================
// G005 放射科RIS系统 v1.0.5 - 危急值规则配置
// Phase R5：18 条危急值规则 · 7 类别 · 多渠道通报 · 响应时限
// ============================================================

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertOctagon, Settings, Edit2, Trash2, Save, Search,
  Phone, MessageSquare, Bell, Smartphone, Clock, Activity,
  BarChart3, Zap, CheckCircle2,
} from 'lucide-react';
import {
  CRITICAL_VALUE_RULES,
  CRITICAL_VALUE_KPI,
  type CriticalValueRule,
} from '../data/criticalValueAssessmentMock';

// ============================================================
// 类别配置
// ============================================================
const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  neuro:     { label: '神经',   color: '#7c3aed', bg: '#ede9fe' },
  cardio:    { label: '心血管', color: '#dc2626', bg: '#fee2e2' },
  pulmo:     { label: '胸部',   color: '#0891b2', bg: '#cffafe' },
  abdomen:   { label: '腹部',   color: '#f59e0b', bg: '#fef3c7' },
  trauma:    { label: '创伤',   color: '#7f1d1d', bg: '#fecaca' },
  vascular:  { label: '血管',   color: '#3b82f6', bg: '#dbeafe' },
  contrast:  { label: '造影剂', color: '#a855f7', bg: '#f3e8ff' },
};

const SEVERITY_CONFIG = {
  high:     { label: '高级', color: '#f59e0b', bg: '#fef3c7' },
  critical: { label: '危急', color: '#dc2626', bg: '#fee2e2' },
};

const CHANNEL_ICONS: Record<string, any> = {
  phone: Phone, sms: MessageSquare, wechat: Smartphone, inApp: Bell,
};

const CHANNEL_LABELS: Record<string, string> = {
  phone: '电话', sms: '短信', wechat: '微信', inApp: '站内',
};

// ============================================================
// 主组件
// ============================================================
export default function CriticalValueRulePage() {
  const navigate = useNavigate();
  const [rules] = useState<CriticalValueRule[]>(CRITICAL_VALUE_RULES);
  const [search, setSearch] = useState('');
  const [filterCategory] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>('cv-001');

  // 过滤
  const filteredRules = useMemo(() => {
    return rules.filter(r => {
      if (filterCategory !== 'all' && r.category !== filterCategory) return false;
      if (filterSeverity !== 'all' && r.severity !== filterSeverity) return false;
      if (search) {
        const t = search.toLowerCase();
        if (!r.name.toLowerCase().includes(t) &&
            !r.code.toLowerCase().includes(t) &&
            !r.findings.toLowerCase().includes(t)) return false;
      }
      return true;
    });
  }, [rules, search, filterCategory, filterSeverity]);

  const selectedRule = rules.find(r => r.id === selectedRuleId);
  const kpi = CRITICAL_VALUE_KPI;

  return (
    <div style={{ padding: 20, maxWidth: 1600, margin: '0 auto' }}>
      {/* 顶部 */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={20} color="#7c2d12" /> 危急值规则配置
            <span style={{ fontSize: 10, padding: '2px 6px', background: '#10b981', color: '#fff', borderRadius: 3, fontWeight: 700 }}>R5</span>
          </h1>
          <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>
            {rules.length} 条危急值规则 · 7 类别 · 4 通报渠道 · 自动触发 + 人工标识
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigate('/critical-value-stats')}
            style={{
              padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: 6,
              background: '#fff', color: '#475569', fontSize: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <BarChart3 size={12} /> 统计大屏
          </button>
          <button
            onClick={() => navigate('/critical-value')}
            style={{
              padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: 6,
              background: '#fff', color: '#475569', fontSize: 12, cursor: 'pointer',
            }}
          >
            返回危急值
          </button>
        </div>
      </div>

      {/* KPI 卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 16 }}>
        <KpiCard icon={AlertOctagon} label="本月危急值" value={kpi.totalThisMonth} color="#dc2626" />
        <KpiCard icon={Clock} label="待通报" value={kpi.pendingCount} color="#f59e0b" alert />
        <KpiCard icon={CheckCircle2} label="已处理" value={kpi.resolvedCount} color="#10b981" />
        <KpiCard icon={Zap} label="10分钟通报率" value={`${kpi.onTimeNotificationRate}%`} color="#7c3aed" good />
        <KpiCard icon={Activity} label="平均响应" value={`${kpi.avgResponseTimeMinutes}m`} color="#0891b2" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: 12 }}>
        {/* 左：规则列表 */}
        <div style={{
          background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden',
        }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={11} style={{ position: 'absolute', left: 8, top: 8, color: '#94a3b8' }} />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="搜索规则/所见..."
                  style={{
                    width: '100%', padding: '5px 8px 5px 26px',
                    border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 11, outline: 'none',
                  }}
                />
              </div>
              <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} style={selectStyle}>
                <option value="all">全部</option>
                <option value="critical">危急</option>
                <option value="high">高级</option>
              </select>
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              <strong style={{ color: '#7c2d12' }}>{filteredRules.length}</strong> / {rules.length} 条
            </div>
          </div>
          <div style={{ maxHeight: 600, overflowY: 'auto' }}>
            {filteredRules.map(r => {
              const cConf = CATEGORY_CONFIG[r.category];
              const sConf = SEVERITY_CONFIG[r.severity];
              const isSelected = r.id === selectedRuleId;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRuleId(r.id)}
                  style={{
                    padding: 10, borderBottom: '1px solid #f1f5f9',
                    background: isSelected ? '#fef2f2' : 'transparent',
                    borderLeft: isSelected ? `3px solid ${sConf.color}` : '3px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 9, padding: '1px 4px', borderRadius: 2,
                      background: cConf.bg, color: cConf.color, fontWeight: 600,
                    }}>{cConf.label}</span>
                    <span style={{
                      fontSize: 9, padding: '1px 4px', borderRadius: 2,
                      background: sConf.bg, color: sConf.color, fontWeight: 700,
                    }}>{sConf.label}</span>
                    <span style={{ fontSize: 9, color: '#94a3b8', marginLeft: 'auto' }}>{r.code}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{r.name}</div>
                  <div style={{ fontSize: 10, color: '#64748b', display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Clock size={9} color={sConf.color} />
                    <span>{r.responseDeadline}m</span>
                    <span>·</span>
                    {r.notificationChannels.slice(0, 2).map(c => {
                      const Icon = CHANNEL_ICONS[c];
                      return <Icon key={c} size={9} />;
                    })}
                    {r.notificationChannels.length > 2 && <span>+{r.notificationChannels.length - 2}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右：规则详情 */}
        {selectedRule && (
          <div style={{
            background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0',
          }}>
            {/* 头部 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 12,
                background: `${CATEGORY_CONFIG[selectedRule.category].color}15`,
                color: CATEGORY_CONFIG[selectedRule.category].color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertOctagon size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{selectedRule.name}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>编码：{selectedRule.code}</div>
              </div>
              <span style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 4,
                background: SEVERITY_CONFIG[selectedRule.severity].bg,
                color: SEVERITY_CONFIG[selectedRule.severity].color, fontWeight: 700,
              }}>{SEVERITY_CONFIG[selectedRule.severity].label}级</span>
            </div>

            {/* 元信息 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
              <InfoCell label="分类" value={CATEGORY_CONFIG[selectedRule.category].label} />
              <InfoCell label="响应时限" value={`${selectedRule.responseDeadline} 分钟`} color="#dc2626" />
              <InfoCell label="状态" value={selectedRule.isActive ? '✓ 已启用' : '✗ 已停用'} color={selectedRule.isActive ? '#10b981' : '#94a3b8'} />
            </div>

            {/* 适用设备 */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>适用设备</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {selectedRule.modality.map(m => (
                  <span key={m} style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 10,
                    background: '#dbeafe', color: '#1e40af', fontWeight: 600,
                  }}>{m}</span>
                ))}
              </div>
            </div>

            {/* 关键字 */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>触发关键字</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {selectedRule.keywords.map(k => (
                  <span key={k} style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 10,
                    background: '#fee2e2', color: '#b91c1c', fontWeight: 600,
                    fontFamily: 'monospace',
                  }}>{k}</span>
                ))}
              </div>
            </div>

            {/* 触发所见 */}
            <div style={{ marginBottom: 12, padding: 10, background: '#f8fafc', borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>触发所见模式</div>
              <div style={{ fontSize: 12, color: '#1e293b' }}>{selectedRule.findings}</div>
            </div>

            {/* 通报渠道 */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>通报渠道（同时触发）</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {selectedRule.notificationChannels.map(c => {
                  const Icon = CHANNEL_ICONS[c];
                  return (
                    <div key={c} style={{
                      padding: '4px 10px', borderRadius: 6,
                      background: '#f0fdf4', border: '1px solid #bbf7d0',
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 11, color: '#047857', fontWeight: 600,
                    }}>
                      <Icon size={11} /> {CHANNEL_LABELS[c]}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 描述 */}
            <div style={{ marginBottom: 12, padding: 10, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: '#92400e', fontWeight: 700, marginBottom: 4 }}>📋 临床意义</div>
              <div style={{ fontSize: 12, color: '#78350f' }}>{selectedRule.description}</div>
            </div>

            {/* 参考 */}
            <div style={{ marginBottom: 12, padding: 8, background: '#eff6ff', borderRadius: 4, fontSize: 11, color: '#1e40af' }}>
              📖 {selectedRule.reference}
            </div>

            {/* 操作 */}
            <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
              <button style={{ padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: 4, background: '#fff', color: '#475569', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Edit2 size={11} /> 编辑
              </button>
              <button style={{ padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: 4, background: '#fff', color: '#475569', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Activity size={11} /> 触发记录
              </button>
              <button style={{ padding: '5px 10px', border: 'none', borderRadius: 4, background: '#3b82f6', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                <Save size={11} /> 保存
              </button>
              <button style={{ padding: '5px 10px', border: '1px solid #dc2626', borderRadius: 4, background: '#fff', color: '#dc2626', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Trash2 size={11} /> 停用
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 样式
// ============================================================
const selectStyle: React.CSSProperties = {
  padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: 4,
  fontSize: 11, outline: 'none',
};

// ============================================================
// KPI 卡片
// ============================================================
const KpiCard: React.FC<{ icon: any; label: string; value: number | string; color: string; alert?: boolean; good?: boolean }> = ({ icon: Icon, label, value, color, alert, good }) => (
  <div style={{
    background: '#fff', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0',
    display: 'flex', alignItems: 'center', gap: 10,
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 8,
      background: `${color}15`, color: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={18} />
    </div>
    <div>
      <div style={{ fontSize: 10, color: '#64748b' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: good ? '#10b981' : alert ? '#dc2626' : '#1e293b' }}>{value}</div>
    </div>
  </div>
);

// ============================================================
// 信息单元
// ============================================================
const InfoCell: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div>
    <div style={{ fontSize: 10, color: '#94a3b8' }}>{label}</div>
    <div style={{ fontSize: 12, color: color || '#1e293b', fontWeight: 600, marginTop: 1 }}>{value}</div>
  </div>
);
