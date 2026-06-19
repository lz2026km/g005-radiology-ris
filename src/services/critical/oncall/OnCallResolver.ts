/**
 * G005 RIS v3.0.6.6 - 值班解析器
 * 根据当前时间/角色/部门解析出当班医生
 */

import {
  ONCALL_TODAY,
  ONCALL_WEEKLY,
} from '../../../data/oncallMock';
import type {
  OnCallDoctor,
  OnCallRole,
  OnCallShift,
  OnCallSnapshot,
} from '../../../data/oncallMock';

export interface OnCallResolverOptions {
  /** 查询时间(默认 now) */
  at?: Date;
  /** 部门过滤 */
  department?: string;
  /** 同角色多医生时是否首选主班 */
  primaryFirst?: boolean;
}

class OnCallResolverImpl {
  private shifts: OnCallShift[];

  constructor() {
    this.shifts = [...ONCALL_TODAY, ...ONCALL_WEEKLY];
  }

  /** 当前生效的班次 */
  currentShifts(opts: OnCallResolverOptions = {}): OnCallShift[] {
    const at = (opts.at ?? new Date()).getTime();
    const list = this.shifts.filter((s) => {
      const start = new Date(s.start).getTime();
      const end = new Date(s.end).getTime();
      if (at < start || at >= end) return false;
      if (opts.department && s.department !== opts.department) return false;
      return true;
    });
    return list;
  }

  /** 解析某一角色的当班医生 */
  resolve(role: OnCallRole, opts: OnCallResolverOptions = {}): OnCallDoctor | null {
    const shifts = this.currentShifts(opts).filter((s) => s.role === role);
    if (shifts.length === 0) return null;
    const shift = shifts[0]!;
    if (opts.primaryFirst !== false) {
      const primary = shift.doctors.find((d) => d.userId === shift.primary);
      if (primary) return primary;
    }
    return shift.doctors.slice().sort((a, b) => a.priority - b.priority)[0]!;
  }

  /** 解析多个角色 */
  resolveMany(roles: OnCallRole[], opts: OnCallResolverOptions = {}): Partial<Record<OnCallRole, OnCallDoctor>> {
    const out: Partial<Record<OnCallRole, OnCallDoctor>> = {};
    for (const r of roles) {
      const d = this.resolve(r, opts);
      if (d) out[r] = d;
    }
    return out;
  }

  /** 当前整体快照 */
  snapshot(opts: OnCallResolverOptions = {}): OnCallSnapshot {
    const shifts = this.currentShifts(opts);
    const primaryByRole: Partial<Record<OnCallRole, OnCallDoctor>> = {};
    for (const s of shifts) {
      if (primaryByRole[s.role]) continue;
      const primary = s.doctors.find((d) => d.userId === s.primary);
      if (primary) primaryByRole[s.role] = primary;
    }
    return {
      queryTime: (opts.at ?? new Date()).toISOString(),
      shifts,
      primaryByRole,
    };
  }

  /** 给定危急值等级,按升级链解析第一/第二/第三医生 */
  resolveEscalationChain(level: 'critical' | 'urgent' | 'warning' | 'info', opts: OnCallResolverOptions = {}): OnCallDoctor[] {
    const chain: OnCallRole[] = level === 'critical'
      ? ['attending', 'associateChief', 'chief', 'director']
      : level === 'urgent'
        ? ['attending', 'associateChief', 'chief']
        : level === 'warning'
          ? ['attending', 'associateChief']
          : ['attending'];
    const out: OnCallDoctor[] = [];
    for (const r of chain) {
      const d = this.resolve(r, opts);
      if (d) out.push(d);
    }
    return out;
  }

  listShifts(): OnCallShift[] {
    return this.shifts;
  }
}

export const onCallResolver = new OnCallResolverImpl();