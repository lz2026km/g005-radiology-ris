// ============================================================
// G005 放射RIS系统 v3.0.6 - 密钥轮换调度器
// KeyRotation - 自动/手动轮换、版本管理、保留期
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import type {
  KeyVersion, KeyRotationPolicy, KeyRotationEvent, HsmKeyAlgorithm,
} from '../../../types/security';

const STORAGE_KEY = 'g005.security.keyrotation.v1';
const POLICY_KEY = 'g005.security.keypolicy.v1';
const DEFAULT_POLICY: KeyRotationPolicy = {
  algorithm: 'AES-256',
  rotationIntervalDays: 90,
  retentionPeriodDays: 365,
  autoRotate: true,
  notifyBeforeDays: 7,
};

let versions: KeyVersion[] = [];
let events: KeyRotationEvent[] = [];
let policy: KeyRotationPolicy = DEFAULT_POLICY;

function load(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { versions: KeyVersion[]; events: KeyRotationEvent[] };
      versions = parsed.versions;
      events = parsed.events;
    }
  } catch { /* ignore */ }
  try {
    const pRaw = localStorage.getItem(POLICY_KEY);
    if (pRaw) policy = JSON.parse(pRaw) as KeyRotationPolicy;
  } catch { /* ignore */ }
}
function save(): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ versions, events })); } catch { /* ignore */ }
}
function savePolicy(): void {
  try { localStorage.setItem(POLICY_KEY, JSON.stringify(policy)); } catch { /* ignore */ }
}
load();

export class KeyRotation {
  /** 注册密钥 */
  registerKey(opts: { keyId: string; algorithm: HsmKeyAlgorithm; fingerprint?: string }): KeyVersion {
    const existing = versions.filter(v => v.keyId === opts.keyId);
    const v: KeyVersion = {
      keyId: opts.keyId,
      version: existing.length + 1,
      algorithm: opts.algorithm,
      createdAt: new Date().toISOString(),
      status: existing.length === 0 ? 'active' : 'pending',
      ...(opts.fingerprint ? { fingerprint: opts.fingerprint } : { fingerprint: uuidv4().replace(/-/g, '').slice(0, 32) }),
      useCount: 0,
    };
    if (existing.length === 0) v.activatedAt = v.createdAt;
    versions.push(v);
    save();
    return v;
  }

  /** 轮换密钥 */
  rotate(opts: { keyId: string; triggeredBy: 'schedule' | 'manual' | 'incident'; reason?: string }): { event: KeyRotationEvent; newVersion: KeyVersion } {
    const keyVersions = versions.filter(v => v.keyId === opts.keyId);
    if (keyVersions.length === 0) throw new Error(`Key ${opts.keyId} not registered`);
    const currentActive = keyVersions.find(v => v.status === 'active');
    if (currentActive) {
      currentActive.status = 'retired';
      currentActive.retiredAt = new Date().toISOString();
    }
    const newV: KeyVersion = {
      keyId: opts.keyId,
      version: keyVersions.length + 1,
      algorithm: keyVersions[0]!.algorithm,
      createdAt: new Date().toISOString(),
      activatedAt: new Date().toISOString(),
      status: 'active',
      fingerprint: uuidv4().replace(/-/g, '').slice(0, 32),
      useCount: 0,
    };
    versions.push(newV);
    const event: KeyRotationEvent = {
      id: uuidv4(),
      keyId: opts.keyId,
      fromVersion: currentActive?.version ?? 0,
      toVersion: newV.version,
      triggeredBy: opts.triggeredBy,
      triggeredAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      status: 'completed',
      reason: opts.reason ?? 'manual rotation',
    };
    events.push(event);
    save();
    return { event, newVersion: newV };
  }

  /** 获取密钥的所有版本 */
  getVersions(keyId: string): KeyVersion[] {
    return versions.filter(v => v.keyId === keyId);
  }

  /** 获取当前活跃版本 */
  getActive(keyId: string): KeyVersion | null {
    return versions.find(v => v.keyId === keyId && v.status === 'active') ?? null;
  }

