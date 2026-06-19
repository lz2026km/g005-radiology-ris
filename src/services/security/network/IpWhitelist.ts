// ============================================================
// G005 放射RIS系统 v3.0.6 - IP 白名单
// IpWhitelist - CIDR 校验、过期管理
// ============================================================
import type { IpWhitelistEntry, IpCheckResult } from '../../../types/security';

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const oct = parseInt(p, 10);
    if (isNaN(oct) || oct < 0 || oct > 255) return null;
    n = (n << 8) + oct;
  }
  return n >>> 0;
}

export function ipToInt(ip: string): number | null { return ipv4ToInt(ip); }

export function isInCidr(ip: string, cidr: string): boolean {
  const [base, maskStr] = cidr.split('/');
  if (!base || !maskStr) return false;
  const mask = parseInt(maskStr, 10);
  if (isNaN(mask) || mask < 0 || mask > 32) return false;
  const ipNum = ipv4ToInt(ip);
  const baseNum = ipv4ToInt(base);
  if (ipNum === null || baseNum === null) return false;
  if (mask === 0) return true;
  const maskBits = (~((1 << (32 - mask)) - 1)) >>> 0;
  return (ipNum & maskBits) === (baseNum & maskBits);
}

export class IpWhitelist {
  private entries: IpWhitelistEntry[];

  constructor(initial: IpWhitelistEntry[] = []) {
    this.entries = [...initial];
  }

  /** 添加条目 */
  add(entry: IpWhitelistEntry): void {
    this.entries.push(entry);
  }

  /** 移除条目 */
  remove(id: string): boolean {
    const before = this.entries.length;
    this.entries = this.entries.filter(e => e.id !== id);
    return this.entries.length < before;
  }

  /** 启用/禁用 */
  setEnabled(id: string, enabled: boolean): boolean {
    const entry = this.entries.find(e => e.id === id);
    if (!entry) return false;
    entry.enabled = enabled;
    return true;
  }

  /** 检查 IP 是否允许 */
  check(ip: string, scope: IpWhitelistEntry['scope'][number] = 'all'): IpCheckResult {
    const now = new Date();
    const expired = this.entries.filter(e => e.enabled && e.expiresAt && new Date(e.expiresAt) < now);
    const valid = this.entries.filter(e =>
      e.enabled
      && (e.scope.includes('all') || e.scope.includes(scope))
      && (!e.expiresAt || new Date(e.expiresAt) >= now)
    );

    for (const entry of valid) {
      if (isInCidr(ip, entry.cidr)) {
        return {
          allowed: true,
          matchedEntry: entry,
          ip,
          reason: `匹配白名单 ${entry.cidr} (${entry.label})`,
          checkedAt: now.toISOString(),
        };
      }
    }

    return {
      allowed: false,
      ip,
      reason: expired.length > 0
        ? `IP 不在白名单中 (${expired.length} 条规则已过期)`
        : `IP ${ip} 不在白名单 ${scope} 范围内`,
      checkedAt: now.toISOString(),
    };
  }

  /** 列出所有条目 */
  list(): IpWhitelistEntry[] {
    return [...this.entries];
  }

  /** 列出过期条目 */
  listExpired(): IpWhitelistEntry[] {
    const now = new Date();
    return this.entries.filter(e => e.expiresAt && new Date(e.expiresAt) < now);
  }

  /** 即将过期 (N 天内) */
  listExpiringSoon(days = 30): IpWhitelistEntry[] {
    const now = new Date();
    const horizon = new Date(now.getTime() + days * 86400_000);
    return this.entries.filter(e => e.expiresAt && new Date(e.expiresAt) >= now && new Date(e.expiresAt) <= horizon);
  }
}