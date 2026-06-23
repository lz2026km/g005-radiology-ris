// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 既往对比页面
// 整合: PriorCompareViewer + PetCtSuvViewer + MultimodalAiView
// ============================================================

import React, { useState } from 'react'
import { ArrowLeft, GitCompare, Scan, Brain } from 'lucide-react'
import { PriorCompareViewer, type PriorStudyDescriptor } from '../../components/dicom/PriorCompareViewer'
import { PetCtSuvViewer } from '../../components/fusion/PetCtSuvViewer'
import { MultimodalAiView } from '../../components/ai/MultimodalAiView'

export interface PriorComparisonPageProps {
  onBack?: () => void
}

const PRIOR: PriorStudyDescriptor = {
  studyId: 'STU-2024-00321',
  studyDate: '2024-08-15',
  modality: 'CT',
  bodyPart: '胸部',
  sliceCount: 96,
  description: '胸部平扫,肺结节评估',
}

const CURRENT: PriorStudyDescriptor = {
  studyId: 'STU-2026-00193',
  studyDate: '2026-05-02',
  modality: 'CT',
  bodyPart: '胸部',
  sliceCount: 112,
  description: '胸部平扫,肺结节随访',
}

export const PriorComparisonPage: React.FC<PriorComparisonPageProps> = ({ onBack }) => {
  const [tab, setTab] = useState<'compare' | 'suv' | 'ai'>('compare')

  return (
    <div
      data-testid="prior-comparison-page"
      style={{ minHeight: '100vh', background: '#020617', color: '#cbd5e1', padding: 16 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <ArrowLeft size={12} /> 返回
          </button>
        )}
        <GitCompare size={16} color="#3b82f6" />
        <h1 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>既往 / 当前 影像对比</h1>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'inline-flex', gap: 6 }}>
          {([
            { id: 'compare', label: '影像对比', icon: <GitCompare size={12} /> },
            { id: 'suv', label: 'PET/CT SUV', icon: <Scan size={12} /> },
            { id: 'ai', label: '多模态 AI', icon: <Brain size={12} /> },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: tab === t.id ? '#1e40af' : 'transparent',
                border: '1px solid',
                borderColor: tab === t.id ? '#3b82f6' : '#334155',
                color: tab === t.id ? '#fff' : '#94a3b8',
                borderRadius: 4,
                padding: '4px 10px',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'compare' && <PriorCompareViewer prior={PRIOR} current={CURRENT} height={620} />}
      {tab === 'suv' && <PetCtSuvViewer studyId="STU-PETCT-001" modality="PET/CT" width={512} height={512} />}
      {tab === 'ai' && <MultimodalAiView height={620} />}
    </div>
  )
}

export default PriorComparisonPage
