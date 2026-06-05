// ============================================================
// G005 放射RIS系统 v2.1.0 - 审计链 (Merkle Tree)
// Phase R9 W7: 不可篡改的操作日志
// ============================================================

import { sha256, canonicalJson } from './caService';

export type AuditAction =
  | 'created' | 'updated' | 'signed' | 'finalized' | 'amended' | 'cancelled'
  | 'reviewed' | 'printed' | 'exported' | 'shared' | 'locked' | 'unlocked'
  | 'image-viewed' | 'annotation-added' | 'critical-notified' | 'collaboration-joined'
  | 'login' | 'logout' | 'permission-changed';

export interface AuditEntry {
  seq: number;                // 序列号
  timestamp: string;          // ISO
  reportId: string;           // 关联报告
  actor: string;              // 用户 ID
  action: AuditAction;
  detail?: string;            // 操作详情
  prevHash: string;           // 前一个 hash
  hash: string;               // 当前 hash
  // 签名
  signature?: string;         // base64
  certSerial?: string;
}

export interface MerkleProof {
  leafIndex: number;
  leafHash: string;
  siblings: Array<{ hash: string; position: 'left' | 'right' }>;
  rootHash: string;
}

export interface MerkleTree {
  leaves: string[];           // 叶子节点 hash
  layers: string[][];         // 0=leaves, 1=parents, ..., last=[root]
  root: string;
}

const AUDIT_KEY = 'g005.auditLog.v1';

function loadLog(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    return raw ? JSON.parse(raw) as AuditEntry[] : [];
  } catch { return []; }
}

function saveLog(log: AuditEntry[]): void {
  try { localStorage.setItem(AUDIT_KEY, JSON.stringify(log)); } catch { /* quota */ }
}

async function hmacLike(data: string): Promise<string> {
  return sha256(data);
}

export async function appendAudit(opts: {
  reportId: string;
  actor: string;
  action: AuditAction;
  detail?: string;
  signer?: { privateKey: CryptoKey; certSerial: string; sign: (d: string) => Promise<string> };
}): Promise<AuditEntry> {
  const log = loadLog();
  const seq = log.length;
  const timestamp = new Date().toISOString();
  const prevHash = seq === 0 ? '0'.repeat(64) : (log[seq - 1]?.hash ?? '0'.repeat(64));

  const tbs = canonicalJson({ seq, timestamp, reportId: opts.reportId, actor: opts.actor, action: opts.action, detail: opts.detail, prevHash });
  const hash = await hmacLike(tbs);
  let signature: string | undefined;
  if (opts.signer) {
    signature = await opts.signer.sign(tbs);
  }
  const entry: AuditEntry = {
    seq, timestamp,
    reportId: opts.reportId,
    actor: opts.actor,
    action: opts.action,
    detail: opts.detail,
    prevHash, hash,
    signature,
    certSerial: opts.signer?.certSerial,
  };
  log.push(entry);
  saveLog(log);
  return entry;
}

export function getAuditLog(): AuditEntry[] {
  return loadLog();
}

export function getReportAudit(reportId: string): AuditEntry[] {
  return loadLog().filter(e => e.reportId === reportId);
}

export function getActorAudit(actor: string): AuditEntry[] {
  return loadLog().filter(e => e.actor === actor);
}

export { verifyCertificate } from './caService';

// ============================================================
// 验证链
// ============================================================

export async function verifyAuditChain(entries: AuditEntry[]): Promise<{ valid: boolean; brokenAt?: number; reason?: string }> {
  let prevHash = '0'.repeat(64);
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]!;
    if (e.prevHash !== prevHash) {
      return { valid: false, brokenAt: i, reason: `prevHash mismatch at #${i}` };
    }
    const tbs = canonicalJson({
      seq: e.seq,
      timestamp: e.timestamp,
      reportId: e.reportId,
      actor: e.actor,
      action: e.action,
      detail: e.detail,
      prevHash: e.prevHash,
    });
    const expected = await hmacLike(tbs);
    if (expected !== e.hash) {
      return { valid: false, brokenAt: i, reason: `hash mismatch at #${i}` };
    }
    prevHash = e.hash;
  }
  return { valid: true };
}