  /** 获取即将过期的密钥 (N 天内) */
  getExpiringSoon(days = policy.notifyBeforeDays): { keyId: string; version: number; daysLeft: number }[] {
    const now = Date.now();
    const horizon = now + days * 86400_000;
    return versions
      .filter(v => v.status === 'active' && v.activatedAt)
      .map(v => {
        const ageDays = (now - new Date(v.activatedAt!).getTime()) / 86400_000;
        const daysLeft = policy.rotationIntervalDays - ageDays;
        return { keyId: v.keyId, version: v.version, daysLeft };
      })
      .filter(x => x.daysLeft <= days && x.daysLeft > 0);
  }

  /** 获取已过期需要轮换的密钥 */
  getOverdue(): { keyId: string; version: number; daysOverdue: number }[] {
    const now = Date.now();
    return versions
      .filter(v => v.status === 'active' && v.activatedAt)
      .map(v => {
        const ageDays = (now - new Date(v.activatedAt!).getTime()) / 86400_000;
        const daysOverdue = ageDays - policy.rotationIntervalDays;
        return { keyId: v.keyId, version: v.version, daysOverdue };
      })
      .filter(x => x.daysOverdue > 0);
  }

  /** 自动轮换到期密钥 */
  autoRotate(): KeyRotationEvent[] {
    const overdue = this.getOverdue();
    const events: KeyRotationEvent[] = [];
    for (const o of overdue) {
      const { event } = this.rotate({ keyId: o.keyId, triggeredBy: 'schedule', reason: `超过 ${policy.rotationIntervalDays} 天未轮换` });
      events.push(event);
    }
    return events;
  }

  /** 标记密钥泄露 */
  markCompromised(keyId: string): void {
    const keyVersions = versions.filter(v => v.keyId === keyId);
    for (const v of keyVersions) v.status = 'compromised';
    const e: KeyRotationEvent = {
      id: uuidv4(),
      keyId,
      fromVersion: keyVersions[keyVersions.length - 1]?.version ?? 0,
      toVersion: keyVersions.length + 1,
      triggeredBy: 'incident',
      triggeredAt: new Date().toISOString(),
      status: 'completed',
      reason: 'key compromised',
    };
    events.push(e);
    save();
    // 自动轮换
    this.rotate({ keyId, triggeredBy: 'incident', reason: 'compromise response' });
  }

  /** 清理超过保留期的版本 */
  cleanup(): number {
    const cutoff = Date.now() - policy.retentionPeriodDays * 86400_000;
    const before = versions.length;
    versions = versions.filter(v => {
      if (v.status !== 'retired' && v.status !== 'compromised') return true;
      const refTime = v.retiredAt ?? v.createdAt;
      return new Date(refTime).getTime() > cutoff;
    });
    save();
    return before - versions.length;
  }

  /** 增加密钥使用次数 */
  incrementUse(keyId: string): void {
    const v = this.getActive(keyId);
    if (v) {
      v.useCount++;
      save();
    }
  }

  /** 列出所有事件 */
  listEvents(keyId?: string): KeyRotationEvent[] {
    return keyId ? events.filter(e => e.keyId === keyId) : [...events];
  }

  /** 列出所有密钥 */
  listKeys(): { keyId: string; algorithm: HsmKeyAlgorithm; activeVersion: number; status: string; lastRotatedAt?: string }[] {
    const map = new Map<string, { versions: KeyVersion[] }>();
    for (const v of versions) {
      const entry = map.get(v.keyId) ?? { versions: [] };
      entry.versions.push(v);
      map.set(v.keyId, entry);
    }
    return Array.from(map.entries()).map(([keyId, entry]) => {
      const active = entry.versions.find(v => v.status === 'active');
      return {
        keyId,
        algorithm: active?.algorithm ?? entry.versions[0]?.algorithm ?? 'AES-256',
        activeVersion: active?.version ?? 0,
        status: active?.status ?? 'pending',
        ...(active?.activatedAt ? { lastRotatedAt: active.activatedAt } : {}),
      };
    });
  }

  /** 策略 */
  getPolicy(): KeyRotationPolicy { return { ...policy }; }

  updatePolicy(p: Partial<KeyRotationPolicy>): KeyRotationPolicy {
    policy = { ...policy, ...p };
    savePolicy();
    return { ...policy };
  }
}

export const keyRotation = new KeyRotation();