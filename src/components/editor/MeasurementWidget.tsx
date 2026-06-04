// ============================================================
// G005 放射科RIS系统 v1.0.1 - 病灶测量组件
// Phase R1：长度/面积/体积/角度/密度 多类型测量
// ============================================================

import React, { useState } from 'react';
import { Plus, Trash2, Ruler, Calculator, Crosshair, Move3D } from 'lucide-react';
import type { Measurement } from '../../types';

export interface MeasurementWidgetProps {
  measurements: Measurement[];
  onChange: (measurements: Measurement[]) => void;
  readonly?: boolean;
  imageSliceIndex?: number;
}

const TYPE_CONFIG: Record<Measurement['type'], { label: string; icon: React.ReactNode; unit: string; color: string }> = {
  length:  { label: '长度',  icon: <Ruler size={13} />,      unit: 'mm', color: '#3b82f6' },
  area:    { label: '面积',  icon: <Calculator size={13} />, unit: 'mm²', color: '#10b981' },
  volume:  { label: '体积',  icon: <Move3D size={13} />,     unit: 'cm³', color: '#7c3aed' },
  angle:   { label: '角度',  icon: <Crosshair size={13} />,  unit: '°',   color: '#f59e0b' },
  density: { label: '密度',  icon: <Calculator size={13} />, unit: 'HU',  color: '#0891b2' },
};

export const MeasurementWidget: React.FC<MeasurementWidgetProps> = ({
  measurements,
  onChange,
  readonly = false,
  imageSliceIndex = 0,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newType, setNewType] = useState<Measurement['type']>('length');
  const [newValue, setNewValue] = useState<string>('');
  const [newLocation, setNewLocation] = useState('');
  const [newIsTarget, setNewIsTarget] = useState(false);

  const handleAdd = () => {
    if (!newValue) return;
    const config = TYPE_CONFIG[newType];
    const m: Measurement = {
      id: `m-${Date.now()}`,
      type: newType,
      value: Number(newValue),
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
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    onChange(measurements.filter(m => m.id !== id));
  };

  // 按病灶编号分组
  const groupedByLesion = measurements.reduce((acc, m) => {
    if (!acc[m.lesionNumber]) acc[m.lesionNumber] = [];
    acc[m.lesionNumber].push(m);
    return acc;
  }, {} as Record<number, Measurement[]>);

  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: 8,
      background: '#fff',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '8px 12px',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Ruler size={14} color="#1e40af" />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1e40af' }}>病灶测量</span>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>({measurements.length} 项)</span>
        </div>
        {!readonly && (
          <button
            type="button"
            onClick={() => setShowAdd(!showAdd)}
            style={{
              padding: '3px 8px',
              border: '1px solid #3b82f6',
              borderRadius: 4,
              background: showAdd ? '#dbeafe' : '#fff',
              color: '#1e40af',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Plus size={11} /> 添加
          </button>
        )}
      </div>

      {showAdd && (
        <div style={{
          padding: 10,
          background: '#f0f9ff',
          borderBottom: '1px solid #bae6fd',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8,
        }}>
          <div>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>类型</div>
            <select
              value={newType}
              onChange={e => setNewType(e.target.value as any)}
              style={{ width: '100%', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 12 }}
            >
              {(Object.keys(TYPE_CONFIG) as Array<keyof typeof TYPE_CONFIG>).map(k => (
                <option key={k} value={k}>{TYPE_CONFIG[k].label} ({TYPE_CONFIG[k].unit})</option>
              ))}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>数值</div>
            <input
              type="number"
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              placeholder="0.0"
              style={{ width: '100%', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 12 }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>位置/解剖</div>
            <input
              type="text"
              value={newLocation}
              onChange={e => setNewLocation(e.target.value)}
              placeholder="如：右肺下叶外基底段"
              style={{ width: '100%', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 12 }}
            />
          </div>
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
              padding: '4px 8px',
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
      )}

      <div style={{ maxHeight: 240, overflowY: 'auto' }}>
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
                const config = TYPE_CONFIG[m.type];
                return (
                  <div key={m.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 6px',
                    background: `${config.color}08`,
                    border: `1px solid ${config.color}30`,
                    borderRadius: 4,
                    marginBottom: 3,
                    fontSize: 11,
                  }}>
                    <span style={{ color: config.color }}>{config.icon}</span>
                    <span style={{ fontWeight: 600, color: config.color }}>{config.label}</span>
                    <span style={{ color: '#1e293b', fontWeight: 700 }}>{m.value} {m.unit}</span>
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
            </div>
          ))
        )}
      </div>

      {/* RECIST 汇总（如果有靶病灶） */}
      {measurements.some(m => m.isTarget) && (
        <div style={{
          padding: '8px 10px',
          background: '#fef2f2',
          borderTop: '1px solid #fecaca',
          fontSize: 11,
          color: '#7f1d1d',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 2 }}>RECIST 1.1 评估</div>
          <div style={{ fontSize: 10, color: '#991b1b' }}>
            靶病灶：{measurements.filter(m => m.isTarget).length} 个 ·
            总和：{measurements.filter(m => m.isTarget && m.type === 'length').reduce((s, m) => s + m.value, 0).toFixed(1)} mm
          </div>
        </div>
      )}
    </div>
  );
};

export default MeasurementWidget;