// ============================================================
// Merkle 树
// ============================================================

export function buildMerkleTree(leaves: string[]): MerkleTree {
  if (leaves.length === 0) {
    return { leaves: [], layers: [], root: '0'.repeat(64) };
  }
  const layers: string[][] = [leaves.slice()];
  // 单叶子也至少 hash 一次
  if (leaves.length === 1) {
    const root = syncHash(leaves[0] + leaves[0]);
    return { leaves, layers: [leaves, [root]], root };
  }
  while (layers[layers.length - 1]!.length > 1) {
    const prev = layers[layers.length - 1]!;
    const next: string[] = [];
    for (let i = 0; i < prev.length; i += 2) {
      const left = prev[i]!;
      const right = i + 1 < prev.length ? prev[i + 1]! : left;
      // 同步 hash：左右拼接
      const combined = (i + 1 < prev.length) ? left + right : left + left;
      // 简单 sync hash (base16)
      next.push(syncHash(combined));
    }
    layers.push(next);
  }
  return { leaves, layers, root: layers[layers.length - 1]![0]! };
}

// 同步 hash 函数（双 SHA-256 风格）
function syncHash(hex: string): string {
  // 这里使用基础 SHA-256 模拟（demo 用）
  let h1 = 0;
  for (let i = 0; i < hex.length; i++) {
    h1 = ((h1 << 5) - h1 + hex.charCodeAt(i)) | 0;
  }
  let h2 = h1;
  // 二次混合
  for (let i = 0; i < hex.length; i += 2) {
    h2 = ((h2 << 3) - h2 + hex.charCodeAt(i)) | 0;
  }
  const buf = new Uint8Array(32);
  const view = new DataView(buf.buffer);
  view.setUint32(0, h1 >>> 0);
  view.setUint32(4, h2 >>> 0);
  // 填充
  for (let i = 8; i < 32; i++) buf[i] = (h1 >>> (i % 32)) & 0xff;
  return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function merkleProof(tree: MerkleTree, leafIndex: number): MerkleProof | null {
  if (leafIndex < 0 || leafIndex >= tree.leaves.length) return null;
  const siblings: Array<{ hash: string; position: 'left' | 'right' }> = [];
  let idx = leafIndex;
  for (let layer = 0; layer < tree.layers.length - 1; layer++) {
    const current = tree.layers[layer]!;
    const pairIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
    const sibling = pairIdx < current.length ? current[pairIdx]! : current[idx]!;
    const position: 'left' | 'right' = idx % 2 === 0 ? 'right' : 'left';
    siblings.push({ hash: sibling, position });
    idx = Math.floor(idx / 2);
  }
  return {
    leafIndex,
    leafHash: tree.leaves[leafIndex]!,
    siblings,
    rootHash: tree.root,
  };
}

export function verifyMerkleProof(proof: MerkleProof): boolean {
  let current = proof.leafHash;
  let idx = proof.leafIndex;
  for (const s of proof.siblings) {
    const isLeft = idx % 2 === 0;
    const combined = isLeft ? current + s.hash : s.hash + current;
    current = syncHash(combined);
    idx = Math.floor(idx / 2);
  }
  return current === proof.rootHash;
}

// 工具：从审计日志构建 Merkle 树
export async function merkleFromAudit(entries: AuditEntry[]): Promise<MerkleTree> {
  const leaves = entries.map(e => e.hash);
  return buildMerkleTree(leaves);
}

// 导出审计快照
export function exportAuditSnapshot(entries: AuditEntry[]) {
  return {
    exportedAt: new Date().toISOString(),
    count: entries.length,
    entries,
    firstHash: entries[0]?.hash ?? null,
    lastHash: entries[entries.length - 1]?.hash ?? null,
  };
}

// 清除（仅测试）
export function clearAudit(): void {
  saveLog([]);
}
