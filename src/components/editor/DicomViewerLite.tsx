// ============================================================
// G005 放射RIS系统 v2.0.0 - DICOM Viewer Lite (编辑器内嵌版)
// Phase R8 W2-C1: 轻量 DICOM 影像查看器
// 用于嵌入 ReportWriteV2Page 左侧 / ReportWriteV3Page
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn, ZoomOut, Move, Sun, Contrast, Ruler, Type, Square,
  Circle, ArrowRight, RotateCcw, Layers, Eye, EyeOff, Grid3X3,
  Maximize2, Minimize2, Camera, BookOpen, ChevronLeft, ChevronRight,
  Activity, Crosshair,
} from 'lucide-react';

export interface DicomLiteSeries {
  id: string;
  modality: string;
  bodyPart: string;
  seriesDescription: string;
  sliceCount: number;
  thickness: number;
  imageUrl: string;
  acquiredAt: string;
  contrast?: 'non-contrast' | 'arterial' | 'portal' | 'delayed' | 'T1' | 'T2' | 'DWI';
}

export interface DicomLiteMeasurement {
  id: string;
  type: 'length' | 'angle' | 'roi' | 'arrow' | 'text';
  points: { x: number; y: number }[];
  value: string;
  unit: string;
  label: string;
}

export interface DicomLiteProps {
  series: DicomLiteSeries[];
  currentSlice?: number;
  showThumbnails?: boolean;
  showTools?: boolean;
  showMeasurementPanel?: boolean;
  height?: number;
  onMeasurementCreate?: (m: DicomLiteMeasurement) => void;
}

const WINDOW_PRESETS = [
  { label: '软组织', ww: 400, wc: 40, icon: '🫁' },
  { label: '肺窗',   ww: 1500, wc: -600, icon: '🫁' },
  { label: '骨窗',   ww: 2000, wc: 400, icon: '🦴' },
  { label: '脑窗',   ww: 80, wc: 40, icon: '🧠' },
  { label: '肝窗',   ww: 150, wc: 50, icon: '🫀' },
  { label: '骨盆',   ww: 400, wc: 40, icon: '🦴' },
];

