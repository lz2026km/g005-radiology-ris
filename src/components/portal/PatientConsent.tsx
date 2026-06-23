import React, { useState } from 'react';
import { FileText, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import type { PatientConsent } from '../../types/portal';

export default function PatientConsentCard({
  consent,
  onSign,
  onReject,
}: {
  consent: PatientConsent;
  onSign?: (id: string) => void;
  onReject?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig: Record<string, { text: string; color: string; bg: string }> = {
    signed: { text: '已签署', color: '#10b981', bg: '#d1fae5' },
    pending: { text: '待签署', color: '#f59e0b', bg: '#fef3c7' },
    rejected: { text: '已拒绝', color: '#ef4444', bg: '#fee2e2' },
    expired: { text: '已过期', color: '#94a3b8', bg: '#f1f5f9' },
    revoked: { text: '已撤销', color: '#64748b', bg: '#f1f5f9' },
    draft: { text: '草稿', color: '#3b82f6', bg: '#dbeafe' },
  };

  const sc = statusConfig[consent.status] ?? statusConfig.pending;

  const typeLabel: Record<string, string> = {
    'report-access': '报告查阅授权',
    'image-share': '影像分享授权',
    'research-use': '科研使用授权',
    'telemedicine': '远程会诊授权',
    'data-export': '数据导出授权',
    'marketing': '健康宣教授权',
  };

  return (
    <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
      >
        <div style={{ width: 32, height: 32, borderRadius: 6, background: `${sc.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FileText size={15} color={sc.color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
            {typeLabel[consent.type] ?? consent.type}
            <span style={{ fontSize: 12, padding: '1px 6px', borderRadius: 8, background: sc.bg, color: sc.color, fontWeight: 600 }}>
              {sc.text}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>
            {consent.templateName} v{consent.templateVersion}
            {consent.signedAt && ` · 签署于 ${new Date(consent.signedAt).toLocaleDateString()}`}
          </div>
        </div>
        {expanded ? <ChevronUp size={14} color="#94a3b8" /> : <ChevronDown size={14} color="#94a3b8" />}
      </div>

      {expanded && (
        <div style={{ padding: '0 14px 14px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ padding: '8px 0', fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
            {consent.contentSummary}
          </div>

          {consent.validFrom && consent.validTo && (
            <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
              <Clock size={10} />
              {new Date(consent.validFrom).toLocaleDateString()} - {new Date(consent.validTo).toLocaleDateString()}
            </div>
          )}

          <div style={{ display: 'flex', gap: 6 }}>
            {(consent.status === 'pending') && (
              <>
                <button
                  onClick={() => onSign?.(consent.id)}
                  style={{ padding: '5px 12px', border: 'none', borderRadius: 4, background: '#10b981', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <CheckCircle size={11} /> 签署
                </button>
                <button
                  onClick={() => onReject?.(consent.id)}
                  style={{ padding: '5px 12px', border: '1px solid #e2e8f0', borderRadius: 4, background: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <XCircle size={11} color="#ef4444" /> 拒绝
                </button>
              </>
            )}
            {consent.status === 'signed' && (
              <span style={{ padding: '5px 12px', background: '#f0fdf4', borderRadius: 4, fontSize: 12, color: '#047857' }}>
                已签署 · {consent.signedMethod === 'electronic-signature' ? '电子签名' : consent.signedMethod}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
