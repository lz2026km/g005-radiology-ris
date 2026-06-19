import React, { useState } from 'react';
import { Link2, Plus, X, QrCode, Clock, Eye, Download, Shield, AlertTriangle } from 'lucide-react';
import { SHARE_LINKS_MOCK } from '../../data/portalMock';
import QrShareButton from '../../components/portal/QrShareButton';
import ShareDialog from '../../components/portal/ShareDialog';
import type { ShareLink } from '../../types/portal';

export default function ShareLinksPage() {
  const [filter, setFilter] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedLink, setSelectedLink] = useState<ShareLink | null>(null);

  const filtered = filter === 'all'
    ? SHARE_LINKS_MOCK
    : SHARE_LINKS_MOCK.filter(l => l.status === filter);

  const statusConfig: Record<string, { text: string; color: string; bg: string }> = {
    active: { text: '生效中', color: '#10b981', bg: '#d1fae5' },
    expired: { text: '已过期', color: '#94a3b8', bg: '#f1f5f9' },
    revoked: { text: '已撤销', color: '#ef4444', bg: '#fee2e2' },
    exhausted: { text: '已用完', color: '#f59e0b', bg: '#fef3c7' },
    pending: { text: '待生效', color: '#3b82f6', bg: '#dbeafe' },
  };

  return (
    <div style={{ padding: 20, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link2 size={20} color="#7c3aed" /> 分享链接管理
            <span style={{ fontSize: 10, padding: '2px 6px', background: '#7c3aed', color: '#fff', borderRadius: 3, fontWeight: 700 }}>SHARE</span>
          </h1>
          <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>
            加密短链接 · 二维码 · 访问控制 · 审计追溯
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ padding: '6px 14px', border: 'none', borderRadius: 6, background: '#7c3aed', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={14} /> 新建分享
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
        <KpiCard icon={Link2} label="总链接" value={SHARE_LINKS_MOCK.length} color="#7c3aed" />
        <KpiCard icon={Eye} label="总查看" value={SHARE_LINKS_MOCK.reduce((s, l) => s + l.currentOpens, 0)} color="#0ea5e9" />
        <KpiCard icon={Download} label="总下载" value={SHARE_LINKS_MOCK.reduce((s, l) => s + l.currentDownloads, 0)} color="#10b981" />
        <KpiCard icon={Shield} label="加密链接" value={SHARE_LINKS_MOCK.filter(l => l.encryption !== 'AES-256-GCM').length} color="#f59e0b" />
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {[
          { key: 'all', label: '全部' },
          { key: 'active', label: '生效中' },
          { key: 'expired', label: '已过期' },
          { key: 'revoked', label: '已撤销' },
          { key: 'exhausted', label: '已用完' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '4px 12px', border: '1px solid #e2e8f0', borderRadius: 14,
              background: filter === f.key ? '#7c3aed' : '#fff',
              color: filter === f.key ? '#fff' : '#64748b',
              fontSize: 11, cursor: 'pointer', fontWeight: filter === f.key ? 600 : 400,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(link => {
          const sc = statusConfig[link.status] ?? statusConfig.pending;
          return (
            <div
              key={link.id}
              onClick={() => setSelectedLink(selectedLink?.id === link.id ? null : link)}
              style={{
                background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0',
                cursor: 'pointer', overflow: 'hidden',
              }}
            >
              <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 6, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Link2 size={16} color="#7c3aed" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {link.resourceSummary}
                    <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 8, background: sc.bg, color: sc.color, fontWeight: 600 }}>
                      {sc.text}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1, fontFamily: 'monospace' }}>
                    {link.shortUrl}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: '#94a3b8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={11} /> {link.currentOpens}/{link.maxOpens}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Download size={11} /> {link.currentDownloads}/{link.maxDownloads}</span>
                  <QrShareButton shortUrl={link.shortUrl} />
                </div>
              </div>

              {selectedLink?.id === link.id && (
                <div style={{ padding: '12px 14px', borderTop: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 10, color: '#64748b' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>患者</div>
                    {link.patientName}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>医生</div>
                    {link.doctorName}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>创建时间</div>
                    {new Date(link.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>过期时间</div>
                    {new Date(link.expiresAt).toLocaleString()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>加密方式</div>
                    {link.encryption}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>安全验证</div>
                    {[link.requirePhone && '手机', link.requireIdCard && '身份证', link.passwordProtected && '密码'].filter(Boolean).join('、') || '无'}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ShareDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        patientId="p-100"
        patientName="患者100"
        doctorId="dr-001"
        doctorName="张医师"
        resourceIds={['rpt-038']}
        resourceSummary="CT胸部 报告"
      />
    </div>
  );
}

const KpiCard: React.FC<{ icon: any; label: string; value: number; color: string }> = ({ icon: Icon, label, value, color }) => (
  <div style={{ background: '#fff', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={18} />
    </div>
    <div>
      <div style={{ fontSize: 10, color: '#64748b' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{value}</div>
    </div>
  </div>
);
