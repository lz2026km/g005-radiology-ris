// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 标注层 (Arrow + Text + Region + Lesion Tracking)
// Phase R10 W2 (基础标注) + R11 W1 (病灶追踪入口)
// ============================================================

import React, { useState, useRef, useCallback } from 'react';
import { Activity } from 'lucide-react';

export interface Annotation {
  id: string;
  type: 'arrow' | 'text' | 'rectangle' | 'ellipse' | 'freehand';
  points: { x: number; y: number }[];
  text: string;
  color: string;
  category: 'finding' | 'measurement' | 'note' | 'critical';
  /** 可选关联的病灶追踪 ID(v3.0.6.5) */
  lesionId?: string;
  createdAt: string;
  createdBy: string;
}

export interface AnnotationLayerProps {
  width: number;
  height: number;
  annotations: Annotation[];
  onAnnotationCreate?: (ann: Annotation) => void;
  onAnnotationUpdate?: (id: string, ann: Annotation) => void;
  onAnnotationDelete?: (id: string) => void;
  activeTool?: 'select' | 'arrow' | 'text' | 'rectangle' | 'ellipse';
  readonly?: boolean;
  /** v3.0.6.5: 病灶追踪按钮回调(打开 LesionTrackingViewer) */
  onLesionTrackingOpen?: () => void;
  /** v3.0.6.5: 当前 study UID(用于病灶上下文) */
  studyInstanceUID?: string;
}

const ANNOTATION_COLORS = {
  finding: '#fbbf24',     // 黄色 - 影像所见
  measurement: '#22c55e', // 绿色 - 测量
  note: '#3b82f6',       // 蓝色 - 备注
  critical: '#ef4444',    // 红色 - 危急
};

let annotationCounter = 0;

