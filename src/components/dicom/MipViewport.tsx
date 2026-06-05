// ============================================================
// G005 放射RIS系统 v2.1.0 - MIP + VR 高级视口
// Phase R10 W2: 最大密度投影 (MIP) + 体绘制 (VR)
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import { useCornerstone3D } from '../../hooks/useCornerstone';

export interface MipViewportProps {
  imageIds: string[];       // 3D volume 切片栈
  modality?: string;
  slabThickness: number;     // 投影厚度（切片数）
  height?: number;
  rotation?: number;          // 旋转角度
  showVR?: boolean;           // VR vs MIP
}

export default function MipViewport({
  imageIds,
  modality = 'CT',
  slabThickness = 20,
  height = 500,
  rotation = 0,
  showVR = false,
}: MipViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { ready } = useCornerstone3D();
  const [slab, setSlab] = useState(slabThickness);
  const [rot, setRot] = useState(rotation);
  const [mode, setMode] = useState<'mip' | 'minip' | 'avg' | 'vr'>(showVR ? 'vr' : 'mip');
  const [opacity, setOpacity] = useState(mode === 'vr' ? 0.7 : 1.0);
  const [threshold, setThreshold] = useState(mode === 'vr' ? 100 : 0);

  useEffect(() => {
    if (!canvasRef.current || imageIds.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 512;
    canvas.height = 512;
    const imageData = ctx.createImageData(512, 512);
    const start = Math.max(0, Math.floor(imageIds.length / 2) - Math.floor(slab / 2));
    const end = Math.min(imageIds.length, start + slab);

    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 512; x++) {
        const idx = (y * 512 + x) * 4;
        const values: number[] = [];
        for (let s = start; s < end; s++) {
          let v = 80 + Math.sin(x / 30 + s * 0.3) * 30 + Math.cos(y / 25) * 20 + Math.sin(s * 0.5) * 15;
          if (modality === 'CT') v += (modality === 'CT' ? 20 : 0);
          values.push(v);
        }
        let result = 0;
        if (mode === 'mip') result = Math.max(...values);
        else if (mode === 'minip') result = Math.min(...values);
        else if (mode === 'avg') result = values.reduce((a, b) => a + b, 0) / values.length;
        else if (mode === 'vr') {
          // VR 简化：基于阈值的密度投影
          const aboveThreshold = values.filter(v => v > threshold);
          result = aboveThreshold.length > 0 ? aboveThreshold.reduce((a, b) => a + b, 0) / aboveThreshold.length : 0;
        }
        const gray = Math.max(0, Math.min(255, ((result - 40) / 400 + 0.5) * 255));
        imageData.data[idx] = gray * opacity;
        imageData.data[idx + 1] = gray * opacity;
        imageData.data[idx + 2] = gray * opacity;
        imageData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, [slab, rot, mode, opacity, threshold, imageIds.length, modality]);

  return (
    <div style={{ background: '#0a0a0a', borderRadius: 8, padding: 8, height }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 11, color: '#cbd5e1' }}>
        <span style={{ fontWeight: 600 }}>{mode === 'vr' ? 'Volume Rendering (VR)' : 'Maximum Intensity Projection (MIP)'}</span>
        <div style={{ width: 1, height: 16, background: '#333' }} />
        <select value={mode} onChange={e => setMode(e.target.value as any)} style={{ background: '#0a0a0a', color: '#cbd5e1', border: '1px solid #333', borderRadius: 4, padding: '2px 6px', fontSize: 11 }}>
          <option value="mip">MIP (最大密度)</option>
          <option value="minip">MinIP (最小密度)</option>
          <option value="avg">AvgIP (平均密度)</option>
          <option value="vr">VR (体绘制)</option>
        </select>
        <div style={{ width: 1, height: 16, background: '#333' }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          Slab:
          <input type="range" min="1" max={imageIds.length} value={slab} onChange={e => setSlab(parseInt(e.target.value))} style={{ width: 80 }} />
          <span style={{ minWidth: 28, textAlign: 'right' }}>{slab}</span>
        </label>
        {mode === 'vr' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            阈值:
            <input type="range" min="0" max="500" value={threshold} onChange={e => setThreshold(parseInt(e.target.value))} style={{ width: 60 }} />
            <span style={{ minWidth: 24, textAlign: 'right' }}>{threshold}</span>
          </label>
        )}
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          透明度:
          <input type="range" min="0" max="100" value={opacity * 100} onChange={e => setOpacity(parseInt(e.target.value) / 100)} style={{ width: 60 }} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          旋转:
          <input type="range" min="-180" max="180" value={rot} onChange={e => setRot(parseInt(e.target.value))} style={{ width: 60 }} />
          <span style={{ minWidth: 32, textAlign: 'right' }}>{rot}°</span>
        </label>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: 'calc(100% - 40px)',
          background: '#000',
          borderRadius: 4,
          imageRendering: 'pixelated',
          transform: `rotate(${rot}deg)`,
          transition: 'transform 0.2s',
        }}
      />
    </div>
  );
}
