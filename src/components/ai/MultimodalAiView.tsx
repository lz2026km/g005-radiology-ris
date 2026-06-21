// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 多模态 AI 视图
// 文本输入 + 图像 + 推理结果 (文字 + 注意力图)
// ============================================================

import React, { useState, useCallback } from 'react'
import { Sparkles, Eye, Brain, Send } from 'lucide-react';import { MultimodalInference } from '../../services/ai/multimodal/MultimodalInference'
import type { MultimodalResult, MultimodalInput, RegistrationStudy } from '../../types/fusion';
import { MOCK_STUDY_PETCT_LUNG, MOCK_STUDY_MR_BRAIN, MOCK_STUDY_BREAST_MRUS } from '../../data/fusionMock'
export interface MultimodalAiViewProps {
  study?: RegistrationStudy
  onResult?: (r: MultimodalResult) => void
  height?: number
}

const STUDIES: Array<{ id: string; label: string; study: RegistrationStudy }> = [
  { id: 'lung', label: '胸部 PET/CT', study: MOCK_STUDY_PETCT_LUNG },
  { id: 'brain', label: '头颅 MR', study: MOCK_STUDY_MR_BRAIN },
  { id: 'breast', label: '乳腺 MR', study: MOCK_STUDY_BREAST_MRUS },
]

const SUGGESTED_PROMPTS = [
  '请描述该影像的异常发现',
  '是否存在恶性征象?给出 PI-RADS / BI-RADS 评分',
  '建议哪些进一步检查?',
  '鉴别诊断有哪些?',
]

