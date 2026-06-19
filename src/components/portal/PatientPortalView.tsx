import React from 'react';
import { Smartphone, FileText, Eye, Download, Share2, Clock } from 'lucide-react';
import type { PatientPortalAccess } from '../../types/portal';

export default function PatientPortalView({ access }: { access: PatientPortalAccess }) {
  const statusLabel: Record<string, { text: string; color: string; bg: string }> = {
    active: { text: '已激活', color: '#10b981', bg: '#d1fae5' },
    expired: { text: '已过期', color: '#94a3b8', bg: '#f1f5f9' },
    revoked: { text: '已撤销', color: '#ef4444', bg: '#fee2e2' },
    consumed: { text: '已用完', color: '#f59e0b', bg: '#fef3c7' },
    pending: { text: '待激活', color: '#3b82f6', bg: '#dbeafe' },
  };

  const st = statusLabel[access.status] ?? statusLabel.pending;

  return (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: 16, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700,
        }}>
          {access.patientName[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
            {access.patientName}
            <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, fontWeight: 600, background: st.bg, color: st.color }}>
              {st.text}
            </span>
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
            {access.identityMethod === 'phone-otp' ? '手机OTP' : access.identityMethod === 'id-card' ? '身份证' : access.identityMethod === 'wechat-oauth' ? '微信' : '健康卡'}
            {access.identityVerified ? ' · 已实名' : ' · 未实名'}
          </div>
        </div>
      </div>

      <div style={{ padding: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
          <StatBox icon={FileText} label="报告数" value={access.reportIds.length} color="#0ea5e9" />
          <StatBox icon={Smartphone} label="设备" value={`${access.boundDevices}/${access.maxDevices}`} color="#7c3aed" />
          <StatBox icon={Clock} label="过期" value={access.expiresAt ? new Date(access.expiresAt).toLocaleDateString() : '-'} color="#f59e0b" />
        </div>

        <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4, fontWeight: 600 }}>
          访问令牌
        </div>
        <div style={{
          padding: '6px 10px', background: '#f8fafc', borderRadius: 4,
          fontFamily: 'monospace', fontSize: 10, color: '#475569', wordBreak: 'break-all',
        }}>
          {access.accessToken}
        </div>
      </div>
    </div>
  );
}

const StatBox: React.FC<{ icon: any; label: string; value: number | string; color: string }> = ({ icon: Icon, label, value, color }) => (
  <div style={{ padding: 8, background: '#f8fafc', borderRadius: 6, textAlign: 'center' }}>
    <Icon size={14} color={color} style={{ marginBottom: 2 }} />
    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{value}</div>
    <div style={{ fontSize: 9, color: '#94a3b8' }}>{label}</div>
  </div>
);
