// ============================================================
// G005 放射科RIS系统 v1.0.1 - 病灶测量组件
// Phase R1+R2：扩展测量类型 + RECIST 1.1 + 趋势图 + 颜色编码
// ============================================================

// @ts-nocheck

import React, { useState, useMemo } from 'react';
import {
  Plus, Trash2, Ruler, Calculator, Crosshair, Move3D,
  TrendingUp, Weight, Percent, Activity, Bone,
} from 'lucide-react';
import type { Measurement } from '../../types';

export interface MeasurementWidgetProps {
  measurements: Measurement[];
  onChange: (measurements: Measurement[]) => void;
  readonly?: boolean;
  imageSliceIndex?: number;
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; unit: string; color: string }> = {
  length:         { label: '长度',    icon: <Ruler size={13} />,       unit: 'mm',  color: '#3b82f6' },
  area:           { label: '面积',    icon: <Calculator size={13} />,  unit: 'mm²', color: '#10b981' },
  volume:         { label: '体积',    icon: <Move3D size={13} />,     unit: 'cm³', color: '#7c3aed' },
  angle:          { label: '角度',    icon: <Crosshair size={13} />,  unit: '°',   color: '#f59e0b' },
  density:        { label: '密度',    icon: <Calculator size={13} />, unit: 'HU',  color: '#0891b2' },
  diameter:       { label: '直径',    icon: <Ruler size={13} />,       unit: 'mm',  color: '#06b6d4' },
  ratio:          { label: '比率',    icon: <Percent size={13} />,     unit: '',    color: '#8b5cf6' },
  perimeter:      { label: '周长',    icon: <Activity size={13} />,    unit: 'mm',  color: '#ec4899' },
  suv:            { label: 'SUV',     icon: <Weight size={13} />,      unit: 'SUV', color: '#14b8a6' },
  noduleCharacter:{ label: '结节性质', icon: <Crosshair size={13} />,  unit: '',    color: '#a855f7' },
  stenosis:       { label: '狭窄率',  icon: <Percent size={13} />,     unit: '%',   color: '#f97316' },
  fractureAngle:  { label: '骨折角度', icon: <Bone size={13} />,       unit: '°',   color: '#ef4444' },
};

const BODY_REGIONS = ['头颈部', '胸部', '腹部', '盆腔', '脊柱', '四肢'];

const QUICK_TEMPLATES: { label: string; type: string; location: string; value?: number }[] = [
  { label: '肺结节', type: 'diameter', location: '右肺上叶', value: 12 },
  { label: '肝占位', type: 'diameter', location: '肝右叶', value: 25 },
  { label: '淋巴结', type: 'diameter', location: '纵隔', value: 8 },
];

const RESPONSE_CONFIG: Record<string, { label: string; color: string }> = {
  CR: { label: '完全缓解', color: '#10b981' },
  PR: { label: '部分缓解', color: '#3b82f6' },
  SD: { label: '疾病稳定', color: '#f59e0b' },
  PD: { label: '疾病进展', color: '#dc2626' },
  NE: { label: '无法评估', color: '#6b7280' },
};

const NODULE_OPTIONS = [
  { value: 'solid', label: '实性' },
  { value: 'partSolid', label: '部分实性' },
  { value: 'groundGlass', label: '磨玻璃' },
];

function getSeverityColor(value: number, type: string): string | null {
  if (!['length', 'diameter', 'perimeter'].includes(type)) return null;
  if (value < 10) return '#10b981';
  if (value < 30) return '#f59e0b';
  if (value < 50) return '#f97316';
  return '#dc2626';
}

const SEVERITY_LEGEND = [
  { label: '小 (< 10mm)', color: '#10b981' },
  { label: '中 (10-30mm)', color: '#f59e0b' },
  { label: '大 (30-50mm)', color: '#f97316' },
  { label: '特大 (> 50mm)', color: '#dc2626' },
];