export const MultimodalAiView: React.FC<MultimodalAiViewProps> = ({
  study: studyProp,
  onResult,
  height = 520,
}) => {
  const [studyId, setStudyId] = useState(STUDIES[0]!.id)
  const study = studyProp ?? STUDIES.find((s) => s.id === studyId)!.study
  const [text, setText] = useState(SUGGESTED_PROMPTS[0]!)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<MultimodalResult | null>(null)
  const engineRef = React.useRef(new MultimodalInference())

  const run = useCallback(async () => {
    setRunning(true)
    try {
      const input: MultimodalInput = { study, text }
      const r = await engineRef.current.infer(input)
      setResult(r)
      onResult?.(r)
    } finally {
      setRunning(false)
    }
  }, [study, text, onResult])

  const handlePrompt = useCallback((p: string) => {
    setText(p)
  }, [])

  return (
    <div
      data-testid="multimodal-ai-view"
      style={{ background: '#0a0a0a', borderRadius: 8, padding: 12, color: '#cbd5e1', height, display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Brain size={14} color="#a78bfa" />
        <span style={{ fontSize: 13, fontWeight: 600 }}>多模态 AI 推理 (视觉+文本)</span>
        <div style={{ flex: 1 }} />
        <select
          value={studyId}
          onChange={(e) => setStudyId(e.target.value)}
          style={selectStyle}
          disabled={running}
        >
          {STUDIES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, flex: 1, minHeight: 0 }}>
        <div style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 10, color: '#94a3b8' }}>输入图像 (Mock)</div>
          <div style={{ flex: 1, background: '#000', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
            <ImageMock />
            {result && (
              <AttentionOverlay weights={result.attention.weights} width={result.attention.width} height={result.attention.height} />
            )}
            {result && (
              <div style={{ position: 'absolute', bottom: 4, left: 4, right: 4, display: 'flex', gap: 4, fontSize: 9 }}>
                {result.attention.hotspots.map((h, i) => (
                  <div key={i} style={{ background: 'rgba(239,68,68,0.85)', color: '#fff', padding: '1px 4px', borderRadius: 2 }}>
                    #{i + 1} ({h.x},{h.y}) {h.score.toFixed(2)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => handlePrompt(p)}
                disabled={running}
                style={chipStyle(text === p)}
              >
                {p}
              </button>
            ))}
          </div>

          <textarea
            data-testid="mm-text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="输入您的查询..."
            style={{
              ...inputStyle,
              minHeight: 60,
              maxHeight: 80,
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />

          <button
            data-testid="mm-run"
            onClick={run}
            disabled={running}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: running ? '#475569' : 'linear-gradient(135deg, #7c3aed, #3b82f6)',
              border: 'none',
              borderRadius: 4,
              padding: '8px 14px',
              color: '#fff',
              fontSize: 11,
              fontWeight: 600,
              cursor: running ? 'not-allowed' : 'pointer',
            }}
          >
            {running ? <Sparkles size={12} /> : <Send size={12} />}
            {running ? '推理中...' : '运行推理'}
          </button>

          <div style={{ flex: 1, background: '#0f172a', borderRadius: 4, padding: 10, overflow: 'auto' }}>
            {result ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, fontSize: 10, color: '#94a3b8' }}>
                  <span>置信度 <span style={{ color: '#10b981' }}>{(result.confidence * 100).toFixed(0)}%</span></span>
                  <span>耗时 {result.inferenceTimeMs} ms</span>
                  <span>token {result.tokens.input}/{result.tokens.output}</span>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.6, color: '#e2e8f0' }}>{result.text}</div>
                {result.findings.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, color: '#a78bfa', marginBottom: 4 }}>关键发现</div>
                    {result.findings.map((f, i) => (
                      <div key={i} style={{ display: 'flex', gap: 6, fontSize: 11, padding: '4px 6px', background: '#1e293b', borderRadius: 3, marginBottom: 3 }}>
                        <Eye size={11} color="#a78bfa" />
                        <span style={{ flex: 1 }}>{f.text}</span>
                        <span style={{ color: '#10b981' }}>{(f.score * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#475569', fontSize: 11, textAlign: 'center', padding: 30 }}>
                点击"运行推理"以生成结果
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ImageMock() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 256 256" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      <defs>
        <radialGradient id="lungGrad" cx="50%" cy="55%" r="60%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="256" height="256" fill="url(#lungGrad)" />
      <ellipse cx="100" cy="130" rx="42" ry="65" fill="#0f172a" stroke="#1e293b" />
      <ellipse cx="156" cy="130" rx="42" ry="65" fill="#0f172a" stroke="#1e293b" />
      <circle cx="128" cy="100" r="6" fill="#475569" />
      <circle cx="146" cy="115" r="3" fill="#ef4444" opacity="0.6" />
      <circle cx="142" cy="120" r="2" fill="#fbbf24" />
      <path d="M 60 90 Q 80 70 100 90" stroke="#334155" strokeWidth="0.5" fill="none" />
      <path d="M 156 90 Q 176 70 196 90" stroke="#334155" strokeWidth="0.5" fill="none" />
    </svg>
  )
}

function AttentionOverlay({ weights, width, height }: { weights: Float32Array; width: number; height: number }) {
  // 简化: 在原图上叠加半透明热图
  let max = 0
  for (let i = 0; i < weights.length; i++) {
    if (weights[i]! > max) max = weights[i]!
  }
  if (max === 0) return null
  const cellsX = 16
  const cellsY = 16
  const cellW = width / cellsX
  const cellH = height / cellsY
  const cells: React.ReactNode[] = []
  for (let cy = 0; cy < cellsY; cy++) {
    for (let cx = 0; cx < cellsX; cx++) {
      let sum = 0
      for (let dy = 0; dy < height / cellsY; dy += 4) {
        for (let dx = 0; dx < width / cellsX; dx += 4) {
          const px = Math.floor(cx * cellW + dx)
          const py = Math.floor(cy * cellH + dy)
          sum += weights[py * width + px] ?? 0
        }
      }
      const intensity = sum / max
      if (intensity > 0.05) {
        cells.push(
          <rect
            key={`${cx}-${cy}`}
            x={cx * cellW}
            y={cy * cellH}
            width={cellW}
            height={cellH}
            fill={`rgba(239,68,68,${intensity * 0.5})`}
          />,
        )
      }
    }
  }
  return <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0 }}>{cells}</svg>
}

const selectStyle: React.CSSProperties = {
  background: '#1e293b',
  color: '#cbd5e1',
  border: '1px solid #334155',
  borderRadius: 4,
  padding: '4px 8px',
  fontSize: 11,
}
const inputStyle: React.CSSProperties = {
  background: '#1e293b',
  color: '#e2e8f0',
  border: '1px solid #334155',
  borderRadius: 4,
  padding: '6px 8px',
  fontSize: 12,
  width: '100%',
  boxSizing: 'border-box',
}
const chipStyle = (active: boolean): React.CSSProperties => ({
  background: active ? '#5b21b6' : '#1e293b',
  border: '1px solid',
  borderColor: active ? '#a78bfa' : '#334155',
  color: active ? '#fff' : '#94a3b8',
  borderRadius: 12,
  padding: '3px 10px',
  fontSize: 10,
  cursor: 'pointer',
})

export default MultimodalAiView
