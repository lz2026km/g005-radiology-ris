// ============================================================
// G005 放射RIS系统 v3.0.6 - 审计日志完整性校验
// IntegrityChecker - Merkle Root + 哈希链验证
// ============================================================
import type { AuditLogEntry, IntegrityCheckResult } from '../../../types/security';

async function sha256Hex(s: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const bytes = new TextEncoder().encode(s);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // fallback (简单)
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761) >>> 0;
    h2 = Math.imul(h2 ^ ch, 1597334677) >>> 0;
  }
  return (h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0') + h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0')).padEnd(64, '0').slice(0, 64);
}

async function buildMerkleRoot(leaves: string[]): Promise<string> {
  if (leaves.length === 0) return '0'.repeat(64);
  if (leaves.length === 1) return await sha256Hex(leaves[0]! + leaves[0]!);
  let layer = leaves.slice();
  while (layer.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i]!;
      const right = i + 1 < layer.length ? layer[i + 1]! : left;
      next.push(await sha256Hex(left + right));
    }
    layer = next;
  }
  return layer[0]!;
}

export class IntegrityChecker {
  /** 校验哈希链完整性 */
  async verifyChain(entries: AuditLogEntry[]): Promise<IntegrityCheckResult> {
    let prevHash = '0'.repeat(64);
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i]!;
      if (e.prevHash !== prevHash) {
        return {
          valid: false,
          totalChecked: i,
          totalEntries: entries.length,
          brokenAt: i,
          reason: `prevHash mismatch at #${i}`,
          merkleRoot: await buildMerkleRoot(entries.slice(0, i).map(x => x.hash)),
          verifiedAt: new Date().toISOString(),
        };
      }
      prevHash = e.hash;
    }
    const merkleRoot = await buildMerkleRoot(entries.map(e => e.hash));
    return {
      valid: true,
      totalChecked: entries.length,
      totalEntries: entries.length,
      merkleRoot,
      verifiedAt: new Date().toISOString(),
    };
  }

  /** 计算 Merkle Root (不验证) */
  async computeMerkleRoot(entries: AuditLogEntry[]): Promise<string> {
    return buildMerkleRoot(entries.map(e => e.hash));
  }

  /** 生成审计证明 (Merkle proof) */
  async generateProof(entries: AuditLogEntry[], index: number): Promise<{
    entry: AuditLogEntry;
    siblings: { hash: string; position: 'left' | 'right' }[];
    merkleRoot: string;
    valid: boolean;
  } | null> {
    if (index < 0 || index >= entries.length) return null;
    const entry = entries[index]!;
    const leaves = entries.map(e => e.hash);
    const siblings: { hash: string; position: 'left' | 'right' }[] = [];
    let layer = leaves.slice();
    let idx = index;
    while (layer.length > 1) {
      const pairIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
      const sibling = pairIdx < layer.length ? layer[pairIdx]! : layer[idx]!;
      const position: 'left' | 'right' = idx % 2 === 0 ? 'right' : 'left';
      siblings.push({ hash: sibling, position });
      const next: string[] = [];
      for (let i = 0; i < layer.length; i += 2) {
        const left = layer[i]!;
        const right = i + 1 < layer.length ? layer[i + 1]! : left;
        next.push(await sha256Hex(left + right));
      }
      layer = next;
      idx = Math.floor(idx / 2);
    }
    const merkleRoot = layer[0]!;
    return { entry, siblings, merkleRoot, valid: true };
  }

  /** 验证 Merkle proof */
  async verifyProof(entry: AuditLogEntry, siblings: { hash: string; position: 'left' | 'right' }[], merkleRoot: string, index: number): Promise<boolean> {
    let current = entry.hash;
    let idx = index;
    for (const s of siblings) {
      const combined = s.position === 'left' ? s.hash + current : current + s.hash;
      current = await sha256Hex(combined);
      idx = Math.floor(idx / 2);
    }
    return current === merkleRoot;
  }

  /** 检测篡改点 */
  async detectTampering(entries: AuditLogEntry[]): Promise<{
    tampered: { index: number; reason: string }[];
    missing: number[];
    duplicates: number[];
  }> {
    const tampered: { index: number; reason: string }[] = [];
    const seen = new Set<number>();
    const duplicates: number[] = [];
    let prevHash = '0'.repeat(64);
    const missing: number[] = [];

    for (let i = 0; i < entries.length; i++) {
      const e = entries[i]!;
      if (seen.has(e.seq)) duplicates.push(i);
      seen.add(e.seq);
      if (e.seq !== i) missing.push(i);
      if (e.prevHash !== prevHash) tampered.push({ index: i, reason: 'prevHash mismatch' });
      prevHash = e.hash;
    }

    return { tampered, missing, duplicates };
  }
}

export const integrityChecker = new IntegrityChecker();