export default function AnnotationLayer({
  width,
  height,
  annotations,
  onAnnotationCreate,
  onAnnotationUpdate,
  onAnnotationDelete,
  activeTool = 'select',
  readonly = false,
  onLesionTrackingOpen,
  studyInstanceUID: _studyInstanceUID,
}: AnnotationLayerProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [drawing, setDrawing] = useState<Annotation | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const screenToSvg = useCallback((e: React.MouseEvent): { x: number; y: number } | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * width,
      y: ((e.clientY - rect.top) / rect.height) * height,
    };
  }, [width, height]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (readonly) return;
    const pos = screenToSvg(e);
    if (!pos) return;
    if (activeTool === 'select') {
      // 选中处理
      return;
    }
    if (activeTool === 'text') {
      // 文字标注：单点放置
      annotationCounter++;
      const newAnn: Annotation = {
        id: `ann-${Date.now()}-${annotationCounter}`,
        type: 'text',
        points: [pos],
        text: '右键编辑...',
        color: ANNOTATION_COLORS.note,
        category: 'note',
        createdAt: new Date().toISOString(),
        createdBy: 'doctor@g005.local',
      };
      onAnnotationCreate?.(newAnn);
      setEditingTextId(newAnn.id);
      return;
    }
    // 箭头/矩形/椭圆：拖动绘制
    setDragStart(pos);
    annotationCounter++;
    setDrawing({
      id: `ann-${Date.now()}-${annotationCounter}`,
      type: activeTool,
      points: [pos],
      text: '',
      color: ANNOTATION_COLORS.finding,
      category: 'finding',
      createdAt: new Date().toISOString(),
      createdBy: 'doctor@g005.local',
    });
  }, [activeTool, readonly, screenToSvg, onAnnotationCreate]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drawing || !dragStart) return;
    const pos = screenToSvg(e);
    if (!pos) return;
    setDrawing({ ...drawing, points: [dragStart, pos] });
  }, [drawing, dragStart, screenToSvg]);

  const handleMouseUp = useCallback(() => {
    if (drawing) {
      if (drawing.points.length === 2) {
        const [p1, p2] = drawing.points;
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        if (dist > 5) {
          onAnnotationCreate?.(drawing);
        }
      }
      setDrawing(null);
      setDragStart(null);
    }
  }, [drawing, onAnnotationCreate]);

  return (
    <div style={{ position: 'relative' }}>
      {onLesionTrackingOpen && (
        <button
          type="button"
          onClick={onLesionTrackingOpen}
          title="打开病灶追踪视图"
          aria-label="病灶追踪"
          data-testid="annotation-lesion-tracking-btn"
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 600,
            color: '#fff',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            border: '1px solid #b91c1c',
            borderRadius: 6,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          }}
        >
          <Activity size={13} />
          病灶追踪
        </button>
      )}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{
          position: 'absolute', inset: 0,
          cursor: activeTool === 'select' ? 'default' : 'crosshair',
          pointerEvents: readonly ? 'none' : 'auto',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <defs>
          <marker id="ann-arrow-head" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="currentColor" />
          </marker>
        </defs>
        {/* 已存在标注 */}
        {annotations.map(ann => {
          const color = ann.color;
          if (ann.type === 'arrow' && ann.points.length === 2) {
            return (
              <g key={ann.id} style={{ color }} onClick={() => setSelectedId(ann.id)}>
                <line x1={ann.points[0].x} y1={ann.points[0].y} x2={ann.points[1].x} y2={ann.points[1].y}
                  stroke={color} strokeWidth="2" markerEnd="url(#ann-arrow-head)" />
                {ann.text && (
                  <text x={(ann.points[0].x + ann.points[1].x) / 2} y={(ann.points[0].y + ann.points[1].y) / 2 - 8}
                    fontSize="14" fill={color} textAnchor="middle" fontWeight="600">{ann.text}</text>
                )}
              </g>
            );
          }
          if (ann.type === 'rectangle' && ann.points.length === 2) {
            return (
              <g key={ann.id} onClick={() => setSelectedId(ann.id)}>
                <rect x={Math.min(ann.points[0].x, ann.points[1].x)} y={Math.min(ann.points[0].y, ann.points[1].y)}
                  width={Math.abs(ann.points[1].x - ann.points[0].x)} height={Math.abs(ann.points[1].y - ann.points[0].y)}
                  fill="rgba(251, 191, 36, 0.15)" stroke={color} strokeWidth="2" />
                {ann.text && <text x={ann.points[0].x} y={ann.points[0].y - 6} fontSize="14" fill={color} fontWeight="600">{ann.text}</text>}
              </g>
            );
          }
          if (ann.type === 'ellipse' && ann.points.length === 2) {
            const cx = (ann.points[0].x + ann.points[1].x) / 2;
            const cy = (ann.points[0].y + ann.points[1].y) / 2;
            const rx = Math.abs(ann.points[1].x - ann.points[0].x) / 2;
            const ry = Math.abs(ann.points[1].y - ann.points[0].y) / 2;
            return (
              <g key={ann.id} onClick={() => setSelectedId(ann.id)}>
                <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="rgba(251, 191, 36, 0.15)" stroke={color} strokeWidth="2" />
                {ann.text && <text x={cx} y={cy - ry - 6} fontSize="14" fill={color} textAnchor="middle" fontWeight="600">{ann.text}</text>}
              </g>
            );
          }
          if (ann.type === 'text' && ann.points.length === 1) {
            return (
              <g key={ann.id} onClick={() => setSelectedId(ann.id)}>
                {editingTextId === ann.id ? (
                  <foreignObject x={ann.points[0].x} y={ann.points[0].y - 18} width="300" height="40">
                    <input
                      autoFocus
                      defaultValue={ann.text}
                      onBlur={(e) => { onAnnotationUpdate?.(ann.id, { ...ann, text: e.target.value }); setEditingTextId(null); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                      style={{ fontSize: 14, padding: '2px 6px', border: `2px solid ${color}`, borderRadius: 3 }}
                    />
                  </foreignObject>
                ) : (
                  <text x={ann.points[0].x} y={ann.points[0].y} fontSize="14" fill={color} fontWeight="600" style={{ cursor: 'pointer' }}
                    onDoubleClick={() => setEditingTextId(ann.id)}>
                    📌 {ann.text}
                  </text>
                )}
              </g>
            );
          }
          return null;
        })}

        {/* 正在绘制 */}
        {drawing && drawing.points.length === 2 && (
          <>
            {drawing.type === 'arrow' && (
              <line x1={drawing.points[0].x} y1={drawing.points[0].y} x2={drawing.points[1].x} y2={drawing.points[1].y}
                stroke={drawing.color} strokeWidth="2" strokeDasharray="4,2" markerEnd="url(#ann-arrow-head)" style={{ color: drawing.color }} />
            )}
            {drawing.type === 'rectangle' && (
              <rect x={Math.min(drawing.points[0].x, drawing.points[1].x)} y={Math.min(drawing.points[0].y, drawing.points[1].y)}
                width={Math.abs(drawing.points[1].x - drawing.points[0].x)} height={Math.abs(drawing.points[1].y - drawing.points[0].y)}
                fill="rgba(251, 191, 36, 0.1)" stroke={drawing.color} strokeWidth="2" strokeDasharray="4,2" />
            )}
            {drawing.type === 'ellipse' && (
              <ellipse cx={(drawing.points[0].x + drawing.points[1].x) / 2} cy={(drawing.points[0].y + drawing.points[1].y) / 2}
                rx={Math.abs(drawing.points[1].x - drawing.points[0].x) / 2} ry={Math.abs(drawing.points[1].y - drawing.points[0].y) / 2}
                fill="rgba(251, 191, 36, 0.1)" stroke={drawing.color} strokeWidth="2" strokeDasharray="4,2" />
            )}
          </>
        )}
      </svg>
    </div>
  );
}