function TrendChart({ items, type }: { items: Measurement[]; type: string }) {
  const W = 200, H = 70;
  const padding = { top: 5, right: 5, bottom: 18, left: 30 };
  const chartW = W - padding.left - padding.right;
  const chartH = H - padding.top - padding.bottom;

  const values = items.map(m => m.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.length;

  const points = values.map((v, i) => {
    const x = padding.left + (i / (values.length - 1 || 1)) * chartW;
    const y = padding.top + chartH - ((v - minVal) / range) * chartH;
    return `${x},${y}`;
  }).join(' ');

  const yTicks = 3;
  const yLabels = Array.from({ length: yTicks }, (_, i) => {
    const val = minVal + (range * i) / (yTicks - 1);
    const y = padding.top + chartH - (i / (yTicks - 1)) * chartH;
    return { val: val.toFixed(1), y };
  });

  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartH} stroke="#e2e8f0" strokeWidth={1} />
      <line x1={padding.left} y1={padding.top + chartH} x2={padding.left + chartW} y2={padding.top + chartH} stroke="#e2e8f0" strokeWidth={1} />
      {points && (
        <polyline
          points={points}
          fill="none"
          stroke={config.color}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      {values.map((v, i) => {
        const x = padding.left + (i / (values.length - 1 || 1)) * chartW;
        const y = padding.top + chartH - ((v - minVal) / range) * chartH;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={2.5} fill={config.color} />
            <text x={x} y={H - 3} textAnchor="middle" fontSize={8} fill="#94a3b8">
              {i + 1}
            </text>
          </g>
        );
      })}
      {yLabels.map(({ val, y }) => (
        <text key={val} x={padding.left - 4} y={y + 3} textAnchor="end" fontSize={8} fill="#94a3b8">
          {val}
        </text>
      ))}
    </svg>
  );
}

