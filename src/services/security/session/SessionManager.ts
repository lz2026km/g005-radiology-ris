// ============================================================
// G005 放射RIS系统 v3.0.6 - 会话管理
// SessionManager - 多设备、并发控制、超时、风险评分
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import type { UserSession, SessionPolicy, SessionStatus } from '../../../types/security';

const SESSIONS_KEY = 'g005.security.sessions.v1';
const POLICY_KEY = 'g005.security.sessionPolicy.v1';

const DEFAULT_POLICY: SessionPolicy = {
  maxConcurrentSessions: 3,
  idleTimeoutSeconds: 30 * 60,           // 30 分钟空闲
  absoluteTimeoutSeconds: 8 * 3600,      // 8 小时绝对
  requireMfaForSensitive: true,
  bindToDevice: false,
};

let sessions: UserSession[] = [];
let policy: SessionPolicy = DEFAULT_POLICY;

function load(): void {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) sessions = JSON.parse(raw) as UserSession[];
  } catch { /* ignore */ }
  try {
    const pRaw = localStorage.getItem(POLICY_KEY);
    if (pRaw) policy = JSON.parse(pRaw) as SessionPolicy;
  } catch { /* ignore */ }
}
function saveSessions(): void {
  try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)); } catch { /* ignore */ }
}
function savePolicy(): void {
  try { localStorage.setItem(POLICY_KEY, JSON.stringify(policy)); } catch { /* ignore */ }
}
load();

function nowIso(): string { return new Date().toISOString(); }

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

function calcRiskScore(s: UserSession): number {
  let score = 5;
  if (!s.mfaVerified) score += 30;
  if (s.ipAddress.startsWith('10.') || s.ipAddress.startsWith('192.168.')) score -= 2;
  else score += 20;
  if (s.userAgent.includes('curl') || s.userAgent.includes('bot')) score += 50;
  return Math.max(0, Math.min(100, score));
}

export class SessionManager {
  /** 创建新会话 */
  create(opts: {
    userId: string; userName: string; role: string; department: string;
    ipAddress: string; userAgent: string; mfaVerified: boolean;
  }): { session: UserSession; evicted: UserSession[] } {
    // 检查并发限制
    const userSessions = sessions.filter(s => s.userId === opts.userId && s.status === 'active');
    const evicted: UserSession[] = [];
    while (userSessions.length >= policy.maxConcurrentSessions) {
      const oldest = userSessions.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
      if (!oldest) break;
      oldest.status = 'concurrent';
      evicted.push(oldest);
      userSessions.splice(userSessions.indexOf(oldest), 1);
    }

    const deviceFingerprint = simpleHash(opts.ipAddress + opts.userAgent);
    const session: UserSession = {
      sessionId: uuidv4(),
      userId: opts.userId,
      userName: opts.userName,
      role: opts.role,
      department: opts.department,
      ipAddress: opts.ipAddress,
      userAgent: opts.userAgent,
      deviceFingerprint,
      createdAt: nowIso(),
      lastActivity: nowIso(),
      expiresAt: new Date(Date.now() + policy.absoluteTimeoutSeconds * 1000).toISOString(),
      status: 'active',
      mfaVerified: opts.mfaVerified,
      riskScore: 5,
    };
    session.riskScore = calcRiskScore(session);
    sessions.push(session);
    saveSessions();
    return { session, evicted };
  }

  /** 触摸会话 (更新活动时间) */
  touch(sessionId: string): UserSession | null {
    const s = sessions.find(x => x.sessionId === sessionId);
    if (!s || s.status !== 'active') return null;
    const now = new Date();
    const lastActivity = new Date(s.lastActivity);
    if ((now.getTime() - lastActivity.getTime()) / 1000 > policy.idleTimeoutSeconds) {
      s.status = 'idle';
      saveSessions();
      return null;
    }
    if (new Date(s.expiresAt) < now) {
      s.status = 'expired';
      saveSessions();
      return null;
    }
    s.lastActivity = nowIso();
    saveSessions();
    return s;
  }

  /** 验证会话有效 */
  validate(sessionId: string): { valid: boolean; reason?: string; session?: UserSession } {
    const s = sessions.find(x => x.sessionId === sessionId);
    if (!s) return { valid: false, reason: 'session_not_found' };
    if (s.status !== 'active') return { valid: false, reason: `status_${s.status}`, session: s };
    if (new Date(s.expiresAt) < new Date()) {
      s.status = 'expired';
      saveSessions();
      return { valid: false, reason: 'expired', session: s };
    }
    return { valid: true, session: s };
  }

  /** 撤销单个会话 */
  revoke(sessionId: string, reason = 'manual'): boolean {
    const s = sessions.find(x => x.sessionId === sessionId);
    if (!s) return false;
    s.status = 'revoked';
    saveSessions();
    return true;
  }

  /** 撤销用户的所有会话 */
  revokeAllForUser(userId: string, except?: string): number {
    let count = 0;
    for (const s of sessions) {
      if (s.userId === userId && s.sessionId !== except && s.status === 'active') {
        s.status = 'revoked';
        count++;
      }
    }
    saveSessions();
    return count;
  }

  /** 列出用户的活跃会话 */
  listActive(userId?: string): UserSession[] {
    return sessions.filter(s => s.status === 'active' && (!userId || s.userId === userId));
  }

  /** 列出所有会话 */
  list(userId?: string): UserSession[] {
    return sessions.filter(s => !userId || s.userId === userId);
  }

  /** 清理过期会话 */
  cleanup(): number {
    const before = sessions.length;
    sessions = sessions.filter(s => {
      if (s.status === 'revoked' || s.status === 'expired') return false;
      if (new Date(s.expiresAt) < new Date()) return false;
      return true;
    });
    saveSessions();
    return before - sessions.length;
  }

  /** 获取当前策略 */
  getPolicy(): SessionPolicy {
    return { ...policy };
  }

  /** 更新策略 */
  updatePolicy(p: Partial<SessionPolicy>): SessionPolicy {
    policy = { ...policy, ...p };
    savePolicy();
    return { ...policy };
  }

  /** 统计 */
  stats(): { total: number; active: number; idle: number; expired: number; revoked: number; concurrent: number; byStatus: Record<SessionStatus, number> } {
    const byStatus: Record<SessionStatus, number> = { active: 0, idle: 0, expired: 0, revoked: 0, concurrent: 0 };
    for (const s of sessions) byStatus[s.status]++;
    return {
      total: sessions.length,
      active: byStatus.active,
      idle: byStatus.idle,
      expired: byStatus.expired,
      revoked: byStatus.revoked,
      concurrent: byStatus.concurrent,
      byStatus,
    };
  }
}

export const sessionManager = new SessionManager();