// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 病灶追踪可视化组件
// Phase R11 W1: 时间线 + RECIST 反应可视化 + 病灶对比
// 50 升级点:病灶列表 / 时间线 / 反应分布 / 趋势图 / 双研究对比
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import { Activity, Calendar, TrendingDown, TrendingUp, GitCompare, RefreshCw, Plus, Search, X, Check, type LucideIcon } from 'lucide-react';
import type { TrackedLesion, LesionTrend, LesionComparison, LesionResponse } from '../../types/measurement';
import LesionTracker from '../../services/measurement/lesionTracking/LesionTracker';
import { LESION_MOCK, PATIENT_IDS } from '../../data/measurement/lesionMock';

interface Props {
  patientId?: string;
  onClose?: () => void;
  onSelectLesion?: (lesion: TrackedLesion) => void;
}

const RESPONSE_META: Record<LesionResponse, { label: string; color: string; bg: string }> = {
  CR: { label: '完全缓解', color: '#047857', bg: '#d1fae5' },
  PR: { label: '部分缓解', color: '#1d4ed8', bg: '#dbeafe' },
  SD: { label: '疾病稳定', color: '#b45309', bg: '#fef3c7' },
  PD: { label: '疾病进展', color: '#b91c1c', bg: '#fee2e2' },
  NE: { label: '无法评估', color: '#4b5563', bg: '#e5e7eb' },
};

const CATEGORY_LABEL: Record<TrackedLesion['category'], string> = {
  target: '靶病灶',
  'non-target': '非靶',
  new: '新发',
  resolved: '已消退',
};

