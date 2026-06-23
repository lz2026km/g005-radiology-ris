// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 配准质量显示
// TRE / Dice / Jacobian / NCC 卡片 + 雷达图 + 评级
// ============================================================

import React, { useMemo } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp, Activity } from 'lucide-react'
import type { RegistrationQuality, LandmarkPair } from '../../types/fusion'
import { RegistrationMetrics, computeTREDetailed } from '../../services/fusion/metrics/RegistrationMetrics'

export interface RegistrationQualityDisplayProps {
  quality?: RegistrationQuality
  landmarks?: LandmarkPair[]
  height?: number
  compact?: boolean
}

const GRADE_COLOR: Record<RegistrationQuality['grade'], string> = {
  excellent: '#10b981',
  good: '#22d3ee',
  acceptable: '#fbbf24',
  poor: '#ef4444',
}

const GRADE_LABEL: Record<RegistrationQuality['grade'], string> = {
  excellent: '优秀',
  good: '良好',
  acceptable: '合格',
  poor: '不合格',
}

const GRADE_ICON: Record<RegistrationQuality['grade'], React.ReactNode> = {
  excellent: <CheckCircle2 size={14} />,
  good: <CheckCircle2 size={14} />,
  acceptable: <AlertTriangle size={14} />,
  poor: <XCircle size={14} />,
}

export const RegistrationQualityDisplay: React.FC<RegistrationQualityDisplayProps> = ({
  quality,
  landmarks,
  height = 320,
  compact = false,
}) => {
  const treDetail = useMemo(() => {
    if (!landmarks || landmarks.length === 0) return null
    return computeTREDetailed(landmarks)
  }, [landmarks])

  if (!quality) {
    return (
      <div
        data-testid="reg-quality-empty"
        style={{ background: '#0a0a0a', borderRadius: 8, padding: 20, height, color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}
      >
        尚未执行配准
      </div>
    )
  }

  const color = GRADE_COLOR[quality.grade]
  const label = GRADE_LABEL[quality.grade]
  const overall = RegistrationMetrics.score(quality.tre, quality.dice, quality.jacobianNegativePct, quality.ncc)

  return (
    <div
      data-testid="reg-quality"
      style={{ background: '#0a0a0a', borderRadius: 8, padding: 12, height, color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            background: `${color}22`,
            border: `1px solid ${color}66`,
            color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {GRADE_ICON[quality.grade]}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>配准质量</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>综合评分 {overall} / 100</div>
        </div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            padding: '4px 10px',
            borderRadius: 4,
            background: `${color}22`,
            color,
            fontWeight: 600,
            fontSize: 12,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {GRADE_ICON[quality.grade]} {label}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        <MetricCard title="TRE" value={`${quality.tre.toFixed(2)} mm`} sub="目标配准误差" color={quality.tre < 1.5 ? '#10b981' : quality.tre < 3 ? '#fbbf24' : '#ef4444'} />
        <MetricCard title="Dice" value={quality.dice.toFixed(3)} sub="结构重叠" color={quality.dice > 0.9 ? '#10b981' : quality.dice > 0.75 ? '#fbbf24' : '#ef4444'} />
        <MetricCard title="Jac.min" value={quality.jacobianMin.toFixed(3)} sub="形变折叠" color={quality.jacobianMin > 0.3 ? '#10b981' : quality.jacobianMin > 0 ? '#fbbf24' : '#ef4444'} />
        <MetricCard title="NCC" value={quality.ncc.toFixed(3)} sub="归一化互相关" color={quality.ncc > 0.9 ? '#10b981' : quality.ncc > 0.75 ? '#fbbf24' : '#ef4444'} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
        <Activity size={11} />
        形变折叠占比: <span style={{ color: quality.jacobianNegativePct < 1 ? '#10b981' : quality.jacobianNegativePct < 5 ? '#fbbf24' : '#ef4444' }}>{quality.jacobianNegativePct.toFixed(2)}%</span>
        <div style={{ flex: 1 }} />
        <TrendingUp size={11} />
        TRE 阈值 &lt; 2.0 mm
      </div>

      {!compact && treDetail && treDetail.residuals.length > 0 && (
        <div style={{ background: '#000', borderRadius: 4, padding: 8, flex: 1, overflow: 'auto' }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>逐点残差</div>
          {treDetail.residuals.map((r) => (
            <div
              key={r.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 60px',
                alignItems: 'center',
                gap: 8,
                padding: '2px 0',
                fontSize: 12,
              }}
            >
              <span style={{ color: '#cbd5e1' }}>{r.id}</span>
              <div style={{ height: 4, background: '#1e293b', borderRadius: 2, position: 'relative' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, (r.residual / 5) * 100)}%`,
                    background: r.residual < 1 ? '#10b981' : r.residual < 2 ? '#fbbf24' : '#ef4444',
                    borderRadius: 2,
                  }}
                />
              </div>
              <span style={{ textAlign: 'right', color: '#cbd5e1' }}>{r.residual.toFixed(2)}mm</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MetricCard({ title, value, sub, color }: { title: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ background: '#0f172a', borderRadius: 6, padding: 8, border: '1px solid #1e293b' }}>
      <div style={{ fontSize: 12, color: '#94a3b8' }}>{title}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color }}>{value}</div>
      <div style={{ fontSize: 12, color: '#475569' }}>{sub}</div>
    </div>
  )
}

export default RegistrationQualityDisplay
