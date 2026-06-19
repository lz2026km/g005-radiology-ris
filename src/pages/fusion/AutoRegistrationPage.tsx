// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 自动配准页面
// 整合: AutoRegistrationPanel + RegistrationQualityDisplay + DeformableFieldView
// ============================================================

import React, { useState, useCallback } from 'react'
import { ArrowLeft, Activity, Cpu, BarChart3 } from 'lucide-react'
import { AutoRegistrationPanel } from '../../components/fusion/AutoRegistrationPanel'
import { RegistrationQualityDisplay } from '../../components/fusion/RegistrationQualityDisplay'
import { DeformableFieldView } from '../../components/fusion/DeformableFieldView'
import { MOCK_LANDMARKS_PETCT } from '../../data/fusionMock'
import type { RegistrationResult } from '../../types/fusion'

export interface AutoRegistrationPageProps {
  onBack?: () => void
}

export const AutoRegistrationPage: React.FC<AutoRegistrationPageProps> = ({ onBack }) => {
  const [result, setResult] = useState<RegistrationResult | null>(null)

  const handleResult = useCallback((r: RegistrationResult) => {
    setResult(r)
  }, [])

  return (
    <div
      data-testid="auto-registration-page"
      style={{ minHeight: '100vh', background: '#020617', color: '#cbd5e1', padding: 16 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', borderRadius: 4, padding: '4px 10px', fontSize: 11, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <ArrowLeft size={12} /> 返回
          </button>
        )}
        <Cpu size={16} color="#3b82f6" />
        <h1 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>多模态自动配准</h1>
        <span style={{ fontSize: 10, color: '#64748b' }}>Rigid · Affine · Deformable (B-spline)</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AutoRegistrationPanel onResult={handleResult} height={500} />
          {result?.deformableField && (
            <div style={{ background: '#0a0a0a', borderRadius: 8, padding: 10, border: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Activity size={12} color="#22d3ee" />
                <span style={{ fontSize: 11, fontWeight: 600 }}>形变场 (仅 deformable)</span>
              </div>
              <DeformableFieldView field={result.deformableField} height={300} showLegend />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#0a0a0a', borderRadius: 8, padding: 10, border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <BarChart3 size={12} color="#10b981" />
              <span style={{ fontSize: 11, fontWeight: 600 }}>配准质量</span>
            </div>
            <RegistrationQualityDisplay quality={result?.metrics} landmarks={MOCK_LANDMARKS_PETCT} height={420} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AutoRegistrationPage
