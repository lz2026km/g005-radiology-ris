// ============================================================
// G005 放射RIS系统 v3.0.6.5 - ROI 工具栏组件
// Phase R11 W3: Freehand / Livewire / RegionGrow 入口
// 30 升级点:工具按钮 / 模式切换 / 参数面板 / 历史
// ============================================================

import { useState } from 'react';
import { PenTool, Spline, Sprout, Undo2, Square, X, type LucideIcon } from 'lucide-react';
import type { FreehandRoi, RoiType } from '../../types/measurement';

interface Props {
  onToolChange?: (tool: RoiType) => void;
  lastRoi?: FreehandRoi | null;
  onUndo?: () => void;
}

const TOOLS: Array<{ id: RoiType; label: string; icon: LucideIcon; description: string; color: string }> = [
  { id: 'freehand', label: '自由手绘', icon: PenTool, description: '手动绘制闭合多边形 ROI', color: '#0ea5e9' },
  { id: 'livewire', label: 'Livewire', icon: Spline, description: '沿图像梯度最小路径自动分割', color: '#7c3aed' },
  { id: 'regionGrow', label: '区域生长', icon: Sprout, description: '基于 HU 阈值的连通区域生长', color: '#16a34a' },
  { id: 'ellipse', label: '椭圆 ROI', icon: Square, description: '标准椭圆 ROI', color: '#f59e0b' },
];

export default function RoiTools({ onToolChange, lastRoi, onUndo }: Props) {
  const [active, setActive] = useState<RoiType | null>(null);
  const [huMin, setHuMin] = useState<number>(-100);
  const [huMax, setHuMax] = useState<number>(300);
  const [gradientThreshold, setGradientThreshold] = useState<number>(30);

  const select = (id: RoiType) => {
    setActive(id === active ? null : id);
    onToolChange?.(id);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 10,
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        minWidth: 240,
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <PenTool size={15} color="#0ea5e9" />
        <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>ROI 工具</h4>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {TOOLS.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => select(t.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '8px 6px',
                border: `1px solid ${isActive ? t.color : '#e5e7eb'}`,
                background: isActive ? `${t.color}14` : '#fff',
                color: isActive ? t.color : '#374151',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title={t.description}
              aria-pressed={isActive}
            >
              <Icon size={16} color={isActive ? t.color : '#6b7280'} />
              {t.label}
            </button>
          );
        })}
      </div>

      {active === 'regionGrow' && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#166534', marginBottom: 6 }}>HU 阈值范围</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="number"
              value={huMin}
              onChange={(e) => setHuMin(Number(e.target.value))}
              style={inputStyle}
              aria-label="HU 下限"
            />
            <span style={{ color: '#374151' }}>~</span>
            <input
              type="number"
              value={huMax}
              onChange={(e) => setHuMax(Number(e.target.value))}
              style={inputStyle}
              aria-label="HU 上限"
            />
          </div>
        </div>
      )}

      {active === 'livewire' && (
        <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 6, padding: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#5b21b6', marginBottom: 6 }}>梯度阈值</div>
          <input
            type="range"
            min={5}
            max={120}
            value={gradientThreshold}
            onChange={(e) => setGradientThreshold(Number(e.target.value))}
            style={{ width: '100%' }}
            aria-label="梯度阈值"
          />
          <div style={{ fontSize: 11, color: '#374151' }}>{gradientThreshold}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={onUndo} style={btnSecondaryStyle} title="撤销最近一个点">
          <Undo2 size={12} /> 撤销
        </button>
        <button onClick={() => select(active ?? 'freehand')} style={btnSecondaryStyle}>
          <X size={12} /> 取消
        </button>
      </div>

      {lastRoi && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: 8, fontSize: 11 }}>
          <div style={{ fontWeight: 700, color: '#111827', marginBottom: 4 }}>最近 ROI</div>
          <Row k="面积" v={`${lastRoi.area.toFixed(2)} mm²`} />
          <Row k="周长" v={`${lastRoi.perimeter.toFixed(2)} mm`} />
          <Row k="像素" v={String(lastRoi.pixelCount)} />
          <Row k="平均 HU" v={String(lastRoi.meanHU)} />
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
      <span style={{ color: '#6b7280' }}>{k}</span>
      <strong style={{ color: '#111827' }}>{v}</strong>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  fontSize: 12,
  padding: '4px 6px',
  border: '1px solid #d1d5db',
  borderRadius: 4,
  background: '#fff',
};
const btnSecondaryStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 11,
  padding: '4px 8px',
  border: '1px solid #d1d5db',
  background: '#fff',
  color: '#374151',
  borderRadius: 4,
  cursor: 'pointer',
};