// 模拟 CT 影像（用 SVG 生成伪 CT 图像）
function generateMockCTImage(series: DicomLiteSeries, slice: number): string {
  const w = 512, h = 512;
  // 简化的伪影像 - 基于模态和切片生成不同的灰度分布
  const hash = (series.id.charCodeAt(0) || 0) + slice * 17;
  let svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
  svg += `<defs><radialGradient id="g1" cx="50%" cy="50%"><stop offset="0%" stop-color="#888"/><stop offset="100%" stop-color="#222"/></radialGradient></defs>`;
  svg += `<rect width="${w}" height="${h}" fill="url(#g1)"/>`;
  // 模拟肺纹理
  if (series.modality === 'CT' && series.bodyPart === '胸部') {
    for (let i = 0; i < 30; i++) {
      const x = (hash + i * 53) % w;
      const y = (hash + i * 89) % h;
      const r = 20 + (i % 5) * 10;
      svg += `<circle cx="${x}" cy="${y}" r="${r}" fill="rgba(80,80,80,0.4)" stroke="rgba(120,120,120,0.6)" stroke-width="1"/>`;
    }
  } else if (series.modality === 'MR' && series.bodyPart === '头颅') {
    for (let i = 0; i < 20; i++) {
      const x = (hash + i * 47) % w;
      const y = (hash + i * 71) % h;
      const r = 30 + (i % 4) * 20;
      svg += `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.7}" fill="rgba(60,60,60,0.5)" stroke="rgba(100,100,100,0.6)" stroke-width="1"/>`;
    }
  } else {
    for (let i = 0; i < 25; i++) {
      const x = (hash + i * 67) % w;
      const y = (hash + i * 97) % h;
      const r = 25 + (i % 6) * 8;
      svg += `<rect x="${x - r}" y="${y - r}" width="${r * 2}" height="${r * 2}" fill="rgba(70,70,70,0.3)" stroke="rgba(110,110,110,0.5)" stroke-width="1"/>`;
    }
  }
  // 模拟肋骨
  if (series.modality === 'CT' && series.bodyPart === '胸部') {
    for (let i = 0; i < 8; i++) {
      svg += `<ellipse cx="${100 + i * 50}" cy="${100}" rx="20" ry="8" fill="rgba(220,220,220,0.5)"/>`;
      svg += `<ellipse cx="${100 + i * 50}" cy="${400}" rx="20" ry="8" fill="rgba(220,220,220,0.5)"/>`;
    }
  }
  svg += `<text x="10" y="20" font-family="monospace" font-size="12" fill="white">${series.seriesDescription}</text>`;
  svg += `<text x="10" y="${h - 10}" font-family="monospace" font-size="12" fill="white">Slice ${slice + 1}/${series.sliceCount} | ${series.modality} | ${series.bodyPart}</text>`;
  svg += `</svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export default function DicomViewerLite({
  series,
  currentSlice = 0,
  showThumbnails = true,
  showTools = true,
  showMeasurementPanel = true,
  height = 600,
  onMeasurementCreate,
}: DicomLiteProps) {
  const [activeSeries, setActiveSeries] = useState(0);
  const [slice, setSlice] = useState(currentSlice);
  const [preset, setPreset] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<'pan' | 'zoom' | 'ww' | 'measure-length' | 'measure-angle' | 'measure-roi' | 'arrow' | 'text'>('pan');
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [showCrosshair, setShowCrosshair] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [measurements, setMeasurements] = useState<DicomLiteMeasurement[]>([]);
  const [drawing, setDrawing] = useState<DicomLiteMeasurement | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeSer = series[activeSeries] || series[0];
  const mockImage = activeSer ? generateMockCTImage(activeSer, slice) : '';

  // 工具栏快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key.toLowerCase()) {
        case 'p': setTool('pan'); break;
        case 'z': setTool('zoom'); break;
        case 'w': setTool('ww'); break;
        case 'l': setTool('measure-length'); break;
        case 'a': setTool('measure-angle'); break;
        case 'r': setTool('measure-roi'); break;
        case 'arrowleft': setSlice(s => Math.max(0, s - 1)); break;
        case 'arrowright': setSlice(s => Math.min(activeSer.sliceCount - 1, s + 1)); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeSer]);

  // 鼠标事件 - 测量工具
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 100;
    const y = (e.clientY - rect.top) / rect.height * 100;

    if (tool === 'measure-length') {
      if (!drawing) {
        setDrawing({ id: `m-${Date.now()}`, type: 'length', points: [{ x, y }], value: '', unit: 'mm', label: '长度' });
      } else {
        const dx = (x - drawing.points[0].x) * 5; // 模拟 5 像素 = 1mm
        const dy = (y - drawing.points[0].y) * 5;
        const dist = Math.sqrt(dx * dx + dy * dy).toFixed(1);
        const newM: DicomLiteMeasurement = {
          ...drawing,
          points: [...drawing.points, { x, y }],
          value: dist,
        };
        setMeasurements(prev => [...prev, newM]);
        setDrawing(null);
        onMeasurementCreate?.(newM);
      }
    } else if (tool === 'measure-roi') {
      if (!drawing) {
        setDrawing({ id: `m-${Date.now()}`, type: 'roi', points: [{ x, y }], value: '', unit: 'mm²', label: 'ROI' });
      } else {
        const w = Math.abs(x - drawing.points[0].x) * 5;
        const h = Math.abs(y - drawing.points[0].y) * 5;
        const area = (w * h).toFixed(1);
        const newM: DicomLiteMeasurement = {
          ...drawing,
          points: [...drawing.points, { x, y }],
          value: area,
        };
        setMeasurements(prev => [...prev, newM]);
        setDrawing(null);
        onMeasurementCreate?.(newM);
      }
    } else if (tool === 'arrow') {
      const newM: DicomLiteMeasurement = {
        id: `m-${Date.now()}`,
        type: 'arrow',
        points: [{ x: x - 5, y }, { x: x + 5, y }],
        value: '',
        unit: '',
        label: '箭头',
      };
      setMeasurements(prev => [...prev, newM]);
    }
  }, [tool, drawing, onMeasurementCreate]);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (!activeSer) {
    return (
      <div style={{ background: '#1a1a1a', borderRadius: 8, padding: 40, textAlign: 'center', color: '#94a3b8', height }}>
        暂无影像
      </div>
    );
  }

  return (
    <div style={{ background: '#0a0a0a', borderRadius: 8, overflow: 'hidden', height: isFullscreen ? '100vh' : height, display: 'flex', flexDirection: 'column' }}>
      {/* 工具栏 */}
      {showTools && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 8px', background: '#1a1a1a', borderBottom: '1px solid #333' }}>
          <ToolButton icon={Move} active={tool === 'pan'} onClick={() => setTool('pan')} title="Pan (P)" />
          <ToolButton icon={ZoomIn} active={tool === 'zoom'} onClick={() => setTool('zoom')} title="Zoom (Z)" />
          <ToolButton icon={Sun} active={tool === 'ww'} onClick={() => setTool('ww')} title="WW/WL (W)" />
          <div style={{ width: 1, height: 20, background: '#333', margin: '0 4px' }} />
          <ToolButton icon={Ruler} active={tool === 'measure-length'} onClick={() => setTool('measure-length')} title="Length (L)" />
          <ToolButton icon={Activity} active={tool === 'measure-angle'} onClick={() => setTool('measure-angle')} title="Angle (A)" />
          <ToolButton icon={Square} active={tool === 'measure-roi'} onClick={() => setTool('measure-roi')} title="ROI (R)" />
          <ToolButton icon={ArrowRight} active={tool === 'arrow'} onClick={() => setTool('arrow')} title="Arrow" />
          <ToolButton icon={Type} active={tool === 'text'} onClick={() => setTool('text')} title="Text" />
          <div style={{ width: 1, height: 20, background: '#333', margin: '0 4px' }} />
          <ToolButton icon={Eye} active={showAnnotations} onClick={() => setShowAnnotations(!showAnnotations)} title="Toggle Annotations" />
          <ToolButton icon={Crosshair} active={showCrosshair} onClick={() => setShowCrosshair(!showCrosshair)} title="Crosshair" />
          <ToolButton icon={Grid3X3} active={showGrid} onClick={() => setShowGrid(!showGrid)} title="Grid" />
          <div style={{ flex: 1 }} />
          <button onClick={resetView} style={iconBtnStyle} title="Reset"><RotateCcw size={14} color="#94a3b8" /></button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} style={iconBtnStyle} title="Fullscreen">
            {isFullscreen ? <Minimize2 size={14} color="#94a3b8" /> : <Maximize2 size={14} color="#94a3b8" />}
          </button>
        </div>
      )}

      {/* WW/WL + Series + Slice 选择器 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', background: '#1a1a1a', borderBottom: '1px solid #333', fontSize: 11, color: '#cbd5e1' }}>
        <select value={preset} onChange={e => setPreset(Number(e.target.value))} style={selectStyle}>
          {WINDOW_PRESETS.map((p, i) => <option key={i} value={i}>{p.icon} {p.label} (WW:{p.ww} WC:{p.wc})</option>)}
        </select>
        <span style={{ color: '#64748b' }}>W:{WINDOW_PRESETS[preset].ww} L:{WINDOW_PRESETS[preset].wc}</span>
        <div style={{ width: 1, height: 16, background: '#333' }} />
        <select value={activeSeries} onChange={e => setActiveSeries(Number(e.target.value))} style={selectStyle}>
          {series.map((s, i) => <option key={s.id} value={i}>{s.seriesDescription} ({s.sliceCount})</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <button onClick={() => setSlice(s => Math.max(0, s - 1))} style={iconBtnStyle}><ChevronLeft size={12} /></button>
        <span style={{ minWidth: 60, textAlign: 'center', fontFamily: 'monospace' }}>{slice + 1}/{activeSer.sliceCount}</span>
        <button onClick={() => setSlice(s => Math.min(activeSer.sliceCount - 1, s + 1))} style={iconBtnStyle}><ChevronRight size={12} /></button>
        <input type="range" min="0" max={activeSer.sliceCount - 1} value={slice} onChange={e => setSlice(Number(e.target.value))} style={{ flex: 1, maxWidth: 120 }} />
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 缩略图 */}
        {showThumbnails && (
          <div style={{ width: 100, background: '#1a1a1a', borderRight: '1px solid #333', overflowY: 'auto', padding: 4 }}>
            <div style={{ fontSize: 10, color: '#64748b', padding: '4px 0', fontWeight: 700 }}>系列</div>
            {series.map((s, i) => (
              <div key={s.id} onClick={() => setActiveSeries(i)} style={{
                background: i === activeSeries ? '#1e3a5f' : '#0a0a0a',
                border: i === activeSeries ? '1px solid #3b82f6' : '1px solid #333',
                borderRadius: 4, padding: 4, marginBottom: 4, cursor: 'pointer', fontSize: 10, color: '#cbd5e1',
              }}>
                <img src={generateMockCTImage(s, 0)} alt={s.seriesDescription} style={{ width: '100%', borderRadius: 2, marginBottom: 4 }} />
                <div style={{ fontWeight: 600 }}>{s.seriesDescription}</div>
                <div style={{ color: '#64748b' }}>{s.modality} | {s.sliceCount}片</div>
              </div>
            ))}
          </div>
        )}

        {/* 主影像区 */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={e => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            setHoverPos({
              x: (e.clientX - rect.left) / rect.width * 100,
              y: (e.clientY - rect.top) / rect.height * 100,
            });
          }}
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            background: '#000',
            cursor: tool === 'pan' ? 'move' : tool === 'measure-length' || tool === 'measure-roi' ? 'crosshair' : 'default',
          }}
        >
          <div style={{
            position: 'absolute',
            inset: 0,
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transition: 'transform 0.1s',
          }}>
            <img src={mockImage} alt="CT slice" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: `brightness(${1 + (WINDOW_PRESETS[preset].wc / 1000)}) contrast(${WINDOW_PRESETS[preset].ww / 500})` }} />
          </div>

          {/* 测量叠加 */}
          {showAnnotations && (
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
              {measurements.map(m => {
                if (m.type === 'length' && m.points.length === 2) {
                  return (
                    <g key={m.id}>
                      <line x1={m.points[0].x} y1={m.points[0].y} x2={m.points[1].x} y2={m.points[1].y} stroke="#fbbf24" strokeWidth="0.3" />
                      <circle cx={m.points[0].x} cy={m.points[0].y} r="0.5" fill="#fbbf24" />
                      <circle cx={m.points[1].x} cy={m.points[1].y} r="0.5" fill="#fbbf24" />
                      <text x={(m.points[0].x + m.points[1].x) / 2} y={(m.points[0].y + m.points[1].y) / 2 - 1} fontSize="2" fill="#fbbf24" textAnchor="middle">{m.value} mm</text>
                    </g>
                  );
                } else if (m.type === 'roi' && m.points.length === 2) {
                  return (
                    <g key={m.id}>
                      <rect x={Math.min(m.points[0].x, m.points[1].x)} y={Math.min(m.points[0].y, m.points[1].y)}
                            width={Math.abs(m.points[1].x - m.points[0].x)} height={Math.abs(m.points[1].y - m.points[0].y)}
                            fill="rgba(251, 191, 36, 0.1)" stroke="#fbbf24" strokeWidth="0.2" />
                      <text x={m.points[0].x} y={m.points[0].y - 1} fontSize="2" fill="#fbbf24">{m.value} mm²</text>
                    </g>
                  );
                } else if (m.type === 'arrow' && m.points.length === 2) {
                  return (
                    <line key={m.id} x1={m.points[0].x} y1={m.points[0].y} x2={m.points[1].x} y2={m.points[1].y} stroke="#22c55e" strokeWidth="0.3" markerEnd="url(#arrowhead)" />
                  );
                }
                return null;
              })}
              {drawing && drawing.type === 'length' && (
                <line x1={drawing.points[0].x} y1={drawing.points[0].y}
                      x2={hoverPos?.x || drawing.points[0].x} y2={hoverPos?.y || drawing.points[0].y}
                      stroke="#fbbf24" strokeWidth="0.3" strokeDasharray="1,1" />
              )}
              {showCrosshair && hoverPos && (
                <>
                  <line x1={hoverPos.x} y1="0" x2={hoverPos.x} y2="100" stroke="#3b82f6" strokeWidth="0.1" strokeDasharray="0.5,0.5" />
                  <line x1="0" y1={hoverPos.y} x2="100" y2={hoverPos.y} stroke="#3b82f6" strokeWidth="0.1" strokeDasharray="0.5,0.5" />
                </>
              )}
              {showGrid && Array.from({ length: 10 }).map((_, i) => (
                <line key={`gh-${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="0.05" />
              ))}
              {showGrid && Array.from({ length: 10 }).map((_, i) => (
                <line key={`gv-${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="rgba(255,255,255,0.1)" strokeWidth="0.05" />
              ))}
            </svg>
          )}

          {/* 鼠标坐标 */}
          {hoverPos && (
            <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.7)', color: '#fbbf24', fontSize: 10, padding: '2px 6px', borderRadius: 2, fontFamily: 'monospace' }}>
              X: {hoverPos.x.toFixed(1)} Y: {hoverPos.y.toFixed(1)} | Zoom: {zoom.toFixed(2)}x
            </div>
          )}
        </div>

        {/* 测量面板 */}
        {showMeasurementPanel && measurements.length > 0 && (
          <div style={{ width: 160, background: '#1a1a1a', borderLeft: '1px solid #333', padding: 8, overflowY: 'auto' }}>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 6, fontWeight: 700 }}>测量 ({measurements.length})</div>
            {measurements.map(m => (
              <div key={m.id} style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: 4, padding: 6, marginBottom: 4, fontSize: 10, color: '#cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600 }}>{m.label}</span>
                  <button onClick={() => setMeasurements(prev => prev.filter(x => x.id !== m.id))} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>×</button>
                </div>
                <div style={{ color: '#fbbf24', marginTop: 2 }}>{m.value} {m.unit}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  padding: 4,
  borderRadius: 4,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const selectStyle: React.CSSProperties = {
  background: '#0a0a0a',
  color: '#cbd5e1',
  border: '1px solid #333',
  borderRadius: 4,
  padding: '2px 6px',
  fontSize: 11,
};

function ToolButton({ icon: Icon, active, onClick, title }: { icon: any; active: boolean; onClick: () => void; title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        ...iconBtnStyle,
        background: active ? '#1e40af' : 'transparent',
      }}
    >
      <Icon size={14} color={active ? '#fff' : '#94a3b8'} />
    </button>
  );
}
