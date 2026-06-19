// ============================================================
// G005 放射RIS系统 v3.0.6 - 密码策略
// PasswordPolicy - 复杂度、强度、历史、锁定
// ============================================================
import type { PasswordPolicy as Policy, PasswordStrengthResult } from '../../../types/security';

const DEFAULT_POLICY: Policy = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireDigits: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  minUniqueChars: 8,
  disallowUsername: true,
  disallowCommonPasswords: true,
  historySize: 5,
  maxAge: 90,
  minAge: 1,
  lockoutThreshold: 5,
  lockoutDurationSeconds: 900,
};

const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123', '12345678', '123456789', '1234567890',
  'qwerty', 'qwerty123', 'admin', 'admin123', 'letmein', 'welcome', 'welcome1',
  'iloveyou', 'sunshine', 'princess', 'dragon', 'monkey', 'shadow',
  'master', 'qwerty12345', '11111111', '00000000', '00000000000',
  'abc123', '654321', 'superman', 'qazwsx', 'michael', 'football',
  'password!', 'p@ssword', 'p@ssw0rd', 'admin@123', 'root', 'toor',
]);

const COMMON_SEQUENCES = ['123456', '654321', 'abcdef', 'qwerty', 'asdfgh', 'zxcvbn'];

function entropy(password: string): number {
  let charset = 0;
  if (/[a-z]/.test(password)) charset += 26;
  if (/[A-Z]/.test(password)) charset += 26;
  if (/[0-9]/.test(password)) charset += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charset += 32;
  return Math.log2(Math.max(2, charset)) * password.length;
}

function hasSequence(password: string): boolean {
  const lower = password.toLowerCase();
  return COMMON_SEQUENCES.some(seq => lower.includes(seq));
}

function hasRepeats(password: string): boolean {
  return /(.)\1{2,}/.test(password);
}

