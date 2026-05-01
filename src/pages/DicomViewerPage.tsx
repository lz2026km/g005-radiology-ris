// @ts-nocheck
// ============================================================
// G005 放射科RIS - DICOM影像浏览器 v0.3.0
// 模拟DICOM查看器，支持窗宽窗位/缩放/旋转/测量
// ============================================================
import { useState, useRef } from 'react'
import {
  ZoomIn, ZoomOut, RotateCw, RotateCcw, FlipHorizontal, FlipVertical,
  Sun, Moon, Grid, Download, Maximize2, Move, DownloadCloud,
  FileImage, FolderOpen, X, Plus, Minus, Layers, Eye
} from 'lucide-react'

const s: Record<string, React.CSSProperties> = {
  root: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 52px)', background: '#0f172a' },
  toolbar: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#1e293b', borderBottom: '1px solid #334155', flexShrink: 0, flexWrap: 'wrap' },
  toolGroup: { display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px', borderRight: '1px solid #334155' },
  toolBtn: { background: 'transparent', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8', fontSize: 12, transition: 'all 0.15s' },
  toolBtnActive: { background: '#3b82f6', color: '#fff' },
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  viewerArea: { flex: 1, display: 'flex', flexDirection: 'column', background: '#000', position: 'relative' },
  imageContainer: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  imageWrapper: { position: 'relative', border: '2px solid #334155', background: '#111' },
  image: { display: 'block', maxWidth: '100%', maxHeight: '100%' },
  overlay: { position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.7)', borderRadius: 6, padding: '6px 10px', color: '#fff', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 2 },
  overlayBottom: { position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.7)', borderRadius: 6, padding: '6px 10px', color: '#fff', fontSize: 11 },
  rightPanel: { width: 280, background: '#1e293b', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  panelSection: { padding: 16, borderBottom: '1px solid #334155' },
  panelTitle: { fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' },
  sliderRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  sliderLabel: { fontSize: 11, color: '#64748b', width: 48, flexShrink: 0 },
  slider: { flex: 1, accentColor: '#3b82f6' },
  sliderVal: { fontSize: 11, color: '#94a3b8', width: 36, textAlign: 'right' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  infoItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  infoLabel: { fontSize: 10, color: '#64748b' },
  infoValue: { fontSize: 12, color: '#f1f5f9', fontWeight: 600 },
  presetGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 },
  presetBtn: { padding: '5px 8px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontSize: 11, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' },
  presetBtnActive: { background: '#3b82f6', color: '#fff', borderColor: '#3b82f6' },
  fileList: { flex: 1, overflow: 'auto', padding: 8 },
  fileItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, cursor: 'pointer', marginBottom: 2, background: 'transparent', border: 'none', width: '100%', textAlign: 'left', color: '#94a3b8', fontSize: 12 },
  fileItemActive: { background: '#334155', color: '#f1f5f9' },
  statusBar: { display: 'flex', alignItems: 'center', gap: 16, padding: '6px 16px', background: '#0f172a', borderTop: '1px solid #334155', fontSize: 11, color: '#64748b', flexShrink: 0 },
  gridOverlay: { position: 'absolute', inset: 0, pointerEvents: 'none' },
}

const windowPresets = [
  { name: '肺窗', ww: 1500, wl: -600 },
  { name: '纵隔窗', ww: 400, wl: 40 },
  { name: '骨窗', ww: 2000, wl: 400 },
  { name: '脑窗', ww: 80, wl: 40 },
  { name: '腹部窗', ww: 400, wl: 50 },
  { name: '肝脏窗', ww: 150, wl: 30 },
]

const mockFiles = [
  { id: 1, name: 'CT_Chest_20260501.dcm', patient: '李明', date: '2026-05-01', modality: 'CT' },
  { id: 2, name: 'MR_Brain_20260501.dcm', patient: '王芳', date: '2026-05-01', modality: 'MR' },
  { id: 3, name: 'DR_Chest_20260501.dcm', patient: '张伟', date: '2026-05-01', modality: 'DR' },
]

export default function DicomViewerPage() {
  const [zoom, setZoom] = useState(100)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [activePreset, setActivePreset] = useState<number | null>(null)
  const [activeFile, setActiveFile] = useState(0)
  const [ww, setWw] = useState(400)
  const [wl, setWl] = useState(40)
  const [hflip, setHflip] = useState(false)
  const [vflip, setVflip] = useState(false)

  const imgStyle: React.CSSProperties = {
    transform: `scale(${zoom / 100}) rotate(${rotation}deg) scaleX(${hflip ? -1 : 1}) scaleY(${vflip ? -1 : 1})`,
    filter: `brightness(${brightness}%) contrast(${contrast}%)`,
    transition: 'transform 0.2s, filter 0.2s',
    maxWidth: '100%',
    maxHeight: '100%',
  }

  const applyPreset = (preset: typeof windowPresets[0]) => {
    setWw(preset.ww)
    setWl(preset.wl)
    setActivePreset(preset.name === activePreset ? null : preset.name)
  }

  const handleRotate = (deg: number) => setRotation(r => (r + deg) % 360)

  const gridLines = showGrid ? (
    <div style={s.gridOverlay}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        {[25, 50, 75].map(p => (
          <g key={p}>
            <line x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="4" />
            <line x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="4" />
          </g>
        ))}
      </svg>
    </div>
  ) : null

  return (
    <div style={s.root}>
      {/* 顶部工具栏 */}
      <div style={s.toolbar}>
        {/* 文件 */}
        <div style={s.toolGroup}>
          <button style={s.toolBtn} title="打开文件"><FolderOpen size={16} /></button>
          <button style={s.toolBtn} title="保存"><Download size={16} /></button>
        </div>
        {/* 缩放 */}
        <div style={s.toolGroup}>
          <button style={s.toolBtn} onClick={() => setZoom(z => Math.max(10, z - 10))}><ZoomOut size={16} /></button>
          <span style={{ fontSize: 12, color: '#f1f5f9', minWidth: 48, textAlign: 'center' }}>{zoom}%</span>
          <button style={s.toolBtn} onClick={() => setZoom(z => Math.min(500, z + 10))}><ZoomIn size={16} /></button>
        </div>
        {/* 旋转 */}
        <div style={s.toolGroup}>
          <button style={s.toolBtn} onClick={() => handleRotate(-90)} title="逆时针旋转"><RotateCcw size={16} /></button>
          <button style={s.toolBtn} onClick={() => handleRotate(90)} title="顺时针旋转"><RotateCw size={16} /></button>
        </div>
        {/* 翻转 */}
        <div style={s.toolGroup}>
          <button style={{ ...s.toolBtn, ...(hflip ? s.toolBtnActive : {}) }} onClick={() => setHflip(h => !h)} title="水平翻转"><FlipHorizontal size={16} /></button>
          <button style={{ ...s.toolBtn, ...(vflip ? s.toolBtnActive : {}) }} onClick={() => setVflip(v => !v)} title="垂直翻转"><FlipVertical size={16} /></button>
        </div>
        {/* 亮度对比度 */}
        <div style={s.toolGroup}>
          <button style={s.toolBtn} onClick={() => setBrightness(100)} title="重置"><Sun size={16} /></button>
        </div>
        {/* 窗宽窗位预设 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px' }}>
          {windowPresets.map((p, i) => (
            <button key={p.name} style={{ ...s.presetBtn, ...(activePreset === p.name ? s.presetBtnActive : {}) }} onClick={() => applyPreset(p)}>
              {p.name}
            </button>
          ))}
        </div>
        {/* 网格 */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button style={{ ...s.toolBtn, ...(showGrid ? s.toolBtnActive : {}) }} onClick={() => setShowGrid(g => !g)}><Grid size={16} /></button>
          <button style={s.toolBtn}><Maximize2 size={16} /></button>
        </div>
      </div>

      {/* 主体区域 */}
      <div style={s.body}>
        {/* 图像查看区 */}
        <div style={s.viewerArea}>
          <div style={s.imageContainer}>
            <div style={s.imageWrapper}>
              {/* 模拟CT横断面图像 */}
              <svg width={512} height={512} style={imgStyle} viewBox="0 0 512 512">
                <defs>
                  <radialGradient id="ctGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#222" />
                    <stop offset="40%" stopColor="#1a1a1a" />
                    <stop offset="60%" stopColor="#333" />
                    <stop offset="100%" stopColor="#111" />
                  </radialGradient>
                </defs>
                <rect width="512" height="512" fill="url(#ctGrad)" />
                {/* 模拟肺部 */}
                <ellipse cx="180" cy="200" rx="60" ry="90" fill="#0d0d0d" />
                <ellipse cx="332" cy="200" rx="60" ry="90" fill="#0d0d0d" />
                {/* 模拟心脏 */}
                <ellipse cx="256" cy="280" rx="55" ry="60" fill="#3a3a3a" />
                {/* 模拟脊椎 */}
                <ellipse cx="256" cy="420" rx="25" ry="15" fill="#2a2a2a" />
                {/* 扫描伪影线 */}
                {[0,30,60,90,120,150].map(a => (
                  <line key={a} x1="256" y1="256" x2={256+200*Math.cos(a*Math.PI/180)} y2={256+200*Math.sin(a*Math.PI/180)} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                ))}
                {/* 肋骨环 */}
                {[0,1,2,3,4,5,6,7].map(i => (
                  <ellipse key={i} cx="180" cy={160+i*25} rx="50" ry="8" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                ))}
                {[0,1,2,3,4,5,6,7].map(i => (
                  <ellipse key={i} cx="332" cy={160+i*25} rx="50" ry="8" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                ))}
                {/* 窗宽窗位标注 */}
                <text x="10" y="20" fill="#3b82f6" fontSize="12" fontFamily="monospace">WW:{ww} WL:{wl}</text>
                <text x="10" y="36" fill="#22c55e" fontSize="12" fontFamily="monospace">Zoom:{zoom}% Rot:{rotation}°</text>
              </svg>
              {gridLines}
              {/* 叠加信息 */}
              <div style={s.overlay}>
                <span>患者: {mockFiles[activeFile].patient}</span>
                <span>检查: {mockFiles[activeFile].modality}胸部平扫</span>
                <span>日期: {mockFiles[activeFile].date}</span>
              </div>
              <div style={s.overlayBottom}>
                序列: 1/45 | 层厚: 1.0mm | KVP: 120
              </div>
            </div>
          </div>

          {/* 底部状态栏 */}
          <div style={s.statusBar}>
            <span>📁 {mockFiles[activeFile].name}</span>
            <span>窗口: {ww}/{wl}</span>
            <span>缩放: {zoom}%</span>
            <span>旋转: {rotation}°</span>
            <span style={{ marginLeft: 'auto' }}>DICOM Viewer v0.3.0</span>
          </div>
        </div>

        {/* 右侧面板 */}
        <div style={s.rightPanel}>
          <div style={s.panelSection}>
            <div style={s.panelTitle}>窗宽窗位</div>
            <div style={s.sliderRow}>
              <span style={s.sliderLabel}>窗宽(WW)</span>
              <input type="range" min="50" max="4000" value={ww} onChange={e => { setWw(+e.target.value); setActivePreset(null) }} style={s.slider} />
              <span style={s.sliderVal}>{ww}</span>
            </div>
            <div style={s.sliderRow}>
              <span style={s.sliderLabel}>窗位(WL)</span>
              <input type="range" min="-1000" max="1000" value={wl} onChange={e => { setWl(+e.target.value); setActivePreset(null) }} style={s.slider} />
              <span style={s.sliderVal}>{wl}</span>
            </div>
          </div>

          <div style={s.panelSection}>
            <div style={s.panelTitle}>图像调整</div>
            <div style={s.sliderRow}>
              <span style={s.sliderLabel}>缩放</span>
              <input type="range" min="10" max="500" value={zoom} onChange={e => setZoom(+e.target.value)} style={s.slider} />
              <span style={s.sliderVal}>{zoom}%</span>
            </div>
            <div style={s.sliderRow}>
              <span style={s.sliderLabel}>亮度</span>
              <input type="range" min="20" max="200" value={brightness} onChange={e => setBrightness(+e.target.value)} style={s.slider} />
              <span style={s.sliderVal}>{brightness}%</span>
            </div>
            <div style={s.sliderRow}>
              <span style={s.sliderLabel}>对比度</span>
              <input type="range" min="20" max="300" value={contrast} onChange={e => setContrast(+e.target.value)} style={s.slider} />
              <span style={s.sliderVal}>{contrast}%</span>
            </div>
          </div>

          <div style={s.panelSection}>
            <div style={s.panelTitle}>窗位预设</div>
            <div style={s.presetGrid}>
              {windowPresets.map(p => (
                <button key={p.name} style={{ ...s.presetBtn, ...(activePreset === p.name ? s.presetBtnActive : {}) }} onClick={() => applyPreset(p)}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div style={s.panelSection}>
            <div style={s.panelTitle}>患者信息</div>
            <div style={s.infoGrid}>
              <div style={s.infoItem}><span style={s.infoLabel}>姓名</span><span style={s.infoValue}>{mockFiles[activeFile].patient}</span></div>
              <div style={s.infoItem}><span style={s.infoLabel}>检查号</span><span style={s.infoValue}>R20260501001</span></div>
              <div style={s.infoItem}><span style={s.infoLabel}>设备</span><span style={s.infoValue}>CT-Siemens</span></div>
              <div style={s.infoItem}><span style={s.infoLabel}>日期</span><span style={s.infoValue}>{mockFiles[activeFile].date}</span></div>
            </div>
          </div>

          <div style={{ ...s.panelSection, flex: 1 }}>
            <div style={s.panelTitle}>序列列表</div>
            <div style={s.fileList}>
              {mockFiles.map((f, i) => (
                <button key={f.id} style={{ ...s.fileItem, ...(activeFile === i ? s.fileItemActive : {}) }} onClick={() => setActiveFile(i)}>
                  <FileImage size={14} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                  <span style={{ fontSize: 10, color: '#64748b' }}>{f.modality}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
