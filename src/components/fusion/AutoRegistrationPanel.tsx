// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 自动配准 UI
// 选择类型 / 配置参数 / 启动配准 / 显示结果
// ============================================================

import React, { useState, useCallback, useMemo } from 'react'
import { Play, Square, Settings, Activity, CheckCircle2, AlertCircle } from 'lucide-react'
import {
  AutoRegistration,
  DEFAULT_AUTO_CONFIG,
} from '../../services/fusion/registration/AutoRegistration'
import type {
  RegistrationStudy,
  RegistrationResult,
  AutoRegistrationConfig,
  RegistrationType,
} from '../../types/fusion'
import { MOCK_STUDY_PETCT_LUNG, MOCK_STUDY_MR_BRAIN, MOCK_STUDY_MR_PROSTATE } from '../../data/fusionMock'

export interface AutoRegistrationPanelProps {
  study?: RegistrationStudy
  onResult?: (r: RegistrationResult) => void
  height?: number
  className?: string
}

const STUDY_OPTIONS: Array<{ id: string; label: string; study: RegistrationStudy }> = [
  { id: 'petct', label: 'PET/CT 胸部 (STU-PETCT-001)', study: MOCK_STUDY_PETCT_LUNG },
  { id: 'mr-brain', label: '脑 MR 多序列 (STU-MR-BRAIN-001)', study: MOCK_STUDY_MR_BRAIN },
  { id: 'mr-prostate', label: '前列腺 MR (STU-MR-PROSTATE-001)', study: MOCK_STUDY_MR_PROSTATE },
]

