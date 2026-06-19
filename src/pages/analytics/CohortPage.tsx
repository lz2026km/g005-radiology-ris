import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import CohortComparison from '../../components/analytics/CohortComparison';
import Heatmap from '../../components/analytics/Heatmap';
import { cohortAnalyzer } from '../../services/analytics/cohort/CohortAnalyzer';
import { heatmapBuilder } from '../../services/analytics/HeatmapBuilder';
import type { CohortComparisonRow, CohortRetention } from '../../types/analytics';

export default function CohortPage() {
  const [selectedCohorts, setSelectedCohorts] = useState<string[]>(['cohort-ct', 'cohort-mr', 'cohort-male', 'cohort-female']);
  const [comparison, setComparison] = useState<CohortComparisonRow[]>([]);
  const [retention, setRetention] = useState<CohortRetention[]>([]);
  const allCohorts = cohortAnalyzer.getAllCohorts();

  useEffect(() => {
    const now = new Date();
    const range = {
      start: new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString().substring(0, 10),
      end: now.toISOString().substring(0, 10),
    };
    setComparison(cohortAnalyzer.compare(selectedCohorts, range));
    if (selectedCohorts.length) {
      setRetention(cohortAnalyzer.retention(selectedCohorts[0]!, 6));
    }
  }, [selectedCohorts]);

  const toggleCohort = (id: string) => {
    setSelectedCohorts(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ padding: 20, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Users size={18} color="#7c3aed" />
        <h1 style={{ fontSize: 20, color: '#1e293b', margin: 0 }}>队列分析</h1>
      </div>

      <div style={{ marginBottom: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {allCohorts.map(c => (
          <button
            key={c.id}
            onClick={() => toggleCohort(c.id)}
            style={{
              padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: 4,
              background: selectedCohorts.includes(c.id) ? '#7c3aed' : '#fff',
              color: selectedCohorts.includes(c.id) ? '#fff' : '#475569',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}
          >{c.name} <span style={{ opacity: 0.7 }}>({c.size})</span></button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <CohortComparison rows={comparison} title="队列指标对比" />
        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', padding: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 10 }}>留存分析</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
            {retention.map(r => (
              <div key={r.period} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#7c3aed' }}>{(r.retention * 100).toFixed(0)}%</div>
                <div style={{ width: '100%', height: `${r.retention * 120}px`, background: '#7c3aed', borderRadius: '4px 4px 0 0', opacity: 0.5 + r.retention * 0.5 }} />
                <div style={{ fontSize: 9, color: '#94a3b8' }}>{r.period}月</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
