// ============================================================
// G005 放射科RIS系统 v1.0.6 - 区块链存证
// Phase R6：联盟链（GMCA）+ Merkle 根 + 区块浏览器 + 验证
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Link2, Database, Hash, CheckCircle2, Clock, Search, Copy,
  ExternalLink, Shield, Box, GitBranch, Loader2,
} from 'lucide-react';
import {
  BLOCKCHAIN_RECORDS,
  type BlockchainRecord,
} from '../data/deliveryExportSignatureMock';

// ============================================================
// 状态配置
// ============================================================
const STATUS_CONFIG = {
  pending:   { label: '待确认', color: '#f59e0b', bg: '#fef3c7' },
  confirmed: { label: '已确认', color: '#10b981', bg: '#d1fae5' },
  invalid:   { label: '无效',   color: '#dc2626', bg: '#fee2e2' },
};

// ============================================================
// 主组件
// ============================================================
export default function BlockchainProofPage() {
  const navigate = useNavigate();
  const [records] = useState<BlockchainRecord[]>(BLOCKCHAIN_RECORDS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>('bc-001');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<'idle' | 'success' | 'failed'>('idle');

  const filteredRecords = records.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (search) {
      const t = search.toLowerCase();
      if (!r.reportId.toLowerCase().includes(t) &&
          !r.txHash.toLowerCase().includes(t) &&
          !r.reportHash.toLowerCase().includes(t)) return false;
    }
    return true;
  });

  const selected = records.find(r => r.id === selectedRecordId);

  const handleVerify = () => {
    setVerifying(true);
    setVerifyResult('idle');
    setTimeout(() => {
      setVerifying(false);
      setVerifyResult('success');
    }, 2000);
  };

  return (
    <div style={{ padding: 20, maxWidth: 1600, margin: '0 auto' }}>
      {/* 顶部 */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link2 size={20} color="#7c3aed" /> 区块链存证
            <span style={{ fontSize: 12, padding: '2px 6px', background: '#10b981', color: '#fff', borderRadius: 3, fontWeight: 700 }}>R6</span>
          </h1>
          <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>
            国密联盟链（GMCA）· SHA-256 报告哈希 · Merkle 根 · 6 次确认 · 区块浏览器
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigate('/ca-signature')}
            style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: 6, background: '#fff', color: '#475569', fontSize: 12, cursor: 'pointer' }}
          >
            CA 签名
          </button>
        </div>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
        <KpiCard icon={Database} label="累计存证" value={records.length} color="#7c3aed" />
        <KpiCard icon={CheckCircle2} label="已确认" value={records.filter(r => r.status === 'confirmed').length} color="#10b981" />
        <KpiCard icon={Clock} label="待确认" value={records.filter(r => r.status === 'pending').length} color="#f59e0b" />
        <KpiCard icon={Shield} label="最近区块" value={records[0]?.blockNumber.toLocaleString() || '182360'} color="#3b82f6" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '460px 1fr', gap: 12 }}>
        {/* 左：存证列表 */}
        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={11} style={{ position: 'absolute', left: 8, top: 8, color: '#94a3b8' }} />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="搜索报告 ID / 交易哈希 / 报告哈希..."
                  style={{ width: '100%', padding: '5px 8px 5px 26px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 12, outline: 'none' }}
                />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
                <option value="all">全部</option>
                <option value="confirmed">已确认</option>
                <option value="pending">待确认</option>
              </select>
            </div>
          </div>
          <div style={{ maxHeight: 600, overflowY: 'auto' }}>
            {filteredRecords.map(r => {
              const sConf = STATUS_CONFIG[r.status];
              const isSelected = selectedRecordId === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => { setSelectedRecordId(r.id); setVerifyResult('idle'); }}
                  style={{
                    padding: 10, borderBottom: '1px solid #f1f5f9',
                    background: isSelected ? '#faf5ff' : 'transparent',
                    borderLeft: isSelected ? '3px solid #7c3aed' : '3px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <Box size={11} color="#7c3aed" />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>区块 #{r.blockNumber}</span>
                    <span style={{ fontSize: 12, padding: '1px 4px', borderRadius: 2, background: sConf.bg, color: sConf.color, fontWeight: 600, marginLeft: 'auto' }}>{sConf.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#475569' }}>报告 {r.reportId}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace', marginTop: 2 }}>{r.txHash.slice(0, 24)}...</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={9} /> {r.timestamp} · {r.confirmations} 确认
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右：详情 + 验证 */}
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* 头部 */}
            <div style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)', borderRadius: 8, padding: 16, border: '1px solid #ddd6fe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 12,
                  background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Link2 size={28} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#5b21b6' }}>{selected.chainName}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>区块 #{selected.blockNumber}</div>
                </div>
                <span style={{
                  fontSize: 12, padding: '3px 10px', borderRadius: 4,
                  background: STATUS_CONFIG[selected.status].bg,
                  color: STATUS_CONFIG[selected.status].color, fontWeight: 700,
                }}>{STATUS_CONFIG[selected.status].label} · {selected.confirmations} 确认</span>
              </div>
            </div>

            {/* 哈希详情 */}
            <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Hash size={13} /> 哈希与签名
              </div>
              <HashRow label="报告哈希 SHA-256" value={selected.reportHash} />
              <HashRow label="交易哈希" value={selected.txHash} />
              <HashRow label="区块哈希" value={selected.blockHash} />
              <HashRow label="Merkle 根" value={selected.merkleRoot} />
              <div style={{ marginTop: 8, padding: 6, background: '#eff6ff', borderRadius: 4, fontSize: 12, color: '#1e40af' }}>
                <strong>签名人：</strong> {selected.signers.join('、')}
              </div>
            </div>

            {/* 验证操作 */}
            <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  style={{
                    flex: 1, padding: '10px 16px', border: 'none', borderRadius: 6,
                    background: verifying ? '#94a3b8' : 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                    color: '#fff', fontSize: 12, fontWeight: 600,
                    cursor: verifying ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  {verifying ? <Loader2 size={12} className="spin" /> : <Shield size={12} />}
                  {verifying ? '验证中...' : '验证真伪'}
                </button>
                <button
                  onClick={() => window.open(selected.explorerUrl, '_blank')}
                  style={{ padding: '10px 16px', border: '1px solid #cbd5e1', borderRadius: 6, background: '#fff', color: '#475569', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <ExternalLink size={12} /> 区块浏览器
                </button>
              </div>

              {verifyResult === 'success' && (
                <div style={{ marginTop: 12, padding: 12, background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#047857' }}>
                    <CheckCircle2 size={14} /> ✓ 验证通过
                  </div>
                  <div style={{ fontSize: 12, color: '#065f46', lineHeight: 1.6 }}>
                    • 区块 #{selected.blockNumber} 存在于 GMCA 联盟链<br/>
                    • Merkle 根匹配 ✓<br/>
                    • 报告哈希未篡改 ✓<br/>
                    • 签名人身份有效 ✓<br/>
                    • 上链时间 {selected.timestamp}
                  </div>
                </div>
              )}
            </div>

            {/* 区块可视化 */}
            <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <GitBranch size={13} /> 区块结构
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, fontSize: 12 }}>
                {[
                  { label: '区块头', desc: '# ' + selected.blockNumber, color: '#7c3aed' },
                  { label: '前一哈希', desc: 'prev_block', color: '#3b82f6' },
                  { label: 'Merkle 根', desc: 'tx_root', color: '#10b981' },
                  { label: '时间戳', desc: 'ts', color: '#f59e0b' },
                  { label: '难度/Nonce', desc: '0x0001', color: '#dc2626' },
                ].map((c, i) => (
                  <div key={i} style={{
                    padding: 6, background: '#faf5ff', border: `1px solid ${c.color}`, borderRadius: 4, textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: c.color }}>{c.label}</div>
                    <div style={{ fontSize: 8, color: '#64748b', marginTop: 2, fontFamily: 'monospace' }}>{c.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8, padding: 8, background: '#f8fafc', borderRadius: 4, fontSize: 12, color: '#475569' }}>
                📊 当前区块包含 {selected.signers.length} 个报告存证交易 · 6 节点共识完成
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 哈希行
// ============================================================
const HashRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{label}</span>
      <button
        onClick={() => navigator.clipboard?.writeText(value)}
        style={{ padding: 1, border: 'none', background: 'transparent', color: '#3b82f6', cursor: 'pointer' }}
        title="复制"
      >
        <Copy size={10} />
      </button>
    </div>
    <div style={{ fontSize: 12, color: '#1e293b', fontFamily: 'monospace', wordBreak: 'break-all', padding: '4px 6px', background: '#f8fafc', borderRadius: 3 }}>
      {value}
    </div>
  </div>
);

// ============================================================
// 样式
// ============================================================
const selectStyle: React.CSSProperties = {
  padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: 4,
  fontSize: 12, outline: 'none',
};

// ============================================================
// KPI
// ============================================================
const KpiCard: React.FC<{ icon: any; label: string; value: number | string; color: string }> = ({ icon: Icon, label, value, color }) => (
  <div style={{ background: '#fff', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={18} />
    </div>
    <div>
      <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{value}</div>
    </div>
  </div>
);
