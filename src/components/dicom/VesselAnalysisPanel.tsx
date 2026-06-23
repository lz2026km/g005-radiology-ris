import React, { useState } from 'react'
import type { VesselAnalysisResult } from '../../types/imaging/postprocess'

export interface VesselAnalysisPanelProps {
  result: VesselAnalysisResult | null
  height?: number
  onStentPlanRequest?: (vesselId: string) => void
}

export default function VesselAnalysisPanel({
  result,
  height = 360,
  onStentPlanRequest,
}: VesselAnalysisPanelProps) {
  const [selectedStenosisIdx, setSelectedStenosisIdx] = useState(0)

  if (!result) {
    return (
      <div style={{ background: '#0a0a0a', borderRadius: 8, padding: 12, height, color: '#64748b', fontSize: 12 }}>
        请先在 CPR 视口里生成中心线并执行 VesselAnalyzer.analyze() 来加载血管分析结果…
      </div>
    )
  }

  const sel = result.stenoses[selectedStenosisIdx] ?? result.stenoses[0]

  return (
    <div style={{ background: '#0a0a0a', borderRadius: 8, padding: 10, height, color: '#cbd5e1', fontSize: 12, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontWeight: 700, color: '#fbbf24' }}>血管分析 · {result.vesselName}</span>
        <span style={{ color: '#64748b' }}>ID {result.vesselId}</span>
        <div style={{ flex: 1 }} />
        {result.stentPlan && (
          <button
            onClick={() => onStentPlanRequest?.(result.vesselId)}
            style={{ background: '#059669', border: 'none', color: '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}
          >
            + 规划支架
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 8 }}>
        <MetricCard label="平均管腔面积" value={`${result.averageLumenAreaMm2.toFixed(2)} mm²`} color="#3b82f6" />
        <MetricCard label="最小管腔面积" value={`${result.minimumLumenAreaMm2.toFixed(2)} mm²`} color="#f97316" />
        <MetricCard label="平均壁厚" value={`${result.meanWallThicknessMm.toFixed(2)} mm`} color="#22c55e" />
        <MetricCard label="血管长度" value={`${result.lengthMm.toFixed(1)} mm`} color="#a855f7" />
        <MetricCard label="斑块负荷" value={`${result.plaqueBurdenPercent.toFixed(1)}%`} color="#ef4444" />
        <MetricCard label="中心线点数" value={`${result.centerline.points.length}`} color="#fbbf24" />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ fontWeight: 600, color: '#fbbf24', marginBottom: 4 }}>狭窄列表 ({result.stenoses.length})</div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {result.stenoses.length === 0 && (
            <div style={{ color: '#64748b', fontSize: 12, padding: 6 }}>未检测到显著狭窄</div>
          )}
          {result.stenoses.map((s, i) => (
            <button
              key={i}
              onClick={() => setSelectedStenosisIdx(i)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: i === selectedStenosisIdx ? '#1e3a5f' : 'transparent',
                border: '1px solid #333', borderRadius: 4,
                padding: '4px 6px', marginBottom: 4,
                color: '#cbd5e1', fontSize: 12, cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{s.segmentName}</span>
                <span style={{ color: gradeColor(s.grade), fontWeight: 700 }}>{s.stenosisPercent.toFixed(1)}%</span>
              </div>
              <div style={{ color: '#64748b', fontSize: 12 }}>
                参考 {s.referenceDiameterMm.toFixed(2)}mm → 最小 {s.minimalDiameterMm.toFixed(2)}mm @ {s.positionMm.toFixed(1)}mm
              </div>
            </button>
          ))}
        </div>
      </div>

      {result.stentPlan && sel && (
        <div style={{ marginTop: 8, padding: 6, background: '#0f1f2f', borderRadius: 4, fontSize: 12, color: '#94a3b8' }}>
          <div style={{ fontWeight: 600, color: '#22c55e', marginBottom: 2 }}>建议支架 (基于所选狭窄)</div>
          <div>推荐直径 <span style={{ color: '#fbbf24' }}>{result.stentPlan.recommendedDiameterMm.toFixed(2)}mm</span> ·
            长度 <span style={{ color: '#fbbf24' }}>{result.stentPlan.recommendedLengthMm.toFixed(0)}mm</span> ·
            重叠 <span style={{ color: '#fbbf24' }}>{result.stentPlan.overlapMarginMm}mm</span></div>
          <div>预扩张管腔增益 {result.stentPlan.postDeploymentDiameterGainMm.toFixed(2)}mm</div>
        </div>
      )}
    </div>
  )
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 4, padding: '6px 8px' }}>
      <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color, fontFamily: 'monospace' }}>{value}</div>
    </div>
  )
}

function gradeColor(grade: string): string {
  switch (grade) {
    case 'mild': return '#22c55e'
    case 'moderate': return '#fbbf24'
    case 'severe': return '#f97316'
    case 'occluded': return '#ef4444'
    default: return '#94a3b8'
  }
}