function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length === 0) return null;
  const w = 120;
  const h = 30;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const step = w / Math.max(1, values.length - 1);
  const points = values
    .map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 4) - 2}`)
    .join(' ');
  return (
    <svg width={w} height={h} aria-label="trend">
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={points} />
      {values.map((v, i) => (
        <circle
          key={i}
          cx={i * step}
          cy={h - ((v - min) / range) * (h - 4) - 2}
          r={2}
          fill={color}
        />
      ))}
    </svg>
  );
}

export default function LesionTrackingViewer({ patientId, onClose, onSelectLesion }: Props) {
  const [lesions, setLesions] = useState<TrackedLesion[]>([]);
  const [search, setSearch] = useState('');
  const [activePatient, setActivePatient] = useState<string>(patientId ?? PATIENT_IDS[0] ?? '');
  const [compareA, setCompareA] = useState<string>('');
  const [compareB, setCompareB] = useState<string>('');
  const [comparison, setComparison] = useState<LesionComparison | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [trend, setTrend] = useState<LesionTrend | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const reload = async () => {
    setRefreshing(true);
    try {
      const pid = activePatient || undefined;
      const list = pid ? await LesionTracker.listByPatient(pid) : await LesionTracker.listAll();
      setLesions(list);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePatient]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return lesions.filter((l) =>
      !q || l.label.toLowerCase().includes(q) || l.location.organ.toLowerCase().includes(q),
    );
  }, [lesions, search]);

  const selected = useMemo(() => filtered.find((l) => l.id === selectedId) ?? filtered[0], [filtered, selectedId]);

  useEffect(() => {
    if (selected && selected.id !== selectedId) {
      setSelectedId(selected.id);
    }
  }, [selected, selectedId]);

  useEffect(() => {
    if (!selected) {
      setTrend(null);
      return;
    }
    void LesionTracker.getTrend(selected.id).then(setTrend);
  }, [selected]);

  const studies = useMemo(() => {
    const set = new Set<string>();
    for (const l of lesions) for (const s of l.snapshots) set.add(s.studyInstanceUID);
    return Array.from(set);
  }, [lesions]);

  const runCompare = async () => {
    if (!selected || !compareA || !compareB) return;
    const result = await LesionTracker.compareStudies(selected.id, compareA, compareB);
    setComparison(result);
  };

  const responseSummary = useMemo(() => {
    const map: Record<LesionResponse, number> = { CR: 0, PR: 0, SD: 0, PD: 0, NE: 0 };
    for (const l of lesions) {
      const r = (l.overallResponse ?? 'NE') as LesionResponse;
      map[r] = (map[r] ?? 0) + 1;
    }
    return map;
  }, [lesions]);

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 10,
        boxShadow: '0 6px 24px rgba(0,0,0,0.10)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minHeight: 520,
        border: '1px solid #e5e7eb',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Activity size={20} color="#ef4444" />
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>病灶追踪 · Lesion Tracking</h3>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => void reload()}
          style={btnIconStyle}
          title="刷新"
          aria-label="刷新"
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
        </button>
        {onClose && (
          <button onClick={onClose} style={btnIconStyle} title="关闭" aria-label="关闭">
            <X size={14} />
          </button>
        )}
      </header>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={controlLabelStyle}>患者</label>
        <select value={activePatient} onChange={(e) => setActivePatient(e.target.value)} style={selectStyle}>
          {PATIENT_IDS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 8, top: 8, color: '#9ca3af' }} />
          <input
            placeholder="搜索病灶标签 / 器官"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 26, width: 220 }}
          />
        </div>
        <div style={{ flex: 1 }} />
        {Object.entries(responseSummary).map(([r, n]) => {
          if (n === 0) return null;
          const meta = RESPONSE_META[r as LesionResponse];
          return (
            <span
              key={r}
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 999,
                color: meta?.color ?? '#374151',
                background: meta?.bg ?? '#f3f4f6',
              }}
            >
              {meta?.label ?? r} · {n}
            </span>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 12, flex: 1, minHeight: 0 }}>
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            overflowY: 'auto',
            maxHeight: 420,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            background: '#f9fafb',
          }}
        >
          {filtered.map((l) => {
            const meta = RESPONSE_META[(l.overallResponse ?? 'NE') as LesionResponse];
            const active = selected?.id === l.id;
            return (
              <li
                key={l.id}
                onClick={() => setSelectedId(l.id)}
                onDoubleClick={() => onSelectLesion?.(l)}
                style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  background: active ? '#eef2ff' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {l.label}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {CATEGORY_LABEL[l.category]} · 基线 {l.baselineDate} · {l.snapshots.length} 次随访
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: meta?.color, background: meta?.bg, padding: '2px 8px', borderRadius: 999 }}>
                  {meta?.label ?? '—'}
                </span>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li style={{ padding: 16, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>未找到匹配病灶</li>
          )}
        </ul>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
          {selected ? (
            <>
              <section style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h4 style={cardTitleStyle}>{selected.label}</h4>
                  <span style={chipStyle}>{CATEGORY_LABEL[selected.category]}</span>
                  {selected.overallResponse && (
                    <span style={{ ...chipStyle, color: RESPONSE_META[selected.overallResponse].color, background: RESPONSE_META[selected.overallResponse].bg }}>
                      {RESPONSE_META[selected.overallResponse].label}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  位置:{[selected.location.organ, selected.location.subStructure].filter(Boolean).join(' / ')}
                </div>
                {trend && (
                  <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <StatPill label="长径变化" value={`${trend.longDiameterChangePercent.toFixed(1)}%`} positive={trend.longDiameterChangePercent <= 0} Icon={trend.longDiameterChangePercent <= 0 ? TrendingDown : TrendingUp} />
                    {trend.shortDiameterChangePercent !== undefined && (
                      <StatPill label="短径变化" value={`${trend.shortDiameterChangePercent.toFixed(1)}%`} positive={trend.shortDiameterChangePercent <= 0} Icon={trend.shortDiameterChangePercent <= 0 ? TrendingDown : TrendingUp} />
                    )}
                    {trend.volumeChangePercent !== undefined && (
                      <StatPill label="体积变化" value={`${trend.volumeChangePercent.toFixed(1)}%`} positive={trend.volumeChangePercent <= 0} Icon={trend.volumeChangePercent <= 0 ? TrendingDown : TrendingUp} />
                    )}
                    <MiniSparkline
                      values={trend.timeline.map((t) => t.longDiameter)}
                      color={trend.longDiameterChangePercent <= 0 ? '#10b981' : '#ef4444'}
                    />
                  </div>
                )}
              </section>

              <section style={cardStyle}>
                <h5 style={cardSubTitleStyle}>
                  <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  时间线 ({selected.snapshots.length})
                </h5>
                <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {selected.snapshots.map((s) => {
                    const r = s.response ? RESPONSE_META[s.response] : null;
                    return (
                      <li key={s.studyInstanceUID} style={{ display: 'flex', alignItems: 'center', padding: '6px 0', borderBottom: '1px dashed #e5e7eb', gap: 12, fontSize: 12 }}>
                        <span style={{ width: 88, color: '#6b7280' }}>{s.acquisitionDate}</span>
                        <span style={{ flex: 1, color: '#111827' }}>长径 <strong>{s.longDiameter}</strong> mm</span>
                        {s.shortDiameter !== undefined && <span style={{ color: '#374151' }}>短径 {s.shortDiameter} mm</span>}
                        {s.volume !== undefined && <span style={{ color: '#374151' }}>体积 {s.volume} mm³</span>}
                        {r && (
                          <span style={{ fontSize: 12, fontWeight: 700, color: r.color, background: r.bg, padding: '1px 6px', borderRadius: 999 }}>
                            {r.label}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </section>

              <section style={cardStyle}>
                <h5 style={cardSubTitleStyle}>
                  <GitCompare size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  双研究对比
                </h5>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <select value={compareA} onChange={(e) => setCompareA(e.target.value)} style={selectStyle}>
                    <option value="">基线研究</option>
                    {studies.map((s) => (
                      <option key={s} value={s}>{s.slice(-8)}</option>
                    ))}
                  </select>
                  <span style={{ color: '#6b7280' }}>vs</span>
                  <select value={compareB} onChange={(e) => setCompareB(e.target.value)} style={selectStyle}>
                    <option value="">随访研究</option>
                    {studies.map((s) => (
                      <option key={s} value={s}>{s.slice(-8)}</option>
                    ))}
                  </select>
                  <button onClick={() => void runCompare()} style={btnPrimaryStyle} disabled={!compareA || !compareB}>
                    <Check size={13} /> 对比
                  </button>
                </div>
                {comparison && (
                  <div style={{ marginTop: 8, fontSize: 12, padding: 8, background: '#f9fafb', borderRadius: 6 }}>
                    变化 <strong style={{ color: comparison.changePercent < 0 ? '#047857' : '#b91c1c' }}>
                      {comparison.changePercent > 0 ? '+' : ''}{comparison.changePercent.toFixed(1)}%
                    </strong>{' '}
                    ({comparison.changeMm > 0 ? '+' : ''}{comparison.changeMm} mm) ·
                    <span style={{ marginLeft: 6, fontWeight: 700, color: RESPONSE_META[comparison.response].color }}>
                      {RESPONSE_META[comparison.response].label}
                    </span>
                  </div>
                )}
              </section>
            </>
          ) : (
            <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: '#9ca3af', fontSize: 13 }}>
              请选择左侧病灶以查看趋势
            </div>
          )}
        </div>
      </div>

      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#6b7280' }}>
        <span>共 {LESION_MOCK.length} 个病灶 · {PATIENT_IDS.length} 个患者 · RECIST 1.1 标准</span>
        <button
          style={btnPrimaryStyle}
          onClick={() => void LesionTracker.listAll().then((all) => setLesions(all))}
        >
          <Plus size={13} /> 全部病灶
        </button>
      </footer>
    </div>
  );
}

function StatPill({ label, value, positive, Icon }: { label: string; value: string; positive: boolean; Icon: LucideIcon }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 10px',
        borderRadius: 999,
        background: positive ? '#dcfce7' : '#fee2e2',
        color: positive ? '#047857' : '#b91c1c',
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      <Icon size={12} />
      {label} {value}
    </span>
  );
}

// ---------- inline styles ----------
const btnIconStyle: React.CSSProperties = {
  border: '1px solid #d1d5db',
  background: '#fff',
  borderRadius: 6,
  padding: 4,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  color: '#374151',
};
const btnPrimaryStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '6px 12px',
  fontSize: 12,
  fontWeight: 600,
  color: '#fff',
  background: '#2563eb',
  border: '1px solid #1d4ed8',
  borderRadius: 6,
  cursor: 'pointer',
};
const selectStyle: React.CSSProperties = {
  fontSize: 12,
  padding: '4px 8px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  background: '#fff',
};
const inputStyle: React.CSSProperties = {
  fontSize: 12,
  padding: '4px 8px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  background: '#fff',
  outline: 'none',
};
const controlLabelStyle: React.CSSProperties = { fontSize: 12, color: '#6b7280' };
const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: 12,
};
const cardTitleStyle: React.CSSProperties = { margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' };
const cardSubTitleStyle: React.CSSProperties = { margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#111827' };
const chipStyle: React.CSSProperties = { fontSize: 12, padding: '2px 6px', borderRadius: 4, background: '#eef2ff', color: '#3730a3' };

export { LesionTrackingViewer };