export const MeasurementWidget: React.FC<MeasurementWidgetProps> = ({
  measurements,
  onChange,
  readonly = false,
  imageSliceIndex = 0,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newType, setNewType] = useState<string>('length');
  const [newValue, setNewValue] = useState<string>('');
  const [newLocation, setNewLocation] = useState('');
  const [newIsTarget, setNewIsTarget] = useState(false);
  const [newNoduleChar, setNewNoduleChar] = useState('solid');
  const [newStenosis, setNewStenosis] = useState(50);
  const [newSuvWeight, setNewSuvWeight] = useState('70');
  const [overallResponse, setOverallResponse] = useState<string>('');

  const targetLesions = useMemo(() => measurements.filter(m => m.isTarget), [measurements]);
  const sumLD = useMemo(
    () =>
      targetLesions
        .filter((m) => ['length', 'diameter'].includes(m.type))
        .filter((m) => Number.isFinite(m.value))
        .reduce((s, m) => s + (Number(m.value) || 0), 0),
    [targetLesions]
  );

  const handleTemplateClick = (tmpl: typeof QUICK_TEMPLATES[0]) => {
    setNewType(tmpl.type);
    setNewLocation(tmpl.location);
    setNewValue(tmpl.value != null ? String(tmpl.value) : '');
    setNewIsTarget(false);
    setNewNoduleChar('solid');
    setNewStenosis(50);
    setNewSuvWeight('70');
    if (!showAdd) setShowAdd(true);
  };

  const handleAdd = () => {
    if (!newValue && !['noduleCharacter', 'ratio'].includes(newType)) return;
    const config = TYPE_CONFIG[newType] || TYPE_CONFIG.length;
    let val = 0;
    if (newType === 'noduleCharacter') {
      const opt = NODULE_OPTIONS.find(o => o.value === newNoduleChar);
      val = newNoduleChar === 'solid' ? 1 : newNoduleChar === 'partSolid' ? 2 : 3;
    } else if (newType === 'stenosis') {
      val = newStenosis;
    } else if (newType === 'suv') {
      val = Number(newValue) / Number(newSuvWeight || 70) * 70;
    } else {
      val = Number(newValue);
    }
    const m: Measurement = {
      id: `m-${Date.now()}`,
      type: newType as any,
      value: val,
      unit: config.unit,
      location: newLocation || '未指定',
      lesionNumber: measurements.length + 1,
      imageSliceIndex,
      coordinates: [],
      isTarget: newIsTarget,
    };
    onChange([...measurements, m]);
    setNewValue('');
    setNewLocation('');
    setNewIsTarget(false);
    setNewNoduleChar('solid');
    setNewStenosis(50);
    setNewSuvWeight('70');
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    onChange(measurements.filter(m => m.id !== id));
  };

  const groupedByLesion = measurements.reduce((acc, m) => {
    if (!acc[m.lesionNumber]) acc[m.lesionNumber] = [];
    acc[m.lesionNumber].push(m);
    return acc;
  }, {} as Record<number, Measurement[]>);

  const trendGroups = useMemo(() => {
    const groups: { key: string; lesionNo: number; type: string; items: Measurement[] }[] = [];
    for (const [lesionNo, ms] of Object.entries(groupedByLesion)) {
      const byType: Record<string, Measurement[]> = {};
      for (const m of ms) {
        if (!byType[m.type]) byType[m.type] = [];
        byType[m.type].push(m);
      }
      for (const [type, items] of Object.entries(byType)) {
        if (items.length >= 3) {
          groups.push({ key: `${lesionNo}-${type}`, lesionNo: Number(lesionNo), type, items });
        }
      }
    }
    return groups;
  }, [measurements, groupedByLesion]);

  const baseBtnStyle: React.CSSProperties = {
    padding: '3px 8px',
    border: '1px solid #3b82f6',
    borderRadius: 4,
    background: '#fff',
    color: '#1e40af',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '4px 6px',
    border: '1px solid #cbd5e1',
    borderRadius: 4,
    fontSize: 12,
  };

  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: 8,
      background: '#fff',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 12px',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 6,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Ruler size={14} color="#1e40af" />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1e40af' }}>病灶测量</span>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>({measurements.length} 项)</span>
        </div>
        {!readonly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {QUICK_TEMPLATES.map(tmpl => (
              <button
                key={tmpl.label}
                type="button"
                onClick={() => handleTemplateClick(tmpl)}
                style={{
                  ...baseBtnStyle,
                  borderColor: '#94a3b8',
                  color: '#475569',
                  fontSize: 10,
                  padding: '2px 6px',
                }}
              >
                {tmpl.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowAdd(!showAdd)}
              style={{
                ...baseBtnStyle,
                background: showAdd ? '#dbeafe' : '#fff',
              }}
            >
              <Plus size={11} /> 添加
            </button>
          </div>
        )}
      </div>

      {/* RECIST 1.1 Summary Panel */}
      <div style={{
        padding: '8px 10px',
        background: targetLesions.length > 0 ? '#f0fdf4' : '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        fontSize: 11,
      }}>
        <div style={{ fontWeight: 700, color: '#166534', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Crosshair size={12} /> RECIST 1.1 评估
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ color: '#475569' }}>
            靶病灶：<strong style={{ color: '#166534' }}>{targetLesions.length}</strong> 个
          </span>
          <span style={{ color: '#475569' }}>
            最长径总和：<strong style={{ color: '#166534' }}>{sumLD.toFixed(1)} mm</strong>
          </span>
          <select
            value={overallResponse}
            onChange={e => setOverallResponse(e.target.value)}
            style={{
              padding: '2px 6px',
              border: '1px solid #cbd5e1',
              borderRadius: 4,
              fontSize: 11,
              background: '#fff',
            }}
          >
            <option value="">总体疗效</option>
            {Object.entries(RESPONSE_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label} ({key})</option>
            ))}
          </select>
          {overallResponse && RESPONSE_CONFIG[overallResponse] && (
            <span style={{
              display: 'inline-block',
              padding: '1px 8px',
              borderRadius: 10,
              background: RESPONSE_CONFIG[overallResponse].color,
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
            }}>
              {RESPONSE_CONFIG[overallResponse].label} ({overallResponse})
            </span>
          )}
        </div>
        <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 3 }}>
          RECIST 1.1: Complete Response = 所有靶病灶完全消失
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div style={{
          padding: 10,
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {/* Type & Value Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>类型</div>
              <select
                value={newType}
                onChange={e => {
                  setNewType(e.target.value);
                  if (e.target.value === 'noduleCharacter') setNewValue('');
                  if (e.target.value === 'stenosis') setNewValue('');
                  if (e.target.value === 'ratio') setNewValue('1.0');
                }}
                style={inputStyle}
              >
                {Object.keys(TYPE_CONFIG).map(k => (
                  <option key={k} value={k}>{TYPE_CONFIG[k].label} ({TYPE_CONFIG[k].unit})</option>
                ))}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>
                {newType === 'noduleCharacter' ? '性质' : newType === 'stenosis' ? '狭窄率' : '数值'}
              </div>
              {newType === 'noduleCharacter' ? (
                <select
                  value={newNoduleChar}
                  onChange={e => setNewNoduleChar(e.target.value)}
                  style={inputStyle}
                >
                  {NODULE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : newType === 'stenosis' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={newStenosis}
                    onChange={e => setNewStenosis(Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', minWidth: 32, textAlign: 'right' }}>
                    {newStenosis}%
                  </span>
                </div>
              ) : newType === 'suv' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    type="number"
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    placeholder="SUV"
                    style={{ ...inputStyle, width: '60%' }}
                  />
                  <span style={{ fontSize: 10, color: '#64748b' }}>体重</span>
                  <input
                    type="number"
                    value={newSuvWeight}
                    onChange={e => setNewSuvWeight(e.target.value)}
                    placeholder="kg"
                    style={{ ...inputStyle, width: '30%' }}
                  />
                  <span style={{ fontSize: 10, color: '#64748b' }}>kg</span>
                </div>
              ) : newType === 'ratio' ? (
                <input
                  type="number"
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  placeholder="比率"
                  style={inputStyle}
                />
              ) : (
                <input
                  type="number"
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  placeholder="0.0"
                  style={inputStyle}
                />
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>位置 / 解剖部位</div>
            <input
              type="text"
              value={newLocation}
              onChange={e => setNewLocation(e.target.value)}
              placeholder="如：右肺下叶外基底段"
              style={inputStyle}
            />
          </div>

          {/* Body Region Selector */}
          <div>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 3 }}>快速定位 — 点击选择部位</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {BODY_REGIONS.map(region => (
                <button
                  key={region}
                  type="button"
                  onClick={() => setNewLocation(region)}
                  style={{
                    ...baseBtnStyle,
                    borderColor: newLocation === region ? '#3b82f6' : '#cbd5e1',
                    background: newLocation === region ? '#dbeafe' : '#fff',
                    color: newLocation === region ? '#1e40af' : '#475569',
                    fontSize: 10,
                    padding: '2px 8px',
                  }}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          {/* Checkbox & Confirm */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#475569' }}>
              <input
                type="checkbox"
                checked={newIsTarget}
                onChange={e => setNewIsTarget(e.target.checked)}
              />
              标记为 RECIST 靶病灶
            </label>
            <button
              type="button"
              onClick={handleAdd}
              style={{
                padding: '4px 12px',
                border: 'none',
                borderRadius: 4,
                background: '#3b82f6',
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              确认添加
            </button>
          </div>
        </div>
      )}

      {/* Measurement List */}
      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
        {measurements.length === 0 ? (
          <div style={{
            padding: '24px 12px',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: 11,
          }}>
            暂无测量数据
          </div>
        ) : (
          Object.entries(groupedByLesion).map(([lesionNo, ms]) => (
            <div key={lesionNo} style={{
              padding: '6px 10px',
              borderBottom: '1px solid #f1f5f9',
            }}>
              <div style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#7c3aed',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <Crosshair size={10} /> 病灶 #{lesionNo}
                {ms.some(m => m.isTarget) && (
                  <span style={{
                    fontSize: 9, padding: '0 4px',
                    background: '#dc2626', color: '#fff',
                    borderRadius: 3,
                  }}>靶</span>
                )}
              </div>
              {ms.map(m => {
                const config = TYPE_CONFIG[m.type] || TYPE_CONFIG.length;
                const sevColor = getSeverityColor(m.value, m.type);
                return (
                  <div key={m.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 6px',
                    background: sevColor ? `${sevColor}12` : `${config.color}08`,
                    border: `1px solid ${sevColor || config.color}30`,
                    borderLeft: sevColor ? `3px solid ${sevColor}` : `1px solid ${config.color}30`,
                    borderRadius: 4,
                    marginBottom: 3,
                    fontSize: 11,
                  }}>
                    <span style={{ color: config.color }}>{config.icon}</span>
                    <span style={{ fontWeight: 600, color: config.color }}>{config.label}</span>
                    <span style={{ color: '#1e293b', fontWeight: 700 }}>
                      {m.type === 'noduleCharacter'
                        ? (NODULE_OPTIONS.find(o =>
                            o.value === (m.value === 1 ? 'solid' : m.value === 2 ? 'partSolid' : 'groundGlass')
                          )?.label || '实性')
                        : `${m.value} ${m.unit}`}
                    </span>
                    {sevColor && (
                      <span style={{
                        fontSize: 9, padding: '0 5px', borderRadius: 8,
                        background: sevColor, color: '#fff', fontWeight: 600,
                      }}>
                        {m.value < 10 ? '小' : m.value < 30 ? '中' : m.value < 50 ? '大' : '特大'}
                      </span>
                    )}
                    <span style={{ color: '#64748b', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.location}
                    </span>
                    {!readonly && (
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id)}
                        style={{
                          padding: 2,
                          border: 'none',
                          background: 'transparent',
                          color: '#dc2626',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                );
              })}
              {/* Trend Chart for this lesion group */}
              {trendGroups.filter(g => g.lesionNo === Number(lesionNo)).map(g => (
                <div key={g.key} style={{
                  marginTop: 4,
                  padding: '6px 8px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 4,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <TrendingUp size={11} color="#64748b" />
                    <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>
                      {TYPE_CONFIG[g.type]?.label || g.type} 趋势 (病灶 #{g.lesionNo})
                    </span>
                  </div>
                  <TrendChart items={g.items} type={g.type} />
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Severity Legend */}
      <div style={{
        padding: '6px 10px',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 10,
        color: '#64748b',
        background: '#fafafa',
      }}>
        <span style={{ fontWeight: 600 }}>大小分级：</span>
        {SEVERITY_LEGEND.map(s => (
          <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: 2,
              background: s.color,
            }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MeasurementWidget;
