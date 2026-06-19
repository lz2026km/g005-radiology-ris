// ============================================================
// G005 放射RIS系统 v3.0.6 - 零信任网络
// ZeroTrust - 持续验证、最小权限、动态信任评分
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import type {
  ZeroTrustContext, ZeroTrustDecision, TrustScore, RiskSignal,
} from '../../../types/security';

const TRUSTED_DEVICES = new Set<string>(['dev-001', 'dev-002', 'dev-003']);
const KNOWN_LOCATIONS = new Set<string>(['上海-浦东', '北京-朝阳', '广州-天河']);
const LOCATION_OF_USER = new Map<string, string>([
  ['u-001', '上海-浦东'],
  ['u-002', '上海-浦东'],
  ['u-009', '上海-浦东'],
]);

function isWeekendOrNight(date: Date): boolean {
  const h = date.getHours();
  return date.getDay() === 0 || date.getDay() === 6 || h < 7 || h >= 22;
}

function calculateTrustScore(ctx: ZeroTrustContext): TrustScore {
  const factors: { name: string; weight: number; contribution: number }[] = [];

  // 1) 用户身份 (权重 20)
  const identityScore = ctx.userId ? 100 : 0;
  factors.push({ name: '身份认证', weight: 0.2, contribution: identityScore * 0.2 });

  // 2) 设备可信度 (权重 25)
  const deviceScore: Record<ZeroTrustContext['deviceTrust'], number> = { trusted: 100, managed: 75, unknown: 40, compromised: 0 };
  factors.push({ name: '设备可信', weight: 0.25, contribution: (deviceScore[ctx.deviceTrust] ?? 0) * 0.25 });

  // 3) 网络位置 (权重 15)
  const networkScore: Record<ZeroTrustContext['networkType'], number> = {
    'hospital-internal': 100, 'vpn': 70, 'partner': 50, 'public': 20,
  };
  factors.push({ name: '网络位置', weight: 0.15, contribution: networkScore[ctx.networkType] * 0.15 });

  // 4) MFA 验证 (权重 15)
  const mfaScore = ctx.mfaCompleted ? 100 : 0;
  factors.push({ name: 'MFA', weight: 0.15, contribution: mfaScore * 0.15 });

  // 5) 行为/时间 (权重 10)
  const behaviorScore = isWeekendOrNight(ctx.timeOfAccess) ? 50 : 90;
  factors.push({ name: '时间/行为', weight: 0.1, contribution: behaviorScore * 0.1 });

  // 6) 风险信号 (权重 15)
  const sevWeight: Record<string, number> = { info: 5, low: 15, medium: 30, high: 60, critical: 100 };
  const riskPenalty = ctx.riskSignals.reduce((sum, s) => sum + sevWeight[s.severity] ?? 0, 0);
  const riskScore = Math.max(0, 100 - riskPenalty);
  factors.push({ name: '风险信号', weight: 0.15, contribution: riskScore * 0.15 });

  const total = Math.round(factors.reduce((s, f) => s + f.contribution, 0));
  const level: TrustScore['level'] = total >= 80 ? 'high' : total >= 60 ? 'medium' : total >= 30 ? 'low' : 'critical';
  return {
    userId: ctx.userId,
    score: total,
    level,
    factors,
    calculatedAt: new Date().toISOString(),
  };
}

