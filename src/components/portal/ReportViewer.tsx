import React, { useState } from 'react';
import { FileText, Eye, Download, ChevronDown, ChevronUp } from 'lucide-react';

interface ReportItem {
  id: string;
  reportId: string;
  modality: string;
  bodyPart: string;
  examDate: string;
  status: string;
  diagnosisSummary: string;
  findingsSummary: string;
  recommendations: string[];
  signedBy?: string;
  signedAt?: string;
}

export default function ReportViewer({
  report,
  onDownload,
  compact,
}: {
  report: ReportItem;
  onDownload?: (id: string) => void;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const statusColor: Record<string, string> = {
    final: '#10b981',
    amended: '#f59e0b',
    critical: '#ef4444',
    pending: '#94a3b8',
  };

  return (
    <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
      >
        <div style={{ width: 32, height: 32, borderRadius: 6, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FileText size={16} color="#0ea5e9" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
            {report.modality} {report.bodyPart}
            <span style={{
              fontSize: 9, padding: '1px 6px', borderRadius: 8,
              background: `${statusColor[report.status] ?? '#94a3b8'}15`,
              color: statusColor[report.status] ?? '#94a3b8',
              fontWeight: 600,
            }}>
              {report.status === 'final' ? '已发布' : report.status === 'amended' ? '已修订' : report.status === 'critical' ? '危急' : '待处理'}
            </span>
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>
            {report.examDate} · {report.signedBy && `签署:${report.signedBy}`}
          </div>
        </div>
        {expanded ? <ChevronUp size={14} color="#94a3b8" /> : <ChevronDown size={14} color="#94a3b8" />}
      </div>

      {expanded && (
        <div style={{ padding: '0 14px 14px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ padding: '8px 0', fontSize: 11, color: '#475569', lineHeight: 1.6 }}>
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>检查所见：</span>{report.findingsSummary}
            </div>
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>诊断意见：</span>{report.diagnosisSummary}
            </div>
            {report.recommendations.length > 0 && (
              <div>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>建议：</span>
                {report.recommendations.join('；')}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 6, paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
            <button
              onClick={() => onDownload?.(report.reportId)}
              style={{ padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 10, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Download size={12} /> PDF
            </button>
            <span style={{ padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 10, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Eye size={12} /> 已查看
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
