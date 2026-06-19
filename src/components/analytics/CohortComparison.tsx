import React from 'react';
import type { CohortComparisonRow } from '../../types/analytics';

export interface CohortComparisonProps {
  rows: CohortComparisonRow[];
  title?: string;
}

export default function CohortComparison({ rows, title }: CohortComparisonProps) {
  const metrics = rows.length ? Object.keys(rows[0]!.metrics) : [];

  return (
    <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', padding: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 10 }}>{title ?? '队列对比'}</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              <th style={thStyle}>队列</th>
              <th style={thStyle}>样本量</th>
              {metrics.map(m => <th key={m} style={thStyle}>{m}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.cohortId}>
                <td style={tdStyle}><span style={{ fontWeight: 600 }}>{r.cohortName}</span></td>
                <td style={tdStyle}>{r.size}</td>
                {metrics.map(m => (
                  <td key={m} style={tdStyle}>{r.metrics[m]?.toFixed(1) ?? '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '6px 10px', textAlign: 'left', borderBottom: '2px solid #e2e8f0',
  color: '#64748b', fontWeight: 600, fontSize: 10, whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '6px 10px', borderBottom: '1px solid #f1f5f9', color: '#1e293b',
};