export class ZeroTrust {
  /** 验证请求上下文 */
  verifyRequest(ctx: ZeroTrustContext): ZeroTrustDecision {
    const signals: RiskSignal[] = [...ctx.riskSignals];
    let trust = calculateTrustScore(ctx);
    const requiredActions: ZeroTrustDecision['requiredActions'] = [];

    // 规则 1: 设备不可信 -> 要求 MFA
    if (ctx.deviceTrust === 'unknown') {
      requiredActions.push('mfa');
      signals.push({ type: 'new-device', severity: 'medium', description: '未注册设备', detectedAt: new Date().toISOString() });
    } else if (ctx.deviceTrust === 'compromised') {
      requiredActions.push('manager-approval');
      signals.push({ type: 'privilege-escalation', severity: 'critical', description: '设备已被标记为受感染', detectedAt: new Date().toISOString() });
    }

    // 规则 2: 公共网络 -> 必须 MFA
    if (ctx.networkType === 'public' && !ctx.mfaCompleted) {
      requiredActions.push('mfa');
    }

    // 规则 3: 异地登录 (impossible travel) -> MFA + 设备复核
    const knownLoc = LOCATION_OF_USER.get(ctx.userId);
    if (knownLoc && ctx.geoLocation && ctx.geoLocation !== knownLoc) {
      signals.push({ type: 'impossible-travel', severity: 'high', description: `从 ${knownLoc} 到 ${ctx.geoLocation}`, detectedAt: new Date().toISOString() });
      requiredActions.push('mfa');
      requiredActions.push('device-recheck');
    }

    // 规则 4: 高风险信号
    if (signals.some(s => s.severity === 'critical')) {
      requiredActions.push('manager-approval');
    }

    // 重新计算 (基于信号)
    trust = calculateTrustScore({ ...ctx, riskSignals: signals });

    let allow = true;
    let policy: ZeroTrustDecision['sessionPolicy'] = 'standard';
    if (trust.score < 20) { allow = false; policy = 'denied'; }
    else if (trust.score < 40) { allow = requiredActions.length === 0; policy = 'restricted'; }
    else if (trust.score < 70) { policy = 'restricted'; }
    else if (trust.score < 90) { policy = 'standard'; }
    else { policy = 'permissive'; }

    return {
      allow,
      trustScore: trust.score,
      requiredActions: Array.from(new Set(requiredActions)),
      reason: signals.length === 0 ? '正常上下文' : signals.map(s => s.description).join('; '),
      expiresAt: new Date(ctx.timeOfAccess.getTime() + 3600_000).toISOString(),
      sessionPolicy: policy,
    };
  }

  /** 获取用户信任评分 */
  getTrustScore(userId: string): TrustScore {
    const ctx: ZeroTrustContext = {
      userId,
      userName: userId,
      role: 'unknown',
      deviceTrust: 'unknown',
      ipAddress: '0.0.0.0',
      networkType: 'hospital-internal',
      timeOfAccess: new Date(),
      mfaCompleted: false,
      riskSignals: [],
    };
    return calculateTrustScore(ctx);
  }

  /** 注册受信设备 */
  registerTrustedDevice(deviceId: string): void {
    TRUSTED_DEVICES.add(deviceId);
  }

  /** 检测不可能旅行 (异地) */
  detectImpossibleTravel(userId: string, currentLocation: string, lastLoginTime?: string): boolean {
    const last = LOCATION_OF_USER.get(userId);
    if (!last || last === currentLocation) return false;
    // 简单规则:超过 800km/h 的位移视为不可能
    if (lastLoginTime) {
      const elapsedMin = (Date.now() - new Date(lastLoginTime).getTime()) / 60_000;
      const distance = this._estimateDistance(last, currentLocation);
      const speed = distance / Math.max(1, elapsedMin / 60); // km/h
      if (speed > 800) return true;
    }
    LOCATION_OF_USER.set(userId, currentLocation);
    return false;
  }

  _estimateDistance(loc1: string, loc2: string): number {
    // 简化的城市间距离估计
    const cityDistances: Record<string, Record<string, number>> = {
      '上海-浦东': { '北京-朝阳': 1200, '广州-天河': 1450, '上海-浦东': 0 },
      '北京-朝阳': { '上海-浦东': 1200, '广州-天河': 2100, '北京-朝阳': 0 },
      '广州-天河': { '上海-浦东': 1450, '北京-朝阳': 2100, '广州-天河': 0 },
    };
    return cityDistances[loc1]?.[loc2] ?? 1000;
  }

  /** 生成会话 ID */
  newSessionId(): string {
    return uuidv4();
  }
}

export const zeroTrust = new ZeroTrust();