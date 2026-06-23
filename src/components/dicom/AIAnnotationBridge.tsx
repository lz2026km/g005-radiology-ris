// ============================================================
// G005 放射RIS系统 v3.0.6.5 - AI 标注桥接组件
// Phase R11 W6: 列出 AI 检测框 -> 转测量 -> 应用到当前 study
// 20 升级点:列表 / 筛选 / 转换 / 应用
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import { Cpu, Filter, Zap, Check } from 'lucide-react';
import type { AiBoundingBox, AiConvertedMeasurement } from '../../types/measurement';
import AutoAnnotationBridge from '../../services/measurement/ai/AutoAnnotationBridge';

interface Props {
  initialBBoxes?: AiBoundingBox[];
  onApplyMeasurements?: (ms: AiConvertedMeasurement[]) => void;
}

const CATEGORY_COLOR: Record<string, string> = {
  nodule: '#ef4444',
  lesion: '#dc2626',
  fracture: '#f97316',
  calcification: '#3b82f6',
};

export default function AIAnnotationBridge({ initialBBoxes, onApplyMeasurements }: Props) {
  const [bboxes, setBboxes] = useState<AiBoundingBox[]>(initialBBoxes ?? []);
  const [filterCat, setFilterCat] = useState<string>('all');
  const [converted, setConverted] = useState<AiConvertedMeasurement[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (initialBBoxes && initialBBoxes.length > 0) {
      setBboxes(initialBBoxes);
    }
  }, [initialBBoxes]);

  const categories = useMemo(() => {
    const set = new Set(bboxes.map((b) => b.category));
    return ['all', ...Array.from(set)];
  }, [bboxes]);

  const filtered = useMemo(
    () => bboxes.filter((b) => filterCat === 'all' || b.category === filterCat),
    [bboxes, filterCat],
  );

  const runConvert = async () => {
    setRunning(true);
    try {
      const out = await AutoAnnotationBridge.batchConvert(filtered);
      setConverted(out);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minWidth: 260,
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Cpu size={15} color="#10b981" />
        <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>AI 标注桥接</h4>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#6b7280' }}>
          {bboxes.length} 个 AI 检测
        </span>
      </header>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <Filter size={12} color="#6b7280" />
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          style={{ fontSize: 12, padding: '3px 6px', border: '1px solid #d1d5db', borderRadius: 4 }}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === 'all' ? '全部类别' : c}
            </option>
          ))}
        </select>
        <button
          onClick={() => void runConvert()}
          disabled={running || filtered.length === 0}
          style={{
            marginLeft: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 600,
            color: '#fff',
            background: '#10b981',
            border: '1px solid #059669',
            padding: '4px 10px',
            borderRadius: 6,
            cursor: running ? 'not-allowed' : 'pointer',
            opacity: running || filtered.length === 0 ? 0.6 : 1,
          }}
        >
          <Zap size={12} />
          转测量
        </button>
      </div>

      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          maxHeight: 200,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {filtered.map((b) => {
          const color = CATEGORY_COLOR[b.category] ?? '#6b7280';
          return (
            <li
              key={b.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 8px',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                background: '#f9fafb',
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: color,
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>
                  {b.categoryZh} · 置信度 {(b.confidence * 100).toFixed(0)}%
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  {b.bbox.width.toFixed(0)} × {b.bbox.height.toFixed(0)} px · 模型 {b.modelVersion}
                </div>
              </div>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: 12 }}>
            暂无 AI 检测结果,请先运行 AI 算法
          </li>
        )}
      </ul>

      {converted.length > 0 && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 6, padding: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#065f46' }}>
            <Check size={12} /> 已转换 {converted.length} 项测量
          </div>
          <ul style={{ margin: '6px 0 0', padding: '0 0 0 16px', fontSize: 12, color: '#065f46' }}>
            {converted.slice(0, 5).map((m) => (
              <li key={m.id}>
                {m.label}: <strong>{m.value.toFixed(1)} {m.unit}</strong>
              </li>
            ))}
            {converted.length > 5 && <li>...及其他 {converted.length - 5} 项</li>}
          </ul>
          <button
            onClick={() => onApplyMeasurements?.(converted)}
            style={{
              marginTop: 6,
              fontSize: 12,
              fontWeight: 600,
              color: '#fff',
              background: '#059669',
              border: 'none',
              borderRadius: 4,
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            应用到当前 study
          </button>
        </div>
      )}
    </div>
  );
}
