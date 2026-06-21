/**
 * G005 放射RIS系统 v3.0.6.5 - 病灶框可视化 (DICOM overlay mock)
 * A5-AI-ORCH / 30 点
 */

import React, { useEffect, useState } from 'react';
import { Card, Tag, Space, Switch, Slider, Select, Empty, List, Button } from 'antd';
import { Eye, EyeOff, Crosshair, Ruler, FileText } from 'lucide-react';
import { lesionDetector } from '../../services/ai/vision/LesionDetector';
import type { AIStudyDetection, AIDetectedFinding } from '../../types/ai/orchestrator';

export interface LesionOverlayProps {
  studyId: string;
  modality?: string;
  bodyPart?: string;
  width?: number;
  height?: number;
  onSelectFinding?: (f: AIDetectedFinding) => void;
}

const TYPE_COLORS: Record<string, string> = {
  nodule: '#3b82f6',
  mass: '#ef4444',
  calcification: '#f59e0b',
  hemorrhage: '#dc2626',
  fracture: '#a855f7',
  consolidation: '#06b6d4',
  effusion: '#84cc16',
  infarct: '#ec4899',
  other: '#94a3b8',
};

export const LesionOverlay: React.FC<LesionOverlayProps> = ({
  studyId,
  modality = 'CT',
  bodyPart = '胸部',
  width = 512,
  height = 512,
  onSelectFinding,
}) => {
  const [detection, setDetection] = useState<AIStudyDetection | null>(null);
  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(new Set());
  const [minConfidence, setMinConfidence] = useState(0.5);
  const [showLabels, setShowLabels] = useState(true);
  const [showBoxes, setShowBoxes] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void detect();
  }, [studyId, modality, bodyPart]);

  const detect = async () => {
    setLoading(true);
    try {
      const d = await lesionDetector.detect({ studyId, modality, bodyPart });
      setDetection(d);
      setVisibleTypes(new Set(d.findings.map((f) => f.type)));
    } finally {
      setLoading(false);
    }
  };

  const filtered = detection?.findings.filter((f) => f.confidence >= minConfidence && visibleTypes.has(f.type)) ?? [];

  return (
    <div data-testid="lesion-overlay" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 12 }}>
      <Card
        size="small"
        title={
          <Space>
            <Crosshair size={14} />
            <span>病灶定位</span>
            {detection && <Tag color="blue">{detection.totalFindings} 处</Tag>}
          </Space>
        }
        extra={
          <Space>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>标注</span>
            <Switch size="small" checked={showBoxes} onChange={setShowBoxes} />
            <span style={{ fontSize: 11, color: '#94a3b8' }}>标签</span>
            <Switch size="small" checked={showLabels} onChange={setShowLabels} />
            <Button size="small" onClick={detect} loading={loading}>重新检测</Button>
          </Space>
        }
        bodyStyle={{ padding: 0, background: '#020617' }}
      >
        <div style={{ position: 'relative', width, height, background: 'repeating-linear-gradient(45deg, #0f172a, #0f172a 8px, #1e293b 8px, #1e293b 16px)' }}>
          {detection?.findings.map((f) => {
            if (f.confidence < minConfidence || !visibleTypes.has(f.type)) return null;
            const color = TYPE_COLORS[f.type] ?? '#94a3b8';
            return (
              <div
                key={f.id}
                onClick={() => onSelectFinding?.(f)}
                style={{
                  position: 'absolute',
                  left: f.bbox.x,
                  top: f.bbox.y,
                  width: f.bbox.width,
                  height: f.bbox.height,
                  border: showBoxes ? `2px solid ${color}` : 'none',
                  borderRadius: 2,
                  cursor: 'pointer',
                  background: showBoxes ? 'transparent' : 'transparent',
                  boxShadow: showBoxes ? `0 0 0 1px rgba(0,0,0,0.4)` : 'none',
                }}
              >
                {showLabels && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -22,
                      left: 0,
                      background: color,
                      color: 'white',
                      padding: '1px 6px',
                      borderRadius: 3,
                      fontSize: 10,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {f.label} ({(f.confidence * 100).toFixed(0)}%)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div>
        <Card size="small" title="显示控制" style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>最低置信度: {(minConfidence * 100).toFixed(0)}%</div>
            <Slider min={0} max={1} step={0.05} value={minConfidence} onChange={setMinConfidence} />
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>类型</div>
          <Space wrap size={4}>
            {detection &&
              Array.from(new Set(detection.findings.map((f) => f.type))).map((t) => (
                <Tag.CheckableTag
                  key={t}
                  checked={visibleTypes.has(t)}
                  onChange={(checked) => {
                    const next = new Set(visibleTypes);
                    if (checked) next.add(t);
                    else next.delete(t);
                    setVisibleTypes(next);
                  }}
                  style={{ borderColor: TYPE_COLORS[t], color: visibleTypes.has(t) ? 'white' : TYPE_COLORS[t], background: visibleTypes.has(t) ? TYPE_COLORS[t] : 'transparent' }}
                >
                  {t}
                </Tag.CheckableTag>
              ))}
          </Space>
        </Card>

        <Card size="small" title={`检出 (${filtered.length})`} bodyStyle={{ maxHeight: 320, overflow: 'auto' }}>
          {filtered.length === 0 ? (
            <Empty description="无显示项" />
          ) : (
            <List
              size="small"
              dataSource={filtered}
              renderItem={(f) => (
                <List.Item
                  key={f.id}
                  onClick={() => onSelectFinding?.(f)}
                  style={{ cursor: 'pointer', padding: '6px 4px' }}
                >
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, background: TYPE_COLORS[f.type], borderRadius: 2, marginRight: 6 }} />
                        {f.label}
                      </span>
                      <span style={{ fontSize: 11, color: '#3b82f6' }}>{(f.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{f.location}</div>
                    {f.diameterMm !== undefined && f.diameterMm > 0 && (
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>
                        <Ruler size={10} /> {f.diameterMm}mm
                      </div>
                    )}
                    {f.srReference && (
                      <div style={{ fontSize: 10, color: '#64748b' }}>
                        <FileText size={10} /> {f.srReference.codingScheme}:{f.srReference.conceptCode}
                      </div>
                    )}
                  </div>
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default LesionOverlay;