export function evaluatePassword(password: string, opts?: { username?: string; history?: string[] }): PasswordStrengthResult {
  const failed: string[] = [];
  const suggestions: string[] = [];

  if (!password || password.length < DEFAULT_POLICY.minLength) {
    failed.push('minLength');
    suggestions.push(`密码长度至少 ${DEFAULT_POLICY.minLength} 位`);
  }
  if (password.length > DEFAULT_POLICY.maxLength) {
    failed.push('maxLength');
    suggestions.push(`密码长度不能超过 ${DEFAULT_POLICY.maxLength} 位`);
  }
  if (DEFAULT_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    failed.push('requireUppercase');
    suggestions.push('至少包含 1 个大写字母');
  }
  if (DEFAULT_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    failed.push('requireLowercase');
    suggestions.push('至少包含 1 个小写字母');
  }
  if (DEFAULT_POLICY.requireDigits && !/[0-9]/.test(password)) {
    failed.push('requireDigits');
    suggestions.push('至少包含 1 个数字');
  }
  if (DEFAULT_POLICY.requireSpecialChars && !new RegExp(`[${DEFAULT_POLICY.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password)) {
    failed.push('requireSpecialChars');
    suggestions.push('至少包含 1 个特殊字符');
  }
  const unique = new Set(password).size;
  if (unique < DEFAULT_POLICY.minUniqueChars) {
    failed.push('minUniqueChars');
    suggestions.push(`至少 ${DEFAULT_POLICY.minUniqueChars} 个不同字符`);
  }
  if (opts?.username && DEFAULT_POLICY.disallowUsername && password.toLowerCase().includes(opts.username.toLowerCase())) {
    failed.push('disallowUsername');
    suggestions.push('密码不能包含用户名');
  }
  if (DEFAULT_POLICY.disallowCommonPasswords && COMMON_PASSWORDS.has(password.toLowerCase())) {
    failed.push('disallowCommonPasswords');
    suggestions.push('不能使用常见密码');
  }
  if (hasSequence(password)) {
    failed.push('sequence');
    suggestions.push('避免连续字符 (如 12345, qwerty)');
  }
  if (hasRepeats(password)) {
    failed.push('repeats');
    suggestions.push('避免连续重复字符');
  }
  if (opts?.history && opts.history.includes(password)) {
    failed.push('history');
    suggestions.push(`不能与最近 ${DEFAULT_POLICY.historySize} 次密码相同`);
  }

  const ent = entropy(password);
  let score: 0 | 1 | 2 | 3 | 4;
  if (ent < 28) score = 0;
  else if (ent < 48) score = 1;
  else if (ent < 60) score = 2;
  else if (ent < 80) score = 3;
  else score = 4;

  // 失败规则下调分数
  if (failed.length > 0 && score > 1) score = (score - 1) as 0 | 1 | 2 | 3 | 4;

  const strengthMap = ['very-weak', 'weak', 'fair', 'strong', 'very-strong'] as const;
  return {
    score,
    entropy: Math.round(ent),
    strength: strengthMap[score]!,
    suggestions,
    passed: failed.length === 0,
    failedRules: failed,
  };
}

export class PasswordPolicy {
  private policy: Policy;
  private history = new Map<string, string[]>();
  private attempts = new Map<string, { count: number; lastFailedAt?: string; lockedUntil?: string }>();

  constructor(p: Policy = DEFAULT_POLICY) {
    this.policy = p;
  }

  get(): Policy { return { ...this.policy }; }

  update(p: Partial<Policy>): Policy {
    this.policy = { ...this.policy, ...p };
    return this.get();
  }

  /** 评估 */
  evaluate(password: string, opts?: { username?: string; userId?: string }): PasswordStrengthResult {
    const history = opts?.userId ? this.history.get(opts.userId) ?? [] : undefined;
    return evaluatePassword(password, { username: opts?.username, history });
  }

  /** 检查是否可使用 (返回是否通过 + 失败原因) */
  check(password: string, opts?: { username?: string; userId?: string }): { ok: boolean; reasons: string[] } {
    const r = this.evaluate(password, opts);
    return { ok: r.passed, reasons: r.failedRules };
  }

  /** 记录成功使用的密码 (加入历史) */
  recordUse(userId: string, password: string): void {
    const h = this.history.get(userId) ?? [];
    h.push(password);
    while (h.length > this.policy.historySize) h.shift();
    this.history.set(userId, h);
  }

  /** 记录失败尝试 */
  recordFailure(userId: string): { locked: boolean; retryAfter?: number } {
    const entry = this.attempts.get(userId) ?? { count: 0 };
    entry.count++;
    entry.lastFailedAt = new Date().toISOString();
    if (entry.count >= this.policy.lockoutThreshold) {
      entry.lockedUntil = new Date(Date.now() + this.policy.lockoutDurationSeconds * 1000).toISOString();
      this.attempts.set(userId, entry);
      return { locked: true, retryAfter: this.policy.lockoutDurationSeconds };
    }
    this.attempts.set(userId, entry);
    return { locked: false };
  }

  /** 检查是否锁定 */
  isLocked(userId: string): { locked: boolean; retryAfter?: number } {
    const entry = this.attempts.get(userId);
    if (!entry?.lockedUntil) return { locked: false };
    if (new Date(entry.lockedUntil) > new Date()) {
      return { locked: true, retryAfter: Math.ceil((new Date(entry.lockedUntil).getTime() - Date.now()) / 1000) };
    }
    this.attempts.delete(userId);
    return { locked: false };
  }

  /** 重置失败计数 */
  resetFailures(userId: string): void {
    this.attempts.delete(userId);
  }

  /** 是否过期 (基于 maxAge) */
  isExpired(lastChangedAt: string): boolean {
    const last = new Date(lastChangedAt);
    const ageDays = (Date.now() - last.getTime()) / 86400_000;
    return ageDays > this.policy.maxAge;
  }

  /** 距离过期天数 */
  daysUntilExpiry(lastChangedAt: string): number {
    const last = new Date(lastChangedAt);
    const ageDays = (Date.now() - last.getTime()) / 86400_000;
    return Math.max(0, Math.floor(this.policy.maxAge - ageDays));
  }

  /** 生成合规密码 (辅助功能) */
  generateCompliant(length = 16): string {
    const chars = {
      lower: 'abcdefghijkmnpqrstuvwxyz',
      upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
      digit: '23456789',
      special: '!@#$%^&*_+-=',
    };
    const all = chars.lower + chars.upper + chars.digit + chars.special;
    const out: string[] = [];
    // 保证每类至少 2 个
    for (let i = 0; i < 2; i++) out.push(chars.lower[Math.floor(Math.random() * chars.lower.length)]!);
    for (let i = 0; i < 2; i++) out.push(chars.upper[Math.floor(Math.random() * chars.upper.length)]!);
    for (let i = 0; i < 2; i++) out.push(chars.digit[Math.floor(Math.random() * chars.digit.length)]!);
    for (let i = 0; i < 2; i++) out.push(chars.special[Math.floor(Math.random() * chars.special.length)]!);
    while (out.length < length) out.push(all[Math.floor(Math.random() * all.length)]!);
    // 打乱
    return out.sort(() => Math.random() - 0.5).join('');
  }
}

export const passwordPolicy = new PasswordPolicy();