export const AutoRegistrationPanel: React.FC<AutoRegistrationPanelProps> = ({
  study: studyProp,
  onResult,
  height = 480,
  className,
}) => {
  const [selectedId, setSelectedId] = useState(STUDY_OPTIONS[0]!.id)
  const study = studyProp ?? STUDY_OPTIONS.find((s) => s.id === selectedId)!.study
  const [config, setConfig] = useState<AutoRegistrationConfig>({ ...DEFAULT_AUTO_CONFIG })
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<RegistrationResult | null>(null)
  const [progress, setProgress] = useState(0)
  const engineRef = React.useRef(new AutoRegistration(config))

  const setType = useCallback((t: RegistrationType) => {
    setConfig((c) => ({ ...c, type: t }))
    engineRef.current.setConfig({ type: t })
  }, [])

  const run = useCallback(async () => {
    setRunning(true)
    setProgress(0)
    const tick = setInterval(() => setProgress((p) => Math.min(95, p + 8 + Math.random() * 12)), 120)
    try {
      const r = await engineRef.current.run(study)
      setProgress(100)
      setResult(r)
      onResult?.(r)
    } finally {
      clearInterval(tick)
      setRunning(false)
    }
  }, [study, onResult])

  const costCurve = useMemo(() => {
    if (!result) return engineRef.current.getCostCurve(study.studyId, config.type)
    return engineRef.current.getCostCurve(study.studyId, config.type)
  }, [result, study.studyId, config.type])

  return (
    <div
      data-testid="auto-registration-panel"
      className={className}
      style={{ background: '#0a0a0a', borderRadius: 8, padding: 12, height, color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Settings size={14} color="#3b82f6" />
        <span style={{ fontSize: 13, fontWeight: 600 }}>自动配准</span>
        <div style={{ flex: 1 }} />
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          style={selectStyle}
          disabled={running}
        >
          {STUDY_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {(['rigid', 'affine', 'deformable'] as RegistrationType[]).map((t) => (
          <button
            key={t}
            data-testid={`reg-type-${t}`}
            onClick={() => setType(t)}
            disabled={running}
            style={chipStyle(config.type === t)}
          >
            {t === 'rigid' ? 'Rigid (6DOF)' : t === 'affine' ? 'Affine (12DOF)' : 'Deformable (B-spline)'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        <ConfigField
          label="多分辨率"
          value={config.multiResolution ? '开' : '关'}
          onChange={(v) => setConfig({ ...config, multiResolution: v === '开' })}
        />
        <ConfigField
          label="优化器"
          value={config.optimizer}
          onChange={(v) => setConfig({ ...config, optimizer: v as AutoRegistrationConfig['optimizer'] })}
          options={['gradient-descent', 'lbfgs', 'evolutionary']}
        />
        <ConfigField
          label="最大迭代"
          value={String(config.maxIterations)}
          onChange={(v) => setConfig({ ...config, maxIterations: Math.max(10, parseInt(v, 10) || 100) })}
        />
        <ConfigField
          label="收敛阈值"
          value={String(config.convergenceThreshold)}
          onChange={(v) => setConfig({ ...config, convergenceThreshold: parseFloat(v) || 1e-4 })}
        />
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 10, minHeight: 0 }}>
        <div style={{ flex: 1, background: '#000', borderRadius: 4, padding: 8, position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 6 }}>代价曲线 (MSE)</div>
          <CostChart data={costCurve} />
        </div>

        <div style={{ flex: 1, background: '#000', borderRadius: 4, padding: 8, overflow: 'auto' }}>
          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 6 }}>变换矩阵 (4x4)</div>
          {result ? (
            <pre style={{ fontSize: 10, color: '#10b981', margin: 0, fontFamily: 'ui-monospace, monospace' }}>
              {result.matrix.map((row) => row.map((v) => v.toFixed(3)).join('  ')).join('\n')}
            </pre>
          ) : (
            <div style={{ color: '#475569', fontSize: 11, marginTop: 20, textAlign: 'center' }}>尚未运行</div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          data-testid="auto-reg-run"
          onClick={run}
          disabled={running}
          style={{
            ...primaryBtnStyle,
            background: running ? '#475569' : '#059669',
            cursor: running ? 'not-allowed' : 'pointer',
          }}
        >
          {running ? <Square size={12} /> : <Play size={12} />}
          {running ? '配准中...' : '运行配准'}
        </button>
        <div style={{ flex: 1, height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: running ? 'linear-gradient(90deg, #3b82f6, #06b6d4)' : '#059669',
              transition: 'width 0.2s',
            }}
          />
        </div>
        {result && (
          <div style={{ display: 'flex', gap: 12, fontSize: 10 }}>
            <Stat color="#10b981" icon={<CheckCircle2 size={11} />}>
              误差 {result.error.toFixed(2)}px
            </Stat>
            <Stat color="#fbbf24" icon={<Activity size={11} />}>
              TRE {result.metrics?.tre.toFixed(2) ?? '-'} mm
            </Stat>
            <Stat color="#3b82f6" icon={<Activity size={11} />}>
              Dice {result.metrics?.dice.toFixed(3) ?? '-'}
            </Stat>
            <Stat color="#94a3b8" icon={<AlertCircle size={11} />}>
              {result.metrics?.grade ?? '-'}
            </Stat>
          </div>
        )}
      </div>
    </div>
  )
}

function CostChart({ data }: { data: number[] }) {
  if (data.length === 0) {
    return <div style={{ color: '#475569', fontSize: 10, textAlign: 'center', padding: 30 }}>无数据</div>
  }
  const w = 320
  const h = 120
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const path = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / range) * h
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <rect x="0" y="0" width={w} height={h} fill="#0f172a" />
      <path d={path} stroke="#22d3ee" strokeWidth="1.5" fill="none" />
      <text x="6" y="14" fontSize="9" fill="#94a3b8">max {max.toFixed(1)}</text>
      <text x="6" y={h - 6} fontSize="9" fill="#94a3b8">min {min.toFixed(2)}</text>
    </svg>
  )
}

function ConfigField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options?: string[] }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 9, color: '#64748b' }}>{label}</span>
      {options ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
      )}
    </label>
  )
}

function Stat({ children, color, icon }: { children: React.ReactNode; color: string; icon: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color }}>
      {icon}
      {children}
    </span>
  )
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
  padding: '4px 6px',
  fontSize: 11,
}
const chipStyle = (active: boolean): React.CSSProperties => ({
  background: active ? '#1e40af' : 'transparent',
  border: '1px solid',
  borderColor: active ? '#3b82f6' : '#334155',
  color: active ? '#fff' : '#94a3b8',
  borderRadius: 4,
  padding: '4px 10px',
  fontSize: 10,
  cursor: 'pointer',
})
const primaryBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  border: 'none',
  borderRadius: 4,
  padding: '6px 14px',
  color: '#fff',
  fontSize: 11,
  fontWeight: 600,
}

export default AutoRegistrationPanel
