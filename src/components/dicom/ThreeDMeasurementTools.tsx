// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 3D 测量工具栏组件
// Phase R11 W2: 距离 / 表面积 / 体积按钮 + 状态显示
// 30 升级点:工具栏 / 状态 / 数值展示 / 历史记录
// ============================================================

import { useState } from 'react';
import { Move3D, Trash2, Info } from 'lucide-react';
import type { ThreeDMeasurementResult } from '../../types/measurement';
import ThreeDMeasurement from '../../services/measurement/3d/ThreeDMeasurement';

interface Props {
  onDistance3DRequest?: () => void;
  onSurfaceAreaRequest?: () => void;
  onVolumeRequest?: () => void;
  lastResult?: ThreeDMeasurementResult | null;
}

const TOOL_META = {
  distance3D: { label: '3D 距离', icon: Ruler, color: '#0ea5e9' },
  surfaceArea: { label: '表面积', icon: Layers, color: '#7c3aed' },
  volume: { label: '体积', icon: Box, color: '#db2777' },
};

export default function ThreeDMeasurementTools({ onDistance3DRequest, onSurfaceAreaRequest, onVolumeRequest, lastResult }: Props) {
  const [active, setActive] = useState<'distance3D' | 'surfaceArea' | 'volume' | null>(null);
  const [history, setHistory] = useState<ThreeDMeasurementResult[]>([]);
  const [busy, setBusy] = useState(false);

  const runSample = async (kind: 'distance3D' | 'surfaceArea' | 'volume') => {
    setBusy(true);
    setActive(kind);
    try {
      let r: ThreeDMeasurementResult;
      if (kind === 'distance3D') {
        r = await ThreeDMeasurement.distance3D({ x: 0, y: 0, z: 0 }, { x: 12, y: 8, z: 6 });
      } else if (kind === 'surfaceArea') {
        r = await ThreeDMeasurement.surfaceArea({
          vertices: [
            { x: 0, y: 0, z: 0 },
            { x: 10, y: 0, z: 0 },
            { x: 0, y: 10, z: 0 },
            { x: 0, y: 0, z: 10 },
          ],
          faces: [
            { indices: [0, 1, 2] },
            { indices: [0, 2, 3] },
            { indices: [0, 3, 1] },
            { indices: [1, 3, 2] },
          ],
        });
      } else {
        r = await ThreeDMeasurement.volume({
          vertices: [
            { x: 0, y: 0, z: 0 },
            { x: 10, y: 0, z: 0 },
            { x: 0, y: 10, z: 0 },
            { x: 0, y: 0, z: 10 },
          ],
          faces: [
            { indices: [0, 1, 2] },
            { indices: [0, 2, 3] },
            { indices: [0, 3, 1] },
            { indices: [1, 3, 2] },
          ],
        });
      }
      setHistory((h) => [r, ...h].slice(0, 5));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 10,
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        minWidth: 220,
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Move3D size={15} color="#7c3aed" />
        <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>3D 测量工具</h4>
      </header>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {(Object.keys(TOOL_META) as Array<keyof typeof TOOL_META>).map((k) => {
          const meta = TOOL_META[k];
          const Icon = meta.icon;
          const isActive = active === k;
          return (
            <button
              key={k}
              onClick={() => {
                if (k === 'distance3D') onDistance3DRequest?.();
                if (k === 'surfaceArea') onSurfaceAreaRequest?.();
                if (k === 'volume') onVolumeRequest?.();
                void runSample(k);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 10px',
                border: `1px solid ${isActive ? meta.color : '#d1d5db'}`,
                background: isActive ? `${meta.color}1a` : '#fff',
                color: meta.color,
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: busy ? 'not-allowed' : 'pointer',
                opacity: busy ? 0.6 : 1,
              }}
              disabled={busy}
              title={meta.label}
            >
              <Icon size={12} />
              {meta.label}
            </button>
          );
        })}
      </div>

      {(lastResult || history[0]) && (
        <div
          style={{
            padding: 8,
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#374151', marginBottom: 4 }}>
            <Info size={12} />
            最新结果
          </div>
          {(() => {
            const r = lastResult ?? history[0];
            if (!r) return null;
            const meta = TOOL_META[r.type];
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: meta.color, display: 'inline-block' }} />
                <strong>{meta.label}:</strong>
                <span>{r.value.toFixed(2)} {r.unit}</span>
                <span style={{ marginLeft: 'auto', color: '#9ca3af' }}>{r.durationMs} ms</span>
              </div>
            );
          })()}
        </div>
      )}

      {history.length > 0 && (
        <div style={{ fontSize: 11 }}>
          <div style={{ color: '#6b7280', marginBottom: 4 }}>最近 5 次</div>
          <ol style={{ margin: 0, padding: '0 0 0 16px' }}>
            {history.map((r) => (
              <li key={`${r.type}-${r.durationMs}-${r.value}`} style={{ color: '#374151' }}>
                {TOOL_META[r.type].label}: <strong>{r.value.toFixed(2)} {r.unit}</strong>
              </li>
            ))}
          </ol>
        </div>
      )}

      {history.length > 0 && (
        <button
          onClick={() => setHistory([])}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            color: '#6b7280',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            alignSelf: 'flex-end',
          }}
        >
          <Trash2 size={11} /> 清空
        </button>
      )}
    </div>
  );
}
